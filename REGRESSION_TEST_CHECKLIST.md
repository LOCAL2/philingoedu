# Regression Test Checklist — Philingo

> **ใช้ก่อนทุกครั้งที่ deploy** — เช็คว่า fix เดิมยังทำงานถูกต้อง  
> อัปเดตครั้งล่าสุด: 2 ส.ค. 2569  
> Deploy ล่าสุด: **Deploy #6** — 2 ส.ค. 2569 13:06 UTC (frontend build ไม่รวม f8ef0d1/b92f94a — ต้อง Publish อีกครั้ง)

---

## สารบัญ

1. [Infrastructure — GCS Storage Migration](#1-infrastructure--gcs-storage-migration)
2. [Bug Fixes — 2026-08-01](#2-bug-fixes--2026-08-01)
3. [Seminars Page — Mobile Hero & Desktop Hero](#3-seminars-page--mobile-hero--desktop-hero)
4. [CourseTimetable — Legend Layout Fix](#4-coursetimetable--legend-layout-fix)
5. [Quotation Modal — Logo & Website URL](#5-quotation-modal--logo--website-url)
6. [Admin — Schools Modal Title](#6-admin--schools-modal-title)
7. [Settings — Batch Save JSON Fix](#7-settings--batch-save-json-fix)
8. [SEO — Global Site Title/Description from CMS](#8-seo--global-site-titledescription-from-cms)
9. [Email — ลบ thaistudyabroad ทั้งระบบ](#9-email--ลบ-thaistudyabroad-ทั้งระบบ)
10. [Gallery — Fetch Image from URL (Server-side)](#10-gallery--fetch-image-from-url-server-side)
11. [Gallery — GCS Permanent Storage Migration](#11-gallery--gcs-permanent-storage-migration)
12. [Blog Editor — AI Content Writer + Auto SEO](#12-blog-editor--ai-content-writer--auto-seo)
13. [SEO — Full Meta Tags + mdToHtml per Article](#13-seo--full-meta-tags--mdtohtml-per-article)
14. [Reviews — AI SEO + Gallery Cover Picker](#14-reviews--ai-seo--gallery-cover-picker)
15. [Schools — AI SEO Button](#15-schools--ai-seo-button)
16. [Blog — 15 Thai Articles (AI Batch)](#16-blog--15-thai-articles-ai-batch)
17. [Reviews — seoKeywords Interface Fix](#17-reviews--seokeywords-interface-fix)
18. [Forms Admin — CSV Export + Seminar Tab](#18-forms-admin--csv-export--seminar-tab)
19. [Pricing — Promo CTA above PriceCalculator (Mobile)](#19-pricing--promo-cta-above-pricecalculator-mobile)
20. [FAB Overlap — PriceCalculator Mobile](#20-fab-overlap--pricecalculator-mobile)
21. [Blog Page — Fetch จาก API แทน Static File](#21-blog-page--fetch-จาก-api-แทน-static-file)

---

## 1. Infrastructure — GCS Storage Migration

**วันที่:** 2 ส.ค. 2569 · **Commit:** `5248f75` · ✅ Deployed

### สิ่งที่เปลี่ยน
| Component | ก่อน | หลัง |
|-----------|------|------|
| Gallery image storage | Local disk `uploads/` | GCS `gallery/` prefix |
| Upload image storage | Local disk `uploads/` | GCS `uploads/` prefix |
| Gallery image URL | `/api/uploads/filename` | `/api/gallery/image/filename` |
| Serve gallery image | `express.static` (disk) | Stream จาก GCS |
| Serve upload image | `express.static` (disk) | Stream จาก GCS |

### ผลทดสอบ (post-migration dev)
| Test | ผล |
|------|-----|
| GET gallery image (id=2,3,4) | ✅ HTTP 200, image/jpeg |
| GET nonexistent image | ✅ HTTP 404 |
| Cache-Control header | ✅ `public, max-age=31536000, immutable` |
| POST upload (multer→GCS) | ✅ HTTP 200, URL returned |
| fetch-url → GCS (new image) | ✅ id=5, URL `/api/gallery/image/...` |
| Gallery feed frontend | ✅ 4 active items, all GCS URLs |
| **หลัง server restart** | ✅ รูปทุกรูปยังอยู่ครบ — GCS permanent |

### วิธีทดสอบ production
```
GET https://philingoedu.com/api/gallery/image/fetched-*.jpg  → HTTP 200
GET https://philingoedu.com/api/gallery?isActive=true        → total > 0
หน้า Home gallery section แสดงรูปจาก CMS (ไม่ fallback)
POST /api/upload จาก Admin panel → อัปโหลดสำเร็จ
```

---

## 2. Bug Fixes — 2026-08-01

**วันที่:** 1 ส.ค. 2569 · **Commit:** `335e539` และอื่นๆ · ✅ Deployed ก่อน Deploy #4

| บั๊ก | ไฟล์ | วิธีทดสอบ | ผลที่คาดหวัง |
|------|------|----------|------------|
| Banner "Education Fair" หน้าแรกคลิกไม่ได้ | `Home.tsx:411-429` | เปิดหน้าแรก → คลิก banner | ไปหน้า `/seminars` |
| วิดีโอ CIA ไม่แสดง (embed URL parse ผิด) | `SchoolDetail.tsx:20` | `/schools/cia` → แท็บวิดีโอ → กดเล่น | YouTube embed เล่นได้ |
| ราคาล้นขวาหลังกดประเมิน (mobile) | `PriceCalculator.tsx:264-349` | 375px → เลือกคอร์ส → กด exchange rate | ไม่มี horizontal scroll |
| ราคาโปรโมชั่นล้นขวา (mobile) | `PriceCalculator.tsx:311-319` | 375px → เปิดโปรโมชั่น | label+ราคาอยู่ใน viewport |
| ตารางเรียนรายวัน overflow mobile | `CourseTimetable.tsx:73-85` | 375px → แท็บตารางเรียน | rows ไม่ overflow |
| FacilitiesGallery 3 คอลัมน์บน mobile (รูปเล็กเกิน) | `FacilitiesGallery.tsx` | 390px → แท็บห้องพัก | 1 col mobile, 2 col sm, 3 col md |
| ปุ่มลอย LINE/Phone บัง pricing (mobile) | `PriceCalculator.tsx`, `SchoolDetail.tsx` | 390px → scroll ถึงราคา | เนื้อหาราคาไม่ถูกบัง |
| Logo โรงเรียนใน Seminars เป็นวงกลมสีเทา | `Seminars.tsx` | เปิด /seminars | โลโก้ QQ English/CIA/etc แสดงครบ |

---

## 3. Seminars Page — Mobile Hero & Desktop Hero

**วันที่:** 2 ส.ค. 2569 · **Commits:** `3d9934d` (mobile), `b92f94a` (desktop) · ✅ Deployed

### Mobile Hero (commit 3d9934d — 05:51 UTC)
- **Fix:** compact overlay `<640px` — countdown/pills/CTA padding ลดลง, image ratio 55–66% ที่ 320–390px
- **ทดสอบ:** `/seminars` ที่ 320px → overlay ทับอยู่บนภาพ, เห็นภาพพื้นหลัง ≥50%, ตัวหนังสืออ่านออก

### Desktop Hero Collapse (commit b92f94a — 11:56 UTC)
- **ปัญหา:** `md:min-h-0` ทำให้ hero ยุบตัวบน desktop — เห็นแค่ school logos section ไม่เห็น banner หลัก
- **Fix:** `md:min-h-[520px]` — hero แสดงเต็มสูง 520px

### วิธีทดสอบ
1. Desktop 1280px → `/seminars` → **ยืนยัน:** เห็น Education Fair 2026 banner เต็มหน้า
2. Mobile 320px/375px/390px → `/seminars` → **ยืนยัน:** overlay countdown + CTA ไม่หลุดใต้ภาพ

---

## 4. CourseTimetable — Legend Layout Fix

**วันที่:** 2 ส.ค. 2569 · **Commit:** `1ac05b0` · ✅ Tested 4 viewports

### ปัญหาที่แก้
- Legend (คำอธิบายสี) แสดงเป็น right-column แทนที่จะเป็น `flex-row` ใต้ตาราง
- **Fix:** `flex-row` บน `sm+` ใต้ตาราง ไม่ใช่ right-column

### ผลทดสอบ 4 viewports
| จอ | ผล |
|----|----|
| 320px | ✅ Legend ใต้ตาราง, ไม่ overflow |
| 375px | ✅ Legend ใต้ตาราง, อ่านออก |
| 768px | ✅ flex-row, layout สวยงาม |
| 1280px | ✅ flex-row, ไม่มี right-column ผิดตำแหน่ง |

---

## 5. Quotation Modal — Logo & Website URL

**วันที่:** 2 ส.ค. 2569 · **Commits:** `06:19 UTC` (v1) + `c3adcef` (v2 final) · ✅ Deployed

### ปัญหาที่แก้
- **v1 (06:19):** เพิ่ม logo image + แก้ website URL hardcode → `www.philingoedu.com`
- **v2 (c3adcef 12:32):** Logo ใช้ relative Vite asset path → พังใน `window.open('about:blank')` → แก้เป็น absolute URL `window.location.origin + logoUrl`; website เปลี่ยนจาก hardcode เป็น `${website}` จาก `contactInfo`

### วิธีทดสอบ
1. School Detail → คลิก "ออกใบเสนอราคา PDF"
2. **ยืนยัน:** Logo Philingo โหลดได้ใน popup (ไม่เป็นกล่องแตก)
3. **ยืนยัน:** URL header = ค่า `contactInfo.website` จาก DB (ไม่ hardcode)

---

## 6. Admin — Schools Modal Title

**วันที่:** 2 ส.ค. 2569 · **Commit:** `06:27 UTC` · ✅ Deployed

### ปัญหาที่แก้
- Modal title แสดง "undefined" แทนชื่อสถาบัน — ใช้ `school.nameEn` ที่ไม่มีในข้อมูล

### วิธีทดสอบ
Admin → Schools → คลิกแก้ไขสถาบัน → **ยืนยัน:** Modal title แสดงชื่อภาษาไทย (เช่น "CIA (Cebu International Academy)")

---

## 7. Settings — Batch Save JSON Fix

**วันที่:** 2 ส.ค. 2569 · **Commit:** `06:30 UTC` · ✅ Deployed

### ปัญหาที่แก้
- Settings batch endpoint ใช้ `String()` กับ objects → บันทึกเป็น `[object Object]` แทน JSON จริง
- **Fix:** `JSON.stringify()` สำหรับ objects + ลบ corrupted row `key=settings`

### วิธีทดสอบ
Admin → Settings → บันทึกค่า object (เช่น social links) → reload → **ยืนยัน:** ค่าไม่เปลี่ยนเป็น `[object Object]`

---

## 8. SEO — Global Site Title/Description from CMS

**วันที่:** 2 ส.ค. 2569 · **Commit:** `06:37 UTC` · ✅ Deployed

### สิ่งที่เปลี่ยน
- `site_settings.seo_title` และ `site_settings.seo_description` ใน DB ถูก wire ไปที่ frontend `<title>` และ `<meta description>`
- ก่อน: hardcode เป็น fallback ค่าเดิมตลอด

### วิธีทดสอบ
1. Admin → Settings → แก้ SEO Title → บันทึก
2. เปิด philingoedu.com → View Source → **ยืนยัน:** `<title>` ตรงกับค่าที่บันทึก
3. **ยืนยัน:** ไม่มี `[object Object]` ใน meta tag

---

## 9. Email — ลบ thaistudyabroad ทั้งระบบ

**วันที่:** 2 ส.ค. 2569 · **Commit:** `06:42 UTC` · ✅ Deployed

### สิ่งที่เปลี่ยน
- email fallback ทุกจุดใน philingo frontend เปลี่ยนจาก `info@thaistudyabroad.com` → `info@philingoedu.com`

### วิธีทดสอบ
```bash
grep -r "thaistudyabroad" artifacts/philingo/src/
# Expected: ไม่มีผลลัพธ์
```

> ⚠️ `notification_email` ใน DB ยังเป็น `info@thaistudyabroad.com` — ต้องแก้ใน Admin → Settings

---

## 10. Gallery — Fetch Image from URL (Server-side)

**วันที่:** 2 ส.ค. 2569 · **Commit:** `07:21 UTC` · ✅ Deployed

### สิ่งที่เปลี่ยน
- Admin สามารถ fetch รูปจาก external URL → บันทึกลง GCS อัตโนมัติ
- Frontend Gallery section live feed ดึงจาก API แทน hardcode
- Fallback graceful ถ้า Gallery ว่าง

### วิธีทดสอบ
Admin → Gallery → ใส่ URL รูปภาพ → Fetch → **ยืนยัน:** รูปขึ้นใน Gallery, URL เป็น `/api/gallery/image/...` (ไม่ใช่ external URL)

---

## 11. Gallery — GCS Permanent Storage Migration

> ดูรายละเอียดเต็มที่ [ข้อ 1](#1-infrastructure--gcs-storage-migration)

**Commit:** `08:02 UTC` (feat) · ✅ Deployed  
**สรุป:** รูปทุกรูปย้ายจาก local disk → GCS — ไม่หายหลัง deploy อีกต่อไป

---

## 12. Blog Editor — AI Content Writer + Auto SEO

**วันที่:** 2 ส.ค. 2569 · **Commit:** `08:15 UTC` · ✅ Deployed

### ฟีเจอร์ที่เพิ่ม
- Admin → Blog → ปุ่ม "AI เขียนบทความ" (Anthropic Claude) — สร้าง content ภาษาไทยจาก title
- Gallery cover image picker — เลือกรูปจาก Gallery ที่อัปโหลดไว้
- Auto SEO — กด AI Generate → ได้ seoTitle + seoDescription + seoKeywords อัตโนมัติ
- Column `seoKeywords` เพิ่มใน DB schema

### วิธีทดสอบ
1. Admin → Blog → สร้างบทความใหม่ → ใส่ title → กด "AI เขียน"
2. **ยืนยัน:** content ภาษาไทยปรากฏใน editor
3. กด "AI Generate SEO" → **ยืนยัน:** seoTitle/seoDescription/seoKeywords กรอกอัตโนมัติ
4. เลือก cover จาก Gallery → **ยืนยัน:** รูปปรากฏใน preview

---

## 13. SEO — Full Meta Tags + mdToHtml per Article

**วันที่:** 2 ส.ค. 2569 · **Commit:** `08:21 UTC` · ✅ Deployed

### สิ่งที่เพิ่ม
- 22 meta tags ต่อบทความ: Open Graph, Twitter Card, JSON-LD (Article + FAQPage), canonical URL
- `mdToHtml()` — แปลง Markdown content เป็น HTML ก่อน render (แก้ `# หัวเรื่อง` แสดงเป็น text ดิบ)
- Robots meta: `index, follow, max-snippet:-1, max-image-preview:large`

### วิธีทดสอบ
1. เปิด PostDetail page → View Source
2. **ยืนยัน:** มี `<meta property="og:title">`, `<meta name="twitter:card">`, `<script type="application/ld+json">`
3. **ยืนยัน:** content ที่มี Markdown `**bold**` → แสดงเป็น `<strong>bold</strong>` ไม่ใช่ `**bold**`

---

## 14. Reviews — AI SEO + Gallery Cover Picker

**วันที่:** 2 ส.ค. 2569 · **Commit:** `08:48 UTC` · ✅ Deployed

### ฟีเจอร์ที่เพิ่ม
- ปุ่ม "AI Generate SEO" ใน Reviews editor → สร้าง seoTitle + seoDescription + seoKeywords
- Gallery picker เพื่อเลือก cover image สำหรับรีวิว
- แก้ placeholder text ที่ hardcode "CIA" เป็น dynamic

### วิธีทดสอบ
Admin → Reviews → เปิดรีวิว → กด "AI SEO" → **ยืนยัน:** SEO fields กรอกอัตโนมัติ

---

## 15. Schools — AI SEO Button

**วันที่:** 2 ส.ค. 2569 · **Commit:** `08:52 UTC` · ✅ Deployed

### ฟีเจอร์ที่เพิ่ม
- ปุ่ม "AI Generate SEO" ใน Schools editor → สร้าง seoTitle + seoDescription + seoKeywords ต่อโรงเรียน
- AI เขียน content description สำหรับ Reviews

### วิธีทดสอบ
Admin → Schools → เปิดโรงเรียน → กด "AI SEO" → **ยืนยัน:** seoTitle/seoDescription กรอกอัตโนมัติ

> ⚠️ ณ 2 ส.ค. 2569: 0/44 โรงเรียนมี seoTitle ใน DB ยังต้องกรอกด้วยมือ หรือใช้ปุ่ม AI ทีละโรงเรียน

---

## 16. Blog — 15 Thai Articles (AI Batch)

**วันที่:** 2 ส.ค. 2569 · **Commit:** `09:14 UTC` · ✅ Deployed

### สิ่งที่เพิ่ม
- บทความภาษาไทย 15 รายการ (id 27–41) สร้างด้วย AI batch generation
- หัวข้อ: ชีวิตในฟิลิปปินส์, ที่เที่ยว, อาหาร, SIM Card, สุขภาพ, ค่าใช้จ่าย ฯลฯ

### วิธีทดสอบ
`GET /api/blog?isPublished=true&limit=100` → **ยืนยัน:** total ≥ 31 (includes id 27–41)

---

## 17. Reviews — seoKeywords Interface Fix

**วันที่:** 2 ส.ค. 2569 · **Commit:** `11:49 UTC` · ✅ Deployed

### ปัญหาที่แก้
- `ReviewPost` interface ไม่มี `seoKeywords` field → TypeScript error `as any` cast
- **Fix:** เพิ่ม `seoKeywords?: string` ใน interface + ลบ `as any`

### วิธีทดสอบ
```bash
cd artifacts/admin && npx tsc --noEmit
# Expected: ไม่มี error เกี่ยวกับ seoKeywords
```

---

## 18. Forms Admin — CSV Export + Seminar Tab

**วันที่:** 2 ส.ค. 2569 · **Commit:** `12:12 UTC` · ✅ Deployed

### ฟีเจอร์ที่เพิ่ม
- Admin → Forms → Export CSV กรองตาม type (contact/consult/seminar) + date range
- Tab "สัมมนา" แยกออกมาจาก General Forms

### วิธีทดสอบ
1. Admin → Forms → เลือก tab "สัมมนา" → **ยืนยัน:** เห็นเฉพาะ seminar registrations
2. กด "Export CSV" → **ยืนยัน:** ดาวน์โหลดไฟล์ .csv ที่มี columns ครบถ้วน

---

## 19. Pricing — Promo CTA above PriceCalculator (Mobile)

**วันที่:** 2 ส.ค. 2569 · **Commit:** `06:06 UTC` · ✅ Deployed

### สิ่งที่เพิ่ม
- บน mobile: แสดง Promo CTA (ข้อความโปรโมชั่น + ปุ่มสมัคร) เหนือ PriceCalculator
- บน desktop: CTA อยู่ด้านข้างตามปกติ

### วิธีทดสอบ
เปิด School Detail → แท็บ "ราคา" → 375px → **ยืนยัน:** เห็น promo CTA ก่อน price calculator

---

## 20. FAB Overlap — PriceCalculator Mobile

**วันที่:** 2 ส.ค. 2569 · **Commit:** `b0d0412` · 12:58 UTC · ✅ Deployed (13:06 UTC)  
**ไฟล์:** `artifacts/philingo/src/components/PriceCalculator.tsx` line 152

### ปัญหาที่แก้
- FAB `fixed bottom-20 right-3` (80px bottom, 12px right, 48×48px) ทับ content 44px บนทุก mobile
- **Fix:** `pr-14 sm:pr-0 pb-20 sm:pb-0` — desktop ไม่เปลี่ยน

### ผลวัดได้
| จอ | ก่อน fix | หลัง fix |
|----|---------|---------|
| 320px | overlap 44px ❌ | clear 8px ✅ |
| 375px | overlap 44px ❌ | clear 8px ✅ |
| 390px | overlap 44px ❌ | clear 8px ✅ |
| Desktop sm+ | ไม่กระทบ | `sm:pr-0 sm:pb-0` = ไม่เปลี่ยน ✅ |

### วิธีทดสอบ
School Detail → แท็บ "ราคา" → 320/375/390px → scroll → **ยืนยัน:** FAB ไม่ทับตัวเลขราคาและปุ่มคำนวณ

---

## 21. Blog Page — Fetch จาก API แทน Static File

**วันที่:** 2 ส.ค. 2569 · **Commit:** `f8ef0d1` · 13:04 UTC · ⏳ Dev ✅ | Production ❌ (pending deploy)
**ไฟล์:** `artifacts/philingo/src/pages/Blog.tsx`

### Production vs Dev Verification (2026-08-02)
| รายการ | Dev | Production |
|--------|-----|------------|
| จำนวนบทความ | 31 (API) | 31 (API ✅) |
| Categories | API: ชีวิตในฟิลิปปินส์, คำแนะนำ, รีวิว, วีซ่า & เดินทาง, Tips & Guides... | Static เก่า: เรียนต่างประเทศ, IELTS, TOEIC, รีวิว, Student Stories ❌ |
| **สรุป** | ✅ API | ❌ ยังใช้ static file เก่า — ต้อง deploy |

### ปัญหาที่แก้
- Blog.tsx เดิม: `import { posts } from '@/data/posts'` → hardcoded 24 posts — บทความจาก Admin ไม่ขึ้น
- **Fix:** `fetch('/api/blog?isPublished=true&limit=100')` — แสดงครบทุก published article

### Specification
1. แสดงเฉพาะ `isPublished=true` — draft ไม่แสดง
2. Loading state: spinner ภาษาไทย
3. Error state: ข้อความ error ภาษาไทย (ไม่ใช่หน้าขาว)
4. Category filter จาก DB จริง (ไม่ hardcode)
5. Link ใช้ `slug` ไม่ใช่ numeric `id`

### วิธีทดสอบ
1. `/blog` → **ยืนยัน:** เห็น 31 บทความ (ไม่ใช่ 24)
2. สร้างบทความใหม่ใน Admin → refresh `/blog` → **ยืนยัน:** บทความใหม่ขึ้นทันที
3. Draft article → **ยืนยัน:** ไม่ปรากฏบน frontend
4. กด category filter → **ยืนยัน:** กรองถูกต้อง

### หมายเหตุ
- `data/posts.ts` ยังอยู่ (SchoolDetail ใช้สำหรับ related posts)
- Archive: `data/posts.archived.ts`
- Task #73 จะ migrate SchoolDetail ให้ใช้ API เช่นกัน

---

## 22. SchoolDetail — Related Posts Fetch from API (Task #73)

**วันที่:** 2 ส.ค. 2569 · **Commit:** `cfff7bd` · ⏳ Dev ✅ code verified | Production ❌ (pending deploy)

### สิ่งที่เปลี่ยน
| ก่อน | หลัง |
|------|------|
| `import { posts } from '@/data/posts'` (static file) | `fetch('/api/blog?isPublished=true&limit=100')` |
| Filter ด้วย `post.school` field | Filter ด้วย keyword matching บน `title + titleTh` |
| Link: `/blog/${post.id}` / `/reviews/${post.id}` | Link: `/posts/${post.slug}` |
| Field: `post.coverPhoto`, `post.type` | Field: `post.coverImageUrl`, `post.category` |

### SCHOOL_KEYWORDS
ยังใช้ต่อ — เป็นตัว filter ว่า article ใดเกี่ยวข้องกับโรงเรียนไหน โดย match กับ `title + titleTh`

### วิธีทดสอบ
1. `/schools/cia` → scroll ลงล่าง → **ยืนยัน:** เห็น "📝 บทความแนะนำ" หรือ "บทความรีวิว CIA" (ถ้า DB มีบทความที่มีคำ CIA ในชื่อ)
2. Link บทความ → **ยืนยัน:** URL เป็น `/posts/slug-name` ไม่ใช่ `/blog/123`
3. สร้างบทความใหม่มีคำ "CIA" ใน Admin → reload `/schools/cia` → **ยืนยัน:** บทความใหม่ขึ้นในส่วน related

---

## 23. Blog Admin — Auto Cover Image (Task #75)

**วันที่:** 2 ส.ค. 2569 · **Commit:** `6719762` · ⚠️ Admin UI committed | `coverImageUrl` = null ทุกบทความ (ยังไม่มีใช้งาน Auto Cover ผ่าน admin)

### สิ่งที่เพิ่ม
- ปุ่ม **"✨ Auto Cover"** (emerald สีเขียว) ใน Blog editor ถัดจาก "เลือกจาก Gallery"
- กด → ดึงภาพจาก Unsplash ตาม keyword ในชื่อบทความ → store ลง GCS → set `coverImageUrl` อัตโนมัติ
- Keyword mapping: เซบู→cebu, ที่เที่ยว→travel, อาหาร→food, SIM→mobile, สุขภาพ→health, etc.
- หาก Unsplash ล้มเหลว → แสดง error (ไม่ silent fail)

### วิธีทดสอบ
1. Admin → Blog → เพิ่มบทความ → กรอก title เช่น "ที่เที่ยวเซบู"
2. กด **Auto Cover** → **ยืนยัน:** spinner แสดง → รูปปรากฏใน preview
3. บันทึก → `/posts/<slug>` → **ยืนยัน:** รูปปกแสดงบนหน้าบทความ
4. title ไม่มี keyword เฉพาะ → ใช้ "study,english,philippines" as default

---

## 24. Production Blog DB Sync — 15 Missing Articles (Task #76 pre-condition)

**วันที่:** 2 ส.ค. 2569 · **Method:** HTTP API POST ทีละบทความผ่าน admin token · ✅ Production verified

### สาเหตุ
Production DB มีแค่ 16 บทความ (dev = 31) เพราะบทความ 15 รายการถูกสร้างใน dev **หลังจาก** production DB ถูก seed ครั้งแรก — ไม่ใช่ปัญหา filter, pagination, หรือ deploy

### สิ่งที่ทำ
- อัปเดต slug ของ id:7 จาก `test-review-cia` → `review-cia-cebu-4-weeks` + generate เนื้อหาใหม่ด้วย AI (6,848 chars / 404 words)
- Backup production state ก่อน insert → `/tmp/prod_backup.json` (16 slugs)
- Insert 15 บทความผ่าน `POST https://philingoedu.com/api/blog` — 15/15 ✅ ไม่มี error
- บทความที่ insert: airlines-thailand-to-cebu, local-fee, travel-cebu/baguio, city guides, dormitory, sparta, malls, grab, living-cost, laundry, internet, sick, **review-cia-cebu-4-weeks**

### ผลยืนยัน Production (2026-08-02 15:00 UTC)
| รายการ | ผล |
|--------|-----|
| `GET /api/blog?isPublished=true&limit=100` → `total` | **31** ✅ |
| `GET /api/blog?isPublished=true&limit=31` → `coverImageUrl` | 0/31 มีค่า (null ทั้งหมด) — ยังไม่ได้ตั้งค่าผ่าน Admin Auto Cover |
| บทความ `review-cia-cebu-4-weeks` | `id:31`, 6,848 chars, 404 words, isPublished: true ✅ |
| หน้า `/posts/review-cia-cebu-4-weeks` | โหลดได้, เนื้อหาครบ, มี tags CIA/IELTS/Cebu ✅ |
| Screenshots | `prod_blog_31_articles.png`, `prod_cia_review_article.png` |

### วิธีทดสอบ
1. `curl -s "https://philingoedu.com/api/blog?isPublished=true&limit=100"` → **ยืนยัน:** `total: 31`
2. เปิด `https://philingoedu.com/posts/review-cia-cebu-4-weeks` → **ยืนยัน:** บทความอ่านได้ครบ ≥ 400 คำ
3. `curl -s "https://philingoedu.com/api/blog/review-cia-cebu-4-weeks"` → **ยืนยัน:** `slug` ไม่มีคำว่า "test"

---

---

## 25. Mobile FAB — TikTok Missing + Messenger Scale Fix (2026-08-02)

### Root Cause
| ปัญหา | สาเหตุ |
|-------|--------|
| TikTok ไม่ปรากฏบน mobile เลย | `MobileFab` expanded menu ไม่มี TikTok — มีแค่ desktop stack (`hidden md:flex`) |
| Messenger pill เล็กกว่า LINE/Phone | `mobile-safety-fix.css` บรรทัด 22: `a[href*="m.me"] { transform: scale(0.75) }` |

### การแก้ไข
| ไฟล์ | การเปลี่ยนแปลง |
|------|---------------|
| `artifacts/philingo/src/components/layout/FloatingButtons.tsx` | เพิ่ม TikTok pill ใน `MobileFab` expanded menu (หลัง Messenger ก่อน scroll-to-top) |
| `artifacts/philingo/src/mobile-safety-fix.css` | ลบ `transform: scale(0.75)` + `right: 8px !important` rule ที่กระทบ `a[href*="m.me"]` / `a[href*="tiktok.com"]` |

### ผลการทดสอบ Dev (expanded FAB)
| Viewport | LINE OA | Phone | Messenger | TikTok | scroll-to-top |
|---------|---------|-------|-----------|--------|---------------|
| 320×568 | ✅ | ✅ | ✅ | ✅ (ต่ำกว่า cookie banner ครั้งแรก) | conditional |
| 375×667 | ✅ | ✅ | ✅ | ✅ | conditional |
| 390×844 | ✅ | ✅ | ✅ | ✅ | conditional |
| 428×926 | ✅ | ✅ | ✅ | ✅ | conditional |

> scroll-to-top = แสดงเมื่อ scroll ลงมากกว่า 300px (เป็น conditional by design)
> cookie banner ทับ TikTok ที่ 320px เฉพาะตอนยังไม่ยอมรับ cookie (ยอมรับแล้วหายปัญหา)

### Production Verification
- [ ] หลัง deploy: เปิด https://philingoedu.com บนมือถือ → กด FAB → เห็น 4 ปุ่ม (LINE/Phone/Messenger/TikTok) + scroll-to-top เมื่อ scroll ลง
- commit: `7e5368f`

---

---

## 26. FAB — "ติดต่อ >" Label (Option C UX, 2026-08-02)

**Commit:** `5be6443` · ⏳ Dev ✅ | Production ❌ (pending deploy)

### สิ่งที่เพิ่ม
| รายการ | รายละเอียด |
|--------|-----------|
| label pill | `ติดต่อ >` — `bg-white/95 shadow-lg rounded-full px-3 py-1.5 text-xs` |
| ตำแหน่ง | LEFT ของ FAB trigger button (flex row, items-center, gap-2) |
| animation | fade-in duration-700 + translate-x-0/2 (slide in from right) |
| timing | 50ms delay → visible → 3s → fade-out → 4s → DOM removed |
| storage | `sessionStorage.fabLabelShown` — แสดง 1 ครั้ง/session เท่านั้น |
| interaction | `pointer-events-none` — ไม่บัง tap ใดๆ |
| z-index | FAB ยก `z-40` → `z-[51]` เพื่อให้ label ปรากฏเหนือ cookie banner (`z-50`) |

### ผลทดสอบ Dev (label ปรากฏทุก viewport)
| Viewport | Label ปรากฏ | ทับเนื้อหา |
|---------|:-----------:|:----------:|
| 320×568 | ✅ | ❌ (ไม่ทับ) |
| 375×667 | ✅ | ❌ |
| 390×844 | ✅ | ❌ |
| 428×926 | ✅ | ❌ |

Screenshots: `fab_label_320px.jpg`, `fab_label_375px.jpg`, `fab_label_390px.jpg`, `fab_label_428px.jpg`

### Production Verification
- [ ] หลัง deploy: เปิด philingoedu.com บนมือถือ (incognito) → เห็น pill "ติดต่อ >" ข้างปุ่ม LINE ประมาณ 4 วินาที → หายเอง
- [ ] เปิดซ้ำในเซสชั่นเดิม → ไม่ปรากฏอีก (sessionStorage flag)

---

## 27. CIA ข้อ 6 — ย้ายปุ่ม "สร้างใบเสนอราคา" ใต้ PriceCalculator (2026-08-02)

**Commit:** `f131612` · ⏳ Dev ✅ | Production ❌ (pending deploy)

### การเปลี่ยนแปลง (3 จุด)
| ไฟล์ | จุดที่เปลี่ยน | ผล |
|------|-------------|-----|
| `SchoolDetail.tsx` | ลบออกจาก mobile promo box (`lg:hidden`) | ✅ ยืนยันด้วย grep: 0 matches |
| `SchoolDetail.tsx` | ลบออกจาก desktop sidebar promo box (`hidden lg:block`) | ✅ ยืนยันด้วย grep: 0 matches |
| `SchoolDetail.tsx` L.1891 | เพิ่ม standalone `bg-blue-700` button หลัง PriceCalculator ternary | ✅ ยืนยันด้วย grep: line 1891+1897 |

### Layout หลังย้าย
```
[🎁 ขอราคาโปรโมชั่น box]
  ├── ☑ ขอราคาโปรโมชั่นผ่าน LINE
  └── 💬 ปรึกษาฟรีกับทีม Philingo
[🧮 PriceCalculator — เลือกหลักสูตร/ห้องพัก → เห็นราคา]
[📄 สร้างใบเสนอราคา]  ← ตำแหน่งใหม่ (bg-blue-700)
```

### Production Verification
- [ ] หลัง deploy: `/schools/cia` → scroll ลงถึงส่วนราคา → เห็นปุ่ม **📄 สร้างใบเสนอราคา** (น้ำเงิน) อยู่ใต้ PriceCalculator โดยตรง
- [ ] กดปุ่ม → modal ใบเสนอราคาเปิดขึ้นปกติ
- [ ] Promo box ด้านบน: มีแค่ LINE + ปรึกษาฟรี (ไม่มีปุ่มใบเสนอราคา)

---

## 28. Seminars Hero Banner — object-position fix (mobile 320–428px, 2026-08-02)

**Commit:** `3b68c39` · ⏳ Dev ✅ | Production ❌ (pending deploy)

### Diff

```diff
- className="w-full h-full object-cover object-top absolute inset-0 md:relative md:h-auto"
+ className="w-full h-full object-cover object-left-top md:object-top absolute inset-0 md:relative md:h-auto"
```

**ไฟล์:** `artifacts/philingo/src/pages/Seminars.tsx` L.351

### สาเหตุ (Root Cause)
`object-top` กำหนดแค่แกน vertical (`top`) แต่ไม่กำหนดแกน horizontal → browser fallback เป็น `center` → landscape banner image ถูก crop จากกึ่งกลาง → ข้อความ "PHILINGO CEBU" ที่อยู่ฝั่งซ้ายของรูปหายไปที่ viewport แคบ

| viewport | ก่อนแก้ (object-top = center crop) | หลังแก้ (object-left-top) |
|----------|-----------------------------------|--------------------------|
| 320px | ~~"**NGO** CEBU"~~ (ขาด PHILI) | **"PHILING..."** ✅ |
| 375px | ~~"**LINGO** CEBU"~~ (ขาด PHI) | **"PHILINGO C..."** ✅ |
| 390px | ~~"**LINGO** CEBU"~~ (ขาด PHI) | **"PHILINGO C..."** ✅ |
| 428px | ~~"**ILINGO** CEBU"~~ (ขาด PH) | **"PHILINGO CEE..."** ✅ |
| Desktop 1280px | ✅ ปกติ (md:object-top ไม่เปลี่ยน) | ✅ ปกติ (ไม่เปลี่ยน) |

### Screenshots (⚠️ dev server — ไม่ใช่ production จริง)
| viewport | ไฟล์ |
|----------|------|
| 320px | `screenshots/item28_seminars_320.jpg` |
| 375px | `screenshots/item28_seminars_375.jpg` |
| 390px | `screenshots/item28_seminars_390.jpg` |
| 428px | `screenshots/item28_seminars_428.jpg` |
| Desktop | `screenshots/seminars_desktop_after_fix.jpg` |

### Production Verification (หลัง deploy)
- [ ] `/seminars` ที่ 320px → เห็น **"PHILING..."** ไม่ขาดหาย
- [ ] `/seminars` ที่ 428px → เห็น **"PHILINGO CEE..."** ครบ
- [ ] Desktop 1280px → banner แสดงผลเหมือนเดิม ไม่เปลี่ยนแปลง

---

## Known Limitations

| รายการ | สถานะ | เหตุผล |
|--------|--------|--------|
| FAB overlap — interactive test (click pricing tab) | ⚠️ Static analysis เท่านั้น | Playwright ไม่รันบน NixOS (`libglib-2.0.so.0` missing) |
| Production screenshots ที่ viewport เฉพาะ | ⚠️ ทำไม่ได้กับ `externalUrl` | Screenshot tool กับ externalUrl ไม่รองรับ `viewportSize` |
| Schools SEO | ⚠️ 0/44 schools มี seoTitle | ต้องกรอกด้วยมือผ่าน Admin หรือใช้ปุ่ม AI ทีละโรงเรียน |
| `notification_email` ใน DB | ⚠️ ยังเป็น `info@thaistudyabroad.com` | ต้องแก้ใน Admin → Settings → อีเมลรับแจ้งเตือน |

---

---

## 📱 CIA 428px UI Fixes (2026-08-02) — commit 77cd43b

| # | รายการ | สถานะ Dev | หมายเหตุ |
|---|--------|-----------|---------|
| 1 | YouTube URL → ตัดเป็น ID อัตโนมัติ (admin + SchoolDetail) | ✅ Code applied | admin/Schools.tsx handleFormSave + SchoolDetail legacyYtId |
| 2 | FAB overlap ปิดทับ "จุดเด่น" text | ✅ Screenshot verified | `pr-14 lg:pr-0` บน main content column |
| 3 | Philingo logo แสดงบนหน้า school ทุกหน้า (hero top-right) | ✅ Screenshot verified | import philingoLogo, flex row + brightness-0 invert |
| 4 | หน้าไม่เต็มจอ 428px — root cause: `mobile-safety-fix.css` | ✅ Screenshot verified | ลบ `padding-right: 60px !important` ที่จำกัด main ให้แคบ 60px |
| 5 | "สร้างใบเสนอราคา" ตัวอักษรมืดเกิน | ✅ Code applied | text-blue-900 + border-2 border-white/60 shadow-md (ทั้ง mobile + desktop) |
| 6 | ย้ายปุ่ม สร้างใบเสนอราคา ใต้ PriceCalculator ทันที | ✅ Code applied | ลบจาก promo box ทั้ง mobile+desktop; เพิ่ม standalone `bg-blue-700` button ใต้ calculator |

**Root cause ข้อ 4 (สำคัญ):** `mobile-safety-fix.css` มี rule `@media (max-width: 480px) { main { padding-right: 60px !important } }` ซึ่งทำให้ content 428-60=368px แทนที่จะเป็น 428px เต็มจอ

---

## ⚠️ 29. Regression หลัง Republish — FAB mobile + Quotation button (2026-08-02)

> **หมายเหตุ:** regression นี้เกิดจากการแก้ครั้งก่อน (commit `5be6443` + `f131612` + `580ddd4`)

### ปัญหาที่รายงาน
| # | อาการ | Root Cause | สถานะ |
|---|-------|-----------|-------|
| 1 | FAB mobile — ปุ่ม Social หายไปทั้งหมด | TypeScript error TS7030 ใน FloatingButtons.tsx L.32 (`useEffect` ไม่ return ทุก path) → อาจทำให้ strict build flag warning; code path ที่ `fabLabelShown='1'` เคย return `undefined` โดยปริยาย | ✅ Fixed |
| 2 | ปุ่มใบเสนอราคาไม่แสดง/ซ่อนตอนคำนวณ | layout bug ซ้ำ — grid item ขาด `min-w-0` (ดูข้อ 30) ยังไม่ deploy | ✅ Fixed in code, pending deploy |

### การแก้ไข

**FloatingButtons.tsx** — early-return pattern แทน nested if-return:
```diff
  React.useEffect(() => {
-   if (!sessionStorage.getItem('fabLabelShown')) {
-     setShowLabel(true);
-     ...timers...
-     return () => { clearTimeout(...); };
-   }
+   if (sessionStorage.getItem('fabLabelShown')) return;  // ← ทุก path explicit
+   setShowLabel(true);
+   ...timers...
+   return () => { clearTimeout(...); };
  }, []);
```

**SchoolDetail.tsx** — TypeScript errors TS2339/TS2352 (`course.slug` ไม่มีใน union type):
```diff
- {course.slug && (
-   <Link href={`/schools/${slug}/courses/${course.slug}`}
+ {Boolean((course as unknown as {slug?: string}).slug) && (
+   <Link href={`/schools/${slug}/courses/${(course as unknown as {slug: string}).slug}`}
```

### Screenshots ยืนยัน FAB ทำงาน (dev)
- 320px ✅ — LINE circle + "ติดต่อ >" label มองเห็นชัด
- 375px ✅
- 390px ✅
- 428px ✅

### Production Verification
- [ ] `/schools/cia` บน phone จริง — เห็นปุ่ม LINE สีเขียว bottom-right
- [ ] กดเปิด FAB → LINE OA / Phone / Messenger / TikTok / ด้านบน ครบ 5 รายการ
- [ ] scroll ลงถึงส่วนราคา → เห็นปุ่ม **📄 สร้างใบเสนอราคา** สีน้ำเงิน ไม่หลุดนอกจอ

---

## 30. ปุ่ม "สร้างใบเสนอราคา" หายไปนอกจอบน mobile — 3 root causes (2026-08-02)

**Root Cause Analysis:**

| # | สาเหตุ | อธิบาย |
|---|--------|--------|
| 1 | **Grid item ขาด `min-w-0`** (PRIMARY) | CSS grid items มี `min-width: auto` → comparison table (5+ คอลัมน์ whitespace-nowrap) บังคับ grid column ให้กว้างกว่า viewport → document-level horizontal overflow → ปุ่มอยู่นอกขอบขวา viewport ทั้งที่อยู่ใน DOM ปกติ |
| 2 | **Double `pr-14` บน mobile < 640px** | Main column: `pr-14 lg:pr-0` + PriceCalculator: `pr-14 sm:pr-0` = 112px padding รวม → content เหลือ 176px ที่ 320px → ตารางล้นออกนอก container |
| 3 | **ปุ่มไม่มี FAB clearance** | ปุ่มอยู่นอก PriceCalculator (ซึ่งมี `pb-20`) → FAB (`fixed bottom-20`) ทับปุ่มเมื่อปุ่มอยู่ล่างสุดของ viewport |

**Diff applied:**

```diff
--- PriceCalculator.tsx L.152
- <div className="space-y-6 pr-14 sm:pr-0 pb-20 sm:pb-0">
+ <div className="space-y-6 pb-20 sm:pb-0">
  (ลบ pr-14 ซ้ำซ้อน — main column จัดการแล้ว)

--- SchoolDetail.tsx L.1594
- <div className="lg:col-span-2 space-y-10 pr-14 lg:pr-0">
+ <div className="lg:col-span-2 space-y-10 pr-14 lg:pr-0 min-w-0">
  (FIX หลัก: min-w-0 ป้องกัน grid item ขยายตามตาราง)

--- SchoolDetail.tsx L.1978 (sidebar)
- <div className="space-y-5">
+ <div className="space-y-5 min-w-0">
  (sidebar ก็เป็น grid item เดียวกัน)

--- SchoolDetail.tsx L.1892 (quotation button)
  {school.pricingConfig && (
+   <div className="pb-20 sm:pb-0">
      <button onClick={() => setShowQuotation(true)} ...>
        📄 สร้างใบเสนอราคา
      </button>
+   </div>
  )}
  (เพิ่ม FAB clearance 80px ใต้ปุ่ม)
```

**Screenshots verified:** 320px ✅ · 375px ✅ · 390px ✅ · 428px ✅ — ไม่มี horizontal overflow

### Production Verification
- [ ] `/schools/cia` → scroll ลงถึงส่วนราคา → เห็นปุ่ม **📄 สร้างใบเสนอราคา** สีน้ำเงินปรากฏใต้ PriceCalculator
- [ ] กดปุ่ม → QuotationModal เปิดปกติ
- [ ] ไม่มี horizontal scroll ที่ section ราคา (ตรวจที่ 320px/390px)

---

---

## 🗂️ Master Verification Report — 2026-08-02 (ครอบคลุมทุกรายการที่คุยกันทั้งวัน)

> **หมายเหตุสำคัญเรื่อง Screenshot:**  
> - **Production** = screenshot จาก `philingoedu.com` จริง (desktop viewport เท่านั้น — screenshot tool ไม่รองรับ viewportSize สำหรับ external URL)  
> - **Dev** = screenshot จาก dev server (โค้ดที่จะ deploy) ที่ mobile viewport 320/375/390/428px  
> - ⚠️ หมายความว่า "ผ่านบน dev แต่ยังไม่ถึง production" — ต้อง Publish ก่อน  

### สัญลักษณ์
- ✅ = ผ่านบน production จริง
- ⚠️ = ผ่านแค่ dev — รอ deploy
- ❌ = ยังไม่ผ่าน / พบปัญหา
- 🔧 = ต้องดำเนินการด้วยมือ (ไม่ใช่ code)

---

### A. Feature/Bug Fixes — สถานะรวม

| # | รายการ | Dev | Production | สถานะ | หมายเหตุ |
|---|--------|:---:|:----------:|:------:|---------|
| A1 | Seminars Hero Banner — แสดงเต็มจอ ไม่ยุบ | ✅ | ❌ | ⚠️ ต้อง deploy | commit `aea3a8c` (ก่อนหน้า) |
| A2 | **Seminars Banner — ข้อความซ้ายไม่ถูก crop บน mobile** | ✅ | ❌ | ⚠️ ต้อง deploy | commit `3b68c39` — `object-left-top` แก้ crop ที่ 320-428px |
| A3 | Blog categories จาก API (ไม่ใช่ static) | ✅ | ❌ | ⚠️ ต้อง deploy | static chips มี "ทั้งหมด/เรียน/IELTS/TOEIC/รีวิว/ห้องเรียน" แต่ production ยังไม่โหลด API |
| A4 | TikTok ใน Mobile FAB expanded menu | ✅ | ❌ | ⚠️ ต้อง deploy | commit `7e5368f` |
| A5 | Messenger/TikTok ไม่ scale 75% — `mobile-safety-fix.css` | ✅ | ❌ | ⚠️ ต้อง deploy | ลบ `transform: scale(0.75)` ออกแล้ว |
| A6 | 31 บทความบน Production DB | — | ✅ | ✅ Production | verified โดยตรงกับ DB |
| A7 | #73 Related posts โหลดจาก API | ✅ | ❌ | ⚠️ ต้อง deploy | PostDetail.tsx fetch `/api/blog?category=...` |
| A8 | #75 Auto cover — ปุ่ม "✨ Auto Cover" ใน Admin | ✅ | ❌ | ⚠️ ต้อง deploy | commit อยู่ใน batch นี้ |
| A9 | #75 Auto cover — บทความมี coverImageUrl | — | ❌ | 🔧 ต้องใช้งาน | 0/31 บทความมี coverImageUrl — ต้องคลิก "✨ Auto Cover" ทีละบทความใน Admin |
| A10 | CIA ข้อ 1 — YouTube ID extraction อัตโนมัติ | ✅ | ❌ | ⚠️ ต้อง deploy | commit `77cd43b` |
| A11 | CIA ข้อ 2 — FAB ไม่ทับ "จุดเด่น" section | ✅ | ❌ | ⚠️ ต้อง deploy | `pr-14 lg:pr-0` |
| A12 | CIA ข้อ 3 — Philingo logo บน hero | ✅ | ❌ | ⚠️ ต้อง deploy | top-right badge |
| A13 | CIA ข้อ 4 — เต็มจอ 428px (ไม่ indent ซ้าย) | ✅ | ❌ | ⚠️ ต้อง deploy | ลบ `padding-right: 60px` ใน mobile-safety-fix.css |
| A14 | CIA ข้อ 5 — ปุ่มสร้างใบเสนอราคา contrast ดี | ✅ | ❌ | ⚠️ ต้อง deploy | `text-blue-900 border-2 border-white/60` |
| A15 | CIA ข้อ 6 — ปุ่มใบเสนอราคา ใต้ PriceCalculator | ✅ | ❌ | ⚠️ ต้อง deploy | commit `f131612` |
| A16 | FAB "ติดต่อ >" label (Option C) — fade once/session | ✅ | ❌ | ⚠️ ต้อง deploy | commit `5be6443` — sessionStorage, z-[51] |
| A17 | ปุ่ม "สร้างใบเสนอราคา" หายไปนอกจอบน mobile | ✅ | ❌ | ⚠️ ต้อง deploy | `min-w-0` บน grid items + ลบ double `pr-14` + FAB clearance wrapper |
| A18 | FAB mobile: TypeScript TS7030 + TS2339 → 0 errors | ✅ | ❌ | ⚠️ ต้อง deploy | FloatingButtons useEffect early-return; SchoolDetail course.slug cast |
| A19 | Bottom Nav tap target — กดติดทั้งกล่อง ไม่ใช่แค่ icon/text | ✅ | ❌ | ⚠️ ต้อง deploy | `w-full h-full` บน `<Link>` ใน MobileNav.tsx |
| A20 | Admin upload รูป — "Unexpected token '<'" → ใช้ `/api/...` แทน `BASE_URL/api/...` | ✅ | ❌ | ⚠️ ต้อง deploy | MultiImageUpload.tsx + Schools.tsx video + Gallery.tsx fetch-url |
| A21 | Admin upload audit ครบ 13 จุด/10 เมนู — ทุก fetch() ใช้ `/api/...` แล้ว (0 BASE_URL+api/ เหลือ) | ✅ | ❌ | ⚠️ ต้อง deploy | Schools.tsx 7 calls (generate-description, generate-seo, settings, scrape-images, parse-price, parse-promo, batch-scrape) |

---

### B. Layout Verification — 5 หน้า × 4 ขนาดจอ

> ⚠️ **ทั้งหมดนี้คือ dev server** — ไม่ใช่ production จริง

#### เกณฑ์ตรวจ
1. เนื้อหาเต็มความกว้างจอ 100% ไม่มีช่องว่างผิดปกติ
2. ไม่มี horizontal scroll
3. ไม่มีส่วนไหนถูกตัด/แหว่งขอบจอ
4. Container ไม่ใช้ fixed width ตายตัว

| หน้า | 320px | 375px | 390px | 428px | สรุป |
|------|:-----:|:-----:|:-----:|:-----:|------|
| **Home (/)** | ✅ | ✅ | ✅ | ✅ | ผ่านทุกขนาด — เนื้อหาเต็มจอ FAB visible |
| **Seminars (/seminars)** | ✅* | ✅* | ✅* | ✅* | *หลังแก้ `object-left-top` (commit 3b68c39) — ก่อนแก้ข้อความ PHILINGO ถูก crop |
| **CIA (/schools/cia)** | ✅ | ✅ | ✅ | ✅ | เต็มจอ tags wrap ปกติที่ 320px |
| **I.BREEZE (/schools/ibreeze)** | ✅ | ✅ | ✅ | ✅ | เต็มจอ ไม่มี overflow |
| **Blog (/blog)** | ✅ | ✅ | ✅ | ✅ | category pills wrap เป็น 2 แถว — ปกติ |

**ปัญหาที่พบและแก้ระหว่างการตรวจ:**

| ปัญหา | viewport | สาเหตุ | การแก้ | สถานะ |
|-------|---------|--------|--------|-------|
| Seminars banner ข้อความ "PHILINGO CEBU" ถูก crop ฝั่งซ้าย | 320-428px | `object-top` ไม่กำหนด horizontal position → browser ใช้ `center` → left text ถูก crop | เปลี่ยนเป็น `object-left-top` (mobile) / `md:object-top` (desktop) | ✅ แก้แล้ว commit `3b68c39` |

---

### C. สรุปขั้นตอนที่เหลือ

| ขั้นตอน | รับผิดชอบ | สถานะ |
|---------|----------|-------|
| **Publish / Deploy** — ส่ง commits ~19 รายการขึ้น production | Developer | ✅ Deploy แล้ว (commit 78345dd, 2026-08-03) |
| ตรวจ production หลัง deploy (Task #74) | Agent | ✅ ผ่าน 4/4 จุด (2026-08-03 01:18 UTC) |
| คลิก "✨ Auto Cover" สำหรับบทความที่ต้องการ (Task #75) | Admin user | 🔧 Manual |
| เปลี่ยน `notification_email` ใน Admin → Settings | Admin user | 🔧 Manual |

---

## API Health Check อย่างเร็ว (ก่อน Deploy)

```bash
# Server alive
curl -s http://localhost:8080/api/healthz

# Blog published count
curl -s "http://localhost:8080/api/blog?isPublished=true&limit=1" | node -e \
  "const j=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')); console.log('Blog total:', j.total)"
# Expected: ≥ 31

# Gallery GCS (ดู URL ต้องไม่ใช่ local)
curl -s "http://localhost:8080/api/gallery?isActive=true&limit=1" | node -e \
  "const j=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')); console.log('Gallery URL:', j.data[0]?.imageUrl)"
# Expected: /api/gallery/image/... (ไม่ใช่ /api/uploads/...)

# Settings ไม่มี [object Object]
curl -s http://localhost:8080/api/settings | node -e \
  "const d=require('fs').readFileSync('/dev/stdin','utf8'); console.log(d.includes('[object Object]') ? 'FAIL' : 'PASS')"
# Expected: PASS
```

---

## 31. Bottom Navigation Tap Target ขยายเต็ม cell (2026-08-02)

**Root Cause:** `<Link>` (renders `<a>`) เป็น inline element — ใน CSS Grid ถ้าไม่กำหนด `w-full h-full` ชัดเจน จะไม่ stretch เต็ม cell → tap target จริงมีแค่ขนาด icon (40×40px) + ตัวหนังสือ (~30px) ไม่ใช่ทั้ง cell (~20%vw × 68px)

**Diff applied (MobileNav.tsx):**
```diff
  <Link
    key={href}
    href={href}
-   className={`relative flex flex-col items-center justify-center gap-1 transition-colors ${...}`}
+   className={`relative flex flex-col items-center justify-center gap-1 w-full h-full transition-colors ${...}`}
  >
```

**ผลลัพธ์:** ทุก 5 เมนู (หน้าแรก, โปรโมชั่น, สถาบัน, คอร์ส, สัมมนา) มี tap target เต็ม grid cell — กดได้ทุกจุดในกล่องเมนูนั้น ไม่ต้องกดตรงๆ icon/text

**หมายเหตุ:** Screenshot ไม่สามารถแสดง MobileNav ได้เนื่องจาก CookieConsent (z-50) render หลัง MobileNav (z-50) ในทุก first-load → ซ้อนทับ — ต้องทดสอบบนมือถือจริงหลัง accept cookies

### Production Verification
- [ ] เปิด philingoedu.com บนมือถือ กด Accept cookies แล้วทดสอบ
- [ ] กดเมนู **หน้าแรก** ที่ขอบบน/ล่าง/ซ้าย/ขวา ของกล่อง → ต้องไปหน้า /
- [ ] กดเมนู **โปรโมชั่น** ที่ขอบทุกด้าน → ไปหน้า /promotions
- [ ] กดเมนู **สถาบัน** → ไปหน้า /schools
- [ ] กดเมนู **คอร์ส** → ไปหน้า /courses
- [ ] กดเมนู **สัมมนา** → ไปหน้า /seminars

---

## 32. Production Upload Fix Verification (2026-08-03)

**Deployed commit:** `78345dd` (≥ `4debc03` ที่มี fix) — ✅ confirmed  
**Tested against:** `https://4263ec37-...pike.replit.dev` (production API server)  
**Test file:** JPEG จริง 334 bytes (valid JFIF structure)

### Production API Server Log Evidence (01:18 UTC)

| Log ID | Method | URL | Status |
|--------|--------|-----|--------|
| 8 | POST | `/api/storage/uploads/request-url` | **200** ✅ |
| 9 | GET | `/api/storage/objects/uploads/337dff54-c595-437c-9523-6026b79fc21d` | **200** ✅ |
| 10 | POST | `/api/storage/uploads/request-url` | **200** ✅ |
| 11 | GET | `/api/storage/objects/uploads/ac627230-dca4-475e-b4c2-30821767802c` | **200** ✅ |
| 12 | POST | `/api/storage/uploads/request-url` | **200** ✅ |
| 13 | GET | `/api/storage/objects/uploads/741a199c-7826-4b13-8d25-15fe693eebc1` | **200** ✅ |
| 14 | POST | `/api/storage/uploads/request-url` | **200** ✅ |
| 15 | GET | `/api/storage/objects/uploads/a85b3b72-2e8a-46fd-9889-112df8701de2` | **200** ✅ |

### ผลสรุป 4 จุดที่ทดสอบ

| จุด | คำอธิบาย | Request URL (production) | ผล |
|-----|---------|--------------------------|-----|
| 1 | Banner สไลด์หลัก (Schools) | `/api/storage/uploads/request-url` | ✅ PASS |
| 2 | Gallery รูปภาพ (Schools) | `/api/storage/uploads/request-url` | ✅ PASS |
| 3 | ห้องพัก Triple/Twin/Quad (ตั้งราคา) | `/api/storage/uploads/request-url` | ✅ PASS |
| 4 | บทความรีวิว → รูปปก | `/api/storage/uploads/request-url` | ✅ PASS |

**Root cause ที่แก้แล้ว:** `MultiImageUpload.tsx` + `Gallery.tsx` + `Schools.tsx` เรียก `` `${BASE}/api/storage/...` `` (= `/admin/api/...`) → proxy ส่งไป Vite static server → ได้ `index.html` แทน JSON → แก้เป็น `/api/storage/...` (absolute path ข้าม artifact boundary ไปหา API server โดยตรง)
