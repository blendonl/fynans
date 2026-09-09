import { Decimal } from 'prisma/generated/prisma/internal/prismaNamespace';
import { createPrismaServiceDouble } from '~test/prisma-service.double';
import { ExpenseTotalCalculator } from '~feature/expense-item/core/domain/services/expense-total.calculator';
import { UpdateExpenseUseCase } from './update-expense.use-case';
import { UpdateExpenseDto } from '../dto/update-expense.dto';

const EXPENSE = 'expense-1';
const OWNER = 'owner-1';

const ITEMS = [
  {
    price: new Decimal('10'),
    discount: new Decimal('2'),
    quantity: new Decimal('3'),
  },
  {
    price: new Decimal('5'),
    discount: new Decimal('0'),
    quantity: new Decimal('2'),
  },
];

describe('updating an expense against the sum of its items', () => {
  let transactionValue: Decimal;
  let expenseRepository: Record<string, jest.Mock>;
  let transactionRepository: Record<string, jest.Mock>;

  const sumOfItems = () => ExpenseTotalCalculator.total(ITEMS);

  const updateExpense = () =>
    new UpdateExpenseUseCase(
      expenseRepository as never,
      { findById: jest.fn().mockResolvedValue({ id: 'category-1' }) } as never,
      transactionRepository as never,
      { findById: jest.fn().mockResolvedValue({ id: 'store-1' }) } as never,
      {
        verifyOwnership: jest.fn().mockResolvedValue(undefined),
        recalculateBalance: jest.fn().mockResolvedValue(undefined),
      } as never,
      { recalculateBalances: jest.fn().mockResolvedValue(undefined) } as never,
      createPrismaServiceDouble(),
    );

  beforeEach(() => {
    transactionValue = sumOfItems();

    expenseRepository = {
      findById: jest.fn().mockImplementation(() =>
        Promise.resolve({
          id: EXPENSE,
          transactionId: 'transaction-1',
          transaction: {
            id: 'transaction-1',
            userId: OWNER,
            familyId: null,
            paymentMethodId: null,
            value: transactionValue,
          },
        }),
      ),
      verifyOwnership: jest.fn().mockResolvedValue(true),
      update: jest.fn().mockResolvedValue({ id: EXPENSE }),
    };
    transactionRepository = {
      update: jest
        .fn()
        .mockImplementation((_id: string, data: { value?: Decimal }) => {
          if (data.value !== undefined) {
            transactionValue = new Decimal(data.value.toString());
          }
          return Promise.resolve(undefined);
        }),
    };
  });

  it('holds when the update touches nothing that affects the total', async () => {
    await updateExpense().execute(
      EXPENSE,
      OWNER,
      new UpdateExpenseDto({ note: 'lunch with the team' }),
    );

    expect(transactionValue.toString()).toBe(sumOfItems().toString());
    expect(transactionRepository.update).not.toHaveBeenCalled();
  });

  it('holds when the update only moves the recorded date', async () => {
    await updateExpense().execute(
      EXPENSE,
      OWNER,
      new UpdateExpenseDto({ recordedAt: new Date('2026-01-01') }),
    );

    expect(transactionValue.toString()).toBe(sumOfItems().toString());
  });

  it('holds when the update only changes the category and store', async () => {
    await updateExpense().execute(
      EXPENSE,
      OWNER,
      new UpdateExpenseDto({ categoryId: 'category-2', storeId: 'store-2' }),
    );

    expect(transactionValue.toString()).toBe(sumOfItems().toString());
    expect(transactionRepository.update).not.toHaveBeenCalled();
  });

  it('still lets an explicit amount overwrite the item sum, which is the one hole left', async () => {
    await updateExpense().execute(
      EXPENSE,
      OWNER,
      new UpdateExpenseDto({ amount: new Decimal('99') }),
    );

    expect(transactionValue.toString()).toBe('99');
    expect(transactionValue.toString()).not.toBe(sumOfItems().toString());
  });
});
