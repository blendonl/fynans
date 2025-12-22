import { StoreItemCategory as PrismaStoreItemCategory } from 'prisma/generated/prisma/client';
import { StoreItemCategory } from '../../domain/entities/store-item-category.entity';

export class StoreItemCategoryMapper {
  static toDomain(prismaCategory: PrismaStoreItemCategory): StoreItemCategory {
    return new StoreItemCategory({
      id: prismaCategory.id,
      parentId: prismaCategory.parentId,
      name: prismaCategory.name,
      createdAt: prismaCategory.createdAt,
      updatedAt: prismaCategory.updatedAt,
    });
  }

  static toPersistence(category: StoreItemCategory) {
    return {
      id: category.id,
      parentId: category.parentId,
      name: category.name,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }
}
