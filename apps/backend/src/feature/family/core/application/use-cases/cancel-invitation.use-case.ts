import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { IFamilyInvitationRepository } from '../../domain/repositories/family-invitation.repository.interface';
import { IFamilyRepository } from '../../domain/repositories/family.repository.interface';
import { FamilyInvitationStatus } from '../../domain/entities/family-invitation.entity';

@Injectable()
export class CancelInvitationUseCase {
  constructor(
    @Inject('FamilyInvitationRepository')
    private readonly invitationRepository: IFamilyInvitationRepository,
    @Inject('FamilyRepository')
    private readonly familyRepository: IFamilyRepository,
  ) {}

  async execute(invitationId: string, userId: string): Promise<void> {
    const invitation = await this.invitationRepository.findById(invitationId);
    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (!invitation.canBeCancelled()) {
      throw new BadRequestException('Invitation expired or already processed');
    }

    // Verify caller has permission to manage members (OWNER/ADMIN)
    const member = await this.familyRepository.findMember(
      invitation.familyId,
      userId,
    );

    if (!member) {
      throw new ForbiddenException('You are not a member of this family');
    }

    if (!member.canManageMembers()) {
      throw new ForbiddenException(
        'Only owners and admins can cancel invitations',
      );
    }

    await this.invitationRepository.update(invitation.id, {
      status: FamilyInvitationStatus.CANCELLED,
      id: invitation.id,
      familyId: invitation.familyId,
      inviterId: invitation.inviterId,
      inviteeId: invitation.inviteeId,
      inviteeEmail: invitation.inviteeEmail,
      expiresAt: invitation.expiresAt,
      createdAt: invitation.createdAt,
      updatedAt: new Date(),
    });
  }
}
