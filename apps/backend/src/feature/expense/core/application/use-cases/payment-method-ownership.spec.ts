import { UpdateExpenseUseCase } from './update-expense.use-case';
import { UpdatePendingExpenseUseCase } from './update-pending-expense.use-case';
import { ResubmitRejectedExpenseUseCase } from './resubmit-rejected-expense.use-case';
import { UpdateExpenseDto } from '../dto/update-expense.dto';
import { UpdatePendingExpenseDto } from '../dto/update-pending-expense.dto';
import { ResubmitExpenseDto } from '../dto/resubmit-expense.dto';
import { createPrismaServiceDouble } from '~test/prisma-service.double';
import { DomainForbiddenException } from '~common/exceptions/domain.exceptions';

const owner = 'owner-1';
const victimPaymentMethod = 'victim-payment-method';
const ownPaymentMethod = 'own-payment-method';

describe('expense update paths verify payment method ownership', () => {
  let expenseRepository: Record<string, jest.Mock>;
  let transactionRepository: Record<string, jest.Mock>;
  let expenseCategoryRepository: Record<string, jest.Mock>;
  let storeService: Record<string, jest.Mock>;
  let notifyFamilyMembersService: Record<string, jest.Mock>;
  let paymentMethodService: { verifyOwnership: jest.Mock };
  let familyBalanceService: Record<string, jest.Mock>;

  const transaction = {
    id: 'transaction-1',
    userId: owner,
    familyId: null,
    isRejected: () => true,
    canBeModified: () => true,
  };

  beforeEach(() => {
    expenseRepository = {
      findById: jest.fn().mockResolvedValue({
        id: 'expense-1',
        transactionId: 'transaction-1',
        transaction,
      }),
      verifyOwnership: jest.fn().mockResolvedValue(true),
      update: jest.fn().mockResolvedValue({ id: 'expense-1' }),
    };
    transactionRepository = {
      update: jest.fn().mockResolvedValue(undefined),
      updateStatus: jest.fn().mockResolvedValue(undefined),
    };
    expenseCategoryRepository = {
      findById: jest.fn().mockResolvedValue({ id: 'category-1' }),
    };
    storeService = { findById: jest.fn().mockResolvedValue({ id: 'store-1' }) };
    familyBalanceService = {
      recalculateBalances: jest.fn().mockResolvedValue(undefined),
    };
    notifyFamilyMembersService = {
      notify: jest.fn().mockResolvedValue(undefined),
    };
    paymentMethodService = {
      verifyOwnership: jest
        .fn()
        .mockImplementation((paymentMethodId: string) => {
          if (paymentMethodId !== ownPaymentMethod) {
            throw new DomainForbiddenException(
              'Payment method does not belong to this user',
            );
          }
          return Promise.resolve();
        }),
    };
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
    );

  const updatePending = () =>
    new UpdatePendingExpenseUseCase(
      expenseRepository as never,
      transactionRepository as never,
      paymentMethodService as never,
    );

  const resubmit = () =>
    new ResubmitRejectedExpenseUseCase(
      expenseRepository as never,
      transactionRepository as never,
      notifyFamilyMembersService as never,
      paymentMethodService as never,
    );

  it("rejects moving an expense onto another user's payment method", async () => {
    await expect(
      updateExpense().execute(
        'expense-1',
        owner,
        new UpdateExpenseDto({ paymentMethodId: victimPaymentMethod }),
      ),
    ).rejects.toBeInstanceOf(DomainForbiddenException);

    expect(transactionRepository.update).not.toHaveBeenCalled();
  });

  it("rejects moving a pending expense onto another user's payment method", async () => {
    await expect(
      updatePending().execute(
        'expense-1',
        owner,
        new UpdatePendingExpenseDto({ paymentMethodId: victimPaymentMethod }),
      ),
    ).rejects.toBeInstanceOf(DomainForbiddenException);

    expect(transactionRepository.update).not.toHaveBeenCalled();
  });

  it("rejects resubmitting onto another user's payment method", async () => {
    await expect(
      resubmit().execute(
        'expense-1',
        owner,
        new ResubmitExpenseDto({ paymentMethodId: victimPaymentMethod }),
      ),
    ).rejects.toBeInstanceOf(DomainForbiddenException);

    expect(transactionRepository.update).not.toHaveBeenCalled();
    expect(transactionRepository.updateStatus).not.toHaveBeenCalled();
  });

  it('allows the caller to use their own payment method', async () => {
    await updatePending().execute(
      'expense-1',
      owner,
      new UpdatePendingExpenseDto({ paymentMethodId: ownPaymentMethod }),
    );

    expect(paymentMethodService.verifyOwnership).toHaveBeenCalledWith(
      ownPaymentMethod,
      owner,
    );
    expect(transactionRepository.update).toHaveBeenCalled();
  });
});
