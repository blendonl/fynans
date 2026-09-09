import { Decimal } from 'prisma/generated/prisma/internal/prismaNamespace';
import { createPrismaServiceDouble } from '~test/prisma-service.double';
import { createRecordFinancialAuditDouble } from '~test/financial-audit.double';
import { UpdateExpenseUseCase } from './update-expense.use-case';
import { DeleteExpenseUseCase } from './delete-expense.use-case';
import { ApprovePendingExpenseUseCase } from './approve-pending-expense.use-case';
import { RejectPendingExpenseUseCase } from './reject-pending-expense.use-case';
import { UpdateExpenseDto } from '../dto/update-expense.dto';
import { TransactionStatus } from '../../../../transaction/core/domain/value-objects/transaction-status.vo';
import { TransactionType } from '../../../../transaction/core/domain/value-objects/transaction-type.vo';

const OWNER = 'owner-1';
const FAMILY = 'family-1';
const PAYMENT_METHOD = 'payment-method-1';

function familyTransaction(status: TransactionStatus) {
  return {
    id: 'transaction-1',
    userId: OWNER,
    familyId: FAMILY,
    paymentMethodId: PAYMENT_METHOD,
    type: TransactionType.EXPENSE,
    status,
    value: new Decimal('30'),
    isPending: () => status === TransactionStatus.PENDING,
  };
}

describe('expense mutations keep denormalized balances current', () => {
  let expenseRepository: Record<string, jest.Mock>;
  let transactionRepository: Record<string, jest.Mock>;
  let expenseCategoryRepository: Record<string, jest.Mock>;
  let storeService: Record<string, jest.Mock>;
  let paymentMethodService: Record<string, jest.Mock>;
  let familyBalanceService: Record<string, jest.Mock>;
  let expenseAuthService: Record<string, jest.Mock>;
  let notifyFamilyMembersService: Record<string, jest.Mock>;
  let createNotificationUseCase: Record<string, jest.Mock>;
  let prismaModels: Record<string, Record<string, jest.Mock>>;

  const expenseWith = (status: TransactionStatus) => ({
    id: 'expense-1',
    transactionId: 'transaction-1',
    transaction: familyTransaction(status),
  });

  beforeEach(() => {
    expenseRepository = {
      findById: jest
        .fn()
        .mockResolvedValue(expenseWith(TransactionStatus.CONFIRMED)),
      verifyOwnership: jest.fn().mockResolvedValue(true),
      update: jest.fn().mockResolvedValue({ id: 'expense-1' }),
      delete: jest.fn().mockResolvedValue(undefined),
    };
    transactionRepository = {
      update: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
      updateStatus: jest
        .fn()
        .mockResolvedValue(familyTransaction(TransactionStatus.CONFIRMED)),
    };
    expenseCategoryRepository = {
      findById: jest.fn().mockResolvedValue({ id: 'category-1' }),
    };
    storeService = { findById: jest.fn().mockResolvedValue({ id: 'store-1' }) };
    paymentMethodService = {
      verifyOwnership: jest.fn().mockResolvedValue(undefined),
      recalculateBalance: jest.fn().mockResolvedValue(undefined),
    };
    familyBalanceService = {
      recalculateBalances: jest.fn().mockResolvedValue(undefined),
      updateBalancesAfterTransaction: jest.fn().mockResolvedValue(undefined),
    };
    expenseAuthService = {
      verifyApprovalAuthority: jest.fn().mockResolvedValue(undefined),
    };
    notifyFamilyMembersService = {
      notify: jest.fn().mockResolvedValue(undefined),
    };
    createNotificationUseCase = {
      execute: jest.fn().mockResolvedValue(undefined),
    };
    prismaModels = {};
  });

  const updateExpense = () =>
    new UpdateExpenseUseCase(
      expenseRepository as never,
      expenseCategoryRepository as never,
      transactionRepository as never,
      storeService as never,
      paymentMethodService as never,
      familyBalanceService as never,
      createPrismaServiceDouble(),
      createRecordFinancialAuditDouble(),
    );

  const deleteExpense = () =>
    new DeleteExpenseUseCase(
      expenseRepository as never,
      transactionRepository as never,
      createPrismaServiceDouble(prismaModels),
      paymentMethodService as never,
      familyBalanceService as never,
      createRecordFinancialAuditDouble(),
    );

  const approveExpense = () =>
    new ApprovePendingExpenseUseCase(
      expenseRepository as never,
      transactionRepository as never,
      expenseAuthService as never,
      familyBalanceService as never,
      paymentMethodService as never,
      notifyFamilyMembersService as never,
      createNotificationUseCase as never,
      createPrismaServiceDouble(),
      createRecordFinancialAuditDouble(),
    );

  const rejectExpense = () =>
    new RejectPendingExpenseUseCase(
      expenseRepository as never,
      transactionRepository as never,
      expenseAuthService as never,
      createNotificationUseCase as never,
      createRecordFinancialAuditDouble(),
    );

  it('recalculates family and payment method balances on update', async () => {
    await updateExpense().execute(
      'expense-1',
      OWNER,
      new UpdateExpenseDto({ amount: new Decimal('99') }),
    );

    expect(familyBalanceService.recalculateBalances).toHaveBeenCalledWith(
      FAMILY,
    );
    expect(paymentMethodService.recalculateBalance).toHaveBeenCalledWith(
      PAYMENT_METHOD,
    );
  });

  it('skips balance work when an update changes nothing on the transaction', async () => {
    await updateExpense().execute(
      'expense-1',
      OWNER,
      new UpdateExpenseDto({ note: 'renamed' }),
    );

    expect(familyBalanceService.recalculateBalances).not.toHaveBeenCalled();
    expect(paymentMethodService.recalculateBalance).not.toHaveBeenCalled();
  });

  it('recalculates the balance of both payment methods when one is swapped in', async () => {
    await updateExpense().execute(
      'expense-1',
      OWNER,
      new UpdateExpenseDto({ paymentMethodId: 'payment-method-2' }),
    );

    expect(paymentMethodService.recalculateBalance).toHaveBeenCalledWith(
      PAYMENT_METHOD,
    );
    expect(paymentMethodService.recalculateBalance).toHaveBeenCalledWith(
      'payment-method-2',
    );
  });

  it('recalculates family and payment method balances on delete', async () => {
    await deleteExpense().execute('expense-1', OWNER);

    expect(familyBalanceService.recalculateBalances).toHaveBeenCalledWith(
      FAMILY,
    );
    expect(paymentMethodService.recalculateBalance).toHaveBeenCalledWith(
      PAYMENT_METHOD,
    );
  });

  it('soft deletes the expense and its transaction together', async () => {
    await deleteExpense().execute('expense-1', OWNER);

    expect(expenseRepository.delete).toHaveBeenCalledWith('expense-1');
    expect(transactionRepository.delete).toHaveBeenCalledWith('transaction-1');
  });

  it('increments family balances when a pending expense is approved', async () => {
    expenseRepository.findById.mockResolvedValue(
      expenseWith(TransactionStatus.PENDING),
    );

    await approveExpense().execute('expense-1', 'admin-1');

    expect(
      familyBalanceService.updateBalancesAfterTransaction,
    ).toHaveBeenCalledWith(FAMILY, OWNER, expect.anything());
    expect(paymentMethodService.recalculateBalance).toHaveBeenCalledWith(
      PAYMENT_METHOD,
    );
  });

  it('leaves balances alone when a pending expense is rejected', async () => {
    expenseRepository.findById.mockResolvedValue(
      expenseWith(TransactionStatus.PENDING),
    );

    await rejectExpense().execute('expense-1', 'admin-1', 'not ours');

    expect(
      familyBalanceService.updateBalancesAfterTransaction,
    ).not.toHaveBeenCalled();
    expect(familyBalanceService.recalculateBalances).not.toHaveBeenCalled();
    expect(paymentMethodService.recalculateBalance).not.toHaveBeenCalled();
  });
});
