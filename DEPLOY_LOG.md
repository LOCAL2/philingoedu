# DEPLOY LOG — Philingo

> **กฎ**: ห้าม deploy โดยไม่บันทึกลงไฟล์นี้ก่อน  
> ทุก deploy ต้องมี: วันที่ · ไฟล์ที่เปลี่ยน · สรุป · checklist · commit hash

---

## Deploy #4 — 2026-08-02 04:44 UTC (commit `67141f1`)

**ไฟล์ที่เปลี่ยน:**
- `artifacts/philingo/src/pages/Seminars.tsx` — hero overlay mobile fix + why attend 2-col grid + compact countdown/pills

**สรุป:** แก้ hero overlay สัมมนาบน mobile 320-390px และ redirect /activities→/seminars

**Pre-deploy checklist:** ผ่านบางส่วน (ไม่มีบันทึกชัดเจน)

---

## Deploy #3 — 2026-08-01 00:59 UTC (commit `d3e1fed`)

**ไฟล์ที่เปลี่ยน:** per-school SEO fields, settings save fix, QuotationModal, FloatingButtons, SchoolDetail

**สรุป:** เพิ่ม SEO per-school, แก้ settings save, fix FloatingButtons LINE URL

---

## Deploy #2 — 2026-07-31 15:29 UTC (commit `16c18a8`)

**ไฟล์ที่เปลี่ยน:** mobile layout fixes (facilities, price overflow, floating buttons)

---

## Deploy #1 — 2026-07-30 (commits `fd7cc3c`, `282f6f9`)

**สรุป:** Initial deploy

---

## Deploy #6 — ⏳ พร้อม deploy (commit HEAD `b92f94a`, 2026-08-02 11:58 UTC)

**Commits ที่ยังไม่อยู่ใน production (หลัง deploy #5):**

| Commit | ไฟล์หลัก | สรุป |
|--------|-----------|------|
| `0f07243` | admin/Blog.tsx, api-server/blog.ts, lib/db/schema/blog.ts | Blog editor: AI content writer + Gallery picker + auto SEO + seoKeywords column |
| `ce60afa` | api-server/blog.ts, philingo/PostDetail.tsx | 22 SEO meta tags ต่อบทความ + mdToHtml + FAQPage JSON-LD |
| `1f8db1d` | admin/Reviews.tsx | Reviews: AI SEO button + Gallery picker + แก้ placeholder (ไม่ใช่ CIA hardcoded) |
| `78eac3f` | admin/Reviews.tsx, admin/Schools.tsx | AI content writer ใน Reviews + AI SEO button ใน Schools |
| `a4a8faa` | (DB data only) | สร้าง 15 บทความภาษาไทยใหม่ (id 27-41) ผ่าน AI |
| `7f0af35` | admin/Reviews.tsx | fix: seoKeywords ใน ReviewPost interface + ลบ `as any` cast |
| `b92f94a` | philingo/Seminars.tsx | 🔴 fix: hero สัมมนา collapse บน desktop (md:min-h-0 → md:min-h-[520px]) |

**สรุป:** Blog/Reviews/Schools AI features + full SEO meta tags + mdToHtml + 15 Thai articles + **hero สัมมนา desktop fix**

---

### Pre-Deploy Checklist — ผลตรวจ 2026-08-02

| # | รายการ | ผล | หมายเหตุ |
|---|--------|-----|----------|
| 1 | Banner หน้าแรกคลิกได้ | ✅ | screenshot ยืนยัน hero banner แสดงถูกต้อง 390px |
| 2 | Hero overlay สัมมนา 320-390px | ✅ | screenshot 375px overlay text + countdown แสดงครบ |
| 3 | /activities redirect → /seminars | ✅ | code: `<Navigate to="/seminars">` ใน App.tsx |
| 4 | School detail page (/schools/cia) | ✅ | แสดง CIA logo, tags, rating ถูกต้อง |
| 5 | Dropdown แผนเรียน/ห้องพัก/ระยะเวลา | ⚠️ | ทดสอบได้เฉพาะ screenshot — ต้องทดสอบ interactive |
| 6 | ตารางราคา/ตารางเรียน scroll ได้ | ⚠️ | ไม่ได้ทดสอบ scroll — ต้อง manual test |
| 7 | ราคาประเมิน ไม่ล้นขวาจอมือถือ | ⚠️ | ไม่ได้ทดสอบ Quotation Modal |
| 8 | ปุ่มลอย LINE/Messenger/TikTok | ⚠️ | ไม่เห็นใน screenshot (หลังปิด cookie banner) |
| 9 | ระบบภาษา TH/EN จำค่า localStorage | ✅ | toggle ปรากฏทุกหน้า |
| 10 | จำนวนรีวิวตรง Admin Panel | ✅ | blog category=review: 10 รีวิว, ทั้งหมด published |
| 11 | SEO per-school บันทึกและแสดงถูกต้อง | ❌ | schools ทั้ง 44 ยังไม่มี seoTitle ใน DB (กรอกผ่าน admin ยังไม่ได้ทำ) |
| 12 | SEO Global ไม่เป็น [object Object] | ✅ | settings.seo_title = "Philingo — เรียนภาษาอังกฤษ..." |
| 13 | LINE ทุกจุดชี้ @philingo | ✅ | line_id=@philingo, ไม่มี thaistudyabroad ใน philingo/src |
| 14 | Admin modal title แสดงชื่อสถาบัน | ✅ | fix applied commit `35c027d` |

### ⚠️ ปัญหาพบก่อน deploy

| ปัญหา | ระดับ | วิธีแก้ |
|-------|-------|---------|
| `notification_email` = `info@thaistudyabroad.com` ใน DB | 🔴 สำคัญ | แก้ใน Admin → Settings → อีเมลรับแจ้งเตือนฟอร์ม |
| 16 บทความเก่า (id 1-16) ไม่มี SEO | 🟡 ปานกลาง | task #69 (แปลงบทความเก่า) |
| 44 สถาบัน ไม่มี seoTitle | 🟡 ปานกลาง | task #5 (admin SEO per-school) |
| 31 บทความไม่มีรูปปก | 🟡 ปานกลาง | task #68 (เพิ่มรูปปก) |

### สถานะ production vs โค้ดล่าสุด
- Production อยู่ที่ commit `96ca913` (Deploy #5, 2026-08-02 08:02 UTC)
- โค้ดล่าสุด: `a4a8faa` (2026-08-02 09:14 UTC)
- **ตรงกัน ~60%** — Blog/Reviews/Schools AI features และ SEO 22 tags ยังไม่อยู่ใน production
- 15 บทความใหม่ **อยู่ใน DB แล้ว** (DB ไม่ reset เมื่อ deploy → บทความไม่หาย)

---

## Deploy #5 — 2026-08-02 08:xx UTC (commit `96ca913`) ⏳ รอ deploy

**ไฟล์ที่เปลี่ยน (ทั้งหมดจาก deploy #4 ถึงปัจจุบัน):**
- `artifacts/api-server/src/routes/gallery.ts` — POST /fetch-url route
- `artifacts/admin/src/pages/Gallery.tsx` — FetchFromUrlPanel UI
- `artifacts/philingo/src/lib/api.ts` — galleryApi + GalleryImage type
- `artifacts/philingo/src/pages/Home.tsx` — GallerySection (API + fallback)
- `artifacts/philingo/src/pages/Seminars.tsx` — mobile overlay fix
- `artifacts/api-server/src/routes/settings.ts` — [object Object] fix
- `artifacts/admin/src/pages/Schools.tsx` — modal title undefined fix
- `artifacts/philingo/src/components/QuotationModal.tsx` — logo + URL fix
- `artifacts/philingo/src/components/CourseTimetable.tsx` — legend layout fix
- `artifacts/api-server/src/lib/email.ts` + routes — @philingoedu.com
- `artifacts/philingo/index.html` + `App.tsx` + `use-seo-meta.ts` — SEO from DB

**สรุป:** Gallery fetch-from-URL + frontend live + fallback + mobile fixes + SEO fix + email domain fix

**Pre-deploy checklist:**
- [x] Banner คลิกได้, /activities redirect ✅
- [x] LINE → @philingo ทุกจุด ✅  
- [x] SEO Global ไม่ [object Object] ✅
- [x] Admin modal title ✅
- [x] Gallery fetch-URL tested (4 test cases) ✅
- [x] Gallery fallback เมื่อ DB ว่าง ✅

---

## ⏳ PENDING DEPLOY — ยังไม่ได้ deploy (หลัง commit `67141f1`)

**วันที่รอ deploy:** 2026-08-02 (ตั้งแต่ 05:07–06:49 UTC)

| Commit | ไฟล์ | สรุป |
|--------|------|------|
| `3c64b24` | Seminars.tsx | fix seminar hero overlay absolute + Why Attend 2-col 360px |
| `1a38e79` | App.tsx, Seminars.tsx | redirect /activities→/seminars; delete Activities.tsx |
| `f910c2a` | Seminars.tsx | compact overlay mobile <640px; image ratio 55-66% |
| `1ac05b0` | CourseTimetable.tsx | legend flex-row on sm+ |
| `5c9df93` | SchoolDetail.tsx | promo CTA above price calculator on mobile |
| `ac2bb2b` | QuotationModal.tsx | quotation PDF: logo image + www.philingoedu.com |
| `35c027d` | admin/Schools.tsx | admin modal title: 'undefined' → school.name |
| `e4247c1` | api-server/settings.ts | fix [object Object] in settings save |
| `eae03cb` | App.tsx, use-seo-meta.ts, Home.tsx | wire seo_title/seo_description from DB to frontend |
| `9ad9b6c` | email.ts, contacts.ts, forms.ts, index.html | replace thaistudyabroad → philingoedu.com |

**Pre-deploy checklist ณ วันนี้:** ดู section ด้านล่าง

### Checklist ก่อน deploy รอบถัดไป

- [x] Banner หน้าแรกคลิกได้ (pointer-events-none on overlay)
- [x] /activities redirect ไป /seminars (App.tsx บรรทัด 47)
- [x] ปุ่มลอย LINE ดึงจาก settings.line_url
- [x] ระบบภาษา TH/EN จำค่าใน localStorage('philingo_lang')
- [x] SEO Global ไม่เป็น [object Object]
- [x] ปุ่ม LINE ทุกจุดชี้ไป @philingo
- [x] Admin modal title แสดงชื่อสถาบัน (ไม่ใช่ undefined)
- [ ] Hero overlay สัมมนา 320-390px — แก้แล้วในโค้ด ยังไม่ deploy
- [ ] SEO per-school — แก้แล้วในโค้ด ยังไม่ deploy
- [ ] ตารางราคา/ตารางเรียนรายวัน scroll ได้ — ยังไม่ได้ทดสอบ
- [ ] ราคาประเมิน/โปรโมชั่น ไม่ล้นขวาจอมือถือ — แก้แล้วในโค้ด ยังไม่ deploy
- [ ] จำนวนรีวิวตรงกับ Admin Panel — ยังไม่ได้ทดสอบ
