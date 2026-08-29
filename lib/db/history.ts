import { getDb } from "./connection";
import { findDefaultProfileId } from "./profiles";
import type { HistoryEntry } from "./types";

export interface HistoryInput {
  mediaType: "movie" | "tv";
  mediaId: number;
  title: string;
  posterPath?: string | null;
  backdropPath?: string | null;
  seasonNumber?: number | null;
  episodeNumber?: number | null;
  duration?: string | null;
  progress?: number | null;
}

interface HistoryRow {
  id: number;
  user_id: number;
  media_type: "movie" | "tv";
  media_id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  season_number: number | null;
  episode_number: number | null;
  duration: string | null;
  progress: number | null;
  watched_at: string;
}

export function addHistoryEntry(userId: number, profileId: number | undefined, input: HistoryInput): void {
  const effectiveProfileId = profileId ?? findDefaultProfileId(userId);
  // No profile yet (user is still onboarding): nothing to scope the entry to.
  if (effectiveProfileId === null) return;

  const db = getDb();

  // Deduplicate: remove any prior history entry for this catalog item
  // so that only 1 latest state per movie or TV show is retained.
  db.prepare(
    "DELETE FROM watch_history WHERE profile_id = ? AND media_type = ? AND media_id = ?"
  ).run(effectiveProfileId, input.mediaType, input.mediaId);

  db.prepare(
    `INSERT INTO watch_history (user_id, profile_id, media_type, media_id, title, poster_path, backdrop_path, season_number, episode_number, duration, progress, watched_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    userId,
    effectiveProfileId,
    input.mediaType,
    input.mediaId,
    input.title,
    input.posterPath ?? null,
    input.backdropPath ?? null,
    input.seasonNumber ?? null,
    input.episodeNumber ?? null,
    input.duration ?? null,
    input.progress ?? null,
    new Date().toISOString()
  );
}

export function removeFromHistory(userId: number, profileId: number | undefined, historyId: number): void {
  const effectiveProfileId = profileId ?? findDefaultProfileId(userId);
  if (effectiveProfileId === null) return;

  getDb()
    .prepare("DELETE FROM watch_history WHERE user_id = ? AND profile_id = ? AND id = ?")
    .run(userId, effectiveProfileId, historyId);
}

export function clearHistory(userId: number, profileId?: number): void {
  const effectiveProfileId = profileId ?? findDefaultProfileId(userId);
  if (effectiveProfileId === null) return;

  getDb().prepare("DELETE FROM watch_history WHERE user_id = ? AND profile_id = ?").run(userId, effectiveProfileId);
}

export function listHistory(userId: number, profileId?: number, limit = 50): HistoryEntry[] {
  const effectiveProfileId = profileId ?? findDefaultProfileId(userId);
  if (effectiveProfileId === null) return [];

  const rows = getDb()
    .prepare(
      `SELECT * FROM watch_history WHERE user_id = ? AND profile_id = ? ORDER BY watched_at DESC LIMIT ?`
    )
    .all(userId, effectiveProfileId, limit) as unknown as HistoryRow[];

  return rows.map((row) => ({
    id: row.id,
    mediaType: row.media_type,
    mediaId: row.media_id,
    title: row.title,
    posterPath: row.poster_path,
    backdropPath: row.backdrop_path,
    seasonNumber: row.season_number,
    episodeNumber: row.episode_number,
    duration: row.duration,
    progress: row.progress,
    watchedAt: row.watched_at,
  }));
}
