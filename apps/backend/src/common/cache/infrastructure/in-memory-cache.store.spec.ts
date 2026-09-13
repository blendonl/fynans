import { InMemoryCacheStore } from './in-memory-cache.store';

describe('InMemoryCacheStore', () => {
  let store: InMemoryCacheStore;

  beforeEach(() => {
    jest.useFakeTimers();
    store = new InMemoryCacheStore();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns a stored value within its ttl', async () => {
    await store.set('key', { id: 1 }, 30);

    await expect(store.get('key')).resolves.toEqual({ id: 1 });
  });

  it('returns null once the ttl has passed', async () => {
    await store.set('key', { id: 1 }, 30);

    jest.advanceTimersByTime(30_001);

    await expect(store.get('key')).resolves.toBeNull();
  });

  it('returns null for a key that was never stored', async () => {
    await expect(store.get('missing')).resolves.toBeNull();
  });

  it('drops a deleted key', async () => {
    await store.set('key', { id: 1 }, 30);
    await store.delete('key');

    await expect(store.get('key')).resolves.toBeNull();
  });
});
