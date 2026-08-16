/**
 * Import SQL backup into Neon database
 * Usage: pnpm dlx tsx src/import-sql.ts ../../philingo_backup_20260815_095615.sql
 */
import { readFileSync } from 'fs';
import { db } from './lib/db.js';
import { sql } from 'drizzle-orm';

const sqlFile = process.argv[2];
if (!sqlFile) {
  console.error('Usage: tsx src/import-sql.ts <backup.sql>');
  process.exit(1);
}

const raw = readFileSync(sqlFile, 'utf8');

// Clean Replit/psql meta-commands
const cleaned = raw.replace(/^\\restrict\s+.*$/gm, '').replace(/^\\[a-z].*$/gm, '');

// Split: COPY blocks end with \. not with ;
// Strategy: split on lines, rebuild statements
const lines = cleaned.split('\n');
const statements: string[] = [];
let current: string[] = [];
let inCopy = false;

for (const line of lines) {
  if (line.trim() === '') continue;
  if (line.trim().startsWith('--')) continue;

  if (/^COPY\s+/i.test(line)) {
    inCopy = true;
    current.push(line);
  } else if (inCopy && line.trim() === '\\.') {
    // End of COPY block
    current.push('\\.');
    statements.push(current.join('\n'));
    current = [];
    inCopy = false;
  } else if (inCopy) {
    current.push(line);
  } else if (line.trimEnd().endsWith(';')) {
    current.push(line);
    statements.push(current.join('\n'));
    current = [];
  } else {
    current.push(line);
  }
}

console.log(`📦 Found ${statements.length} statements to run`);

let ok = 0;
let skipped = 0;
let failed = 0;

for (const stmt of statements) {
  const trimmed = stmt.trim();
  if (!trimmed || trimmed.startsWith('--')) continue;

  try {
    await db.execute(sql.raw(trimmed));
    ok++;
  } catch (e: any) {
    const msg: string = e.message ?? '';
    if (
      msg.includes('already exists') ||
      msg.includes('duplicate key') ||
      msg.includes('violates unique constraint')
    ) {
      skipped++;
    } else {
      failed++;
      console.warn(`  ⚠️  ${msg.slice(0, 120)}`);
    }
  }
}

console.log(`\n✅ Done: ${ok} ok | ${skipped} skipped (already exists) | ${failed} failed`);
process.exit(0);
