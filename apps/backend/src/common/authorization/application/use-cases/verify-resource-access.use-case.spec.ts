import { Test } from '@nestjs/testing';
import { DomainNotFoundException } from '../../../exceptions/domain.exceptions';
import { OwnedResource, ResourceOwner } from '../../domain/owned-resource';
import {
  FAMILY_MEMBERSHIP_REPOSITORY,
  IFamilyMembershipRepository,
} from '../../domain/repositories/family-membership.repository.interface';
import {
  RESOURCE_OWNER_REPOSITORY,
  IResourceOwnerRepository,
} from '../../domain/repositories/resource-owner.repository.interface';
import { VerifyResourceAccessUseCase } from './verify-resource-access.use-case';

const USER_A = 'user-a';
const USER_B = 'user-b';
const CO_MEMBER = 'user-c';
const FAMILY = 'family-1';

const owners: Record<string, ResourceOwner> = {
  'item-personal': { userId: USER_A, familyId: null },
  'item-family': { userId: USER_A, familyId: FAMILY },
};

describe('VerifyResourceAccessUseCase', () => {
  let useCase: VerifyResourceAccessUseCase;

  const resourceOwnerRepository: IResourceOwnerRepository = {
    findOwner: (_resource: OwnedResource, resourceId: string) =>
      Promise.resolve(owners[resourceId] ?? null),
  };

  const familyMembershipRepository: IFamilyMembershipRepository = {
    isMember: (familyId: string, userId: string) =>
      Promise.resolve(familyId === FAMILY && userId === CO_MEMBER),
    findFamilyIds: (userId: string) =>
      Promise.resolve(
        userId === USER_A || userId === CO_MEMBER ? [FAMILY] : [],
      ),
    findCoMemberUserIds: (userId: string) =>
      Promise.resolve(
        userId === USER_A || userId === CO_MEMBER
          ? [USER_A, CO_MEMBER]
          : [userId],
      ),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        VerifyResourceAccessUseCase,
        {
          provide: RESOURCE_OWNER_REPOSITORY,
          useValue: resourceOwnerRepository,
        },
        {
          provide: FAMILY_MEMBERSHIP_REPOSITORY,
          useValue: familyMembershipRepository,
        },
      ],
    }).compile();

    useCase = moduleRef.get(VerifyResourceAccessUseCase);
  });

  it('allows the owner', async () => {
    await expect(
      useCase.execute('expenseItem', 'item-personal', USER_A),
    ).resolves.toBeUndefined();
  });

  it('denies an unrelated user', async () => {
    await expect(
      useCase.execute('expenseItem', 'item-personal', USER_B),
    ).rejects.toBeInstanceOf(DomainNotFoundException);
  });

  it('allows a family co-member on a family-attributed resource', async () => {
    await expect(
      useCase.execute('expenseItem', 'item-family', CO_MEMBER),
    ).resolves.toBeUndefined();
  });

  it('denies a family co-member on a personal resource', async () => {
    await expect(
      useCase.execute('expenseItem', 'item-personal', CO_MEMBER),
    ).rejects.toBeInstanceOf(DomainNotFoundException);
  });

  it('denies a non-member on a family-attributed resource', async () => {
    await expect(
      useCase.execute('expenseItem', 'item-family', USER_B),
    ).rejects.toBeInstanceOf(DomainNotFoundException);
  });

  it('reports a missing resource the same way as a forbidden one', async () => {
    const missing = await useCase
      .execute('expenseItem', 'does-not-exist', USER_A)
      .catch((error: Error) => error);
    const forbidden = await useCase
      .execute('expenseItem', 'item-personal', USER_B)
      .catch((error: Error) => error);

    expect(missing).toBeInstanceOf(DomainNotFoundException);
    expect((missing as Error).message).toBe((forbidden as Error).message);
  });
});
