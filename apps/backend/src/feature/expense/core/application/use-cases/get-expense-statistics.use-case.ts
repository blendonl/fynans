import { Injectable, Inject } from '@nestjs/common';
import { type IExpenseRepository } from '../../domain/repositories/expense.repository.interface';
import { ExpenseFilters } from '../dto/expense-filters.dto';
import { type ExpenseStatistics } from '../dto/expense-statistics.dto';

@Injectable()
export class GetExpenseStatisticsUseCase {
  constructor(
    @Inject('ExpenseRepository')
    private readonly expenseRepository: IExpenseRepository,
  ) {}

  async execute(filters?: ExpenseFilters): Promise<ExpenseStatistics> {
    return this.expenseRepository.getStatistics(filters);
  }
}
