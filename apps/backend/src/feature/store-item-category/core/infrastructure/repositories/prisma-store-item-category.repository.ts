import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../common/prisma/prisma.service';
import {
  IStoreItemCategoryRepository,
  PaginatedResult,
} from '../../domain/repositories/store-item-category.repository.interface';
import { StoreItemCategory } from '../../domain/entities/store-item-category.entity';
import { Pagination } from '../../../../transaction/core/application/dto/pagination.dto';
import { StoreItemCategoryMapper } from '../mappers/store-item-category.mapper';
import { getVisibleUserIds } from '../../../../../common/helpers/family-visibility.helper';

@Injectable()
export class PrismaStoreItemCategoryRepository
  implements IStoreItemCategoryRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Partial<StoreItemCategory>): Promise<StoreItemCategory> {
    const category = await this.prisma.itemCategory.create({
      data: {
        name: data.name!,
        parentId: data.parentId ?? null,
      },
    });

    return StoreItemCategoryMapper.toDomain(category);
  }

  async findById(id: string): Promise<StoreItemCategory | null> {
    const category = await this.prisma.itemCategory.findUnique({
      where: { id },
    });

    return category ? StoreItemCategoryMapper.toDomain(category) : null;
  }

  async findByName(name: string): Promise<StoreItemCategory | null> {
    const category = await this.prisma.itemCategory.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    });

    return category ? StoreItemCategoryMapper.toDomain(category) : null;
  }

  async findAll(
    userId: string,
    pagination?: Pagination,
  ): Promise<PaginatedResult<StoreItemCategory>> {
    const visibleUserIds = await getVisibleUserIds(this.prisma, userId);
    const where = {
      users: { some: { userId: { in: visibleUserIds } } },
    };

    const [categories, total] = await Promise.all([
      this.prisma.itemCategory.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: pagination?.skip,
        take: pagination?.take,
      }),
      this.prisma.itemCategory.count({ where }),
    ]);

    return {
      data: categories.map(StoreItemCategoryMapper.toDomain),
      total,
    };
  }

  async findByParentId(
    userId: string,
    parentId: string | null,
    pagination?: Pagination,
  ): Promise<PaginatedResult<StoreItemCategory>> {
    const visibleUserIds = await getVisibleUserIds(this.prisma, userId);
    const where = {
      parentId,
      users: { some: { userId: { in: visibleUserIds } } },
    };

    const [categories, total] = await Promise.all([
      this.prisma.itemCategory.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: pagination?.skip,
        take: pagination?.take,
      }),
      this.prisma.itemCategory.count({ where }),
    ]);

    return {
      data: categories.map(StoreItemCategoryMapper.toDomain),
      total,
    };
  }

  async findChildren(parentId: string): Promise<StoreItemCategory[]> {
    const categories = await this.prisma.itemCategory.findMany({
      where: { parentId },
      orderBy: { name: 'asc' },
    });

    return categories.map(StoreItemCategoryMapper.toDomain);
  }

  async linkToUser(categoryId: string, userId: string): Promise<void> {
    await this.prisma.userItemCategory.upsert({
      where: { userId_categoryId: { userId, categoryId } },
      create: { userId, categoryId },
      update: {},
    });
  }

  async update(
    id: string,
    data: Partial<StoreItemCategory>,
  ): Promise<StoreItemCategory> {
    const updateData: any = {};

    if (data.name !== undefined) {
      updateData.name = data.name;
    }

    if (data.parentId !== undefined) {
      updateData.parentId = data.parentId;
    }

    const category = await this.prisma.itemCategory.update({
      where: { id },
      data: updateData,
    });

    return StoreItemCategoryMapper.toDomain(category);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.itemCategory.delete({
      where: { id },
    });
  }
}
