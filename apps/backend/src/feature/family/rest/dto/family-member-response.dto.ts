import { ApiProperty } from '@nestjs/swagger';
import { FamilyMember, FamilyMemberRole } from '../../core/domain/entities/family-member.entity';

export class FamilyMemberResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  familyId: string;

  @ApiProperty()
  userId: string;

  @ApiProperty({ enum: FamilyMemberRole })
  role: string;

  @ApiProperty()
  balance: number;

  @ApiProperty()
  joinedAt: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  static fromEntity(member: FamilyMember): FamilyMemberResponseDto {
    const dto = new FamilyMemberResponseDto();
    dto.id = member.id;
    dto.familyId = member.familyId;
    dto.userId = member.userId;
    dto.role = member.role;
    dto.balance = member.balance;
    dto.joinedAt = member.joinedAt;
    dto.createdAt = member.createdAt;
    dto.updatedAt = member.updatedAt;
    return dto;
  }
}
