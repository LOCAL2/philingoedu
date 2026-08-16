/**
 * db-backup.ts
 * Automated daily PostgreSQL backup — uploads compressed SQL dump to
 * Supabase Storage. Retains last 7 days automatically.
 *
 * Safe: read-only on the live DB, never touches app tables.
 */

import { execFile } from 'child_process';
import { createGzip } from 'zlib';
import { Readable } from 'stream';
import { promisify } from 'util';
import { supabaseAdmin, getStorageBucket } from './objectStorage.js';
import { logger } from './logger.js';

const execFileAsync = promisify(execFile);

// pg_dump bundled with the Nix PostgreSQL 16 package (only available in Replit/Nix environments)
// For local Windows environments, pg_dump must be in PATH or configured.
const PG_DUMP_PATH = process.env.PG_DUMP_PATH || 'pg_dump';
const BACKUP_PREFIX = 'db-backups/';
const RETAIN_DAYS = 7;

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
 * Upload a Buffer to Supabase bucket at the given object name.
 */
async function uploadToSupabase(bucketId: string, objectName: string, data: Buffer, contentType: string): Promise<void> {
  const { error } = await supabaseAdmin.storage
    .from(bucketId)
    .upload(objectName, data, {
      contentType,
      cacheControl: '0',
      upsert: true
    });
    
  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }
}

/**
 * Delete backup files in Supabase older than RETAIN_DAYS.
 */
async function pruneOldBackups(bucketId: string): Promise<number> {
  const { data: files, error } = await supabaseAdmin.storage
    .from(bucketId)
    .list(BACKUP_PREFIX);

  if (error || !files) {
    logger.error({ err: error }, 'db-backup: failed to list backups for pruning');
    return 0;
  }

  const cutoff = Date.now() - RETAIN_DAYS * 24 * 60 * 60 * 1000;
  let deleted = 0;
  
  const filesToDelete = [];

  for (const file of files) {
    // skip folders
    if (!file.id) continue;

    const created = new Date(file.created_at).getTime();
    if (created > 0 && created < cutoff) {
      filesToDelete.push(`${BACKUP_PREFIX}${file.name}`);
      logger.info({ name: file.name }, 'db-backup: pruning old backup');
      deleted++;
    }
  }

  if (filesToDelete.length > 0) {
    await supabaseAdmin.storage.from(bucketId).remove(filesToDelete);
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
    const bucketId = getStorageBucket();
    const label = nowLabel();
    const objectName = `${BACKUP_PREFIX}backup_${label}.sql.gz`;

    // 1. Dump
    const sqlBuf = await runPgDump();
    logger.info({ sqlBytes: sqlBuf.byteLength }, 'db-backup: pg_dump complete');

    // 2. Compress
    const gzBuf = await gzipBuffer(sqlBuf);
    logger.info({ gzBytes: gzBuf.byteLength }, 'db-backup: gzip complete');

    // 3. Upload
    await uploadToSupabase(bucketId, objectName, gzBuf, 'application/gzip');
    logger.info({ objectName, bucket: bucketId }, 'db-backup: uploaded to Supabase ✅');

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
