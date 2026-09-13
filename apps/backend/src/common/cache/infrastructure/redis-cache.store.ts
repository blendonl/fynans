import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { ICacheStore } from '../domain/cache-store.interface';

export interface RedisCacheStoreOptions {
  host: string;
  port: number;
}

@Injectable()
export class RedisCacheStore implements ICacheStore, OnModuleDestroy {
  private readonly logger = new Logger(RedisCacheStore.name);
  private readonly redis: Redis;
  private degraded = false;

  constructor(
    options: RedisCacheStoreOptions,
    private readonly fallback: ICacheStore,
  ) {
    this.redis = new Redis({
      host: options.host,
      port: options.port,
      lazyConnect: true,
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
      retryStrategy: () => null,
    });

    this.redis.on('error', (error: Error) => this.degrade(error));
  }

  async get<T>(key: string): Promise<T | null> {
    if (this.degraded) {
      return this.fallback.get<T>(key);
    }

    try {
      const raw = await this.redis.get(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch (error) {
      this.degrade(error);
      return this.fallback.get<T>(key);
    }
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    if (this.degraded) {
      return this.fallback.set(key, value, ttlSeconds);
    }

    try {
      await this.redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch (error) {
      this.degrade(error);
      await this.fallback.set(key, value, ttlSeconds);
    }
  }

  async delete(key: string): Promise<void> {
    await this.fallback.delete(key);

    if (this.degraded) {
      return;
    }

    try {
      await this.redis.del(key);
    } catch (error) {
      this.degrade(error);
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.redis.quit().catch(() => this.redis.disconnect());
  }

  private degrade(error: unknown): void {
    if (this.degraded) {
      return;
    }

    this.degraded = true;
    this.logger.warn(
      `Redis is unavailable, falling back to the in-process cache: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}
