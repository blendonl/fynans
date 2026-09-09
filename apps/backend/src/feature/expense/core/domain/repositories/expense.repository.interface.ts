import { Expense } from '../entities/expense.entity';
import { Pagination, PaginatedResult } from '~common/dto/pagination.dto';
import { TransactionScope } from '../../../../transaction/core/domain/entities/transaction.entity';
import { TransactionStatus } from '../../../../transaction/core/domain/value-objects/transaction-status.vo';
import { ExpenseTrendPoint } from '../../application/dto/expense-trends.dto';
import { Decimal } from 'prisma/generated/prisma/internal/prismaNamespace';

export { PaginatedResult };

export interface ExpenseFilters {
  userId?: string;
  categoryId?: string;
  storeId?: string;
  familyId?: string;
  scope?: TransactionScope;
  status?: TransactionStatus;
  paymentMethodId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  valueMin?: number;
  valueMax?: number;
  search?: string;
}

export interface ExpenseStatistics {
  totalExpenses: Decimal;
  expenseCount: number;
  averageExpense: Decimal;
  expensesByCategory: {
    categoryId: string;
    categoryName: string;
    total: Decimal;
  }[];
  expensesByStore: { storeId: string; total: Decimal }[];
}

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
  verifyOwnership(expenseId: string, userId: string): Promise<boolean>;
  getStatistics(filters?: ExpenseFilters): Promise<ExpenseStatistics>;
  getTrends(
    dateFrom: Date,
    dateTo: Date,
    groupBy: string,
    filters?: ExpenseFilters,
  ): Promise<ExpenseTrendPoint[]>;
}
