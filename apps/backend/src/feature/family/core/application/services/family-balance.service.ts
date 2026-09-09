import { Injectable, Inject, Logger } from '@nestjs/common';
import { Decimal } from 'prisma/generated/prisma/internal/prismaNamespace';
import {
  IFamilyRepository,
  FamilyBalanceSnapshot,
} from '../../domain/repositories/family.repository.interface';
import { Transaction } from '../../../../transaction/core/domain/entities/transaction.entity';
import { TransactionAmountNormalizer } from '../../../../transaction/core/domain/services/transaction-amount.normalizer';
import {
  BalanceDrift,
  FamilyBalanceReconciliation,
} from '../dto/family-balance-reconciliation.dto';

@Injectable()
export class FamilyBalanceService {
  private readonly logger = new Logger(FamilyBalanceService.name);

  constructor(
    @Inject('FamilyRepository')
    private readonly familyRepository: IFamilyRepository,
  ) {}

  async updateBalancesAfterTransaction(
    familyId: string,
    userId: string,
    transaction: Transaction,
  ): Promise<void> {
    await this.familyRepository.incrementBalances(
      familyId,
      userId,
      TransactionAmountNormalizer.signedDelta(transaction),
    );
  }

  async reverseBalancesAfterTransaction(
    familyId: string,
    userId: string,
    transaction: Transaction,
  ): Promise<void> {
    await this.familyRepository.incrementBalances(
      familyId,
      userId,
      TransactionAmountNormalizer.signedDelta(transaction).negated(),
    );
  }

  async recalculateBalances(familyId: string): Promise<FamilyBalanceSnapshot> {
    return this.familyRepository.recalculateBalances(familyId);
  }

  async inspect(familyId: string): Promise<FamilyBalanceReconciliation> {
    const [cached, computed] = await Promise.all([
      this.familyRepository.readBalances(familyId),
      this.familyRepository.computeBalances(familyId),
    ]);

    return this.compare(familyId, cached, computed);
  }

  async reconcile(familyId: string): Promise<FamilyBalanceReconciliation> {
    const report = await this.inspect(familyId);

    if (report.isBalanced) {
      return report;
    }

    this.logger.warn(
      `Repairing balance drift for family ${familyId}: family ${report.family.drift.toString()}, ${report.members.filter((m) => !m.drift.isZero()).length} member(s)`,
    );

    await this.familyRepository.recalculateBalances(familyId);

    return { ...report, repaired: true };
  }

  async reconcileAll(): Promise<FamilyBalanceReconciliation[]> {
    const familyIds = await this.familyRepository.findAllIds();
    const reports: FamilyBalanceReconciliation[] = [];

    for (const familyId of familyIds) {
      reports.push(await this.reconcile(familyId));
    }

    return reports;
  }

  private compare(
    familyId: string,
    cached: FamilyBalanceSnapshot,
    computed: FamilyBalanceSnapshot,
  ): FamilyBalanceReconciliation {
    const family: BalanceDrift = {
      cached: cached.balance,
      computed: computed.balance,
      drift: cached.balance.minus(computed.balance),
    };

    const userIds = new Set([
      ...cached.memberBalances.keys(),
      ...computed.memberBalances.keys(),
    ]);

    const members = Array.from(userIds).map((userId) => {
      const cachedBalance =
        cached.memberBalances.get(userId) ?? new Decimal(0);
      const computedBalance =
        computed.memberBalances.get(userId) ?? new Decimal(0);

      return {
        userId,
        cached: cachedBalance,
        computed: computedBalance,
        drift: cachedBalance.minus(computedBalance),
      };
    });

    const isBalanced =
      family.drift.isZero() && members.every((member) => member.drift.isZero());

    return { familyId, family, members, isBalanced, repaired: false };
  }
}
