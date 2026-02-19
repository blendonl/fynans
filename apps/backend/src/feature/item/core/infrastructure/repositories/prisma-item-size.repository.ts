import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../common/prisma/prisma.service';
import { IItemSizeRepository } from '../../domain/repositories/item-size.repository.interface';
import { ItemSize } from '../../domain/entities/item-size.entity';
import { Decimal } from 'prisma/generated/prisma/internal/prismaNamespace';

@Injectable()
export class PrismaItemSizeRepository implements IItemSizeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { itemId: string; value: number; unit: string }): Promise<ItemSize> {
    const decimalValue = new Decimal(data.value);
    const record = await this.prisma.itemSize.upsert({
      where: {
        itemId_value_unit: {
          itemId: data.itemId,
          value: decimalValue,
          unit: data.unit,
        },
      },
      create: {
        itemId: data.itemId,
        value: decimalValue,
        unit: data.unit,
      },
      update: {},
    });

    return this.toDomain(record);
  }

  async findByItemAndSize(
    itemId: string,
    value: number,
    unit: string,
  ): Promise<ItemSize | null> {
    const record = await this.prisma.itemSize.findUnique({
      where: {
        itemId_value_unit: {
          itemId,
          value: new Decimal(value),
          unit,
        },
      },
    });

    return record ? this.toDomain(record) : null;
  }

  async findByItemId(itemId: string): Promise<ItemSize[]> {
    const records = await this.prisma.itemSize.findMany({
      where: { itemId },
    });

    return records.map((r) => this.toDomain(r));
  }

  private toDomain(record: {
    id: string;
    itemId: string;
    value: Decimal;
    unit: string;
    createdAt: Date;
    updatedAt: Date;
  }): ItemSize {
    return new ItemSize({
      id: record.id,
      itemId: record.itemId,
      value: record.value,
      unit: record.unit,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }
}
