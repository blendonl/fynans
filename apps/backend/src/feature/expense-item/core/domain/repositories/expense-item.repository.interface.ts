import { ExpenseItem } from '../entities/expense-item.entity';
import { Pagination } from '~common/dto/pagination.dto';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
}

export interface IExpenseItemRepository {
  create(data: Partial<ExpenseItem>): Promise<ExpenseItem>;
  findById(id: string): Promise<ExpenseItem | null>;
  findByExpenseId(expenseId: string): Promise<ExpenseItem[]>;
  findAll(pagination?: Pagination): Promise<PaginatedResult<ExpenseItem>>;
  update(id: string, data: Partial<ExpenseItem>): Promise<ExpenseItem>;
  delete(id: string): Promise<void>;
  deleteByExpenseId(expenseId: string): Promise<void>;
  calculateExpenseTotal(expenseId: string): Promise<number>;
}
