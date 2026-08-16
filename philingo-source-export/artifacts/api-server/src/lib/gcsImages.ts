/**
 * gcsImages.ts
 * Shared helper for storing and serving images in Replit Object Storage (GCS).
 *
 * Gallery images  → GCS prefix "gallery/"  → served at /api/gallery/image/:filename
 * General uploads → GCS prefix "uploads/"  → served at /api/uploads/:filename
 */

import { objectStorageClient } from './objectStorage.js';

function getBucketId(): string {
  const id = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
  if (!id) throw new Error('DEFAULT_OBJECT_STORAGE_BUCKET_ID env var is not set');
  return id;
}

/**
 * Upload a Buffer to GCS under <prefix>/<filename>.
 * Sets Cache-Control on the object metadata so CDNs can cache it.
 */
export async function uploadImageToGcs(
  prefix: 'gallery' | 'uploads',
  filename: string,
  buffer: Buffer,
  contentType: string,
): Promise<void> {
  const bucket = objectStorageClient.bucket(getBucketId());
  const file = bucket.file(`${prefix}/${filename}`);
  await file.save(buffer, {
    contentType,
    // Filenames are random — immutable once written. 1 year cache is safe.
    metadata: { cacheControl: 'public, max-age=31536000, immutable' },
  });
}

/**
 * Stream an image from GCS to the caller.
 * Returns null when the file does not exist (caller should send 404).
 */
export async function getImageFromGcs(
  prefix: 'gallery' | 'uploads',
  filename: string,
): Promise<{
  stream: NodeJS.ReadableStream;
  contentType: string;
  size?: number;
} | null> {
  const bucket = objectStorageClient.bucket(getBucketId());
  const file = bucket.file(`${prefix}/${filename}`);
  const [exists] = await file.exists();
  if (!exists) return null;

  const [metadata] = await file.getMetadata();
  return {
    stream: file.createReadStream(),
    contentType: (metadata.contentType as string) || 'application/octet-stream',
    size: metadata.size ? Number(metadata.size) : undefined,
  };
}
