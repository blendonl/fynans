import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../common/prisma/prisma.service';
import {
  ITransactionRepository,
  PaginatedResult,
} from '../../domain/repositories/transaction.repository.interface';
import { Transaction } from '../../domain/entities/transaction.entity';
import { TransactionFilters } from '../../application/dto/transaction-filters.dto';
import { Pagination } from '../../application/dto/pagination.dto';
import { TransactionStatistics } from '../../application/dto/transaction-statistics.dto';
import { TransactionMapper } from '../mappers/transaction.mapper';
import {
  Prisma,
  TransactionType as PrismaTransactionType,
  TransactionScope,
} from 'prisma/generated/prisma/client';
import { Decimal } from 'prisma/generated/prisma/internal/prismaNamespace';

@Injectable()
export class PrismaTransactionRepository implements ITransactionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Partial<Transaction>): Promise<Transaction> {
    const transaction = await this.prisma.transaction.create({
      data: {
        userId: data.userId!,
        familyId: data.familyId,
        type: data.type as PrismaTransactionType,
        scope: data.familyId
          ? TransactionScope.FAMILY
          : TransactionScope.PERSONAL,
        recordedAt: data.recordedAt || new Date(),
        value: new Decimal(data.value?.toString() || '0'),
      },
      include: {
        user: true,
        expense: true,
        income: true,
      },
    });

    return TransactionMapper.toDomain(transaction);
  }

  async findById(id: string): Promise<Transaction | null> {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: {
        user: true,
        expense: true,
        income: true,
      },
    });

    return transaction ? TransactionMapper.toDomain(transaction) : null;
  }

  async findByUserId(
    userId: string,
    filters?: TransactionFilters,
    pagination?: Pagination,
  ): Promise<PaginatedResult<Transaction>> {
    const where: Prisma.TransactionWhereInput = {
      userId,
      ...this.buildWhereClause(filters),
    };

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        include: {
          user: true,
          expense: true,
          income: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: pagination?.skip,
        take: pagination?.take,
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      data: transactions.map(TransactionMapper.toDomain),
      total,
    };
  }

  async findAll(
    filters?: TransactionFilters,
    pagination?: Pagination,
  ): Promise<PaginatedResult<Transaction>> {
    const where = this.buildWhereClause(filters);

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        include: {
          user: true,
          expense: true,
          income: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: pagination?.skip,
        take: pagination?.take,
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      data: transactions.map(TransactionMapper.toDomain),
      total,
    };
  }

  async update(id: string, data: Partial<Transaction>): Promise<Transaction> {
    const updateData: Prisma.TransactionUpdateInput = {};

    if (data.type !== undefined) {
      updateData.type = data.type as PrismaTransactionType;
    }

    if (data.value !== undefined) {
      updateData.value = new Decimal(data.value.toString());
    }

    const transaction = await this.prisma.transaction.update({
      where: { id },
      data: updateData,
      include: {
        user: true,
        expense: true,
        income: true,
      },
    });

    return TransactionMapper.toDomain(transaction);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.transaction.delete({
      where: { id },
    });
  }

  async getStatistics(
    userId?: string,
    filters?: TransactionFilters,
  ): Promise<TransactionStatistics> {
    const where: Prisma.TransactionWhereInput = {
      ...(userId && { userId }),
      ...this.buildWhereClause(filters),
    };

    const [incomeResult, expenseResult, count] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: {
          ...where,
          type: PrismaTransactionType.INCOME,
        },
        _sum: {
          value: true,
        },
      }),
      this.prisma.transaction.aggregate({
        where: {
          ...where,
          type: PrismaTransactionType.EXPENSE,
        },
        _sum: {
          value: true,
        },
      }),
      this.prisma.transaction.count({ where }),
    ]);

    const totalIncome = incomeResult._sum.value?.toNumber() || 0;
    const totalExpense = expenseResult._sum.value?.toNumber() || 0;
    const balance = totalIncome - totalExpense;

    return new TransactionStatistics(totalIncome, totalExpense, balance, count);
  }

  private buildWhereClause(
    filters?: TransactionFilters,
  ): Prisma.TransactionWhereInput {
    if (!filters) return {};

    const where: Prisma.TransactionWhereInput = {};

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.familyId) {
      where.familyId = filters.familyId;
    }

    if (filters.scope) {
      where.scope = filters.scope;
    }

    if (filters.type) {
      where.type = filters.type as PrismaTransactionType;
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

    if (filters.valueMin !== undefined || filters.valueMax !== undefined) {
      where.value = {};
      if (filters.valueMin !== undefined) {
        where.value.gte = new Decimal(filters.valueMin);
      }
      if (filters.valueMax !== undefined) {
        where.value.lte = new Decimal(filters.valueMax);
      }
    }

    return where;
  }
}
