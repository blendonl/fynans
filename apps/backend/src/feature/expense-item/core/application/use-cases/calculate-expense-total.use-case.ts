import { Injectable, Inject } from '@nestjs/common';
import { Decimal } from 'prisma/generated/prisma/internal/prismaNamespace';
import { type IExpenseItemRepository } from '../../domain/repositories/expense-item.repository.interface';

@Injectable()
export class CalculateExpenseTotalUseCase {
  constructor(
    @Inject('ExpenseItemRepository')
    private readonly expenseItemRepository: IExpenseItemRepository,
  ) {}

  async execute(expenseId: string): Promise<Decimal> {
    return this.expenseItemRepository.calculateExpenseTotal(expenseId);
  }
}
