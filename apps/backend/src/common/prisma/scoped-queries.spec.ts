import { DomainValidationException } from '../exceptions/domain.exceptions';
import { PrismaExpenseRepository } from '~feature/expense/core/infrastructure/repositories/prisma-expense.repository';
import { PrismaIncomeRepository } from '~feature/income/core/infrastructure/repositories/prisma-income.repository';
import { PrismaTransactionRepository } from '~feature/transaction/core/infrastructure/repositories/prisma-transaction.repository';
import { PrismaStoredReceiptRepository } from '~feature/receipt/core/infrastructure/repositories/prisma-stored-receipt.repository';
import { PrismaService } from './prisma.service';

const USER = 'user-1';
const FAMILY = 'family-1';

function prismaThatMustNotBeQueried(): PrismaService {
  const fail = () => {
    throw new Error('the database must not be reached for an unscoped query');
  };

  return new Proxy(
    {},
    {
      get: () => new Proxy({}, { get: () => fail }),
    },
  ) as unknown as PrismaService;
}

function prismaReturningNothing(): PrismaService {
  const model = {
    findMany: jest.fn().mockResolvedValue([]),
    count: jest.fn().mockResolvedValue(0),
  };

  return {
    expense: model,
    income: model,
    transaction: {
      ...model,
      aggregate: jest.fn().mockResolvedValue({ _sum: {} }),
    },
    receipt: model,
  } as unknown as PrismaService;
}

describe('queries fail closed without an explicit scope', () => {
  const dateRange = {
    dateFrom: new Date('2026-01-01T00:00:00.000Z'),
    dateTo: new Date('2026-02-01T00:00:00.000Z'),
  };

  const cases: [
    string,
    (prisma: PrismaService, filters?: object) => Promise<unknown>,
  ][] = [
    [
      'expenses',
      (prisma, filters) => new PrismaExpenseRepository(prisma).findAll(filters),
    ],
    [
      'expense statistics',
      (prisma, filters) =>
        new PrismaExpenseRepository(prisma).getStatistics(filters),
    ],
    [
      'incomes',
      (prisma, filters) => new PrismaIncomeRepository(prisma).findAll(filters),
    ],
    [
      'transactions',
      (prisma, filters) =>
        new PrismaTransactionRepository(prisma).findAll(filters),
    ],
    [
      'receipts',
      (prisma, filters) =>
        new PrismaStoredReceiptRepository(prisma).findAll(filters),
    ],
  ];

  it.each(cases)('refuses to list all %s', async (_name, run) => {
    await expect(run(prismaThatMustNotBeQueried())).rejects.toBeInstanceOf(
      DomainValidationException,
    );
  });

  it.each(cases)(
    'refuses %s filtered only by a date range',
    async (_name, run) => {
      await expect(
        run(prismaThatMustNotBeQueried(), dateRange),
      ).rejects.toBeInstanceOf(DomainValidationException);
    },
  );

  it('accepts a query scoped to a user', async () => {
    const prisma = prismaReturningNothing();

    await expect(
      new PrismaExpenseRepository(prisma).findAll({ userId: USER }),
    ).resolves.toEqual({ data: [], total: 0 });
  });

  it('accepts a query scoped to a family the guard verified', async () => {
    const prisma = prismaReturningNothing();

    await expect(
      new PrismaTransactionRepository(prisma).findAll({ familyId: FAMILY }),
    ).resolves.toEqual({ data: [], total: 0 });
  });
});
