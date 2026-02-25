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

export interface BalanceResult {
  totalBalance: number;
  personalBalance: number;
  paymentMethods: {
    id: string;
    name: string;
    type: string;
    color: string;
    currentBalance: number;
  }[];
  families: {
    familyId: string;
    familyName: string;
    totalBalance: number;
    userContribution: number;
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
      currentBalance: Number(item.currentBalance),
    }));

    const totalBalance = paymentMethods.reduce(
      (sum, pm) => sum + pm.currentBalance,
      0,
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

  private async calculatePersonalBalance(userId: string): Promise<number> {
    const [incomeResult, expenseResult] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: {
          userId,
          scope: TransactionScope.PERSONAL,
          status: PrismaTransactionStatus.CONFIRMED,
          type: PrismaTransactionType.INCOME,
        },
        _sum: { value: true },
      }),
      this.prisma.transaction.aggregate({
        where: {
          userId,
          scope: TransactionScope.PERSONAL,
          status: PrismaTransactionStatus.CONFIRMED,
          type: PrismaTransactionType.EXPENSE,
        },
        _sum: { value: true },
      }),
    ]);

    const totalIncome = incomeResult._sum.value?.toNumber() || 0;
    const totalExpense = expenseResult._sum.value?.toNumber() || 0;

    return totalIncome - totalExpense;
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
          userContribution: member?.balance ?? 0,
        };
      }),
    );

    return results;
  }
}
