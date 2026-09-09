import { GetExpenseStatisticsUseCase } from './get-expense-statistics.use-case';
import { ExpenseFilters } from '../dto/expense-filters.dto';
import { DomainForbiddenException } from '~common/exceptions/domain.exceptions';

const member = 'member-1';
const outsider = 'outsider-1';

describe('GetExpenseStatisticsUseCase', () => {
  let expenseRepository: { getStatistics: jest.Mock };
  let familyService: { verifyMembership: jest.Mock };
  let useCase: GetExpenseStatisticsUseCase;

  beforeEach(() => {
    expenseRepository = {
      getStatistics: jest.fn().mockResolvedValue({
        totalExpenses: 100,
        expenseCount: 2,
        averageExpense: 50,
        expensesByCategory: [],
        expensesByStore: [],
      }),
    };
    familyService = {
      verifyMembership: jest
        .fn()
        .mockImplementation((_familyId: string, userId: string) => {
          if (userId !== member) {
            throw new DomainForbiddenException('Not a member of this family');
          }
          return Promise.resolve();
        }),
    };
    useCase = new GetExpenseStatisticsUseCase(
      expenseRepository as never,
      familyService as never,
    );
  });

  it('rejects statistics for a family the caller does not belong to', async () => {
    const filters = new ExpenseFilters({ familyId: 'family-1' });

    await expect(useCase.execute(outsider, filters)).rejects.toBeInstanceOf(
      DomainForbiddenException,
    );

    expect(expenseRepository.getStatistics).not.toHaveBeenCalled();
  });

  it('returns statistics for a family the caller belongs to', async () => {
    const filters = new ExpenseFilters({ familyId: 'family-1' });

    const stats = await useCase.execute(member, filters);

    expect(familyService.verifyMembership).toHaveBeenCalledWith(
      'family-1',
      member,
    );
    expect(expenseRepository.getStatistics).toHaveBeenCalledWith(filters);
    expect(stats.totalExpenses).toBe(100);
  });

  it('skips the membership check for personal statistics', async () => {
    const filters = new ExpenseFilters({ userId: outsider });

    await useCase.execute(outsider, filters);

    expect(familyService.verifyMembership).not.toHaveBeenCalled();
  });
});
