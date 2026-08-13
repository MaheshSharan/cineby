import { getDb } from "./connection";
import type { WatchlistItem } from "./types";

export interface WatchlistInput {
  mediaType: "movie" | "tv";
  mediaId: number;
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
}

interface WatchlistRow {
  id: number;
  user_id: number;
  media_type: "movie" | "tv";
  media_id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  added_at: string;
}

export function addToWatchlist(userId: number, input: WatchlistInput): void {
  getDb()
    .prepare(
      `INSERT INTO watchlist (user_id, media_type, media_id, title, poster_path, backdrop_path, added_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT (user_id, media_type, media_id) DO NOTHING`
    )
    .run(
      userId,
      input.mediaType,
      input.mediaId,
      input.title,
      input.posterPath,
      input.backdropPath,
      new Date().toISOString()
    );
}

export function removeFromWatchlist(userId: number, mediaType: string, mediaId: number): void {
  getDb()
    .prepare("DELETE FROM watchlist WHERE user_id = ? AND media_type = ? AND media_id = ?")
    .run(userId, mediaType, mediaId);
}

export function isInWatchlist(userId: number, mediaType: string, mediaId: number): boolean {
  const row = getDb()
    .prepare("SELECT 1 AS present FROM watchlist WHERE user_id = ? AND media_type = ? AND media_id = ?")
    .get(userId, mediaType, mediaId);

  return row !== undefined;
}

export function listWatchlist(userId: number): WatchlistItem[] {
  const rows = getDb()
    .prepare("SELECT * FROM watchlist WHERE user_id = ? ORDER BY added_at DESC")
    .all(userId) as unknown as WatchlistRow[];

  return rows.map((row) => ({
    id: row.id,
    mediaType: row.media_type,
    mediaId: row.media_id,
    title: row.title,
    posterPath: row.poster_path,
    backdropPath: row.backdrop_path,
    addedAt: row.added_at,
  }));
}