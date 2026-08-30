import type { NextApiRequest, NextApiResponse } from "next";

import { consumeResolveToken } from "@/lib/security/resolveToken";
import { slidingWindowLimit } from "@/lib/security/rateLimit";
import { getOrResolveStream } from "@/lib/stream/cache";
import { applyStreamProxy } from "@/lib/providers/proxy";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import type { MediaType, StreamResponse } from "@/lib/providers/types";
import { logInfo, logError, logWarn } from "@/lib/logger";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<StreamResponse | { error: string; reason?: string }>
) {
  const startTime = Date.now();

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    return;
  }

  const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim()
    ?? req.socket.remoteAddress
    ?? "0.0.0.0";
  const ipPrefix = ip.split(".").slice(0, 3).join(".");
  const user = getCurrentUser(req);
  const sessionId = user?.id?.toString() ?? "anon";

  const { tmdbId, type, season, episode } = req.query;
  logInfo(
    "API:Resolve",
    `Request: ${type}/${tmdbId}${season ? ` S${season}E${episode}` : ""} from session=${sessionId}, ip=${ipPrefix}.xxx`
  );

  const perMinKey = `rl:resolve:min:${ip}:${sessionId}`;
  const perMin = await slidingWindowLimit(perMinKey, { windowSecs: 60, max: 10 });

  if (!perMin.allowed) {
    logWarn("API:Resolve", `Rate limit (per-min) hit: ${sessionId}`);
    res.setHeader("Retry-After", "60");
    res.status(429).json({ error: "Too many requests" });
    return;
  }

  const perHourKey = `rl:resolve:hour:${ip}`;
  const perHour = await slidingWindowLimit(perHourKey, { windowSecs: 3600, max: 100 });

  if (!perHour.allowed) {
    logWarn("API:Resolve", `Rate limit (per-hour) hit: ${ipPrefix}.xxx`);
    res.setHeader("Retry-After", "3600");
    res.status(429).json({ error: "Hourly limit reached" });
    return;
  }

  const token = req.headers["x-stream-token"] as string;
  if (!token) {
    logWarn("API:Resolve", "Missing X-Stream-Token header");
    res.status(403).json({ error: "Missing stream token" });
    return;
  }

  const parsedTmdbId = Number.parseInt(String(tmdbId || ""), 10);
  if (!parsedTmdbId || Number.isNaN(parsedTmdbId)) {
    logError("API:Resolve", `Invalid tmdbId: ${tmdbId}`);
    res.status(400).json({ error: "Missing or invalid tmdbId parameter." });
    return;
  }

  logInfo("API:Resolve", `Validating token for tmdbId=${parsedTmdbId}`);
  const tokenResult = await consumeResolveToken(token, sessionId, ipPrefix, parsedTmdbId);
  if (!tokenResult.valid) {
    logWarn("API:Resolve", `Token validation failed: ${tokenResult.reason}`);
    res.status(403).json({
      error: "Invalid token",
      reason: tokenResult.reason,
    });
    return;
  }

  logInfo("API:Resolve", "Token validated successfully");

  const mediaType: MediaType = type === "tv" ? "tv" : "movie";
  const seasonNum = season ? Number.parseInt(String(season), 10) : undefined;
  const episodeNum = episode ? Number.parseInt(String(episode), 10) : undefined;
  const serverId = typeof req.query.server === "string" && req.query.server ? req.query.server : undefined;

  logInfo("API:Resolve", "Calling stream resolver (cache or provider)");

  try {
    const resolved = await getOrResolveStream(
      {
        tmdbId: parsedTmdbId,
        type: mediaType,
        season: seasonNum,
        episode: episodeNum,
      },
      { serverId }
    );
    // Wrap upstream URLs with fresh descriptors on every response so cached results
    // never serve already-aging (or expired) proxy tokens.
    const result = applyStreamProxy(resolved);

    const elapsed = Date.now() - startTime;
    logInfo(
      "API:Resolve",
      `✅ Resolved ${result.sources.length} sources in ${elapsed}ms`,
      { sources: result.sources.map((s) => `${s.provider.id}:${s.quality}`) }
    );

    res.status(200).json(result);
    return;
  } catch (error) {
    const elapsed = Date.now() - startTime;
    logError("API:Resolve", error);
    logInfo("API:Resolve", `❌ Failed after ${elapsed}ms`);
    res.status(500).json({
      error: "Stream resolution failed",
    });
    return;
  }
}
