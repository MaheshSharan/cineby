import type { NextApiRequest, NextApiResponse } from "next";
import { getSeasonEpisodes } from "@/lib/tmdb/server";
import { logError } from "@/lib/logger";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const id = parseId(req.query.id);
  const seasonNumber = parseId(req.query.season);

  if (!id || !seasonNumber) {
    res.status(400).json({ error: "Invalid tv id or season" });
    return;
  }

  try {
    const result = await getSeasonEpisodes(id, seasonNumber);
    res.status(200).json(result);
  } catch (error) {
    logError("api/tmdb/tv/season", error);
    res.status(500).json({ error: "Failed to fetch season episodes" });
  }
}

function parseId(value: unknown): number | null {
  const parsed = typeof value === "string" ? Number.parseInt(value, 10) : NaN;

  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}