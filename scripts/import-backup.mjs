import { readFileSync } from 'fs';
import pg from 'pg';

const { Client } = pg;

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not set');
  process.exit(1);
}

const sqlFile = process.argv[2];
if (!sqlFile) {
  console.error('Usage: node import-backup.mjs <backup.sql>');
  process.exit(1);
}

const sql = readFileSync(sqlFile, 'utf8');

// Remove Replit-specific \restrict line that psql doesn't know
const cleaned = sql.replace(/^\\restrict\s+.*$/gm, '-- (replit header removed)');

const client = new Client({ connectionString: DATABASE_URL });

async function run() {
  await client.connect();
  console.log('✅ Connected to Neon');

  try {
    await client.query(cleaned);
    console.log('✅ Import complete!');
  } catch (err) {
    console.error('❌ Error:', err.message);
    // Try statement by statement for better error recovery
    console.log('Trying statement-by-statement...');
    const statements = cleaned
      .split(/;\s*\n/)
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    let ok = 0, fail = 0;
    for (const stmt of statements) {
      try {
        await client.query(stmt);
        ok++;
      } catch (e) {
        fail++;
        if (!e.message.includes('already exists') && !e.message.includes('duplicate')) {
          console.warn(`  ⚠️  ${e.message.slice(0, 80)}`);
        }
      }
    }
    console.log(`\nDone: ${ok} ok, ${fail} skipped/failed`);
  }

  await client.end();
}

run();
