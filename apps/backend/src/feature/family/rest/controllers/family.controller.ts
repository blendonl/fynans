import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { FamilyService } from '../../core/application/services/family.service';
import { CreateFamilyRequestDto } from '../dto/create-family-request.dto';
import { InviteMemberRequestDto } from '../dto/invite-member-request.dto';
import { FamilyResponseDto } from '../dto/family-response.dto';
import { FamilyWithMembersResponseDto } from '../dto/family-with-members-response.dto';
import { FamilyInvitationResponseDto } from '../dto/family-invitation-response.dto';
import { FamilyMemberResponseDto } from '../dto/family-member-response.dto';
import { CurrentUser } from '../../../auth/rest/decorators/current-user.decorator';
import { User } from '../../../user/core/domain/entities/user.entity';
import { FamilyInvitationStatus } from '../../core/domain/entities/family-invitation.entity';
import { FamilyMemberRole } from '../../core/domain/entities/family-member.entity';

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
  status: FamilyInvitationStatus;

  @ApiProperty()
  expiresAt: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class FamilyMemberResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  familyId: string;

  @ApiProperty()
  userId: string;

  @ApiProperty({ enum: FamilyMemberRole })
  role: FamilyMemberRole;

  @ApiProperty()
  balance: number;

  @ApiProperty()
  joinedAt: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

@ApiTags('Family')
@ApiBearerAuth('bearer')
@Controller('families')
export class FamilyController {
  constructor(private readonly familyService: FamilyService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new family' })
  @ApiResponse({ status: 201, type: FamilyResponseDto })
  async create(
    @Body() dto: CreateFamilyRequestDto,
    @CurrentUser() user: User,
  ) {
    const family = await this.familyService.create(dto.toCoreDto(), user.id);
    return FamilyResponseDto.fromEntity(family);
  }

  @Get()
  @ApiOperation({ summary: 'List all families for the current user' })
  @ApiResponse({ status: 200, type: [FamilyResponseDto] })
  async findAll(@CurrentUser() user: User) {
    const families = await this.familyService.findAll(user.id);
    return FamilyResponseDto.fromEntities(families);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a family with its members' })
  @ApiResponse({ status: 200, type: FamilyWithMembersResponseDto })
  async findOne(@Param('id') familyId: string, @CurrentUser() user: User) {
    const result = await this.familyService.findOneWithMembers(
      familyId,
      user.id,
    );
    return FamilyWithMembersResponseDto.fromFamilyAndMembers(
      result.family,
      result.membersWithUsers,
    );
  }

  @Post(':id/invitations')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Invite a member to a family' })
  @ApiResponse({ status: 201, type: FamilyInvitationResponseDto })
  async inviteMember(
    @Param('id') familyId: string,
    @Body() dto: InviteMemberRequestDto,
    @CurrentUser() user: User,
  ) {
    const invitation = await this.familyService.inviteMember(
      dto.toCoreDto(familyId),
      user.id,
    );
    return FamilyInvitationResponseDto.fromEntity(invitation);
  }

  @Get('invitations/pending')
  @ApiOperation({ summary: 'Get pending invitations for the current user' })
  @ApiResponse({ status: 200, type: [FamilyInvitationResponseDto] })
  async getPendingInvitations(@CurrentUser() user: User) {
    const invitations = await this.familyService.getPendingInvitations(
      user.email,
    );
    return FamilyInvitationResponseDto.fromEntities(invitations);
  }

  @Get(':id/invitations/pending')
  @ApiOperation({ summary: 'Get pending invitations for a family' })
  @ApiResponse({ status: 200, type: [FamilyInvitationResponseDto] })
  async getFamilyPendingInvitations(
    @Param('id') familyId: string,
    @CurrentUser() user: User,
  ) {
    const invitations = await this.familyService.getFamilyPendingInvitations(
      familyId,
      user.id,
    );
    return FamilyInvitationResponseDto.fromEntities(invitations);
  }

  @Post('invitations/:id/accept')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Accept a family invitation' })
  @ApiResponse({ status: 200, type: FamilyMemberResponseDto })
  async acceptInvitation(
    @Param('id') invitationId: string,
    @CurrentUser() user: User,
  ) {
    const member = await this.familyService.acceptInvitation(
      invitationId,
      user.id,
    );
    return FamilyMemberResponseDto.fromEntity(member);
  }

  @Post('invitations/:id/decline')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Decline a family invitation' })
  @ApiResponse({ status: 204 })
  async declineInvitation(
    @Param('id') invitationId: string,
    @CurrentUser() user: User,
  ) {
    await this.familyService.declineInvitation(invitationId, user.id);
  }

  @Post('invitations/:id/cancel')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cancel a family invitation' })
  @ApiResponse({ status: 204 })
  async cancelInvitation(
    @Param('id') invitationId: string,
    @CurrentUser() user: User,
  ) {
    await this.familyService.cancelInvitation(invitationId, user.id);
  }

  @Delete(':id/members/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a member from a family' })
  @ApiResponse({ status: 204 })
  async removeMember(
    @Param('id') familyId: string,
    @Param('userId') targetUserId: string,
    @CurrentUser() user: User,
  ) {
    await this.familyService.removeMember(familyId, targetUserId, user.id);
  }

  @Delete(':id/members/me')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Leave a family' })
  @ApiResponse({ status: 204 })
  async leaveFamily(@Param('id') familyId: string, @CurrentUser() user: User) {
    await this.familyService.leave(familyId, user.id);
  }
}
