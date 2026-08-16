import { Router } from 'express';
import { eq, and, asc, count, or, ilike } from 'drizzle-orm';
import { db } from '../lib/db.js';
import { requireAuth } from '../middlewares/auth.js';
import { partnersTable } from '@workspace/db';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
    const offset = (page - 1) * limit;
    const conditions = [];

    if (req.query.isActive !== undefined) conditions.push(eq(partnersTable.isActive, req.query.isActive === 'true'));
    if (req.query.type) conditions.push(eq(partnersTable.type, req.query.type as string));
    if (req.query.search) {
      const s = `%${req.query.search}%`;
      conditions.push(ilike(partnersTable.name, s));
    }

    const where = conditions.length ? and(...conditions) : undefined;
    const [{ total }] = await db.select({ total: count() }).from(partnersTable).where(where);
    const data = await db.select().from(partnersTable).where(where)
      .orderBy(asc(partnersTable.sortOrder), asc(partnersTable.id))
      .limit(limit).offset(offset);

    res.json({ data, total: Number(total), page, limit });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', message: String(err) });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [item] = await db.select().from(partnersTable).where(eq(partnersTable.id, id)).limit(1);
    if (!item) { res.status(404).json({ error: 'Not Found', message: 'Partner not found' }); return; }
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', message: String(err) });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const [created] = await db.insert(partnersTable).values(req.body).returning();
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', message: String(err) });
  }
});

router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [updated] = await db.update(partnersTable).set({ ...req.body, updatedAt: new Date() })
      .where(eq(partnersTable.id, id)).returning();
    if (!updated) { res.status(404).json({ error: 'Not Found', message: 'Partner not found' }); return; }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', message: String(err) });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [updated] = await db.update(partnersTable).set({ isActive: false, updatedAt: new Date() })
      .where(eq(partnersTable.id, id)).returning({ id: partnersTable.id });
    if (!updated) { res.status(404).json({ error: 'Not Found', message: 'Partner not found' }); return; }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', message: String(err) });
  }
});

router.patch('/:id/sort', requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [updated] = await db.update(partnersTable)
      .set({ sortOrder: Number(req.body.sortOrder), updatedAt: new Date() })
      .where(eq(partnersTable.id, id)).returning({ id: partnersTable.id, sortOrder: partnersTable.sortOrder });
    if (!updated) { res.status(404).json({ error: 'Not Found', message: 'Partner not found' }); return; }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', message: String(err) });
  }
});

export default router;
