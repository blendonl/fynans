import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import { ICacheStore } from '~common/cache/domain/cache-store.interface';
import { User } from '~feature/user/core/domain/entities/user.entity';
import { SessionCacheService } from './session-cache.service';

const TOKEN = 'a-session-token';

const user = new User({
  id: 'user-1',
  email: 'a@b.test',
  firstName: 'Ada',
  lastName: 'Lovelace',
  balance: 12.5,
  emailVerified: true,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-02-01T00:00:00.000Z'),
});

function configWith(ttl?: number): ConfigService {
  return {
    get: (_key: string, fallback: number) => ttl ?? fallback,
  } as unknown as ConfigService;
}

describe('SessionCacheService', () => {
  let store: {
    get: jest.Mock;
    set: jest.Mock;
    delete: jest.Mock;
  };

  beforeEach(() => {
    store = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
    };
  });

  function serviceWith(ttl?: number) {
    return new SessionCacheService(
      store as unknown as ICacheStore,
      configWith(ttl),
    );
  }

  it('keys entries by a hash of the token rather than the token itself', async () => {
    await serviceWith().set(TOKEN, user);

    const [key] = store.set.mock.calls[0] as [string];

    expect(key).toBe(
      `session:${createHash('sha256').update(TOKEN).digest('hex')}`,
    );
    expect(key).not.toContain(TOKEN);
  });

  it('stores the session for the configured ttl', async () => {
    await serviceWith(45).set(TOKEN, user);

    expect(store.set).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ id: 'user-1', email: 'a@b.test' }),
      45,
    );
  });

  it('rehydrates a cached session into a usable user', async () => {
    const service = serviceWith();
    await service.set(TOKEN, user);
    const [, snapshot] = store.set.mock.calls[0] as [string, unknown];
    store.get.mockResolvedValue(snapshot);

    const cached = await service.get(TOKEN);

    expect(cached).toBeInstanceOf(User);
    expect(cached?.id).toBe('user-1');
    expect(cached?.fullName).toBe('Ada Lovelace');
    expect(cached?.createdAt).toEqual(new Date('2026-01-01T00:00:00.000Z'));
  });

  it('reports a miss when nothing is cached', async () => {
    await expect(serviceWith().get(TOKEN)).resolves.toBeNull();
  });

  it('reports a miss rather than failing when the store is unavailable', async () => {
    store.get.mockRejectedValue(new Error('ECONNREFUSED'));

    await expect(serviceWith().get(TOKEN)).resolves.toBeNull();
  });

  it('swallows a write failure so a request never fails on the cache', async () => {
    store.set.mockRejectedValue(new Error('ECONNREFUSED'));

    await expect(serviceWith().set(TOKEN, user)).resolves.toBeUndefined();
  });

  it('is disabled entirely by a ttl of zero', async () => {
    const service = serviceWith(0);

    await service.set(TOKEN, user);
    await expect(service.get(TOKEN)).resolves.toBeNull();

    expect(store.set).not.toHaveBeenCalled();
    expect(store.get).not.toHaveBeenCalled();
  });

  it('drops the entry on invalidation', async () => {
    await serviceWith().invalidate(TOKEN);

    expect(store.delete).toHaveBeenCalledWith(
      `session:${createHash('sha256').update(TOKEN).digest('hex')}`,
    );
  });
});
