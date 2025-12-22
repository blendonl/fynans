import { StoreItem as PrismaStoreItem } from 'prisma/generated/prisma/client';
import { StoreItem } from '../../domain/entities/store-item.entity';

export class StoreItemMapper {
  static toDomain(prismaStoreItem: PrismaStoreItem): StoreItem {
    return new StoreItem({
      id: prismaStoreItem.id,
      storeId: prismaStoreItem.storeId,
      name: prismaStoreItem.name,
      price: prismaStoreItem.price,
      isDiscounted: prismaStoreItem.isDiscounted,
      categoryId: prismaStoreItem.categoryId,
      createdAt: prismaStoreItem.createdAt,
      updatedAt: prismaStoreItem.updatedAt,
    });
  }

  static toPersistence(storeItem: StoreItem) {
    return {
      id: storeItem.id,
      storeId: storeItem.storeId,
      name: storeItem.name,
      price: storeItem.price,
      isDiscounted: storeItem.isDiscounted,
      createdAt: storeItem.createdAt,
      updatedAt: storeItem.updatedAt,
    };
  }
}
