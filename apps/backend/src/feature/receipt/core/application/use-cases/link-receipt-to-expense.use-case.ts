import {
  Inject,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { IStoredReceiptRepository } from '../../domain/repositories/stored-receipt.repository.interface';
import { type IExpenseRepository } from '~feature/expense/core/domain/repositories/expense.repository.interface';
import { StoredReceipt } from '../../domain/entities/stored-receipt.entity';

@Injectable()
export class LinkReceiptToExpenseUseCase {
  constructor(
    @Inject('StoredReceiptRepository')
    private readonly receiptRepo: IStoredReceiptRepository,
    @Inject('ExpenseRepository')
    private readonly expenseRepo: IExpenseRepository,
  ) {}

  async execute(
    receiptId: string,
    expenseId: string,
    userId: string,
  ): Promise<StoredReceipt> {
    const receipt = await this.receiptRepo.findById(receiptId);
    if (!receipt) {
      throw new NotFoundException('Receipt not found');
    }

    const isOwner = await this.receiptRepo.verifyOwnership(receiptId, userId);
    if (!isOwner) {
      throw new ForbiddenException('You do not have access to this receipt');
    }

    const expense = await this.expenseRepo.findById(expenseId);
    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    const ownsExpense = await this.expenseRepo.verifyOwnership(
      expenseId,
      userId,
    );
    if (!ownsExpense) {
      throw new ForbiddenException('You do not have access to this expense');
    }

    return this.receiptRepo.update(receiptId, { expenseId });
  }
}
