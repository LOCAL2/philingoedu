import { Router } from 'express';
import { eq, inArray } from 'drizzle-orm';
import { db } from '../lib/db.js';
import { siteSettingsTable } from '@workspace/db';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();

function todayStr() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

async function upsertSetting(key: string, value: string) {
  await db.insert(siteSettingsTable)
    .values({ key, value, group: 'analytics' })
    .onConflictDoUpdate({ target: siteSettingsTable.key, set: { value, updatedAt: new Date() } });
}

/** Public — called by the website on each page visit (once per session) */
router.post('/track', async (req, res) => {
  try {
    const rows = await db.select()
      .from(siteSettingsTable)
      .where(inArray(siteSettingsTable.key, ['analytics_views_total', 'analytics_views_today', 'analytics_views_date']));

    const m: Record<string, string> = {};
    for (const r of rows) m[r.key] = r.value ?? '0';

    const today = todayStr();
    const storedDate = m['analytics_views_date'] ?? '';
    const total = parseInt(m['analytics_views_total'] ?? '0', 10) + 1;
    const todayCount = storedDate === today ? parseInt(m['analytics_views_today'] ?? '0', 10) + 1 : 1;

    await Promise.all([
      upsertSetting('analytics_views_total', String(total)),
      upsertSetting('analytics_views_today', String(todayCount)),
      upsertSetting('analytics_views_date', today),
    ]);

    res.json({ ok: true });
  } catch (err) {
    // Silent failure — never break the website
    res.json({ ok: false });
  }
});

/** Admin — get visitor summary */
router.get('/summary', requireAuth, async (_req, res) => {
  try {
    const rows = await db.select()
      .from(siteSettingsTable)
      .where(inArray(siteSettingsTable.key, ['analytics_views_total', 'analytics_views_today', 'analytics_views_date']));

    const m: Record<string, string> = {};
    for (const r of rows) m[r.key] = r.value ?? '0';

    const today = todayStr();
    const todayCount = m['analytics_views_date'] === today ? parseInt(m['analytics_views_today'] ?? '0', 10) : 0;

    res.json({
      totalViews: parseInt(m['analytics_views_total'] ?? '0', 10),
      todayViews: todayCount,
      lastDate: m['analytics_views_date'] ?? null,
    });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
