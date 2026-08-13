import type { NextApiRequest, NextApiResponse } from "next";
import { searchMulti } from "@/lib/tmdb/server";
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

  const query = typeof req.query.q === "string" ? req.query.q.trim() : "";
  const page = parsePage(req.query.page);

  if (!query) {
    res.status(400).json({ error: "Query parameter 'q' is required" });
    return;
  }

  try {
    const result = await searchMulti(query, page);
    res.status(200).json(result);
  } catch (error) {
    logError("api/tmdb/search", error);
    res.status(500).json({ error: "Failed to search" });
  }
}

function parsePage(value: unknown): number {
  const parsed = typeof value === "string" ? Number.parseInt(value, 10) : NaN;

  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}