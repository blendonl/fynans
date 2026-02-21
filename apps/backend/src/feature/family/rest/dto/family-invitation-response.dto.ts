import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FamilyInvitation, FamilyInvitationStatus } from '../../core/domain/entities/family-invitation.entity';

export class FamilyInvitationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  familyId: string;

  @ApiProperty()
  inviterId: string;

  @ApiPropertyOptional()
  inviteeId?: string;

  @ApiProperty()
  inviteeEmail: string;

  @ApiProperty({ enum: FamilyInvitationStatus })
  status: string;

  @ApiProperty()
  expiresAt: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
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
