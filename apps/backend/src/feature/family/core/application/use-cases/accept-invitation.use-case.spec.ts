import { AcceptInvitationUseCase } from './accept-invitation.use-case';
import { DeclineInvitationUseCase } from './decline-invitation.use-case';
import { FamilyInvitation, FamilyInvitationStatus } from '../../domain/entities/family-invitation.entity';
import {
  DomainConflictException,
  DomainForbiddenException,
} from '~common/exceptions/domain.exceptions';

const invitee = { id: 'invitee-1', email: 'invitee@example.com', fullName: 'Invitee' };
const attacker = { id: 'attacker-1', email: 'attacker@example.com', fullName: 'Attacker' };

const buildInvitation = (overrides: Partial<Record<string, unknown>> = {}) =>
  new FamilyInvitation({
    id: 'invitation-1',
    familyId: 'family-1',
    inviterId: 'owner-1',
    inviteeId: undefined,
    inviteeEmail: invitee.email,
    status: FamilyInvitationStatus.PENDING,
    expiresAt: new Date(Date.now() + 86_400_000),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

describe('invitation identity checks', () => {
  let invitationRepository: {
    findById: jest.Mock;
    update: jest.Mock;
  };
  let familyRepository: {
    findById: jest.Mock;
    addMember: jest.Mock;
    findMember: jest.Mock;
    findMembers: jest.Mock;
  };
  let createNotificationUseCase: { execute: jest.Mock };
  let userService: { findById: jest.Mock };
  let acceptInvitation: AcceptInvitationUseCase;
  let declineInvitation: DeclineInvitationUseCase;

  beforeEach(() => {
    invitationRepository = {
      findById: jest.fn().mockResolvedValue(buildInvitation()),
      update: jest.fn().mockResolvedValue(undefined),
    };
    familyRepository = {
      findById: jest.fn().mockResolvedValue({ id: 'family-1', name: 'Family' }),
      addMember: jest.fn().mockImplementation((member) => Promise.resolve(member)),
      findMember: jest.fn().mockResolvedValue(null),
      findMembers: jest.fn().mockResolvedValue([]),
    };
    createNotificationUseCase = { execute: jest.fn().mockResolvedValue(undefined) };
    userService = {
      findById: jest.fn().mockImplementation((id: string) =>
        Promise.resolve(id === invitee.id ? invitee : attacker),
      ),
    };

    acceptInvitation = new AcceptInvitationUseCase(
      familyRepository as never,
      invitationRepository as never,
      createNotificationUseCase as never,
      userService as never,
    );
    declineInvitation = new DeclineInvitationUseCase(
      invitationRepository as never,
      familyRepository as never,
      createNotificationUseCase as never,
      userService as never,
    );
  });

  describe('AcceptInvitationUseCase', () => {
    it('rejects a user who is not the invitee', async () => {
      await expect(
        acceptInvitation.execute('invitation-1', attacker.id),
      ).rejects.toBeInstanceOf(DomainForbiddenException);

      expect(familyRepository.addMember).not.toHaveBeenCalled();
      expect(invitationRepository.update).not.toHaveBeenCalled();
    });

    it('accepts the invitee matched by email', async () => {
      await acceptInvitation.execute('invitation-1', invitee.id);

      expect(familyRepository.addMember).toHaveBeenCalledWith(
        expect.objectContaining({ familyId: 'family-1', userId: invitee.id }),
      );
    });

    it('accepts the invitee matched by id when the email differs', async () => {
      invitationRepository.findById.mockResolvedValue(
        buildInvitation({ inviteeId: invitee.id, inviteeEmail: 'old-address@example.com' }),
      );

      await acceptInvitation.execute('invitation-1', invitee.id);

      expect(familyRepository.addMember).toHaveBeenCalled();
    });

    it('matches the invitee email case-insensitively', async () => {
      invitationRepository.findById.mockResolvedValue(
        buildInvitation({ inviteeEmail: 'INVITEE@EXAMPLE.COM' }),
      );

      await acceptInvitation.execute('invitation-1', invitee.id);

      expect(familyRepository.addMember).toHaveBeenCalled();
    });

    it('rejects an invitee who is already a member instead of hitting the unique constraint', async () => {
      familyRepository.findMember.mockResolvedValue({ userId: invitee.id });

      await expect(
        acceptInvitation.execute('invitation-1', invitee.id),
      ).rejects.toBeInstanceOf(DomainConflictException);

      expect(familyRepository.addMember).not.toHaveBeenCalled();
    });
  });

  describe('DeclineInvitationUseCase', () => {
    it('rejects a user who is not the invitee', async () => {
      await expect(
        declineInvitation.execute('invitation-1', attacker.id),
      ).rejects.toBeInstanceOf(DomainForbiddenException);

      expect(invitationRepository.update).not.toHaveBeenCalled();
    });

    it('lets the invitee decline', async () => {
      await declineInvitation.execute('invitation-1', invitee.id);

      expect(invitationRepository.update).toHaveBeenCalledWith(
        'invitation-1',
        expect.objectContaining({ status: FamilyInvitationStatus.REJECTED }),
      );
    });
  });
});
