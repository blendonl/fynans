import { Decimal } from 'prisma/generated/prisma/internal/prismaNamespace';
import { CreateExpenseUseCase } from './create-expense.use-case';
import { CreateExpenseDto } from '../dto/create-expense.dto';
import { createPrismaServiceDouble } from '~test/prisma-service.double';
import { createRecordFinancialAuditDouble } from '~test/financial-audit.double';
import {
  DomainNotFoundException,
  DomainValidationException,
} from '~common/exceptions/domain.exceptions';
import {
  NoExpenseCategoriesException,
  NO_EXPENSE_CATEGORIES_ERROR,
} from '../../domain/exceptions/no-expense-categories.exception';

const USER = 'user-1';
const AMOUNT = new Decimal('12.50');

function buildUseCase(expenseCategoryService: Record<string, jest.Mock>) {
  return new CreateExpenseUseCase(
    { create: jest.fn(), findById: jest.fn() } as never,
    expenseCategoryService as never,
    { execute: jest.fn() } as never,
    { resolveStore: jest.fn() } as never,
    { create: jest.fn() } as never,
    { notify: jest.fn() } as never,
    { recalculateBalance: jest.fn() } as never,
    createPrismaServiceDouble(),
    createRecordFinancialAuditDouble(),
  );
}

describe('creating an expense with no categories in the catalog', () => {
  it('reports an actionable domain error instead of a foreign key failure', async () => {
    const useCase = buildUseCase({
      findById: jest
        .fn()
        .mockRejectedValue(
          new DomainNotFoundException('Expense category not found'),
        ),
      findAll: jest.fn().mockResolvedValue({ data: [], total: 0 }),
    });

    await expect(
      useCase.execute(
        new CreateExpenseDto({
          userId: USER,
          categoryId: 'category-that-was-never-seeded',
          amount: AMOUNT,
        }),
      ),
    ).rejects.toBeInstanceOf(NoExpenseCategoriesException);
  });

  it('reports the same error when the form submits no category at all', async () => {
    const useCase = buildUseCase({
      findById: jest.fn(),
      findAll: jest.fn().mockResolvedValue({ data: [], total: 0 }),
    });

    const failure = await useCase
      .execute(
        new CreateExpenseDto({ userId: USER, categoryId: '', amount: AMOUNT }),
      )
      .catch((error: unknown) => error);

    expect(failure).toBeInstanceOf(NoExpenseCategoriesException);
    expect((failure as Error).name).toBe(NO_EXPENSE_CATEGORIES_ERROR);
  });

  it('still reports a plain not-found when the user does have categories', async () => {
    const useCase = buildUseCase({
      findById: jest
        .fn()
        .mockRejectedValue(
          new DomainNotFoundException('Expense category not found'),
        ),
      findAll: jest.fn().mockResolvedValue({ data: [], total: 14 }),
    });

    const failure = await useCase
      .execute(
        new CreateExpenseDto({
          userId: USER,
          categoryId: 'someone-elses-category',
          amount: AMOUNT,
        }),
      )
      .catch((error: unknown) => error);

    expect(failure).toBeInstanceOf(DomainNotFoundException);
    expect(failure).not.toBeInstanceOf(NoExpenseCategoriesException);
  });

  it('still reports a plain validation error for a missing category id', async () => {
    const useCase = buildUseCase({
      findById: jest.fn(),
      findAll: jest.fn().mockResolvedValue({ data: [], total: 14 }),
    });

    const failure = await useCase
      .execute(
        new CreateExpenseDto({ userId: USER, categoryId: '', amount: AMOUNT }),
      )
      .catch((error: unknown) => error);

    expect(failure).toBeInstanceOf(DomainValidationException);
    expect(failure).not.toBeInstanceOf(NoExpenseCategoriesException);
  });
});
