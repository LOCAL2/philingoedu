import { Router } from "express";
import { db } from "@workspace/db";
import { eventsTable } from "@workspace/db/schema";
import { eq, desc, and, gte, sql } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

// GET /api/events — public list (active, sorted)
router.get("/", async (req, res) => {
  try {
    const { isActive, isFeatured, limit = "20", page = "1" } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const conditions: any[] = [];
    if (isActive === "true") conditions.push(eq(eventsTable.isActive, true));
    if (isFeatured === "true") conditions.push(eq(eventsTable.isFeatured, true));
    const where = conditions.length ? and(...conditions) : undefined;

    const [rows, [{ count }]] = await Promise.all([
      db.select().from(eventsTable).where(where)
        .orderBy(eventsTable.sortOrder, desc(eventsTable.createdAt))
        .limit(Number(limit)).offset(offset),
      db.select({ count: sql<number>`count(*)::int` }).from(eventsTable).where(where),
    ]);

    res.json({ data: rows, total: count, page: Number(page), limit: Number(limit) });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// GET /api/events/:id — single event
router.get("/:id", async (req, res) => {
  const row = await db.select().from(eventsTable).where(eq(eventsTable.id, Number(req.params.id))).limit(1);
  if (!row.length) { res.status(404).json({ error: "Not found" }); return; }
  res.json(row[0]);
});

// POST /api/events — create (admin)
router.post("/", requireAuth, async (req, res) => {
  try {
    const [row] = await db.insert(eventsTable).values({ ...req.body }).returning();
    res.status(201).json(row);
  } catch (err) {
    res.status(400).json({ error: String(err) });
  }
});

// PATCH /api/events/:id — update (admin)
router.patch("/:id", requireAuth, async (req, res) => {
  try {
    const [row] = await db.update(eventsTable)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(eventsTable.id, Number(req.params.id)))
      .returning();
    res.json(row);
  } catch (err) {
    res.status(400).json({ error: String(err) });
  }
});

// DELETE /api/events/:id — delete (admin)
router.delete("/:id", requireAuth, async (req, res) => {
  await db.delete(eventsTable).where(eq(eventsTable.id, Number(req.params.id)));
  res.json({ success: true });
});

export default router;
