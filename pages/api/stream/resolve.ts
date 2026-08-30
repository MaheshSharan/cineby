import type { NextApiRequest, NextApiResponse } from "next";

import { consumeResolveToken } from "@/lib/security/resolveToken";
import { slidingWindowLimit } from "@/lib/security/rateLimit";
import { getOrResolveStream } from "@/lib/stream/cache";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import type { MediaType, StreamResponse } from "@/lib/providers/types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<StreamResponse | { error: string; reason?: string }>
) {
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

  const perMinKey = `rl:resolve:min:${ip}:${sessionId}`;
  const perMin = await slidingWindowLimit(perMinKey, { windowSecs: 60, max: 10 });

  if (!perMin.allowed) {
    res.setHeader("Retry-After", "60");
    res.status(429).json({ error: "Too many requests" });
    return;
  }

  const perHourKey = `rl:resolve:hour:${ip}`;
  const perHour = await slidingWindowLimit(perHourKey, { windowSecs: 3600, max: 100 });

  if (!perHour.allowed) {
    res.setHeader("Retry-After", "3600");
    res.status(429).json({ error: "Hourly limit reached" });
    return;
  }

  const token = req.headers["x-stream-token"] as string;
  if (!token) {
    res.status(403).json({ error: "Missing stream token" });
    return;
  }

  const { tmdbId, type, season, episode } = req.query;

  const parsedTmdbId = Number.parseInt(String(tmdbId || ""), 10);
  if (!parsedTmdbId || Number.isNaN(parsedTmdbId)) {
    res.status(400).json({ error: "Missing or invalid tmdbId parameter." });
    return;
  }

  const tokenResult = await consumeResolveToken(token, sessionId, ipPrefix, parsedTmdbId);
  if (!tokenResult.valid) {
    res.status(403).json({
      error: "Invalid token",
      reason: tokenResult.reason,
    });
    return;
  }

  const mediaType: MediaType = type === "tv" ? "tv" : "movie";
  const seasonNum = season ? Number.parseInt(String(season), 10) : undefined;
  const episodeNum = episode ? Number.parseInt(String(episode), 10) : undefined;

  try {
    const result = await getOrResolveStream({
      tmdbId: parsedTmdbId,
      type: mediaType,
      season: seasonNum,
      episode: episodeNum,
    });

    res.status(200).json(result);
    return;
  } catch {
    res.status(500).json({
      error: "Stream resolution failed",
    });
    return;
  }
}
