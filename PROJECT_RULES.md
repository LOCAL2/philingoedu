# Philingo Project Rules
**Effective:** 2026-07-31  
**Scope:** All agents, all sessions, all contributors

---

## RULE 0 — DO NO HARM

> Before touching any file, read it. Before saving, verify nothing broke.

---

## RULE 1 — Scope of Changes

- ✅ **ONLY** modify what the user explicitly requests
- ❌ **NEVER** refactor, rename, or restructure unrequested code
- ❌ **NEVER** "clean up" working code while fixing something else
- ❌ **NEVER** change file structure, folder layout, or import paths without explicit request
- ❌ **NEVER** replace working components with regenerated versions

---

## RULE 2 — Preservation

### Must Always Preserve:
1. All existing pages (frontend)
2. All API endpoints and their contracts
3. All database tables and columns
4. All admin accounts and settings
5. All uploaded files in Object Storage
6. All SEO tags, sitemap, robots.txt, structured data
7. All existing bug fixes (see Fix Registry in `.agents/memory/philingo-stability-rules.md`)
8. All environment variables and secrets

### Fixes That Must Never Be Reverted:
| Fix | File | Never Remove |
|-----|------|-------------|
| `normalizePost()` Date conversion | `api-server/src/routes/blog.ts` | Prevents blog/review crash |
| `safeEmail` optional handling | `api-server/src/routes/forms.ts` | Forms work without email |
| `safeEmail` optional handling | `api-server/src/routes/contacts.ts` | Contact works without email |
| `submittedForm` success state | `philingo/src/pages/Contact.tsx` | Shows data + LINE CTA |
| LINE ID prepend to message | `philingo/src/pages/Contact.tsx` | Admin sees LINE ID in email |
| localStorage try-catch | `philingo/src/lib/language-context.tsx` | Safari private mode fix |
| Leelawadee UI font fallback | `philingo/src/index.css` | Edge Thai font fix |
| Full-data email templates | `api-server/src/routes/forms.ts`, `contacts.ts` | Admin + user emails show all fields |
| Activities/Seminars done state with LINE | `philingo/src/pages/Activities.tsx`, `Seminars.tsx` | LINE CTA after registration |

---

## RULE 3 — Database

- ❌ **NEVER** `DROP TABLE`
- ❌ **NEVER** `DELETE FROM` without explicit user approval
- ❌ **NEVER** `TRUNCATE`
- ❌ **NEVER** reset migrations
- ❌ **NEVER** reset admin user passwords or accounts
- ✅ **ONLY** use `INSERT`, `UPDATE`, or new `ALTER TABLE ADD COLUMN` migrations
- ✅ Migrations must be additive only (add columns/tables, never remove)

---

## RULE 4 — Thai Language (Permanent Requirements)

```html
<!-- MUST always be present in artifacts/philingo/index.html -->
<html lang="th">
<meta charset="UTF-8">
```

```css
/* MUST always include Thai font fallback in index.css */
--app-font-sans: 'Prompt', 'Sarabun', 'Leelawadee UI', 'Leelawadee', 'Tahoma', 'Arial Unicode MS', sans-serif;
```

```html
<!-- MUST always be present in index.html -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:...&family=Prompt:...&family=Sarabun:...&display=swap" rel="stylesheet">
```

- All user-facing text must support Thai + English
- All forms must accept Thai characters
- All database text fields store UTF-8
- Microsoft Edge Read Aloud must work (requires proper `lang` attribute)
- Google Translate must work (no obfuscated text, no canvas-only rendering)

---

## RULE 5 — Code Modification Pattern

### Always:
```
1. READ the file first
2. IDENTIFY the exact lines to change
3. PATCH only those lines (Edit tool with narrow old_string)
4. VERIFY the file still compiles (check for syntax errors)
5. TEST the affected endpoint or UI
6. REPORT what changed
```

### Never:
```
1. WriteFile to overwrite an existing working file entirely
2. Edit with old_string = entire file
3. Change files "just in case" they're related
4. Assume a file doesn't exist — check first
```

---

## RULE 6 — API Contracts

- Never change a response shape that existing frontend code depends on
- Never rename query parameters that clients already use
- Never add required fields to existing POST/PATCH endpoints without updating clients
- Backward compatibility is mandatory

---

## RULE 7 — Environment & Secrets

- Never log, display, or embed secrets in code
- Never hardcode values that are already in `site_settings` DB or env vars
- Use `process.env.VAR_NAME` in backend, never inline values
- Frontend reads contact info from `/api/settings` — do not hardcode phone/LINE/email

**Known secrets in use:**
- `RESEND_API_KEY` — Email sending
- `SESSION_SECRET` — Session encryption
- `JWT_SECRET` — JWT signing (auto-generated)
- `DEFAULT_OBJECT_STORAGE_BUCKET_ID` — File storage
- `PRIVATE_OBJECT_DIR` — File storage path
- `PUBLIC_OBJECT_SEARCH_PATHS` — File storage path

---

## RULE 8 — SEO

Never remove or modify:
- `<title>` and `<meta name="description">` tags
- Open Graph (`og:*`) meta tags
- Twitter Card meta tags
- JSON-LD structured data in `PostDetail.tsx` and other pages
- `sitemap.xml` handler at `/api/sitemap.xml`
- `robots.txt` (if exists)
- Canonical URL patterns

---

## RULE 9 — Reporting (after every task)

After every change, provide:
1. Files modified (with specific functions/lines)
2. What was changed and why
3. What was NOT changed (preserved)
4. Database changes (if any)
5. Regression test results

---

## RULE 11 — Proof of Completion (บังคับเสมอ)

### ❌ ห้ามพูดสิ่งเหล่านี้โดยไม่มีหลักฐาน:
- "แก้เสร็จแล้ว"
- "ทำงานถูกต้องแล้ว"
- "ใช้งานได้แล้ว"
- หรือประโยคอื่นที่สื่อว่าเสร็จสมบูรณ์

### ✅ ทุกครั้งที่รายงานว่าแก้เสร็จ ต้องแนบ:
1. **Diff ของไฟล์ที่เปลี่ยน** — แสดงบรรทัดที่เปลี่ยนจริง (old → new) หรือ git diff
2. **สถานะ deploy** — บอกชัดว่า deploy แล้วหรือยัง
3. **คำเตือน deploy** — ถ้ายังไม่ได้ deploy ต้องเตือนว่า:

> ⚠️ **ต้องกด Deploy ใหม่เพื่อให้เว็บจริง (philingoedu.com) อัปเดต — การแก้ไขนี้ยังอยู่แค่ในระบบ dev**

### ตัวอย่างรายงานที่ถูกต้อง:
```
✅ แก้แล้ว — artifacts/philingo/src/components/X.tsx
  บรรทัด 42: grid-cols-3 → grid-cols-1 sm:grid-cols-2 md:grid-cols-3
  Commit: abc1234
⚠️ ยังไม่ได้ Deploy — ต้องกด Deploy ใหม่เพื่อให้ philingoedu.com อัปเดต
```

---

## RULE 13 — Database Safety (บังคับเสมอ ห้ามฝ่าฝืน)

### ❌ ห้ามรันคำสั่งต่อไปนี้โดยไม่แจ้งและขอยืนยันก่อน:
- `DELETE FROM <table>` (ทุกกรณี)
- `UPDATE <table> SET ...` แบบไม่มี WHERE (bulk update)
- `TRUNCATE <table>`
- Migration ที่ลบหรือแก้ไขข้อมูลจำนวนมาก
- Seed script ที่อาจ overwrite ข้อมูลที่มีอยู่

### ✅ ขั้นตอนบังคับก่อนทำ DB operation ที่กระทบข้อมูล:
```
1. แจ้งผู้ใช้ว่าจะทำอะไร และกระทบกี่ rows
2. Export ข้อมูลที่จะถูกกระทบเป็น JSON/CSV ก่อน (backup)
3. รอการยืนยันจากผู้ใช้
4. รัน operation
5. รายงานผลและจำนวน rows ที่เปลี่ยนแปลง
```

### ตารางสำคัญที่ต้องแจ้งเตือนเสมอ:
- `blog_posts` (category='review') — รีวิวจากลูกค้า
- `admin_users` — บัญชีผู้ดูแลระบบ
- `form_submissions` / `contact_submissions` — ข้อมูลลูกค้า
- `schools` — ข้อมูลสถาบัน
- `site_settings` — ตั้งค่าระบบ

> **บทเรียนจากเหตุการณ์จริง:** รีวิว 10 รายการใน `blog_posts` หายไปเหลือ 1 รายการ
> สาเหตุ: seed/migration script รันโดยไม่มีการ backup และยืนยันก่อน
> **ป้องกัน: ต้อง export JSON ก่อนทุกครั้งที่จะแตะตารางที่มีข้อมูลจริง**

---

## RULE 12 — Protected Files (ห้ามแตะโดยเด็ดขาด)

ไฟล์ต่อไปนี้ **ห้ามถูกแก้ไขไม่ว่ากรณีใด** เว้นแต่ผู้ใช้จะ **พิมพ์ชื่อไฟล์นั้นตรงๆ** ในคำสั่ง

### 🎯 กลุ่ม: หน้ากิจกรรม (Activity Page)

| ไฟล์ | เหตุผลที่ protected |
|------|---------------------|
| `artifacts/philingo/src/pages/Activities.tsx` | หน้ากิจกรรมหลัก — มี LINE CTA + done-state ที่ผ่านการ fix แล้ว |

### 🖼️ กลุ่ม: Banner หน้าแรก

| ไฟล์ | เหตุผลที่ protected |
|------|---------------------|
| `artifacts/philingo/src/pages/Home.tsx` | หน้าแรก — มี banner section + fair-banner logic ที่ผ่านการ fix แล้ว |
| `artifacts/admin/src/pages/Banners.tsx` | หน้า admin จัดการ banner ทั้งหมด |
| `artifacts/api-server/src/routes/banners.ts` | API endpoint `/api/banners` |

### 📋 กฎการบังคับใช้

```
❌ ห้ามแก้ไขไฟล์เหล่านี้ แม้ว่า:
   - คำสั่งจะเกี่ยวข้องกับไฟล์ข้างเคียง
   - การ fix บางอย่างดูเหมือนต้องแตะไฟล์เหล่านี้
   - ไฟล์เหล่านี้ import/export สิ่งที่ถูกแก้ไข

✅ แก้ไขได้ เมื่อผู้ใช้พิมพ์ชื่อไฟล์เต็มตรงๆ ในคำสั่ง เช่น:
   "แก้ไฟล์ artifacts/philingo/src/pages/Activities.tsx เพื่อ..."
   "แก้ artifacts/philingo/src/pages/Home.tsx ตรงส่วน..."
```

> **เมื่อ AI ตรวจพบว่างานที่สั่งอาจกระทบไฟล์ protected:**
> ต้องแจ้งผู้ใช้ก่อน และรอการยืนยันพร้อมชื่อไฟล์ก่อนเสมอ

---

## RULE 10 — When in Doubt

- **Do not change anything**
- Ask the user for clarification
- Document the uncertainty
- Propose options, wait for approval

---

## RULE 14 — Database Backup & Recovery

### ระบบ Backup อัตโนมัติ
- **Trigger:** ทุกวัน 00:00 UTC + ทุกครั้งที่ server restart
- **เก็บที่:** Replit Object Storage (GCS) — `gs://replit-objstore-e315b0e9-5776-4393-b2a8-aa255d552c7c/db-backups/`
- **Format:** `backup_YYYY-MM-DD_HH-MM-SS.sql.gz` (pg_dump + gzip level 9)
- **Retention:** 7 วันล่าสุด (ลบอัตโนมัติ)
- **ขนาดโดยประมาณ:** ~30 KB/ไฟล์ (compressed), ~170 KB (uncompressed)

### รัน Backup ด้วยตนเอง
```bash
node artifacts/api-server/scripts/run-backup.mjs
```
สคริปต์นี้รัน backup + ตรวจสอบผล + แสดง row count ทุกตาราง ใช้งานได้ทันทีโดยไม่ต้อง restart server

### ขั้นตอนกู้คืนข้อมูล (Database Restore)

> ⚠️ Restore จะ **เขียนทับข้อมูลปัจจุบัน** — ทำก็ต่อเมื่อแน่ใจแล้วเท่านั้น

**ขั้นตอน 1 — Download ไฟล์ backup จาก GCS**
```bash
# รัน script นี้เพื่อดูรายการ backup ทั้งหมดและ download ล่าสุด
node -e "
import { Storage } from '@google-cloud/storage';
// ... (ใช้ credentials เดียวกับ objectStorage.ts)
"
```
หรือเปิด App Storage pane ใน Replit → โฟลเดอร์ `db-backups/` → Download ไฟล์ `.sql.gz` ที่ต้องการ

**ขั้นตอน 2 — Decompress**
```bash
gunzip backup_YYYY-MM-DD_HH-MM-SS.sql.gz
# ได้ไฟล์ backup_YYYY-MM-DD_HH-MM-SS.sql
```

**ขั้นตอน 3 — Restore เข้า database**
```bash
# หยุด API server ก่อน (หรือรับความเสี่ยงว่าอาจมี request ระหว่าง restore)
psql "$DATABASE_URL" < backup_YYYY-MM-DD_HH-MM-SS.sql
```
หรือถ้า `psql` ไม่อยู่ใน PATH ให้ใช้:
```bash
/nix/store/bgwr5i8jf8jpg75rr53rz3fqv5k8yrwp-postgresql-16.10/bin/psql "$DATABASE_URL" < backup_YYYY-MM-DD_HH-MM-SS.sql
```

**ขั้นตอน 4 — ตรวจสอบหลัง restore**
```bash
# นับ row แต่ละตาราง — ควรตรงกับตอน backup
/nix/store/bgwr5i8jf8jpg75rr53rz3fqv5k8yrwp-postgresql-16.10/bin/psql "$DATABASE_URL" \
  -c "SELECT schemaname, tablename, n_live_tup FROM pg_stat_user_tables ORDER BY tablename;"
```

**ขั้นตอน 5 — Restart server**
```
Replit → Workflows → API Server → Restart
```

### หมายเหตุ
- Backup เป็น **plain SQL** (ไม่ใช่ binary format) — เปิดอ่านด้วย text editor ได้
- ไม่ต้อง drop table ก่อน restore เพราะ pg_dump ใช้ `DROP TABLE IF EXISTS` อยู่แล้ว
- ถ้า restore บน DB ใหม่ อาจต้อง run `drizzle-kit push` ก่อนเพื่อ create schema แล้วค่อย restore เฉพาะ data

---

## RULE 15 — ห้าม Regenerate / ต้อง Backup ก่อนแก้

### 15-A — ห้าม "ออกแบบใหม่" โดยไม่ได้รับอนุญาต

> AI ต้องไม่ regenerate, rewrite, หรือออกแบบ component/หน้าใดใหม่ทั้งหมด  
> **เว้นแต่** ผู้ใช้พิมพ์คำสั่งชัดเจนว่า **"ออกแบบใหม่"** หรือ **"regenerate"** เท่านั้น

- ❌ ห้ามแทนที่ component ที่ทำงานได้ด้วยเวอร์ชันที่ "ดีกว่า" ตามการตัดสินของ AI
- ❌ ห้าม refactor เนื้อหา, JSX structure, หรือ section order โดยไม่ได้รับคำสั่ง
- ✅ แก้ได้เฉพาะส่วนที่ผู้ใช้ระบุชัดเจนเท่านั้น

### 15-B — คำสั่ง "แก้ responsive / มือถือ" = แตะ CSS เท่านั้น

เมื่อได้รับคำสั่งแนว **"แก้ mobile", "responsive", "แก้มือถือ", "layout พัง"**:

- ✅ แก้ได้: `className` CSS, Tailwind breakpoint (`sm:`, `md:`), `flex`/`grid` layout
- ❌ ห้ามแตะ: เนื้อหา (text), จำนวน section, ชื่อ, ราคา, ลำดับ component, logic, state, props
- ❌ ห้ามเพิ่มหรือลบ JSX element ที่ไม่เกี่ยวกับ layout เด็ดขาด

### 15-C — Backup ก่อนแก้ไขหน้าที่มีเนื้อหาสำคัญ

ก่อนแก้ไขไฟล์หน้าใดๆ ที่มีการออกแบบ/กรอกเนื้อหาไว้แล้ว (เช่น `Activities.tsx`, `Home.tsx`, `Seminars.tsx`, หน้า school detail):

```bash
# คัดลอกไฟล์ต้นฉบับก่อนแก้เสมอ
cp artifacts/philingo/src/pages/Activities.tsx \
   artifacts/philingo/src/pages/Activities.tsx.backup
```

- ชื่อไฟล์ backup: `<ชื่อไฟล์เดิม>.backup`
- เก็บไว้ในโฟลเดอร์เดียวกันกับไฟล์ต้นฉบับ
- ลบไฟล์ `.backup` หลังจากผู้ใช้ยืนยันว่าผลลัพธ์ถูกต้องแล้วเท่านั้น
- ถ้า git ยังมี commit ก่อนหน้าที่ restore ได้ → ไม่จำเป็นต้อง backup ซ้ำ แต่ต้องระบุ commit SHA ให้ผู้ใช้ทราบ

---

## RULE 16 — Deploy Log (บังคับเสมอ ห้ามฝ่าฝืน)

**ห้าม deploy โดยไม่บันทึกลง `DEPLOY_LOG.md` ก่อน**

### ทุก deploy ต้องบันทึก:
1. วันที่/เวลา deploy (UTC)
2. รายชื่อไฟล์ที่เปลี่ยนแปลงในรอบนั้น
3. สรุปสิ่งที่แก้ (1-3 บรรทัด)
4. ผลทดสอบ pre-deploy checklist (✅/❌)
5. Commit hash อ้างอิง

### ขั้นตอนก่อน deploy ทุกครั้ง:
```
1. อัปเดต DEPLOY_LOG.md → section "PENDING DEPLOY" ให้ครบ
2. รัน pre-deploy checklist (PRE_DEPLOY_CHECKLIST.md)
3. Deploy
4. เปลี่ยน section จาก "PENDING" เป็น "Deploy #N — วันที่"
```

---

## RULE 17 — การรายงานผลทดสอบ Production (บังคับเสมอ ห้ามฝ่าฝืน)

**ห้าม AI รายงานว่าทดสอบผ่าน "production" เว้นแต่จะทดสอบผ่าน domain จริง (philingoedu.com) เท่านั้น**

### กฎที่ต้องปฏิบัติทุกครั้ง:

1. **ห้ามใช้คำว่า "production" ปนกับการทดสอบผ่าน Dev/Preview URL** (`.replit.dev` หรือ `$REPLIT_DEV_DOMAIN`) เด็ดขาด
   - Dev/Preview URL เรียกว่า "dev" หรือ "preview" เท่านั้น
   - Production คือ `philingoedu.com` เท่านั้น

2. **ทุกครั้งที่รายงานผลทดสอบ ต้องระบุ URL ที่ใช้ทดสอบกำกับไว้ชัดเจนเสมอ**
   ```
   ✅ ถูก: "ทดสอบผ่าน https://philingoedu.com/api/... → 200"
   ✅ ถูก: "ทดสอบผ่าน dev preview (REPLIT_DEV_DOMAIN) → 200"
   ❌ ผิด: "ทดสอบ production แล้วผ่าน" (ไม่ระบุ URL)
   ❌ ผิด: "ผลทดสอบ production" (แต่ใช้ .replit.dev)
   ```

3. **ก่อนรายงานว่า production ผ่าน ต้องทำครบ:**
   - Login ผ่าน `https://philingoedu.com/api/auth/login` → ได้ token จริง
   - ทดสอบ endpoint ผ่าน `https://philingoedu.com/...` (ไม่ใช่ localhost หรือ .replit.dev)
   - มี response body จริงจาก philingoedu.com กำกับใน report

4. **สาเหตุ:** Dev preview (Vite dev server) compile จาก source แบบ real-time ไม่ใช้ static bundle — ผลทดสอบ dev และ production อาจต่างกันสิ้นเชิงเพราะ production ใช้ pre-built static bundle

---

## RULE 18 — Verify Bundle จริงหลัง Deploy (บังคับเสมอ ห้ามฝ่าฝืน)

**ห้ามถือว่า deploy สำเร็จแค่เพราะสถานะขึ้นว่า "published" หรือ "deployed"**

### ขั้นตอน verify บังคับหลัง deploy ทุกครั้ง:

1. **curl ตรวจ bundle filename จริงที่ production:**
   ```bash
   curl -s https://philingoedu.com/admin/ | grep -o 'index-[^"]*\.js'
   ```
   ต้องได้ filename/hash ตรงกับที่ `artifacts/admin/dist/public/assets/` มีอยู่จริงในขณะนั้น

2. **ถ้ายังเป็น hash เก่า ให้รอและ curl ซ้ำ** — ห้ามรายงานว่าสำเร็จ
   - รอ 1-2 นาที แล้ว curl ใหม่
   - ทำซ้ำจนกว่าจะเห็น hash ใหม่จริง

3. **บันทึกหลักฐานใน DEPLOY_LOG.md:**
   ```
   Production bundle verified: index-XXXXXXXX.js ✅
   Verified at: <timestamp UTC>
   curl output: <ผลลัพธ์จริง>
   ```

### สาเหตุที่ต้องทำ (Race Condition Warning):
Replit autoscale deployment snapshots workspace **รวม `dist/`** ณ เวลา deploy — ถ้า snapshot ถูกถ่ายก่อน `pnpm build` เสร็จ production จะได้ bundle เก่า แม้สถานะจะขึ้นว่า "published" แล้วก็ตาม การ curl ตรวจ hash เป็นวิธีเดียวที่ยืนยันได้ว่า production ได้รับไฟล์ที่ถูกต้องจริง
