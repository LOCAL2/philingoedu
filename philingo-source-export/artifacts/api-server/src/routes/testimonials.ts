import { Router } from 'express';
import { eq, and, asc, count, or, ilike } from 'drizzle-orm';
import { db } from '../lib/db.js';
import { requireAuth } from '../middlewares/auth.js';
import { testimonialsTable } from '@workspace/db';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    const conditions = [];

    if (req.query.isActive !== undefined) conditions.push(eq(testimonialsTable.isActive, req.query.isActive === 'true'));
    if (req.query.isFeatured !== undefined) conditions.push(eq(testimonialsTable.isFeatured, req.query.isFeatured === 'true'));
    if (req.query.search) {
      const s = `%${req.query.search}%`;
      conditions.push(or(ilike(testimonialsTable.name, s), ilike(testimonialsTable.school, s)));
    }

    const where = conditions.length ? and(...conditions) : undefined;
    const [{ total }] = await db.select({ total: count() }).from(testimonialsTable).where(where);
    const data = await db.select().from(testimonialsTable).where(where)
      .orderBy(asc(testimonialsTable.sortOrder), asc(testimonialsTable.id))
      .limit(limit).offset(offset);

    res.json({ data, total: Number(total), page, limit });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', message: String(err) });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [item] = await db.select().from(testimonialsTable).where(eq(testimonialsTable.id, id)).limit(1);
    if (!item) { res.status(404).json({ error: 'Not Found', message: 'Testimonial not found' }); return; }
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', message: String(err) });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const [created] = await db.insert(testimonialsTable).values(req.body).returning();
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', message: String(err) });
  }
});

router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [updated] = await db.update(testimonialsTable).set({ ...req.body, updatedAt: new Date() })
      .where(eq(testimonialsTable.id, id)).returning();
    if (!updated) { res.status(404).json({ error: 'Not Found', message: 'Testimonial not found' }); return; }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', message: String(err) });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [updated] = await db.update(testimonialsTable).set({ isActive: false, updatedAt: new Date() })
      .where(eq(testimonialsTable.id, id)).returning({ id: testimonialsTable.id });
    if (!updated) { res.status(404).json({ error: 'Not Found', message: 'Testimonial not found' }); return; }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', message: String(err) });
  }
});

router.patch('/:id/sort', requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [updated] = await db.update(testimonialsTable)
      .set({ sortOrder: Number(req.body.sortOrder), updatedAt: new Date() })
      .where(eq(testimonialsTable.id, id)).returning({ id: testimonialsTable.id, sortOrder: testimonialsTable.sortOrder });
    if (!updated) { res.status(404).json({ error: 'Not Found', message: 'Testimonial not found' }); return; }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', message: String(err) });
  }
});

export default router;
