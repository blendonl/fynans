import { Injectable, Inject } from '@nestjs/common';
import { DomainValidationException } from '~common/exceptions/domain.exceptions';
import { type IItemRepository } from '../../domain/repositories/item.repository.interface';
import { type IStoreItemCategoryRepository } from '../../../../store-item-category/core/domain/repositories/store-item-category.repository.interface';
import { CreateItemDto } from '../dto/create-item.dto';
import { Item } from '../../domain/entities/item.entity';

@Injectable()
export class CreateItemUseCase {
  constructor(
    @Inject('ItemRepository')
    private readonly itemRepository: IItemRepository,
    @Inject('StoreItemCategoryRepository')
    private readonly categoryRepository: IStoreItemCategoryRepository,
  ) {}

  async execute(dto: CreateItemDto, userId: string): Promise<Item> {
    await this.validate(dto, userId);

    return this.itemRepository.create({
      userId,
      name: dto.name,
      categoryId: dto.categoryId,
    });
  }

  private async validate(dto: CreateItemDto, userId: string): Promise<void> {
    if (!dto.name || dto.name.trim() === '') {
      throw new DomainValidationException('Item name is required');
    }

    if (!dto.categoryId || dto.categoryId.trim() === '') {
      throw new DomainValidationException('Category ID is required');
    }

    const category = await this.categoryRepository.findById(dto.categoryId);
    if (!category) {
      throw new DomainValidationException('Category not found');
    }

    const existingItem = await this.itemRepository.findOwnedByName(
      dto.name,
      userId,
    );
    if (existingItem) {
      throw new DomainValidationException(
        `An item with the name "${dto.name}" already exists`,
      );
    }
  }
}
