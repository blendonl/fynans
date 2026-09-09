import { Expense } from '../entities/expense.entity';
import { Pagination, PaginatedResult } from '~common/dto/pagination.dto';
import { ExpenseTrendPoint } from '../../application/dto/expense-trends.dto';
import { ExpenseFilters } from '../../application/dto/expense-filters.dto';
import { ExpenseStatistics } from '../../application/dto/expense-statistics.dto';

export { PaginatedResult };
export type { ExpenseFilters, ExpenseStatistics };

export interface CreateExpenseData {
  id: string;
  transactionId: string;
  categoryId: string;
  storeId?: string | null;
}

export interface UpdateExpenseData {
  categoryId?: string;
  storeId?: string | null;
  description?: string;
}

export interface IExpenseRepository {
  create(data: CreateExpenseData): Promise<Expense>;
  findById(id: string): Promise<Expense | null>;
  findByTransactionId(transactionId: string): Promise<Expense | null>;
  findAll(
    filters?: ExpenseFilters,
    pagination?: Pagination,
  ): Promise<PaginatedResult<Expense>>;
  update(id: string, data: UpdateExpenseData): Promise<Expense>;
  delete(id: string): Promise<void>;
  deleteWithItemsAndTransaction(
    expenseId: string,
    transactionId: string,
  ): Promise<void>;
  verifyOwnership(expenseId: string, userId: string): Promise<boolean>;
  getStatistics(filters?: ExpenseFilters): Promise<ExpenseStatistics>;
  getTrends(
    dateFrom: Date,
    dateTo: Date,
    groupBy: string,
    filters?: ExpenseFilters,
  ): Promise<ExpenseTrendPoint[]>;
}
