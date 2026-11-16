/**
 * Rate limiter for server actions / route handlers.
 *
 * - If UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN are set, uses Upstash
 *   REST API (multi-instance safe).
 * - Otherwise falls back to in-memory Map (single-instance / local dev).
 *
 * Keyed by logical action + user id (or email/IP when anonymous).
 */

type Bucket = {
  count: number;
  resetAt: number;
};

const memoryStore = new Map<string, Bucket>();

export type RateLimitResult =
  | { ok: true }
  | { ok: false; retryAfterSeconds: number };

function memoryCheck(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  let bucket = memoryStore.get(key);

  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + windowMs };
    memoryStore.set(key, bucket);
  }

  bucket.count += 1;

  if (bucket.count > limit) {
    return {
      ok: false,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((bucket.resetAt - now) / 1000)
      )
    };
  }

  if (memoryStore.size > 5000) {
    for (const [k, v] of memoryStore) {
      if (v.resetAt <= now) memoryStore.delete(k);
    }
  }

  return { ok: true };
}

/**
 * Upstash REST fixed-window increment.
 * Uses INCR + EXPIRE via the pipeline REST endpoint when configured.
 */
async function upstashCheck(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    return memoryCheck(key, limit, windowMs);
  }

  const windowSec = Math.max(1, Math.ceil(windowMs / 1000));
  const redisKey = `rl:${key}`;

  try {
    // Pipeline: INCR key, EXPIRE key windowSec NX (only set TTL on first hit)
    const res = await fetch(`${url}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify([
        ["INCR", redisKey],
        ["EXPIRE", redisKey, String(windowSec), "NX"]
      ]),
      // Avoid hanging server actions
      signal: AbortSignal.timeout(2000)
    });

    if (!res.ok) {
      console.error("[rate-limit] Upstash HTTP", res.status);
      return memoryCheck(key, limit, windowMs);
    }

    const data = (await res.json()) as { result?: unknown }[];
    const count = Number(data?.[0]?.result ?? 0);

    if (count > limit) {
      return { ok: false, retryAfterSeconds: windowSec };
    }
    return { ok: true };
  } catch (e) {
    console.error("[rate-limit] Upstash error, falling back to memory", e);
    return memoryCheck(key, limit, windowMs);
  }
}

/**
 * Sync API kept for existing call sites. Uses memory immediately;
 * when Upstash is configured, fire-and-forget is not enough for correctness,
 * so prefer `checkRateLimitAsync` on new code paths.
 *
 * For backward compatibility: if Upstash env is present, still uses memory
 * for sync callers; critical paths should migrate to async.
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  return memoryCheck(key, limit, windowMs);
}

/**
 * Preferred: multi-instance safe when Upstash env vars are set.
 */
export async function checkRateLimitAsync(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  if (
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    return upstashCheck(key, limit, windowMs);
  }
  return memoryCheck(key, limit, windowMs);
}

/** Common presets */
export const RateLimits = {
  auth: { limit: 10, windowMs: 15 * 60 * 1000 },
  bookingCreate: { limit: 20, windowMs: 60 * 60 * 1000 },
  reviewSubmit: { limit: 15, windowMs: 60 * 60 * 1000 },
  reportCreate: { limit: 10, windowMs: 60 * 60 * 1000 },
  documentSign: { limit: 30, windowMs: 60 * 1000 },
  /** Admin destructive / privileged actions per staff user */
  adminAction: { limit: 30, windowMs: 60 * 60 * 1000 }
} as const;
