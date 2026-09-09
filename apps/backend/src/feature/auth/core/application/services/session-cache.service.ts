import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import {
  CACHE_STORE,
  type ICacheStore,
} from '~common/cache/domain/cache-store.interface';
import { User } from '~feature/user/core/domain/entities/user.entity';

interface CachedSession {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  balance: number;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

const DEFAULT_TTL_SECONDS = 30;

@Injectable()
export class SessionCacheService {
  private readonly logger = new Logger(SessionCacheService.name);
  private readonly ttlSeconds: number;

  constructor(
    @Inject(CACHE_STORE) private readonly cache: ICacheStore,
    configService: ConfigService,
  ) {
    this.ttlSeconds = configService.get<number>(
      'SESSION_CACHE_TTL_SECONDS',
      DEFAULT_TTL_SECONDS,
    );
  }

  async get(token: string): Promise<User | null> {
    if (this.ttlSeconds <= 0) {
      return null;
    }

    try {
      const cached = await this.cache.get<CachedSession>(this.keyFor(token));
      return cached ? this.toUser(cached) : null;
    } catch (error) {
      this.warn(error);
      return null;
    }
  }

  async set(token: string, user: User): Promise<void> {
    if (this.ttlSeconds <= 0) {
      return;
    }

    try {
      await this.cache.set(
        this.keyFor(token),
        this.toCachedSession(user),
        this.ttlSeconds,
      );
    } catch (error) {
      this.warn(error);
    }
  }

  async invalidate(token: string): Promise<void> {
    try {
      await this.cache.delete(this.keyFor(token));
    } catch (error) {
      this.warn(error);
    }
  }

  private keyFor(token: string): string {
    return `session:${createHash('sha256').update(token).digest('hex')}`;
  }

  private toCachedSession(user: User): CachedSession {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      balance: user.balance,
      emailVerified: user.emailVerified,
      createdAt: new Date(user.createdAt).toISOString(),
      updatedAt: new Date(user.updatedAt).toISOString(),
    };
  }

  private toUser(cached: CachedSession): User {
    return new User({
      id: cached.id,
      email: cached.email,
      firstName: cached.firstName,
      lastName: cached.lastName,
      balance: cached.balance,
      emailVerified: cached.emailVerified,
      createdAt: new Date(cached.createdAt),
      updatedAt: new Date(cached.updatedAt),
    });
  }

  private warn(error: unknown): void {
    this.logger.warn(
      `Session cache unavailable, falling back to full validation: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}
