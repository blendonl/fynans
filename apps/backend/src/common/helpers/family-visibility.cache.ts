import { AsyncLocalStorage } from 'async_hooks';

type VisibilityCache = Map<string, Promise<string[]>>;

const storage = new AsyncLocalStorage<VisibilityCache>();

export function runWithFamilyVisibilityCache<T>(work: () => T): T {
  return storage.run(new Map(), work);
}

export function cachedVisibleUserIds(
  userId: string,
  compute: () => Promise<string[]>,
): Promise<string[]> {
  const cache = storage.getStore();
  if (!cache) {
    return compute();
  }

  const cached = cache.get(userId);
  if (cached) {
    return cached;
  }

  const pending = compute().catch((error: unknown) => {
    cache.delete(userId);
    throw error;
  });
  cache.set(userId, pending);
  return pending;
}
