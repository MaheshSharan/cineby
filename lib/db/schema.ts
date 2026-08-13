import type { DatabaseSync } from "node:sqlite";

export function initializeSchema(database: DatabaseSync): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      display_name TEXT,
      avatar_url TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      token TEXT NOT NULL UNIQUE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS watchlist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      media_type TEXT NOT NULL,
      media_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      poster_path TEXT,
      backdrop_path TEXT,
      added_at TEXT NOT NULL,
      UNIQUE (user_id, media_type, media_id)
    );

    CREATE TABLE IF NOT EXISTS watch_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      media_type TEXT NOT NULL,
      media_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      season_number INTEGER,
      episode_number INTEGER,
      poster_path TEXT,
      backdrop_path TEXT,
      duration TEXT,
      progress INTEGER,
      watched_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_watchlist_user ON watchlist(user_id);
    CREATE INDEX IF NOT EXISTS idx_history_user ON watch_history(user_id, watched_at DESC);
  `);

  // Safe migration for existing databases: add avatar_url column if not present
  try {
    const userColumns = database.prepare("PRAGMA table_info(users)").all() as { name: string }[];
    const hasAvatarUrl = userColumns.some((col) => col.name === "avatar_url");
    if (!hasAvatarUrl) {
      database.exec("ALTER TABLE users ADD COLUMN avatar_url TEXT;");
    }

    // Ensure all existing users have a valid ISO created_at timestamp
    database.exec(`
      UPDATE users
      SET created_at = datetime('now')
      WHERE created_at IS NULL OR created_at = '' OR created_at = 'undefined';
    `);

    const historyColumns = database.prepare("PRAGMA table_info(watch_history)").all() as { name: string }[];
    if (!historyColumns.some((col) => col.name === "poster_path")) {
      database.exec("ALTER TABLE watch_history ADD COLUMN poster_path TEXT;");
    }
    if (!historyColumns.some((col) => col.name === "backdrop_path")) {
      database.exec("ALTER TABLE watch_history ADD COLUMN backdrop_path TEXT;");
    }
    if (!historyColumns.some((col) => col.name === "duration")) {
      database.exec("ALTER TABLE watch_history ADD COLUMN duration TEXT;");
    }
    if (!historyColumns.some((col) => col.name === "progress")) {
      database.exec("ALTER TABLE watch_history ADD COLUMN progress INTEGER;");
    }
  } catch {
    // Migration checks are best-effort during schema init
  }
}