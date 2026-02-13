import { StoreItem } from '../entities/store-item.entity';
import { Pagination } from '../../../../transaction/core/application/dto/pagination.dto';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
}

export interface IStoreItemRepository {
  create(data: Partial<StoreItem>): Promise<StoreItem>;
  findById(id: string): Promise<StoreItem | null>;
  findByStoreAndName(storeId: string, name: string): Promise<StoreItem | null>;
  findByStoreAndItemId(storeId: string, itemId: string): Promise<StoreItem | null>;
  findByStoreId(
    userId: string,
    storeId: string,
    search?: string,
    pagination?: Pagination,
  ): Promise<PaginatedResult<StoreItem>>;
  findAll(
    userId: string,
    pagination?: Pagination,
  ): Promise<PaginatedResult<StoreItem>>;
  linkToUser(storeItemId: string, userId: string): Promise<void>;
  update(id: string, data: Partial<StoreItem>): Promise<StoreItem>;
  delete(id: string): Promise<void>;
}
