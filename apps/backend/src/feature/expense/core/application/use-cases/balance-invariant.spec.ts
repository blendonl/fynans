import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Decimal } from 'prisma/generated/prisma/internal/prismaNamespace';
import { createPrismaServiceDouble } from '~test/prisma-service.double';
import { TransactionAmountNormalizer } from '~feature/transaction/core/domain/services/transaction-amount.normalizer';
import { TransactionStatus } from '~feature/transaction/core/domain/value-objects/transaction-status.vo';
import { TransactionType } from '~feature/transaction/core/domain/value-objects/transaction-type.vo';
import { UpdateExpenseUseCase } from './update-expense.use-case';
import { DeleteExpenseUseCase } from './delete-expense.use-case';
import { ApprovePendingExpenseUseCase } from './approve-pending-expense.use-case';
import { RejectPendingExpenseUseCase } from './reject-pending-expense.use-case';
import { UpdateExpenseDto } from '../dto/update-expense.dto';

const FAMILY = 'family-1';
const ALICE = 'alice';
const BOB = 'bob';
const CARD = 'card';
const CASH = 'cash';

const OPENING_BALANCES: Record<string, string> = {
  [CARD]: '500',
  [CASH]: '80',
};

interface LedgerTransaction {
  id: string;
  userId: string;
  familyId: string | null;
  paymentMethodId: string | null;
  type: TransactionType;
  status: TransactionStatus;
  value: Decimal;
}

class Ledger {
  private readonly transactions = new Map<string, LedgerTransaction>();
  private readonly expenses = new Map<string, string>();
  private cachedFamilyBalance = new Decimal(0);
  private readonly cachedMemberBalances = new Map<string, Decimal>([
    [ALICE, new Decimal(0)],
    [BOB, new Decimal(0)],
  ]);
  private readonly cachedPaymentMethodBalances = new Map<string, Decimal>([
    [CARD, new Decimal(OPENING_BALANCES[CARD])],
    [CASH, new Decimal(OPENING_BALANCES[CASH])],
  ]);

  seed(
    expenseId: string,
    transaction: Omit<LedgerTransaction, 'value'> & { value: string },
  ): void {
    this.transactions.set(transaction.id, {
      ...transaction,
      value: new Decimal(transaction.value),
    });
    this.expenses.set(expenseId, transaction.id);

    if (transaction.status === TransactionStatus.CONFIRMED) {
      this.applyToCaches(transaction.id);
    }
  }

  expense(expenseId: string) {
    const transactionId = this.expenses.get(expenseId);
    const entry = transactionId
      ? this.transactions.get(transactionId)
      : undefined;

    if (!entry) {
      return null;
    }

    return {
      id: expenseId,
      transactionId: entry.id,
      transaction: {
        ...entry,
        isPending: () => entry.status === TransactionStatus.PENDING,
      },
    };
  }

  updateTransaction(id: string, changes: Record<string, unknown>): void {
    const entry = this.transactions.get(id)!;

    if (changes.value !== undefined) {
      entry.value = new Decimal(changes.value as string);
    }
    if (changes.paymentMethodId !== undefined) {
      entry.paymentMethodId = changes.paymentMethodId as string;
    }
  }

  confirm(id: string): LedgerTransaction {
    const entry = this.transactions.get(id)!;
    entry.status = TransactionStatus.CONFIRMED;
    return entry;
  }

  reject(id: string): LedgerTransaction {
    const entry = this.transactions.get(id)!;
    entry.status = TransactionStatus.REJECTED;
    return entry;
  }

  removeExpense(expenseId: string): void {
    const transactionId = this.expenses.get(expenseId)!;
    this.transactions.delete(transactionId);
    this.expenses.delete(expenseId);
  }

  incrementFamilyBalances(
    familyId: string,
    userId: string,
    delta: Decimal,
  ): void {
    expect(familyId).toBe(FAMILY);
    this.cachedFamilyBalance = this.cachedFamilyBalance.plus(delta);
    this.cachedMemberBalances.set(
      userId,
      (this.cachedMemberBalances.get(userId) ?? new Decimal(0)).plus(delta),
    );
  }

  recalculateFamilyBalances(familyId: string): void {
    expect(familyId).toBe(FAMILY);
    const computed = this.computeFamilyBalances();
    this.cachedFamilyBalance = computed.balance;
    for (const [userId, balance] of computed.memberBalances) {
      this.cachedMemberBalances.set(userId, balance);
    }
  }

  recalculatePaymentMethodBalance(paymentMethodId: string): void {
    this.cachedPaymentMethodBalances.set(
      paymentMethodId,
      this.computePaymentMethodBalance(paymentMethodId),
    );
  }

  cachedFamily(): Decimal {
    return this.cachedFamilyBalance;
  }

  cachedMember(userId: string): Decimal {
    return this.cachedMemberBalances.get(userId) ?? new Decimal(0);
  }

  cachedPaymentMethod(paymentMethodId: string): Decimal {
    return (
      this.cachedPaymentMethodBalances.get(paymentMethodId) ?? new Decimal(0)
    );
  }

  computeFamilyBalances(): {
    balance: Decimal;
    memberBalances: Map<string, Decimal>;
  } {
    const memberBalances = new Map<string, Decimal>([
      [ALICE, new Decimal(0)],
      [BOB, new Decimal(0)],
    ]);
    let balance = new Decimal(0);

    for (const entry of this.confirmed()) {
      if (entry.familyId !== FAMILY) continue;

      const signed = TransactionAmountNormalizer.signedTotal(
        entry.type,
        TransactionAmountNormalizer.normalize(entry),
      );
      memberBalances.set(
        entry.userId,
        (memberBalances.get(entry.userId) ?? new Decimal(0)).plus(signed),
      );
      balance = balance.plus(signed);
    }

    return { balance, memberBalances };
  }

  computePaymentMethodBalance(paymentMethodId: string): Decimal {
    return this.confirmed()
      .filter((entry) => entry.paymentMethodId === paymentMethodId)
      .reduce(
        (balance, entry) =>
          entry.type === TransactionType.INCOME
            ? balance.plus(entry.value)
            : balance.minus(entry.value),
        new Decimal(OPENING_BALANCES[paymentMethodId] ?? '0'),
      );
  }

  private applyToCaches(transactionId: string): void {
    const entry = this.transactions.get(transactionId)!;
    const signed = TransactionAmountNormalizer.signedTotal(
      entry.type,
      TransactionAmountNormalizer.normalize(entry),
    );

    if (entry.familyId === FAMILY) {
      this.incrementFamilyBalances(FAMILY, entry.userId, signed);
    }
    if (entry.paymentMethodId) {
      this.recalculatePaymentMethodBalance(entry.paymentMethodId);
    }
  }

  private confirmed(): LedgerTransaction[] {
    return [...this.transactions.values()].filter(
      (entry) => entry.status === TransactionStatus.CONFIRMED,
    );
  }
}

describe('every cached balance equals the sum of its transactions', () => {
  let ledger: Ledger;
  let expenseRepository: Record<string, jest.Mock>;
  let transactionRepository: Record<string, jest.Mock>;
  let paymentMethodService: Record<string, jest.Mock>;
  let familyBalanceService: Record<string, jest.Mock>;

  const expectBalanced = () => {
    const computed = ledger.computeFamilyBalances();

    expect(ledger.cachedFamily().toString()).toBe(computed.balance.toString());
    for (const [userId, balance] of computed.memberBalances) {
      expect(ledger.cachedMember(userId).toString()).toBe(balance.toString());
    }
    for (const paymentMethodId of [CARD, CASH]) {
      expect(ledger.cachedPaymentMethod(paymentMethodId).toString()).toBe(
        ledger.computePaymentMethodBalance(paymentMethodId).toString(),
      );
    }
  };

  beforeEach(() => {
    ledger = new Ledger();

    expenseRepository = {
      findById: jest
        .fn()
        .mockImplementation((id: string) =>
          Promise.resolve(ledger.expense(id)),
        ),
      verifyOwnership: jest.fn().mockResolvedValue(true),
      update: jest
        .fn()
        .mockImplementation((id: string) => Promise.resolve({ id })),
    };
    transactionRepository = {
      update: jest
        .fn()
        .mockImplementation((id: string, data: Record<string, unknown>) => {
          ledger.updateTransaction(id, data);
          return Promise.resolve(undefined);
        }),
      updateStatus: jest
        .fn()
        .mockImplementation((id: string, status: TransactionStatus) =>
          Promise.resolve(
            status === TransactionStatus.CONFIRMED
              ? ledger.confirm(id)
              : ledger.reject(id),
          ),
        ),
    };
    paymentMethodService = {
      verifyOwnership: jest.fn().mockResolvedValue(undefined),
      recalculateBalance: jest.fn().mockImplementation((id: string) => {
        ledger.recalculatePaymentMethodBalance(id);
        return Promise.resolve(undefined);
      }),
    };
    familyBalanceService = {
      recalculateBalances: jest.fn().mockImplementation((familyId: string) => {
        ledger.recalculateFamilyBalances(familyId);
        return Promise.resolve(undefined);
      }),
      updateBalancesAfterTransaction: jest
        .fn()
        .mockImplementation(
          (
            familyId: string,
            userId: string,
            transaction: LedgerTransaction,
          ) => {
            ledger.incrementFamilyBalances(
              familyId,
              userId,
              TransactionAmountNormalizer.signedDelta(transaction as never),
            );
            return Promise.resolve(undefined);
          },
        ),
    };
  });

  const updateExpense = () =>
    new UpdateExpenseUseCase(
      expenseRepository as never,
      { findById: jest.fn().mockResolvedValue({ id: 'category-1' }) } as never,
      transactionRepository as never,
      { findById: jest.fn().mockResolvedValue({ id: 'store-1' }) } as never,
      paymentMethodService as never,
      familyBalanceService as never,
      createPrismaServiceDouble(),
    );

  const deleteExpense = () =>
    new DeleteExpenseUseCase(
      expenseRepository as never,
      createPrismaServiceDouble({
        expenseItem: { deleteMany: jest.fn().mockResolvedValue(undefined) },
        expense: {
          delete: jest
            .fn()
            .mockImplementation(({ where }: { where: { id: string } }) => {
              ledger.removeExpense(where.id);
              return Promise.resolve(undefined);
            }),
        },
        transaction: { delete: jest.fn().mockResolvedValue(undefined) },
      }),
      paymentMethodService as never,
      familyBalanceService as never,
    );

  const approveExpense = () =>
    new ApprovePendingExpenseUseCase(
      expenseRepository as never,
      transactionRepository as never,
      {
        verifyApprovalAuthority: jest.fn().mockResolvedValue(undefined),
      } as never,
      familyBalanceService as never,
      paymentMethodService as never,
      { notify: jest.fn().mockResolvedValue(undefined) } as never,
      { execute: jest.fn().mockResolvedValue(undefined) } as never,
      createPrismaServiceDouble(),
    );

  const rejectExpense = () =>
    new RejectPendingExpenseUseCase(
      expenseRepository as never,
      transactionRepository as never,
      {
        verifyApprovalAuthority: jest.fn().mockResolvedValue(undefined),
      } as never,
      { execute: jest.fn().mockResolvedValue(undefined) } as never,
    );

  const confirmedExpense = (
    expenseId: string,
    overrides: Partial<Omit<LedgerTransaction, 'value'>> & { value: string },
  ) =>
    ledger.seed(expenseId, {
      id: `transaction-${expenseId}`,
      userId: ALICE,
      familyId: FAMILY,
      paymentMethodId: CARD,
      type: TransactionType.EXPENSE,
      status: TransactionStatus.CONFIRMED,
      ...overrides,
    });

  it('holds on the opening state, before anything happens', () => {
    expectBalanced();
    expect(ledger.cachedPaymentMethod(CARD).toString()).toBe('500');
  });

  it('holds after seeding confirmed expenses and incomes', () => {
    confirmedExpense('expense-1', { value: '25.50' });
    confirmedExpense('expense-2', {
      userId: BOB,
      value: '10',
      paymentMethodId: CASH,
    });
    confirmedExpense('expense-3', {
      value: '200',
      type: TransactionType.INCOME,
    });

    expectBalanced();
    expect(ledger.cachedFamily().toString()).toBe('164.5');
    expect(ledger.cachedPaymentMethod(CARD).toString()).toBe('674.5');
    expect(ledger.cachedPaymentMethod(CASH).toString()).toBe('70');
  });

  it('holds after an expense amount is updated', async () => {
    confirmedExpense('expense-1', { value: '25' });

    await updateExpense().execute(
      'expense-1',
      ALICE,
      new UpdateExpenseDto({ amount: new Decimal('75') }),
    );

    expectBalanced();
    expect(ledger.cachedFamily().toString()).toBe('-75');
    expect(ledger.cachedPaymentMethod(CARD).toString()).toBe('425');
  });

  it('holds after an expense is moved to another payment method', async () => {
    confirmedExpense('expense-1', { value: '25' });

    await updateExpense().execute(
      'expense-1',
      ALICE,
      new UpdateExpenseDto({ paymentMethodId: CASH }),
    );

    expectBalanced();
    expect(ledger.cachedPaymentMethod(CARD).toString()).toBe('500');
    expect(ledger.cachedPaymentMethod(CASH).toString()).toBe('55');
  });

  it('holds after an expense is deleted', async () => {
    confirmedExpense('expense-1', { value: '25' });
    confirmedExpense('expense-2', { userId: BOB, value: '10' });

    await deleteExpense().execute('expense-1', ALICE);

    expectBalanced();
    expect(ledger.cachedFamily().toString()).toBe('-10');
    expect(ledger.cachedMember(ALICE).toString()).toBe('0');
    expect(ledger.cachedPaymentMethod(CARD).toString()).toBe('490');
  });

  it('holds while a pending expense sits unapproved', () => {
    confirmedExpense('expense-1', {
      value: '40',
      status: TransactionStatus.PENDING,
    });

    expectBalanced();
    expect(ledger.cachedFamily().toString()).toBe('0');
    expect(ledger.cachedPaymentMethod(CARD).toString()).toBe('500');
  });

  it('holds after a pending expense is approved', async () => {
    confirmedExpense('expense-1', {
      value: '40',
      status: TransactionStatus.PENDING,
    });

    await approveExpense().execute('expense-1', BOB);

    expectBalanced();
    expect(ledger.cachedFamily().toString()).toBe('-40');
    expect(ledger.cachedMember(ALICE).toString()).toBe('-40');
    expect(ledger.cachedPaymentMethod(CARD).toString()).toBe('460');
  });

  it('holds after a pending expense is rejected', async () => {
    confirmedExpense('expense-1', {
      value: '40',
      status: TransactionStatus.PENDING,
    });

    await rejectExpense().execute('expense-1', BOB, 'not ours');

    expectBalanced();
    expect(ledger.cachedFamily().toString()).toBe('0');
    expect(ledger.cachedPaymentMethod(CARD).toString()).toBe('500');
  });

  it('holds across a create, approve, update, delete sequence', async () => {
    confirmedExpense('expense-1', { value: '12.35' });
    confirmedExpense('expense-2', {
      userId: BOB,
      value: '40',
      paymentMethodId: CASH,
      status: TransactionStatus.PENDING,
    });
    confirmedExpense('expense-3', {
      value: '300',
      type: TransactionType.INCOME,
    });
    expectBalanced();

    await approveExpense().execute('expense-2', ALICE);
    expectBalanced();

    await updateExpense().execute(
      'expense-1',
      ALICE,
      new UpdateExpenseDto({ amount: new Decimal('99.99') }),
    );
    expectBalanced();

    await deleteExpense().execute('expense-3', ALICE);
    expectBalanced();

    expect(ledger.cachedFamily().toString()).toBe('-139.99');
    expect(ledger.cachedMember(ALICE).toString()).toBe('-99.99');
    expect(ledger.cachedMember(BOB).toString()).toBe('-40');
    expect(ledger.cachedPaymentMethod(CARD).toString()).toBe('400.01');
    expect(ledger.cachedPaymentMethod(CASH).toString()).toBe('40');
  });

  it('holds when a rejected expense is later deleted', async () => {
    confirmedExpense('expense-1', {
      value: '40',
      status: TransactionStatus.PENDING,
    });

    await rejectExpense().execute('expense-1', BOB, 'not ours');
    await deleteExpense().execute('expense-1', ALICE);

    expectBalanced();
    expect(ledger.cachedFamily().toString()).toBe('0');
  });

  it('has no fourth cache to reconcile, because User.balance is gone', () => {
    const schema = readFileSync(
      join(__dirname, '../../../../../../prisma/schema/schema.prisma'),
      'utf8',
    );
    const userModel = /model User \{[^}]*\}/.exec(schema)?.[0];

    expect(userModel).toBeDefined();
    expect(userModel).not.toMatch(/^\s*balance\s/m);
  });

  it('would catch an update that changed the amount without recalculating', () => {
    confirmedExpense('expense-1', { value: '25' });

    ledger.updateTransaction('transaction-expense-1', { value: '75' });

    expect(() => expectBalanced()).toThrow();
  });
});
