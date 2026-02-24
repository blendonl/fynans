import { Injectable } from '@nestjs/common';
import { CreateOrFindStoreUseCase } from '../use-cases/create-or-find-store.use-case';
import { GetStoreByIdUseCase } from '../use-cases/get-store-by-id.use-case';
import { ListStoresUseCase } from '../use-cases/list-stores.use-case';
import { UpdateStoreUseCase } from '../use-cases/update-store.use-case';
import { DeleteStoreUseCase } from '../use-cases/delete-store.use-case';
import { CreateStoreDto } from '../dto/create-store.dto';
import { UpdateStoreDto } from '../dto/update-store.dto';
import { Store } from '../../domain/entities/store.entity';
import { Pagination } from '~common/dto/pagination.dto';

@Injectable()
export class StoreService {
  constructor(
    private readonly createOrFindStoreUseCase: CreateOrFindStoreUseCase,
    private readonly getStoreByIdUseCase: GetStoreByIdUseCase,
    private readonly listStoresUseCase: ListStoresUseCase,
    private readonly updateStoreUseCase: UpdateStoreUseCase,
    private readonly deleteStoreUseCase: DeleteStoreUseCase,
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

  async update(id: string, dto: UpdateStoreDto): Promise<Store> {
    return this.updateStoreUseCase.execute(id, dto);
  }

  async delete(id: string): Promise<void> {
    return this.deleteStoreUseCase.execute(id);
  }
}
