/**
 * Manual backup runner — execute directly with:
 *   node artifacts/api-server/scripts/run-backup.mjs
 * Requires the server to have been built at least once (dist/index.mjs exists).
 */
import { execFile }   from 'child_process';
import { createGzip } from 'zlib';
import { Readable }   from 'stream';
import { promisify }  from 'util';
import { Storage }    from '@google-cloud/storage';

const execFileAsync = promisify(execFile);

const PG_DUMP = '/nix/store/bgwr5i8jf8jpg75rr53rz3fqv5k8yrwp-postgresql-16.10/bin/pg_dump';
const BACKUP_PREFIX = 'db-backups/';
const RETAIN_DAYS   = 7;
const SIDECAR       = 'http://127.0.0.1:1106';

const gcs = new Storage({
  credentials: {
    audience: 'replit',
    subject_token_type: 'access_token',
    token_url:  `${SIDECAR}/token`,
    type: 'external_account',
    credential_source: {
      url: `${SIDECAR}/credential`,
      format: { type: 'json', subject_token_field_name: 'access_token' },
    },
    universe_domain: 'googleapis.com',
  },
  projectId: '',
});

function nowLabel() {
  return new Date().toISOString().replace(/[:.]/g,'−').replace('T','_').slice(0,19);
}

async function gzip(buf) {
  return new Promise((res, rej) => {
    const chunks = [];
    const gz = createGzip({ level: 9 });
    Readable.from(buf).pipe(gz);
    gz.on('data', c => chunks.push(c));
    gz.on('end',  () => res(Buffer.concat(chunks)));
    gz.on('error', rej);
  });
}

const bucketId  = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
if (!bucketId) { console.error('DEFAULT_OBJECT_STORAGE_BUCKET_ID not set'); process.exit(1); }
const dbUrl     = process.env.DATABASE_URL;
if (!dbUrl)    { console.error('DATABASE_URL not set'); process.exit(1); }

console.log('[backup] pg_dump starting…');
const { stdout } = await execFileAsync(PG_DUMP, ['--no-password','--format=plain','--encoding=UTF8', dbUrl], {
  maxBuffer: 200 * 1024 * 1024,
  env: { ...process.env },
});
const sqlBuf = Buffer.from(stdout, 'utf8');
console.log(`[backup] pg_dump done — ${sqlBuf.byteLength} bytes`);

const gzBuf = await gzip(sqlBuf);
console.log(`[backup] gzip done — ${gzBuf.byteLength} bytes`);

const label      = nowLabel();
const objectName = `${BACKUP_PREFIX}backup_${label}.sql.gz`;
const bucket     = gcs.bucket(bucketId);
await bucket.file(objectName).save(gzBuf, { contentType: 'application/gzip' });
console.log(`[backup] ✅ uploaded → gs://${bucketId}/${objectName}`);

// Prune
const [files] = await bucket.getFiles({ prefix: BACKUP_PREFIX });
const cutoff   = Date.now() - RETAIN_DAYS * 86400_000;
let pruned = 0;
for (const f of files) {
  const t = f.metadata.timeCreated ? new Date(f.metadata.timeCreated).getTime() : 0;
  if (t > 0 && t < cutoff) { await f.delete(); pruned++; console.log(`[backup] pruned ${f.name}`); }
}
console.log(`[backup] pruned ${pruned} old file(s)`);

// ── Verify: list all backups ──────────────────────────────────────────
console.log('\n[verify] listing all backups in GCS:');
const [all] = await bucket.getFiles({ prefix: BACKUP_PREFIX });
for (const f of all) {
  const sz  = f.metadata.size    ?? '?';
  const ts  = f.metadata.timeCreated ?? '?';
  console.log(`  ${f.name}  ${sz} bytes  created: ${ts}`);
}

// ── Verify: download latest and spot-check ────────────────────────────
const latest = all.sort((a,b) =>
  new Date(b.metadata.timeCreated||0).getTime() -
  new Date(a.metadata.timeCreated||0).getTime()
)[0];

if (latest) {
  const [content] = await latest.download();
  console.log(`\n[verify] downloaded latest: ${latest.name}`);
  console.log(`[verify] compressed size : ${content.byteLength} bytes`);

  // Check gzip magic bytes (1F 8B)
  const magic = content[0] === 0x1F && content[1] === 0x8B;
  console.log(`[verify] gzip magic bytes : ${magic ? '✅ valid' : '❌ INVALID'}`);

  // Decompress and peek at content
  const { gunzip } = await import('zlib');
  const { promisify: prom } = await import('util');
  const gunzipAsync = prom(gunzip);
  const raw = await gunzipAsync(content);
  const text = raw.toString('utf8');
  console.log(`[verify] uncompressed size: ${raw.byteLength} bytes`);

  // Check for key PostgreSQL dump markers
  const hasHeader    = text.includes('PostgreSQL database dump');
  const hasTables    = text.includes('CREATE TABLE') || text.includes('COPY ');
  const hasBlogPosts = text.includes('blog_posts');
  const hasSchools   = text.includes('schools');
  const hasComplete  = text.includes('PostgreSQL database dump complete');

  console.log(`[verify] has pg_dump header    : ${hasHeader    ? '✅' : '❌'}`);
  console.log(`[verify] has CREATE TABLE/COPY : ${hasTables    ? '✅' : '❌'}`);
  console.log(`[verify] has blog_posts table  : ${hasBlogPosts ? '✅' : '❌'}`);
  console.log(`[verify] has schools table     : ${hasSchools   ? '✅' : '❌'}`);
  console.log(`[verify] has dump footer       : ${hasComplete  ? '✅' : '❌'}`);

  // Count rows in COPY blocks
  const copyBlocks = [...text.matchAll(/^COPY (\S+) .+?\\\./gms)];
  console.log(`\n[verify] COPY data blocks found: ${copyBlocks.length}`);
  for (const m of copyBlocks.slice(0, 15)) {
    const lines = m[0].split('\n').length - 2; // subtract header + \.
    console.log(`  ${m[1].padEnd(35)} ${Math.max(0,lines)} rows`);
  }
}

console.log('\n[backup+verify] ALL DONE ✅');
