import { Item } from '../entities/item.entity';
import { Pagination, PaginatedResult } from '~common/types/pagination';

export { PaginatedResult };

export interface IItemRepository {
  create(data: Partial<Item>): Promise<Item>;
  findById(id: string): Promise<Item | null>;
  findByName(name: string): Promise<Item | null>;
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
  update(id: string, data: Partial<Item>): Promise<Item>;
  delete(id: string): Promise<void>;
}
