import { Injectable, Inject } from '@nestjs/common';
import { CreateFamilyUseCase } from '../use-cases/create-family.use-case';
import { InviteMemberUseCase } from '../use-cases/invite-member.use-case';
import { AcceptInvitationUseCase } from '../use-cases/accept-invitation.use-case';
import { DeclineInvitationUseCase } from '../use-cases/decline-invitation.use-case';
import { LeaveFamilyUseCase } from '../use-cases/leave-family.use-case';
import { GetFamiliesUseCase } from '../use-cases/get-families.use-case';
import { GetPendingInvitationsUseCase } from '../use-cases/get-pending-invitations.use-case';
import { GetFamilyWithMembersUseCase } from '../use-cases/get-family-with-members.use-case';
import { RemoveFamilyMemberUseCase } from '../use-cases/remove-family-member.use-case';
import { GetFamilyPendingInvitationsUseCase } from '../use-cases/get-family-pending-invitations.use-case';
import { CancelInvitationUseCase } from '../use-cases/cancel-invitation.use-case';
import { VerifyFamilyMembershipUseCase } from '../use-cases/verify-family-membership.use-case';
import { CreateFamilyDto } from '../dto/create-family.dto';
import { InviteMemberDto } from '../dto/invite-member.dto';
import { Family } from '../../domain/entities/family.entity';
import { FamilyMember } from '../../domain/entities/family-member.entity';
import { FamilyInvitation } from '../../domain/entities/family-invitation.entity';
import {
  IFamilyRepository,
  FamilyWithMembersAndUsers,
} from '../../domain/repositories/family.repository.interface';

@Injectable()
export class FamilyService {
  constructor(
    @Inject('FamilyRepository')
    private readonly familyRepository: IFamilyRepository,
    private readonly createFamilyUseCase: CreateFamilyUseCase,
    private readonly inviteMemberUseCase: InviteMemberUseCase,
    private readonly acceptInvitationUseCase: AcceptInvitationUseCase,
    private readonly declineInvitationUseCase: DeclineInvitationUseCase,
    private readonly leaveFamilyUseCase: LeaveFamilyUseCase,
    private readonly getFamiliesUseCase: GetFamiliesUseCase,
    private readonly getPendingInvitationsUseCase: GetPendingInvitationsUseCase,
    private readonly getFamilyWithMembersUseCase: GetFamilyWithMembersUseCase,
    private readonly removeFamilyMemberUseCase: RemoveFamilyMemberUseCase,
    private readonly getFamilyPendingInvitationsUseCase: GetFamilyPendingInvitationsUseCase,
    private readonly cancelInvitationUseCase: CancelInvitationUseCase,
    private readonly verifyFamilyMembershipUseCase: VerifyFamilyMembershipUseCase,
  ) {}

  async findById(id: string): Promise<Family | null> {
    return this.familyRepository.findById(id);
  }

  async findMember(
    familyId: string,
    userId: string,
  ): Promise<FamilyMember | null> {
    return this.familyRepository.findMember(familyId, userId);
  }

  async findMembers(familyId: string): Promise<FamilyMember[]> {
    return this.familyRepository.findMembers(familyId);
  }

  async findByUserId(userId: string): Promise<Family[]> {
    return this.familyRepository.findByUserId(userId);
  }

  async verifyMembership(familyId: string, userId: string): Promise<void> {
    return this.verifyFamilyMembershipUseCase.execute(familyId, userId);
  }

  async create(dto: CreateFamilyDto, ownerId: string): Promise<Family> {
    return this.createFamilyUseCase.execute(dto, ownerId);
  }

  async findAll(userId: string): Promise<Family[]> {
    return this.getFamiliesUseCase.execute(userId);
  }

  async findOneWithMembers(
    familyId: string,
    userId: string,
  ): Promise<FamilyWithMembersAndUsers> {
    return this.getFamilyWithMembersUseCase.execute(familyId, userId);
  }

  async inviteMember(
    dto: InviteMemberDto,
    inviterId: string,
  ): Promise<FamilyInvitation> {
    return this.inviteMemberUseCase.execute(dto, inviterId);
  }

  async getPendingInvitations(
    userEmail: string,
  ): Promise<FamilyInvitation[]> {
    return this.getPendingInvitationsUseCase.execute(userEmail);
  }

  async getFamilyPendingInvitations(
    familyId: string,
    userId: string,
  ): Promise<FamilyInvitation[]> {
    return this.getFamilyPendingInvitationsUseCase.execute(familyId, userId);
  }

  async acceptInvitation(
    invitationId: string,
    userId: string,
  ): Promise<FamilyMember> {
    return this.acceptInvitationUseCase.execute(invitationId, userId);
  }

  async declineInvitation(
    invitationId: string,
    userId: string,
  ): Promise<void> {
    return this.declineInvitationUseCase.execute(invitationId, userId);
  }

  async cancelInvitation(
    invitationId: string,
    userId: string,
  ): Promise<void> {
    return this.cancelInvitationUseCase.execute(invitationId, userId);
  }

  async removeMember(
    familyId: string,
    targetUserId: string,
    requesterId: string,
  ): Promise<void> {
    return this.removeFamilyMemberUseCase.execute(
      familyId,
      targetUserId,
      requesterId,
    );
  }

  async leave(familyId: string, userId: string): Promise<void> {
    return this.leaveFamilyUseCase.execute(familyId, userId);
  }
}
