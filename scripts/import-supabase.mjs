/**
 * Import a pg_dump backup into Supabase (or any Postgres) via the pooler.
 *
 * pg_dump stores data in COPY ... FROM stdin blocks (text format). The pg
 * build used by this workspace has no copy-stream support (copyFrom missing),
 * so COPY blocks are parsed and re-emitted as batched INSERTs instead.
 *
 * Statements that already exist in the target DB (types/tables/constraints)
 * are skipped, not fatal.
 *
 * Usage:
 *   node import-supabase.mjs <backup.sql>
 *   (DATABASE_URL from env, else read from artifacts/api-server/.env)
 */
import { readFileSync } from "fs";
import { resolve } from "path";
import pg from "pg";

const { Client, escapeIdentifier, escapeLiteral } = pg;

const sqlFile = process.argv[2];
if (!sqlFile) {
  console.error("Usage: node import-supabase.mjs <backup.sql>");
  process.exit(1);
}

// ── Resolve DATABASE_URL (env first, then artifacts/api-server/.env) ──────
let DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  try {
    const envText = readFileSync(resolve("artifacts/api-server/.env"), "utf8");
    const m = envText.match(/^DATABASE_URL=(.+)$/m);
    if (m) DATABASE_URL = m[1].trim().replace(/^["']|["']$/g, "");
  } catch {
    /* fall through to the error below */
  }
}
if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL not set and could not be read from artifacts/api-server/.env");
  process.exit(1);
}

const raw = readFileSync(sqlFile, "utf8");

// Strip Replit-specific \restrict / \unrestrict meta-commands
const cleaned = raw
  .replace(/^\s*\\restrict\s+.*$/gm, "")
  .replace(/^\s*\\unrestrict\s+.*$/gm, "");

// ── Parse into statements, keeping COPY blocks intact ─────────────────────
const statements = [];
let buf = [];
let inCopy = false;

for (const line of cleaned.split("\n")) {
  const t = line.trim();
  if (t === "" || t.startsWith("--")) continue;

  if (/^COPY\s+/i.test(t)) {
    inCopy = true;
    buf = [line];
    continue;
  }
  if (inCopy) {
    buf.push(line);
    if (t === "\\.") {
      statements.push({ type: "copy", text: buf.join("\n") });
      buf = [];
      inCopy = false;
    }
    continue;
  }
  buf.push(line);
  if (t.endsWith(";")) {
    statements.push({ type: "sql", text: buf.join("\n") });
    buf = [];
  }
}
if (buf.length) {
  statements.push({ type: "sql", text: buf.join("\n") });
}

console.log(`📦 Parsed ${statements.length} statements (${statements.filter((s) => s.type === "copy").length} COPY blocks)`);

// ── pg text-format COPY row → SQL literal ──────────────────────────────────
// Fields are tab-separated; \N = NULL; backslash escapes per PostgreSQL text format
function parseCopyField(field) {
  if (field === "\\N") return null;
  if (field === "") return "";
  let out = "";
  for (let i = 0; i < field.length; i++) {
    const ch = field[i];
    if (ch !== "\\") {
      out += ch;
      continue;
    }
    const nxt = field[++i];
    switch (nxt) {
      case "n": out += "\n"; break;
      case "t": out += "\t"; break;
      case "r": out += "\r"; break;
      case "b": out += "\b"; break;
      case "f": out += "\f"; break;
      case "v": out += "\v"; break;
      case "\\": out += "\\"; break;
      case ".": out += "."; break; // escaped literal dot inside data
      case undefined: out += "\\"; break; // trailing backslash
      default:
        if (nxt >= "0" && nxt <= "7") {
          // octal escape (up to 3 digits)
          let oct = nxt;
          for (let j = 0; j < 2; j++) {
            const d = field[i + 1];
            if (d >= "0" && d <= "7") {
              oct += d;
              i++;
            } else break;
          }
          out += String.fromCharCode(parseInt(oct, 8));
        } else {
          out += "\\" + nxt;
        }
    }
  }
  return out;
}

function copyBlockToInserts(text, chunkSize = 100, overriding = "") {
  const lines = text.split("\n");
  const header = lines[0].trim().replace(/;\s*$/, "");
  const m = header.match(/^COPY\s+([^\s(]+)\s*\(([\s\S]*)\)\s+FROM\s+stdin/i);
  if (!m) throw new Error(`cannot parse COPY header: ${header}`);
  const table = m[1].trim();
  const cols = m[2]
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean)
    .map((c) => escapeIdentifier(c.replace(/^"(.*)"$/, "$1")));

  const dataLines = lines.slice(1, lines.length - 1); // drop header + final \.
  const rows = [];
  for (const line of dataLines) {
    if (line.trim() === "") continue;
    const fields = line.split("\t");
    rows.push(fields.map(parseCopyField));
  }

  const colList = cols.join(", ");
  const inserts = [];
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const values = chunk
      .map((row) => `(${row.map((v) => (v === null ? "NULL" : escapeLiteral(String(v)))).join(", ")})`)
      .join(", ");
    inserts.push(`INSERT INTO ${table} (${colList})${overriding} VALUES ${values} ON CONFLICT DO NOTHING;`);
  }
  return inserts;
}

const BENIGN =
  /already exists|duplicate (key|type|object|value)|violates unique constraint|must be (owner|member of role)|SET not allowed|is already a member|syntax error at or near "SET"|identity column|multiple primary keys|cannot change ownership of identity sequence/i;

const client = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
await client.connect();

// Tables whose id is GENERATED ALWAYS AS IDENTITY need OVERRIDING SYSTEM VALUE
const identityTables = new Set();
{
  const r = await client.query(
    `select table_name from information_schema.columns
     where table_schema='public' and column_name='id' and is_identity='YES' and identity_generation='ALWAYS'`
  );
  for (const row of r.rows) identityTables.add(row.table_name);
  if (identityTables.size) {
    console.log(`🔑 Identity ALWAYS tables (need OVERRIDING SYSTEM VALUE): ${[...identityTables].join(", ")}`);
  }
}

let ok = 0;
let skipped = 0;
let failed = 0;

for (const stmt of statements) {
  const label = stmt.type === "copy" ? stmt.text.split("\n")[0].slice(0, 70) : stmt.text.slice(0, 70).replace(/\n/g, " ");
  try {
    if (stmt.type === "copy") {
      const tableName = (stmt.text.match(/^COPY\s+([^\s(]+)/i) || [])[1]?.replace(/^.*\./, "");
      const overriding = tableName && identityTables.has(tableName) ? " OVERRIDING SYSTEM VALUE" : "";
      const inserts = copyBlockToInserts(stmt.text, 100, overriding);
      for (const ins of inserts) {
        try {
          await client.query(ins);
          ok++;
        } catch (err) {
          const msg = String(err.message ?? err);
          if (BENIGN.test(msg)) {
            skipped++;
          } else {
            throw err;
          }
        }
      }
    } else {
      await client.query(stmt.text);
      ok++;
    }
  } catch (err) {
    const msg = String(err.message ?? err);
    if (BENIGN.test(msg)) {
      skipped++;
    } else {
      failed++;
      console.warn(`  ⚠️  ${label} → ${msg.split("\n")[0].slice(0, 140)}`);
    }
  }
}

console.log(`\n✅ Done: ${ok} ok | ${skipped} skipped (already exists/benign) | ${failed} failed`);
await client.end();

// ── Verification: row counts ───────────────────────────────────────────────
const pool = new pg.Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
try {
  const tables = await pool.query("select tablename from pg_tables where schemaname='public' order by tablename");
  const rows = [];
  for (const { tablename } of tables.rows) {
    const r = await pool.query(`select count(*) as n from "${tablename}"`);
    rows.push(`${tablename}: ${r.rows[0].n}`);
  }
  console.log("\n── Row counts ──\n" + rows.join("\n"));
} finally {
  await pool.end();
}
