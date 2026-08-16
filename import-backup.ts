/**
 * Import PostgreSQL backup using Bun's native SQL client
 * which supports COPY FROM stdin protocol
 * 
 * Run: bun import-backup.ts philingo_backup_20260815_095615.sql
 */
import { readFileSync } from 'fs';
import { SQL } from 'bun';

const sqlFile = process.argv[2] ?? 'philingo_backup_20260815_095615.sql';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not set');
  process.exit(1);
}

const raw = readFileSync(sqlFile, 'utf8');

// Clean psql meta-commands that aren't valid SQL
const cleaned = raw
  .replace(/^\\restrict\s+.*\n/gm, '')
  .replace(/^\\[a-zA-Z].*\n/gm, '')
  .replace(/^SELECT pg_catalog\.set_config.*\n/gm, '');

const url = new URL(DATABASE_URL.replace('&channel_binding=require', ''));
const db = new SQL({
  hostname: url.hostname,
  port: Number(url.port) || 5432,
  database: url.pathname.slice(1),
  username: url.username,
  password: url.password,
  ssl: true,
});

console.log('✅ Connected to Neon');
console.log('📦 Running import...\n');

try {
  await db.unsafe(cleaned);
  console.log('✅ Import complete!');
} catch (e: any) {
  console.error('❌ Error:', e.message);
}

await db.close();
process.exit(0);
