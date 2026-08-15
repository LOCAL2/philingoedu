/**
 * Seed placeholder reviews for UI testing.
 * Usage:
 *   # Dev DB (default):
 *   DATABASE_URL="..." tsx artifacts/api-server/scripts/seed-reviews.ts
 *
 *   # Prod DB:
 *   DATABASE_URL="<prod-url>" tsx artifacts/api-server/scripts/seed-reviews.ts
 */
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { blogPostsTable } from '../../lib/db/src/schema/blog.js';
import * as dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

const reviews = [
  {
    slug: 'review-qq-english-cebu',
    title: 'Review QQ English Cebu 8 Weeks — Worth It?',
    titleTh: 'รีวิวเรียน QQ English เซบู 8 สัปดาห์ คุ้มไหม?',
    excerptTh: 'รีวิวจริงจากนักเรียนไทยที่เรียน QQ English เซบู 8 สัปดาห์ พร้อมคะแนน TOEIC ก่อน-หลัง',
    contentTh: '<h2>ทำไมเลือก QQ English?</h2><p>QQ English ดังเรื่องคลาส 1-on-1 และอัตราส่วนครูต่อนักเรียนที่ดีมาก ตอนแรกลังเลระหว่าง QQ กับ CIA แต่สุดท้ายเลือก QQ เพราะราคาที่พักรวมอาหารคุ้มกว่า</p><h2>ห้องพักและสิ่งอำนวยความสะดวก</h2><p>ห้องพัก Standard ขนาดกำลังดี อาหาร 3 มื้อครบ รสชาติโอเค ฟิตเนสใช้ได้ สระว่ายน้ำเปิดช่วงเย็น บรรยากาศเหมือนรีสอร์ทขนาดย่อม</p><h2>ผลลัพธ์หลัง 8 สัปดาห์</h2><p>TOEIC เพิ่มจาก 580 → 730 คะแนน พอใจมาก ครูส่วนใหญ่ใจดีและอธิบายได้ชัดเจน แนะนำสำหรับคนที่ต้องการพัฒนา Business English</p>',
    category: 'review', author: 'Philingo Team', authorTh: 'น้องมิ้ว · QQ English 8 สัปดาห์',
    tags: ['QQ English','TOEIC','Cebu','ESL'], isFeatured: false, isPublished: true, publishedAt: new Date(), views: 0,
  },
  {
    slug: 'review-beci-cebu-12-weeks',
    title: 'Review BECI Cebu 12 Weeks — English for IELTS',
    titleTh: 'รีวิวเรียน BECI เซบู 12 สัปดาห์ เน้น IELTS',
    excerptTh: 'รีวิว BECI เซบู 12 สัปดาห์ โปรแกรมเน้น IELTS คะแนนเพิ่มขึ้นได้จริง',
    contentTh: '<h2>ทำไมเลือก BECI?</h2><p>BECI ขึ้นชื่อเรื่องโปรแกรม IELTS โดยเฉพาะ ขนาดเล็กกะทัดรัด ครูดูแลใกล้ชิด ห้องเรียนไม่แออัด</p><h2>คลาสและตารางเรียน</h2><p>เรียน 8 ชั่วโมง/วัน แบ่งเป็นคลาส 1-on-1 และ Group เน้น Speaking + Writing ซึ่งเป็นจุดอ่อนของคนไทยส่วนใหญ่ มีโค้ชติดตามผลรายสัปดาห์</p><h2>ผลลัพธ์</h2><p>IELTS เพิ่มจาก 5.5 → 6.5 ใน 12 สัปดาห์ เกินเป้าที่ตั้งไว้ ค่าใช้จ่ายรวมที่พักสมเหตุสมผลมาก</p>',
    category: 'review', author: 'Philingo Team', authorTh: 'พี่โอ๊ค · BECI 12 สัปดาห์',
    tags: ['BECI','IELTS','Cebu'], isFeatured: false, isPublished: true, publishedAt: new Date(), views: 0,
  },
  {
    slug: 'review-cpils-cebu-4-weeks',
    title: 'Review CPILS Cebu 4 Weeks — Fast Improvement',
    titleTh: 'รีวิวเรียน CPILS เซบู 4 สัปดาห์ พัฒนาเร็วจริงไหม?',
    excerptTh: 'รีวิว CPILS เซบู 4 สัปดาห์ โปรแกรม Intensive ได้ผลจริงหรือไม่?',
    contentTh: '<h2>ทำไมเลือก CPILS?</h2><p>CPILS มีชื่อเสียงเรื่องโปรแกรม Intensive ที่เข้มข้น เหมาะสำหรับคนที่เวลาจำกัดแต่ต้องการผลลัพธ์เร็ว มีตารางเรียนแน่นถึง 9-10 ชั่วโมง/วัน</p><h2>สภาพแวดล้อม</h2><p>ที่พักสะอาด อาหารอร่อย Wi-Fi เร็ว Library มีหนังสือให้อ่านเยอะ นักเรียนส่วนใหญ่เป็นเกาหลีและญี่ปุ่น บรรยากาศดี</p><h2>ผลลัพธ์ 4 สัปดาห์</h2><p>ฟัง-พูดดีขึ้นเห็นได้ชัด โดยเฉพาะ Listening และ Speaking confidence สำหรับใครที่มีแค่ 1 เดือน CPILS เป็นตัวเลือกที่คุ้มค่ามาก</p>',
    category: 'review', author: 'Philingo Team', authorTh: 'น้องเจน · CPILS 4 สัปดาห์',
    tags: ['CPILS','Intensive','Cebu','Speaking'], isFeatured: false, isPublished: true, publishedAt: new Date(), views: 0,
  },
  {
    slug: 'review-ibreeze-cebu-8-weeks',
    title: 'Review I.BREEZE Cebu 8 Weeks — Hidden Gem?',
    titleTh: 'รีวิวเรียน I.BREEZE เซบู 8 สัปดาห์ สถาบันซ่อนเร้นที่น่าสนใจ',
    excerptTh: 'รีวิว I.BREEZE เซบู 8 สัปดาห์ สถาบันเล็กๆ ที่นักเรียนไทยชื่นชอบ',
    contentTh: '<h2>ทำไมเลือก I.BREEZE?</h2><p>I.BREEZE ไม่ค่อยดังเท่าสถาบันใหญ่ แต่ได้รับคำแนะนำจากรุ่นพี่หลายคน จุดเด่นคือครูเป็นกันเอง บรรยากาศไม่เครียด และนักเรียนไทยเยอะทำให้ปรับตัวง่าย</p><h2>โปรแกรมและครู</h2><p>เรียน 6-8 ชั่วโมง/วัน คลาส Group เล็กมาก (3-5 คน) ครูอธิบายละเอียด ไม่รีบ ดีสำหรับคนที่กลัวพูดภาษาอังกฤษ</p><h2>ผลลัพธ์</h2><p>TOEIC เพิ่มจาก 450 → 620 คะแนน ความมั่นใจในการสนทนาเพิ่มขึ้นมาก ราคาถูกกว่าสถาบันใหญ่ประมาณ 20-30%</p>',
    category: 'review', author: 'Philingo Team', authorTh: 'น้องตาล · I.BREEZE 8 สัปดาห์',
    tags: ['I.BREEZE','TOEIC','Cebu','Beginner'], isFeatured: false, isPublished: true, publishedAt: new Date(), views: 0,
  },
  {
    slug: 'review-smeag-cebu-10-weeks',
    title: 'Review SMEAG Cebu 10 Weeks — Premium School',
    titleTh: 'รีวิวเรียน SMEAG เซบู 10 สัปดาห์ โรงเรียน Premium คุ้มค่าไหม?',
    excerptTh: 'รีวิว SMEAG เซบู 10 สัปดาห์ สถาบันใหญ่ระดับ Premium ราคาสูงแต่ได้อะไรบ้าง?',
    contentTh: '<h2>ทำไมเลือก SMEAG?</h2><p>SMEAG เป็นสถาบันขนาดใหญ่มีนักเรียนหลายร้อยคน สิ่งอำนวยความสะดวกครบครัน มีสระว่ายน้ำ ฟิตเนส ร้านสะดวกซื้อในสถาบัน</p><h2>คลาสและระบบ</h2><p>ระบบจัดการดีมาก มีแอปติดตามความก้าวหน้า คลาส 1-on-1 กับครูฟิลิปปินส์ที่ผ่านการฝึกมาแล้ว Group class แบ่งตาม Level ชัดเจน</p><h2>ผลลัพธ์</h2><p>Grammar และ Writing ดีขึ้นมาก IELTS จาก 6.0 → 6.5 ราคาสูงแต่ได้คุณภาพตามที่จ่าย เหมาะกับคนที่ budget ไม่จำกัด</p>',
    category: 'review', author: 'Philingo Team', authorTh: 'พี่เอิร์ธ · SMEAG 10 สัปดาห์',
    tags: ['SMEAG','IELTS','Cebu','Premium'], isFeatured: true, isPublished: true, publishedAt: new Date(), views: 0,
  },
  {
    slug: 'review-pines-cebu-6-weeks',
    title: 'Review PINES Cebu 6 Weeks — Budget Friendly',
    titleTh: 'รีวิวเรียน PINES เซบู 6 สัปดาห์ ประหยัดแต่ได้ผล?',
    excerptTh: 'รีวิว PINES International เซบู 6 สัปดาห์ ราคาประหยัดแต่คุณภาพดีจริงไหม?',
    contentTh: '<h2>ทำไมเลือก PINES?</h2><p>PINES เป็นตัวเลือกยอดฮิตสำหรับคนที่งบจำกัดแต่อยากได้โปรแกรมดีๆ ราคาต่ำกว่า CIA/SMEAG อย่างเห็นได้ชัด แต่คุณภาพการสอนยังอยู่ในระดับดี</p><h2>บรรยากาศและที่พัก</h2><p>ห้องพักเรียบง่าย สะอาด อาหารครบ 3 มื้อ นักเรียนส่วนใหญ่เป็นเกาหลี ญี่ปุ่น และไทย</p><h2>ผลลัพธ์</h2><p>TOEIC จาก 500 → 650 ใน 6 สัปดาห์ คุ้มค่ามากเมื่อเทียบกับราคา แนะนำสำหรับคนที่ budget ต่ำกว่า 80,000 บาท</p>',
    category: 'review', author: 'Philingo Team', authorTh: 'น้องนิ้ง · PINES 6 สัปดาห์',
    tags: ['PINES','TOEIC','Cebu','Budget'], isFeatured: false, isPublished: true, publishedAt: new Date(), views: 0,
  },
  {
    slug: 'review-philinter-cebu-8-weeks',
    title: 'Review Philinter Academy Cebu 8 Weeks',
    titleTh: 'รีวิวเรียน Philinter เซบู 8 สัปดาห์ สถาบันเก่าแก่ดีแค่ไหน?',
    excerptTh: 'รีวิว Philinter Academy เซบู 8 สัปดาห์ สถาบันเก่าแก่ที่ยังแข็งแกร่งในปี 2025',
    contentTh: '<h2>ทำไมเลือก Philinter?</h2><p>Philinter เป็นหนึ่งในสถาบันเก่าแก่ที่สุดในเซบู ดำเนินการมานานกว่า 30 ปี ชื่อเสียงด้านความน่าเชื่อถือและความสม่ำเสมอในการสอน</p><h2>ระบบการเรียน</h2><p>เรียน 8 ชั่วโมง/วัน มีทั้งคลาส 1-on-1 และ Group ระบบวัดผลรายสัปดาห์ชัดเจน มีการบ้านและ self-study ทุกวัน</p><h2>ผลลัพธ์</h2><p>Grammar แน่นขึ้นมาก Vocabulary เพิ่มขึ้นเห็นได้ชัด Speaking confidence ดีขึ้นจากที่แทบไม่กล้าพูดตอนแรก</p>',
    category: 'review', author: 'Philingo Team', authorTh: 'พี่แนน · Philinter 8 สัปดาห์',
    tags: ['Philinter','Grammar','Cebu','ESL'], isFeatured: false, isPublished: true, publishedAt: new Date(), views: 0,
  },
  {
    slug: 'review-bcebu-6-weeks',
    title: "Review B'Cebu Language School 6 Weeks",
    titleTh: "รีวิวเรียน B'Cebu Language School 6 สัปดาห์",
    excerptTh: "รีวิว B'Cebu Language School 6 สัปดาห์ สถาบันระดับกลางที่คนไทยนิยม",
    contentTh: "<h2>ทำไมเลือก B'Cebu?</h2><p>B'Cebu เป็นสถาบันระดับกลางที่คนไทยแนะนำกันเยอะมาก ราคาไม่แพงเกินไป คุณภาพดี มีบรรยากาศที่อบอุ่น ครูเป็นกันเองกับนักเรียนไทย</p><h2>ห้องเรียนและครู</h2><p>คลาสขนาดเล็ก 1-on-1 กับ Group ครูส่วนใหญ่อายุงานนาน เชี่ยวชาญการสอนเฉพาะจุด มีโปรแกรม TOEIC, IELTS, และ General English</p><h2>ผลลัพธ์</h2><p>TOEIC จาก 600 → 750 ใน 6 สัปดาห์ ที่พักสะอาดและปลอดภัย เหมาะกับคนไทยที่มาครั้งแรก</p>",
    category: 'review', author: 'Philingo Team', authorTh: "น้องแพร · B'Cebu 6 สัปดาห์",
    tags: ['BCebu','TOEIC','Cebu','Thai'], isFeatured: false, isPublished: true, publishedAt: new Date(), views: 0,
  },
  {
    slug: 'review-monol-cebu-8-weeks',
    title: 'Review MONOL International Cebu 8 Weeks',
    titleTh: 'รีวิวเรียน MONOL International เซบู 8 สัปดาห์',
    excerptTh: 'รีวิว MONOL International เซบู 8 สัปดาห์ โรงเรียนที่บังคับพูดอังกฤษตลอดเวลา',
    contentTh: '<h2>ทำไมเลือก MONOL?</h2><p>MONOL ดังเรื่องกฎ English-Only Policy ที่เข้มงวด ห้ามพูดภาษาแม่ในพื้นที่สถาบัน เลือกมาเพราะต้องการบังคับตัวเองให้พูดอังกฤษตลอด 24 ชั่วโมง</p><h2>ระบบและกฎระเบียบ</h2><p>กฎเข้มแต่ยุติธรรม มีค่าปรับถ้าพูดภาษาอื่นในพื้นที่กำหนด ช่วยให้สมองคิดเป็นภาษาอังกฤษโดยอัตโนมัติภายใน 2-3 สัปดาห์</p><h2>ผลลัพธ์</h2><p>Speaking Fluency ดีขึ้นอย่างน่าทึ่ง IELTS Speaking จาก 5.0 → 6.5 ถ้าอยากพัฒนา Speaking โดยเฉพาะ MONOL คือคำตอบ</p>',
    category: 'review', author: 'Philingo Team', authorTh: 'พี่ต้น · MONOL 8 สัปดาห์',
    tags: ['MONOL','Speaking','IELTS','Cebu'], isFeatured: false, isPublished: true, publishedAt: new Date(), views: 0,
  },
];

async function main() {
  console.log(`🌱 Seeding ${reviews.length} placeholder reviews into: ${process.env.DATABASE_URL?.slice(0, 40)}...`);
  let inserted = 0;
  let skipped = 0;
  for (const r of reviews) {
    try {
      await db.insert(blogPostsTable).values(r as any).onConflictDoNothing();
      console.log(`  ✅ ${r.slug}`);
      inserted++;
    } catch (e: any) {
      console.log(`  ⚠️  ${r.slug}: ${e.message}`);
      skipped++;
    }
  }
  console.log(`\nDone: ${inserted} inserted, ${skipped} skipped`);
  await pool.end();
}

main().catch(e => { console.error(e); process.exit(1); });
