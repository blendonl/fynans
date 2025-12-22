import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../common/prisma/prisma.service';
import {
  IStoreItemCategoryRepository,
  PaginatedResult,
} from '../../domain/repositories/store-item-category.repository.interface';
import { StoreItemCategory } from '../../domain/entities/store-item-category.entity';
import { Pagination } from '../../../../transaction/core/application/dto/pagination.dto';
import { StoreItemCategoryMapper } from '../mappers/store-item-category.mapper';

@Injectable()
export class PrismaStoreItemCategoryRepository
  implements IStoreItemCategoryRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Partial<StoreItemCategory>): Promise<StoreItemCategory> {
    const category = await this.prisma.storeItemCategory.create({
      data: {
        name: data.name!,
        parentId: data.parentId ?? null,
      },
    });

    return StoreItemCategoryMapper.toDomain(category);
  }

  async findById(id: string): Promise<StoreItemCategory | null> {
    const category = await this.prisma.storeItemCategory.findUnique({
      where: { id },
    });

    return category ? StoreItemCategoryMapper.toDomain(category) : null;
  }

  async findAll(
    pagination?: Pagination,
  ): Promise<PaginatedResult<StoreItemCategory>> {
    const [categories, total] = await Promise.all([
      this.prisma.storeItemCategory.findMany({
        orderBy: { name: 'asc' },
        skip: pagination?.skip,
        take: pagination?.take,
      }),
      this.prisma.storeItemCategory.count(),
    ]);

    return {
      data: categories.map(StoreItemCategoryMapper.toDomain),
      total,
    };
  }

  async findByParentId(
    parentId: string | null,
    pagination?: Pagination,
  ): Promise<PaginatedResult<StoreItemCategory>> {
    const [categories, total] = await Promise.all([
      this.prisma.storeItemCategory.findMany({
        where: { parentId },
        orderBy: { name: 'asc' },
        skip: pagination?.skip,
        take: pagination?.take,
      }),
      this.prisma.storeItemCategory.count({ where: { parentId } }),
    ]);

    return {
      data: categories.map(StoreItemCategoryMapper.toDomain),
      total,
    };
  }

  async findChildren(parentId: string): Promise<StoreItemCategory[]> {
    const categories = await this.prisma.storeItemCategory.findMany({
      where: { parentId },
      orderBy: { name: 'asc' },
    });

    return categories.map(StoreItemCategoryMapper.toDomain);
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

    const category = await this.prisma.storeItemCategory.update({
      where: { id },
      data: updateData,
    });

    return StoreItemCategoryMapper.toDomain(category);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.storeItemCategory.delete({
      where: { id },
    });
  }
}
