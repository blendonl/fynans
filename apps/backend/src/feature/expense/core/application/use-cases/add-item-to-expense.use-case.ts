import { Injectable, Inject } from '@nestjs/common';
import { DomainNotFoundException } from '~common/exceptions/domain.exceptions';
import { type IExpenseRepository } from '../../domain/repositories/expense.repository.interface';
import { UpdateTransactionUseCase } from '../../../../transaction/core/application/use-cases/update-transaction.use-case';
import { ExpenseItemService } from '../../../../expense-item/core/application/services/expense-item.service';
import { CreateExpenseItemDto } from '../../../../expense-item/core/application/dto/create-expense-item.dto';
import { UpdateTransactionDto } from '../../../../transaction/core/application/dto/update-transaction.dto';
import { Expense } from '../../domain/entities/expense.entity';
import { PrismaService } from '~common/prisma/prisma.service';

@Injectable()
export class AddItemToExpenseUseCase {
  constructor(
    @Inject('ExpenseRepository')
    private readonly expenseRepository: IExpenseRepository,
    private readonly updateTransactionUseCase: UpdateTransactionUseCase,
    private readonly expenseItemService: ExpenseItemService,
    private readonly prisma: PrismaService,
  ) {}

  async execute(
    expenseId: string,
    itemDto: CreateExpenseItemDto,
    storeId: string,
    userId: string,
  ): Promise<Expense> {
    const expense = await this.expenseRepository.findById(expenseId);

    if (!expense) {
      throw new DomainNotFoundException('Expense not found');
    }

    await this.prisma.runInTransaction(async () => {
      await this.expenseItemService.create(itemDto, storeId, userId);

      const newTotal = await this.expenseItemService.calculateTotal(expenseId);

      await this.updateTransactionUseCase.execute(
        expense.transactionId,
        new UpdateTransactionDto({ value: newTotal }),
      );
    });

    return this.expenseRepository.findById(expenseId) as Promise<Expense>;
  }
}
