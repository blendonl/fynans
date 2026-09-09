import { Injectable } from '@nestjs/common';
import {
  DomainConflictException,
  DomainUnauthorizedException,
  DomainValidationException,
} from '~common/exceptions/domain.exceptions';
import { PrismaService } from '../../../../../common/prisma/prisma.service';
import { BetterAuthProvider } from '../../infrastructure/providers/better-auth.provider';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { AuthResultDto, AuthSessionDto } from '../dto/auth-result.dto';
import { User } from '../../../../user/core/domain/entities/user.entity';

const SESSION_LIFETIME_MS = 30 * 24 * 60 * 60 * 1000;

function toSessionCookies(headers: Headers | null | undefined): string[] {
  return headers?.getSetCookie() ?? [];
}

function bearerHeaders(token: string): Headers {
  return new Headers({ authorization: `Bearer ${token}` });
}

@Injectable()
export class AuthService {
  private betterAuth;

  constructor(
    private readonly prisma: PrismaService,
    betterAuthProvider: BetterAuthProvider,
  ) {
    this.betterAuth = betterAuthProvider.auth;
  }

  async register(dto: RegisterDto): Promise<AuthSessionDto> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new DomainConflictException('User with this email already exists');
    }

    const { headers, response } = await this.betterAuth.api.signUpEmail({
      body: {
        email: dto.email,
        password: dto.password,
        name: `${dto.firstName} ${dto.lastName}`,
      },
      returnHeaders: true,
    });

    if (!response.token) {
      throw new DomainValidationException('Failed to create user session');
    }

    const result: AuthResultDto = {
      token: response.token,
      user: {
        id: response.user.id,
        email: response.user.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
      },
      expiresAt: new Date(Date.now() + SESSION_LIFETIME_MS),
    };

    return { result, sessionCookies: toSessionCookies(headers) };
  }

  async login(dto: LoginDto): Promise<AuthSessionDto> {
    const { headers, response } = await this.betterAuth.api.signInEmail({
      body: {
        email: dto.email,
        password: dto.password,
      },
      returnHeaders: true,
    });

    if (!response.token) {
      throw new DomainUnauthorizedException('Invalid credentials');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: response.user.id },
    });

    if (!user) {
      throw new DomainUnauthorizedException('User not found');
    }

    const result: AuthResultDto = {
      token: response.token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      expiresAt: new Date(Date.now() + SESSION_LIFETIME_MS),
    };

    return { result, sessionCookies: toSessionCookies(headers) };
  }

  async validateSession(token: string): Promise<User> {
    return this.resolveSessionUser(bearerHeaders(token));
  }

  async validateRequestSession(headers: Headers): Promise<User> {
    return this.resolveSessionUser(headers);
  }

  async logout(headers: Headers): Promise<string[]> {
    const { headers: responseHeaders } = await this.betterAuth.api.signOut({
      headers,
      returnHeaders: true,
    });

    return toSessionCookies(responseHeaders);
  }

  private async resolveSessionUser(headers: Headers): Promise<User> {
    const response = await this.betterAuth.api.getSession({ headers });

    if (!response?.session || !response?.user) {
      throw new DomainUnauthorizedException('Invalid or expired session');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: response.user.id },
    });

    if (!user) {
      throw new DomainUnauthorizedException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
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
          emailVerified: this.emailVerified,
          createdAt: this.createdAt,
          updatedAt: this.updatedAt,
        };
      },
    } as User;
  }
}
