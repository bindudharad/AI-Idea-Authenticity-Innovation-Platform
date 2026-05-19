type RateLimitEntry = {
  count: number;
  resetAt: number;
};

declare global {
  var __ideaPlatformRateLimits__: Map<string, RateLimitEntry> | undefined;
}

const store = globalThis.__ideaPlatformRateLimits__ ?? new Map<string, RateLimitEntry>();
globalThis.__ideaPlatformRateLimits__ = store;

export function enforceRateLimit(key: string, limit = 20, windowMs = 60_000) {
  const now = Date.now();
  const existing = store.get(key);

  if (!existing || existing.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (existing.count >= limit) {
    return { allowed: false, retryAfterMs: existing.resetAt - now };
  }

  existing.count += 1;
  store.set(key, existing);
  return { allowed: true, remaining: limit - existing.count };
}
