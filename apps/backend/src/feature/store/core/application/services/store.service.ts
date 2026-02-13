import { Injectable } from '@nestjs/common';
import { CreateOrFindStoreUseCase } from '../use-cases/create-or-find-store.use-case';
import { GetStoreByIdUseCase } from '../use-cases/get-store-by-id.use-case';
import { ListStoresUseCase } from '../use-cases/list-stores.use-case';
import { CreateStoreDto } from '../dto/create-store.dto';
import { Store } from '../../domain/entities/store.entity';
import { Pagination } from '../../../../transaction/core/application/dto/pagination.dto';

@Injectable()
export class StoreService {
  constructor(
    private readonly createOrFindStoreUseCase: CreateOrFindStoreUseCase,
    private readonly getStoreByIdUseCase: GetStoreByIdUseCase,
    private readonly listStoresUseCase: ListStoresUseCase,
  ) {}

  async createOrFind(dto: CreateStoreDto, userId: string): Promise<Store> {
    return this.createOrFindStoreUseCase.execute(dto, userId);
  }

  async findById(id: string): Promise<Store> {
    return this.getStoreByIdUseCase.execute(id);
  }

  async findAll(
    userId: string,
    filters?: { search?: string },
    pagination?: Pagination,
  ): Promise<{ data: Store[]; total: number }> {
    return this.listStoresUseCase.execute(userId, filters || {}, pagination || new Pagination());
  }
}
