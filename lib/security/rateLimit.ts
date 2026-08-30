import { getRedis } from "@/lib/redis";

interface RateLimitConfig {
  windowSecs: number;
  max: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfter?: number;
}

export async function slidingWindowLimit(
  key: string,
  config: RateLimitConfig,
): Promise<RateLimitResult> {
  const redis = getRedis();
  const now = Date.now();
  const windowStart = now - config.windowSecs * 1000;

  const pipeline = redis.pipeline();

  pipeline.zremrangebyscore(key, 0, windowStart);
  pipeline.zadd(key, now, `${now}-${Math.random()}`);
  pipeline.zcard(key);
  pipeline.expire(key, config.windowSecs);

  const results = await pipeline.exec();

  if (!results) {
    return { allowed: true, remaining: config.max };
  }

  const count = (results[2]?.[1] as number) ?? 0;

  if (count > config.max) {
    return {
      allowed: false,
      remaining: 0,
      retryAfter: config.windowSecs,
    };
  }

  return {
    allowed: true,
    remaining: config.max - count,
  };
}
