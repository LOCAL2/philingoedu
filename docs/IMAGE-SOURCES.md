# Philingo — ไฟล์รูปภาพที่เรียกจากใน project

> เอกสารนี้รวบรวม **ไฟล์รูปภาพทั้งหมดที่ถูก import / เรียกจากโค้ดใน project**
> (เฉพาะไฟล์ที่อยู่ใน repo — ไม่รวม GCS, API, และ URL ภายนอก)
> เพื่อนำไปใช้กับโปรเจกต์ใหม่โดยเรียกภาพจากแหล่งเดียวกัน

---

## 1. ภาพรวม

รูปใน project มี 3 กลุ่ม:

| กลุ่ม | ตำแหน่งไฟล์ | วิธีเสิร์ฟ | URL ที่ได้ |
|---|---|---|---|
| A. Import ผ่าน alias `@assets/` | `attached_assets/` | Vite bundle (hash ต่อท้าย) | `/assets/<ชื่อ>-<hash>.<ext>` |
| B. Import ผ่าน alias `@/assets/` | `artifacts/philingo/src/assets/` | Vite bundle (hash ต่อท้าย) | `/assets/<ชื่อ>-<hash>.<ext>` |
| C. Static ใน `public/` | `artifacts/philingo/public/` | express.static (copy ตรง) | `/` + ชื่อไฟล์ |

---

## 2. กลุ่ม A — ไฟล์ใน `attached_assets/` (import ด้วย `@assets/`)

Alias ตั้งไว้ที่ `artifacts/philingo/vite.config.ts:48` → หลัง build จะอยู่ที่ `/assets/*`

| ไฟล์ต้นทาง | ไฟล์ที่เสิร์ฟ (build ล่าสุด) | ถูกเรียกจาก |
|---|---|---|
| `generated_images/campus-1.jpg` | `campus-1-BLtyAiDL.jpg` | Home.tsx:78, schoolsCebu2.ts:1, schoolsBaguio2.ts:1, schoolsOther.ts:1, SchoolDetail.tsx:67, Promotions.tsx:10, schoolsMeta.ts:7 |
| `generated_images/classroom-1.jpg` | `classroom-1-C-77C-PN.jpg` | schoolsCebu2.ts:2, schoolsBaguio2.ts:2, schoolsOther.ts:2, SchoolDetail.tsx:68, Promotions.tsx:10 |
| `generated_images/cebu-1.jpg` | `cebu-1-2s_UpKFQ.jpg` | Home.tsx:77, schoolsCebu2.ts:3, schoolsOther.ts:5, SchoolDetail.tsx:69, WhyPhilippines.tsx:8, Promotions.tsx:8, schoolsMeta.ts:8 |
| `generated_images/baguio-1.jpg` | `baguio-1-T7M9N931.jpg` | schoolsBaguio2.ts:3, SchoolDetail.tsx:70, WhyPhilippines.tsx:9, schoolsMeta.ts:9 |
| `generated_images/manila-1.jpg` | `manila-1-Bfj1byEu.jpg` | WhyPhilippines.tsx:10 |
| `generated_images/blog-1.jpg` | `blog-1-B4YNmaix.jpg` | posts.ts:2 (dead code), Home.tsx:80 |
| `generated_images/blog-2.jpg` | `blog-2-DKZMVCE6.jpg` | posts.ts:3 (dead code), Home.tsx:81 |
| `generated_images/blog-3.jpg` | `blog-3-BAM1MiBQ.jpg` | posts.ts:4 (dead code), Home.tsx:82 |
| `review-1.jpg` | — (ไม่มีใน build) | posts.ts:5 — dead code |
| `review-2.jpg` | — (ไม่มีใน build) | posts.ts:6 — dead code |
| `review-3.jpg` | — (ไม่มีใน build) | posts.ts:7 — dead code |
| `review-4.jpg` | — (ไม่มีใน build) | posts.ts:8 — dead code |
| `review-5.jpg` | — (ไม่มีใน build) | posts.ts:9 — dead code |
| `review-6.jpg` | — (ไม่มีใน build) | posts.ts:10 — dead code |

> หมายเหตุ: `posts.ts` / `posts.archived.ts` ไม่ถูก import จากโค้ดไหนอีกแล้ว (dead code) — ใช้ข้อมูลจาก API `/api/blog` แทน
> แต่ `blog-1~3.jpg` ยังถูกใช้จริงจาก Home.tsx:80-82
| `f798a378-eb90-40b3-8d5e-72231d967e0c_1785171375147.png` (heroImg) | `f798a378-...-DddEMZo_.png` | Home.tsx:76, schoolsCebu2.ts:4, schoolsBaguio2.ts:4, schoolsOther.ts:3, SchoolDetail.tsx:71, About.tsx(ใช้ตัวอื่น) |
| `ee6abb87-5291-4391-a40c-0b39c0c6777e_1785171375148.png` (marketing1) | `ee6abb87-...-S4k3VvV1.png` | About.tsx:7, schoolsCebu2.ts:5, schoolsBaguio2.ts:5, schoolsOther.ts:4, SchoolDetail.tsx:72 |
| `city-photos/cebu.jpg` | `cebu-CFTba5KX.jpg` | CityPage.tsx:11, Schools.tsx:7, schoolsCebu2.ts:6, SchoolDetail.tsx:74 |
| `city-photos/baguio.jpg` | `baguio-ChY69xon.jpg` | CityPage.tsx:12, Schools.tsx:8 |
| `city-photos/clark.jpg` | `clark-BeAeWnT3.jpg` | CityPage.tsx:13, Schools.tsx:9 |
| `city-photos/manila.jpg` | `manila-CiwBKZzy.jpg` | CityPage.tsx:14, Schools.tsx:10 |
| `city-photos/iloilo.jpg` | `iloilo-CrlUeJ82.jpg` | CityPage.tsx:15, Schools.tsx:11, SchoolDetail.tsx:73 |
| `philingo_logo_transparent.png` | `philingo_logo_transparent-DqEolKxQ.png` | QuotationModal.tsx:3, Navbar.tsx:7, SchoolDetail.tsx:14 |
| `phinlingo_1785171349898.png` | `phinlingo_1785171349898-BCY0GZ2Q.png` | Footer.tsx:6 |
| `room-quad.jpg` | `room-quad-C8XzENVf.jpg` | SchoolDetail.tsx:77 |
| `room-single.jpg` | `room-single-BSu_Ib9H.jpg` | SchoolDetail.tsx:80 |
| `room-triple.jpg` | `room-triple-CRqEuasv.jpg` | SchoolDetail.tsx:78 |
| `room-twin.jpg` | `room-twin-CDhVqzmc.jpg` | SchoolDetail.tsx:79 |
| `facility-cafeteria.jpg` | `facility-cafeteria-DUHCrOEz.jpg` | SchoolDetail.tsx:81 |
| `facility-classroom.jpg` | `facility-classroom-CeQNzTFg.jpg` | SchoolDetail.tsx:82 |
| `facility-pool.jpg` | `facility-pool-BvrOf_cm.jpg` | SchoolDetail.tsx:83 |
| `facility-library.jpg` | `facility-library-DfuXjUFL.jpg` | SchoolDetail.tsx:84 |
| `image_1785200695195.png` (โลโก้ EV) | `image_1785200695195-C2twezen.png` | Navbar.tsx:15 |
| `image_1785200711221.png` (โลโก้ CIA) | `image_1785200711221-Ci4Pmwd7.png` | Navbar.tsx:10, Home.tsx:89, SchoolDetail.tsx:87 |
| `image_1785200753254.png` (โลโก้ Philinter) | `image_1785200753254-DmBQjHu-.png` | Navbar.tsx:12, Home.tsx:91, SchoolDetail.tsx:89 |
| `image_1785200772068.png` (โลโก้ QQ English) | `image_1785200772068-RdG36q0R.png` | Navbar.tsx:11, Home.tsx:90, SchoolDetail.tsx:88 |
| `image_1785200802634.png` (โลโก้ CPILS) | `image_1785200802634-Cx8_y5fM.png` | Navbar.tsx:14 |
| `image_1785200917465.png` (โลโก้ B'Cebu) | `image_1785200917465-D5Tc5wwz.png` | Navbar.tsx:13, Home.tsx:92, SchoolDetail.tsx:90 |
| `image_1785227701433.png` (โลโก้ Tieca) | `image_1785227701433-DSfTv9RL.png` | Home.tsx:85 |
| `image_1785230017503.png` (โลโก้ TSAB) | `image_1785230017503-C7WYQVbS.png` | Home.tsx:86 |

---

## 3. กลุ่ม B — ไฟล์ใน `artifacts/philingo/src/assets/` (import ด้วย `@/assets/`)

| ไฟล์ต้นทาง | ไฟล์ที่เสิร์ฟ (build ล่าสุด) | ถูกเรียกจาก |
|---|---|---|
| `src/assets/fair-banner.png` | `fair-banner-DabJs_cj.png` | Home.tsx:84, Seminars.tsx:17 |

---

## 4. กลุ่ม C — ไฟล์ static ใน `artifacts/philingo/public/` (เสิร์ฟที่ `/`)

ถูกคัดลอกตรงไป `dist/public/` และเสิร์ฟด้วย `app.use(express.static(philingoDist))` (`app.ts:124`)

| ไฟล์ | URL | ถูกเรียกจาก |
|---|---|---|
| `favicon.png` | `/favicon.png` | index.html:35-36 (tab icon + apple-touch-icon) |
| `favicon.svg` | `/favicon.svg` | index.html (สำรอง) |
| `fair-banner.png` | `/fair-banner.png` | (ไฟล์ static — ใช้เป็น banner ผ่าน DB ได้) |
| `fair-banner-2026.png` | `/fair-banner-2026.png` | (ไฟล์ static — ใช้เป็น banner ผ่าน DB ได้) |
| `education-fair-banner.png` | `/education-fair-banner.png` | (ไฟล์ static — ใช้เป็น banner ผ่าน DB ได้) |
| `education-fair-2026.png` | `/education-fair-2026.png` | (ไฟล์ static — ใช้เป็น banner ผ่าน DB ได้) |
| `testimonials/nam-siriporn.webp` | `/testimonials/nam-siriporn.webp` | Seminars.tsx:153 |
| `testimonials/pete-wutichai.webp` | `/testimonials/pete-wutichai.webp` | Seminars.tsx:159 |
| `testimonials/nan-papawi.webp` | `/testimonials/nan-papawi.webp` | Seminars.tsx:165 |

---

## 5. ไฟล์ static ของ Admin

| ไฟล์ | URL | ถูกเรียกจาก |
|---|---|---|
| `artifacts/admin/public/favicon.svg` | `/admin/favicon.svg` | admin/index.html:15 |

---

## 6. วิธีใช้กับโปรเจกต์ใหม่

ต่อ URL กับ origin เดียวกัน (`https://philingo.co.th`):

```
https://philingo.co.th/assets/campus-1-BLtyAiDL.jpg        # กลุ่ม A/B (hash — เปลี่ยนทุก build)
https://philingo.co.th/testimonials/pete-wutichai.webp     # กลุ่ม C (คงที่)
https://philingo.co.th/favicon.png                         # กลุ่ม C
```

**ข้อควรระวัง:**
- ไฟล์กลุ่ม A/B มี hash ต่อท้าย — **URL แตกได้ทุกครั้งที่ rebuild** ต้องเช็คจาก `dist/public/assets/` ล่าสุด
- ไฟล์กลุ่ม C (public/) ไม่มี hash — ใช้ได้ถาวร
- ไฟล์ที่ยังไม่ได้ถูก import ในโค้ด (`fair-banner-2026.png`, `education-fair-*.png`) ยังมีอยู่บน server แต่ถูกอ้างอิงผ่าน DB/Admin เท่านั้น

## 7. ไฟล์โค้ดที่เกี่ยวข้อง

| ไฟล์ | หน้าที่ |
|---|---|
| `artifacts/philingo/vite.config.ts:48` | alias `@assets` → `attached_assets/` |
| `artifacts/philingo/src/assets/fair-banner.png` | banner งานสัมมนา |
| `artifacts/api-server/src/app.ts:124` | เสิร์ฟ static จาก `dist/public` |