import { Injectable } from '@nestjs/common';
import {
  DomainForbiddenException,
  DomainValidationException,
} from '~common/exceptions/domain.exceptions';
import { BetterAuthProvider } from '~feature/auth/core/infrastructure/providers/better-auth.provider';
import {
  ChangePasswordCommand,
  ChangePasswordResult,
  IPasswordChanger,
} from '../../domain/services/password-changer.interface';

interface AuthApiError {
  statusCode: number;
  body?: { message?: string; code?: string };
}

function asAuthApiError(error: unknown): AuthApiError | null {
  if (typeof error !== 'object' || error === null) {
    return null;
  }

  const candidate = error as { statusCode?: unknown };

  return typeof candidate.statusCode === 'number'
    ? (error as AuthApiError)
    : null;
}

@Injectable()
export class BetterAuthPasswordChanger implements IPasswordChanger {
  private readonly betterAuth: BetterAuthProvider['auth'];

  constructor(betterAuthProvider: BetterAuthProvider) {
    this.betterAuth = betterAuthProvider.auth;
  }

  async changePassword(
    command: ChangePasswordCommand,
  ): Promise<ChangePasswordResult> {
    try {
      const { headers } = await this.betterAuth.api.changePassword({
        body: {
          currentPassword: command.currentPassword,
          newPassword: command.newPassword,
          revokeOtherSessions: true,
        },
        headers: command.sessionHeaders,
        returnHeaders: true,
      });

      return { sessionCookies: headers?.getSetCookie() ?? [] };
    } catch (error) {
      throw this.toDomainException(error);
    }
  }

  private toDomainException(error: unknown): unknown {
    const apiError = asAuthApiError(error);

    if (!apiError) {
      return error;
    }

    const message = apiError.body?.message ?? 'Password change was rejected';

    if (apiError.statusCode === 401) {
      return new DomainForbiddenException(message);
    }

    if (apiError.statusCode >= 400 && apiError.statusCode < 500) {
      return new DomainValidationException(message);
    }

    return error;
  }
}
