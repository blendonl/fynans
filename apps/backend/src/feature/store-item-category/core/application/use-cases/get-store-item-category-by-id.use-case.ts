import { Injectable, Inject } from '@nestjs/common';
import { DomainNotFoundException } from '~common/exceptions/domain.exceptions';
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
      throw new DomainNotFoundException('Store item category not found');
    }

    return category;
  }
}
