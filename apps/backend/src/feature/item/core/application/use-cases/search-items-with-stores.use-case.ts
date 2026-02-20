import { Injectable, Inject } from '@nestjs/common';
import {
  type IItemRepository,
  PaginatedResult,
  ItemWithStoresRow,
  ItemStorePrice,
} from '../../domain/repositories/item.repository.interface';
import { Pagination } from '~common/dto/pagination.dto';

export interface ItemWithStoresResult {
  id: string;
  name: string;
  categoryId: string;
  minPrice: number;
  maxPrice: number;
  storeCount: number;
}

@Injectable()
export class SearchItemsWithStoresUseCase {
  constructor(
    @Inject('ItemRepository')
    private readonly itemRepository: IItemRepository,
  ) {}

  async execute(
    userId: string,
    search?: string,
    pagination?: Pagination,
  ): Promise<PaginatedResult<ItemWithStoresResult>> {
    const result = await this.itemRepository.searchWithStores(userId, search, pagination);

    const data = result.data.map((item) => this.toResult(item));

    return {
      ...result,
      data,
    };
  }

  private toResult(item: ItemWithStoresRow): ItemWithStoresResult {
    const prices = item.stores.map((s) => s.price);

    return {
      id: item.id,
      name: item.name,
      categoryId: item.categoryId,
      minPrice: prices.length > 0 ? Math.min(...prices) : 0,
      maxPrice: prices.length > 0 ? Math.max(...prices) : 0,
      storeCount: new Set(item.stores.map((s) => s.storeId)).size,
    };
  }
}
