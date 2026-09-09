import { Prisma } from 'prisma/generated/prisma/client';
import { firstCallArgument } from '~test/mock-call';
import { PrismaExpenseRepository } from './prisma-expense.repository';
import { TransactionStatus } from '~feature/transaction/core/domain/value-objects/transaction-status.vo';

const USER = 'user-1';

function captureQueries() {
  const queries: Prisma.Sql[] = [];
  const db = {
    $queryRaw: (strings: TemplateStringsArray, ...values: unknown[]) => {
      queries.push(Prisma.sql(strings, ...values));
      return Promise.resolve([]);
    },
  };
  return {
    queries,
    repository: new PrismaExpenseRepository({ db } as never),
  };
}

describe('PrismaExpenseRepository reporting queries', () => {
  const dateFrom = new Date('2026-01-01T00:00:00.000Z');
  const dateTo = new Date('2026-02-01T00:00:00.000Z');

  describe('getTrends', () => {
    it('buckets by the configured reporting time zone', async () => {
      process.env.REPORTING_TIMEZONE = 'Europe/Belgrade';
      const { queries, repository } = captureQueries();

      await repository.getTrends(dateFrom, dateTo, 'day', { userId: USER });

      expect(queries).toHaveLength(1);
      expect(queries[0].text).toContain('AT TIME ZONE');
      expect(queries[0].values).toContain('Europe/Belgrade');
    });

    it('uses one time zone for day, week and month buckets', async () => {
      process.env.REPORTING_TIMEZONE = 'UTC';
      const { queries, repository } = captureQueries();

      await repository.getTrends(dateFrom, dateTo, 'day', { userId: USER });
      await repository.getTrends(dateFrom, dateTo, 'week', { userId: USER });
      await repository.getTrends(dateFrom, dateTo, 'month', { userId: USER });

      expect(queries.map((query) => query.values[0])).toEqual([
        'day',
        'week',
        'month',
      ]);
      expect(queries.map((query) => query.values[1])).toEqual([
        'UTC',
        'UTC',
        'UTC',
      ]);
      expect(queries.map((query) => query.values[2])).toEqual([
        'YYYY-MM-DD',
        'YYYY-MM-DD',
        'YYYY-MM',
      ]);
    });

    it('falls back to day buckets for an unknown grouping', async () => {
      const { queries, repository } = captureQueries();

      await repository.getTrends(dateFrom, dateTo, 'fortnight', {
        userId: USER,
      });

      expect(queries[0].values[0]).toBe('day');
    });

    it('scopes to the family without injecting the caller as a filter', async () => {
      const { queries, repository } = captureQueries();

      await repository.getTrends(dateFrom, dateTo, 'day', {
        familyId: 'family-1',
      });

      expect(queries[0].text).toContain('t."family_id"');
      expect(queries[0].text).not.toContain('t."user_id"');
      expect(queries[0].values).toContain('family-1');
    });

    it('scopes to a single member when the filter asks for it', async () => {
      const { queries, repository } = captureQueries();

      await repository.getTrends(dateFrom, dateTo, 'day', {
        familyId: 'family-1',
        userId: 'user-1',
      });

      expect(queries[0].text).toContain('t."family_id"');
      expect(queries[0].text).toContain('t."user_id"');
    });

    it('always constrains the requested date range', async () => {
      const { queries, repository } = captureQueries();

      await repository.getTrends(dateFrom, dateTo, 'day', { userId: USER });

      expect(queries[0].text).toContain('t."recorded_at" >=');
      expect(queries[0].text).toContain('t."recorded_at" <=');
      expect(queries[0].values).toContain(dateFrom);
      expect(queries[0].values).toContain(dateTo);
    });
  });

  describe('getStatistics', () => {
    it('aggregates in three grouped queries rather than loading every expense', async () => {
      const { queries, repository } = captureQueries();

      await repository.getStatistics({ familyId: 'family-1' });

      expect(queries).toHaveLength(3);
      expect(queries[1].text).toContain('GROUP BY e."category_id"');
      expect(queries[2].text).toContain('GROUP BY e."store_id"');
    });

    it('scopes to the family the same way trends do', async () => {
      const { queries, repository } = captureQueries();

      await repository.getStatistics({ familyId: 'family-1' });
      await repository.getTrends(dateFrom, dateTo, 'day', {
        familyId: 'family-1',
      });

      expect(queries[0].text).toContain('t."family_id"');
      expect(queries[3].text).toContain('t."family_id"');
      expect(queries[0].text).not.toContain('t."user_id"');
      expect(queries[3].text).not.toContain('t."user_id"');
    });

    it('defaults to confirmed transactions', async () => {
      const { queries, repository } = captureQueries();

      await repository.getStatistics({ userId: USER });

      expect(queries[0].values[0]).toBe(TransactionStatus.CONFIRMED);
    });

    it('honours an explicit status filter', async () => {
      const { queries, repository } = captureQueries();

      await repository.getStatistics({
        userId: USER,
        status: TransactionStatus.PENDING,
      });

      expect(queries[0].values[0]).toBe(TransactionStatus.PENDING);
    });

    it('reports zeroes for an empty result set', async () => {
      const { repository } = captureQueries();

      const statistics = await repository.getStatistics({ userId: USER });

      expect(statistics.expenseCount).toBe(0);
      expect(statistics.totalExpenses.toString()).toBe('0');
      expect(statistics.averageExpense.toString()).toBe('0');
    });
  });
});

describe('PrismaExpenseRepository soft delete', () => {
  it('excludes soft deleted rows from the statistics SQL', async () => {
    const { queries, repository } = captureQueries();

    await repository.getStatistics({ userId: USER });

    for (const query of queries) {
      expect(query.text).toContain('e."deleted_at" IS NULL');
      expect(query.text).toContain('t."deleted_at" IS NULL');
    }
  });

  it('excludes soft deleted rows from the trends SQL', async () => {
    const { queries, repository } = captureQueries();

    await repository.getTrends(
      new Date('2026-01-01T00:00:00.000Z'),
      new Date('2026-02-01T00:00:00.000Z'),
      'day',
      { userId: USER },
    );

    expect(queries[0].text).toContain('e."deleted_at" IS NULL');
    expect(queries[0].text).toContain('t."deleted_at" IS NULL');
  });

  it('marks a deleted expense instead of removing the row', async () => {
    const update = jest.fn().mockResolvedValue(null);
    const repository = new PrismaExpenseRepository({
      db: { expense: { update } },
    } as never);

    await repository.delete('expense-1');

    expect(update).toHaveBeenCalledWith({
      where: { id: 'expense-1' },
      data: { deletedAt: expect.any(Date) },
    });
  });

  it('hides soft deleted expenses from listings', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const count = jest.fn().mockResolvedValue(0);
    const repository = new PrismaExpenseRepository({
      db: { expense: { findMany, count } },
    } as never);

    await repository.findAll({ userId: USER });

    const { where } = firstCallArgument<{
      where: { deletedAt: Date | null; transaction: { deletedAt: Date | null } };
    }>(findMany);

    expect(where.deletedAt).toBeNull();
    expect(where.transaction.deletedAt).toBeNull();
  });
});
