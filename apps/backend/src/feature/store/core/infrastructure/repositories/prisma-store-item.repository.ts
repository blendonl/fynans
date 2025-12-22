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

@Injectable()
export class PrismaStoreItemRepository implements IStoreItemRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Partial<StoreItem>): Promise<StoreItem> {
    const item = await this.prisma.storeItem.create({
      data: {
        storeId: data.storeId!,
        name: data.name!,
        price: new Decimal(data.price?.toString() || '0'),
        categoryId: data.categoryId!,
        isDiscounted: data.isDiscounted ?? false,
      },
    });

    return StoreItemMapper.toDomain(item);
  }

  async findById(id: string): Promise<StoreItem | null> {
    const item = await this.prisma.storeItem.findUnique({
      where: { id },
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
        name,
      },
      orderBy: { createdAt: 'desc' }, // Get most recent if multiple
    });

    return item ? StoreItemMapper.toDomain(item) : null;
  }

  async findByStoreId(
    storeId: string,
    pagination?: Pagination,
  ): Promise<PaginatedResult<StoreItem>> {
    const [items, total] = await Promise.all([
      this.prisma.storeItem.findMany({
        where: { storeId },
        orderBy: { name: 'asc' },
        skip: pagination?.skip,
        take: pagination?.take,
      }),
      this.prisma.storeItem.count({ where: { storeId } }),
    ]);

    return {
      data: items.map(StoreItemMapper.toDomain),
      total,
    };
  }

  async findAll(pagination?: Pagination): Promise<PaginatedResult<StoreItem>> {
    const [items, total] = await Promise.all([
      this.prisma.storeItem.findMany({
        orderBy: { name: 'asc' },
        skip: pagination?.skip,
        take: pagination?.take,
      }),
      this.prisma.storeItem.count(),
    ]);

    return {
      data: items.map(StoreItemMapper.toDomain),
      total,
    };
  }

  async update(id: string, data: Partial<StoreItem>): Promise<StoreItem> {
    const updateData: any = {};

    if (data.name !== undefined) {
      updateData.name = data.name;
    }

    if (data.price !== undefined) {
      updateData.price = new Decimal(data.price.toString());
    }

    if (data.isDiscounted !== undefined) {
      updateData.isDiscounted = data.isDiscounted;
    }

    const item = await this.prisma.storeItem.update({
      where: { id },
      data: updateData,
    });

    return StoreItemMapper.toDomain(item);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.storeItem.delete({
      where: { id },
    });
  }
}
