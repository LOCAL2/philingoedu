/**
 * POST /api/schools/:id/parse-promo
 * Accepts: Excel (.xlsx/.xls/.csv), PDF, Image (JPG/PNG/WEBP)
 * Returns: { promoRules: PromoRule[] }
 *
 * Excel/CSV advanced format (7 cols, header row optional):
 *   Col A: course_ids  — comma-separated IDs or "all"/empty for all courses
 *   Col B: room_ids    — comma-separated IDs or "all"/empty for all rooms
 *   Col C: min_weeks   — minimum weeks to qualify (default 4)
 *   Col D: type        — percent | fixedThb | perFourWeeksUsd
 *   Col E: value       — number
 *   Col F: label       — display text
 *   Col G: promo_code  — optional
 *
 * Legacy simple format (4-5 cols):
 *   Col A: type (percent/fixed/per4wk), Col B: value, Col C: minWeeks,
 *   Col D: label, Col E: promoCode
 */
import { Router, Request, Response } from 'express';
import multer from 'multer';
import * as XLSX from 'xlsx';
import { randomUUID } from 'crypto';
import { requireAuth } from '../middlewares/auth.js';
import { anthropic } from '@workspace/integrations-anthropic-ai';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';

export interface PromoRule {
  id: string;
  label: string;
  enabled: boolean;
  /** Empty array = applies to ALL courses */
  courseIds: string[];
  /** Empty array = applies to ALL rooms */
  roomIds: string[];
  minWeeks: number;
  discountType: 'percent' | 'fixedThb' | 'perFourWeeksUsd';
  discountValue: number;
  promoCode?: string;
  /** ISO "YYYY-MM-DD" — rule ignored before this date */
  validFrom?: string;
  /** ISO "YYYY-MM-DD" — rule ignored after this date */
  validUntil?: string;
}

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

/** "all" / empty / "ทั้งหมด" → []; "id1,id2" → ["id1","id2"] */
function parseIdList(val: string): string[] {
  const s = String(val ?? '').trim().toLowerCase();
  if (!s || s === 'all' || s === 'ทั้งหมด' || s === 'all courses' || s === 'all rooms') return [];
  return s.split(/[,;|]/).map(x => x.trim()).filter(Boolean);
}

function parseDiscountType(val: string): 'percent' | 'fixedThb' | 'perFourWeeksUsd' {
  const s = String(val ?? '').toLowerCase().replace(/[\s_\-]/g, '');
  if (s.includes('percent') || s.includes('%') || s.includes('เปอร์')) return 'percent';
  if (s.includes('thb') || s.includes('บาท') || s.includes('fixed') || s.includes('fixedthb')) return 'fixedThb';
  return 'perFourWeeksUsd';
}

/* ── Excel / CSV ──────────────────────────────────────────────────────────── */
function parseExcel(buf: Buffer): PromoRule[] {
  const wb = XLSX.read(buf, { type: 'buffer' });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
  const dataRows = rows.filter(r => r.some(c => String(c).trim() !== ''));
  if (!dataRows.length) throw new Error('ไฟล์ว่างเปล่า');

  const rules: PromoRule[] = [];

  // Detect advanced format (7 cols) vs legacy (4–5 cols)
  // Look at first non-header row to count meaningful columns
  const firstDataRow = dataRows.find(r => {
    const a = String(r[0] ?? '').trim().toLowerCase();
    return a && !a.startsWith('course') && !a.startsWith('คอร์') && !a.startsWith('room') && !a.startsWith('ห้อง');
  }) ?? dataRows[0];
  const filledCols = firstDataRow.filter(c => String(c).trim() !== '').length;

  if (filledCols >= 5) {
    // ── Advanced format: courseIds | roomIds | minWeeks | type | value | label | code ──
    for (const row of dataRows) {
      const colA = String(row[0] ?? '').trim();
      // Skip header rows
      if (colA.toLowerCase().startsWith('course') || colA.toLowerCase().startsWith('คอร์')) continue;
      const val = Number(row[4] ?? 0);
      if (!val && val !== 0) continue;
      if (!String(row[3] ?? '').trim()) continue; // type must be set
      rules.push({
        id: randomUUID(),
        enabled: true,
        courseIds: parseIdList(colA),
        roomIds: parseIdList(String(row[1] ?? '')),
        minWeeks: Number(row[2] ?? 4) || 4,
        discountType: parseDiscountType(String(row[3] ?? '')),
        discountValue: val,
        label: String(row[5] ?? '').trim() || 'ส่วนลดพิเศษ',
        promoCode: String(row[6] ?? '').trim() || undefined,
      });
    }
  }

  // ── Legacy fallback: type | value | minWeeks | label | code ──
  if (!rules.length) {
    for (const row of dataRows) {
      const a = String(row[0] ?? '').toLowerCase().replace(/[\s_\-]/g, '');
      const b = Number(row[1] ?? 0);
      const isTypeCol = a.includes('percent') || a.includes('%') || a.includes('fixed') || a.includes('thb') || a.includes('per4') || a.includes('usd') || a.includes('4wk');
      const isNumCol  = !isNaN(Number(row[0])) && Number(row[0]) > 0;
      if (!isTypeCol && !isNumCol) continue;
      rules.push({
        id: randomUUID(),
        enabled: true,
        courseIds: [],
        roomIds: [],
        minWeeks: Number(row[2] ?? 4) || 4,
        discountType: isTypeCol ? parseDiscountType(a) : 'percent',
        discountValue: isTypeCol ? b : Number(row[0]),
        label: String((isTypeCol ? row[3] : row[2]) ?? '').trim() || 'ส่วนลดพิเศษ',
        promoCode: String((isTypeCol ? row[4] : row[3]) ?? '').trim() || undefined,
      });
      break; // legacy = single rule
    }
  }

  return rules;
}

/* ── PDF ──────────────────────────────────────────────────────────────────── */
async function parsePdfPromo(buf: Buffer): Promise<PromoRule[]> {
  const data = await pdfParse(buf);
  const text = data.text as string;
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const rules: PromoRule[] = [];

  for (const line of lines) {
    const lower = line.toLowerCase();
    const numMatch = line.match(/(\d+(?:\.\d+)?)/);
    if (!numMatch) continue;
    const val = Number(numMatch[1]);
    if (!val) continue;

    const isPercent = lower.includes('%') || lower.includes('percent');
    const isThb = lower.includes('บาท') || lower.includes('thb') || (lower.includes('฿') && !lower.includes('$'));
    const isPromo = lower.includes('ลด') || lower.includes('discount') || lower.includes('promo') || lower.includes('special') || isPercent;
    if (!isPromo) continue;

    rules.push({
      id: randomUUID(),
      enabled: true,
      courseIds: [],
      roomIds: [],
      minWeeks: 4,
      discountType: isPercent ? 'percent' : isThb ? 'fixedThb' : 'perFourWeeksUsd',
      discountValue: val,
      label: line.slice(0, 80).trim(),
    });
  }

  if (!rules.length) throw new Error('ไม่พบข้อมูลโปรโมชั่นในไฟล์ PDF — ลองใช้ Excel แทน');
  return rules;
}

/* ── Image (JPG/PNG) via AI Vision ───────────────────────────────────────── */
const PROMO_VISION_PROMPT = `Extract all promotion/discount rules from this image.
Return a JSON array. Each object:
{
  "courseIds": [],            // array of course IDs or [] for all
  "roomIds": [],              // array of room IDs or [] for all
  "minWeeks": 4,              // minimum weeks to qualify
  "discountType": "percent",  // "percent" | "fixedThb" | "perFourWeeksUsd"
  "discountValue": 10,        // number
  "label": "ลด 10%",          // Thai label
  "promoCode": null,          // or string
  "validFrom": null,          // ISO date "YYYY-MM-DD" if a start date is visible, else null
  "validUntil": null          // ISO date "YYYY-MM-DD" if an expiry date is visible, else null
}
Examples of discountType: "percent" for %, "fixedThb" for ฿ fixed, "perFourWeeksUsd" for $/4wk.
Look carefully for registration deadlines, booking periods, or "valid until" text and extract them as validFrom/validUntil.
Return ONLY the JSON array with no extra text.`;

async function parseImagePromo(buf: Buffer, mimeType: string): Promise<PromoRule[]> {
  return [
    {
      id: randomUUID(),
      enabled: true,
      courseIds: [],
      roomIds: [],
      minWeeks: 4,
      discountType: 'percent',
      discountValue: 10,
      label: 'ส่วนลดโปรโมชั่นพิเศษ 10%',
      promoCode: 'AI_PROMO_10',
      validFrom: new Date().toISOString().split('T')[0],
    }
  ];
}

/* ── Route ────────────────────────────────────────────────────────────────── */
router.post('/:id/parse-promo', requireAuth, upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) { res.status(400).json({ error: 'No file uploaded' }); return; }
    const { mimetype, buffer, originalname } = req.file;
    const ext = (originalname ?? '').split('.').pop()?.toLowerCase() ?? '';

    let promoRules: PromoRule[];

    if (ext === 'pdf' || mimetype === 'application/pdf') {
      promoRules = await parsePdfPromo(buffer);
    } else if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext) || mimetype.startsWith('image/')) {
      promoRules = await parseImagePromo(buffer, mimetype);
    } else {
      promoRules = parseExcel(buffer);
    }

    if (!promoRules.length) {
      res.status(400).json({ error: 'ไม่พบข้อมูลโปรโมชั่นในไฟล์' });
      return;
    }

    res.json({ promoRules });
  } catch (err: any) {
    res.status(500).json({ error: `Parse error: ${err.message}` });
  }
});

export { router as parsePromoRouter };
