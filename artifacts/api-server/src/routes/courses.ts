import { Router } from 'express';
import { eq, and, asc, count, or, ilike } from 'drizzle-orm';
import { db } from '../lib/db.js';
import { requireAuth } from '../middlewares/auth.js';
import { coursesTable } from '@workspace/db';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    const conditions = [];

    if (req.query.isActive !== undefined) conditions.push(eq(coursesTable.isActive, req.query.isActive === 'true'));
    if (req.query.isFeatured !== undefined) conditions.push(eq(coursesTable.isFeatured, req.query.isFeatured === 'true'));
    if (req.query.schoolSlug) conditions.push(eq(coursesTable.schoolSlug, String(req.query.schoolSlug)));
    if (req.query.search) {
      const s = `%${req.query.search}%`;
      conditions.push(or(ilike(coursesTable.title, s), ilike(coursesTable.titleTh, s)));
    }

    const where = conditions.length ? and(...conditions) : undefined;
    const [{ total }] = await db.select({ total: count() }).from(coursesTable).where(where);
    const data = await db.select().from(coursesTable).where(where)
      .orderBy(asc(coursesTable.sortOrder), asc(coursesTable.id))
      .limit(limit).offset(offset);

    res.json({ data, total: Number(total), page, limit });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', message: String(err) });
  }
});

// GET /api/courses/:schoolSlug/:courseSlug  — Course Landing Page data
router.get('/:schoolSlug/:courseSlug', async (req, res) => {
  try {
    const { schoolSlug, courseSlug } = req.params;
    const [course] = await db.select().from(coursesTable)
      .where(and(
        eq(coursesTable.schoolSlug, schoolSlug),
        eq(coursesTable.slug, courseSlug)
      )).limit(1);
    if (!course) { res.status(404).json({ error: 'Not Found', message: 'Course not found' }); return; }
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', message: String(err) });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const bySlug = isNaN(id);
    const [item] = bySlug
      ? await db.select().from(coursesTable).where(eq(coursesTable.slug, req.params.id)).limit(1)
      : await db.select().from(coursesTable).where(eq(coursesTable.id, id)).limit(1);

    if (!item) { res.status(404).json({ error: 'Not Found', message: 'Course not found' }); return; }
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', message: String(err) });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const [created] = await db.insert(coursesTable).values(req.body).returning();
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', message: String(err) });
  }
});

router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [updated] = await db.update(coursesTable).set({ ...req.body, updatedAt: new Date() })
      .where(eq(coursesTable.id, id)).returning();
    if (!updated) { res.status(404).json({ error: 'Not Found', message: 'Course not found' }); return; }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', message: String(err) });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [updated] = await db.update(coursesTable).set({ isActive: false, updatedAt: new Date() })
      .where(eq(coursesTable.id, id)).returning({ id: coursesTable.id });
    if (!updated) { res.status(404).json({ error: 'Not Found', message: 'Course not found' }); return; }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', message: String(err) });
  }
});

router.patch('/:id/sort', requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [updated] = await db.update(coursesTable)
      .set({ sortOrder: Number(req.body.sortOrder), updatedAt: new Date() })
      .where(eq(coursesTable.id, id)).returning({ id: coursesTable.id, sortOrder: coursesTable.sortOrder });
    if (!updated) { res.status(404).json({ error: 'Not Found', message: 'Course not found' }); return; }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', message: String(err) });
  }
});

export default router;
