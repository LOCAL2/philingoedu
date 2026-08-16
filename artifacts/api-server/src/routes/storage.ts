import { z } from 'zod';
import { Router, type IRouter, type Request, type Response } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { ObjectNotFoundError, ObjectStorageService } from '../lib/objectStorage.js';

const router: IRouter = Router();
const objectStorageService = new ObjectStorageService();

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
 */
router.get('/storage/objects/*objectPath', async (req: Request, res: Response) => {
  try {
    const raw = req.params.objectPath;
    const objectPath = Array.isArray(raw) ? raw.join('/') : raw;
    const url = await objectStorageService.getObjectEntityReadURL(objectPath, 82800);
    res.redirect(302, url);
  } catch (error) {
    if (error instanceof ObjectNotFoundError) {
      res.status(404).json({ error: 'Object not found' }); return;
    }
    req.log.error({ err: error }, 'Error generating signed URL');
    res.status(500).json({ error: 'Failed to serve object' });
  }
});

export default router;
