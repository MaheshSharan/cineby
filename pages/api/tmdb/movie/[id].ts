import type { NextApiRequest, NextApiResponse } from "next";
import { getMovieDetails } from "@/lib/tmdb/server";
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

  const { id } = req.query;

  if (typeof id !== "string" || !/^\d+$/.test(id)) {
    res.status(400).json({ error: "Invalid movie id" });
    return;
  }

  try {
    const result = await getMovieDetails(id);
    res.status(200).json(result);
  } catch (error) {
    logError("api/tmdb/movie", error);
    res.status(500).json({ error: "Failed to fetch movie details" });
  }
}