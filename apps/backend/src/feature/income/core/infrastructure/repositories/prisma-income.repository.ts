import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../common/prisma/prisma.service';
import {
  IIncomeRepository,
  PaginatedResult,
} from '../../domain/repositories/income.repository.interface';
import { Income } from '../../domain/entities/income.entity';
import { Pagination } from '../../../../transaction/core/application/dto/pagination.dto';
import { IncomeMapper } from '../mappers/income.mapper';

@Injectable()
export class PrismaIncomeRepository implements IIncomeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Partial<Income>): Promise<Income> {
    const income = await this.prisma.income.create({
      data: {
        id: data.transactionId!,
        transactionId: data.transactionId!,
        storeId: data.storeId!,
        categoryId: data.categoryId!,
      },
      include: {
        transaction: true,
        category: true,
      },
    });

    return IncomeMapper.toDomain(income);
  }

  async findById(id: string): Promise<Income | null> {
    const income = await this.prisma.income.findUnique({
      where: { id },
      include: {
        transaction: true,
        category: true,
      },
    });

    return income ? IncomeMapper.toDomain(income) : null;
  }

  async findByTransactionId(transactionId: string): Promise<Income | null> {
    const income = await this.prisma.income.findUnique({
      where: { transactionId },
      include: {
        transaction: true,
        category: true,
      },
    });

    return income ? IncomeMapper.toDomain(income) : null;
  }

  async findByStoreId(
    storeId: string,
    pagination?: Pagination,
  ): Promise<PaginatedResult<Income>> {
    const [incomes, total] = await Promise.all([
      this.prisma.income.findMany({
        where: { storeId },
        include: {
          transaction: true,
          category: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: pagination?.skip,
        take: pagination?.take,
      }),
      this.prisma.income.count({ where: { storeId } }),
    ]);

    return {
      data: incomes.map(IncomeMapper.toDomain),
      total,
    };
  }

  async findAll(pagination?: Pagination): Promise<PaginatedResult<Income>> {
    const [incomes, total] = await Promise.all([
      this.prisma.income.findMany({
        include: {
          transaction: true,
          category: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: pagination?.skip,
        take: pagination?.take,
      }),
      this.prisma.income.count(),
    ]);

    return {
      data: incomes.map(IncomeMapper.toDomain),
      total,
    };
  }

  async update(id: string, data: Partial<Income>): Promise<Income> {
    const updateData: any = {};

    if (data.categoryId !== undefined) {
      updateData.categoryId = data.categoryId;
    }

    const income = await this.prisma.income.update({
      where: { id },
      data: updateData,
      include: {
        transaction: true,
        category: true,
      },
    });

    return IncomeMapper.toDomain(income);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.income.delete({
      where: { id },
    });
  }
}
