import { getDb } from "./connection";

export interface SessionWithUser {
  id: number;
  token: string;
  user_id: number;
  active_profile_id: number | null;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  user_created_at: string;
  created_at: string;
  expires_at: string;
}

export function createSession(userId: number, token: string, expiresAt: string): void {
  getDb()
    .prepare(
      "INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)"
    )
    .run(token, userId, new Date().toISOString(), expiresAt);
}

export function findValidSessionByToken(token: string): SessionWithUser | null {
  const row = getDb()
    .prepare(
      `SELECT s.id, s.token, s.user_id, s.active_profile_id, s.created_at, s.expires_at, u.email, u.display_name, u.avatar_url, u.created_at AS user_created_at
       FROM sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.token = ? AND s.expires_at > ?`
    )
    .get(token, new Date().toISOString()) as SessionWithUser | undefined;

  return row ?? null;
}

export function deleteSession(token: string): void {
  getDb().prepare("DELETE FROM sessions WHERE token = ?").run(token);
}

export function deleteOtherUserSessions(userId: number, currentToken: string): void {
  getDb()
    .prepare("DELETE FROM sessions WHERE user_id = ? AND token <> ?")
    .run(userId, currentToken);
}

export function setActiveProfile(token: string, profileId: number): void {
  getDb().prepare("UPDATE sessions SET active_profile_id = ? WHERE token = ?").run(profileId, token);
}
