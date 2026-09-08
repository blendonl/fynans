import { ExpenseAuthService } from './expense-auth.service';
import { FamilyMemberRole } from '~feature/family/core/domain/entities/family-member.entity';
import { DomainForbiddenException } from '~common/exceptions/domain.exceptions';

const submitter = 'submitter-1';
const admin = 'admin-1';
const plainMember = 'member-1';
const outsider = 'outsider-1';

const memberFor = (userId: string) => {
  const roles: Record<string, FamilyMemberRole> = {
    [admin]: FamilyMemberRole.ADMIN,
    [submitter]: FamilyMemberRole.OWNER,
    [plainMember]: FamilyMemberRole.MEMBER,
  };
  const role = roles[userId];
  if (!role) return null;
  return {
    userId,
    role,
    canManageMembers: () =>
      role === FamilyMemberRole.OWNER || role === FamilyMemberRole.ADMIN,
  };
};

describe('ExpenseAuthService.verifyApprovalAuthority', () => {
  let familyService: { findMember: jest.Mock };
  let service: ExpenseAuthService;

  const familyTransaction = {
    id: 'transaction-1',
    userId: submitter,
    familyId: 'family-1',
  };

  beforeEach(() => {
    familyService = {
      findMember: jest
        .fn()
        .mockImplementation((_familyId: string, userId: string) =>
          Promise.resolve(memberFor(userId)),
        ),
    };
    service = new ExpenseAuthService(familyService as never);
  });

  it('rejects the submitter approving their own expense even as OWNER', async () => {
    await expect(
      service.verifyApprovalAuthority(familyTransaction as never, submitter),
    ).rejects.toBeInstanceOf(DomainForbiddenException);
  });

  it('rejects a plain MEMBER of the family', async () => {
    await expect(
      service.verifyApprovalAuthority(familyTransaction as never, plainMember),
    ).rejects.toBeInstanceOf(DomainForbiddenException);
  });

  it('rejects a second user who is not in the family at all', async () => {
    await expect(
      service.verifyApprovalAuthority(familyTransaction as never, outsider),
    ).rejects.toBeInstanceOf(DomainForbiddenException);
  });

  it('rejects approval of a personal expense, which has no family admin', async () => {
    await expect(
      service.verifyApprovalAuthority(
        { id: 'transaction-2', userId: submitter, familyId: null } as never,
        admin,
      ),
    ).rejects.toBeInstanceOf(DomainForbiddenException);
  });

  it('allows an ADMIN who is not the submitter', async () => {
    await expect(
      service.verifyApprovalAuthority(familyTransaction as never, admin),
    ).resolves.toBeUndefined();
  });
});
