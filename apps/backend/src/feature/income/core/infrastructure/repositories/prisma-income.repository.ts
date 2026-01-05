import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../common/prisma/prisma.service';
import {
  IIncomeRepository,
  PaginatedResult,
  IncomeFilters as IncomeFiltersInterface,
} from '../../domain/repositories/income.repository.interface';
import { Income } from '../../domain/entities/income.entity';
import { Pagination } from '../../../../transaction/core/application/dto/pagination.dto';
import { IncomeMapper } from '../mappers/income.mapper';
import { Prisma } from 'prisma/generated/prisma/client';
import { Decimal } from 'prisma/generated/prisma/internal/prismaNamespace';

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
        transaction: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        category: true,
      },
    });

    return IncomeMapper.toDomain(income);
  }

  async findById(id: string): Promise<Income | null> {
    const income = await this.prisma.income.findUnique({
      where: { id },
      include: {
        transaction: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        category: true,
      },
    });

    return income ? IncomeMapper.toDomain(income) : null;
  }

  async findByTransactionId(transactionId: string): Promise<Income | null> {
    const income = await this.prisma.income.findUnique({
      where: { transactionId },
      include: {
        transaction: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
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
          transaction: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
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

  async findAll(
    filters?: IncomeFiltersInterface,
    pagination?: Pagination,
  ): Promise<PaginatedResult<Income>> {
    const where = this.buildWhereClause(filters);

    const [incomes, total] = await Promise.all([
      this.prisma.income.findMany({
        where,
        include: {
          transaction: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          category: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: pagination?.skip,
        take: pagination?.take,
      }),
      this.prisma.income.count({ where }),
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
        transaction: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
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

  private buildWhereClause(
    filters?: IncomeFiltersInterface,
  ): Prisma.IncomeWhereInput {
    if (!filters) return {};

    const where: Prisma.IncomeWhereInput = {};

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.storeId) {
      where.storeId = filters.storeId;
    }

    if (
      filters.userId ||
      filters.familyId ||
      filters.scope ||
      filters.valueMin !== undefined ||
      filters.valueMax !== undefined
    ) {
      where.transaction = {};

      if (filters.userId) {
        where.transaction.userId = filters.userId;
      }

      if (filters.familyId) {
        where.transaction.familyId = filters.familyId;
      }

      if (filters.scope) {
        where.transaction.scope = filters.scope;
      }

      if (filters.valueMin !== undefined || filters.valueMax !== undefined) {
        where.transaction.value = {};
        if (filters.valueMin !== undefined) {
          where.transaction.value.gte = new Decimal(filters.valueMin);
        }
        if (filters.valueMax !== undefined) {
          where.transaction.value.lte = new Decimal(filters.valueMax);
        }
      }
    }

    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        where.createdAt.gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        where.createdAt.lte = filters.dateTo;
      }
    }

    return where;
  }
}
