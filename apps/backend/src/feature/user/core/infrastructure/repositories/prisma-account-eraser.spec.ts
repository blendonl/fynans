import { createPrismaServiceDouble } from '~test/prisma-service.double';
import { firstCallArgument } from '~test/mock-call';
import { PrismaAccountEraser } from './prisma-account-eraser';

const USER = 'user-1';
const FAMILY = 'family-1';

interface Membership {
  userId: string;
  role: string;
  familyId?: string;
}

function build(
  options: {
    transactionIds?: string[];
    storageKeys?: string[];
    memberships?: Membership[];
    remainingMembers?: Membership[];
    familyBasket?: { id: string } | null;
    familyTransactions?: number;
  } = {},
) {
  const transactionIds = options.transactionIds ?? ['transaction-1'];
  const memberships = options.memberships ?? [];
  const remainingMembers = options.remainingMembers ?? [];

  const db = {
    transaction: {
      findMany: jest
        .fn()
        .mockResolvedValue(transactionIds.map((id) => ({ id }))),
      deleteMany: jest.fn().mockResolvedValue({ count: transactionIds.length }),
      count: jest.fn().mockResolvedValue(options.familyTransactions ?? 0),
    },
    receipt: {
      findMany: jest
        .fn()
        .mockResolvedValue(
          (options.storageKeys ?? []).map((storageKey) => ({ storageKey })),
        ),
      deleteMany: jest
        .fn()
        .mockResolvedValue({ count: (options.storageKeys ?? []).length }),
    },
    familyMember: {
      findMany: jest
        .fn()
        .mockResolvedValueOnce(
          memberships.map((member) => ({
            familyId: member.familyId ?? FAMILY,
          })),
        )
        .mockResolvedValue(remainingMembers),
      findFirst: jest.fn().mockResolvedValue(remainingMembers[0] ?? null),
      update: jest.fn().mockResolvedValue(null),
    },
    basket: {
      findFirst: jest.fn().mockResolvedValue(options.familyBasket ?? null),
      update: jest.fn().mockResolvedValue(null),
    },
    financialAuditLog: {
      deleteMany: jest.fn().mockResolvedValue({ count: 3 }),
    },
    expense: { deleteMany: jest.fn().mockResolvedValue({ count: 1 }) },
    income: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
    user: { delete: jest.fn().mockResolvedValue(null) },
    family: { delete: jest.fn().mockResolvedValue(null) },
  };

  return { db, eraser: new PrismaAccountEraser(createPrismaServiceDouble(db)) };
}

describe('PrismaAccountEraser', () => {
  it('collects the storage keys of receipts the account uploaded and of receipts on its expenses', async () => {
    const { db, eraser } = build({
      storageKeys: ['receipts/a.jpg', 'receipts/a.jpg', 'receipts/b.jpg'],
    });

    const erasure = await eraser.erase(USER);

    expect(erasure.storageKeys).toEqual(['receipts/a.jpg', 'receipts/b.jpg']);
    expect(
      firstCallArgument<{ where: unknown }>(db.receipt.findMany).where,
    ).toEqual({
      OR: [
        { userId: USER },
        { expense: { transactionId: { in: ['transaction-1'] } } },
      ],
    });
  });

  it('clears audit entries the account wrote and entries about its transactions', async () => {
    const { db, eraser } = build();

    await eraser.erase(USER);

    expect(
      firstCallArgument<{ where: unknown }>(db.financialAuditLog.deleteMany)
        .where,
    ).toEqual({
      OR: [{ actorId: USER }, { transactionId: { in: ['transaction-1'] } }],
    });
  });

  it('removes the rows rather than marking them deleted', async () => {
    const { db, eraser } = build();

    await eraser.erase(USER);

    expect(db.transaction.deleteMany).toHaveBeenCalledWith({
      where: { userId: USER },
    });
    expect(db.user.delete).toHaveBeenCalledWith({ where: { id: USER } });
  });

  describe('families the account belonged to', () => {
    it('hands ownership to the longest standing admin', async () => {
      const { db, eraser } = build({
        memberships: [{ userId: USER, role: 'OWNER' }],
        remainingMembers: [
          { userId: 'user-2', role: 'MEMBER' },
          { userId: 'user-3', role: 'ADMIN' },
        ],
      });

      const erasure = await eraser.erase(USER);

      expect(db.familyMember.update).toHaveBeenCalledWith({
        where: { familyId_userId: { familyId: FAMILY, userId: 'user-3' } },
        data: { role: 'OWNER' },
      });
      expect(erasure.families).toEqual([
        {
          familyId: FAMILY,
          outcome: 'ownership-transferred',
          newOwnerId: 'user-3',
        },
      ]);
    });

    it('falls back to the longest standing member when no admin is left', async () => {
      const { db, eraser } = build({
        memberships: [{ userId: USER, role: 'OWNER' }],
        remainingMembers: [
          { userId: 'user-2', role: 'MEMBER' },
          { userId: 'user-3', role: 'MEMBER' },
        ],
      });

      await eraser.erase(USER);

      expect(db.familyMember.update).toHaveBeenCalledWith({
        where: { familyId_userId: { familyId: FAMILY, userId: 'user-2' } },
        data: { role: 'OWNER' },
      });
    });

    it('leaves a family alone when it still has an owner', async () => {
      const { db, eraser } = build({
        memberships: [{ userId: USER, role: 'MEMBER' }],
        remainingMembers: [{ userId: 'user-2', role: 'OWNER' }],
      });

      const erasure = await eraser.erase(USER);

      expect(db.familyMember.update).not.toHaveBeenCalled();
      expect(db.family.delete).not.toHaveBeenCalled();
      expect(erasure.families).toEqual([
        { familyId: FAMILY, outcome: 'unchanged' },
      ]);
    });

    it('removes a family once nobody is left and nothing references it', async () => {
      const { db, eraser } = build({
        memberships: [{ userId: USER, role: 'OWNER' }],
        remainingMembers: [],
      });

      const erasure = await eraser.erase(USER);

      expect(db.family.delete).toHaveBeenCalledWith({ where: { id: FAMILY } });
      expect(erasure.families).toEqual([
        { familyId: FAMILY, outcome: 'family-removed' },
      ]);
    });

    it('keeps an empty family whose transactions are still referenced', async () => {
      const { db, eraser } = build({
        memberships: [{ userId: USER, role: 'OWNER' }],
        remainingMembers: [],
        familyTransactions: 2,
      });

      const erasure = await eraser.erase(USER);

      expect(db.family.delete).not.toHaveBeenCalled();
      expect(erasure.families).toEqual([
        { familyId: FAMILY, outcome: 'unchanged' },
      ]);
    });

    it('passes a shared basket to a remaining member instead of letting it cascade away', async () => {
      const { db, eraser } = build({
        memberships: [{ userId: USER, role: 'OWNER' }],
        remainingMembers: [{ userId: 'user-2', role: 'MEMBER' }],
        familyBasket: { id: 'basket-1' },
      });

      await eraser.erase(USER);

      expect(db.basket.update).toHaveBeenCalledWith({
        where: { id: 'basket-1' },
        data: { userId: 'user-2' },
      });
    });

    it('leaves a shared basket to cascade when no member remains', async () => {
      const { db, eraser } = build({
        memberships: [{ userId: USER, role: 'OWNER' }],
        remainingMembers: [],
        familyBasket: { id: 'basket-1' },
      });

      await eraser.erase(USER);

      expect(db.basket.update).not.toHaveBeenCalled();
    });
  });
});
