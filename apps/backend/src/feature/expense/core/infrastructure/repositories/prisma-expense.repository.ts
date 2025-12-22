import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../common/prisma/prisma.service';
import {
  IExpenseRepository,
  PaginatedResult,
  ExpenseFilters as ExpenseFiltersInterface,
  ExpenseStatistics,
} from '../../domain/repositories/expense.repository.interface';
import { Expense } from '../../domain/entities/expense.entity';
import { Pagination } from '../../../../transaction/core/application/dto/pagination.dto';
import { ExpenseMapper } from '../mappers/expense.mapper';
import { Prisma } from 'prisma/generated/prisma/client';
import { Decimal } from 'prisma/generated/prisma/internal/prismaNamespace';

@Injectable()
export class PrismaExpenseRepository implements IExpenseRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Partial<Expense>): Promise<Expense> {
    const expense = await this.prisma.expense.create({
      data: {
        id: data.id!,
        transactionId: data.transactionId!,
        storeId: data.storeId!,
        categoryId: data.categoryId!,
      },
      include: {
        transaction: true,
        category: true,
        store: true,
        items: {
          include: {
            item: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    return ExpenseMapper.toDomain(expense);
  }

  async findById(id: string): Promise<Expense | null> {
    const expense = await this.prisma.expense.findUnique({
      where: { id },
      include: {
        transaction: true,
        category: true,
        store: true,
        items: {
          include: {
            item: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    return expense ? ExpenseMapper.toDomain(expense) : null;
  }

  async findByTransactionId(transactionId: string): Promise<Expense | null> {
    const expense = await this.prisma.expense.findUnique({
      where: { transactionId },
      include: {
        transaction: true,
        category: true,
        store: true,
        items: {
          include: {
            item: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    return expense ? ExpenseMapper.toDomain(expense) : null;
  }

  async findAll(
    filters?: ExpenseFiltersInterface,
    pagination?: Pagination,
  ): Promise<PaginatedResult<Expense>> {
    const where = this.buildWhereClause(filters);

    const [expenses, total] = await Promise.all([
      this.prisma.expense.findMany({
        where,
        include: {
          transaction: true,
          category: true,
          store: true,
          items: {
            include: {
              item: {
                include: {
                  category: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: pagination?.skip,
        take: pagination?.take,
      }),
      this.prisma.expense.count({ where }),
    ]);

    return {
      data: expenses.map(ExpenseMapper.toDomain),
      total,
    };
  }

  async update(id: string, data: Partial<Expense>): Promise<Expense> {
    const updateData: any = {};

    if (data.categoryId !== undefined) {
      updateData.categoryId = data.categoryId;
    }

    if (data.storeId !== undefined) {
      updateData.storeId = data.storeId;
    }

    const expense = await this.prisma.expense.update({
      where: { id },
      data: updateData,
      include: {
        transaction: true,
        category: true,
        store: true,
        items: {
          include: {
            item: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    return ExpenseMapper.toDomain(expense);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.expense.delete({
      where: { id },
    });
  }

  async verifyOwnership(expenseId: string, userId: string): Promise<boolean> {
    const expense = await this.prisma.expense.findUnique({
      where: { id: expenseId },
      include: { transaction: { select: { userId: true } } },
    });

    return expense?.transaction.userId === userId;
  }

  async getStatistics(
    userId: string,
    filters?: ExpenseFiltersInterface,
  ): Promise<ExpenseStatistics> {
    const where = this.buildWhereClause(filters);

    // Get total expenses and count
    const [totalResult, count] = await Promise.all([
      this.prisma.expense.aggregate({
        where,
      }),
      this.prisma.expense.count({ where }),
    ]);

    const allExpenses = await this.prisma.expense.findMany({
      where,
      include: {
        transaction: {
          select: {
            value: true,
          },
        },
      },
    });

    const totalExpenses = allExpenses.reduce(
      (sum, expense) => sum + expense.transaction.value.toNumber(),
      0,
    );

    const averageExpense = count > 0 ? totalExpenses / count : 0;

    // Group by category
    const categoryMap = new Map<string, number>();
    allExpenses.forEach((expense) => {
      const current = categoryMap.get(expense.categoryId) || 0;
      categoryMap.set(
        expense.categoryId,
        current + expense.transaction.value.toNumber(),
      );
    });

    // Group by store
    const storeMap = new Map<string, number>();
    allExpenses.forEach((expense) => {
      const current = storeMap.get(expense.storeId) || 0;
      storeMap.set(
        expense.storeId,
        current + expense.transaction.value.toNumber(),
      );
    });

    return {
      totalExpenses,
      expenseCount: count,
      averageExpense,
      expensesByCategory: Array.from(categoryMap.entries()).map(
        ([categoryId, total]) => ({ categoryId, total }),
      ),
      expensesByStore: Array.from(storeMap.entries()).map(
        ([storeId, total]) => ({ storeId, total }),
      ),
    };
  }

  private buildWhereClause(
    filters?: ExpenseFiltersInterface,
  ): Prisma.ExpenseWhereInput {
    if (!filters) return {};

    const where: Prisma.ExpenseWhereInput = {};

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.storeId) {
      where.storeId = filters.storeId;
    }

    if (
      filters.userId ||
      filters.valueMin !== undefined ||
      filters.valueMax !== undefined
    ) {
      where.transaction = {};

      if (filters.userId) {
        where.transaction.userId = filters.userId;
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
