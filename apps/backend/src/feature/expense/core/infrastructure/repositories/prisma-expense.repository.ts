import { Injectable } from '@nestjs/common';
import { DomainValidationException } from '~common/exceptions/domain.exceptions';
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
import {
  Prisma,
  TransactionStatus as PrismaTransactionStatus,
} from 'prisma/generated/prisma/client';
import { TransactionStatus } from '~feature/transaction/core/domain/value-objects/transaction-status.vo';
import { Decimal } from 'prisma/generated/prisma/internal/prismaNamespace';
import { reportingTimeZone } from '~common/config/reporting-timezone';

const EXPENSE_SOURCE = Prisma.sql`
  "expense" e
  JOIN "transaction" t ON t."id" = e."transaction_id"
  JOIN "expense_category" ec ON ec."id" = e."category_id"
  LEFT JOIN "store" s ON s."id" = e."store_id"
`;

const TREND_BUCKETS: Record<string, { unit: string; format: string }> = {
  day: { unit: 'day', format: 'YYYY-MM-DD' },
  week: { unit: 'week', format: 'YYYY-MM-DD' },
  month: { unit: 'month', format: 'YYYY-MM' },
};

function toDecimal(
  value: string | number | Decimal | null | undefined,
): Decimal {
  if (value === null || value === undefined) {
    return new Decimal(0);
  }
  return value instanceof Decimal ? value : new Decimal(value.toString());
}

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
    const expense = await this.prisma.db.expense.create({
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
    const expense = await this.prisma.db.expense.findUnique({
      where: { id },
      include: EXPENSE_INCLUDE,
    });

    return expense ? Expense.fromPrisma(expense) : null;
  }

  async findByTransactionId(transactionId: string): Promise<Expense | null> {
    const expense = await this.prisma.db.expense.findUnique({
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
      this.prisma.db.expense.findMany({
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
      this.prisma.db.expense.count({ where }),
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

    const expense = await this.prisma.db.expense.update({
      where: { id },
      data: updateData,
      include: EXPENSE_INCLUDE,
    });

    return Expense.fromPrisma(expense);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.db.expense.delete({
      where: { id },
    });
  }

  async verifyOwnership(expenseId: string, userId: string): Promise<boolean> {
    const expense = await this.prisma.db.expense.findUnique({
      where: { id: expenseId },
      include: { transaction: { select: { userId: true } } },
    });

    return expense?.transaction.userId === userId;
  }

  async getStatistics(
    filters?: ExpenseFiltersInterface,
  ): Promise<ExpenseStatistics> {
    const where = this.buildFilterSql(filters);

    const [totals, byCategory, byStore] = await Promise.all([
      this.prisma.db.$queryRaw<
        { total: string | null; count: bigint | number }[]
      >`
        SELECT COALESCE(SUM(t."value"), 0) AS "total", COUNT(*) AS "count"
        FROM ${EXPENSE_SOURCE}
        ${where}
      `,
      this.prisma.db.$queryRaw<
        { categoryId: string; categoryName: string; total: string | null }[]
      >`
        SELECT
          e."category_id" AS "categoryId",
          ec."name" AS "categoryName",
          COALESCE(SUM(t."value"), 0) AS "total"
        FROM ${EXPENSE_SOURCE}
        ${where}
        GROUP BY e."category_id", ec."name"
        ORDER BY "total" DESC
      `,
      this.prisma.db.$queryRaw<{ storeId: string; total: string | null }[]>`
        SELECT e."store_id" AS "storeId", COALESCE(SUM(t."value"), 0) AS "total"
        FROM ${EXPENSE_SOURCE}
        ${where} AND e."store_id" IS NOT NULL
        GROUP BY e."store_id"
        ORDER BY "total" DESC
      `,
    ]);

    const expenseCount = Number(totals[0]?.count ?? 0);
    const totalExpenses = toDecimal(totals[0]?.total);

    return {
      totalExpenses,
      expenseCount,
      averageExpense:
        expenseCount > 0
          ? totalExpenses.dividedBy(expenseCount)
          : new Decimal(0),
      expensesByCategory: byCategory.map((row) => ({
        categoryId: row.categoryId,
        categoryName: row.categoryName,
        total: toDecimal(row.total),
      })),
      expensesByStore: byStore.map((row) => ({
        storeId: row.storeId,
        total: toDecimal(row.total),
      })),
    };
  }

  async getTrends(
    dateFrom: Date,
    dateTo: Date,
    groupBy: string,
    filters?: ExpenseFiltersInterface,
  ): Promise<ExpenseTrendPoint[]> {
    const where = this.buildFilterSql({ ...filters, dateFrom, dateTo });
    const bucket = TREND_BUCKETS[groupBy] ?? TREND_BUCKETS.day;
    const timeZone = reportingTimeZone();

    const rows = await this.prisma.db.$queryRaw<
      { bucket: string; total: string | null; count: bigint | number }[]
    >`
      SELECT
        to_char(
          date_trunc(${bucket.unit}::text, t."recorded_at" AT TIME ZONE ${timeZone}::text),
          ${bucket.format}::text
        ) AS "bucket",
        COALESCE(SUM(t."value"), 0) AS "total",
        COUNT(*) AS "count"
      FROM ${EXPENSE_SOURCE}
      ${where}
      GROUP BY 1
      ORDER BY 1 ASC
    `;

    return rows.map(
      (row) =>
        new ExpenseTrendPoint(
          row.bucket,
          toDecimal(row.total),
          Number(row.count),
        ),
    );
  }

  private buildFilterSql(filters?: ExpenseFiltersInterface): Prisma.Sql {
    if (!filters?.userId && !filters?.familyId) {
      throw new DomainValidationException(
        'Expense queries must be scoped to a user or to a verified family',
      );
    }

    const conditions: Prisma.Sql[] = [
      Prisma.sql`t."status"::text = ${(filters?.status ?? TransactionStatus.CONFIRMED) as string}`,
    ];

    if (filters?.categoryId) {
      conditions.push(
        Prisma.sql`e."category_id" = ${filters.categoryId}::uuid`,
      );
    }

    if (filters?.storeId) {
      conditions.push(Prisma.sql`e."store_id" = ${filters.storeId}::uuid`);
    }

    if (filters?.userId) {
      conditions.push(Prisma.sql`t."user_id" = ${filters.userId}::uuid`);
    }

    if (filters?.familyId) {
      conditions.push(Prisma.sql`t."family_id" = ${filters.familyId}::uuid`);
    }

    if (filters?.scope) {
      conditions.push(Prisma.sql`t."scope"::text = ${filters.scope as string}`);
    }

    if (filters?.paymentMethodId) {
      conditions.push(
        Prisma.sql`t."payment_method_id" = ${filters.paymentMethodId}::uuid`,
      );
    }

    if (filters?.valueMin !== undefined) {
      conditions.push(
        Prisma.sql`t."value" >= ${String(filters.valueMin)}::numeric`,
      );
    }

    if (filters?.valueMax !== undefined) {
      conditions.push(
        Prisma.sql`t."value" <= ${String(filters.valueMax)}::numeric`,
      );
    }

    if (filters?.dateFrom) {
      conditions.push(Prisma.sql`t."recorded_at" >= ${filters.dateFrom}`);
    }

    if (filters?.dateTo) {
      conditions.push(Prisma.sql`t."recorded_at" <= ${filters.dateTo}`);
    }

    if (filters?.search) {
      const pattern = `%${filters.search}%`;
      conditions.push(Prisma.sql`(
        ec."name" ILIKE ${pattern}
        OR s."name" ILIKE ${pattern}
        OR EXISTS (
          SELECT 1
          FROM "expense_item" ei
          JOIN "store_item" si ON si."id" = ei."item_id"
          JOIN "item" i ON i."id" = si."item_id"
          WHERE ei."expense_id" = e."id" AND i."name" ILIKE ${pattern}
        )
      )`);
    }

    return Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`;
  }

  private buildWhereClause(
    filters?: ExpenseFiltersInterface,
  ): Prisma.ExpenseWhereInput {
    if (!filters?.userId && !filters?.familyId) {
      throw new DomainValidationException(
        'Expense queries must be scoped to a user or to a verified family',
      );
    }

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
        {
          category: { name: { contains: filters.search, mode: 'insensitive' } },
        },
        { store: { name: { contains: filters.search, mode: 'insensitive' } } },
        {
          items: {
            some: {
              item: {
                item: {
                  name: { contains: filters.search, mode: 'insensitive' },
                },
              },
            },
          },
        },
      ];

      if (Object.keys(where).length > 0) {
        return { AND: [where, { OR: searchOr }] };
      }
      return { OR: searchOr };
    }

    return where;
  }
}
