import { FamilyMember } from '../../core/domain/entities/family-member.entity';

export class FamilyMemberResponseDto {
  id: string;
  familyId: string;
  userId: string;
  role: string;
  balance: number;
  joinedAt: Date;
  createdAt: Date;
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
