import { StoreItemDiscount } from '../entities/store-item-discount.entity';
import { Pagination, PaginatedResult } from '~common/dto/pagination.dto';

export interface IStoreItemDiscountRepository {
  create(data: Partial<StoreItemDiscount>): Promise<StoreItemDiscount>;
  findById(id: string): Promise<StoreItemDiscount | null>;
  findByStoreItemId(
    storeItemId: string,
    pagination?: Pagination,
  ): Promise<PaginatedResult<StoreItemDiscount>>;
  findActiveByStoreItemId(
    storeItemId: string,
  ): Promise<StoreItemDiscount | null>;
  update(
    id: string,
    data: Partial<StoreItemDiscount>,
  ): Promise<StoreItemDiscount>;
  endDiscount(id: string): Promise<StoreItemDiscount>;
  delete(id: string): Promise<void>;
}

export type { PaginatedResult };
