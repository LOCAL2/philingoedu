import { Router } from 'express';
import { eq, and, asc, count, or, ilike } from 'drizzle-orm';
import { db } from '../lib/db.js';
import { requireAuth } from '../middlewares/auth.js';
import { galleryItemsTable } from '@workspace/db';
import { uploadImageToGcs, getImageFromGcs } from '../lib/gcsImages.js';

const router = Router();

// ── Constants ───────────────────────────────────────────────────────────────
const MAX_FETCH_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']);
const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp',
  'image/gif': '.gif', 'image/avif': '.avif',
};

// ── Serve gallery image from GCS ─────────────────────────────────────────────
/**
 * GET /api/gallery/image/:filename
 * Streams the image from GCS. Immutable cache header (filename is random → safe).
 */
router.get('/image/:filename', async (req, res) => {
  const filename = req.params.filename;
  // Basic path-traversal guard
  if (!filename || filename.includes('/') || filename.includes('..')) {
    res.status(400).json({ error: 'Invalid filename' });
    return;
  }

  try {
    const result = await getImageFromGcs('gallery', filename);
    if (!result) {
      res.status(404).json({ error: 'Image not found' });
      return;
    }

    // Override the global no-cache middleware — gallery images are immutable
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
    res.set('Content-Type', result.contentType);
    if (result.size) res.set('Content-Length', String(result.size));
    result.stream.pipe(res);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve image', message: String(err) });
  }
});

// ── Fetch image from external URL (server-side, avoids CORS) ─────────────────
/**
 * POST /api/gallery/fetch-url
 * Downloads an image from a public URL, saves to GCS, inserts a gallery_items row.
 * Body: { url, titleTh?, titleEn?, category? }
 */
router.post('/fetch-url', requireAuth, async (req, res) => {
  const { url, titleTh, titleEn, category } = req.body ?? {};

  if (!url || typeof url !== 'string') {
    res.status(400).json({ error: 'กรุณาระบุ URL รูปภาพ' });
    return;
  }

  // Validate URL format
  let parsed: URL;
  try { parsed = new URL(url); } catch {
    res.status(400).json({ error: 'URL ไม่ถูกต้อง — ต้องเริ่มด้วย http:// หรือ https://' });
    return;
  }
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    res.status(400).json({ error: 'รองรับเฉพาะ http และ https เท่านั้น' });
    return;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20_000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Philingo-ImageFetcher/1.0' },
      redirect: 'follow',
    });
    clearTimeout(timer);

    if (!response.ok) {
      res.status(400).json({ error: `ดาวน์โหลดไม่สำเร็จ: เซิร์ฟเวอร์ตอบกลับ HTTP ${response.status}` });
      return;
    }

    // Validate content-type
    const rawType = response.headers.get('content-type') ?? '';
    const mime = rawType.split(';')[0].trim().toLowerCase();
    if (!ALLOWED_MIME.has(mime)) {
      res.status(400).json({
        error: `URL นี้ไม่ใช่รูปภาพ (content-type: "${rawType || 'ไม่ระบุ'}") — ลอง URL ที่ลงท้ายด้วย .jpg/.png/.webp`,
      });
      return;
    }

    // Check declared size before reading body
    const declaredSize = Number(response.headers.get('content-length') || 0);
    if (declaredSize > MAX_FETCH_BYTES) {
      res.status(400).json({
        error: `ไฟล์ใหญ่เกินไป (${(declaredSize / 1024 / 1024).toFixed(1)} MB) — สูงสุดที่รองรับ 10 MB`,
      });
      return;
    }

    // Stream body with size guard
    const chunks: Buffer[] = [];
    let total = 0;
    for await (const chunk of response.body as any) {
      total += (chunk as Buffer).length;
      if (total > MAX_FETCH_BYTES) {
        res.status(400).json({ error: 'ไฟล์ใหญ่เกินไประหว่างดาวน์โหลด — สูงสุดที่รองรับ 10 MB' });
        return;
      }
      chunks.push(Buffer.from(chunk));
    }

    const buffer = Buffer.concat(chunks);
    const ext = MIME_TO_EXT[mime] ?? '.jpg';
    const filename = `fetched-${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;

    // Upload to GCS (permanent storage — survives redeployments)
    await uploadImageToGcs('gallery', filename, buffer, mime);

    const imageUrl = `/api/gallery/image/${filename}`;

    const [created] = await db.insert(galleryItemsTable).values({
      imageUrl,
      titleTh: titleTh || null,
      title: titleEn || null,
      category: category || null,
      isActive: true,
      sortOrder: 0,
    }).returning();

    res.status(201).json(created);
  } catch (err: any) {
    clearTimeout(timer);
    if (err?.name === 'AbortError') {
      res.status(408).json({ error: 'หมดเวลาดาวน์โหลด (20 วินาที) — URL อาจช้าหรือไม่ตอบสนอง' });
      return;
    }
    const msg = String(err?.message ?? err);
    const friendlyMsg = msg.includes('fetch failed') || msg.includes('ECONNREFUSED') || msg.includes('ENOTFOUND')
      ? 'เชื่อมต่อ URL ไม่ได้ — link อาจเสีย หรือเซิร์ฟเวอร์ต้นทางปิดอยู่'
      : `เกิดข้อผิดพลาด: ${msg}`;
    res.status(500).json({ error: friendlyMsg });
  }
});

// ── CRUD ──────────────────────────────────────────────────────────────────────

router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    const conditions = [];

    if (req.query.isActive !== undefined) conditions.push(eq(galleryItemsTable.isActive, req.query.isActive === 'true'));
    if (req.query.category) conditions.push(eq(galleryItemsTable.category, req.query.category as string));
    if (req.query.search) {
      const s = `%${req.query.search}%`;
      conditions.push(or(ilike(galleryItemsTable.title, s), ilike(galleryItemsTable.caption, s)));
    }

    const where = conditions.length ? and(...conditions) : undefined;
    const [{ total }] = await db.select({ total: count() }).from(galleryItemsTable).where(where);
    const data = await db.select().from(galleryItemsTable).where(where)
      .orderBy(asc(galleryItemsTable.sortOrder), asc(galleryItemsTable.id))
      .limit(limit).offset(offset);

    res.json({ data, total: Number(total), page, limit });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', message: String(err) });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [item] = await db.select().from(galleryItemsTable).where(eq(galleryItemsTable.id, id)).limit(1);
    if (!item) { res.status(404).json({ error: 'Not Found', message: 'Gallery item not found' }); return; }
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', message: String(err) });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const [created] = await db.insert(galleryItemsTable).values(req.body).returning();
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', message: String(err) });
  }
});

router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [updated] = await db.update(galleryItemsTable).set({ ...req.body, updatedAt: new Date() })
      .where(eq(galleryItemsTable.id, id)).returning();
    if (!updated) { res.status(404).json({ error: 'Not Found', message: 'Gallery item not found' }); return; }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', message: String(err) });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [updated] = await db.update(galleryItemsTable).set({ isActive: false, updatedAt: new Date() })
      .where(eq(galleryItemsTable.id, id)).returning({ id: galleryItemsTable.id });
    if (!updated) { res.status(404).json({ error: 'Not Found', message: 'Gallery item not found' }); return; }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', message: String(err) });
  }
});

router.patch('/:id/sort', requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [updated] = await db.update(galleryItemsTable)
      .set({ sortOrder: Number(req.body.sortOrder), updatedAt: new Date() })
      .where(eq(galleryItemsTable.id, id)).returning({ id: galleryItemsTable.id, sortOrder: galleryItemsTable.sortOrder });
    if (!updated) { res.status(404).json({ error: 'Not Found', message: 'Gallery item not found' }); return; }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', message: String(err) });
  }
});

export default router;
