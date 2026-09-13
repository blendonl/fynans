import { firstCallArgument } from '~test/mock-call';
import { PrismaTransactionRepository } from './prisma-transaction.repository';
import { TransactionFilters } from '../../application/dto/transaction-filters.dto';

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
    repository: new PrismaTransactionRepository({
      db: { transaction: { findMany, count, update, findFirst } },
    } as never),
  };
}

describe('PrismaTransactionRepository soft delete', () => {
  it('hides soft deleted transactions from listings', async () => {
    const { findMany, count, repository } = captureWhere();

    await repository.findAll(new TransactionFilters({ userId: USER }));

    expect(firstCallArgument<{ where: unknown }>(findMany).where).toMatchObject(
      { deletedAt: null },
    );
    expect(firstCallArgument<{ where: unknown }>(count).where).toMatchObject({
      deletedAt: null,
    });
  });

  it('hides soft deleted transactions from a lookup by id', async () => {
    const { findFirst, repository } = captureWhere();

    await repository.findById('transaction-1');

    expect(firstCallArgument<{ where: unknown }>(findFirst).where).toEqual({
      id: 'transaction-1',
      deletedAt: null,
    });
  });

  it('marks a deleted transaction instead of removing the row', async () => {
    const { update, repository } = captureWhere();

    await repository.delete('transaction-1');

    expect(update).toHaveBeenCalledWith({
      where: { id: 'transaction-1' },
      data: { deletedAt: expect.any(Date) },
    });
  });
});
