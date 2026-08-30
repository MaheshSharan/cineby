import { getRedis } from "@/lib/redis";

export async function getCachedSeed(tmdbId: number): Promise<string | null> {
  const redis = getRedis();
  return redis.get(`seed:${tmdbId}`);
}

export async function cacheSeed(tmdbId: number, seed: string): Promise<void> {
  const redis = getRedis();
  await redis.setex(`seed:${tmdbId}`, 7200, seed);
}
