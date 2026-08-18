import { Router } from 'express';
import multer from 'multer';
import { randomUUID } from 'crypto';
import { requireAuth } from '../middlewares/auth.js';
import { anthropic } from '@workspace/integrations-anthropic-ai';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

interface TSlot { time: string; activity: string; type: 'one-on-one' | 'group' | 'meal' | 'self-study' | 'free'; }
interface TCourse { courseId: string; courseName: string; courseNameTh: string; tag: string; slots: TSlot[]; }
interface TConfig { schedules: TCourse[]; rules: string[]; note: string; }

const TIMETABLE_VISION_PROMPT = `Analyze this school timetable/schedule image or document.
Extract:
- courseName: name of the course (e.g. ESL Regular, IELTS, etc.)
- courseNameTh: Thai translation of the course name
- tag: any description tag (e.g. "1:1 x 4 | Group x 4")
- slots: array of schedule slots:
  - time: duration or time range (e.g. "08:00 - 08:50", "09:00 - 09:50")
  - activity: class/activity name (e.g. "1:1 Class (Speaking)", "Group Class", "Lunch")
  - type: must be one of: "one-on-one", "group", "meal", "self-study", "free"

Also extract rules (general school rules/policies) if visible, as a list of strings.
Also extract any additional notes or details as note.

Return ONLY a JSON object in this format:
{
  "schedules": [
    {
      "courseId": "esl_regular",
      "courseName": "ESL Regular",
      "courseNameTh": "ESL ปกติ",
      "tag": "1:1 x 4 | Group x 4",
      "slots": [
        { "time": "08:00 - 08:50", "activity": "1:1 Class", "type": "one-on-one" }
      ]
    }
  ],
  "rules": [
    "Only English Policy"
  ],
  "note": "..."
}
Ensure the slots are sorted chronologically by time. Use standard types for type. Return ONLY valid JSON, no conversational text or markdown blocks (unless wrapped in \`\`\`json).`;

async function parseImageTimetable(buf: Buffer, mimeType: string): Promise<TConfig> {
  const base64 = buf.toString('base64');
  type ValidMime = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';
  const validMimes: ValidMime[] = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const safeMime: ValidMime = validMimes.includes(mimeType as ValidMime)
    ? (mimeType as ValidMime)
    : 'image/jpeg';

  const msg = await anthropic.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 2048,
    messages: [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: safeMime, data: base64 } },
        { type: 'text', text: TIMETABLE_VISION_PROMPT },
      ],
    }],
  });

  const text = (msg.content[0] as any).text as string;
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('AI ไม่สามารถอ่านตารางเรียนจากรูปภาพได้ — ตรวจสอบว่ารูปมีรายละเอียดตารางเรียนชัดเจน');

  const parsed = JSON.parse(match[0]);

  const schedules = (parsed.schedules ?? []).map((s: any) => ({
    courseId: s.courseId || `course_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    courseName: s.courseName || '',
    courseNameTh: s.courseNameTh || s.courseName || '',
    tag: s.tag || '',
    slots: (s.slots ?? []).map((sl: any) => ({
      time: sl.time || '',
      activity: sl.activity || '',
      type: ['one-on-one', 'group', 'meal', 'self-study', 'free'].includes(sl.type) ? sl.type : 'group'
    }))
  }));

  return {
    schedules,
    rules: Array.isArray(parsed.rules) ? parsed.rules.map(String) : [],
    note: parsed.note ? String(parsed.note) : ''
  };
}

// POST /api/schools/:id/parse-timetable
router.post('/:id/parse-timetable', requireAuth, upload.single('file'), async (req, res) => {
  if (!req.file) { res.status(400).json({ error: 'No file uploaded' }); return; }

  try {
    const mimeType = req.file.mimetype;
    const ext = (req.file.originalname.split('.').pop() ?? '').toLowerCase();

    if (!['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext) && !mimeType.startsWith('image/')) {
      res.status(400).json({ error: 'รองรับเฉพาะไฟล์รูปภาพ (JPEG/PNG/WEBP)' });
      return;
    }

    const timetable = await parseImageTimetable(req.file.buffer, mimeType);
    res.json({ ok: true, timetable });
  } catch (err) {
    res.status(500).json({ error: 'ไม่สามารถอ่านไฟล์ตารางเรียนได้', message: String(err) });
  }
});

export { router as parseTimetableRouter };
