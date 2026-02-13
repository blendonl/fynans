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
import { CreateFamilyUseCase } from '../../core/application/use-cases/create-family.use-case';
import { InviteMemberUseCase } from '../../core/application/use-cases/invite-member.use-case';
import { AcceptInvitationUseCase } from '../../core/application/use-cases/accept-invitation.use-case';
import { DeclineInvitationUseCase } from '../../core/application/use-cases/decline-invitation.use-case';
import { LeaveFamilyUseCase } from '../../core/application/use-cases/leave-family.use-case';
import { GetFamiliesUseCase } from '../../core/application/use-cases/get-families.use-case';
import { GetPendingInvitationsUseCase } from '../../core/application/use-cases/get-pending-invitations.use-case';
import { GetFamilyWithMembersUseCase } from '../../core/application/use-cases/get-family-with-members.use-case';
import { RemoveFamilyMemberUseCase } from '../../core/application/use-cases/remove-family-member.use-case';
import { GetFamilyPendingInvitationsUseCase } from '../../core/application/use-cases/get-family-pending-invitations.use-case';
import { CancelInvitationUseCase } from '../../core/application/use-cases/cancel-invitation.use-case';
import { CreateFamilyDto } from '../../core/application/dto/create-family.dto';
import { InviteMemberDto } from '../../core/application/dto/invite-member.dto';
import { CreateFamilyRequestDto } from '../dto/create-family-request.dto';
import { InviteMemberRequestDto } from '../dto/invite-member-request.dto';
import { FamilyResponseDto } from '../dto/family-response.dto';
import { FamilyWithMembersResponseDto } from '../dto/family-with-members-response.dto';
import { CurrentUser } from '../../../auth/rest/decorators/current-user.decorator';
import { User } from '../../../user/core/domain/entities/user.entity';

@Controller('families')
export class FamilyController {
  constructor(
    private readonly createFamilyUseCase: CreateFamilyUseCase,
    private readonly inviteMemberUseCase: InviteMemberUseCase,
    private readonly acceptInvitationUseCase: AcceptInvitationUseCase,
    private readonly declineInvitationUseCase: DeclineInvitationUseCase,
    private readonly leaveFamilyUseCase: LeaveFamilyUseCase,
    private readonly getFamiliesUseCase: GetFamiliesUseCase,
    private readonly getPendingInvitationsUseCase: GetPendingInvitationsUseCase,
    private readonly getFamilyWithMembersUseCase: GetFamilyWithMembersUseCase,
    private readonly removeFamilyMemberUseCase: RemoveFamilyMemberUseCase,
    private readonly getFamilyPendingInvitationsUseCase: GetFamilyPendingInvitationsUseCase,
    private readonly cancelInvitationUseCase: CancelInvitationUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateFamilyRequestDto,
    @CurrentUser() user: User,
  ) {
    const family = await this.createFamilyUseCase.execute(
      new CreateFamilyDto(dto.name),
      user.id,
    );
    return FamilyResponseDto.fromEntity(family);
  }

  @Get()
  async findAll(@CurrentUser() user: User) {
    const families = await this.getFamiliesUseCase.execute(user.id);
    return FamilyResponseDto.fromEntities(families);
  }

  @Get(':id')
  async findOne(@Param('id') familyId: string, @CurrentUser() user: User) {
    const result = await this.getFamilyWithMembersUseCase.execute(
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
    const invitation = await this.inviteMemberUseCase.execute(
      new InviteMemberDto(familyId, dto.inviteeEmail),
      user.id,
    );
    return invitation.toJSON();
  }

  @Get('invitations/pending')
  async getPendingInvitations(@CurrentUser() user: User) {
    const invitations = await this.getPendingInvitationsUseCase.execute(
      user.email,
    );
    return invitations.map((i) => i.toJSON());
  }

  @Get(':id/invitations/pending')
  async getFamilyPendingInvitations(
    @Param('id') familyId: string,
    @CurrentUser() user: User,
  ) {
    const invitations =
      await this.getFamilyPendingInvitationsUseCase.execute(familyId, user.id);
    return invitations.map((i) => i.toJSON());
  }

  @Post('invitations/:id/accept')
  @HttpCode(HttpStatus.OK)
  async acceptInvitation(
    @Param('id') invitationId: string,
    @CurrentUser() user: User,
  ) {
    const member = await this.acceptInvitationUseCase.execute(
      invitationId,
      user.id,
    );
    return member.toJSON();
  }

  @Post('invitations/:id/decline')
  @HttpCode(HttpStatus.NO_CONTENT)
  async declineInvitation(
    @Param('id') invitationId: string,
    @CurrentUser() user: User,
  ) {
    await this.declineInvitationUseCase.execute(invitationId, user.id);
  }

  @Post('invitations/:id/cancel')
  @HttpCode(HttpStatus.NO_CONTENT)
  async cancelInvitation(
    @Param('id') invitationId: string,
    @CurrentUser() user: User,
  ) {
    await this.cancelInvitationUseCase.execute(invitationId, user.id);
  }

  @Delete(':id/members/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeMember(
    @Param('id') familyId: string,
    @Param('userId') targetUserId: string,
    @CurrentUser() user: User,
  ) {
    await this.removeFamilyMemberUseCase.execute(
      familyId,
      targetUserId,
      user.id,
    );
  }

  @Delete(':id/members/me')
  @HttpCode(HttpStatus.NO_CONTENT)
  async leaveFamily(@Param('id') familyId: string, @CurrentUser() user: User) {
    await this.leaveFamilyUseCase.execute(familyId, user.id);
  }
}
