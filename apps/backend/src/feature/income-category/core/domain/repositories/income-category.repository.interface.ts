import { IncomeCategory } from '../entities/income-category.entity';
import { Pagination } from '../../../../transaction/core/application/dto/pagination.dto';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
}

export interface IIncomeCategoryRepository {
  create(data: Partial<IncomeCategory>): Promise<IncomeCategory>;
  findById(id: string): Promise<IncomeCategory | null>;
  findByName(name: string): Promise<IncomeCategory | null>;
  findAll(
    userId: string,
    pagination?: Pagination,
  ): Promise<PaginatedResult<IncomeCategory>>;
  findByParentId(
    userId: string,
    parentId: string | null,
    pagination?: Pagination,
  ): Promise<PaginatedResult<IncomeCategory>>;
  findChildren(parentId: string): Promise<IncomeCategory[]>;
  linkToUser(categoryId: string, userId: string): Promise<void>;
  update(
    id: string,
    data: Partial<IncomeCategory>,
  ): Promise<IncomeCategory>;
  delete(id: string): Promise<void>;
}
