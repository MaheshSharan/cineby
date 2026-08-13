import { mkdirSync } from "node:fs";
import path from "node:path";

import { DatabaseSync } from "node:sqlite";

import { initializeSchema } from "./schema";

const DEFAULT_DB_PATH = path.join(process.cwd(), "data", "cineby.db");

let database: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (!database) {
    const dbPath = process.env.DATABASE_PATH?.trim() || DEFAULT_DB_PATH;

    mkdirSync(path.dirname(dbPath), { recursive: true });

    database = new DatabaseSync(dbPath);
    database.exec("PRAGMA journal_mode = WAL;");
    database.exec("PRAGMA foreign_keys = ON;");

    initializeSchema(database);
  }

  return database;
}