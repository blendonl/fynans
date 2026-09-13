import { PrismaService } from '../../../prisma/prisma.service';
import { runWithFamilyVisibilityCache } from '../../../helpers/family-visibility.cache';
import { PrismaFamilyMembershipRepository } from './prisma-family-membership.repository';

const USER = 'user-1';

function repositoryOver(findMany: jest.Mock): PrismaFamilyMembershipRepository {
  const prisma = { familyMember: { findMany } } as unknown as PrismaService;
  return new PrismaFamilyMembershipRepository(prisma);
}

function repositoryDouble() {
  const findMany = jest
    .fn()
    .mockResolvedValueOnce([{ familyId: 'family-1' }])
    .mockResolvedValueOnce([{ userId: USER }, { userId: 'user-2' }]);

  return { findMany, repository: repositoryOver(findMany) };
}

describe('PrismaFamilyMembershipRepository.findCoMemberUserIds', () => {
  it('returns the caller plus every member of their families', async () => {
    const { repository } = repositoryDouble();

    await expect(repository.findCoMemberUserIds(USER)).resolves.toEqual([
      USER,
      'user-2',
    ]);
  });

  it('returns only the caller when they belong to no family', async () => {
    const findMany = jest.fn().mockResolvedValueOnce([]);
    const repository = repositoryOver(findMany);

    await expect(repository.findCoMemberUserIds(USER)).resolves.toEqual([USER]);
    expect(findMany).toHaveBeenCalledTimes(1);
  });

  describe('within one request', () => {
    it('issues the two queries once no matter how many repositories ask', async () => {
      const { repository, findMany } = repositoryDouble();

      const results = await runWithFamilyVisibilityCache(async () =>
        Promise.all([
          repository.findCoMemberUserIds(USER),
          repository.findCoMemberUserIds(USER),
          repository.findCoMemberUserIds(USER),
        ]),
      );

      expect(findMany).toHaveBeenCalledTimes(2);
      for (const result of results) {
        expect(result).toEqual([USER, 'user-2']);
      }
    });

    it('keeps different users apart', async () => {
      const findMany = jest.fn().mockResolvedValue([]);
      const repository = repositoryOver(findMany);

      await runWithFamilyVisibilityCache(async () => {
        await repository.findCoMemberUserIds(USER);
        await repository.findCoMemberUserIds('user-9');
      });

      expect(findMany).toHaveBeenCalledTimes(2);
    });

    it('does not cache a failure', async () => {
      const findMany = jest
        .fn()
        .mockRejectedValueOnce(new Error('connection lost'))
        .mockResolvedValueOnce([]);
      const repository = repositoryOver(findMany);

      await runWithFamilyVisibilityCache(async () => {
        await expect(repository.findCoMemberUserIds(USER)).rejects.toThrow(
          'connection lost',
        );
        await expect(repository.findCoMemberUserIds(USER)).resolves.toEqual([
          USER,
        ]);
      });
    });
  });

  it('does not leak the cache between requests', async () => {
    const first = repositoryDouble();
    await runWithFamilyVisibilityCache(async () =>
      first.repository.findCoMemberUserIds(USER),
    );

    const second = repositoryDouble();
    await runWithFamilyVisibilityCache(async () =>
      second.repository.findCoMemberUserIds(USER),
    );

    expect(second.findMany).toHaveBeenCalledTimes(2);
  });
});
