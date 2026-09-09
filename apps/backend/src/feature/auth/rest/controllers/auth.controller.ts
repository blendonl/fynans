import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Req,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiProperty,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { AuthService } from '../../core/application/services/auth.service';
import { OnboardingService } from '~feature/onboarding/core/application/services/onboarding.service';
import { SessionCacheService } from '../../core/application/services/session-cache.service';
import {
  applySessionCookies,
  sessionCacheKey,
  toSessionHeaders,
} from '../http/session-http';
import { RegisterRequestDto } from '../dto/register-request.dto';
import { LoginRequestDto } from '../dto/login-request.dto';
import { ForgotPasswordRequestDto } from '../dto/forgot-password-request.dto';
import { ResetPasswordRequestDto } from '../dto/reset-password-request.dto';
import { ResendVerificationRequestDto } from '../dto/resend-verification-request.dto';
import { RegisterDto } from '../../core/application/dto/register.dto';
import { LoginDto } from '../../core/application/dto/login.dto';
import { Public } from '../decorators/public.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { User } from '../../../user/core/domain/entities/user.entity';

class AuthUserDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;
}

class AuthResultResponseDto {
  @ApiProperty()
  token: string;

  @ApiProperty({ type: () => AuthUserDto })
  user: AuthUserDto;

  @ApiProperty()
  expiresAt: Date;
}

class MeResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  emailVerified: boolean;
}

class AcknowledgementResponseDto {
  @ApiProperty()
  message: string;
}

const PASSWORD_RESET_ACKNOWLEDGEMENT =
  'If an account exists for that address, a password reset link is on its way.';

const VERIFICATION_ACKNOWLEDGEMENT =
  'If that address needs verifying, a new verification link is on its way.';

const PASSWORD_RESET_COMPLETED =
  'Your password has been changed. You can sign in with it now.';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly sessionCache: SessionCacheService,
    private readonly onboardingService: OnboardingService,
  ) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user account' })
  @ApiResponse({ status: 201, type: AuthResultResponseDto })
  async register(
    @Body() dto: RegisterRequestDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const coreDto: RegisterDto = {
      email: dto.email,
      password: dto.password,
      firstName: dto.firstName,
      lastName: dto.lastName,
    };

    const { result, sessionCookies } = await this.authService.register(coreDto);
    applySessionCookies(res, sessionCookies);

    await this.onboardingService.seedStarterCatalog(result.user.id);

    return result;
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in with email and password' })
  @ApiResponse({ status: 200, type: AuthResultResponseDto })
  async login(
    @Body() dto: LoginRequestDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const coreDto: LoginDto = {
      email: dto.email,
      password: dto.password,
    };

    const { result, sessionCookies } = await this.authService.login(coreDto);
    applySessionCookies(res, sessionCookies);

    return result;
  }

  @Public()
  @Post('forgot-password')
  @Throttle({ default: { ttl: 60_000, limit: 3 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Request a password reset link',
    description:
      'Always succeeds with the same body so that the response cannot be used to discover whether an address has an account.',
  })
  @ApiResponse({ status: 200, type: AcknowledgementResponseDto })
  async forgotPassword(@Body() dto: ForgotPasswordRequestDto) {
    await this.authService.requestPasswordReset(dto.email);

    return { message: PASSWORD_RESET_ACKNOWLEDGEMENT };
  }

  @Public()
  @Post('reset-password')
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set a new password using a reset token' })
  @ApiResponse({ status: 200, type: AcknowledgementResponseDto })
  @ApiResponse({ status: 400, description: 'Token invalid, expired or used' })
  async resetPassword(@Body() dto: ResetPasswordRequestDto) {
    await this.authService.resetPassword(dto.token, dto.newPassword);

    return { message: PASSWORD_RESET_COMPLETED };
  }

  @Public()
  @Post('send-verification-email')
  @Throttle({ default: { ttl: 60_000, limit: 3 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Send a fresh email verification link',
    description:
      'Always succeeds with the same body so that the response cannot be used to discover whether an address has an account.',
  })
  @ApiResponse({ status: 200, type: AcknowledgementResponseDto })
  async sendVerificationEmail(@Body() dto: ResendVerificationRequestDto) {
    await this.authService.requestEmailVerification(dto.email);

    return { message: VERIFICATION_ACKNOWLEDGEMENT };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Log out and invalidate the current token' })
  @ApiResponse({ status: 204, description: 'Successfully logged out' })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const cacheKey = sessionCacheKey(req);

    if (cacheKey) {
      await this.sessionCache.invalidate(cacheKey);
    }

    const sessionCookies = await this.authService.logout(toSessionHeaders(req));
    applySessionCookies(res, sessionCookies);
  }

  @Get('me')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Get the currently authenticated user profile' })
  @ApiResponse({ status: 200, type: MeResponseDto })
  async me(@CurrentUser() user: User) {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      emailVerified: user.emailVerified,
    };
  }
}
