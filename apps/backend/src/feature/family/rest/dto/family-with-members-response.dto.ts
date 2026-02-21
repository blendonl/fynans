import { ApiProperty } from '@nestjs/swagger';
import { Family } from '../../core/domain/entities/family.entity';
import {
  FamilyMember,
  FamilyMemberRole,
} from '../../core/domain/entities/family-member.entity';
import { User } from '../../../user/core/domain/entities/user.entity';
import { FamilyResponseDto } from './family-response.dto';

export class FamilyMemberUserInfoDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ nullable: true })
  firstName: string | null;

  @ApiProperty({ nullable: true })
  lastName: string | null;
}

export class FamilyMemberUserDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty({ enum: FamilyMemberRole })
  role: FamilyMemberRole;

  @ApiProperty()
  balance: number;

  @ApiProperty()
  joinedAt: Date;

  @ApiProperty({ type: () => FamilyMemberUserInfoDto })
  user: FamilyMemberUserInfoDto;

  static fromMemberAndUser(
    member: FamilyMember,
    user: User,
  ): FamilyMemberUserDto {
    const dto = new FamilyMemberUserDto();
    dto.id = member.id;
    dto.userId = member.userId;
    dto.role = member.role;
    dto.balance = member.balance;
    dto.joinedAt = member.joinedAt;
    dto.user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };
    return dto;
  }
}

export class FamilyWithMembersResponseDto extends FamilyResponseDto {
  @ApiProperty({ type: () => [FamilyMemberUserDto] })
  members: FamilyMemberUserDto[];

  static fromFamilyAndMembers(
    family: Family,
    membersWithUsers: Array<{ member: FamilyMember; user: User }>,
  ): FamilyWithMembersResponseDto {
    const base = FamilyResponseDto.fromEntity(family);
    const dto = new FamilyWithMembersResponseDto();
    dto.id = base.id;
    dto.name = base.name;
    dto.balance = base.balance;
    dto.createdAt = base.createdAt;
    dto.updatedAt = base.updatedAt;
    dto.members = membersWithUsers.map(({ member, user }) =>
      FamilyMemberUserDto.fromMemberAndUser(member, user),
    );
    return dto;
  }
}
