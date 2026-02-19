import {
  StoreItem as PrismaStoreItem,
  Item as PrismaItem,
  ItemSize as PrismaItemSize,
} from 'prisma/generated/prisma/client';
import { StoreItem } from '../../domain/entities/store-item.entity';
import { ItemMapper } from '~feature/item/core/infrastructure/mappers/item.mapper';
import { ItemSize } from '~feature/item/core/domain/entities/item-size.entity';

export class StoreItemMapper {
  static toDomain(
    prismaStoreItem: PrismaStoreItem & { item?: PrismaItem; itemSize?: PrismaItemSize | null },
  ): StoreItem {
    return new StoreItem({
      id: prismaStoreItem.id,
      storeId: prismaStoreItem.storeId,
      itemId: prismaStoreItem.itemId,
      itemSizeId: prismaStoreItem.itemSizeId ?? undefined,
      price: prismaStoreItem.price,
      isDiscounted: prismaStoreItem.isDiscounted,
      createdAt: prismaStoreItem.createdAt,
      updatedAt: prismaStoreItem.updatedAt,
      item: prismaStoreItem.item
        ? ItemMapper.toDomain(prismaStoreItem.item)
        : undefined,
      itemSize: prismaStoreItem.itemSize
        ? new ItemSize({
            id: prismaStoreItem.itemSize.id,
            itemId: prismaStoreItem.itemSize.itemId,
            value: prismaStoreItem.itemSize.value,
            unit: prismaStoreItem.itemSize.unit,
            createdAt: prismaStoreItem.itemSize.createdAt,
            updatedAt: prismaStoreItem.itemSize.updatedAt,
          })
        : undefined,
    });
  }

  static toPersistence(storeItem: StoreItem) {
    return {
      id: storeItem.id,
      storeId: storeItem.storeId,
      itemId: storeItem.itemId,
      itemSizeId: storeItem.itemSizeId,
      price: storeItem.price,
      isDiscounted: storeItem.isDiscounted,
      createdAt: storeItem.createdAt,
      updatedAt: storeItem.updatedAt,
    };
  }
}
