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
import { Request, Response } from 'express';
import { AuthService } from '../../core/application/services/auth.service';
import { SessionCacheService } from '../../core/application/services/session-cache.service';
import {
  applySessionCookies,
  sessionCacheKey,
  toSessionHeaders,
} from '../http/session-http';
import { RegisterRequestDto } from '../dto/register-request.dto';
import { LoginRequestDto } from '../dto/login-request.dto';
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
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly sessionCache: SessionCacheService,
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
    };
  }
}
