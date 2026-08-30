import Redis from "ioredis";
import { logError } from "./logger";

let client: Redis | null = null;

export function getRedis(): Redis {
  if (client) return client;

  const url = process.env.REDIS_URL ?? "redis://localhost:6379";

  client = new Redis(url, {
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => Math.min(times * 50, 2000),
    lazyConnect: false,
  });

  client.on("error", (err) => {
    logError("Redis", err);
  });

  client.on("connect", () => {
    console.log("[Redis] Connected");
  });

  return client;
}

export async function getJson<T>(key: string): Promise<T | null> {
  const redis = getRedis();
  const raw = await redis.get(key);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function setJson<T>(
  key: string,
  value: T,
  ttlSeconds?: number,
): Promise<void> {
  const redis = getRedis();
  const raw = JSON.stringify(value);

  if (ttlSeconds) {
    await redis.setex(key, ttlSeconds, raw);
  } else {
    await redis.set(key, raw);
  }
}
