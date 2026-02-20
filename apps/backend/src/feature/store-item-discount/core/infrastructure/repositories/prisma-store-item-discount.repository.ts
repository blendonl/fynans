import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../common/prisma/prisma.service';
import {
  IStoreItemDiscountRepository,
  PaginatedResult,
} from '../../domain/repositories/store-item-discount.repository.interface';
import { StoreItemDiscount } from '../../domain/entities/store-item-discount.entity';
import { Pagination } from '~common/dto/pagination.dto';
import { StoreItemDiscountMapper } from '../mappers/store-item-discount.mapper';
import { Decimal } from 'prisma/generated/prisma/internal/prismaNamespace';

@Injectable()
export class PrismaStoreItemDiscountRepository
  implements IStoreItemDiscountRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: Partial<StoreItemDiscount>,
  ): Promise<StoreItemDiscount> {
    const discount = await this.prisma.storeItemDiscount.create({
      data: {
        id: data.id!,
        storeItemId: data.storeItemId!,
        discount: data.discount as Decimal,
        startedAt: data.startedAt ?? new Date(),
        endedAt: data.endedAt ?? null,
      },
    });

    return StoreItemDiscountMapper.toDomain(discount);
  }

  async findById(id: string): Promise<StoreItemDiscount | null> {
    const discount = await this.prisma.storeItemDiscount.findUnique({
      where: { id },
    });

    return discount ? StoreItemDiscountMapper.toDomain(discount) : null;
  }

  async findByStoreItemId(
    storeItemId: string,
    pagination?: Pagination,
  ): Promise<PaginatedResult<StoreItemDiscount>> {
    const [discounts, total] = await Promise.all([
      this.prisma.storeItemDiscount.findMany({
        where: { storeItemId },
        orderBy: { startedAt: 'desc' },
        skip: pagination?.skip,
        take: pagination?.take,
      }),
      this.prisma.storeItemDiscount.count({ where: { storeItemId } }),
    ]);

    return {
      data: discounts.map(StoreItemDiscountMapper.toDomain),
      total,
      page: pagination?.page ?? 1,
      limit: pagination?.limit ?? 10,
    };
  }

  async findActiveByStoreItemId(
    storeItemId: string,
  ): Promise<StoreItemDiscount | null> {
    const now = new Date();
    const discount = await this.prisma.storeItemDiscount.findFirst({
      where: {
        storeItemId,
        startedAt: { lte: now },
        OR: [{ endedAt: null }, { endedAt: { gt: now } }],
      },
      orderBy: { startedAt: 'desc' },
    });

    return discount ? StoreItemDiscountMapper.toDomain(discount) : null;
  }

  async update(
    id: string,
    data: Partial<StoreItemDiscount>,
  ): Promise<StoreItemDiscount> {
    const updateData: any = {};

    if (data.discount !== undefined) {
      updateData.discount = data.discount;
    }

    if (data.endedAt !== undefined) {
      updateData.endedAt = data.endedAt;
    }

    const discount = await this.prisma.storeItemDiscount.update({
      where: { id },
      data: updateData,
    });

    return StoreItemDiscountMapper.toDomain(discount);
  }

  async endDiscount(id: string): Promise<StoreItemDiscount> {
    const discount = await this.prisma.storeItemDiscount.update({
      where: { id },
      data: { endedAt: new Date() },
    });

    return StoreItemDiscountMapper.toDomain(discount);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.storeItemDiscount.delete({
      where: { id },
    });
  }
}
