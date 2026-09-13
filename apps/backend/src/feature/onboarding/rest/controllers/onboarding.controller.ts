import { Controller, Get, Post, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { OnboardingService } from '../../core/application/services/onboarding.service';
import { OnboardingStatusResponseDto } from '../dto/onboarding-status-response.dto';
import { CurrentUser } from '~feature/auth/rest/decorators/current-user.decorator';
import { User } from '~feature/user/core/domain/entities/user.entity';

@ApiTags('Onboarding')
@ApiBearerAuth('bearer')
@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Get('status')
  @ApiOperation({
    summary: 'Report which first-run steps are still outstanding',
  })
  @ApiResponse({ status: 200, type: OnboardingStatusResponseDto })
  async status(
    @CurrentUser() user: User,
  ): Promise<OnboardingStatusResponseDto> {
    const status = await this.onboardingService.getStatus(user.id);

    return OnboardingStatusResponseDto.fromStatus(status);
  }

  @Post('bootstrap')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Create the starter catalog for the current user',
    description:
      'Idempotent. Does nothing when the caller can already see categories, so a retry or a second client cannot double-seed.',
  })
  @ApiResponse({ status: 200, type: OnboardingStatusResponseDto })
  async bootstrap(
    @CurrentUser() user: User,
  ): Promise<OnboardingStatusResponseDto> {
    const status = await this.onboardingService.bootstrap(user.id);

    return OnboardingStatusResponseDto.fromStatus(status);
  }
}
