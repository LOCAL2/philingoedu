import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = 'https://srxteomobjamicmpetwj.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyeHRlb21vYmphbWljbXBldHdqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Njc4MjkzNiwiZXhwIjoyMTAyMzU4OTM2fQ.SewJU_a0jmrrlqCPmHrdJfTnM-9c8O2R25mq3_C0hig';
const BUCKET = 'uploads';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const BOT_PHAM_DIR = path.resolve(__dirname, '../../attached_assets/bot-pham');

const CONTENT_TYPE: Record<string, string> = {
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.jfif': 'image/jpeg',
  '.webp': 'image/webp',
};

async function main() {
  const files = fs.readdirSync(BOT_PHAM_DIR);
  console.log(`\nFound ${files.length} files — uploading to bucket "${BUCKET}"\n`);

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    const uuid = path.basename(file, ext);
    const storagePath = `uploads/${uuid}`;
    const localPath = path.join(BOT_PHAM_DIR, file);
    const contentType = CONTENT_TYPE[ext] ?? 'image/jpeg';
    const buffer = fs.readFileSync(localPath);

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, buffer, { contentType, upsert: true });

    if (error) {
      console.error(`❌  ${file}\n    → ${storagePath}\n    Error: ${error.message}\n`);
    } else {
      console.log(`✅  ${file} → ${storagePath}`);
    }
  }

  console.log('\nAll done!');
}

main().catch(console.error);
