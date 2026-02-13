import { Injectable } from '@nestjs/common';
import { CreateOrFindStoreItemUseCase } from '../use-cases/create-or-find-store-item.use-case';
import { GetStoreItemByIdUseCase } from '../use-cases/get-store-item-by-id.use-case';
import { ListStoreItemsUseCase, StoreItemFilters } from '../use-cases/list-store-items.use-case';
import { CreateStoreItemDto } from '../dto/create-store-item.dto';
import { StoreItem } from '../../domain/entities/store-item.entity';
import { Pagination } from '../../../../transaction/core/application/dto/pagination.dto';

@Injectable()
export class StoreItemService {
  constructor(
    private readonly createOrFindStoreItemUseCase: CreateOrFindStoreItemUseCase,
    private readonly getStoreItemByIdUseCase: GetStoreItemByIdUseCase,
    private readonly listStoreItemsUseCase: ListStoreItemsUseCase,
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
}
