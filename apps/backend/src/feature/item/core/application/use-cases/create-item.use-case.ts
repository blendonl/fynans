import { Injectable, Inject, BadRequestException } from '@nestjs/common';
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
    await this.validate(dto);

    const item = await this.itemRepository.create({
      name: dto.name,
      categoryId: dto.categoryId,
    } as Partial<Item>);

    await this.itemRepository.linkToUser(item.id, userId);

    return item;
  }

  private async validate(dto: CreateItemDto): Promise<void> {
    if (!dto.name || dto.name.trim() === '') {
      throw new BadRequestException('Item name is required');
    }

    if (!dto.categoryId || dto.categoryId.trim() === '') {
      throw new BadRequestException('Category ID is required');
    }

    const category = await this.categoryRepository.findById(dto.categoryId);
    if (!category) {
      throw new BadRequestException('Category not found');
    }

    const existingItem = await this.itemRepository.findByName(dto.name);
    if (existingItem) {
      throw new BadRequestException(
        `An item with the name "${dto.name}" already exists`,
      );
    }
  }
}
