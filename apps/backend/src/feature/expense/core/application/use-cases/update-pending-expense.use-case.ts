import { Injectable, Inject } from '@nestjs/common';
import { type IExpenseRepository } from '../../domain/repositories/expense.repository.interface';
import { type ITransactionRepository } from '../../../../transaction/core/domain/repositories/transaction.repository.interface';
import { Transaction } from '../../../../transaction/core/domain/entities/transaction.entity';
import { Expense } from '../../domain/entities/expense.entity';
import { UpdatePendingExpenseDto } from '../dto/update-pending-expense.dto';
import {
  DomainNotFoundException,
  DomainForbiddenException,
  DomainValidationException,
} from '~common/exceptions/domain.exceptions';

@Injectable()
export class UpdatePendingExpenseUseCase {
  constructor(
    @Inject('ExpenseRepository')
    private readonly expenseRepository: IExpenseRepository,
    @Inject('TransactionRepository')
    private readonly transactionRepository: ITransactionRepository,
  ) {}

  async execute(
    expenseId: string,
    userId: string,
    dto: UpdatePendingExpenseDto,
  ): Promise<Expense> {
    const expense = await this.expenseRepository.findById(expenseId);
    if (!expense) {
      throw new DomainNotFoundException('Expense not found');
    }

    const transaction = expense.transaction;
    if (!transaction.canBeModified()) {
      throw new DomainValidationException('Only pending expenses can be edited');
    }

    if (transaction.userId !== userId) {
      throw new DomainForbiddenException('Only the creator can edit a pending expense');
    }

    const expenseUpdates: { categoryId?: string; storeId?: string | null } = {};
    if (dto.categoryId !== undefined) {
      expenseUpdates.categoryId = dto.categoryId;
    }
    if (dto.storeId !== undefined) {
      expenseUpdates.storeId = dto.storeId;
    }

    if (Object.keys(expenseUpdates).length > 0) {
      await this.expenseRepository.update(expenseId, expenseUpdates);
    }

    const transactionUpdates: Record<string, unknown> = {};
    if (dto.amount !== undefined) {
      transactionUpdates.value = dto.amount;
    }
    if (dto.recordedAt !== undefined) {
      transactionUpdates.recordedAt = dto.recordedAt;
    }
    if (dto.paymentMethodId !== undefined) {
      transactionUpdates.paymentMethodId = dto.paymentMethodId ?? undefined;
    }

    if (Object.keys(transactionUpdates).length > 0) {
      await this.transactionRepository.update(transaction.id, transactionUpdates as Partial<Transaction>);
    }

    return this.expenseRepository.findById(expenseId) as Promise<Expense>;
  }
}
