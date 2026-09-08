import { ListTransactionsUseCase } from './list-transactions.use-case';
import { TransactionFilters } from '../dto/transaction-filters.dto';
import { DomainForbiddenException } from '~common/exceptions/domain.exceptions';

const member = 'member-1';
const outsider = 'outsider-1';

describe('ListTransactionsUseCase', () => {
  let transactionRepository: { findAll: jest.Mock };
  let familyService: { verifyMembership: jest.Mock };
  let useCase: ListTransactionsUseCase;

  beforeEach(() => {
    transactionRepository = {
      findAll: jest.fn().mockResolvedValue({ data: [], total: 0 }),
    };
    familyService = {
      verifyMembership: jest.fn().mockImplementation((_familyId: string, userId: string) => {
        if (userId !== member) {
          throw new DomainForbiddenException('Not a member of this family');
        }
        return Promise.resolve();
      }),
    };
    useCase = new ListTransactionsUseCase(
      transactionRepository as never,
      familyService as never,
    );
  });

  it("rejects listing another family's transactions", async () => {
    const filters = new TransactionFilters({ familyId: 'family-1' });

    await expect(useCase.execute(outsider, filters)).rejects.toBeInstanceOf(
      DomainForbiddenException,
    );

    expect(transactionRepository.findAll).not.toHaveBeenCalled();
  });

  it('lists transactions for a family the caller belongs to', async () => {
    const filters = new TransactionFilters({ familyId: 'family-1' });

    await useCase.execute(member, filters);

    expect(familyService.verifyMembership).toHaveBeenCalledWith('family-1', member);
    expect(transactionRepository.findAll).toHaveBeenCalledWith(filters, undefined);
  });

  it('skips the membership check for personal listings', async () => {
    const filters = new TransactionFilters({ userId: outsider });

    await useCase.execute(outsider, filters);

    expect(familyService.verifyMembership).not.toHaveBeenCalled();
  });
});
