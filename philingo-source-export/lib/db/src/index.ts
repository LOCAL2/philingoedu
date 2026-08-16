import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Parse DATABASE_URL manually so we can inject ssl config explicitly.
// pg's own parser overrides the `ssl` option when sslmode= is in the URL,
// so we parse manually and skip the connectionString approach.
function parseDbUrl(url: string) {
  const u = new URL(url);
  return {
    host:     u.hostname,
    port:     u.port ? Number(u.port) : 5432,
    database: u.pathname.replace(/^\//, "") || "postgres",
    user:     decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
  };
}

const parsed = parseDbUrl(process.env.DATABASE_URL);

export const pool = new Pool({
  ...parsed,
  ssl: { rejectUnauthorized: false },
  // Supabase's transaction pooler (port 6543) does not reset session state
  // between pooled connections — a custom search_path leaks across clients and
  // breaks unqualified table references with "relation does not exist".
  // Force search_path on every connection so queries always hit `public`.
  onConnect: async (client: pg.PoolClient) => {
    await client.query("SET search_path TO public");
  },
});

export const db = drizzle(pool, { schema });

export * from "./schema";
