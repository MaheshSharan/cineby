import type { NextApiRequest, NextApiResponse } from "next";
import { MOVY_CONFIG, type MovyRatings } from "@/lib/services/movy";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MovyRatings | { error: string }>
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  if (!MOVY_CONFIG.enabled || !MOVY_CONFIG.enableRatings) {
    return res.status(200).json({ imdb: null, rottenTomatoes: null, rottenTomatoesAudience: null });
  }

  const { id, title, year, type } = req.query;

  if (!id || !title) {
    return res.status(400).json({ error: "Missing required id or title parameter." });
  }

  const params = new URLSearchParams({
    id: String(id),
    title: String(title),
    type: String(type || "movie"),
  });

  if (year) {
    params.set("year", String(year));
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(`${MOVY_CONFIG.ratingsEndpoint}?${params.toString()}`, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; CinebyBot/1.0)",
        Accept: "application/json",
      },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return res.status(200).json({ imdb: null, rottenTomatoes: null, rottenTomatoesAudience: null });
    }

    const data: unknown = await response.json().catch(() => null);
    if (!data || typeof data !== "object") {
      return res.status(200).json({ imdb: null, rottenTomatoes: null, rottenTomatoesAudience: null });
    }

    const record = data as Record<string, unknown>;

    res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
    return res.status(200).json({
      imdb: typeof record.imdb === "number" ? record.imdb : null,
      rottenTomatoes: typeof record.rottenTomatoes === "number" ? record.rottenTomatoes : null,
      rottenTomatoesAudience:
        typeof record.rottenTomatoesAudience === "number" ? record.rottenTomatoesAudience : null,
    });
  } catch {
    return res.status(200).json({ imdb: null, rottenTomatoes: null, rottenTomatoesAudience: null });
  }
}
