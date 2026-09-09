import { Injectable, Logger } from '@nestjs/common';
import { SessionCacheService } from '~feature/auth/core/application/services/session-cache.service';
import { BetterAuthProvider } from '~feature/auth/core/infrastructure/providers/better-auth.provider';
import {
  ISessionRevoker,
  RevokeSessionsCommand,
  RevokeSessionsResult,
} from '../../domain/services/session-revoker.interface';

@Injectable()
export class BetterAuthSessionRevoker implements ISessionRevoker {
  private readonly logger = new Logger(BetterAuthSessionRevoker.name);
  private readonly betterAuth: BetterAuthProvider['auth'];

  constructor(
    betterAuthProvider: BetterAuthProvider,
    private readonly sessionCache: SessionCacheService,
  ) {
    this.betterAuth = betterAuthProvider.auth;
  }

  async revokeAll(
    command: RevokeSessionsCommand,
  ): Promise<RevokeSessionsResult> {
    const clearedCookies = await this.signOutCurrentSession(
      command.sessionHeaders,
    );

    const context = await this.betterAuth.$context;
    const sessions = await context.internalAdapter.listSessions(command.userId);

    await context.internalAdapter.deleteSessions(command.userId);
    await this.forgetCachedSessions(
      sessions.map((session) => session.token),
      command.currentCacheKey,
    );

    return { clearedCookies };
  }

  private async signOutCurrentSession(
    sessionHeaders: Headers,
  ): Promise<string[]> {
    try {
      const { headers } = await this.betterAuth.api.signOut({
        headers: sessionHeaders,
        returnHeaders: true,
      });

      return headers?.getSetCookie() ?? [];
    } catch (error) {
      this.logger.warn(
        `Could not collect sign-out cookies for a deleted account: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );

      return [];
    }
  }

  private async forgetCachedSessions(
    tokens: string[],
    currentCacheKey: string | null,
  ): Promise<void> {
    const cacheKeys = new Set(tokens.map((token) => `cookie=|bearer=${token}`));

    if (currentCacheKey) {
      cacheKeys.add(currentCacheKey);
    }

    for (const key of cacheKeys) {
      await this.sessionCache.invalidate(key);
    }
  }
}
