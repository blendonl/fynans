import { Injectable, Inject } from '@nestjs/common';
import { type IStoreItemRepository } from '../../domain/repositories/store-item.repository.interface';
import { StoreItem } from '../../domain/entities/store-item.entity';
import { Pagination } from '~common/dto/pagination.dto';

export interface StoreItemFilters {
  storeId?: string;
  itemId?: string;
  search?: string;
}

@Injectable()
export class ListStoreItemsUseCase {
  constructor(
    @Inject('StoreItemRepository')
    private readonly storeItemRepository: IStoreItemRepository,
  ) {}

  async execute(
    userId: string,
    filters: StoreItemFilters,
    pagination: Pagination,
  ): Promise<{ data: StoreItem[]; total: number }> {
    if (filters.itemId) {
      return this.storeItemRepository.findByItemId(
        userId,
        filters.itemId,
        pagination,
      );
    }
    if (filters.storeId) {
      return this.storeItemRepository.findByStoreId(
        userId,
        filters.storeId,
        filters.search,
        pagination,
      );
    }
    return this.storeItemRepository.findAll(userId, pagination);
  }
}
