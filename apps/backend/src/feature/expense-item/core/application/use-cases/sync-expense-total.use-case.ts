import { Injectable, Inject } from '@nestjs/common';
import { Decimal } from 'prisma/generated/prisma/internal/prismaNamespace';
import { DomainNotFoundException } from '~common/exceptions/domain.exceptions';
import { PrismaService } from '~common/prisma/prisma.service';
import { type ITransactionRepository } from '~feature/transaction/core/domain/repositories/transaction.repository.interface';
import { Transaction } from '~feature/transaction/core/domain/entities/transaction.entity';
import { FamilyBalanceService } from '~feature/family/core/application/services/family-balance.service';
import { PaymentMethodService } from '~feature/payment-method/core/application/services/payment-method.service';
import { type IExpenseItemRepository } from '../../domain/repositories/expense-item.repository.interface';

@Injectable()
export class SyncExpenseTotalUseCase {
  constructor(
    @Inject('ExpenseItemRepository')
    private readonly expenseItemRepository: IExpenseItemRepository,
    @Inject('TransactionRepository')
    private readonly transactionRepository: ITransactionRepository,
    private readonly familyBalanceService: FamilyBalanceService,
    private readonly paymentMethodService: PaymentMethodService,
    private readonly prisma: PrismaService,
  ) {}

  async execute(expenseId: string): Promise<Decimal> {
    const transaction =
      await this.expenseItemRepository.findExpenseTransaction(expenseId);

    if (!transaction) {
      throw new DomainNotFoundException('Expense not found');
    }

    const total =
      await this.expenseItemRepository.calculateExpenseTotal(expenseId);

    if (total.equals(transaction.value)) {
      return total;
    }

    await this.prisma.runInTransaction(async () => {
      await this.transactionRepository.update(transaction.id, {
        value: total,
      } as Partial<Transaction>);

      if (transaction.familyId) {
        await this.familyBalanceService.recalculateBalances(
          transaction.familyId,
        );
      }

      if (transaction.paymentMethodId) {
        await this.paymentMethodService.recalculateBalance(
          transaction.paymentMethodId,
        );
      }
    });

    return total;
  }
}
