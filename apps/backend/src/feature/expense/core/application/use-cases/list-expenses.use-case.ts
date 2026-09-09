import { Injectable, Inject } from '@nestjs/common';
import {
  type IExpenseRepository,
  PaginatedResult,
} from '../../domain/repositories/expense.repository.interface';
import { Expense } from '../../domain/entities/expense.entity';
import { ExpenseFilters } from '../dto/expense-filters.dto';
import { Pagination } from '~common/dto/pagination.dto';

@Injectable()
export class ListExpensesUseCase {
  constructor(
    @Inject('ExpenseRepository')
    private readonly expenseRepository: IExpenseRepository,
  ) {}

  async execute(
    filters?: ExpenseFilters,
    pagination?: Pagination,
  ): Promise<PaginatedResult<Expense>> {
    return this.expenseRepository.findAll(filters, pagination);
  }
}
