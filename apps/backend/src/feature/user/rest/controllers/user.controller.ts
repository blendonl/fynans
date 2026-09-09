import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { UserService } from '../../core/application/services/user.service';
import { DeleteAccountUseCase } from '../../core/application/use-cases/delete-account.use-case';
import {
  UserResponseDto,
  UserSearchResponseDto,
} from '../dto/user-response.dto';
import { UpdateProfileRequestDto } from '../dto/update-profile-request.dto';
import { ChangePasswordRequestDto } from '../dto/change-password-request.dto';
import { DeleteAccountRequestDto } from '../dto/delete-account-request.dto';
import { CurrentUser } from '../../../auth/rest/decorators/current-user.decorator';
import {
  applySessionCookies,
  sessionCacheKey,
  toSessionHeaders,
} from '../../../auth/rest/http/session-http';
import { User } from '../../core/domain/entities/user.entity';

@ApiTags('Users')
@ApiBearerAuth('bearer')
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly deleteAccountUseCase: DeleteAccountUseCase,
  ) {}

  @Get('search')
  @ApiOperation({ summary: 'Search users by query' })
  @ApiResponse({ status: 200, type: [UserSearchResponseDto] })
  async search(
    @Query('q') query: string,
    @Query('excludeFamilyId') excludeFamilyId?: string,
  ) {
    const users = await this.userService.search(query, excludeFamilyId);
    return users.map(UserSearchResponseDto.fromEntity);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get the signed-in user profile' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async findMe(@CurrentUser() currentUser: User) {
    const user = await this.userService.findById(currentUser.id);
    return UserResponseDto.fromEntity(user);
  }

  @Patch('me')
  @ApiOperation({
    summary: 'Update the signed-in user profile',
    description:
      'Updates the display name and avatar of the account resolved from the session. Email is deliberately not editable here: changing the address that password reset keys on requires the email verification flow, which is not yet implemented.',
  })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async updateMe(
    @Body() dto: UpdateProfileRequestDto,
    @CurrentUser() currentUser: User,
  ) {
    const user = await this.userService.updateProfile(currentUser.id, dto);
    return UserResponseDto.fromEntity(user);
  }

  @Post('me/change-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Change the signed-in user password',
    description:
      'Verifies the current password and rotates the session. All other sessions for the account are revoked.',
  })
  @ApiResponse({ status: 204, description: 'Password changed' })
  async changePassword(
    @Body() dto: ChangePasswordRequestDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { sessionCookies } = await this.userService.changePassword({
      currentPassword: dto.currentPassword,
      newPassword: dto.newPassword,
      sessionHeaders: toSessionHeaders(request),
    });

    applySessionCookies(response, sessionCookies);
  }

  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Permanently delete the signed-in account',
    description:
      'Irreversible. Removes the account together with its transactions, receipts, receipt images, payment methods, categories, baskets and audit trail. Requires the account password, or — for Google and Apple accounts, which have none — the account email address typed back. Every session is revoked before anything is erased. Families the account belonged to are kept for the remaining members: ownership passes to the longest-standing admin, or to the longest-standing member when there is no admin. A family is removed only when nobody is left in it and no transaction still references it.',
  })
  @ApiResponse({ status: 204, description: 'Account deleted' })
  async deleteMe(
    @Body() dto: DeleteAccountRequestDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
    @CurrentUser() currentUser: User,
  ) {
    const { clearedCookies } = await this.deleteAccountUseCase.execute({
      user: currentUser,
      confirmEmail: dto.confirmEmail,
      currentPassword: dto.currentPassword,
      sessionHeaders: toSessionHeaders(request),
      sessionCacheKey: sessionCacheKey(request),
    });

    applySessionCookies(response, clearedCookies);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async findOne(@Param('id') id: string, @CurrentUser() currentUser: User) {
    const user = await this.userService.findVisibleTo(id, currentUser.id);
    return UserResponseDto.fromEntity(user);
  }
}
