/**
 * db-backup.ts
 * Automated daily PostgreSQL backup — uploads compressed SQL dump to
 * Replit Object Storage (GCS-backed). Retains last 7 days automatically.
 *
 * Safe: read-only on the live DB, never touches app tables.
 */

import { execFile } from 'child_process';
import { createGzip } from 'zlib';
import { Readable } from 'stream';
import { promisify } from 'util';
import { objectStorageClient } from './objectStorage.js';
import { logger } from './logger.js';

const execFileAsync = promisify(execFile);

// pg_dump bundled with the Nix PostgreSQL 16 package
const PG_DUMP_PATH = '/nix/store/bgwr5i8jf8jpg75rr53rz3fqv5k8yrwp-postgresql-16.10/bin/pg_dump';
const BACKUP_PREFIX = 'db-backups/';
const RETAIN_DAYS = 7;

function getBucketId(): string {
  const id = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
  if (!id) throw new Error('DEFAULT_OBJECT_STORAGE_BUCKET_ID env var is not set');
  return id;
}

function nowLabel(): string {
  // Format: YYYY-MM-DD_HH-MM-SS UTC
  return new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, 19);
}

/**
 * Run a full pg_dump and return the SQL as a Buffer.
 */
async function runPgDump(): Promise<Buffer> {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) throw new Error('DATABASE_URL is not set');

  const { stdout } = await execFileAsync(
    PG_DUMP_PATH,
    ['--no-password', '--format=plain', '--encoding=UTF8', dbUrl],
    {
      maxBuffer: 200 * 1024 * 1024, // 200 MB
      env: { ...process.env },
    }
  );

  return Buffer.from(stdout, 'utf8');
}

/**
 * Compress a Buffer with gzip and return the compressed Buffer.
 */
function gzipBuffer(input: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const gz = createGzip({ level: 9 });
    const readable = Readable.from(input);
    readable.pipe(gz);
    gz.on('data', (chunk: Buffer) => chunks.push(chunk));
    gz.on('end', () => resolve(Buffer.concat(chunks)));
    gz.on('error', reject);
    readable.on('error', reject);
  });
}

/**
 * Upload a Buffer to GCS bucket at the given object name.
 */
async function uploadToGcs(bucketId: string, objectName: string, data: Buffer, contentType: string): Promise<void> {
  const bucket = objectStorageClient.bucket(bucketId);
  const file = bucket.file(objectName);
  await file.save(data, {
    contentType,
    metadata: { cacheControl: 'no-cache' },
  });
}

/**
 * Delete backup files in GCS older than RETAIN_DAYS.
 */
async function pruneOldBackups(bucketId: string): Promise<number> {
  const bucket = objectStorageClient.bucket(bucketId);
  const [files] = await bucket.getFiles({ prefix: BACKUP_PREFIX });

  const cutoff = Date.now() - RETAIN_DAYS * 24 * 60 * 60 * 1000;
  let deleted = 0;

  for (const file of files) {
    const created = file.metadata.timeCreated
      ? new Date(file.metadata.timeCreated as string).getTime()
      : 0;
    if (created > 0 && created < cutoff) {
      await file.delete();
      logger.info({ name: file.name }, 'db-backup: pruned old backup');
      deleted++;
    }
  }

  return deleted;
}

/**
 * Main entry point — run one full backup cycle.
 * Returns a summary object for logging/testing.
 */
export async function runDbBackup(): Promise<{
  ok: boolean;
  objectName?: string;
  sizeKb?: number;
  pruned?: number;
  error?: string;
}> {
  logger.info('db-backup: starting pg_dump…');

  try {
    const bucketId = getBucketId();
    const label = nowLabel();
    const objectName = `${BACKUP_PREFIX}backup_${label}.sql.gz`;

    // 1. Dump
    const sqlBuf = await runPgDump();
    logger.info({ sqlBytes: sqlBuf.byteLength }, 'db-backup: pg_dump complete');

    // 2. Compress
    const gzBuf = await gzipBuffer(sqlBuf);
    logger.info({ gzBytes: gzBuf.byteLength }, 'db-backup: gzip complete');

    // 3. Upload
    await uploadToGcs(bucketId, objectName, gzBuf, 'application/gzip');
    logger.info({ objectName, bucket: bucketId }, 'db-backup: uploaded to GCS ✅');

    // 4. Prune old backups
    const pruned = await pruneOldBackups(bucketId);

    return {
      ok: true,
      objectName,
      sizeKb: Math.round(gzBuf.byteLength / 1024),
      pruned,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error({ err }, 'db-backup: FAILED ❌');
    return { ok: false, error: msg };
  }
}
