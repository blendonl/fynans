import {
  StoreItem as PrismaStoreItem,
  Item as PrismaItem,
  ItemSize as PrismaItemSize,
} from 'prisma/generated/prisma/client';
import { StoreItem } from '../../domain/entities/store-item.entity';
import { ItemMapper } from '~feature/item/core/infrastructure/mappers/item.mapper';

export class StoreItemMapper {
  static toDomain(
    prismaStoreItem: PrismaStoreItem & { item?: PrismaItem & { sizes?: PrismaItemSize[] } },
  ): StoreItem {
    return new StoreItem({
      id: prismaStoreItem.id,
      storeId: prismaStoreItem.storeId,
      itemId: prismaStoreItem.itemId,
      price: prismaStoreItem.price,
      isDiscounted: prismaStoreItem.isDiscounted,
      createdAt: prismaStoreItem.createdAt,
      updatedAt: prismaStoreItem.updatedAt,
      item: prismaStoreItem.item
        ? ItemMapper.toDomain(prismaStoreItem.item)
        : undefined,
    });
  }
}
