import { Injectable, Inject } from '@nestjs/common';
import {
  DomainNotFoundException,
  DomainForbiddenException,
} from '~common/exceptions/domain.exceptions';
import { type IExpenseRepository } from '../../domain/repositories/expense.repository.interface';
import { type ITransactionRepository } from '~feature/transaction/core/domain/repositories/transaction.repository.interface';
import { Transaction } from '~feature/transaction/core/domain/entities/transaction.entity';
import { UpdateExpenseDto } from '../dto/update-expense.dto';
import { type IExpenseCategoryRepository } from '../../../../expense-category/core/domain/repositories/expense-category.repository.interface';
import { Expense } from '../../domain/entities/expense.entity';
import { StoreService } from '~feature/store/core';

@Injectable()
export class UpdateExpenseUseCase {
  constructor(
    @Inject('ExpenseRepository')
    private readonly expenseRepository: IExpenseRepository,
    @Inject('ExpenseCategoryRepository')
    private readonly expenseCategoryRepository: IExpenseCategoryRepository,
    @Inject('TransactionRepository')
    private readonly transactionRepository: ITransactionRepository,
    @Inject()
    private readonly storeService: StoreService,
  ) {}

  async execute(
    id: string,
    userId: string,
    dto: UpdateExpenseDto,
  ): Promise<Expense> {
    const expense = await this.expenseRepository.findById(id);

    if (!expense) {
      throw new DomainNotFoundException('Expense not found');
    }

    const isOwner = await this.expenseRepository.verifyOwnership(id, userId);
    if (!isOwner) {
      throw new DomainForbiddenException('Access denied');
    }

    await this.validate(dto);

    const updated = await this.expenseRepository.update(id, {
      categoryId: dto.categoryId,
      storeId: dto.storeId,
      description: dto.note,
    });

    const txUpdates: Record<string, unknown> = {};
    if (dto.amount !== undefined) txUpdates.value = dto.amount;
    if (dto.recordedAt !== undefined) txUpdates.recordedAt = dto.recordedAt;
    if (dto.paymentMethodId !== undefined)
      txUpdates.paymentMethodId = dto.paymentMethodId ?? undefined;

    if (Object.keys(txUpdates).length > 0) {
      await this.transactionRepository.update(
        expense.transactionId,
        txUpdates as Partial<Transaction>,
      );
    }

    if (Object.keys(txUpdates).length > 0) {
      return (await this.expenseRepository.findById(id))!;
    }

    return updated;
  }

  private async validate(dto: UpdateExpenseDto): Promise<void> {
    if (dto.categoryId) {
      const category = await this.expenseCategoryRepository.findById(
        dto.categoryId,
      );
      if (!category) {
        throw new DomainNotFoundException('Expense category not found');
      }
    }

    if (dto.storeId) {
      const store = await this.storeService.findById(dto.storeId);
      if (!store) {
        throw new DomainNotFoundException('Store not found');
      }
    }
  }
}
