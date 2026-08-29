import { getDb } from "@/lib/db/connection";

const WINDOW_MS = 15 * 60_000;
const MAX_ATTEMPTS = 10;

export function allowAuthAttempt(key: string): boolean {
  const now = Date.now();
  const db = getDb();
  const row = db.prepare("SELECT attempts, reset_at FROM auth_rate_limits WHERE key = ?").get(key) as { attempts: number; reset_at: number } | undefined;
  if (!row || row.reset_at <= now) {
    db.prepare("INSERT INTO auth_rate_limits (key, attempts, reset_at) VALUES (?, 1, ?) ON CONFLICT(key) DO UPDATE SET attempts = 1, reset_at = excluded.reset_at").run(key, now + WINDOW_MS);
    return true;
  }
  if (row.attempts >= MAX_ATTEMPTS) return false;
  db.prepare("UPDATE auth_rate_limits SET attempts = attempts + 1 WHERE key = ?").run(key);
  return true;
}

export function authClientKey(req: { headers: { [key: string]: string | string[] | undefined } }, identifier: string): string {
  const forwarded = req.headers["x-forwarded-for"];
  const ip = Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(",")[0]?.trim();
  return `${ip || "unknown"}:${identifier.trim().toLowerCase()}`;
}
