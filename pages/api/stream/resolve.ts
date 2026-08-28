import type { NextApiRequest, NextApiResponse } from "next";

import { resolveAllStreams } from "@/lib/providers/registry";
import type { MediaType, StreamResponse } from "@/lib/providers/types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<StreamResponse | { error: string }>
) {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { tmdbId, type, season, episode, server } = req.query;

  const parsedTmdbId = Number.parseInt(String(tmdbId || ""), 10);
  if (!parsedTmdbId || Number.isNaN(parsedTmdbId)) {
    return res.status(400).json({ error: "Missing or invalid tmdbId parameter." });
  }

  const mediaType: MediaType = type === "tv" ? "tv" : "movie";
  const seasonNum = season ? Number.parseInt(String(season), 10) : undefined;
  const episodeNum = episode ? Number.parseInt(String(episode), 10) : undefined;
  const targetServer = typeof server === "string" && server.trim() ? server.trim() : undefined;

  try {
    let result = await resolveAllStreams(
      {
        tmdbId: parsedTmdbId,
        type: mediaType,
        season: seasonNum,
        episode: episodeNum,
      },
      { targetProviderId: targetServer }
    );

    // If the requested server returned no streams, fall back to all available providers
    if ((!result.sources || result.sources.length === 0) && targetServer) {
      result = await resolveAllStreams({
        tmdbId: parsedTmdbId,
        type: mediaType,
        season: seasonNum,
        episode: episodeNum,
      });
    }

    return res.status(200).json(result);
  } catch {
    return res.status(500).json({
      sources: [],
      subtitles: [],
    });
  }
}
