import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../common/prisma/prisma.service';
import { FamilyService } from '../../../../family/core/application/services/family.service';
import {
  IPaymentMethodRepository,
  BalanceSummaryItem,
} from '../../domain/repositories/payment-method.repository.interface';
import {
  TransactionType as PrismaTransactionType,
  TransactionScope,
  TransactionStatus as PrismaTransactionStatus,
} from 'prisma/generated/prisma/client';
import { Decimal } from 'prisma/generated/prisma/internal/prismaNamespace';
import { TransactionAmountNormalizer } from '~feature/transaction/core/domain/services/transaction-amount.normalizer';

export interface BalanceResult {
  totalBalance: Decimal;
  personalBalance: Decimal;
  paymentMethods: {
    id: string;
    name: string;
    type: string;
    color: string;
    currentBalance: Decimal;
  }[];
  families: {
    familyId: string;
    familyName: string;
    totalBalance: Decimal;
    userContribution: Decimal;
  }[];
}

@Injectable()
export class GetBalanceUseCase {
  constructor(
    @Inject('PaymentMethodRepository')
    private readonly paymentMethodRepository: IPaymentMethodRepository,
    private readonly prisma: PrismaService,
    private readonly familyService: FamilyService,
  ) {}

  async execute(userId: string): Promise<BalanceResult> {
    const [balanceSummary, personalBalance, families] = await Promise.all([
      this.paymentMethodRepository.getBalanceSummary(userId),
      this.calculatePersonalBalance(userId),
      this.getFamilyBalances(userId),
    ]);

    const paymentMethods = balanceSummary.map((item: BalanceSummaryItem) => ({
      id: item.id,
      name: item.name,
      type: '',
      color: item.color,
      currentBalance: item.currentBalance,
    }));

    const totalBalance = paymentMethods.reduce(
      (sum, pm) => sum.plus(pm.currentBalance),
      new Decimal(0),
    );

    // Enrich payment methods with type from full entity list
    const allPaymentMethods =
      await this.paymentMethodRepository.findAllByUserId(userId);
    const typeMap = new Map(allPaymentMethods.map((pm) => [pm.id, pm.type]));
    for (const pm of paymentMethods) {
      pm.type = typeMap.get(pm.id) || '';
    }

    return {
      totalBalance,
      personalBalance,
      paymentMethods,
      families,
    };
  }

  private async calculatePersonalBalance(userId: string): Promise<Decimal> {
    const [incomeResult, expenseResult] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: {
          userId,
          deletedAt: null,
          scope: TransactionScope.PERSONAL,
          status: PrismaTransactionStatus.CONFIRMED,
          type: PrismaTransactionType.INCOME,
        },
        _sum: { [TransactionAmountNormalizer.sumField]: true },
      }),
      this.prisma.transaction.aggregate({
        where: {
          userId,
          deletedAt: null,
          scope: TransactionScope.PERSONAL,
          status: PrismaTransactionStatus.CONFIRMED,
          type: PrismaTransactionType.EXPENSE,
        },
        _sum: { [TransactionAmountNormalizer.sumField]: true },
      }),
    ]);

    const totalIncome = TransactionAmountNormalizer.normalizeSum(
      incomeResult._sum.value,
    );
    const totalExpense = TransactionAmountNormalizer.normalizeSum(
      expenseResult._sum.value,
    );

    return totalIncome.minus(totalExpense);
  }

  private async getFamilyBalances(
    userId: string,
  ): Promise<BalanceResult['families']> {
    const families = await this.familyService.findByUserId(userId);

    const results = await Promise.all(
      families.map(async (family) => {
        const member = await this.familyService.findMember(family.id, userId);

        return {
          familyId: family.id,
          familyName: family.name,
          totalBalance: family.balance,
          userContribution: member?.balance ?? new Decimal(0),
        };
      }),
    );

    return results;
  }
}
