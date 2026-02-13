import { Expense } from '../entities/expense.entity';
import { Pagination } from '../../../../transaction/core/application/dto/pagination.dto';
import { TransactionScope } from '../../../../transaction/core/domain/entities/transaction.entity';
import { ExpenseTrendPoint } from '../../application/dto/expense-trends.dto';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
}

export interface ExpenseFilters {
  userId?: string;
  categoryId?: string;
  storeId?: string;
  familyId?: string;
  scope?: TransactionScope;
  dateFrom?: Date;
  dateTo?: Date;
  valueMin?: number;
  valueMax?: number;
}

export interface ExpenseStatistics {
  totalExpenses: number;
  expenseCount: number;
  averageExpense: number;
  expensesByCategory: { categoryId: string; categoryName: string; total: number }[];
  expensesByStore: { storeId: string; total: number }[];
}

export interface IExpenseRepository {
  create(data: Partial<Expense>): Promise<Expense>;
  findById(id: string): Promise<Expense | null>;
  findByTransactionId(transactionId: string): Promise<Expense | null>;
  findAll(
    filters?: ExpenseFilters,
    pagination?: Pagination,
  ): Promise<PaginatedResult<Expense>>;
  update(id: string, data: Partial<Expense>): Promise<Expense>;
  delete(id: string): Promise<void>;
  verifyOwnership(expenseId: string, userId: string): Promise<boolean>;
  getStatistics(
    userId?: string,
    filters?: ExpenseFilters,
  ): Promise<ExpenseStatistics>;
  getTrends(
    userId: string,
    dateFrom: Date,
    dateTo: Date,
    groupBy: string,
    filters?: ExpenseFilters,
  ): Promise<ExpenseTrendPoint[]>;
}
