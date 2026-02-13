import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../common/prisma/prisma.service';
import {
  IItemRepository,
  PaginatedResult,
} from '../../domain/repositories/item.repository.interface';
import { Item } from '../../domain/entities/item.entity';
import { Pagination } from '../../../../transaction/core/application/dto/pagination.dto';
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
