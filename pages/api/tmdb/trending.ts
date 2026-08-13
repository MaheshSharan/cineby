import type { NextApiRequest, NextApiResponse } from "next";
import { getTrending } from "@/lib/tmdb/server";
import { logError } from "@/lib/logger";
import type { TrendingMediaType } from "@/lib/tmdb/server/trending";
import type { TrendingTimeWindow } from "@/lib/tmdb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const mediaType = parseMediaType(req.query.mediaType);
  const timeWindow = parseTimeWindow(req.query.timeWindow);
  const page = parsePage(req.query.page);

  try {
    const result = await getTrending(mediaType, timeWindow, page);
    res.status(200).json(result);
  } catch (error) {
    logError("api/tmdb/trending", error);
    res.status(500).json({ error: "Failed to fetch trending content" });
  }
}

function parseMediaType(value: unknown): TrendingMediaType {
  if (value === "movie" || value === "tv" || value === "all") {
    return value;
  }

  return "all";
}

function parseTimeWindow(value: unknown): TrendingTimeWindow {
  if (value === "week") {
    return "week";
  }

  return "day";
}

function parsePage(value: unknown): number {
  const parsed = typeof value === "string" ? Number.parseInt(value, 10) : NaN;

  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}