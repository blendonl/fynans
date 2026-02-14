import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { type IItemRepository } from '../../domain/repositories/item.repository.interface';
import { type IStoreItemCategoryRepository } from '../../../../store-item-category/core/domain/repositories/store-item-category.repository.interface';
import { UpdateItemDto } from '../dto/update-item.dto';
import { Item } from '../../domain/entities/item.entity';

@Injectable()
export class UpdateItemUseCase {
  constructor(
    @Inject('ItemRepository')
    private readonly itemRepository: IItemRepository,
    @Inject('StoreItemCategoryRepository')
    private readonly categoryRepository: IStoreItemCategoryRepository,
  ) {}

  async execute(id: string, dto: UpdateItemDto): Promise<Item> {
    // Check if item exists
    const existingItem = await this.itemRepository.findById(id);
    if (!existingItem) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }

    await this.validate(id, dto);

    const item = await this.itemRepository.update(id, {
      name: dto.name,
      categoryId: dto.categoryId,
    } as Partial<Item>);

    return item;
  }

  private async validate(id: string, dto: UpdateItemDto): Promise<void> {
    if (dto.name !== undefined && dto.name.trim() === '') {
      throw new BadRequestException('Item name cannot be empty');
    }

    if (dto.name) {
      const existingItem = await this.itemRepository.findByName(dto.name);
      if (existingItem && existingItem.id !== id) {
        throw new BadRequestException(
          `An item with the name "${dto.name}" already exists`,
        );
      }
    }

    // Validate category exists if changing
    if (dto.categoryId) {
      const category = await this.categoryRepository.findById(dto.categoryId);
      if (!category) {
        throw new BadRequestException('Category not found');
      }
    }
  }
}
