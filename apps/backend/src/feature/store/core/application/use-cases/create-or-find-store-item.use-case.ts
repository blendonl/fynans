import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { type IStoreItemRepository } from '../../domain/repositories/store-item.repository.interface';
import { type IItemRepository } from '../../../../item/core/domain/repositories/item.repository.interface';
import { type IStoreItemCategoryRepository } from '../../../../store-item-category/core/domain/repositories/store-item-category.repository.interface';
import { CreateStoreItemDto } from '../dto/create-store-item.dto';
import { StoreItem } from '../../domain/entities/store-item.entity';
import { Decimal } from 'prisma/generated/prisma/internal/prismaNamespace';

@Injectable()
export class CreateOrFindStoreItemUseCase {
  constructor(
    @Inject('StoreItemRepository')
    private readonly storeItemRepository: IStoreItemRepository,
    @Inject('ItemRepository')
    private readonly itemRepository: IItemRepository,
    @Inject('StoreItemCategoryRepository')
    private readonly storeItemCategoryRepository: IStoreItemCategoryRepository,
  ) {}

  async execute(dto: CreateStoreItemDto, userId: string): Promise<StoreItem> {
    this.validate(dto);

    let item = await this.itemRepository.findByNameAndCategory(
      dto.name,
      dto.categoryId,
    );

    if (!item) {
      item = await this.itemRepository.create({
        name: dto.name,
        categoryId: dto.categoryId,
      } as any);
    }

    await this.itemRepository.linkToUser(item.id, userId);
    await this.storeItemCategoryRepository.linkToUser(dto.categoryId, userId);

    const existingStoreItem = await this.storeItemRepository.findByStoreAndItemId(
      dto.storeId,
      item.id,
    );

    if (existingStoreItem) {
      const newPrice = new Decimal(dto.price);
      if (existingStoreItem.price.equals(newPrice)) {
        await this.storeItemRepository.linkToUser(existingStoreItem.id, userId);
        return existingStoreItem;
      }
    }

    const storeItem = await this.storeItemRepository.create({
      storeId: dto.storeId,
      itemId: item.id,
      price: new Decimal(dto.price),
      isDiscounted: dto.isDiscounted ?? false,
    } as Partial<StoreItem>);

    await this.storeItemRepository.linkToUser(storeItem.id, userId);

    return storeItem;
  }

  private validate(dto: CreateStoreItemDto): void {
    if (!dto.storeId || dto.storeId.trim() === '') {
      throw new BadRequestException('Store ID is required');
    }

    if (!dto.name || dto.name.trim() === '') {
      throw new BadRequestException('Item name is required');
    }

    if (dto.price < 0) {
      throw new BadRequestException('Item price must be non-negative');
    }

    if (!dto.categoryId || dto.categoryId.trim() === '') {
      throw new BadRequestException('Category ID is required');
    }
  }
}
