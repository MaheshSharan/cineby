import type { NextApiRequest, NextApiResponse } from "next";
import { discoverMovies, discoverTv } from "@/lib/tmdb/server";
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
  const genreId = parseOptionalNumber(req.query.genreId);
  const sortBy = typeof req.query.sortBy === "string" ? req.query.sortBy : undefined;
  const page = parsePage(req.query.page);

  try {
    const result =
      mediaType === "tv"
        ? await discoverTv({ genreId, sortBy, page })
        : await discoverMovies({ genreId, sortBy, page });

    res.status(200).json(result);
  } catch (error) {
    logError("api/tmdb/browse", error);
    res.status(500).json({ error: "Failed to fetch browse results" });
  }
}

function parseMediaType(value: unknown): MediaType {
  if (value === "tv") {
    return "tv";
  }

  return "movie";
}

function parseOptionalNumber(value: unknown): number | undefined {
  const parsed = typeof value === "string" ? Number.parseInt(value, 10) : NaN;

  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

function parsePage(value: unknown): number {
  const parsed = typeof value === "string" ? Number.parseInt(value, 10) : NaN;

  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}