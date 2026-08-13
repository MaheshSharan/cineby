import type { NextApiRequest, NextApiResponse } from "next";
import { getGenres } from "@/lib/tmdb/server";
import { logError } from "@/lib/logger";
import type { MediaType } from "@/lib/tmdb";

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

  try {
    const result = await getGenres(mediaType);
    res.status(200).json(result);
  } catch (error) {
    logError("api/tmdb/genres", error);
    res.status(500).json({ error: "Failed to fetch genres" });
  }
}

function parseMediaType(value: unknown): MediaType {
  if (value === "tv") {
    return "tv";
  }

  return "movie";
}