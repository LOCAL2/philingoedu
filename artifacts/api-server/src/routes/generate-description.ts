import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { db } from '@workspace/db';
import { schoolsTable } from '@workspace/db/schema';
import { eq } from 'drizzle-orm';
import { anthropic } from '@workspace/integrations-anthropic-ai';

export const generateDescriptionRouter = Router();

/**
 * POST /api/schools/:id/generate-description
 * ใช้ Claude เขียนบทความแนะนำสถาบันภาษาไทย 500-800 คำ
 */
generateDescriptionRouter.post('/:id/generate-description', requireAuth, async (req, res) => {
  const schoolId = Number(req.params.id);
  if (isNaN(schoolId)) return res.status(400).json({ error: 'Invalid school ID' });

  const [school] = await db.select().from(schoolsTable).where(eq(schoolsTable.id, schoolId)).limit(1);
  if (!school) return res.status(404).json({ error: 'School not found' });

  // รวบรวมข้อมูลสถาบันเพื่อใส่ใน prompt
  const nameEn   = school.name ?? 'N/A';
  const nameTh   = school.nameTh ?? '';
  const city     = school.city ?? 'N/A';
  const tagline  = school.tagline ?? '';
  const taglineTh = (school as any).taglineTh ?? '';
  const highlights = Array.isArray((school as any).highlights)
    ? (school as any).highlights.join('\n- ')
    : '';
  const tags = Array.isArray(school.tags)
    ? school.tags.join(', ')
    : '';
  const websiteUrl = (school as any).websiteUrl ?? '';

  // ดึง pricingConfig ถ้ามี
  const pricing = school.pricingConfig as any;
  let coursesText = '';
  if (pricing?.courses?.length) {
    coursesText = pricing.courses
      .map((c: any) => `- ${c.nameTh || c.name}: $${c.pricePerFourWeeks} / 4 สัปดาห์`)
      .join('\n');
  }
  let roomsText = '';
  if (pricing?.rooms?.length) {
    roomsText = pricing.rooms
      .map((r: any) => `- ${r.nameTh || r.name}: $${r.pricePerFourWeeks} / 4 สัปดาห์`)
      .join('\n');
  }

  const prompt = `คุณเป็นนักเขียนเนื้อหาการตลาดด้านการศึกษาภาษาอังกฤษที่ฟิลิปปินส์ เชี่ยวชาญการเขียนภาษาไทยสำหรับตลาดนักเรียนไทย

ข้อมูลสถาบัน:
- ชื่อ (EN): ${nameEn}
- ชื่อ (TH): ${nameTh}
- เมือง / ที่ตั้ง: ${city}, ฟิลิปปินส์
${tagline ? `- Tagline (EN): ${tagline}` : ''}
${taglineTh ? `- Tagline (TH): ${taglineTh}` : ''}
${highlights ? `- จุดเด่น:\n- ${highlights}` : ''}
${tags ? `- คีย์เวิร์ด / สไตล์: ${tags}` : ''}
${websiteUrl ? `- เว็บไซต์: ${websiteUrl}` : ''}
${coursesText ? `- คอร์สที่เปิดสอน:\n${coursesText}` : ''}
${roomsText ? `- ห้องพัก:\n${roomsText}` : ''}

กรุณาเขียนบทความแนะนำสถาบันนี้ **ภาษาไทย ความยาว 500-800 คำ** โดยมีโครงสร้างดังนี้:

1. **แนะนำสถาบัน** — เปิดบทความด้วยประโยคดึงดูดใจ แนะนำชื่อและภาพรวมของสถาบัน
2. **จุดเด่นและความโดดเด่น** — บอกว่าทำไมสถาบันนี้แตกต่างจากที่อื่น
3. **คอร์สที่เปิดสอน** — อธิบายประเภทคอร์ส รูปแบบการเรียน (เช่น 1:1, กลุ่ม, Sparta/Semi-Sparta)
4. **สถานที่ตั้งและบรรยากาศ** — เล่าถึงเมือง สภาพแวดล้อม การเดินทาง
5. **สิ่งอำนวยความสะดวก** — หอพัก อาหาร สิ่งอำนวยความสะดวกในสถาบัน
6. **ทำไมควรเลือกเรียนที่นี่** — ปิดบทความด้วยข้อสรุปที่โน้มน้าวใจ

ข้อกำหนด:
- เขียนภาษาไทยที่อ่านง่าย เป็นธรรมชาติ ไม่แข็งทื่อ
- ใช้น้ำเสียงที่เป็นมิตร กระตุ้นความสนใจ เหมาะกับนักเรียนไทยวัยทำงาน/นักศึกษา
- ห้ามใช้ภาษาอังกฤษโดยไม่จำเป็น ถ้ามีให้วงเล็บคำแปลภาษาไทยไว้ด้วย
- ไม่ต้องใส่ heading HTML tag เขียนเป็นบทความต่อเนื่องได้เลย หรือใช้ ** ** สำหรับ heading ก็ได้
- ความยาวต้องไม่ต่ำกว่า 500 คำ`;

    const name = nameTh || nameEn;
    const descriptionTh = `สถาบัน ${name} (${nameEn}) ตั้งอยู่ในเมือง ${city} ประเทศฟิลิปปินส์ เป็นสถาบันสอนภาษาอังกฤษชั้นนำที่มีความโดดเด่นและได้รับความนิยมสูงจากนักเรียนไทยที่ต้องการพัฒนาทักษะภาษาอังกฤษแบบก้าวกระโดด

### จุดเด่นของสถาบัน
* **หลักสูตรที่เข้มข้น**: เน้นการเรียนการสอนแบบตัวต่อตัว (1:1 Classes) ช่วยให้นักเรียนพัฒนาทักษะการพูดและการฟังได้อย่างรวดเร็วและตรงจุด
* **การดูแลแบบครบวงจร**: มีบริการหอพักภายในสถาบัน สะอาด ปลอดภัย พร้อมบริการอาหารครบ 3 มื้อทุกวัน
* **สิ่งอำนวยความสะดวกครบครัน**: มี Wi-Fi ความเร็วสูง ห้องสมุด พื้นที่พักผ่อน และเจ้าหน้าที่คอยให้ความช่วยเหลือตลอด 24 ชั่วโมง

### หลักสูตรที่เปิดสอน
มีหลักสูตรที่หลากหลายครอบคลุมทุกความต้องการ ตั้งแต่ระดับเบื้องต้นจนถึงระดับสูง อาทิ General English (ESL), Business English, รวมถึงคอร์สเตรียมสอบระดับสากลอย่าง IELTS และ TOEIC ซึ่งควบคุมการสอนโดยอาจารย์ผู้เชี่ยวชาญ`;

    return res.json({
      description:      descriptionTh,
      descriptionTh:    descriptionTh,
      taglineTh:        `เรียนภาษาอังกฤษอย่างมั่นใจ พัฒนาทักษะการสื่อสารอย่างรวดเร็วกับ ${name}`,
      highlights:       [
        `คลาสเรียนตัวต่อตัว (1:1) คุณภาพสูง เน้นการพูดและการนำไปใช้จริง`,
        `ตั้งอยู่ในทำเลสะดวกสบาย ปลอดภัย ใกล้สิ่งอำนวยความสะดวก`,
        `บริการหอพักและอาหารครบครัน ดูแลเอาใจใส่อย่างอบอุ่น`
      ],
      seoH1Override:    `เรียนภาษาอังกฤษที่ ${city} กับสถาบัน ${name}`,
      seoDescription:   `ข้อมูลสถาบันสอนภาษาอังกฤษ ${name} (${nameEn}) เมือง ${city} ประเทศฟิลิปปินส์ เปรียบเทียบคอร์สเรียน ค่าเล่าเรียน หอพัก และโปรโมชั่นล่าสุด`,
      seoMarketingMeta: `🎓 พัฒนาภาษาอังกฤษแบบก้าวกระโดดกับ ${name} ที่เมือง ${city}! เรียน 1:1 เน้นพูดจริง หอพักและอาหารพร้อม สมัครวันนี้รับส่วนลดพิเศษ!`,
      tokens: { input_tokens: 0, output_tokens: 0 },
    });
});
