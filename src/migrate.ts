import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const DATA_DIR = process.env.DATA_DIR ?? path.resolve("data");
const DB_PATH = process.env.DB_PATH ?? path.join(DATA_DIR, "signups.sqlite3");

fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
CREATE TABLE IF NOT EXISTS signups (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  email       TEXT NOT NULL,
  name        TEXT,
  source      TEXT,
  ip          TEXT,
  user_agent  TEXT,
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_signups_email ON signups(email);
CREATE INDEX IF NOT EXISTS idx_signups_created_at ON signups(created_at);
`);

console.log("Migration complete:", DB_PATH);
