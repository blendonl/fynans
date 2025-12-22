import { Injectable, Inject } from '@nestjs/common';
import {
  type IStoreItemCategoryRepository,
  PaginatedResult,
} from '../../domain/repositories/store-item-category.repository.interface';
import { StoreItemCategory } from '../../domain/entities/store-item-category.entity';
import { Pagination } from '../../../../transaction/core/application/dto/pagination.dto';

@Injectable()
export class ListStoreItemCategoriesUseCase {
  constructor(
    @Inject('StoreItemCategoryRepository')
    private readonly storeItemCategoryRepository: IStoreItemCategoryRepository,
  ) {}

  async execute(
    parentId?: string | null,
    pagination?: Pagination,
  ): Promise<PaginatedResult<StoreItemCategory>> {
    if (parentId !== undefined) {
      return this.storeItemCategoryRepository.findByParentId(
        parentId,
        pagination,
      );
    }

    return this.storeItemCategoryRepository.findAll(pagination);
  }
}
