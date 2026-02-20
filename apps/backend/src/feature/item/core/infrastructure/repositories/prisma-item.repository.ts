import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../common/prisma/prisma.service';
import {
  IItemRepository,
  PaginatedResult,
  ItemWithStoresRow,
} from '../../domain/repositories/item.repository.interface';
import { Item } from '../../domain/entities/item.entity';
import { Pagination } from '~common/dto/pagination.dto';
import { ItemMapper } from '../mappers/item.mapper';
import { getVisibleUserIds } from '../../../../../common/helpers/family-visibility.helper';

@Injectable()
export class PrismaItemRepository implements IItemRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Partial<Item>): Promise<Item> {
    const item = await this.prisma.item.create({
      data: {
        name: data.name!,
        categoryId: data.categoryId!,
        nameEn: data.nameEn,
      },
      include: {
        category: true,
      },
    });

    return ItemMapper.toDomain(item);
  }

  async findById(id: string): Promise<Item | null> {
    const item = await this.prisma.item.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    return item ? ItemMapper.toDomain(item) : null;
  }

  async findByName(name: string): Promise<Item | null> {
    const item = await this.prisma.item.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive',
        },
      },
      include: {
        category: true,
      },
    });

    return item ? ItemMapper.toDomain(item) : null;
  }

  async findBySimilarName(
    name: string,
    threshold = 0.3,
  ): Promise<Item | null> {
    const rows = await this.prisma.$queryRaw<
      Array<{
        id: string;
        category_id: string;
        name: string;
        name_en: string | null;
        created_at: Date;
        updated_at: Date;
        sim: number;
      }>
    >`
      SELECT *, similarity(name, ${name}) AS sim
      FROM item
      WHERE similarity(name, ${name}) > ${threshold}
      ORDER BY sim DESC
      LIMIT 1
    `;

    if (!rows.length) return null;

    const row = rows[0];
    return new Item({
      id: row.id,
      categoryId: row.category_id,
      name: row.name,
      nameEn: row.name_en ?? undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }

  async findByNameAndCategory(
    name: string,
    categoryId: string,
  ): Promise<Item | null> {
    const item = await this.prisma.item.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive',
        },
        categoryId,
      },
      include: {
        category: true,
      },
    });

    return item ? ItemMapper.toDomain(item) : null;
  }

  async findByCategoryId(
    userId: string,
    categoryId: string,
    pagination?: Pagination,
  ): Promise<PaginatedResult<Item>> {
    const visibleUserIds = await getVisibleUserIds(this.prisma, userId);
    const where = {
      categoryId,
      users: { some: { userId: { in: visibleUserIds } } },
    };

    const [items, total] = await Promise.all([
      this.prisma.item.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: pagination?.skip,
        take: pagination?.take,
        include: {
          category: true,
        },
      }),
      this.prisma.item.count({ where }),
    ]);

    return {
      data: items.map(ItemMapper.toDomain),
      total,
      page: pagination?.page ?? 1,
      limit: pagination?.limit ?? 10,
    };
  }

  async findAll(
    userId: string,
    filters?: { search?: string },
    pagination?: Pagination,
  ): Promise<PaginatedResult<Item>> {
    const visibleUserIds = await getVisibleUserIds(this.prisma, userId);
    const where: any = {
      users: { some: { userId: { in: visibleUserIds } } },
    };

    if (filters?.search) {
      where.name = {
        contains: filters.search,
        mode: 'insensitive',
      };
    }

    const [items, total] = await Promise.all([
      this.prisma.item.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: pagination?.skip,
        take: pagination?.take,
        include: {
          category: true,
        },
      }),
      this.prisma.item.count({ where }),
    ]);

    return {
      data: items.map(ItemMapper.toDomain),
      total,
      page: pagination?.page ?? 1,
      limit: pagination?.limit ?? 10,
    };
  }

  async searchWithStores(
    userId: string,
    search?: string,
    pagination?: Pagination,
  ): Promise<PaginatedResult<ItemWithStoresRow>> {
    const limit = pagination?.take ?? 20;
    const offset = pagination?.skip ?? 0;
    const searchParam = search?.trim() || null;

    const rows = await this.prisma.$queryRaw<
      (ItemWithStoresRow & { total: bigint })[]
    >`
      WITH visible_users AS (
        SELECT ${userId} AS user_id
        UNION
        SELECT fm2.user_id
        FROM family_member fm1
        JOIN family_member fm2 ON fm2.family_id = fm1.family_id
        WHERE fm1.user_id = ${userId}
      ),
      matched_items AS (
        SELECT DISTINCT i.id, i.name, i.category_id AS "categoryId",
          COUNT(*) OVER()::bigint AS total
        FROM item i
        JOIN user_item ui ON ui.item_id = i.id
        WHERE ui.user_id IN (SELECT user_id FROM visible_users)
          AND (${searchParam}::text IS NULL OR i.name ILIKE '%' || ${searchParam} || '%')
        ORDER BY i.name
        LIMIT ${limit} OFFSET ${offset}
      )
      SELECT
        mi.id,
        mi.name,
        mi."categoryId",
        mi.total,
        COALESCE(
          json_agg(
            json_build_object('storeId', s.id, 'storeName', s.name, 'price', si.price::float)
          ) FILTER (WHERE s.id IS NOT NULL),
          '[]'::json
        ) AS stores
      FROM matched_items mi
      LEFT JOIN store_item si ON si.item_id = mi.id
      LEFT JOIN store s ON s.id = si.store_id
      GROUP BY mi.id, mi.name, mi."categoryId", mi.total
      ORDER BY mi.name
    `;

    return {
      data: rows,
      total: Number(rows[0]?.total ?? 0),
      page: pagination?.page ?? 1,
      limit: pagination?.limit ?? 10,
    };
  }

  async linkToUser(itemId: string, userId: string): Promise<void> {
    await this.prisma.userItem.upsert({
      where: { userId_itemId: { userId, itemId } },
      create: { userId, itemId },
      update: {},
    });
  }

  async update(id: string, data: Partial<Item>): Promise<Item> {
    const updateData: any = {};

    if (data.name !== undefined) {
      updateData.name = data.name;
    }

    if (data.categoryId !== undefined) {
      updateData.categoryId = data.categoryId;
    }

    if (data.nameEn !== undefined) {
      updateData.nameEn = data.nameEn;
    }

    const item = await this.prisma.item.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
      },
    });

    return ItemMapper.toDomain(item);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.item.delete({
      where: { id },
    });
  }
}
