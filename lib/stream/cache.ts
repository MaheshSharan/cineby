import { getJson, setJson } from "@/lib/redis";
import { resolveAllStreams } from "@/lib/providers/registry";
import type { StreamRequest, StreamResponse } from "@/lib/providers/types";

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
    return cached;
  }

  const existing = inflight.get(key);
  if (existing) {
    return existing;
  }

  const promise = resolveAllStreams(req)
    .then(async (result) => {
      await setJson(key, result, 14400);
      return result;
    })
    .finally(() => {
      inflight.delete(key);
    });

  inflight.set(key, promise);
  return promise;
}
