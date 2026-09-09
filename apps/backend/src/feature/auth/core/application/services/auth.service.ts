import {
  Injectable,
  Logger,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../../../common/prisma/prisma.service';
import { BetterAuthProvider } from '../../infrastructure/providers/better-auth.provider';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { AuthResultDto, AuthSessionDto } from '../dto/auth-result.dto';
import { User } from '../../../../user/core/domain/entities/user.entity';

const SESSION_LIFETIME_MS = 30 * 24 * 60 * 60 * 1000;
const UNATTRIBUTABLE_RESPONSE_FLOOR_MS = 600;

const INVALID_RESET_TOKEN_MESSAGE =
  'This password reset link is invalid or has already been used. Request a new one.';
const PASSWORD_TOO_SHORT_MESSAGE =
  'Password must be at least 8 characters long';
const PASSWORD_TOO_LONG_MESSAGE =
  'Password must be at most 128 characters long';

function toSessionCookies(headers: Headers | null | undefined): string[] {
  return headers?.getSetCookie() ?? [];
}

function bearerHeaders(token: string): Headers {
  return new Headers({ authorization: `Bearer ${token}` });
}

function errorMessageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
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
      throw new ConflictException('User with this email already exists');
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
      throw new BadRequestException('Failed to create user session');
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
      throw new UnauthorizedException('Invalid credentials');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: response.user.id },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
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

  async requestPasswordReset(email: string): Promise<void> {
    const responseFloor = delay(UNATTRIBUTABLE_RESPONSE_FLOOR_MS);

    try {
      await this.betterAuth.api.requestPasswordReset({ body: { email } });
    } catch (error) {
      this.logger.error(
        `Password reset request could not be completed: ${errorMessageOf(error)}`,
      );
    }

    await responseFloor;
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      await this.betterAuth.api.resetPassword({
        body: { token, newPassword },
      });
    } catch (error) {
      throw this.toResetPasswordFailure(error);
    }
  }

  async requestEmailVerification(email: string): Promise<void> {
    const responseFloor = delay(UNATTRIBUTABLE_RESPONSE_FLOOR_MS);

    try {
      await this.betterAuth.api.sendVerificationEmail({ body: { email } });
    } catch (error) {
      this.logger.error(
        `Verification email could not be sent: ${errorMessageOf(error)}`,
      );
    }

    await responseFloor;
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

  private toResetPasswordFailure(error: unknown): Error {
    const message = errorMessageOf(error);

    if (message.includes('Password too short')) {
      return new BadRequestException(PASSWORD_TOO_SHORT_MESSAGE);
    }

    if (message.includes('Password too long')) {
      return new BadRequestException(PASSWORD_TOO_LONG_MESSAGE);
    }

    if (message.includes('Invalid token')) {
      return new BadRequestException(INVALID_RESET_TOKEN_MESSAGE);
    }

    this.logger.error(`Password reset failed unexpectedly: ${message}`);
    return new BadRequestException(INVALID_RESET_TOKEN_MESSAGE);
  }

  private async resolveSessionUser(headers: Headers): Promise<User> {
    const response = await this.betterAuth.api.getSession({ headers });

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
