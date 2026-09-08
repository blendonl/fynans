import { CreateTransactionUseCase } from './create-transaction.use-case';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { TransactionType } from '../../domain/value-objects/transaction-type.vo';
import { DomainForbiddenException } from '~common/exceptions/domain.exceptions';

const owner = 'owner-1';

describe('CreateTransactionUseCase payment method ownership', () => {
  let transactionRepository: { create: jest.Mock };
  let familyService: { findMember: jest.Mock };
  let familyBalanceService: { updateBalancesAfterTransaction: jest.Mock };
  let paymentMethodService: { verifyOwnership: jest.Mock };
  let useCase: CreateTransactionUseCase;

  const dtoFor = (paymentMethodId?: string) =>
    new CreateTransactionDto(
      owner,
      TransactionType.EXPENSE,
      25,
      undefined,
      undefined,
      paymentMethodId,
    );

  beforeEach(() => {
    transactionRepository = { create: jest.fn().mockResolvedValue({ id: 'transaction-1' }) };
    familyService = { findMember: jest.fn().mockResolvedValue({ userId: owner }) };
    familyBalanceService = {
      updateBalancesAfterTransaction: jest.fn().mockResolvedValue(undefined),
    };
    paymentMethodService = {
      verifyOwnership: jest.fn().mockImplementation((_id: string, userId: string) => {
        if (userId !== owner) {
          throw new DomainForbiddenException('Payment method does not belong to this user');
        }
        return Promise.resolve();
      }),
    };

    useCase = new CreateTransactionUseCase(
      transactionRepository as never,
      familyService as never,
      familyBalanceService as never,
      paymentMethodService as never,
    );
  });

  it("rejects a payment method that belongs to another user", async () => {
    paymentMethodService.verifyOwnership.mockRejectedValue(
      new DomainForbiddenException('Payment method does not belong to this user'),
    );

    await expect(useCase.execute(dtoFor('victim-payment-method'))).rejects.toBeInstanceOf(
      DomainForbiddenException,
    );

    expect(transactionRepository.create).not.toHaveBeenCalled();
  });

  it('creates the transaction when the payment method belongs to the caller', async () => {
    await useCase.execute(dtoFor('own-payment-method'));

    expect(paymentMethodService.verifyOwnership).toHaveBeenCalledWith(
      'own-payment-method',
      owner,
    );
    expect(transactionRepository.create).toHaveBeenCalled();
  });

  it('skips the check when no payment method is supplied', async () => {
    await useCase.execute(dtoFor(undefined));

    expect(paymentMethodService.verifyOwnership).not.toHaveBeenCalled();
    expect(transactionRepository.create).toHaveBeenCalled();
  });
});
