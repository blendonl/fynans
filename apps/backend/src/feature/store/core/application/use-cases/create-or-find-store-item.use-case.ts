import { Injectable, Inject } from '@nestjs/common';
import { DomainValidationException } from '~common/exceptions/domain.exceptions';
import { type IStoreItemRepository } from '../../domain/repositories/store-item.repository.interface';
import { type IItemRepository } from '../../../../item/core/domain/repositories/item.repository.interface';
import { type IItemSizeRepository } from '../../../../item/core/domain/repositories/item-size.repository.interface';
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
    @Inject('ItemSizeRepository')
    private readonly itemSizeRepository: IItemSizeRepository,
    @Inject('StoreItemCategoryRepository')
    private readonly storeItemCategoryRepository: IStoreItemCategoryRepository,
  ) {}

  async execute(dto: CreateStoreItemDto, userId: string): Promise<StoreItem> {
    this.validate(dto);

    let item = await this.itemRepository.findByName(dto.name);

    if (!item) {
      item = await this.itemRepository.create({
        name: dto.name,
        categoryId: dto.categoryId,
      } as any);
    }

    await this.itemRepository.linkToUser(item.id, userId);
    await this.storeItemCategoryRepository.linkToUser(dto.categoryId, userId);

    let itemSizeId: string | undefined;
    if (dto.sizeValue && dto.sizeUnit) {
      const itemSize = await this.itemSizeRepository.create({
        itemId: item.id,
        value: dto.sizeValue,
        unit: dto.sizeUnit,
      });
      itemSizeId = itemSize.id;
    }

    const existingStoreItem = await this.storeItemRepository.findByStoreItemAndSize(
      dto.storeId,
      item.id,
      itemSizeId,
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
      itemSizeId,
      price: new Decimal(dto.price),
      isDiscounted: dto.isDiscounted ?? false,
    } as Partial<StoreItem>);

    await this.storeItemRepository.linkToUser(storeItem.id, userId);

    return storeItem;
  }

  private validate(dto: CreateStoreItemDto): void {
    if (!dto.storeId || dto.storeId.trim() === '') {
      throw new DomainValidationException('Store ID is required');
    }

    if (!dto.name || dto.name.trim() === '') {
      throw new DomainValidationException('Item name is required');
    }

    if (dto.price < 0) {
      throw new DomainValidationException('Item price must be non-negative');
    }

    if (!dto.categoryId || dto.categoryId.trim() === '') {
      throw new DomainValidationException('Category ID is required');
    }
  }
}
