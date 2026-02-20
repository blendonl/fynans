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
import { FamilyService } from '../../core/application/services/family.service';
import { CreateFamilyRequestDto } from '../dto/create-family-request.dto';
import { InviteMemberRequestDto } from '../dto/invite-member-request.dto';
import { FamilyResponseDto } from '../dto/family-response.dto';
import { FamilyWithMembersResponseDto } from '../dto/family-with-members-response.dto';
import { FamilyInvitationResponseDto } from '../dto/family-invitation-response.dto';
import { FamilyMemberResponseDto } from '../dto/family-member-response.dto';
import { CurrentUser } from '../../../auth/rest/decorators/current-user.decorator';
import { User } from '../../../user/core/domain/entities/user.entity';

@Controller('families')
export class FamilyController {
  constructor(private readonly familyService: FamilyService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateFamilyRequestDto,
    @CurrentUser() user: User,
  ) {
    const family = await this.familyService.create(dto.toCoreDto(), user.id);
    return FamilyResponseDto.fromEntity(family);
  }

  @Get()
  async findAll(@CurrentUser() user: User) {
    const families = await this.familyService.findAll(user.id);
    return FamilyResponseDto.fromEntities(families);
  }

  @Get(':id')
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
  async getPendingInvitations(@CurrentUser() user: User) {
    const invitations = await this.familyService.getPendingInvitations(
      user.email,
    );
    return FamilyInvitationResponseDto.fromEntities(invitations);
  }

  @Get(':id/invitations/pending')
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
  async declineInvitation(
    @Param('id') invitationId: string,
    @CurrentUser() user: User,
  ) {
    await this.familyService.declineInvitation(invitationId, user.id);
  }

  @Post('invitations/:id/cancel')
  @HttpCode(HttpStatus.NO_CONTENT)
  async cancelInvitation(
    @Param('id') invitationId: string,
    @CurrentUser() user: User,
  ) {
    await this.familyService.cancelInvitation(invitationId, user.id);
  }

  @Delete(':id/members/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeMember(
    @Param('id') familyId: string,
    @Param('userId') targetUserId: string,
    @CurrentUser() user: User,
  ) {
    await this.familyService.removeMember(familyId, targetUserId, user.id);
  }

  @Delete(':id/members/me')
  @HttpCode(HttpStatus.NO_CONTENT)
  async leaveFamily(@Param('id') familyId: string, @CurrentUser() user: User) {
    await this.familyService.leave(familyId, user.id);
  }
}
