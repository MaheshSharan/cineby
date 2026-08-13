import type { NextApiRequest, NextApiResponse } from "next";

import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { addHistoryEntry, clearHistory, listHistory, removeFromHistory } from "@/lib/db/history";
import { logError } from "@/lib/logger";

interface HistoryBody {
  mediaType?: unknown;
  mediaId?: unknown;
  title?: unknown;
  posterPath?: unknown;
  backdropPath?: unknown;
  seasonNumber?: unknown;
  episodeNumber?: unknown;
  duration?: unknown;
  progress?: unknown;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = getCurrentUser(req);

  if (!user) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  if (req.method === "GET") {
    res.status(200).json({ items: listHistory(user.id) });
    return;
  }

  if (req.method === "DELETE") {
    const id = req.query.id ? Number(req.query.id) : null;
    try {
      if (id && Number.isInteger(id)) {
        removeFromHistory(user.id, id);
      } else {
        clearHistory(user.id);
      }
      res.status(200).json({ success: true });
    } catch (error) {
      logError("api/history", error);
      res.status(500).json({ error: "Unable to update history." });
    }
    return;
  }

  if (req.method === "POST") {
    const body = (req.body ?? {}) as HistoryBody;
    const mediaType = body.mediaType === "movie" || body.mediaType === "tv" ? body.mediaType : null;
    const mediaId =
      typeof body.mediaId === "number" && Number.isInteger(body.mediaId) && body.mediaId > 0
        ? body.mediaId
        : null;
    const title = typeof body.title === "string" && body.title.trim() ? body.title.trim().slice(0, 200) : null;
    const posterPath = typeof body.posterPath === "string" && body.posterPath ? body.posterPath : null;
    const backdropPath = typeof body.backdropPath === "string" && body.backdropPath ? body.backdropPath : null;
    const seasonNumber = parseOptionalNumber(body.seasonNumber);
    const episodeNumber = parseOptionalNumber(body.episodeNumber);
    const duration = typeof body.duration === "string" ? body.duration : null;
    const progress = typeof body.progress === "number" ? body.progress : null;

    if (!mediaType || !mediaId || !title) {
      res.status(400).json({ error: "mediaType, mediaId and title are required." });
      return;
    }

    try {
      addHistoryEntry(user.id, {
        mediaType,
        mediaId,
        title,
        posterPath,
        backdropPath,
        seasonNumber,
        episodeNumber,
        duration,
        progress,
      });
      res.status(201).json({ ok: true });
    } catch (error) {
      logError("api/history", error);
      res.status(500).json({ error: "Unable to record watch history." });
    }

    return;
  }

  res.setHeader("Allow", "GET, POST, DELETE");
  res.status(405).json({ error: "Method not allowed" });
}

function parseOptionalNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isInteger(value) && value > 0 ? value : null;
}