import { createPrismaServiceDouble } from '~test/prisma-service.double';
import { createRecordFinancialAuditDouble } from '~test/financial-audit.double';
import { CreateIncomeUseCase } from './create-income.use-case';
import { CreateIncomeDto } from '../dto/create-income.dto';
import { DomainForbiddenException } from '~common/exceptions/domain.exceptions';

const owner = 'owner-1';
const attacker = 'attacker-1';

describe('CreateIncomeUseCase', () => {
  let incomeRepository: { create: jest.Mock; findByTransactionId: jest.Mock };
  let incomeCategoryRepository: { findById: jest.Mock; linkToUser: jest.Mock };
  let getTransactionByIdUseCase: { execute: jest.Mock };
  let notifyFamilyMembersService: { notify: jest.Mock };
  let useCase: CreateIncomeUseCase;

  beforeEach(() => {
    incomeRepository = {
      create: jest.fn().mockResolvedValue({ id: 'income-1' }),
      findByTransactionId: jest.fn().mockResolvedValue(null),
    };
    incomeCategoryRepository = {
      findById: jest.fn().mockResolvedValue({ id: 'category-1' }),
      linkToUser: jest.fn().mockResolvedValue(undefined),
    };
    getTransactionByIdUseCase = {
      execute: jest.fn().mockResolvedValue({
        id: 'transaction-1',
        userId: owner,
        familyId: null,
        value: 100,
      }),
    };
    notifyFamilyMembersService = {
      notify: jest.fn().mockResolvedValue(undefined),
    };

    useCase = new CreateIncomeUseCase(
      incomeRepository as never,
      incomeCategoryRepository as never,
      getTransactionByIdUseCase as never,
      notifyFamilyMembersService as never,
      createPrismaServiceDouble(),
      createRecordFinancialAuditDouble(),
    );
  });

  it("rejects attaching an income to another user's transaction", async () => {
    const dto = new CreateIncomeDto(
      'transaction-1',
      'category-1',
      attacker,
      'store-1',
    );

    await expect(useCase.execute(dto)).rejects.toBeInstanceOf(
      DomainForbiddenException,
    );

    expect(incomeRepository.create).not.toHaveBeenCalled();
    expect(incomeCategoryRepository.linkToUser).not.toHaveBeenCalled();
    expect(notifyFamilyMembersService.notify).not.toHaveBeenCalled();
  });

  it('creates the income for the transaction owner', async () => {
    const dto = new CreateIncomeDto(
      'transaction-1',
      'category-1',
      owner,
      'store-1',
    );

    await expect(useCase.execute(dto)).resolves.toEqual({ id: 'income-1' });

    expect(getTransactionByIdUseCase.execute).toHaveBeenCalledWith(
      'transaction-1',
    );
    expect(incomeRepository.create).toHaveBeenCalled();
  });
});
