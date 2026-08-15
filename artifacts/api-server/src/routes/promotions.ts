import { Router } from 'express';
import { eq, and, asc, count, or, ilike } from 'drizzle-orm';
import { db } from '../lib/db.js';
import { requireAuth } from '../middlewares/auth.js';
import { promotionsTable } from '@workspace/db';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    const conditions = [];

    if (req.query.isActive !== undefined) conditions.push(eq(promotionsTable.isActive, req.query.isActive === 'true'));
    if (req.query.isFeatured !== undefined) conditions.push(eq(promotionsTable.isFeatured, req.query.isFeatured === 'true'));
    if (req.query.search) {
      const s = `%${req.query.search}%`;
      conditions.push(or(ilike(promotionsTable.title, s), ilike(promotionsTable.titleTh, s)));
    }

    const where = conditions.length ? and(...conditions) : undefined;
    const [{ total }] = await db.select({ total: count() }).from(promotionsTable).where(where);
    const data = await db.select().from(promotionsTable).where(where)
      .orderBy(asc(promotionsTable.sortOrder), asc(promotionsTable.id))
      .limit(limit).offset(offset);

    res.json({ data, total: Number(total), page, limit });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', message: String(err) });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [item] = await db.select().from(promotionsTable).where(eq(promotionsTable.id, id)).limit(1);
    if (!item) { res.status(404).json({ error: 'Not Found', message: 'Promotion not found' }); return; }
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', message: String(err) });
  }
});

/** Sanitize body: whitelist known columns only, map titleEn→title */
function sanitizePromotion(body: Record<string, any>) {
  const { titleEn, discountPercent, featured, ...rest } = body;
  const cleaned: Record<string, any> = {};
  // Known valid columns
  const allowed = [
    'title', 'titleTh', 'description', 'descriptionTh',
    'terms', 'termsTh', 'imageUrl', 'discountText', 'discountTextTh',
    'originalPriceTh', 'discountPriceTh', 'seatsRemaining',
    'bonusTh', 'expiresAt', 'isFeatured', 'isActive', 'sortOrder',
  ];
  for (const key of allowed) {
    if (rest[key] !== undefined) cleaned[key] = rest[key];
  }
  // Map titleEn → title (admin form uses titleEn)
  if (titleEn !== undefined) cleaned.title = titleEn;
  // Convert expiresAt string to Date (empty string → null)
  if ('expiresAt' in cleaned) {
    if (!cleaned.expiresAt || cleaned.expiresAt === '') {
      cleaned.expiresAt = null;
    } else if (typeof cleaned.expiresAt === 'string') {
      const d = new Date(cleaned.expiresAt);
      cleaned.expiresAt = isNaN(d.getTime()) ? null : d;
    }
  }
  return cleaned;
}

router.post('/', requireAuth, async (req, res) => {
  try {
    const data = sanitizePromotion(req.body);
    if (!data.titleTh) { res.status(400).json({ error: 'Bad Request', message: 'titleTh required' }); return; }
    const [created] = await db.insert(promotionsTable).values(data as any).returning();
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', message: String(err) });
  }
});

router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const data = sanitizePromotion(req.body);
    const [updated] = await db.update(promotionsTable).set({ ...data, updatedAt: new Date() } as any)
      .where(eq(promotionsTable.id, id)).returning();
    if (!updated) { res.status(404).json({ error: 'Not Found', message: 'Promotion not found' }); return; }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', message: String(err) });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [updated] = await db.update(promotionsTable).set({ isActive: false, updatedAt: new Date() })
      .where(eq(promotionsTable.id, id)).returning({ id: promotionsTable.id });
    if (!updated) { res.status(404).json({ error: 'Not Found', message: 'Promotion not found' }); return; }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', message: String(err) });
  }
});

router.patch('/:id/sort', requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [updated] = await db.update(promotionsTable)
      .set({ sortOrder: Number(req.body.sortOrder), updatedAt: new Date() })
      .where(eq(promotionsTable.id, id)).returning({ id: promotionsTable.id, sortOrder: promotionsTable.sortOrder });
    if (!updated) { res.status(404).json({ error: 'Not Found', message: 'Promotion not found' }); return; }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', message: String(err) });
  }
});

export default router;
