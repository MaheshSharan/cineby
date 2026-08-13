import { getDb } from "./connection";
import type { User } from "./types";

export interface UserRow {
  id: number;
  email: string;
  password_hash: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

const SELECT_USER_COLUMNS = "id, email, password_hash, display_name, avatar_url, created_at";

export function findUserByEmail(email: string): UserRow | null {
  const row = getDb()
    .prepare(`SELECT ${SELECT_USER_COLUMNS} FROM users WHERE LOWER(email) = LOWER(?)`)
    .get(email.trim()) as UserRow | undefined;

  return row ?? null;
}

export function findUserByIdentifier(identifier: string): UserRow | null {
  const trimmed = identifier.trim();
  const row = getDb()
    .prepare(
      `SELECT ${SELECT_USER_COLUMNS} FROM users 
       WHERE LOWER(email) = LOWER(?) OR LOWER(display_name) = LOWER(?)`
    )
    .get(trimmed, trimmed) as UserRow | undefined;

  return row ?? null;
}

export function findUserById(id: number): UserRow | null {
  const row = getDb()
    .prepare(`SELECT ${SELECT_USER_COLUMNS} FROM users WHERE id = ?`)
    .get(id) as UserRow | undefined;

  return row ?? null;
}

export function createUser(
  email: string,
  passwordHash: string,
  displayName: string | null,
  avatarUrl: string | null = null
): UserRow {
  const result = getDb()
    .prepare(
      "INSERT INTO users (email, password_hash, display_name, avatar_url, created_at) VALUES (?, ?, ?, ?, ?)"
    )
    .run(email.trim().toLowerCase(), passwordHash, displayName, avatarUrl, new Date().toISOString());

  const user = findUserById(Number(result.lastInsertRowid));

  if (!user) {
    throw new Error("Failed to create user");
  }

  return user;
}

export function updateUserPassword(userId: number, passwordHash: string): void {
  getDb()
    .prepare("UPDATE users SET password_hash = ? WHERE id = ?")
    .run(passwordHash, userId);
}

export function updateUserAvatar(userId: number, avatarUrl: string | null): void {
  getDb()
    .prepare("UPDATE users SET avatar_url = ? WHERE id = ?")
    .run(avatarUrl, userId);
}

export function toPublicUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    avatarUrl: row.avatar_url ?? null,
    createdAt: row.created_at,
  };
}