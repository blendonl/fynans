import { Test } from '@nestjs/testing';
import { DomainForbiddenException } from '../../../exceptions/domain.exceptions';
import { FamilyMemberRole } from '../../domain/family-role';
import {
  FAMILY_MEMBERSHIP_REPOSITORY,
  IFamilyMembershipRepository,
} from '../../domain/repositories/family-membership.repository.interface';
import { VerifyFamilyAccessUseCase } from './verify-family-access.use-case';

const FAMILY = 'family-1';
const OWNER = 'owner-1';
const ADMIN = 'admin-1';
const MEMBER = 'member-1';
const OUTSIDER = 'outsider-1';

const ROLES: Record<string, FamilyMemberRole> = {
  [OWNER]: FamilyMemberRole.OWNER,
  [ADMIN]: FamilyMemberRole.ADMIN,
  [MEMBER]: FamilyMemberRole.MEMBER,
};

describe('VerifyFamilyAccessUseCase', () => {
  let useCase: VerifyFamilyAccessUseCase;

  const familyMembershipRepository: IFamilyMembershipRepository = {
    isMember: (familyId: string, userId: string) =>
      Promise.resolve(familyId === FAMILY && userId in ROLES),
    findRole: (familyId: string, userId: string) =>
      Promise.resolve(familyId === FAMILY ? (ROLES[userId] ?? null) : null),
    findFamilyIds: () => Promise.resolve([FAMILY]),
    findCoMemberUserIds: () => Promise.resolve(Object.keys(ROLES)),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        VerifyFamilyAccessUseCase,
        {
          provide: FAMILY_MEMBERSHIP_REPOSITORY,
          useValue: familyMembershipRepository,
        },
      ],
    }).compile();

    useCase = moduleRef.get(VerifyFamilyAccessUseCase);
  });

  it('allows any member when no role is required', async () => {
    await expect(useCase.execute(FAMILY, MEMBER)).resolves.toBeUndefined();
  });

  it('denies a user who is not a member', async () => {
    await expect(useCase.execute(FAMILY, OUTSIDER)).rejects.toBeInstanceOf(
      DomainForbiddenException,
    );
  });

  it('denies a member of a different family', async () => {
    await expect(useCase.execute('family-2', MEMBER)).rejects.toBeInstanceOf(
      DomainForbiddenException,
    );
  });

  it('allows a role that satisfies the requirement', async () => {
    await expect(
      useCase.execute(FAMILY, ADMIN, [
        FamilyMemberRole.OWNER,
        FamilyMemberRole.ADMIN,
      ]),
    ).resolves.toBeUndefined();
  });

  it('denies a member whose role is below the requirement', async () => {
    await expect(
      useCase.execute(FAMILY, MEMBER, [
        FamilyMemberRole.OWNER,
        FamilyMemberRole.ADMIN,
      ]),
    ).rejects.toBeInstanceOf(DomainForbiddenException);
  });

  it('allows the owner where owner or admin is required', async () => {
    await expect(
      useCase.execute(FAMILY, OWNER, [
        FamilyMemberRole.OWNER,
        FamilyMemberRole.ADMIN,
      ]),
    ).resolves.toBeUndefined();
  });
});
