import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '../../core/application/services/auth.service';
import { RegisterRequestDto } from '../dto/register-request.dto';
import { LoginRequestDto } from '../dto/login-request.dto';
import { RegisterDto } from '../../core/application/dto/register.dto';
import { LoginDto } from '../../core/application/dto/login.dto';
import { Public } from '../decorators/public.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { User } from '../../../user/core/domain/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
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
  async login(@Body() dto: LoginRequestDto) {
    const coreDto: LoginDto = {
      email: dto.email,
      password: dto.password,
    };

    return this.authService.login(coreDto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() req: Request) {
    const [, token] = req.headers.authorization?.split(' ') ?? [];
    if (token) {
      await this.authService.logout(token);
    }
  }

  @Post('me')
  @HttpCode(HttpStatus.OK)
  async me(@CurrentUser() user: User) {
    console.log('Current user:', user);

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }
}
