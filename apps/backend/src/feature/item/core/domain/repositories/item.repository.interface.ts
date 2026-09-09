import { Item } from '../entities/item.entity';
import { Pagination, PaginatedResult } from '~common/dto/pagination.dto';

export { PaginatedResult };

export interface ItemStorePrice {
  storeId: string;
  storeName: string;
  price: number;
}

export interface ItemWithStoresRow {
  id: string;
  name: string;
  categoryId: string;
  stores: ItemStorePrice[];
}

export interface ItemDetailResult {
  item: Item;
  category: { id: string; name: string };
  stores: {
    storeItemId: string;
    storeId: string;
    storeName: string;
    storeLocation: string;
    price: number;
    isDiscounted: boolean;
  }[];
}

export interface CreateItemData {
  userId: string;
  categoryId: string;
  name: string;
  nameEn?: string;
}

export interface UpdateItemData {
  categoryId?: string;
  name?: string;
  nameEn?: string;
}

export interface IItemRepository {
  create(data: CreateItemData): Promise<Item>;
  findById(id: string): Promise<Item | null>;
  findVisibleById(id: string, userId: string): Promise<Item | null>;
  findOwnedByName(name: string, userId: string): Promise<Item | null>;
  findOwnedBySimilarName(
    name: string,
    userId: string,
    threshold?: number,
  ): Promise<Item | null>;
  findByCategoryId(
    userId: string,
    categoryId: string,
    pagination?: Pagination,
  ): Promise<PaginatedResult<Item>>;
  findAll(
    userId: string,
    filters?: { search?: string },
    pagination?: Pagination,
  ): Promise<PaginatedResult<Item>>;
  searchWithStores(
    userId: string,
    search?: string,
    pagination?: Pagination,
  ): Promise<PaginatedResult<ItemWithStoresRow>>;
  findVisibleByIdWithDetail(
    id: string,
    userId: string,
  ): Promise<ItemDetailResult | null>;
  update(id: string, data: UpdateItemData): Promise<Item>;
  delete(id: string): Promise<void>;
}
