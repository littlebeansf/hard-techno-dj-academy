import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm";
import type { InsertProgress, Progress, InsertPattern, SavedPattern } from "@shared/schema";

const sqlite = new Database("data.db");
export const db = drizzle(sqlite, { schema });

// Create tables
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    module_id TEXT NOT NULL,
    completed INTEGER NOT NULL DEFAULT 0,
    score INTEGER,
    completed_at TEXT
  );
  CREATE TABLE IF NOT EXISTS saved_patterns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    bpm INTEGER NOT NULL DEFAULT 140,
    pattern TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
`);

export interface IStorage {
  getProgress(): Progress[];
  upsertProgress(data: InsertProgress): Progress;
  getSavedPatterns(): SavedPattern[];
  savePattern(data: InsertPattern): SavedPattern;
  deletePattern(id: number): void;
}

export const storage: IStorage = {
  getProgress() {
    return db.select().from(schema.progress).all();
  },
  upsertProgress(data: InsertProgress) {
    const existing = db.select().from(schema.progress).where(eq(schema.progress.moduleId, data.moduleId)).get();
    if (existing) {
      return db.update(schema.progress).set(data).where(eq(schema.progress.moduleId, data.moduleId)).returning().get()!;
    }
    return db.insert(schema.progress).values(data).returning().get()!;
  },
  getSavedPatterns() {
    return db.select().from(schema.savedPatterns).all();
  },
  savePattern(data: InsertPattern) {
    return db.insert(schema.savedPatterns).values(data).returning().get()!;
  },
  deletePattern(id: number) {
    db.delete(schema.savedPatterns).where(eq(schema.savedPatterns.id, id)).run();
  },
};
