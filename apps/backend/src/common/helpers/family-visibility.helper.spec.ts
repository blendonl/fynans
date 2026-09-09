import { PrismaService } from '../prisma/prisma.service';
import { runWithFamilyVisibilityCache } from './family-visibility.cache';
import { getVisibleUserIds } from './family-visibility.helper';

const USER = 'user-1';

function prismaDouble() {
  const findMany = jest
    .fn()
    .mockResolvedValueOnce([{ familyId: 'family-1' }])
    .mockResolvedValueOnce([{ userId: USER }, { userId: 'user-2' }]);

  return {
    findMany,
    prisma: { familyMember: { findMany } } as unknown as PrismaService,
  };
}

describe('getVisibleUserIds', () => {
  it('returns the caller plus every member of their families', async () => {
    const { prisma } = prismaDouble();

    await expect(getVisibleUserIds(prisma, USER)).resolves.toEqual([
      USER,
      'user-2',
    ]);
  });

  it('returns only the caller when they belong to no family', async () => {
    const findMany = jest.fn().mockResolvedValueOnce([]);
    const prisma = { familyMember: { findMany } } as unknown as PrismaService;

    await expect(getVisibleUserIds(prisma, USER)).resolves.toEqual([USER]);
    expect(findMany).toHaveBeenCalledTimes(1);
  });

  describe('within one request', () => {
    it('issues the two queries once no matter how many repositories ask', async () => {
      const { prisma, findMany } = prismaDouble();

      const results = await runWithFamilyVisibilityCache(async () =>
        Promise.all([
          getVisibleUserIds(prisma, USER),
          getVisibleUserIds(prisma, USER),
          getVisibleUserIds(prisma, USER),
        ]),
      );

      expect(findMany).toHaveBeenCalledTimes(2);
      for (const result of results) {
        expect(result).toEqual([USER, 'user-2']);
      }
    });

    it('keeps different users apart', async () => {
      const findMany = jest.fn().mockResolvedValue([]);
      const prisma = { familyMember: { findMany } } as unknown as PrismaService;

      await runWithFamilyVisibilityCache(async () => {
        await getVisibleUserIds(prisma, USER);
        await getVisibleUserIds(prisma, 'user-9');
      });

      expect(findMany).toHaveBeenCalledTimes(2);
    });

    it('does not cache a failure', async () => {
      const findMany = jest
        .fn()
        .mockRejectedValueOnce(new Error('connection lost'))
        .mockResolvedValueOnce([]);
      const prisma = { familyMember: { findMany } } as unknown as PrismaService;

      await runWithFamilyVisibilityCache(async () => {
        await expect(getVisibleUserIds(prisma, USER)).rejects.toThrow(
          'connection lost',
        );
        await expect(getVisibleUserIds(prisma, USER)).resolves.toEqual([USER]);
      });
    });
  });

  it('does not leak the cache between requests', async () => {
    const first = prismaDouble();
    await runWithFamilyVisibilityCache(async () =>
      getVisibleUserIds(first.prisma, USER),
    );

    const second = prismaDouble();
    await runWithFamilyVisibilityCache(async () =>
      getVisibleUserIds(second.prisma, USER),
    );

    expect(second.findMany).toHaveBeenCalledTimes(2);
  });
});
