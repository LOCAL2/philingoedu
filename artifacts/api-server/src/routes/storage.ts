import { z } from 'zod';
import { Router, type IRouter, type Request, type Response } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { ObjectNotFoundError, ObjectStorageService, supabaseAdmin, getStorageBucket } from '../lib/objectStorage.js';
import { uploadImageToSupabase } from '../lib/supabaseImages.js';

const router: IRouter = Router();
const objectStorageService = new ObjectStorageService();

// ── Constants ────────────────────────────────────────────────────────────────
const MAX_FETCH_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']);
const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp',
  'image/gif': '.gif', 'image/avif': '.avif',
};

// Inline schemas
const RequestUploadUrlBody = z.object({
  name: z.string(),
  size: z.number(),
  contentType: z.string(),
  category: z.enum(['banner', 'facilities', 'rooms', 'logo', 'video', 'other']).optional(),
});

const RequestUploadUrlResponse = z.object({
  uploadURL: z.string(),
  objectPath: z.string(),
  metadata: z.object({ name: z.string(), size: z.number(), contentType: z.string() }),
});

/**
 * POST /storage/uploads/request-url
 * Requires admin JWT auth. Returns a presigned URL for direct-to-storage upload.
 * The file is placed under <category>/<timestamp>-<random>.<ext> in Supabase.
 */
router.post('/storage/uploads/request-url', requireAuth, async (req: Request, res: Response) => {
  const parsed = RequestUploadUrlBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Missing or invalid required fields' });
    return;
  }

  try {
    const { name, size, contentType, category } = parsed.data;
    const ttlSec = category === 'video' ? 3600 : 900;
    const { signedUrl, filePath } = await objectStorageService.getObjectEntityUploadURL(ttlSec, category, name);
    const publicUrl = objectStorageService.getPublicUrl(filePath);

    res.json({
      uploadURL: signedUrl,
      objectPath: filePath,
      publicUrl,
      metadata: { name, size, contentType },
    });
  } catch (error) {
    req.log.error({ err: error }, 'Error generating upload URL');
    res.status(500).json({ error: 'Failed to generate upload URL' });
  }
});

/**
 * POST /storage/uploads/fetch-url
 * Requires admin JWT auth.
 * Downloads an image from an external URL server-side and uploads it to Supabase.
 * Returns the permanent Supabase public URL.
 * Body: { url: string, category?: 'banner'|'rooms'|'facilities'|'logo'|'other' }
 */
router.post('/storage/uploads/fetch-url', requireAuth, async (req: Request, res: Response) => {
  const { url, category } = req.body ?? {};

  if (!url || typeof url !== 'string') {
    res.status(400).json({ error: 'กรุณาระบุ URL รูปภาพ' });
    return;
  }

  let parsed: URL;
  try { parsed = new URL(url); } catch {
    res.status(400).json({ error: 'URL ไม่ถูกต้อง — ต้องเริ่มด้วย http:// หรือ https://' });
    return;
  }
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    res.status(400).json({ error: 'รองรับเฉพาะ http และ https เท่านั้น' });
    return;
  }

  // Reject attempts to re-upload from our own Supabase (already stored)
  const supabaseUrl = process.env.SUPABASE_URL ?? '';
  if (supabaseUrl && url.startsWith(supabaseUrl)) {
    res.json({ imageUrl: url });
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
      res.status(400).json({ error: `ดาวน์โหลดไม่สำเร็จ: HTTP ${response.status}` });
      return;
    }

    const rawType = response.headers.get('content-type') ?? '';
    const mime = rawType.split(';')[0].trim().toLowerCase();
    if (!ALLOWED_MIME.has(mime)) {
      res.status(400).json({
        error: `URL นี้ไม่ใช่รูปภาพ (content-type: "${rawType || 'ไม่ระบุ'}") — ลอง URL ที่ลงท้ายด้วย .jpg/.png/.webp`,
      });
      return;
    }

    const declaredSize = Number(response.headers.get('content-length') || 0);
    if (declaredSize > MAX_FETCH_BYTES) {
      res.status(400).json({ error: `ไฟล์ใหญ่เกินไป (${(declaredSize / 1024 / 1024).toFixed(1)} MB) — สูงสุด 10 MB` });
      return;
    }

    const chunks: Buffer[] = [];
    let total = 0;
    for await (const chunk of response.body as any) {
      total += (chunk as Buffer).length;
      if (total > MAX_FETCH_BYTES) {
        res.status(400).json({ error: 'ไฟล์ใหญ่เกินไประหว่างดาวน์โหลด — สูงสุด 10 MB' });
        return;
      }
      chunks.push(Buffer.from(chunk));
    }

    const buffer = Buffer.concat(chunks);
    const ext = MIME_TO_EXT[mime] ?? '.jpg';
    const prefix = category && ['banner', 'facilities', 'rooms', 'logo', 'other'].includes(category)
      ? category as 'gallery' | 'uploads'
      : 'uploads';
    const filename = `fetched-${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;

    // Upload to Supabase under the appropriate category prefix
    await uploadImageToSupabase(prefix as any, filename, buffer, mime);

    // Build public URL via Supabase
    const bucket = getStorageBucket();
    const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(`${prefix}/${filename}`);
    const imageUrl = data.publicUrl;

    res.json({ imageUrl });
  } catch (err: any) {
    clearTimeout(timer);
    if (err?.name === 'AbortError') {
      res.status(408).json({ error: 'หมดเวลาดาวน์โหลด (20 วินาที)' });
      return;
    }
    const msg = String(err?.message ?? err);
    const friendly = msg.includes('fetch failed') || msg.includes('ECONNREFUSED') || msg.includes('ENOTFOUND')
      ? 'เชื่อมต่อ URL ไม่ได้ — link อาจเสีย หรือเซิร์ฟเวอร์ต้นทางปิดอยู่'
      : `เกิดข้อผิดพลาด: ${msg}`;
    res.status(500).json({ error: friendly });
  }
});

/**
 * GET /storage/public-objects/*
 */
router.get('/storage/public-objects/*filePath', async (req: Request, res: Response) => {
  try {
    const raw = req.params.filePath;
    const filePath = Array.isArray(raw) ? raw.join('/') : raw;
    const url = await objectStorageService.getObjectEntityReadURL(filePath);
    res.redirect(302, url);
  } catch (error) {
    req.log.error({ err: error }, 'Error serving public object');
    res.status(500).json({ error: 'Failed to serve public object' });
  }
});

/**
 * GET /storage/objects/*
 * Returns a 302 redirect to the public URL.
 * Handles both new paths (e.g. "banner/1234.webp") and legacy UUID paths (e.g. "uploads/<uuid>").
 */
router.get('/storage/objects/*objectPath', async (req: Request, res: Response) => {
  try {
    const raw = req.params.objectPath;
    const objectPath = Array.isArray(raw) ? raw.join('/') : raw;

    // If it's a bare UUID (legacy Replit object store format), it won't exist in Supabase.
    // Return a transparent 1×1 placeholder instead of erroring.
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidPattern.test(objectPath.replace(/^uploads\//, ''))) {
      res.status(404).json({ error: 'Legacy object not found in Supabase' });
      return;
    }

    // Try public URL first (bucket must be public for this to work without signing)
    const bucket = getStorageBucket();
    const { data: pubData } = supabaseAdmin.storage.from(bucket).getPublicUrl(objectPath);
    if (pubData?.publicUrl) {
      res.redirect(302, pubData.publicUrl);
      return;
    }

    // Fallback: signed URL
    const url = await objectStorageService.getObjectEntityReadURL(objectPath, 82800);
    res.redirect(302, url);
  } catch (error) {
    if (error instanceof ObjectNotFoundError) {
      res.status(404).json({ error: 'Object not found' }); return;
    }
    req.log.error({ err: error }, 'Error generating signed URL');
    res.status(404).json({ error: 'Object not found' });
  }
});

export default router;
