import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { type IExpenseRepository } from '../../domain/repositories/expense.repository.interface';
import { TransactionService } from '../../../../transaction/core/application/services/transaction.service';
import { ExpenseItemService } from '../../../../expense-item/core/application/services/expense-item.service';
import { CreateExpenseItemDto } from '../../../../expense-item/core/application/dto/create-expense-item.dto';
import { UpdateTransactionDto } from '../../../../transaction/core/application/dto/update-transaction.dto';
import { Expense } from '../../domain/entities/expense.entity';

@Injectable()
export class AddItemToExpenseUseCase {
  constructor(
    @Inject('ExpenseRepository')
    private readonly expenseRepository: IExpenseRepository,
    private readonly transactionService: TransactionService,
    private readonly expenseItemService: ExpenseItemService,
  ) {}

  async execute(
    expenseId: string,
    itemDto: CreateExpenseItemDto,
    storeId: string,
    userId: string,
  ): Promise<Expense> {
    const expense = await this.expenseRepository.findById(expenseId);

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    await this.expenseItemService.create(itemDto, storeId, userId);

    // 2. Recalculate total
    const newTotal = await this.expenseItemService.calculateTotal(expenseId);

    // 3. Update Transaction value
    await this.transactionService.update(
      expense.transactionId,
      new UpdateTransactionDto({ value: newTotal }),
    );

    // 4. Return updated expense
    return this.expenseRepository.findById(expenseId) as Promise<Expense>;
  }
}
