import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../common/prisma/prisma.service';
import {
  IStoreItemRepository,
  PaginatedResult,
  ItemWithPricesRow,
} from '../../domain/repositories/store-item.repository.interface';
import { StoreItem } from '../../domain/entities/store-item.entity';
import { Pagination } from '~common/dto/pagination.dto';
import { StoreItemMapper } from '../mappers/store-item.mapper';
import { Decimal } from 'prisma/generated/prisma/internal/prismaNamespace';
import { getVisibleUserIds } from '../../../../../common/helpers/family-visibility.helper';

const STORE_ITEM_INCLUDE = { item: { include: { sizes: true } } } as const;

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
      include: STORE_ITEM_INCLUDE,
    });

    return StoreItemMapper.toDomain(item);
  }

  async findById(id: string): Promise<StoreItem | null> {
    const item = await this.prisma.storeItem.findUnique({
      where: { id },
      include: STORE_ITEM_INCLUDE,
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
      include: STORE_ITEM_INCLUDE,
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
        include: STORE_ITEM_INCLUDE,
      }),
      this.prisma.storeItem.count({ where }),
    ]);

    return {
      data: items.map(StoreItemMapper.toDomain),
      total,
    };
  }

  async findByItemId(
    userId: string,
    itemId: string,
    pagination?: Pagination,
  ): Promise<PaginatedResult<StoreItem>> {
    const visibleUserIds = await getVisibleUserIds(this.prisma, userId);
    const where = {
      itemId,
      users: { some: { userId: { in: visibleUserIds } } },
    };

    const [items, total] = await Promise.all([
      this.prisma.storeItem.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: pagination?.skip,
        take: pagination?.take,
        include: { ...STORE_ITEM_INCLUDE, store: true },
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
        include: STORE_ITEM_INCLUDE,
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

  async searchWithPrices(
    userId: string,
    search?: string,
    pagination?: Pagination,
  ): Promise<PaginatedResult<ItemWithPricesRow>> {
    const limit = pagination?.take ?? 20;
    const offset = pagination?.skip ?? 0;
    const searchParam = search?.trim() || null;

    const rows = await this.prisma.$queryRaw<
      (ItemWithPricesRow & { total: bigint })[]
    >`
      WITH visible_users AS (
        SELECT ${userId} AS user_id
        UNION
        SELECT fm2.user_id
        FROM family_member fm1
        JOIN family_member fm2 ON fm2.family_id = fm1.family_id
        WHERE fm1.user_id = ${userId}
      )
      SELECT
        i.id,
        i.name,
        i.category_id AS "categoryId",
        MIN(si.price)::float AS "minPrice",
        MAX(si.price)::float AS "maxPrice",
        COUNT(DISTINCT si.store_id)::int AS "storeCount",
        COUNT(*) OVER()::bigint AS total
      FROM store_item si
      JOIN item i ON i.id = si.item_id
      JOIN user_store_item usi ON usi.store_item_id = si.id
      WHERE usi.user_id IN (SELECT user_id FROM visible_users)
        AND (${searchParam}::text IS NULL OR i.name ILIKE '%' || ${searchParam} || '%')
      GROUP BY i.id, i.name, i.category_id
      ORDER BY i.name
      LIMIT ${limit} OFFSET ${offset}
    `;

    return {
      data: rows,
      total: Number(rows[0]?.total ?? 0),
    };
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
      include: STORE_ITEM_INCLUDE,
    });

    return StoreItemMapper.toDomain(item);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.storeItem.delete({
      where: { id },
    });
  }
}
