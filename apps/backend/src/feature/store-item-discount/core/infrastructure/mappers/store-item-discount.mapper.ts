import { StoreItemDiscount as PrismaStoreItemDiscount } from 'prisma/generated/prisma/client';
import { StoreItemDiscount } from '../../domain/entities/store-item-discount.entity';

export class StoreItemDiscountMapper {
  static toDomain(
    prismaDiscount: PrismaStoreItemDiscount,
  ): StoreItemDiscount {
    return new StoreItemDiscount({
      id: prismaDiscount.id,
      storeItemId: prismaDiscount.storeItemId,
      discount: prismaDiscount.discount,
      startedAt: prismaDiscount.startedAt,
      endedAt: prismaDiscount.endedAt,
      createdAt: prismaDiscount.createdAt,
      updatedAt: prismaDiscount.updatedAt,
    });
  }
}
