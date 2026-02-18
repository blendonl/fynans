import { Prisma } from 'prisma/generated/prisma/client';
import { Basket, BasketScope } from '../../domain/entities/basket.entity';
import { BasketItem } from '../../domain/entities/basket-item.entity';

interface PrismaBasketItem extends Prisma.BasketItemGetPayload<{
  include: {
    category: true;
  };
}> {}

interface PrismaBasket extends Prisma.BasketGetPayload<{
  include: {
    items: {
      include: {
        category: true;
      };
    };
    family: true;
  };
}> {}

export class BasketMapper {
  static toDomain(prismaBasket: PrismaBasket): Basket {
    return new Basket({
      id: prismaBasket.id,
      userId: prismaBasket.userId,
      familyId: prismaBasket.familyId,
      familyName: prismaBasket.family?.name,
      scope: prismaBasket.scope as BasketScope,
      items: prismaBasket.items.map(BasketMapper.itemToDomain),
      createdAt: prismaBasket.createdAt,
      updatedAt: prismaBasket.updatedAt,
    });
  }

  static itemToDomain(prismaItem: PrismaBasketItem): BasketItem {
    return new BasketItem({
      id: prismaItem.id,
      basketId: prismaItem.basketId,
      name: prismaItem.name,
      quantity: Number(prismaItem.quantity),
      price: prismaItem.price !== null ? Number(prismaItem.price) : null,
      categoryId: prismaItem.categoryId,
      categoryName: prismaItem.category?.name ?? null,
      notes: prismaItem.notes,
      addedBy: prismaItem.addedBy,
      createdAt: prismaItem.createdAt,
      updatedAt: prismaItem.updatedAt,
    });
  }
}
