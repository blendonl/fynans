import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../common/prisma/prisma.service';
import {
  IStoreItemRepository,
  PaginatedResult,
} from '../../domain/repositories/store-item.repository.interface';
import { StoreItem } from '../../domain/entities/store-item.entity';
import { Pagination } from '../../../../transaction/core/application/dto/pagination.dto';
import { StoreItemMapper } from '../mappers/store-item.mapper';
import { Decimal } from 'prisma/generated/prisma/internal/prismaNamespace';
import { getVisibleUserIds } from '../../../../../common/helpers/family-visibility.helper';

@Injectable()
export class PrismaStoreItemRepository implements IStoreItemRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Partial<StoreItem>): Promise<StoreItem> {
    const item = await this.prisma.storeItem.create({
      data: {
        storeId: data.storeId!,
        itemId: data.itemId!,
        price: new Decimal(data.price?.toString() || '0'),
        isDiscounted: data.isDiscounted ?? false,
      },
      include: { item: true },
    });

    return StoreItemMapper.toDomain(item);
  }

  async findById(id: string): Promise<StoreItem | null> {
    const item = await this.prisma.storeItem.findUnique({
      where: { id },
      include: { item: true },
    });

    return item ? StoreItemMapper.toDomain(item) : null;
  }

  async findByStoreAndName(
    storeId: string,
    name: string,
  ): Promise<StoreItem | null> {
    const item = await this.prisma.storeItem.findFirst({
      where: {
        storeId,
        item: {
          name,
        },
      },
      orderBy: { createdAt: 'desc' },
      include: { item: true },
    });

    return item ? StoreItemMapper.toDomain(item) : null;
  }

  async findByStoreAndItemId(
    storeId: string,
    itemId: string,
  ): Promise<StoreItem | null> {
    const item = await this.prisma.storeItem.findFirst({
      where: {
        storeId,
        itemId,
      },
      orderBy: { createdAt: 'desc' },
      include: { item: true },
    });

    return item ? StoreItemMapper.toDomain(item) : null;
  }

  async findByStoreId(
    userId: string,
    storeId: string,
    search?: string,
    pagination?: Pagination,
  ): Promise<PaginatedResult<StoreItem>> {
    const visibleUserIds = await getVisibleUserIds(this.prisma, userId);
    const where: any = {
      storeId,
      users: { some: { userId: { in: visibleUserIds } } },
    };
    if (search) {
      where.item = { name: { contains: search, mode: 'insensitive' } };
    }

    const [items, total] = await Promise.all([
      this.prisma.storeItem.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: pagination?.skip,
        take: pagination?.take,
        include: { item: true },
      }),
      this.prisma.storeItem.count({ where }),
    ]);

    return {
      data: items.map(StoreItemMapper.toDomain),
      total,
    };
  }

  async findAll(
    userId: string,
    pagination?: Pagination,
  ): Promise<PaginatedResult<StoreItem>> {
    const visibleUserIds = await getVisibleUserIds(this.prisma, userId);
    const where = {
      users: { some: { userId: { in: visibleUserIds } } },
    };

    const [items, total] = await Promise.all([
      this.prisma.storeItem.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: pagination?.skip,
        take: pagination?.take,
        include: { item: true },
      }),
      this.prisma.storeItem.count({ where }),
    ]);

    return {
      data: items.map(StoreItemMapper.toDomain),
      total,
    };
  }

  async linkToUser(storeItemId: string, userId: string): Promise<void> {
    await this.prisma.userStoreItem.upsert({
      where: { userId_storeItemId: { userId, storeItemId } },
      create: { userId, storeItemId },
      update: {},
    });
  }

  async update(id: string, data: Partial<StoreItem>): Promise<StoreItem> {
    const updateData: any = {};

    if (data.price !== undefined) {
      updateData.price = new Decimal(data.price.toString());
    }

    if (data.isDiscounted !== undefined) {
      updateData.isDiscounted = data.isDiscounted;
    }

    const item = await this.prisma.storeItem.update({
      where: { id },
      data: updateData,
      include: { item: true },
    });

    return StoreItemMapper.toDomain(item);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.storeItem.delete({
      where: { id },
    });
  }
}
