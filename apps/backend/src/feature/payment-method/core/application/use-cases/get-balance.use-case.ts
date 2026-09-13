import { Inject, Injectable } from '@nestjs/common';
import { FamilyService } from '../../../../family/core/application/services/family.service';
import {
  IPaymentMethodRepository,
  BalanceSummaryItem,
} from '../../domain/repositories/payment-method.repository.interface';
import { type ITransactionRepository } from '~feature/transaction/core/domain/repositories/transaction.repository.interface';
import { Decimal } from 'prisma/generated/prisma/internal/prismaNamespace';

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
    @Inject('TransactionRepository')
    private readonly transactionRepository: ITransactionRepository,
    private readonly familyService: FamilyService,
  ) {}

  async execute(userId: string): Promise<BalanceResult> {
    const [balanceSummary, personalBalance, families] = await Promise.all([
      this.paymentMethodRepository.getBalanceSummary(userId),
      this.transactionRepository.getPersonalBalance(userId),
      this.getFamilyBalances(userId),
    ]);

    const paymentMethods = balanceSummary.map((item: BalanceSummaryItem) => ({
      id: item.id,
      name: item.name,
      type: item.type as string,
      color: item.color,
      currentBalance: item.currentBalance,
    }));

    const totalBalance = paymentMethods.reduce(
      (sum, pm) => sum.plus(pm.currentBalance),
      new Decimal(0),
    );

    return {
      totalBalance,
      personalBalance,
      paymentMethods,
      families,
    };
  }

  private async getFamilyBalances(
    userId: string,
  ): Promise<BalanceResult['families']> {
    const [families, memberships] = await Promise.all([
      this.familyService.findByUserId(userId),
      this.familyService.findMembershipsOfUser(userId),
    ]);

    const contributions = new Map(
      memberships.map((member) => [member.familyId, member.balance]),
    );

    return families.map((family) => ({
      familyId: family.id,
      familyName: family.name,
      totalBalance: family.balance,
      userContribution: contributions.get(family.id) ?? new Decimal(0),
    }));
  }
}
