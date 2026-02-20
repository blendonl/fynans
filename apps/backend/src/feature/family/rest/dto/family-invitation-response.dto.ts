import { FamilyInvitation } from '../../core/domain/entities/family-invitation.entity';

export class FamilyInvitationResponseDto {
  id: string;
  familyId: string;
  inviterId: string;
  inviteeId?: string;
  inviteeEmail: string;
  status: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(invitation: FamilyInvitation): FamilyInvitationResponseDto {
    const dto = new FamilyInvitationResponseDto();
    dto.id = invitation.id;
    dto.familyId = invitation.familyId;
    dto.inviterId = invitation.inviterId;
    dto.inviteeId = invitation.inviteeId;
    dto.inviteeEmail = invitation.inviteeEmail;
    dto.status = invitation.status;
    dto.expiresAt = invitation.expiresAt;
    dto.createdAt = invitation.createdAt;
    dto.updatedAt = invitation.updatedAt;
    return dto;
  }

  static fromEntities(invitations: FamilyInvitation[]): FamilyInvitationResponseDto[] {
    return invitations.map((i) => FamilyInvitationResponseDto.fromEntity(i));
  }
}
