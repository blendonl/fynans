import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../../../common/prisma/prisma.service';
import { BetterAuthProvider } from '../../infrastructure/providers/better-auth.provider';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { AuthResultDto } from '../dto/auth-result.dto';
import { User } from '../../../../user/core/domain/entities/user.entity';

@Injectable()
export class AuthService {
  private betterAuth;

  constructor(
    private readonly prisma: PrismaService,
    betterAuthProvider: BetterAuthProvider,
  ) {
    this.betterAuth = betterAuthProvider.auth;
  }

  async register(dto: RegisterDto): Promise<AuthResultDto> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const response = await this.betterAuth.api.signUpEmail({
      body: {
        email: dto.email,
        password: dto.password,
        name: `${dto.firstName} ${dto.lastName}`,
      },
    });

    if (!response.token) {
      throw new BadRequestException('Failed to create user session');
    }

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    return {
      token: response.token,
      user: {
        id: response.user.id,
        email: response.user.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
      },
      expiresAt,
    };
  }

  async login(dto: LoginDto): Promise<AuthResultDto> {
    const response = await this.betterAuth.api.signInEmail({
      body: {
        email: dto.email,
        password: dto.password,
      },
    });

    if (!response.token) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: response.user.id },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    return {
      token: response.token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      expiresAt,
    };
  }

  async validateSession(token: string): Promise<User> {
    const response = await this.betterAuth.api.getSession({
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    if (!response?.session || !response?.user) {
      throw new UnauthorizedException('Invalid or expired session');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: response.user.id },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      balance: Number(user.balance),
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      fullName: `${user.firstName} ${user.lastName}`,
      toJSON() {
        return {
          id: this.id,
          email: this.email,
          firstName: this.firstName,
          lastName: this.lastName,
          balance: this.balance,
          emailVerified: this.emailVerified,
          createdAt: this.createdAt,
          updatedAt: this.updatedAt,
        };
      },
    } as User;
  }

  async logout(token: string): Promise<void> {
    await this.betterAuth.api.signOut({
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
  }
}
