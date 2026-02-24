import { ItemCategory as PrismaItemCategory } from 'prisma/generated/prisma/client';
import { StoreItemCategory } from '../../domain/entities/store-item-category.entity';

export class StoreItemCategoryMapper {
  static toDomain(prismaCategory: PrismaItemCategory): StoreItemCategory {
    return new StoreItemCategory({
      id: prismaCategory.id,
      parentId: prismaCategory.parentId,
      name: prismaCategory.name,
      createdAt: prismaCategory.createdAt,
      updatedAt: prismaCategory.updatedAt,
    });
  }
}
