---
name: Philingo Project Rules
description: Governance rules from PROJECT_RULES_รวม.md (v2) — must follow before every code change
---

# Philingo Project Rules (PROJECT_RULES_รวม.md — v2, 9 หมวด)

**Why:** User uploaded authoritative rules file that must govern all AI work in this project.

## How to apply (before every task):
1. อ่านกฎนี้ก่อนเสมอ
2. ระบุไฟล์ที่จะแก้ + บรรทัด/ฟังก์ชัน + ผลกระทบ → รอ confirm ก่อน apply
3. หลังแก้: สรุป diff ให้ตรวจสอบได้
4. เทสบนจอ 375px (iPhone SE) และ 390px (iPhone ทั่วไป)
5. commit → บันทึก REGRESSION_TEST_CHECKLIST.md

---

## หมวด 1 — Code integrity
- แก้เฉพาะไฟล์/บรรทัดที่เกี่ยวกับงานที่สั่ง ห้ามแตะส่วนอื่น
- ห้ามแก้หลายไฟล์ใหญ่พร้อมกันในคำสั่งเดียว (แตกเป็นสเต็ปเล็กๆ)
- ห้าม generate ไฟล์ใหม่ทั้งไฟล์ ถ้าแก้แค่บางส่วนได้ให้แก้เฉพาะจุด
- commit หลังแต่ละจุดที่เทสผ่าน ก่อนไปจุดถัดไป

## หมวด 2 — i18n / locale files
- ห้ามแตะไฟล์ locale เว้นแต่สั่งโดยตรง
- backup ก่อนแก้ locale ทุกครั้ง; commit locale แยก ก่อนแตะไฟล์อื่น

## หมวด 3 — Responsive Design
- Mobile-first; ใช้ %, rem, flex, grid แทน px ตายตัว
- meta viewport: `width=device-width, initial-scale=1.0` เท่านั้น → **ห้ามใส่ maximum-scale=1**
- Breakpoints: 320-480 / 481-767 / 768-1024 / 1025+
- Touch targets ≥ 44×44px; ห้าม horizontal scroll ทั้งหน้า
- รองรับ Chrome / Safari iOS / Edge

## หมวด 4 — SEO
- ทุกหน้า: `<title>` + `<meta description>` + OG tags
- h1 หนึ่งตัวต่อหน้า → h2, h3 ตามลำดับ
- alt text ทุกรูป; sitemap.xml + robots.txt; structured data

## หมวด 5 — Data persistence
- ห้าม in-memory store; แจ้งก่อน restart server พร้อมระบุสิ่งที่กระทบ

## หมวด 6 — Dropdown (แผนเรียน / ห้องพัก / ระยะเวลา) ⚠️ ใหม่
- ตัวเลือก "แผนการเรียน", "ห้องพัก", "ระยะเวลา" ต้องเป็น `<select>` หรือ dropdown component เท่านั้น
- **ห้ามเปลี่ยนเป็น button row / pill แถวแนวนอน เด็ดขาด**
- dropdown ต้องกว้างเต็ม container, สูงอย่างน้อย 44px
- ก่อนแก้ code ใกล้ๆ component นี้ ให้เช็คก่อนว่าไม่กระทบ dropdown

## หมวด 7 — Floating Buttons (LINE, Messenger, TikTok, โทร, Scroll-to-top) ⚠️ ใหม่
- ห้ามปุ่มลอยแสดงพร้อมกันจนบังเนื้อหาสำคัญ (ตารางราคา, ปุ่ม action หลัก)
- ให้ยุบเป็น FAB เดียวกดแล้วขยาย หรือจัดตำแหน่งไม่ทับเนื้อหา
- เช็คทุกครั้งว่าไม่บังเนื้อหาบน 320px–375px
- ห้ามลบฟังก์ชันปุ่มลอยออกโดยไม่ได้รับอนุญาต

## หมวด 8 — ตารางกว้างเกินจอ ⚠️ ใหม่
- ตารางทุกตัวต้องห่อด้วย container ที่มี `overflow-x: auto`
- ต้องมี indicator (เช่น เงาด้านขวา) บอกว่า scroll ได้
- ถ้าซับซ้อนเกินไปสำหรับมือถือ พิจารณาเปลี่ยนเป็น card layout
- ห้ามปล่อยให้ตารางดัน width ทั้งหน้าเกิน 100vw

## หมวด 9 — Task Completion Rules ⚠️ บังคับทุก task ที่ Accept
กฎ 4 ข้อนี้บังคับก่อนถือว่างานเสร็จ:

1. **ห้ามลบไฟล์ static เดิมทันที** — ต้อง archive/rename ก่อนเสมอ (เช่น `foo.ts` → `foo.archived.ts`) ห้าม `rm` โดยไม่มี backup
2. **แสดง diff ก่อน apply** — ก่อน edit ทุกครั้งต้องแสดง: ไฟล์ที่จะแก้, บรรทัดที่เปลี่ยน, สิ่งที่ลบ vs เพิ่ม → รอผู้ใช้ confirm หรือบอกชัดว่า "นี่คือ diff ที่จะ apply"
3. **ทดสอบจริงบน production หลัง deploy** — screenshot หรือ curl production URL ยืนยันว่า fix ทำงานจริง ก่อนถือว่างานเสร็จ
4. **บันทึกผลลง REGRESSION_TEST_CHECKLIST.md** — ทุก fix/feature ต้องมี entry พร้อม: วันที่, commit hash, วิธีทดสอบ, ผลที่คาดหวัง

**Why:** ผู้ใช้ต้องการ traceability และความมั่นใจว่าของเดิมไม่หายก่อนของใหม่พิสูจน์ตัวเอง

**How to apply:** เช็ค 4 ข้อนี้เป็น checklist ก่อนตอบว่างานเสร็จทุกครั้ง
