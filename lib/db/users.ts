import { getDb } from "./connection";
import type { User } from "./types";

export interface UserRow {
  id: number;
  email: string;
  password_hash: string;
  display_name: string | null;
  created_at: string;
}

const SELECT_USER_COLUMNS = "id, email, password_hash, display_name, created_at";

export function findUserByEmail(email: string): UserRow | null {
  const row = getDb()
    .prepare(`SELECT ${SELECT_USER_COLUMNS} FROM users WHERE email = ?`)
    .get(email) as UserRow | undefined;

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
  displayName: string | null
): UserRow {
  const result = getDb()
    .prepare(
      "INSERT INTO users (email, password_hash, display_name, created_at) VALUES (?, ?, ?, ?)"
    )
    .run(email, passwordHash, displayName, new Date().toISOString());

  const user = findUserById(Number(result.lastInsertRowid));

  if (!user) {
    throw new Error("Failed to create user");
  }

  return user;
}

export function toPublicUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    createdAt: row.created_at,
  };
}