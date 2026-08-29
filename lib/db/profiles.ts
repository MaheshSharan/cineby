import { getDb } from "./connection";

export interface ProfileRow {
  id: number;
  user_id: number;
  name: string;
  avatar_url: string;
  pin_hash: string | null;
  movie_genres: string;
  tv_genres: string;
  created_at: string;
  updated_at: string;
}

export interface ProfileInput {
  name: string;
  avatarUrl: string;
  pinHash?: string | null;
  movieGenres?: string[];
  tvGenres?: string[];
}

const SELECT_COLUMNS = "id, user_id, name, avatar_url, pin_hash, movie_genres, tv_genres, created_at, updated_at";

export function listProfiles(userId: number): ProfileRow[] {
  return getDb().prepare(`SELECT ${SELECT_COLUMNS} FROM profiles WHERE user_id = ? ORDER BY id`).all(userId) as unknown as ProfileRow[];
}

export function findDefaultProfileId(userId: number): number | null {
  return listProfiles(userId)[0]?.id ?? null;
}

// Profile creation is only reachable from POST /api/profiles (explicit user
// action in the onboarding wizard) and this login-time fallback. Never
// auto-create profiles on read paths — that caused duplicate-profile bugs.
// The zero-profile check and insert are synchronous, so they are atomic
// within a single server process.
export function ensureDefaultProfile(userId: number, name: string): void {
  if (listProfiles(userId).length > 0) return;
  createProfile(userId, {
    name: name || "Main profile",
    avatarUrl: "/avatar/classic-1.png",
  });
}

export function findProfile(userId: number, profileId: number): ProfileRow | null {
  const row = getDb().prepare(`SELECT ${SELECT_COLUMNS} FROM profiles WHERE user_id = ? AND id = ?`).get(userId, profileId) as ProfileRow | undefined;
  return row ?? null;
}

export function createProfile(userId: number, input: ProfileInput): ProfileRow {
  const now = new Date().toISOString();
  const result = getDb().prepare(
    "INSERT INTO profiles (user_id, name, avatar_url, pin_hash, movie_genres, tv_genres, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  ).run(userId, input.name, input.avatarUrl, input.pinHash ?? null, JSON.stringify(input.movieGenres ?? []), JSON.stringify(input.tvGenres ?? []), now, now);
  const profile = findProfile(userId, Number(result.lastInsertRowid));
  if (!profile) throw new Error("Failed to create profile");
  return profile;
}

export function updateProfile(userId: number, profileId: number, input: ProfileInput): ProfileRow | null {
  getDb().prepare(
    "UPDATE profiles SET name = ?, avatar_url = ?, pin_hash = ?, movie_genres = ?, tv_genres = ?, updated_at = ? WHERE user_id = ? AND id = ?"
  ).run(input.name, input.avatarUrl, input.pinHash ?? null, JSON.stringify(input.movieGenres ?? []), JSON.stringify(input.tvGenres ?? []), new Date().toISOString(), userId, profileId);
  return findProfile(userId, profileId);
}

export function deleteProfile(userId: number, profileId: number): void {
  getDb().prepare("DELETE FROM profiles WHERE user_id = ? AND id = ?").run(userId, profileId);
}
