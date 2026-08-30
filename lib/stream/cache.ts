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
  // v2 = raw upstream URLs (wrapping moved to serve time). Old v1 entries hold
  // pre-wrapped URLs with expiring descriptors and are left to age out of Redis.
  return `manifest:v2:${req.type}:${req.tmdbId}:${s}:${e}`;
}

function matchesServer(providerId: string, serverId: string): boolean {
  return providerId === serverId || providerId.startsWith(`${serverId}-`);
}

// The cache holds the full multi-server resolution for a media item; a request that
// targets one server gets that server's sources filtered out of it. If the requested
// server is not part of the cached result, fall back to a fresh targeted resolution.
function filterByServer(
  result: StreamResponse,
  serverId: string | undefined,
  req: StreamRequest
): Promise<StreamResponse> | StreamResponse {
  if (!serverId || serverId === "default") {
    return result;
  }

  const sources = result.sources.filter((source) =>
    matchesServer(source.provider.id, serverId)
  );

  if (sources.length === 0) {
    logInfo("StreamCache", `🎯 Server "${serverId}" not in cache, resolving targeted`);
    return resolveAllStreams(req, { targetProviderId: serverId });
  }

  return { sources, subtitles: result.subtitles };
}

export async function getOrResolveStream(
  req: StreamRequest,
  options?: { serverId?: string }
): Promise<StreamResponse> {
  const key = cacheKey(req);

  const cached = await getJson<StreamResponse>(key);
  if (cached) {
    logInfo("StreamCache", `✅ Cache HIT: ${key}`);
    return filterByServer(cached, options?.serverId, req);
  }

  logInfo("StreamCache", `❌ Cache MISS: ${key}`);

  const existing = inflight.get(key);
  if (existing) {
    logInfo("StreamCache", `⏳ SingleFlight: Waiting for inflight request ${key}`);
    return filterByServer(await existing, options?.serverId, req);
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
  return filterByServer(await promise, options?.serverId, req);
}
