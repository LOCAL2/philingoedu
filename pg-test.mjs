import pg from 'pg';
const pool = new pg.Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
pool.query('SELECT current_database() as db, now() as time')
  .then(r => { console.log('✅ Connected:', JSON.stringify(r.rows[0])); process.exit(0); })
  .catch(e => { console.error('❌ Failed:', e.message); process.exit(1); });
