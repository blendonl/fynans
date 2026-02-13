import { Injectable } from '@nestjs/common';
import { CreateStoreItemCategoryUseCase } from '../use-cases/create-store-item-category.use-case';
import { GetStoreItemCategoryByIdUseCase } from '../use-cases/get-store-item-category-by-id.use-case';
import { ListStoreItemCategoriesUseCase } from '../use-cases/list-store-item-categories.use-case';
import { GetItemCategoryTreeUseCase, ItemCategoryTree } from '../use-cases/get-item-category-tree.use-case';
import { UpdateStoreItemCategoryUseCase } from '../use-cases/update-store-item-category.use-case';
import { DeleteStoreItemCategoryUseCase } from '../use-cases/delete-store-item-category.use-case';
import { CreateStoreItemCategoryDto } from '../dto/create-store-item-category.dto';
import { UpdateStoreItemCategoryDto } from '../dto/update-store-item-category.dto';
import { StoreItemCategory } from '../../domain/entities/store-item-category.entity';
import { PaginatedResult } from '../../domain/repositories/store-item-category.repository.interface';
import { Pagination } from '../../../../transaction/core/application/dto/pagination.dto';

@Injectable()
export class StoreItemCategoryService {
  constructor(
    private readonly createStoreItemCategoryUseCase: CreateStoreItemCategoryUseCase,
    private readonly getStoreItemCategoryByIdUseCase: GetStoreItemCategoryByIdUseCase,
    private readonly listStoreItemCategoriesUseCase: ListStoreItemCategoriesUseCase,
    private readonly getItemCategoryTreeUseCase: GetItemCategoryTreeUseCase,
    private readonly updateStoreItemCategoryUseCase: UpdateStoreItemCategoryUseCase,
    private readonly deleteStoreItemCategoryUseCase: DeleteStoreItemCategoryUseCase,
  ) {}

  async create(
    dto: CreateStoreItemCategoryDto,
    userId: string,
  ): Promise<StoreItemCategory> {
    return this.createStoreItemCategoryUseCase.execute(dto, userId);
  }

  async findById(id: string): Promise<StoreItemCategory> {
    return this.getStoreItemCategoryByIdUseCase.execute(id);
  }

  async findAll(
    userId: string,
    parentId?: string | null,
    pagination?: Pagination,
  ): Promise<PaginatedResult<StoreItemCategory>> {
    return this.listStoreItemCategoriesUseCase.execute(userId, parentId, pagination);
  }

  async getTree(userId: string): Promise<ItemCategoryTree[]> {
    return this.getItemCategoryTreeUseCase.execute(userId);
  }

  async update(
    id: string,
    dto: UpdateStoreItemCategoryDto,
  ): Promise<StoreItemCategory> {
    return this.updateStoreItemCategoryUseCase.execute(id, dto);
  }

  async delete(id: string): Promise<void> {
    return this.deleteStoreItemCategoryUseCase.execute(id);
  }
}
