import { Decimal } from 'prisma/generated/prisma/internal/prismaNamespace';
import { PaymentMethodType } from '../../domain/value-objects/payment-method-type.enum';
import { GetBalanceUseCase } from './get-balance.use-case';

const USER = 'user-1';

describe('GetBalanceUseCase', () => {
  let paymentMethodRepository: Record<string, jest.Mock>;
  let transactionRepository: Record<string, jest.Mock>;
  let familyService: Record<string, jest.Mock>;
  let useCase: GetBalanceUseCase;

  beforeEach(() => {
    paymentMethodRepository = {
      getBalanceSummary: jest.fn().mockResolvedValue([
        {
          id: 'pm-1',
          name: 'Karta e debitit',
          type: PaymentMethodType.DEBIT_CARD,
          color: '#111111',
          currentBalance: new Decimal('120.50'),
        },
        {
          id: 'pm-2',
          name: 'Kesh',
          type: PaymentMethodType.CASH,
          color: '#222222',
          currentBalance: new Decimal('20.00'),
        },
      ]),
      findAllByUserId: jest.fn(),
    };
    transactionRepository = {
      getPersonalBalance: jest.fn().mockResolvedValue(new Decimal('75.25')),
    };
    familyService = {
      findByUserId: jest.fn().mockResolvedValue([
        { id: 'fam-1', name: 'Krasniqi', balance: new Decimal('300') },
        { id: 'fam-2', name: 'Berisha', balance: new Decimal('50') },
      ]),
      findMembershipsOfUser: jest
        .fn()
        .mockResolvedValue([{ familyId: 'fam-1', balance: new Decimal('90') }]),
      findMember: jest.fn(),
    };
    useCase = new GetBalanceUseCase(
      paymentMethodRepository as never,
      transactionRepository as never,
      familyService as never,
    );
  });

  it('takes the payment method type from the balance summary itself', async () => {
    const result = await useCase.execute(USER);

    expect(result.paymentMethods.map((pm) => pm.type)).toEqual([
      PaymentMethodType.DEBIT_CARD,
      PaymentMethodType.CASH,
    ]);
    expect(paymentMethodRepository.findAllByUserId).not.toHaveBeenCalled();
  });

  it('reads every family membership in a single query', async () => {
    await useCase.execute(USER);

    expect(familyService.findMembershipsOfUser).toHaveBeenCalledTimes(1);
    expect(familyService.findMember).not.toHaveBeenCalled();
  });

  it('sums the payment method balances', async () => {
    const result = await useCase.execute(USER);

    expect(result.totalBalance.toString()).toBe('140.5');
  });

  it('delegates the personal balance to the transaction repository', async () => {
    const result = await useCase.execute(USER);

    expect(transactionRepository.getPersonalBalance).toHaveBeenCalledWith(USER);
    expect(result.personalBalance.toString()).toBe('75.25');
  });

  it('reports zero contribution for a family the user has no membership row in', async () => {
    const result = await useCase.execute(USER);

    expect(result.families).toEqual([
      expect.objectContaining({
        familyId: 'fam-1',
        userContribution: new Decimal('90'),
      }),
      expect.objectContaining({
        familyId: 'fam-2',
        userContribution: new Decimal('0'),
      }),
    ]);
  });
});
