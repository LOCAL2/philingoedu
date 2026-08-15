# Regression Test Checklist — Responsive Design Audit
_แก้ไขล่าสุด: 31 กรกฎาคม 2026 (session 2)_

## ขอบเขตการแก้ไข
เฉพาะ CSS/className/style ที่เกี่ยวกับ responsive เท่านั้น — ไม่แตะ logic, API call, หรือฟังก์ชัน

---

## ✅ รายการที่แก้ไขแล้ว

### 1. `src/index.css` — เพิ่ม overflow-x: hidden บน body
- **ปัญหา:** ไม่มี global protection ป้องกัน horizontal scroll บนมือถือ
- **แก้:** เพิ่ม `overflow-x: hidden;` ใน `body {}` block
- **บรรทัด:** 167
- **ทดสอบ:** เปิดทุกหน้าบนมือถือ 320px — ต้องไม่มี horizontal scroll

### 2. `src/pages/WhyPhilippines.tsx` — ลด fixed height รูปภาพ 3 จุด
- **ปัญหา:** `h-[400px]` บนมือถือ 320px สูงถึง 125% ของ viewport
- **แก้:** `h-[400px]` → `h-[220px] md:h-[400px]` ทั้ง 3 รูป (Cebu, Baguio, Manila)
- **บรรทัด:** 81, 88, 125
- **ทดสอบ:** เปิดหน้า /why-philippines บนมือถือ — รูปต้องมีขนาดพอดี ไม่ล้น

### 3. `src/pages/CityPage.tsx` — ลด hero height บนมือถือ
- **ปัญหา:** `h-[420px]` บนมือถือ 320px สูงถึง ~130% ของ viewport
- **แก้:** `h-[420px] md:h-[500px]` → `h-[260px] md:h-[420px] lg:h-[500px]`
- **บรรทัด:** 242
- **ทดสอบ:** เปิดหน้าเมืองบนมือถือ — hero image ต้องไม่สูงเกิน viewport

### 4. `src/pages/Blog.tsx` — เพิ่ม loading="lazy" บนรูปบทความ
- **ปัญหา:** รูปทุกรูปโหลดพร้อมกันทันที — กระทบ performance
- **แก้:** เพิ่ม `loading="lazy"` บน 2 img tags (featured + card grid)
- **บรรทัด:** 62, 98
- **ทดสอบ:** เปิด Network tab — รูป card ต้องโหลดเมื่อ scroll ใกล้ถึงเท่านั้น

### 5. `src/pages/Reviews.tsx` — เพิ่ม loading="lazy" บนรูป review card
- **ปัญหา:** รูป cover ทุก review card โหลดพร้อมกันทันที
- **แก้:** เพิ่ม `loading="lazy"` บน img tag ใน review card
- **บรรทัด:** 167
- **ทดสอบ:** เปิด Network tab — รูป card ต้องโหลดเมื่อ scroll ใกล้ถึง

### 6. `src/pages/Home.tsx` — เพิ่ม loading="lazy" + ปรับ alt text ของ gallery
- **ปัญหา:** (a) รูป below-fold โหลดทันที, (b) gallery images มี alt="Gallery" ทั้ง 6 รูป
- **แก้:**
  - เพิ่ม `loading="lazy"` บน: banner image, seminar banner fallback, reviewer photos, gallery images (6 รูป)
  - ปรับ alt text gallery ทุกรูปให้เป็นคำอธิบายภาษาไทยที่เหมาะสม
- **บรรทัด:** 361 (banner), 369 (fallback), 577 (reviewer), 639-644 (gallery)
- **ทดสอบ:** Screen reader ต้องอ่าน alt text ที่มีความหมาย / Network tab ต้องแสดง lazy load

### 7. `src/components/SchoolCarousel.tsx` — แก้ alt="" บน school logo
- **ปัญหา:** `alt=""` บน logo badge ใน carousel card ทำให้ screen reader ข้ามรูปไปเลย
- **แก้:** `alt=""` → `alt={school.nameTh || school.name}` + เพิ่ม `loading="lazy"`
- **บรรทัด:** 185
- **ทดสอบ:** Screen reader ต้องอ่านชื่อโรงเรียนเมื่อ focus บน logo

### 8. `src/components/RoomTypeTabs.tsx` — แก้ alt="" บน thumbnail strip
- **ปัญหา:** `alt=""` บน thumbnail ห้องพัก — screen reader ไม่รู้ว่าเป็นรูปอะไร
- **แก้:** `alt=""` → `` alt={`รูป${room.nameTh} ${i + 1}`} `` + เพิ่ม `loading="lazy"`
- **บรรทัด:** 125
- **ทดสอบ:** Screen reader ต้องอ่าน "รูปห้อง [ชื่อห้อง] 1, 2, 3..."

### 9. `index.html` — ลบ maximum-scale=1 จาก viewport meta
- **ปัญหา:** `maximum-scale=1` ล็อคการ zoom ทำให้ Chrome บนมือถือเลือก/อ่านข้อความไทยไม่ได้
- **แก้:** ลบ `, maximum-scale=1` ออก → `content="width=device-width, initial-scale=1.0"`
- **บรรทัด:** 5
- **ทดสอบ:** เปิด Chrome มือถือ → กด-ค้างที่ข้อความ ต้องเลือกได้ปกติ, zoom เข้าออกได้

### 10. `src/pages/Activities.tsx` — แสดงโลโก้โรงเรียนจริงในส่วน "6 สถาบัน" แทนวงกลมตัวอักษร
- **ปัญหา:** การ์ดโรงเรียนใน grid แสดง fallback circle (Q, C, I, B, C, P) บนทุกขนาดจอ เพราะไม่มี logo import
- **แก้:** import `qqLogo`, `ciaLogo`, `cpilsLogo`, `philinterLogo`, `bcebuLogo` จาก `@assets/` และ map ลงใน `FAIR_SCHOOLS[]` — อัพเดท card render ให้แสดง `<img>` เมื่อมี logo
- **บรรทัด:** 9–13 (imports), 16–23 (FAIR_SCHOOLS), 315–320 (card render)
- **ทดสอบ:** เปิด /activities บน 375px และ 390px — ต้องเห็นโลโก้จริงของ QQ English, CIA, B'Cebu, CPILS, Philinter (I.BREEZE ยังเป็น fallback เนื่องจากยังไม่มีไฟล์โลโก้)

### 11. `src/pages/Seminars.tsx` — แสดง banner image เต็มภาพบน mobile
- **ปัญหา:** overlay (`absolute bottom-0`) ทับบนรูป banner ซึ่งสูงแค่ ~208px บน mobile → เห็นรูปแค่ ~60px มือถือไม่ตรงกับ desktop
- **แก้:** เปลี่ยน overlay จาก `absolute bottom-0 left-0 right-0` → `md:absolute md:bottom-0 md:left-0 md:right-0` — บน mobile ไหลต่อใต้รูปตามปกติ, md+ ยังคง overlay ที่ bottom ของรูป
- **บรรทัด:** 223
- **ทดสอบ:** /seminars บน 390px — ต้องเห็นรูป fair banner เต็มภาพ countdown bar อยู่ใต้รูป

### 12. `src/pages/Home.tsx` — รูปห้องเรียน hero แสดงก่อน text บน mobile
- **ปัญหา:** รูปห้องเรียน (order-2) อยู่ใต้ text block บน mobile → ต้องเลื่อนลงถึงจะเห็น ไม่ตรงกับ desktop ที่เห็นทั้งคู่พร้อมกัน
- **แก้:** เปลี่ยน `order-2 lg:order-2` → `order-first lg:order-2` + `mt-6` → `mt-0` — รูปขึ้นมาก่อน text บน mobile, desktop ยังคง 2-column เดิม
- **บรรทัด:** 268
- **ทดสอบ:** / บน 390px — ต้องเห็นรูปห้องเรียน + Visa Approved badge ทันทีก่อนข้อความ

---

## ❌ ไม่แก้ (เจตนา)

| ไฟล์ | เหตุผลที่ไม่แก้ |
|------|----------------|
| `Navbar.tsx` — `w-[640px]` dropdown | อยู่ใน `hidden lg:flex` → ซ่อนบนมือถือแล้ว ✅ |
| `Layout.tsx` — `overflow-hidden` on `<main>` | ป้องกัน horizontal scroll อยู่แล้ว ✅ |
| `MobileNav.tsx` — `h-[68px]` | ตั้งใจ: fixed height สำหรับ bottom nav ✅ |
| `Contact.tsx` — `h-[300px]` | ตั้งใจ: สำหรับ map container ✅ |
| `Seminars.tsx` L211 hero banner | Hero image (above-fold) — ห้ามใส่ lazy หรือ LCP จะช้า ✅ |
| `Activities.tsx` L286 hero banner | Hero image (above-fold) — ห้ามใส่ lazy หรือ LCP จะช้า ✅ |
| `PostDetail.tsx` L205 cover image | Hero image (above-fold) — ห้ามใส่ lazy หรือ LCP จะช้า ✅ |
| `components/ui/*.tsx` (shadcn) | Library components — ห้ามแตะ ✅ |

---

## วิธีทดสอบ Regression

1. **Desktop (≥1280px):** เปิดทุกหน้า — layout ต้องเหมือนเดิม ไม่มีอะไรพัง
2. **Tablet (768–1024px):** ตรวจ hero heights และ grid layout
3. **Mobile 375px:** ตรวจ overflow-x, image heights, touch targets
4. **Mobile 320px:** ตรวจ WhyPhilippines + CityPage hero — ต้องไม่ overflow viewport

---

## หน้าที่ยังไม่มีปัญหา (ไม่แตะ)
About, FAQ, Courses, Services, Seminars, Activities, Schools, SchoolDetail, Register, ThankYou, PostDetail, Promotions, not-found
