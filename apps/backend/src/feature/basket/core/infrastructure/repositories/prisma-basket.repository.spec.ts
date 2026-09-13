import { callArguments, firstCallArgument } from '~test/mock-call';
import { PrismaBasketRepository } from './prisma-basket.repository';

const USER = 'user-1';
const FAMILY_A = 'family-a';
const FAMILY_B = 'family-b';

function basketRow(id: string, familyId: string | null, scope: string) {
  return {
    id,
    userId: USER,
    familyId,
    scope,
    items: [],
    family: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  };
}

describe('PrismaBasketRepository', () => {
  describe('upsertFamily', () => {
    it('keys a family basket on the family alone', async () => {
      const upsert = jest
        .fn()
        .mockResolvedValue(basketRow('basket-a', FAMILY_A, 'FAMILY'));
      const repository = new PrismaBasketRepository({
        db: { basket: { upsert } },
      } as never);

      await repository.upsertFamily(FAMILY_A, USER);

      expect(firstCallArgument<{ where: unknown }>(upsert).where).toEqual({
        familyId: FAMILY_A,
      });
    });

    it('gives a user in two families a basket in each', async () => {
      const upsert = jest
        .fn()
        .mockResolvedValueOnce(basketRow('basket-a', FAMILY_A, 'FAMILY'))
        .mockResolvedValueOnce(basketRow('basket-b', FAMILY_B, 'FAMILY'));
      const repository = new PrismaBasketRepository({
        db: { basket: { upsert } },
      } as never);

      const first = await repository.upsertFamily(FAMILY_A, USER);
      const second = await repository.upsertFamily(FAMILY_B, USER);

      expect(first.id).toBe('basket-a');
      expect(second.id).toBe('basket-b');
      expect(
        callArguments<{ where: unknown }>(upsert).map((call) => call.where),
      ).toEqual([{ familyId: FAMILY_A }, { familyId: FAMILY_B }]);
    });
  });

  describe('upsertPersonal', () => {
    it('returns the existing personal basket without creating another', async () => {
      const findFirst = jest
        .fn()
        .mockResolvedValue(basketRow('basket-personal', null, 'PERSONAL'));
      const create = jest.fn();
      const repository = new PrismaBasketRepository({
        db: { basket: { findFirst, create } },
      } as never);

      const basket = await repository.upsertPersonal(USER);

      expect(basket.id).toBe('basket-personal');
      expect(findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: USER, scope: 'PERSONAL' },
        }),
      );
      expect(create).not.toHaveBeenCalled();
    });

    it('creates the personal basket the first time', async () => {
      const findFirst = jest.fn().mockResolvedValue(null);
      const create = jest
        .fn()
        .mockResolvedValue(basketRow('basket-personal', null, 'PERSONAL'));
      const repository = new PrismaBasketRepository({
        db: { basket: { findFirst, create } },
      } as never);

      const basket = await repository.upsertPersonal(USER);

      expect(basket.id).toBe('basket-personal');
      expect(firstCallArgument<{ data: unknown }>(create).data).toEqual({
        userId: USER,
        scope: 'PERSONAL',
      });
    });
  });
});
