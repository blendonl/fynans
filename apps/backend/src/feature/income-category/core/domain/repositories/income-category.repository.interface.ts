import { IncomeCategory } from '../entities/income-category.entity';
import { Pagination } from '~common/dto/pagination.dto';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
}

export interface CreateIncomeCategoryData {
  userId: string;
  name: string;
  parentId?: string | null;
}

export interface UpdateIncomeCategoryData {
  name?: string;
  parentId?: string | null;
}

export interface IIncomeCategoryRepository {
  create(data: CreateIncomeCategoryData): Promise<IncomeCategory>;
  findById(id: string): Promise<IncomeCategory | null>;
  findVisibleById(id: string, userId: string): Promise<IncomeCategory | null>;
  findOwnedByName(name: string, userId: string): Promise<IncomeCategory | null>;
  findAll(
    userId: string,
    pagination?: Pagination,
  ): Promise<PaginatedResult<IncomeCategory>>;
  findByParentId(
    userId: string,
    parentId: string | null,
    pagination?: Pagination,
  ): Promise<PaginatedResult<IncomeCategory>>;
  findChildren(parentId: string, userId: string): Promise<IncomeCategory[]>;
  update(id: string, data: UpdateIncomeCategoryData): Promise<IncomeCategory>;
  delete(id: string): Promise<void>;
}
