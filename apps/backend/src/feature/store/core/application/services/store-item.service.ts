import { Injectable } from '@nestjs/common';
import { CreateOrFindStoreItemUseCase } from '../use-cases/create-or-find-store-item.use-case';
import { GetStoreItemByIdUseCase } from '../use-cases/get-store-item-by-id.use-case';
import { ListStoreItemsUseCase, StoreItemFilters } from '../use-cases/list-store-items.use-case';
import { UpdateStoreItemUseCase } from '../use-cases/update-store-item.use-case';
import { DeleteStoreItemUseCase } from '../use-cases/delete-store-item.use-case';
import {
  SearchItemsWithPricesUseCase,
  type ItemWithPricesResult,
} from '../use-cases/search-items-with-prices.use-case';
import { CreateStoreItemDto } from '../dto/create-store-item.dto';
import { UpdateStoreItemDto } from '../dto/update-store-item.dto';
import { StoreItem } from '../../domain/entities/store-item.entity';
import { Pagination } from '~common/dto/pagination.dto';

@Injectable()
export class StoreItemService {
  constructor(
    private readonly createOrFindStoreItemUseCase: CreateOrFindStoreItemUseCase,
    private readonly getStoreItemByIdUseCase: GetStoreItemByIdUseCase,
    private readonly listStoreItemsUseCase: ListStoreItemsUseCase,
    private readonly updateStoreItemUseCase: UpdateStoreItemUseCase,
    private readonly deleteStoreItemUseCase: DeleteStoreItemUseCase,
    private readonly searchItemsWithPricesUseCase: SearchItemsWithPricesUseCase,
  ) {}

  async createOrFind(dto: CreateStoreItemDto, userId: string): Promise<StoreItem> {
    return this.createOrFindStoreItemUseCase.execute(dto, userId);
  }

  async findById(id: string): Promise<StoreItem> {
    return this.getStoreItemByIdUseCase.execute(id);
  }

  async findAll(
    userId: string,
    filters: StoreItemFilters,
    pagination: Pagination,
  ): Promise<{ data: StoreItem[]; total: number }> {
    return this.listStoreItemsUseCase.execute(userId, filters, pagination);
  }

  async update(id: string, dto: UpdateStoreItemDto): Promise<StoreItem> {
    return this.updateStoreItemUseCase.execute(id, dto);
  }

  async delete(id: string): Promise<void> {
    return this.deleteStoreItemUseCase.execute(id);
  }

  async searchWithPrices(
    userId: string,
    search?: string,
    pagination?: Pagination,
  ): Promise<{ data: ItemWithPricesResult[]; total: number }> {
    return this.searchItemsWithPricesUseCase.execute(userId, search, pagination);
  }
}
