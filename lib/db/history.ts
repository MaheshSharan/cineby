import { getDb } from "./connection";
import type { HistoryEntry } from "./types";

export interface HistoryInput {
  mediaType: "movie" | "tv";
  mediaId: number;
  title: string;
  seasonNumber: number | null;
  episodeNumber: number | null;
}

interface HistoryRow {
  id: number;
  user_id: number;
  media_type: "movie" | "tv";
  media_id: number;
  title: string;
  season_number: number | null;
  episode_number: number | null;
  watched_at: string;
}

export function addHistoryEntry(userId: number, input: HistoryInput): void {
  getDb()
    .prepare(
      `INSERT INTO watch_history (user_id, media_type, media_id, title, season_number, episode_number, watched_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      userId,
      input.mediaType,
      input.mediaId,
      input.title,
      input.seasonNumber,
      input.episodeNumber,
      new Date().toISOString()
    );
}

export function listHistory(userId: number, limit = 50): HistoryEntry[] {
  const rows = getDb()
    .prepare(
      `SELECT * FROM watch_history WHERE user_id = ? ORDER BY watched_at DESC LIMIT ?`
    )
    .all(userId, limit) as unknown as HistoryRow[];

  return rows.map((row) => ({
    id: row.id,
    mediaType: row.media_type,
    mediaId: row.media_id,
    title: row.title,
    seasonNumber: row.season_number,
    episodeNumber: row.episode_number,
    watchedAt: row.watched_at,
  }));
}