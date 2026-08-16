/**
 * One-time migration: upload gallery images from local disk → GCS,
 * then update the DB imageUrl to /api/gallery/image/:filename.
 *
 * Run: tsx artifacts/api-server/src/scripts/migrate-gallery-to-gcs.ts
 * (from the workspace root, same way as seed.ts)
 */
import path from 'path';
import fs from 'fs';
import { eq, like } from 'drizzle-orm';
import { db } from '../lib/db.js';
import { galleryItemsTable } from '@workspace/db';
import { uploadImageToGcs } from '../lib/gcsImages.js';

const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');
const MIME: Record<string, string> = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.webp': 'image/webp', '.gif': 'image/gif', '.avif': 'image/avif',
};

async function main() {
  // Find all gallery rows still pointing to /api/uploads/ (old local-disk URLs)
  const rows = await db.select()
    .from(galleryItemsTable)
    .where(like(galleryItemsTable.imageUrl, '/api/uploads/%'));

  console.log(`Found ${rows.length} gallery row(s) to migrate.`);
  if (rows.length === 0) {
    console.log('Nothing to migrate — all rows already use GCS URLs.');
    process.exit(0);
  }

  let ok = 0, skip = 0, fail = 0;

  for (const row of rows) {
    const oldUrl = row.imageUrl;                         // /api/uploads/filename.jpg
    const filename = oldUrl.replace('/api/uploads/', '');
    const localPath = path.join(UPLOAD_DIR, filename);
    const ext = path.extname(filename).toLowerCase();
    const mime = MIME[ext] ?? 'image/jpeg';
    const newUrl = `/api/gallery/image/${filename}`;

    if (!fs.existsSync(localPath)) {
      console.warn(`  ⚠️  id=${row.id} — local file missing: ${localPath} (skip)`);
      skip++;
      continue;
    }

    try {
      const buffer = fs.readFileSync(localPath);
      await uploadImageToGcs('gallery', filename, buffer, mime);
      await db.update(galleryItemsTable)
        .set({ imageUrl: newUrl, updatedAt: new Date() })
        .where(eq(galleryItemsTable.id, row.id));
      console.log(`  ✅ id=${row.id}  ${oldUrl}  →  ${newUrl}  (${(buffer.length / 1024).toFixed(1)} KB)`);
      ok++;
    } catch (err) {
      console.error(`  ❌ id=${row.id} — FAILED: ${err}`);
      fail++;
    }
  }

  console.log(`\nDone: ${ok} migrated, ${skip} skipped (file missing on disk), ${fail} failed.`);
  if (fail > 0) process.exit(1);
}

main().catch((err) => { console.error(err); process.exit(1); });
