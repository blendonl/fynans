import { StoreItemCategory } from '../entities/store-item-category.entity';
import { Pagination } from '../../../../transaction/core/application/dto/pagination.dto';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
}

export interface IStoreItemCategoryRepository {
  create(data: Partial<StoreItemCategory>): Promise<StoreItemCategory>;
  findById(id: string): Promise<StoreItemCategory | null>;
  findByName(name: string): Promise<StoreItemCategory | null>;
  findAll(
    userId: string,
    pagination?: Pagination,
  ): Promise<PaginatedResult<StoreItemCategory>>;
  findByParentId(
    userId: string,
    parentId: string | null,
    pagination?: Pagination,
  ): Promise<PaginatedResult<StoreItemCategory>>;
  findChildren(parentId: string): Promise<StoreItemCategory[]>;
  linkToUser(categoryId: string, userId: string): Promise<void>;
  update(
    id: string,
    data: Partial<StoreItemCategory>,
  ): Promise<StoreItemCategory>;
  delete(id: string): Promise<void>;
}
