import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../lib/db.js';
import { requireAuth } from '../middlewares/auth.js';
import { siteSettingsTable } from '@workspace/db';

const router = Router();

// GET /settings — public, returns {key: value} map
router.get('/', async (_req, res) => {
  try {
    const rows = await db.select().from(siteSettingsTable);
    const map: Record<string, string | null> = {};
    for (const row of rows) map[row.key] = row.value;
    res.json(map);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', message: String(err) });
  }
});

// GET /settings/:group — settings by group
router.get('/group/:group', async (req, res) => {
  try {
    const rows = await db.select().from(siteSettingsTable).where(eq(siteSettingsTable.group, req.params.group));
    const map: Record<string, string | null> = {};
    for (const row of rows) map[row.key] = row.value;
    res.json(map);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', message: String(err) });
  }
});

// PUT /settings/batch — admin upsert multiple
router.put('/batch', requireAuth, async (req, res) => {
  try {
    const updates: Record<string, unknown> = req.body;
    for (const [key, value] of Object.entries(updates)) {
      // Safely convert value to string — objects use JSON.stringify to avoid "[object Object]"
      const safeValue = value === null || value === undefined
        ? ''
        : typeof value === 'object'
        ? JSON.stringify(value)
        : String(value);
      await db.insert(siteSettingsTable).values({ key, value: safeValue, group: 'general' })
        .onConflictDoUpdate({ target: siteSettingsTable.key, set: { value: safeValue, updatedAt: new Date() } });
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', message: String(err) });
  }
});

// PUT /settings/:key — upsert single
router.put('/:key', requireAuth, async (req, res) => {
  try {
    const key = String(req.params.key);
    const { value, group, label } = req.body;
    const [row] = await db.insert(siteSettingsTable).values({ key, value: String(value ?? ''), group: group || 'general', label })
      .onConflictDoUpdate({ target: siteSettingsTable.key, set: { value: String(value ?? ''), group: group || 'general', label, updatedAt: new Date() } })
      .returning();
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', message: String(err) });
  }
});

export default router;
