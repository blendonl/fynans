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

export interface IItemRepository {
  create(data: Partial<Item>): Promise<Item>;
  findById(id: string): Promise<Item | null>;
  findByName(name: string): Promise<Item | null>;
  findBySimilarName(name: string, threshold?: number): Promise<Item | null>;
  findByNameAndCategory(
    name: string,
    categoryId: string,
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
  linkToUser(itemId: string, userId: string): Promise<void>;
  searchWithStores(
    userId: string,
    search?: string,
    pagination?: Pagination,
  ): Promise<PaginatedResult<ItemWithStoresRow>>;
  findByIdWithDetail(id: string): Promise<ItemDetailResult | null>;
  update(id: string, data: Partial<Item>): Promise<Item>;
  delete(id: string): Promise<void>;
}
