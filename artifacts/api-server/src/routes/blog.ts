import { Router } from 'express';
import { eq, and, desc, count, or, ilike } from 'drizzle-orm';
import { db } from '../lib/db.js';
import { requireAuth } from '../middlewares/auth.js';
import { blogPostsTable } from '@workspace/db';
import { anthropic } from '@workspace/integrations-anthropic-ai';

const router = Router();

// ── AI: generate blog content ──────────────────────────────────────────────
/**
 * POST /api/blog/generate-content
 * รับ { title, category? } → เขียนบทความภาษาไทย 800-1500 คำ
 */
router.post('/generate-content', requireAuth, async (req, res) => {
  const { title, category } = req.body ?? {};
  if (!title) { res.status(400).json({ error: 'กรุณาระบุหัวข้อบทความ' }); return; }

  const categoryLabel: Record<string, string> = {
    news: 'ข่าวสาร', tips: 'เคล็ดลับ', school: 'รีวิวสถาบัน',
    life: 'ชีวิตในต่างประเทศ', other: 'ทั่วไป',
  };
  const catText = category ? `หมวดหมู่: ${categoryLabel[category] ?? category}` : '';

  const prompt = `คุณเป็นนักเขียนบทความ SEO ด้านการศึกษาภาษาอังกฤษที่ฟิลิปปินส์ เชี่ยวชาญการเขียนภาษาไทยให้ติดอันดับ Google และ AI Search (Google AI Overview, ChatGPT, Perplexity)

เขียนบทความภาษาไทยหัวข้อ: "${title}"
${catText}

═══ หลักการเขียนให้ AI Search และ Google จับได้ (สำคัญมาก) ═══
1. ANSWER-FIRST: ย่อหน้าแรกต้องตอบคำถามตรงๆ ใน 2-3 ประโยค เช่น "เรียนฟิลิปปินส์ใช้งบ 35,000–70,000 บาท/เดือน รวมค่าเรียนและที่พัก..."
2. ใช้ตัวเลขและข้อเท็จจริงที่เป็นรูปธรรมในทุก section — ราคา, ระยะเวลา, ชื่อสถานที่, %
3. หัวข้อย่อยต้องเป็นคำถามที่คนค้นหา เช่น "เรียนฟิลิปปินส์ค่าใช้จ่ายเท่าไหร่?" "โรงเรียนไหนดีที่สุดในเซบู?"
4. ท้ายบทความต้องมีส่วน FAQ (คำถามที่พบบ่อย) 4-5 ข้อ ในรูปแบบนี้ทุกข้อ:
   Q: คำถาม
   A: คำตอบที่สมบูรณ์ใน 2-3 ประโยค

═══ รูปแบบ Output (HTML เท่านั้น) ═══
ตอบเป็น HTML โดยตรง ห้ามใช้ Markdown (**text** หรือ #heading) ใช้แท็กเหล่านี้เท่านั้น:
- <h2>หัวข้อหลัก</h2> สำหรับ section หลัก
- <h3>หัวข้อย่อย</h3> สำหรับหัวข้อย่อย
- <p>ย่อหน้า</p>
- <ul><li>รายการ</li></ul>
- <strong>ข้อความสำคัญ</strong>
- ส่วน FAQ ใช้ plain text รูปแบบ Q:/A: (ไม่ใช่ HTML) เพื่อให้ระบบ parse schema ได้

═══ โครงสร้างบทความ ═══
<p>[ANSWER-FIRST: ตอบคำถามตรงๆ 2-3 ประโยค + ตัวเลขจริง]</p>
<h2>[หัวข้อ 1 เป็นคำถาม]</h2>
<p>...</p>
<h2>[หัวข้อ 2-4]</h2>
<p>...</p>
<h2>สรุป</h2>
<p>[สรุป + CTA ติดต่อ Philingo by Thai Study Abroad Consultant ขอคำปรึกษาฟรี]</p>

คำถามที่พบบ่อย (FAQ)
Q: [คำถาม 1]
A: [คำตอบ 2-3 ประโยค]
Q: [คำถาม 2]
A: [คำตอบ]
Q: [คำถาม 3]
A: [คำตอบ]
Q: [คำถาม 4]
A: [คำตอบ]

ข้อกำหนด:
- ภาษาไทยล้วน อ่านง่าย น้ำเสียงเป็นกันเอง
- ความยาว HTML body 1000-1500 คำ (ไม่นับแท็ก HTML)
- ใส่ตัวเลขจริงทุกครั้งที่กล่าวถึงราคา, ระยะเวลา, จำนวน
- ห้ามสั้นกว่า 1000 คำ`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 8192,
      messages: [{ role: 'user', content: prompt }],
    });
    const block = message.content[0];
    const content = block.type === 'text' ? block.text : '';
    res.json({ content, tokens: message.usage });
  } catch (err: any) {
    res.status(500).json({ error: `AI error: ${err.message}` });
  }
});

// ── AI: generate SEO metadata ──────────────────────────────────────────────
/**
 * POST /api/blog/generate-seo
 * รับ { title, content } → ตอบ { seoTitle, seoDescription, seoKeywords }
 */
router.post('/generate-seo', requireAuth, async (req, res) => {
  const { title, content } = req.body ?? {};
  if (!title || !content) { res.status(400).json({ error: 'กรุณาระบุหัวข้อและเนื้อหา' }); return; }

  const prompt = `จากบทความด้านการเรียนต่อฟิลิปปินส์ด้านล่างนี้ กรุณาสร้าง SEO metadata ภาษาไทย:

หัวข้อบทความ: "${title}"

เนื้อหาบทความ (ส่วนต้น):
${String(content).slice(0, 2500)}

กรุณาตอบเป็น JSON เท่านั้น ห้ามมีข้อความอื่น:
{
  "seoTitle": "หัวข้อ SEO ไม่เกิน 60 ตัวอักษร รวม keyword หลัก",
  "seoDescription": "Meta description 150-160 ตัวอักษร ดึงดูดให้คลิก มี keyword",
  "seoKeywords": "keyword1, keyword2, keyword3 (8-15 คำ คั่นด้วยจุลภาค)",
  "seoMarketingMeta": "ประโยคดึงดูดคลิก 80-120 ตัวอักษร เริ่มด้วย emoji เช่น ✈️ หรือ 🎓 เน้นจุดขายหลักและ CTA"
}`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }],
    });
    const block = message.content[0];
    const text = block.type === 'text' ? block.text : '{}';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) { res.status(500).json({ error: 'AI ตอบกลับในรูปแบบที่ไม่ถูกต้อง' }); return; }
    res.json(JSON.parse(jsonMatch[0]));
  } catch (err: any) {
    res.status(500).json({ error: `AI error: ${err.message}` });
  }
});

router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    const conditions = [];

    if (req.query.isPublished !== undefined) conditions.push(eq(blogPostsTable.isPublished, req.query.isPublished === 'true'));
    if (req.query.isFeatured !== undefined) conditions.push(eq(blogPostsTable.isFeatured, req.query.isFeatured === 'true'));
    if (req.query.category) conditions.push(eq(blogPostsTable.category, req.query.category as string));
    if (req.query.search) {
      const s = `%${req.query.search}%`;
      conditions.push(or(ilike(blogPostsTable.title, s), ilike(blogPostsTable.titleTh, s), ilike(blogPostsTable.excerpt, s)));
    }

    const where = conditions.length ? and(...conditions) : undefined;
    const [{ total }] = await db.select({ total: count() }).from(blogPostsTable).where(where);
    const data = await db.select().from(blogPostsTable).where(where)
      .orderBy(desc(blogPostsTable.publishedAt), desc(blogPostsTable.createdAt))
      .limit(limit).offset(offset);

    res.json({ data, total: Number(total), page, limit });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', message: String(err) });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const bySlug = isNaN(id);
    const [item] = bySlug
      ? await db.select().from(blogPostsTable).where(eq(blogPostsTable.slug, req.params.id)).limit(1)
      : await db.select().from(blogPostsTable).where(eq(blogPostsTable.id, id)).limit(1);

    if (!item) { res.status(404).json({ error: 'Not Found', message: 'Blog post not found' }); return; }
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', message: String(err) });
  }
});

function normalizePost(body: Record<string, unknown>) {
  const d = { ...body };
  if (d.publishedAt && typeof d.publishedAt === 'string') d.publishedAt = new Date(d.publishedAt);
  if (d.publishedAt === null || d.publishedAt === '') d.publishedAt = null;
  return d;
}

router.post('/', requireAuth, async (req, res) => {
  try {
    const [created] = await db.insert(blogPostsTable).values(normalizePost(req.body) as any).returning();
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', message: String(err) });
  }
});

router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [updated] = await db.update(blogPostsTable).set({ ...normalizePost(req.body), updatedAt: new Date() } as any)
      .where(eq(blogPostsTable.id, id)).returning();
    if (!updated) { res.status(404).json({ error: 'Not Found', message: 'Blog post not found' }); return; }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', message: String(err) });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [deleted] = await db.delete(blogPostsTable)
      .where(eq(blogPostsTable.id, id)).returning({ id: blogPostsTable.id });
    if (!deleted) { res.status(404).json({ error: 'Not Found', message: 'Blog post not found' }); return; }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', message: String(err) });
  }
});

router.patch('/:id/sort', requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    // blog doesn't have sortOrder, return 200 ok
    res.json({ id, ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', message: String(err) });
  }
});

export default router;
