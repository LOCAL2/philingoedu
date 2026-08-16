import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

try {
  const res = await pool.query("SELECT current_database() as db, now() as time");
  console.log("✅ Connected:", res.rows[0]);
  await pool.end();
  process.exit(0);
} catch (e: any) {
  console.error("❌ Failed:", e.message);
  process.exit(1);
}
