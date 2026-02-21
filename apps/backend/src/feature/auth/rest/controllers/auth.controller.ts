import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiProperty,
} from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from '../../core/application/services/auth.service';
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
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user account' })
  @ApiResponse({ status: 201, type: AuthResultResponseDto })
  async register(@Body() dto: RegisterRequestDto) {
    const coreDto: RegisterDto = {
      email: dto.email,
      password: dto.password,
      firstName: dto.firstName,
      lastName: dto.lastName,
    };

    return this.authService.register(coreDto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in with email and password' })
  @ApiResponse({ status: 200, type: AuthResultResponseDto })
  async login(@Body() dto: LoginRequestDto) {
    const coreDto: LoginDto = {
      email: dto.email,
      password: dto.password,
    };

    return this.authService.login(coreDto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Log out and invalidate the current token' })
  @ApiResponse({ status: 204, description: 'Successfully logged out' })
  async logout(@Req() req: Request) {
    const [, token] = req.headers.authorization?.split(' ') ?? [];
    if (token) {
      await this.authService.logout(token);
    }
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
