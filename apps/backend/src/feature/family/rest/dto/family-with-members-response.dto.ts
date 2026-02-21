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
    return {
      id: member.id,
      userId: member.userId,
      role: member.role,
      balance: member.balance,
      joinedAt: member.joinedAt,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }
}

export class FamilyWithMembersResponseDto extends FamilyResponseDto {
  @ApiProperty({ type: () => [FamilyMemberUserDto] })
  members: FamilyMemberUserDto[];

  static fromFamilyAndMembers(
    family: Family,
    membersWithUsers: Array<{ member: FamilyMember; user: User }>,
  ): FamilyWithMembersResponseDto {
    return {
      ...FamilyResponseDto.fromEntity(family),
      members: membersWithUsers.map(({ member, user }) =>
        FamilyMemberUserDto.fromMemberAndUser(member, user),
      ),
    };
  }
}
