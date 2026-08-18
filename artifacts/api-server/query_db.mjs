import pg from 'pg';
import { readFileSync } from 'fs';

const env = readFileSync('.env', 'utf8');
for (const line of env.split('\n')) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) process.env[m[1].trim()] = m[2].trim();
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

// Find the UUID in question across all image columns
const uuid = '843cb2ed-28ea-4f4f-8322-291d3507dd4c';

for (const { table, col } of [
  { table: 'gallery_items', col: 'image_url' },
  { table: 'schools', col: 'logo_url' },
  { table: 'schools', col: 'cover_image_url' },
  { table: 'schools', col: 'photos' },
  { table: 'banners', col: 'image_url' },
  { table: 'blog_posts', col: 'cover_image_url' },
  { table: 'promotions', col: 'image_url' },
]) {
  try {
    const r = await pool.query(`SELECT id, ${col} FROM ${table} WHERE ${col}::text LIKE $1 LIMIT 3`, [`%${uuid}%`]);
    if (r.rows.length > 0) console.log(`FOUND in ${table}.${col}:`, JSON.stringify(r.rows));
  } catch(e) { /* skip */ }
}

// Show all distinct image_url patterns in gallery_items
const patterns = await pool.query(`
  SELECT 
    CASE 
      WHEN image_url LIKE '/api/storage/objects/%' THEN 'supabase-storage'
      WHEN image_url LIKE '/api/gallery/image/%' THEN 'local-file'
      WHEN image_url LIKE 'https://storage.googleapis.com/%' THEN 'gcs'
      WHEN image_url LIKE 'https://%supabase%' THEN 'supabase-direct'
      WHEN image_url LIKE 'http%' THEN 'external-url'
      ELSE 'other: ' || LEFT(image_url, 40)
    END as pattern,
    COUNT(*) as cnt
  FROM gallery_items
  GROUP BY 1
  ORDER BY cnt DESC
`);
console.log('\nGALLERY image_url patterns:', JSON.stringify(patterns.rows));

// Check schools.photos (jsonb) for any /api/storage pattern
const schoolPhotos = await pool.query(`SELECT id, name, photos FROM schools WHERE photos IS NOT NULL AND jsonb_array_length(photos) > 0 LIMIT 3`);
console.log('\nSCHOOLS with photos:', JSON.stringify(schoolPhotos.rows.map(r => ({ id: r.id, name: r.name, first_photo: r.photos[0] }))));

await pool.end();
