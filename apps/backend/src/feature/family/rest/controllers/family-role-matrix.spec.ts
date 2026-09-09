import { ExecutionContext } from '@nestjs/common';
import { Decimal } from 'prisma/generated/prisma/internal/prismaNamespace';
import { Reflector } from '@nestjs/core';
import { IFamilyMembershipRepository } from '~common/authorization/domain/repositories/family-membership.repository.interface';
import { FamilyMemberRole } from '~common/authorization/domain/family-role';
import { VerifyFamilyAccessUseCase } from '~common/authorization/application/use-cases/verify-family-access.use-case';
import { FamilyScopeGuard } from '~common/authorization/rest/guards/family-scope.guard';
import { DomainForbiddenException } from '~common/exceptions/domain.exceptions';
import { ExpenseAuthService } from '~feature/expense/core/application/services/expense-auth.service';
import { CancelInvitationUseCase } from '../../core/application/use-cases/cancel-invitation.use-case';
import { FamilyMember } from '../../core/domain/entities/family-member.entity';
import {
  FamilyInvitation,
  FamilyInvitationStatus,
} from '../../core/domain/entities/family-invitation.entity';
import { FamilyController } from './family.controller';

const FAMILY = 'family-1';
const SUBMITTER = 'submitter-1';
const OUTSIDER = 'outsider-1';

const ACTORS: Record<FamilyMemberRole, string> = {
  [FamilyMemberRole.OWNER]: 'owner-1',
  [FamilyMemberRole.ADMIN]: 'admin-1',
  [FamilyMemberRole.MEMBER]: 'member-1',
};

const ROLE_OF = new Map<string, FamilyMemberRole>([
  [ACTORS[FamilyMemberRole.OWNER], FamilyMemberRole.OWNER],
  [ACTORS[FamilyMemberRole.ADMIN], FamilyMemberRole.ADMIN],
  [ACTORS[FamilyMemberRole.MEMBER], FamilyMemberRole.MEMBER],
  [SUBMITTER, FamilyMemberRole.OWNER],
]);

const EVERY_ROLE = [
  FamilyMemberRole.OWNER,
  FamilyMemberRole.ADMIN,
  FamilyMemberRole.MEMBER,
] as const;

const membershipRepository: IFamilyMembershipRepository = {
  isMember: (familyId, userId) =>
    Promise.resolve(familyId === FAMILY && ROLE_OF.has(userId)),
  findRole: (familyId, userId) =>
    Promise.resolve(familyId === FAMILY ? (ROLE_OF.get(userId) ?? null) : null),
  findFamilyIds: () => Promise.resolve([FAMILY]),
  findCoMemberUserIds: () => Promise.resolve([...ROLE_OF.keys()]),
};

type FamilyRouteHandler = keyof FamilyController;

function contextForRoute(
  handler: FamilyRouteHandler,
  userId: string,
): ExecutionContext {
  return {
    getType: () => 'http',
    switchToHttp: () => ({
      getRequest: () => ({
        method: 'POST',
        user: { id: userId },
        params: { familyId: FAMILY },
        query: {},
        body: {},
      }),
    }),
    getHandler: () => FamilyController.prototype[handler],
    getClass: () => FamilyController,
  } as unknown as ExecutionContext;
}

function memberWithRole(userId: string, role: FamilyMemberRole): FamilyMember {
  return new FamilyMember({
    id: `membership-${userId}`,
    familyId: FAMILY,
    userId,
    role,
    balance: new Decimal(0),
    joinedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

describe('family role matrix', () => {
  let guard: FamilyScopeGuard;

  const routeAllows = async (
    handler: FamilyRouteHandler,
    userId: string,
  ): Promise<boolean> => {
    try {
      return await guard.canActivate(contextForRoute(handler, userId));
    } catch (error) {
      expect(error).toBeInstanceOf(DomainForbiddenException);
      return false;
    }
  };

  beforeEach(() => {
    guard = new FamilyScopeGuard(
      new Reflector(),
      new VerifyFamilyAccessUseCase(membershipRepository),
    );
  });

  describe('invite', () => {
    it.each([
      [FamilyMemberRole.OWNER, true],
      [FamilyMemberRole.ADMIN, true],
      [FamilyMemberRole.MEMBER, false],
    ])('%s inviting a member is allowed: %s', async (role, allowed) => {
      await expect(routeAllows('inviteMember', ACTORS[role])).resolves.toBe(
        allowed,
      );
    });

    it('denies a user who is in no family at all', async () => {
      await expect(routeAllows('inviteMember', OUTSIDER)).resolves.toBe(false);
    });
  });

  describe('remove', () => {
    it.each([
      [FamilyMemberRole.OWNER, true],
      [FamilyMemberRole.ADMIN, true],
      [FamilyMemberRole.MEMBER, false],
    ])('%s removing a member is allowed: %s', async (role, allowed) => {
      await expect(routeAllows('removeMember', ACTORS[role])).resolves.toBe(
        allowed,
      );
    });

    it('denies a user who is in no family at all', async () => {
      await expect(routeAllows('removeMember', OUTSIDER)).resolves.toBe(false);
    });

    it('lets every role leave on their own account', async () => {
      for (const role of EVERY_ROLE) {
        await expect(routeAllows('leaveFamily', ACTORS[role])).resolves.toBe(
          true,
        );
      }
    });

    it('still denies a stranger the leave route', async () => {
      await expect(routeAllows('leaveFamily', OUTSIDER)).resolves.toBe(false);
    });
  });

  describe('approve and reject', () => {
    let expenseAuthService: ExpenseAuthService;

    const pendingExpenseOf = (userId: string) =>
      ({ id: 'transaction-1', userId, familyId: FAMILY }) as never;

    const approvalAllowed = async (
      approverId: string,
      submitterId = SUBMITTER,
    ): Promise<boolean> => {
      try {
        await expenseAuthService.verifyApprovalAuthority(
          pendingExpenseOf(submitterId),
          approverId,
        );
        return true;
      } catch (error) {
        expect(error).toBeInstanceOf(DomainForbiddenException);
        return false;
      }
    };

    beforeEach(() => {
      expenseAuthService = new ExpenseAuthService(
        membershipRepository as never,
      );
    });

    it.each([
      [FamilyMemberRole.OWNER, true],
      [FamilyMemberRole.ADMIN, true],
      [FamilyMemberRole.MEMBER, false],
    ])(
      '%s approving another member expense is allowed: %s',
      async (role, allowed) => {
        await expect(approvalAllowed(ACTORS[role])).resolves.toBe(allowed);
      },
    );

    it('denies a user who is in no family at all', async () => {
      await expect(approvalAllowed(OUTSIDER)).resolves.toBe(false);
    });

    it('denies every role approving an expense they submitted themselves', async () => {
      for (const role of EVERY_ROLE) {
        await expect(approvalAllowed(ACTORS[role], ACTORS[role])).resolves.toBe(
          false,
        );
      }
    });

    it('separates duties even for the owner, who can approve everyone else', async () => {
      const owner = ACTORS[FamilyMemberRole.OWNER];

      await expect(approvalAllowed(owner, owner)).resolves.toBe(false);
      await expect(
        approvalAllowed(owner, ACTORS[FamilyMemberRole.MEMBER]),
      ).resolves.toBe(true);
    });

    it('rejects a pending expense the same way it approves one', async () => {
      const member = ACTORS[FamilyMemberRole.MEMBER];
      const admin = ACTORS[FamilyMemberRole.ADMIN];

      await expect(approvalAllowed(member, admin)).resolves.toBe(false);
      await expect(approvalAllowed(admin, member)).resolves.toBe(true);
    });
  });

  describe('cancel an outgoing invitation', () => {
    let invitationRepository: { findById: jest.Mock; update: jest.Mock };
    let familyRepository: { findMember: jest.Mock };
    let cancelInvitation: CancelInvitationUseCase;

    const cancelAllowed = async (userId: string): Promise<boolean> => {
      try {
        await cancelInvitation.execute('invitation-1', userId);
        return true;
      } catch {
        return false;
      }
    };

    beforeEach(() => {
      invitationRepository = {
        findById: jest.fn().mockResolvedValue(
          new FamilyInvitation({
            id: 'invitation-1',
            familyId: FAMILY,
            inviterId: ACTORS[FamilyMemberRole.OWNER],
            inviteeEmail: 'invitee@example.com',
            status: FamilyInvitationStatus.PENDING,
            expiresAt: new Date(Date.now() + 86_400_000),
            createdAt: new Date(),
            updatedAt: new Date(),
          }),
        ),
        update: jest.fn().mockResolvedValue(undefined),
      };
      familyRepository = {
        findMember: jest
          .fn()
          .mockImplementation((familyId: string, userId: string) => {
            const role = ROLE_OF.get(userId);
            return Promise.resolve(
              familyId === FAMILY && role ? memberWithRole(userId, role) : null,
            );
          }),
      };
      cancelInvitation = new CancelInvitationUseCase(
        invitationRepository as never,
        familyRepository as never,
      );
    });

    it.each([
      [FamilyMemberRole.OWNER, true],
      [FamilyMemberRole.ADMIN, true],
      [FamilyMemberRole.MEMBER, false],
    ])('%s cancelling an invitation is allowed: %s', async (role, allowed) => {
      await expect(cancelAllowed(ACTORS[role])).resolves.toBe(allowed);
      expect(invitationRepository.update).toHaveBeenCalledTimes(
        allowed ? 1 : 0,
      );
    });

    it('denies a user who is in no family at all', async () => {
      await expect(cancelAllowed(OUTSIDER)).resolves.toBe(false);
      expect(invitationRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('the routes carry the role requirement the matrix relies on', () => {
    const reflector = new Reflector();

    const ruleFor = (handler: FamilyRouteHandler) =>
      reflector.get<{ roles?: FamilyMemberRole[]; required?: boolean }>(
        'family_scope_rule',
        FamilyController.prototype[handler],
      );

    it.each(['inviteMember', 'removeMember'] as const)(
      '%s is restricted to owners and admins',
      (handler) => {
        expect(ruleFor(handler)?.roles).toEqual([
          FamilyMemberRole.OWNER,
          FamilyMemberRole.ADMIN,
        ]);
      },
    );

    it('leaveFamily requires membership but no particular role', () => {
      const rule = ruleFor('leaveFamily');

      expect(rule?.required).toBe(true);
      expect(rule?.roles).toBeUndefined();
    });
  });
});
