import type { NextApiRequest, NextApiResponse } from "next";

import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { addToWatchlist, clearWatchlist, listWatchlist } from "@/lib/db/watchlist";
import { logError } from "@/lib/logger";

interface WatchlistBody {
  mediaType?: unknown;
  mediaId?: unknown;
  title?: unknown;
  posterPath?: unknown;
  backdropPath?: unknown;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = getCurrentUser(req);

  if (!user) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  if (req.method === "GET") {
    res.status(200).json({ items: listWatchlist(user.id) });
    return;
  }

  if (req.method === "DELETE") {
    try {
      clearWatchlist(user.id);
      res.status(200).json({ success: true });
    } catch (error) {
      logError("api/watchlist", error);
      res.status(500).json({ error: "Unable to clear watchlist." });
    }
    return;
  }

  if (req.method === "POST") {
    const body = (req.body ?? {}) as WatchlistBody;
    const mediaType = body.mediaType === "movie" || body.mediaType === "tv" ? body.mediaType : null;
    const mediaId =
      typeof body.mediaId === "number" && Number.isInteger(body.mediaId) && body.mediaId > 0
        ? body.mediaId
        : null;
    const title = typeof body.title === "string" && body.title.trim() ? body.title.trim().slice(0, 200) : null;
    const posterPath = typeof body.posterPath === "string" && body.posterPath ? body.posterPath : null;
    const backdropPath = typeof body.backdropPath === "string" && body.backdropPath ? body.backdropPath : null;

    if (!mediaType || !mediaId || !title) {
      res.status(400).json({ error: "mediaType, mediaId and title are required." });
      return;
    }

    try {
      addToWatchlist(user.id, { mediaType, mediaId, title, posterPath, backdropPath });
      res.status(201).json({ inWatchlist: true });
    } catch (error) {
      logError("api/watchlist", error);
      res.status(500).json({ error: "Unable to update watchlist." });
    }

    return;
  }

  res.setHeader("Allow", "GET, POST, DELETE");
  res.status(405).json({ error: "Method not allowed" });
}