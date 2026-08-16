import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const res = await pool.query("SELECT current_database() as db, now() as time");
console.log("✅ Connected:", res.rows[0]);
await pool.end();
