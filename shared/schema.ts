import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const progress = sqliteTable("progress", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  moduleId: text("module_id").notNull(),
  completed: integer("completed", { mode: "boolean" }).notNull().default(false),
  score: integer("score"),
  completedAt: text("completed_at"),
});

export const insertProgressSchema = createInsertSchema(progress).omit({ id: true });
export type InsertProgress = z.infer<typeof insertProgressSchema>;
export type Progress = typeof progress.$inferSelect;

export const savedPatterns = sqliteTable("saved_patterns", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  bpm: integer("bpm").notNull().default(140),
  pattern: text("pattern").notNull(), // JSON string
  createdAt: text("created_at").notNull(),
});

export const insertPatternSchema = createInsertSchema(savedPatterns).omit({ id: true });
export type InsertPattern = z.infer<typeof insertPatternSchema>;
export type SavedPattern = typeof savedPatterns.$inferSelect;
