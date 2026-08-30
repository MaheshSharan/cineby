import { getJson, setJson } from "@/lib/redis";
import { resolveAllStreams } from "@/lib/providers/registry";
import type { StreamRequest, StreamResponse } from "@/lib/providers/types";
import { logInfo } from "@/lib/logger";

// TODO: Replace with Redis SET NX lock for multi-process VPS deployment
// Current implementation: in-memory Map is per-process only
const inflight = new Map<string, Promise<StreamResponse>>();

function cacheKey(req: StreamRequest): string {
  const s = req.season ?? 0;
  const e = req.episode ?? 0;
  return `manifest:${req.type}:${req.tmdbId}:${s}:${e}`;
}

export async function getOrResolveStream(
  req: StreamRequest,
): Promise<StreamResponse> {
  const key = cacheKey(req);

  const cached = await getJson<StreamResponse>(key);
  if (cached) {
    logInfo("StreamCache", `✅ Cache HIT: ${key}`);
    return cached;
  }

  logInfo("StreamCache", `❌ Cache MISS: ${key}`);

  const existing = inflight.get(key);
  if (existing) {
    logInfo("StreamCache", `⏳ SingleFlight: Waiting for inflight request ${key}`);
    return existing;
  }

  logInfo("StreamCache", `🔍 Starting provider resolution for ${key}`);

  const promise = resolveAllStreams(req)
    .then(async (result) => {
      logInfo("StreamCache", `💾 Caching result for ${key} (TTL=4h)`);
      await setJson(key, result, 14400);
      return result;
    })
    .finally(() => {
      inflight.delete(key);
    });

  inflight.set(key, promise);
  return promise;
}
