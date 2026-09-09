import { Injectable } from '@nestjs/common';
import { ICacheStore } from '../domain/cache-store.interface';

interface Entry {
  value: unknown;
  expiresAt: number;
}

@Injectable()
export class InMemoryCacheStore implements ICacheStore {
  private readonly entries = new Map<string, Entry>();

  get<T>(key: string): Promise<T | null> {
    const entry = this.entries.get(key);

    if (!entry) {
      return Promise.resolve(null);
    }

    if (entry.expiresAt <= Date.now()) {
      this.entries.delete(key);
      return Promise.resolve(null);
    }

    return Promise.resolve(entry.value as T);
  }

  set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    this.entries.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });

    return Promise.resolve();
  }

  delete(key: string): Promise<void> {
    this.entries.delete(key);
    return Promise.resolve();
  }
}
