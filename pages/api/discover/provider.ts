import type { NextApiRequest, NextApiResponse } from "next";

import type { MediaSummary } from "@/lib/tmdb";
import { discoverMovies, discoverTv } from "@/lib/tmdb/server";
import { logError } from "@/lib/logger";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method ?? "UNKNOWN"} Not Allowed`);

    return;
  }

  const providerIdParam = req.query.providerId;
  const providerId = typeof providerIdParam === "string" ? Number.parseInt(providerIdParam, 10) : 8;

  try {
    const [moviesData, tvData] = await Promise.all([
      discoverMovies({
        providerId: Number.isNaN(providerId) ? 8 : providerId,
        watchRegion: "IN",
        sortBy: "popularity.desc",
        page: 1,
      }),
      discoverTv({
        providerId: Number.isNaN(providerId) ? 8 : providerId,
        watchRegion: "IN",
        sortBy: "popularity.desc",
        page: 1,
      }),
    ]);

    // Interleave movies and TV shows
    const results: MediaSummary[] = [];
    const maxLen = Math.max(moviesData.results.length, tvData.results.length);

    for (let i = 0; i < maxLen; i += 1) {
      if (i < moviesData.results.length) results.push(moviesData.results[i]);
      if (i < tvData.results.length) results.push(tvData.results[i]);
    }

    res.status(200).json({ results });
  } catch (error) {
    logError("api/discover/provider", error);
    res.status(500).json({ error: "Failed to discover provider content" });
  }
}

