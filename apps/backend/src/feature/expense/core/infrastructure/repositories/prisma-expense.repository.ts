import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../common/prisma/prisma.service';
import {
  IExpenseRepository,
  PaginatedResult,
  CreateExpenseData,
  UpdateExpenseData,
  ExpenseFilters as ExpenseFiltersInterface,
  ExpenseStatistics,
} from '../../domain/repositories/expense.repository.interface';
import { ExpenseTrendPoint } from '../../application/dto/expense-trends.dto';
import { Expense } from '../../domain/entities/expense.entity';
import { Pagination } from '~common/dto/pagination.dto';
import { Prisma, TransactionStatus as PrismaTransactionStatus } from 'prisma/generated/prisma/client';
import { TransactionStatus } from '~feature/transaction/core/domain/value-objects/transaction-status.vo';
import { Decimal } from 'prisma/generated/prisma/internal/prismaNamespace';

const EXPENSE_INCLUDE = {
  transaction: { include: { user: true } },
  category: true,
  store: true,
  receipt: true,
  items: {
    include: {
      item: {
        include: {
          item: {
            include: {
              category: true,
            },
          },
        },
      },
    },
  },
} as const satisfies Prisma.ExpenseInclude;

@Injectable()
export class PrismaExpenseRepository implements IExpenseRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateExpenseData): Promise<Expense> {
    const expense = await this.prisma.expense.create({
      data: {
        id: data.id,
        transactionId: data.transactionId,
        storeId: data.storeId ?? null,
        categoryId: data.categoryId,
      },
      include: EXPENSE_INCLUDE,
    });

    return Expense.fromPrisma(expense);
  }

  async findById(id: string): Promise<Expense | null> {
    const expense = await this.prisma.expense.findUnique({
      where: { id },
      include: EXPENSE_INCLUDE,
    });

    return expense ? Expense.fromPrisma(expense) : null;
  }

  async findByTransactionId(transactionId: string): Promise<Expense | null> {
    const expense = await this.prisma.expense.findUnique({
      where: { transactionId },
      include: EXPENSE_INCLUDE,
    });

    return expense ? Expense.fromPrisma(expense) : null;
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
          category: true,
          store: true,
          receipt: true,
          transaction: {
            include: {
              user: true,
            },
          },
          items: {
            include: {
              item: {
                include: {
                  item: {
                    include: {
                      category: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { transaction: { recordedAt: 'desc' } },
        skip: pagination?.skip,
        take: pagination?.take,
      }),
      this.prisma.expense.count({ where }),
    ]);

    return {
      data: expenses.map(Expense.fromPrisma),
      total,
    };
  }

  async update(id: string, data: UpdateExpenseData): Promise<Expense> {
    const updateData: Prisma.ExpenseUpdateInput = {};

    if (data.categoryId !== undefined) {
      updateData.category = { connect: { id: data.categoryId } };
    }

    if (data.storeId !== undefined) {
      updateData.store = data.storeId
        ? { connect: { id: data.storeId } }
        : { disconnect: true };
    }

    if (data.description !== undefined) {
      updateData.description = data.description;
    }

    const expense = await this.prisma.expense.update({
      where: { id },
      data: updateData,
      include: EXPENSE_INCLUDE,
    });

    return Expense.fromPrisma(expense);
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

    const count = await this.prisma.expense.count({ where });

    const allExpenses = await this.prisma.expense.findMany({
      where,
      include: {
        transaction: {
          select: {
            value: true,
          },
        },
        category: {
          select: {
            name: true,
          },
        },
      },
    });

    const totalExpenses = allExpenses.reduce(
      (sum, expense) => sum + expense.transaction.value.toNumber(),
      0,
    );

    const averageExpense = count > 0 ? totalExpenses / count : 0;

    const categoryMap = new Map<string, { name: string; total: number }>();
    allExpenses.forEach((expense) => {
      const current = categoryMap.get(expense.categoryId);
      if (current) {
        current.total += expense.transaction.value.toNumber();
      } else {
        categoryMap.set(expense.categoryId, {
          name: expense.category.name,
          total: expense.transaction.value.toNumber(),
        });
      }
    });

    const storeMap = new Map<string, number>();
    allExpenses.forEach((expense) => {
      if (!expense.storeId) return;
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
        ([categoryId, data]) => ({
          categoryId,
          categoryName: data.name,
          total: data.total,
        }),
      ),
      expensesByStore: Array.from(storeMap.entries()).map(
        ([storeId, total]) => ({ storeId, total }),
      ),
    };
  }

  async getTrends(
    userId: string,
    dateFrom: Date,
    dateTo: Date,
    groupBy: string,
    filters?: ExpenseFiltersInterface,
  ): Promise<ExpenseTrendPoint[]> {
    const where = this.buildWhereClause({
      ...filters,
      userId,
      dateFrom,
      dateTo,
    });

    const expenses = await this.prisma.expense.findMany({
      where,
      include: {
        transaction: {
          select: {
            value: true,
            recordedAt: true,
          },
        },
      },
      orderBy: { transaction: { recordedAt: 'asc' } },
    });

    const grouped = new Map<string, { total: number; count: number }>();
    expenses.forEach((expense) => {
      const key = this.getDateKey(expense.transaction.recordedAt, groupBy);
      const current = grouped.get(key);
      const value = expense.transaction.value.toNumber();
      if (current) {
        current.total += value;
        current.count += 1;
      } else {
        grouped.set(key, { total: value, count: 1 });
      }
    });

    return Array.from(grouped.entries())
      .map(([date, data]) => new ExpenseTrendPoint(date, data.total, data.count))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private getDateKey(date: Date, groupBy: string): string {
    const d = new Date(date);
    if (groupBy === 'month') {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    }
    if (groupBy === 'week') {
      // Get Monday of the week
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(d);
      monday.setDate(diff);
      return monday.toISOString().split('T')[0];
    }
    return d.toISOString().split('T')[0];
  }

  private buildWhereClause(
    filters?: ExpenseFiltersInterface,
  ): Prisma.ExpenseWhereInput {
    if (!filters) return { transaction: { status: PrismaTransactionStatus.CONFIRMED } };

    const where: Prisma.ExpenseWhereInput = {};

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.storeId) {
      where.storeId = filters.storeId;
    }

    // Always initialize transaction filter to apply status default
    where.transaction = {};

    // Default to CONFIRMED if no status filter provided (backward compat)
    const statusFilter = filters.status ?? TransactionStatus.CONFIRMED;
    where.transaction.status = statusFilter as PrismaTransactionStatus;

    if (filters.userId) {
      where.transaction.userId = filters.userId;
    }

    if (filters.familyId) {
      where.transaction.familyId = filters.familyId;
    }

    if (filters.scope) {
      where.transaction.scope = filters.scope;
    }

    if (filters.paymentMethodId) {
      where.transaction.paymentMethodId = filters.paymentMethodId;
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

    if (filters.dateFrom || filters.dateTo) {
      where.transaction.recordedAt = {};
      if (filters.dateFrom) {
        where.transaction.recordedAt.gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        where.transaction.recordedAt.lte = filters.dateTo;
      }
    }

    if (filters.search) {
      const searchOr: Prisma.ExpenseWhereInput[] = [
        { category: { name: { contains: filters.search, mode: 'insensitive' } } },
        { store: { name: { contains: filters.search, mode: 'insensitive' } } },
        { items: { some: { item: { item: { name: { contains: filters.search, mode: 'insensitive' } } } } } },
      ];

      if (Object.keys(where).length > 0) {
        return { AND: [where, { OR: searchOr }] };
      }
      return { OR: searchOr };
    }

    return where;
  }
}
