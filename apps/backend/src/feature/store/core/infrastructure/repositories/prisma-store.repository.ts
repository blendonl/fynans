import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../common/prisma/prisma.service';
import {
  IStoreRepository,
  PaginatedResult,
} from '../../domain/repositories/store.repository.interface';
import { Store } from '../../domain/entities/store.entity';
import { Pagination } from '../../../../transaction/core/application/dto/pagination.dto';
import { StoreMapper } from '../mappers/store.mapper';
import { getVisibleUserIds } from '../../../../../common/helpers/family-visibility.helper';

@Injectable()
export class PrismaStoreRepository implements IStoreRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Partial<Store>): Promise<Store> {
    const store = await this.prisma.store.create({
      data: {
        name: data.name!,
        location: data.location!,
      },
    });

    return StoreMapper.toDomain(store);
  }

  async findById(id: string): Promise<Store | null> {
    const store = await this.prisma.store.findUnique({
      where: { id },
    });

    return store ? StoreMapper.toDomain(store) : null;
  }

  async findByNameAndLocation(
    name: string,
    location: string,
  ): Promise<Store | null> {
    const store = await this.prisma.store.findFirst({
      where: {
        name,
        location,
      },
    });

    return store ? StoreMapper.toDomain(store) : null;
  }

  async findBySimilarName(name: string): Promise<Store | null> {
    const store = await this.prisma.store.findFirst({
      where: {
        name: {
          contains: name,
          mode: 'insensitive',
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return store ? StoreMapper.toDomain(store) : null;
  }

  async findAll(
    userId: string,
    filters?: { search?: string },
    pagination?: Pagination,
  ): Promise<PaginatedResult<Store>> {
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

    const [stores, total] = await Promise.all([
      this.prisma.store.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: pagination?.skip,
        take: pagination?.take,
      }),
      this.prisma.store.count({ where }),
    ]);

    return {
      data: stores.map(StoreMapper.toDomain),
      total,
    };
  }

  async linkToUser(storeId: string, userId: string): Promise<void> {
    await this.prisma.userStore.upsert({
      where: { userId_storeId: { userId, storeId } },
      create: { userId, storeId },
      update: {},
    });
  }

  async update(id: string, data: Partial<Store>): Promise<Store> {
    const updateData: any = {};

    if (data.name !== undefined) {
      updateData.name = data.name;
    }

    if (data.location !== undefined) {
      updateData.location = data.location;
    }

    const store = await this.prisma.store.update({
      where: { id },
      data: updateData,
    });

    return StoreMapper.toDomain(store);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.store.delete({
      where: { id },
    });
  }
}
