type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

const cacheStore = new Map<string, CacheEntry<unknown>>();

export function getCachedValue<T>(key: string): T | null {
  const entry = cacheStore.get(key);
  if (!entry) {
    return null;
  }

  if (Date.now() > entry.expiresAt) {
    cacheStore.delete(key);
    return null;
  }

  return entry.value as T;
}

export function setCachedValue<T>(key: string, value: T, ttlMs = 10 * 60 * 1000) {
  cacheStore.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
}

export async function rememberAsync<T>(key: string, resolver: () => Promise<T>, ttlMs?: number) {
  const cached = getCachedValue<T>(key);
  if (cached !== null) {
    return cached;
  }

  const value = await resolver();
  setCachedValue(key, value, ttlMs);
  return value;
}
