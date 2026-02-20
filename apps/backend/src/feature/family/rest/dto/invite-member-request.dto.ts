import { IsNotEmpty, IsEmail } from 'class-validator';
import { InviteMemberDto } from '../../core/application/dto/invite-member.dto';

export class InviteMemberRequestDto {
  @IsEmail()
  @IsNotEmpty()
  inviteeEmail: string;

  toCoreDto(familyId: string): InviteMemberDto {
    return new InviteMemberDto(familyId, this.inviteeEmail);
  }
}
