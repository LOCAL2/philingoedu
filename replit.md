# [Project name]

_Replace the heading above with the project's name, and this line with one sentence describing what this app does for users._

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

_Populate as you build — short repo map plus pointers to the source-of-truth file for DB schema, API contracts, theme files, etc._

## Architecture decisions

_Populate as you build — non-obvious choices a reader couldn't infer from the code (3-5 bullets)._

## Product

_Describe the high-level user-facing capabilities of this app once they exist._

## User preferences

### 🔒 Admin Upload Form — Strict Rules (ห้ามละเว้น ทุก form ที่มี image/file upload)
1. **Lock UI during upload** — ต้องมี `isUploading` state; ปุ่ม Save ต้อง `disabled={isUploading}` ตลอดเวลาที่ upload ยังไม่เสร็จ
2. **No race condition** — ห้าม PATCH/POST DB จนกว่า upload จะ complete 100%; form ต้องส่ง `imageUrl` ใหม่เท่านั้น ห้ามส่ง URL เก่า/default
3. **Cache invalidation** — หลัง DB update สำเร็จ ต้องล้าง cache frontend ทันที: ใช้ `staleTime: 0` + `cache: 'no-store'` สำหรับ query ที่ admin เปลี่ยนได้

- **แก้เฉพาะที่สั่งเท่านั้น** — ห้ามแตะส่วนอื่นที่ไม่เกี่ยวข้องกับงานที่สั่ง
- **ห้าม Reset / ลบ / สร้างใหม่** — ห้าม reset DB, ลบข้อมูล, ล้าง settings, reset user/admin, สร้าง schema ใหม่, rewrite ทั้งไฟล์ หรือสร้างโปรเจกต์ใหม่
- **ห้ามลบ** — API เดิม, ตาราง DB เดิม, ไฟล์เดิม, env vars เดิม, functions ที่ใช้งานได้
- **ก่อนแก้ทุกครั้ง** — ตรวจโค้ดปัจจุบัน, วิเคราะห์ผลกระทบ, แก้เฉพาะจุดที่สั่ง
- **หลังแก้เสร็จ** — รายงาน: ไฟล์ที่แก้, function ที่แก้, ตาราง/API ที่กระทบ, สิ่งที่เพิ่ม, สิ่งที่ไม่ได้แก้
- **ห้ามบอกว่า "แก้เสร็จแล้ว" โดยไม่มีหลักฐาน** — ต้องแนบ diff + สถานะ deploy ทุกครั้ง
- **เตือน deploy เสมอ** — ถ้ายังไม่ได้ deploy ต้องแจ้งว่า "ต้องกด Deploy ใหม่เพื่อให้เว็บจริงอัปเดต"

### ✅ Task Completion — บังคับทุกงานที่ Accept
1. **ห้ามลบไฟล์ static เดิมทันที** — archive ก่อนเสมอ (`foo.ts` → `foo.archived.ts`)
2. **แสดง diff ก่อน apply** — บอกชัดว่าไฟล์ใด, บรรทัดใด, เปลี่ยนอะไร ก่อน edit
3. **ทดสอบจริงบน production หลัง deploy** — screenshot / curl production ยืนยัน fix ก่อนถือว่าเสร็จ
4. **บันทึกผลลง REGRESSION_TEST_CHECKLIST.md** — ทุก fix ต้องมี entry: วันที่, commit, วิธีทดสอบ, ผลที่คาดหวัง

### 🗄️ DB Safety — ห้ามทำโดยไม่ยืนยัน (RULE 13)
- **ห้าม DELETE / bulk UPDATE / TRUNCATE / seed** โดยไม่แจ้งและรอยืนยันก่อน
- **ต้อง backup (export JSON)** ก่อนทุก operation ที่กระทบข้อมูลจริง
- ตารางที่ต้องระวังพิเศษ: `blog_posts(category=review)`, `admin_users`, `form_submissions`, `schools`, `site_settings`
- ดูรายละเอียดกฎฉบับเต็มที่ `PROJECT_RULES.md` — RULE 13

### 🔒 Protected Files — ห้ามแตะเด็ดขาด (RULE 12)

ไฟล์ต่อไปนี้ **ห้ามถูกแก้ไขทุกกรณี** เว้นแต่ผู้ใช้จะพิมพ์ **ชื่อไฟล์เต็มตรงๆ** ในคำสั่ง:

**กลุ่ม: หน้ากิจกรรม**
- `artifacts/philingo/src/pages/Activities.tsx`

**กลุ่ม: Banner หน้าแรก**
- `artifacts/philingo/src/pages/Home.tsx`
- `artifacts/admin/src/pages/Banners.tsx`
- `artifacts/api-server/src/routes/banners.ts`

> ดูรายละเอียดกฎฉบับเต็มที่ `PROJECT_RULES.md` — RULE 12

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
