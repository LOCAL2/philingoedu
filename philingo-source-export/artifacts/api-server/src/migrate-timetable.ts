import pg from 'pg';
// @ts-ignore — pg types are resolved at runtime via @types/pg in dependencies
async function main() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  await pool.query('ALTER TABLE schools ADD COLUMN IF NOT EXISTS timetable_config jsonb DEFAULT NULL');
  console.log('✓ timetable_config column added');
  await pool.end();
}

main().catch(console.error);
