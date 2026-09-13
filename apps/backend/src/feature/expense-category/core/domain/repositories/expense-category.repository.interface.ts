import { ExpenseCategory } from '../entities/expense-category.entity';
import { Pagination, PaginatedResult } from '~common/dto/pagination.dto';

export { PaginatedResult };

export interface CreateExpenseCategoryData {
  userId: string;
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
  findVisibleById(id: string, userId: string): Promise<ExpenseCategory | null>;
  findOwnedByName(
    name: string,
    userId: string,
  ): Promise<ExpenseCategory | null>;
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
  findChildren(parentId: string, userId: string): Promise<ExpenseCategory[]>;
  update(id: string, data: UpdateExpenseCategoryData): Promise<ExpenseCategory>;
  delete(id: string): Promise<void>;
  countExpensesInOwnedCategory(
    categoryId: string,
    userId: string,
  ): Promise<number>;
}
