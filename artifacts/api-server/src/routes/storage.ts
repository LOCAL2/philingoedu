import { z } from 'zod';
import { Readable } from 'stream';
import { Router, type IRouter, type Request, type Response } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { ObjectNotFoundError, ObjectStorageService } from '../lib/objectStorage.js';

const router: IRouter = Router();
const objectStorageService = new ObjectStorageService();

// Inline schemas (no api-zod dependency needed)
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
 * Requires admin JWT auth. Returns a presigned URL for direct-to-GCS upload.
 */
router.post('/storage/uploads/request-url', requireAuth, async (req: Request, res: Response) => {
  const parsed = RequestUploadUrlBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Missing or invalid required fields' });
    return;
  }

  try {
    const { name, size, contentType, category } = parsed.data;
    // Videos get a 1-hour signing window to accommodate large files (200MB+)
    const ttlSec = category === 'video' ? 3600 : 900;
    const uploadURL = await objectStorageService.getObjectEntityUploadURL(ttlSec);
    const objectPath = objectStorageService.normalizeObjectEntityPath(uploadURL);

    res.json(RequestUploadUrlResponse.parse({
      uploadURL,
      objectPath,
      metadata: { name, size, contentType },
    }));
  } catch (error) {
    req.log.error({ err: error }, 'Error generating upload URL');
    res.status(500).json({ error: 'Failed to generate upload URL' });
  }
});

/**
 * GET /storage/public-objects/*
 * Unconditionally public — serves assets from PUBLIC_OBJECT_SEARCH_PATHS.
 */
router.get('/storage/public-objects/*filePath', async (req: Request, res: Response) => {
  try {
    const raw = req.params.filePath;
    const filePath = Array.isArray(raw) ? raw.join('/') : raw;
    const file = await objectStorageService.searchPublicObject(filePath);
    if (!file) { res.status(404).json({ error: 'File not found' }); return; }
    const response = await objectStorageService.downloadObject(file);
    res.status(response.status);
    response.headers.forEach((value, key) => res.setHeader(key, value));
    if (response.body) {
      Readable.fromWeb(response.body as ReadableStream<Uint8Array>).pipe(res);
    } else { res.end(); }
  } catch (error) {
    req.log.error({ err: error }, 'Error serving public object');
    res.status(500).json({ error: 'Failed to serve public object' });
  }
});

// ── Signed-URL cache ──────────────────────────────────────────────────────────
// Avoid re-signing the same object on every request within its TTL window.
// Keys are objectPath strings; values are { url, expiresAt }.
const SIGN_TTL_SEC = 82800; // 23 hours  (signed URL valid for 24 h)
const signedUrlCache = new Map<string, { url: string; expiresAt: number }>();

function getCachedSignedUrl(key: string): string | null {
  const entry = signedUrlCache.get(key);
  if (!entry) return null;
  // Expire 60 s early to avoid edge-case races
  if (Date.now() >= entry.expiresAt - 60_000) {
    signedUrlCache.delete(key);
    return null;
  }
  return entry.url;
}

function setCachedSignedUrl(key: string, url: string) {
  signedUrlCache.set(key, { url, expiresAt: Date.now() + SIGN_TTL_SEC * 1000 });
  // Evict old entries (keep cache bounded)
  if (signedUrlCache.size > 2000) {
    const oldestKey = signedUrlCache.keys().next().value;
    if (oldestKey) signedUrlCache.delete(oldestKey);
  }
}

/**
 * GET /storage/objects/*
 *
 * Returns a 302 redirect to a short-lived presigned GCS GET URL.
 * The browser fetches image bytes DIRECTLY from GCS — our server never
 * proxies the payload, eliminating the streaming bottleneck entirely.
 *
 * Cache-Control: public, max-age=82800 (23 h) lets the browser skip
 * even the redirect hop on subsequent loads within the same day.
 */
router.get('/storage/objects/*path', async (req: Request, res: Response) => {
  try {
    const raw = req.params.path;
    const wildcardPath = Array.isArray(raw) ? raw.join('/') : raw;
    const objectPath = `/objects/${wildcardPath}`;

    // Serve from cache if still valid
    let signedUrl = getCachedSignedUrl(objectPath);
    if (!signedUrl) {
      signedUrl = await objectStorageService.getObjectEntityReadURL(objectPath, SIGN_TTL_SEC + 3600);
      setCachedSignedUrl(objectPath, signedUrl);
    }

    res
      .setHeader('Cache-Control', `public, max-age=${SIGN_TTL_SEC}, stale-while-revalidate=3600`)
      .redirect(302, signedUrl);
  } catch (error) {
    if (error instanceof ObjectNotFoundError) {
      res.status(404).json({ error: 'Object not found' }); return;
    }
    req.log.error({ err: error }, 'Error generating signed URL');
    res.status(500).json({ error: 'Failed to serve object' });
  }
});

export default router;
