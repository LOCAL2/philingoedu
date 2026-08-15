/**
 * test-restore.mjs
 * Full restore drill against a temporary test database.
 * Safe: never touches the live heliumdb.
 *
 * Usage:  node artifacts/api-server/scripts/test-restore.mjs
 */
import { execFile, execFileSync } from 'child_process';
import { promisify }              from 'util';
import { createWriteStream, unlinkSync, existsSync } from 'fs';
import { gunzip }                 from 'zlib';
import { Storage }                from '@google-cloud/storage';
import { pipeline }               from 'stream/promises';
import { Readable }               from 'stream';
import os                         from 'os';
import path                       from 'path';

const execAsync = promisify(execFile);
const gunzipP   = promisify(gunzip);

const PGBIN    = '/nix/store/bgwr5i8jf8jpg75rr53rz3fqv5k8yrwp-postgresql-16.10/bin';
const PSQL     = `${PGBIN}/psql`;
const CREATEDB = `${PGBIN}/createdb`;
const DROPDB   = `${PGBIN}/dropdb`;
const SIDECAR  = 'http://127.0.0.1:1106';
const TEST_DB  = 'testrestoredb';

// ── helpers ──────────────────────────────────────────────────────────────────
function pass(msg) { console.log(`  ✅ ${msg}`); }
function fail(msg) { console.log(`  ❌ ${msg}`); }
function info(msg) { console.log(`     ${msg}`); }
function head(msg) { console.log(`\n── ${msg} ─────────────────────────────────`); }

function buildTestUrl() {
  const u = new URL(process.env.DATABASE_URL);
  u.pathname = `/${TEST_DB}`;
  return u.toString();
}

function psql(dbUrl, sql) {
  return execAsync(PSQL, [dbUrl, '-c', sql], { env: { ...process.env } });
}

// ── GCS client ───────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║     RESTORE DRILL — RULE 14 full test               ║');
  console.log('╚══════════════════════════════════════════════════════╝');

  const bucketId = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
  if (!bucketId) throw new Error('DEFAULT_OBJECT_STORAGE_BUCKET_ID not set');

  const testUrl    = buildTestUrl();
  const mainUrl    = process.env.DATABASE_URL;
  const tmpSqlGz   = path.join(os.tmpdir(), 'restore-test.sql.gz');
  const tmpSql     = path.join(os.tmpdir(), 'restore-test.sql');

  let issues = [];

  // ── STEP 0: make sure test DB doesn't already exist ──────────────────────
  head('STEP 0 — cleanup any leftover test DB');
  try {
    execFileSync(DROPDB, ['--if-exists', '-h', 'helium', '-U', 'postgres', TEST_DB],
      { env: { ...process.env }, stdio: 'inherit' });
    pass('no leftover test DB (or dropped successfully)');
  } catch(e) { info(`drop attempt: ${e.message}`); }

  // ── STEP 1: Download latest backup from GCS ───────────────────────────────
  head('STEP 1 — Download latest backup from GCS');
  const bucket = gcs.bucket(bucketId);
  const [files] = await bucket.getFiles({ prefix: 'db-backups/' });
  if (!files.length) throw new Error('No backup files found in GCS!');

  const latest = files.sort((a, b) =>
    new Date(b.metadata.timeCreated || 0) - new Date(a.metadata.timeCreated || 0)
  )[0];
  info(`latest backup: ${latest.name}`);
  info(`created at   : ${latest.metadata.timeCreated}`);
  info(`size         : ${latest.metadata.size} bytes`);

  const [content] = await latest.download();
  pass(`downloaded ${content.byteLength} bytes`);

  // ── STEP 2: Gunzip ────────────────────────────────────────────────────────
  head('STEP 2 — Decompress (gunzip)');
  const magic = content[0] === 0x1F && content[1] === 0x8B;
  if (!magic) { fail('gzip magic bytes invalid'); issues.push('backup not valid gzip'); }
  else pass('gzip magic bytes ✓');

  const sqlBuf = await gunzipP(content);
  info(`uncompressed: ${sqlBuf.byteLength} bytes`);

  const sqlText = sqlBuf.toString('utf8');
  if (!sqlText.includes('PostgreSQL database dump')) {
    fail('missing pg_dump header'); issues.push('pg_dump header missing');
  } else pass('pg_dump header present');
  if (!sqlText.includes('PostgreSQL database dump complete')) {
    fail('missing pg_dump footer — dump may be truncated!'); issues.push('dump truncated');
  } else pass('pg_dump footer present (dump is complete)');

  // Write .sql to tmp
  const { writeFileSync } = await import('fs');
  writeFileSync(tmpSql, sqlBuf);
  pass(`SQL written to ${tmpSql}`);

  // ── STEP 3: Create test database and restore ──────────────────────────────
  head('STEP 3 — Create test DB + psql restore');
  execFileSync(CREATEDB, ['-h', 'helium', '-U', 'postgres', TEST_DB],
    { env: { ...process.env }, stdio: 'inherit' });
  pass(`created test database: ${TEST_DB}`);

  // Restore — pipe SQL file to psql
  try {
    const { spawn } = await import('child_process');
    await new Promise((resolve, reject) => {
      const proc = spawn(PSQL, [testUrl], { env: { ...process.env }, stdio: ['pipe', 'pipe', 'pipe'] });
      let stderr = '';
      proc.stderr.on('data', d => stderr += d);
      proc.on('close', code => {
        if (code !== 0) reject(new Error(`psql exited ${code}: ${stderr.slice(0,500)}`));
        else resolve();
      });
      proc.stdin.write(sqlBuf);
      proc.stdin.end();
    });
    pass('psql restore complete (exit 0)');
  } catch(err) {
    fail(`psql restore failed: ${err.message}`);
    issues.push(`restore error: ${err.message}`);
  }

  // ── STEP 4: Verify — compare row counts live vs restored ─────────────────
  head('STEP 4 — Verify row counts (live DB vs test DB)');

  const tables = [
    'admin_users', 'banners', 'blog_posts', 'contact_submissions', 'courses',
    'event_registrations', 'events', 'faqs', 'form_submissions', 'gallery_items',
    'newsletter_campaigns', 'newsletter_subscribers', 'partners', 'promotions',
    'schools', 'site_settings', 'team_members', 'testimonials',
  ];

  const countSql = tables.map(t => `SELECT '${t}' AS t, count(*)::int AS n FROM ${t}`).join(' UNION ALL ');

  const [liveRes, testRes] = await Promise.all([
    psql(mainUrl, countSql),
    psql(testUrl, countSql),
  ]);

  // Parse psql output (format: " tablename | n ")
  function parseCount(output) {
    const map = {};
    for (const line of output.split('\n')) {
      const m = line.match(/^\s*(\w+)\s*\|\s*(\d+)/);
      if (m) map[m[1]] = parseInt(m[2], 10);
    }
    return map;
  }

  const liveCounts = parseCount(liveRes.stdout);
  const testCounts = parseCount(testRes.stdout);

  console.log('\n  Table                         Live   Restored  Match');
  console.log('  ──────────────────────────────────────────────────────');
  let allMatch = true;
  for (const t of tables) {
    const live  = liveCounts[t] ?? '?';
    const test  = testCounts[t] ?? '?';
    const match = live === test;
    if (!match) { allMatch = false; issues.push(`row mismatch on ${t}: live=${live} test=${test}`); }
    console.log(`  ${t.padEnd(30)} ${String(live).padStart(4)}   ${String(test).padStart(8)}  ${match ? '✅' : '❌ MISMATCH'}`);
  }

  if (allMatch) pass('ALL tables match live DB ✅');
  else          fail('Some tables did not match — see above');

  // ── STEP 5: Drop test database ────────────────────────────────────────────
  head('STEP 5 — Drop test database');
  execFileSync(DROPDB, ['-h', 'helium', '-U', 'postgres', TEST_DB],
    { env: { ...process.env }, stdio: 'inherit' });
  pass(`dropped ${TEST_DB} — live DB untouched`);

  // Cleanup tmp files
  if (existsSync(tmpSql))   unlinkSync(tmpSql);
  if (existsSync(tmpSqlGz)) unlinkSync(tmpSqlGz);

  // ── Final report ──────────────────────────────────────────────────────────
  head('RESTORE DRILL SUMMARY');
  if (issues.length === 0) {
    console.log('\n  🎉 ALL STEPS PASSED — Restore procedure is verified and working.\n');
    console.log('  RULE 14 instructions are accurate.\n');
  } else {
    console.log('\n  ⚠️  ISSUES FOUND:');
    issues.forEach(i => console.log(`    • ${i}`));
    console.log('\n  RULE 14 may need corrections (see above).\n');
  }

  return issues;
}

const issues = await main().catch(err => {
  console.error('\n❌ FATAL:', err.message);
  process.exit(1);
});
process.exit(issues.length > 0 ? 1 : 0);
