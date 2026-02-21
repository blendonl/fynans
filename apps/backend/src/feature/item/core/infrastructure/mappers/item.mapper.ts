import { Item as PrismaItem, ItemSize as PrismaItemSize } from 'prisma/generated/prisma/client';
import { Item } from '../../domain/entities/item.entity';
import { ItemSize } from '../../domain/entities/item-size.entity';

export class ItemMapper {
  static toDomain(prismaItem: PrismaItem & { sizes?: PrismaItemSize[] }): Item {
    return new Item({
      id: prismaItem.id,
      categoryId: prismaItem.categoryId,
      name: prismaItem.name,
      nameEn: prismaItem.nameEn ?? undefined,
      sizes: prismaItem.sizes?.map(
        (s) =>
          new ItemSize({
            id: s.id,
            itemId: s.itemId,
            value: s.value,
            unit: s.unit,
            createdAt: s.createdAt,
            updatedAt: s.updatedAt,
          }),
      ),
      createdAt: prismaItem.createdAt,
      updatedAt: prismaItem.updatedAt,
    });
  }

  static toPersistence(item: Item) {
    return {
      id: item.id,
      categoryId: item.categoryId,
      name: item.name,
      nameEn: item.nameEn,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }
}
