import { Router } from 'express';
import { eq, like, and, desc, asc, count, or, ilike } from 'drizzle-orm';
import { db } from '../lib/db.js';
import { requireAuth } from '../middlewares/auth.js';
import { schoolsTable } from '@workspace/db';

const router = Router();

// GET / - list schools
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const conditions = [];

    if (req.query.isActive !== undefined) {
      conditions.push(eq(schoolsTable.isActive, req.query.isActive === 'true'));
    }
    if (req.query.isFeatured !== undefined) {
      conditions.push(eq(schoolsTable.isFeatured, req.query.isFeatured === 'true'));
    }
    if (req.query.search) {
      const s = `%${req.query.search}%`;
      conditions.push(
        or(ilike(schoolsTable.name, s), ilike(schoolsTable.nameTh, s), ilike(schoolsTable.city, s))
      );
    }

    const where = conditions.length ? and(...conditions) : undefined;

    const [{ total }] = await db
      .select({ total: count() })
      .from(schoolsTable)
      .where(where);

    const data = await db
      .select()
      .from(schoolsTable)
      .where(where)
      .orderBy(asc(schoolsTable.sortOrder), asc(schoolsTable.id))
      .limit(limit)
      .offset(offset);

    res.json({ data, total: Number(total), page, limit });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', message: String(err) });
  }
});

// GET /:id - single school
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const bySlug = isNaN(id);

    const [item] = bySlug
      ? await db.select().from(schoolsTable).where(eq(schoolsTable.slug, req.params.id)).limit(1)
      : await db.select().from(schoolsTable).where(eq(schoolsTable.id, id)).limit(1);

    if (!item) {
      res.status(404).json({ error: 'Not Found', message: 'School not found' });
      return;
    }
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', message: String(err) });
  }
});

// POST / - create
router.post('/', requireAuth, async (req, res) => {
  try {
    const [created] = await db.insert(schoolsTable).values(req.body).returning();
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', message: String(err) });
  }
});

// PATCH /:id - update
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [updated] = await db
      .update(schoolsTable)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(schoolsTable.id, id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: 'Not Found', message: 'School not found' });
      return;
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', message: String(err) });
  }
});

// DELETE /:id - soft delete
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [updated] = await db
      .update(schoolsTable)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(schoolsTable.id, id))
      .returning({ id: schoolsTable.id });

    if (!updated) {
      res.status(404).json({ error: 'Not Found', message: 'School not found' });
      return;
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', message: String(err) });
  }
});

// PATCH /:id/sort - update sortOrder
router.patch('/:id/sort', requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { sortOrder } = req.body;
    const [updated] = await db
      .update(schoolsTable)
      .set({ sortOrder: Number(sortOrder), updatedAt: new Date() })
      .where(eq(schoolsTable.id, id))
      .returning({ id: schoolsTable.id, sortOrder: schoolsTable.sortOrder });

    if (!updated) {
      res.status(404).json({ error: 'Not Found', message: 'School not found' });
      return;
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', message: String(err) });
  }
});

export default router;
