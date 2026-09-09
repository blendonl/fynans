import { Injectable } from '@nestjs/common';
import { DomainValidationException } from '~common/exceptions/domain.exceptions';
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
  TransactionStatus as PrismaTransactionStatus,
} from 'prisma/generated/prisma/client';
import { TransactionStatus } from '../../domain/value-objects/transaction-status.vo';
import { Decimal } from 'prisma/generated/prisma/internal/prismaNamespace';
import { TransactionAmountNormalizer } from '../../domain/services/transaction-amount.normalizer';

@Injectable()
export class PrismaTransactionRepository implements ITransactionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Partial<Transaction>): Promise<Transaction> {
    const transaction = await this.prisma.db.transaction.create({
      data: {
        userId: data.userId!,
        familyId: data.familyId,
        type: data.type as PrismaTransactionType,
        status:
          (data.status as PrismaTransactionStatus) ??
          PrismaTransactionStatus.CONFIRMED,
        scope: data.familyId
          ? TransactionScope.FAMILY
          : TransactionScope.PERSONAL,
        recordedAt: data.recordedAt || new Date(),
        value: new Decimal(data.value?.toString() || '0'),
        paymentMethodId: data.paymentMethodId ?? null,
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
    const transaction = await this.prisma.db.transaction.findUnique({
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
    const where = this.buildWhereClause(
      new TransactionFilters({ ...filters, userId }),
    );

    const [transactions, total] = await Promise.all([
      this.prisma.db.transaction.findMany({
        where,
        include: {
          user: true,
          expense: true,
          income: true,
        },
        orderBy: { recordedAt: 'desc' },
        skip: pagination?.skip,
        take: pagination?.take,
      }),
      this.prisma.db.transaction.count({ where }),
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
      this.prisma.db.transaction.findMany({
        where,
        include: {
          user: true,
          expense: true,
          income: true,
        },
        orderBy: { recordedAt: 'desc' },
        skip: pagination?.skip,
        take: pagination?.take,
      }),
      this.prisma.db.transaction.count({ where }),
    ]);

    return {
      data: transactions.map(TransactionMapper.toDomain),
      total,
    };
  }

  async updateStatus(
    id: string,
    status: TransactionStatus,
    rejectionReason?: string,
  ): Promise<Transaction> {
    const transaction = await this.prisma.db.transaction.update({
      where: { id },
      data: {
        status: status as PrismaTransactionStatus,
        rejectionReason: rejectionReason ?? null,
      },
      include: {
        user: true,
        expense: true,
        income: true,
      },
    });

    return TransactionMapper.toDomain(transaction);
  }

  async update(id: string, data: Partial<Transaction>): Promise<Transaction> {
    const updateData: Prisma.TransactionUpdateInput = {};

    if (data.type !== undefined) {
      updateData.type = data.type as PrismaTransactionType;
    }

    if (data.value !== undefined) {
      updateData.value = new Decimal(data.value.toString());
    }

    if ((data as any).status !== undefined) {
      updateData.status = (data as any).status as PrismaTransactionStatus;
    }

    if ((data as any).rejectionReason !== undefined) {
      updateData.rejectionReason = (data as any).rejectionReason;
    }

    if ((data as any).recordedAt !== undefined) {
      updateData.recordedAt = (data as any).recordedAt;
    }

    if ((data as any).paymentMethodId !== undefined) {
      updateData.paymentMethod = (data as any).paymentMethodId
        ? { connect: { id: (data as any).paymentMethodId } }
        : { disconnect: true };
    }

    const transaction = await this.prisma.db.transaction.update({
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
    await this.prisma.db.transaction.delete({
      where: { id },
    });
  }

  async getStatistics(
    filters: TransactionFilters,
  ): Promise<TransactionStatistics> {
    const where = this.buildWhereClause(filters);

    const confirmedWhere = {
      ...where,
      status: PrismaTransactionStatus.CONFIRMED,
    };

    const [incomeResult, expenseResult, count] = await Promise.all([
      this.prisma.db.transaction.aggregate({
        where: {
          ...confirmedWhere,
          type: PrismaTransactionType.INCOME,
        },
        _sum: {
          [TransactionAmountNormalizer.sumField]: true,
        },
      }),
      this.prisma.db.transaction.aggregate({
        where: {
          ...confirmedWhere,
          type: PrismaTransactionType.EXPENSE,
        },
        _sum: {
          [TransactionAmountNormalizer.sumField]: true,
        },
      }),
      this.prisma.db.transaction.count({ where: confirmedWhere }),
    ]);

    const totalIncome = TransactionAmountNormalizer.normalizeSum(
      incomeResult._sum.value,
    );
    const totalExpense = TransactionAmountNormalizer.normalizeSum(
      expenseResult._sum.value,
    );

    return new TransactionStatistics(
      totalIncome.toNumber(),
      totalExpense.toNumber(),
      totalIncome.minus(totalExpense).toNumber(),
      count,
    );
  }

  async getPersonalBalance(userId: string): Promise<Decimal> {
    const totalsByType = await this.prisma.db.transaction.groupBy({
      by: ['type'],
      where: {
        userId,
        scope: TransactionScope.PERSONAL,
        status: PrismaTransactionStatus.CONFIRMED,
        type: {
          in: [PrismaTransactionType.INCOME, PrismaTransactionType.EXPENSE],
        },
      },
      _sum: {
        [TransactionAmountNormalizer.sumField]: true,
      },
    });

    const sumOf = (type: PrismaTransactionType): Decimal =>
      TransactionAmountNormalizer.normalizeSum(
        totalsByType.find((row) => row.type === type)?._sum.value ?? null,
      );

    return sumOf(PrismaTransactionType.INCOME).minus(
      sumOf(PrismaTransactionType.EXPENSE),
    );
  }

  private buildWhereClause(
    filters?: TransactionFilters,
  ): Prisma.TransactionWhereInput {
    if (!filters?.userId && !filters?.familyId) {
      throw new DomainValidationException(
        'Transaction queries must be scoped to a user or to a verified family',
      );
    }

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

    if (filters.status) {
      where.status = filters.status as PrismaTransactionStatus;
    }

    if (filters.dateFrom || filters.dateTo) {
      where.recordedAt = {};
      if (filters.dateFrom) {
        where.recordedAt.gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        where.recordedAt.lte = filters.dateTo;
      }
    }

    if (filters.paymentMethodId) {
      where.paymentMethodId = filters.paymentMethodId;
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
