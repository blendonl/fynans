import { Injectable, Inject } from '@nestjs/common';
import { type IStoreRepository } from '../../domain/repositories/store.repository.interface';
import { Store } from '../../domain/entities/store.entity';
import { Pagination } from '../../../../transaction/core/application/dto/pagination.dto';

export interface StoreFilters {
  search?: string;
}

@Injectable()
export class ListStoresUseCase {
  constructor(
    @Inject('StoreRepository')
    private readonly storeRepository: IStoreRepository,
  ) {}

  async execute(
    userId: string,
    filters: StoreFilters,
    pagination: Pagination,
  ): Promise<{ data: Store[]; total: number }> {
    return this.storeRepository.findAll(userId, filters, pagination);
  }
}
