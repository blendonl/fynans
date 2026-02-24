import { ExpenseCategory } from '../entities/expense-category.entity';
import { Pagination, PaginatedResult } from '~common/dto/pagination.dto';

export { PaginatedResult };

export interface CreateExpenseCategoryData {
  name: string;
  parentId?: string | null;
  isConnectedToStore?: boolean;
}

export interface UpdateExpenseCategoryData {
  name?: string;
  parentId?: string | null;
  isConnectedToStore?: boolean;
}

export interface IExpenseCategoryRepository {
  create(data: CreateExpenseCategoryData): Promise<ExpenseCategory>;
  findById(id: string): Promise<ExpenseCategory | null>;
  findByName(name: string): Promise<ExpenseCategory | null>;
  findAll(
    userId: string,
    pagination?: Pagination,
    filters?: { search?: string },
  ): Promise<PaginatedResult<ExpenseCategory>>;
  findByParentId(
    userId: string,
    parentId: string | null,
    pagination?: Pagination,
  ): Promise<PaginatedResult<ExpenseCategory>>;
  findChildren(parentId: string): Promise<ExpenseCategory[]>;
  linkToUser(categoryId: string, userId: string): Promise<void>;
  update(
    id: string,
    data: UpdateExpenseCategoryData,
  ): Promise<ExpenseCategory>;
  delete(id: string): Promise<void>;
  countExpensesByCategory(categoryId: string): Promise<number>;
}
