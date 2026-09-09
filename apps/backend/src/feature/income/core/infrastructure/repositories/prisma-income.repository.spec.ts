import { firstCallArgument } from '~test/mock-call';
import { PrismaIncomeRepository } from './prisma-income.repository';

const USER = 'user-1';

function captureWhere() {
  const findMany = jest.fn().mockResolvedValue([]);
  const count = jest.fn().mockResolvedValue(0);
  const update = jest.fn().mockResolvedValue(null);
  const findFirst = jest.fn().mockResolvedValue(null);

  return {
    findMany,
    count,
    update,
    findFirst,
    repository: new PrismaIncomeRepository({
      income: { findMany, count, update, findFirst },
    } as never),
  };
}

describe('PrismaIncomeRepository soft delete', () => {
  it('hides soft deleted incomes and their transactions from listings', async () => {
    const { findMany, repository } = captureWhere();

    await repository.findAll({ userId: USER });

    const { where } = firstCallArgument<{
      where: { deletedAt: Date | null; transaction: { deletedAt: Date | null } };
    }>(findMany);

    expect(where.deletedAt).toBeNull();
    expect(where.transaction.deletedAt).toBeNull();
  });

  it('hides soft deleted incomes from a lookup by id', async () => {
    const { findFirst, repository } = captureWhere();

    await repository.findById('income-1');

    expect(firstCallArgument<{ where: unknown }>(findFirst).where).toEqual({
      id: 'income-1',
      deletedAt: null,
      transaction: { deletedAt: null },
    });
  });

  it('marks a deleted income instead of removing the row', async () => {
    const { update, repository } = captureWhere();

    await repository.delete('income-1');

    expect(update).toHaveBeenCalledWith({
      where: { id: 'income-1' },
      data: { deletedAt: expect.any(Date) },
    });
  });
});
