import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { type IStoreItemCategoryRepository } from '../../domain/repositories/store-item-category.repository.interface';
import { StoreItemCategory } from '../../domain/entities/store-item-category.entity';

@Injectable()
export class GetStoreItemCategoryByIdUseCase {
  constructor(
    @Inject('StoreItemCategoryRepository')
    private readonly storeItemCategoryRepository: IStoreItemCategoryRepository,
  ) {}

  async execute(id: string): Promise<StoreItemCategory> {
    const category = await this.storeItemCategoryRepository.findById(id);

    if (!category) {
      throw new NotFoundException('Store item category not found');
    }

    return category;
  }
}
