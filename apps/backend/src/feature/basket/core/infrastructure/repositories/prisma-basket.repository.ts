import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../common/prisma/prisma.service';
import { IBasketRepository } from '../../domain/repositories/basket.repository.interface';
import { Basket } from '../../domain/entities/basket.entity';
import { BasketItem } from '../../domain/entities/basket-item.entity';
import { BasketMapper } from '../mappers/basket.mapper';

const BASKET_INCLUDE = {
  items: {
    include: {
      category: true,
    },
    orderBy: {
      createdAt: 'desc' as const,
    },
  },
  family: true,
} as const;

@Injectable()
export class PrismaBasketRepository implements IBasketRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<Basket[]> {
    const baskets = await this.prisma.basket.findMany({
      where: {
        OR: [
          { userId, scope: 'PERSONAL' },
          {
            scope: 'FAMILY',
            family: {
              members: {
                some: { userId },
              },
            },
          },
        ],
      },
      include: BASKET_INCLUDE,
    });

    return baskets.map(BasketMapper.toDomain);
  }

  async findById(id: string): Promise<Basket | null> {
    const basket = await this.prisma.basket.findUnique({
      where: { id },
      include: BASKET_INCLUDE,
    });

    return basket ? BasketMapper.toDomain(basket) : null;
  }

  async upsertPersonal(userId: string): Promise<Basket> {
    const basket = await this.prisma.basket.upsert({
      where: {
        personal_basket: {
          userId,
          scope: 'PERSONAL',
        },
      },
      create: {
        userId,
        scope: 'PERSONAL',
      },
      update: {},
      include: BASKET_INCLUDE,
    });

    return BasketMapper.toDomain(basket);
  }

  async upsertFamily(familyId: string, userId: string): Promise<Basket> {
    const basket = await this.prisma.basket.upsert({
      where: {
        family_basket: {
          familyId,
          scope: 'FAMILY',
        },
      },
      create: {
        userId,
        familyId,
        scope: 'FAMILY',
      },
      update: {},
      include: BASKET_INCLUDE,
    });

    return BasketMapper.toDomain(basket);
  }

  async addItem(data: {
    basketId: string;
    name: string;
    quantity: number;
    price?: number | null;
    categoryId?: string | null;
    notes?: string | null;
    addedBy: string;
  }): Promise<BasketItem> {
    const item = await this.prisma.basketItem.create({
      data: {
        basketId: data.basketId,
        name: data.name,
        quantity: data.quantity,
        price: data.price ?? null,
        categoryId: data.categoryId ?? null,
        notes: data.notes ?? null,
        addedBy: data.addedBy,
      },
      include: {
        category: true,
      },
    });

    return BasketMapper.itemToDomain(item);
  }

  async updateItem(
    itemId: string,
    data: {
      name?: string;
      quantity?: number;
      price?: number | null;
      categoryId?: string | null;
      notes?: string | null;
    },
  ): Promise<BasketItem> {
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.quantity !== undefined) updateData.quantity = data.quantity;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
    if (data.notes !== undefined) updateData.notes = data.notes;

    const item = await this.prisma.basketItem.update({
      where: { id: itemId },
      data: updateData,
      include: {
        category: true,
      },
    });

    return BasketMapper.itemToDomain(item);
  }

  async removeItem(itemId: string): Promise<void> {
    await this.prisma.basketItem.delete({
      where: { id: itemId },
    });
  }

  async findItemById(itemId: string): Promise<BasketItem | null> {
    const item = await this.prisma.basketItem.findUnique({
      where: { id: itemId },
      include: {
        category: true,
      },
    });

    return item ? BasketMapper.itemToDomain(item) : null;
  }

  async findItemsByIds(itemIds: string[]): Promise<BasketItem[]> {
    const items = await this.prisma.basketItem.findMany({
      where: { id: { in: itemIds } },
      include: {
        category: true,
      },
    });

    return items.map(BasketMapper.itemToDomain);
  }

  async removeItemsByIds(itemIds: string[]): Promise<void> {
    await this.prisma.basketItem.deleteMany({
      where: { id: { in: itemIds } },
    });
  }
}
