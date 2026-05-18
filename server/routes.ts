import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProgressSchema, insertPatternSchema } from "@shared/schema";

export async function registerRoutes(httpServer: Server, app: Express): Promise<void> {
  // Progress
  app.get("/api/progress", (_req, res) => {
    res.json(storage.getProgress());
  });

  app.post("/api/progress", (req, res) => {
    const parsed = insertProgressSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    res.json(storage.upsertProgress(parsed.data));
  });

  // Patterns
  app.get("/api/patterns", (_req, res) => {
    res.json(storage.getSavedPatterns());
  });

  app.post("/api/patterns", (req, res) => {
    const parsed = insertPatternSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    res.json(storage.savePattern(parsed.data));
  });

  app.delete("/api/patterns/:id", (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });
    storage.deletePattern(id);
    res.json({ ok: true });
  });
}
