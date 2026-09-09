import { Injectable, Inject } from '@nestjs/common';
import { type IExpenseRepository } from '../../domain/repositories/expense.repository.interface';
import { ExpenseFilters } from '../dto/expense-filters.dto';
import { ExpenseStatistics } from '../dto/expense-statistics.dto';

@Injectable()
export class GetExpenseStatisticsUseCase {
  constructor(
    @Inject('ExpenseRepository')
    private readonly expenseRepository: IExpenseRepository,
  ) {}

  async execute(filters?: ExpenseFilters): Promise<ExpenseStatistics> {
    const stats = await this.expenseRepository.getStatistics(filters);

    return new ExpenseStatistics(
      stats.totalExpenses,
      stats.expenseCount,
      stats.averageExpense,
      stats.expensesByCategory,
      stats.expensesByStore,
    );
  }
}
