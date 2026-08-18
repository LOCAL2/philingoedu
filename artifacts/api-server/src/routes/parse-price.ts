import { Router } from 'express';
import multer from 'multer';
import * as XLSX from 'xlsx';
import { randomUUID } from 'crypto';
// Import the core lib directly — the package's index.js reads a test PDF at load
// time which fails in bundled/ESM environments; the lib module skips that.
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import { requireAuth } from '../middlewares/auth.js';
import { anthropic } from '@workspace/integrations-anthropic-ai';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

// ─── Shared types ────────────────────────────────────────────────────────────

interface PricingResult {
  courses: { id: string; name: string; nameTh: string; pricePerFourWeeks: number }[];
  rooms:   { id: string; name: string; nameTh: string; pricePerFourWeeks: number }[];
  localFeesByWeek: Record<string, number>;
  enrollmentFee: number;
}

// ─── Excel parser (CIA format) ───────────────────────────────────────────────

function parseCIAExcel(workbook: XLSX.WorkBook): PricingResult {
  const courses: PricingResult['courses'] = [];
  const rooms:   PricingResult['rooms']   = [];
  const localFeesByWeek: Record<string, number> = {};
  let enrollmentFee = 100;

  const courseThMap: Record<string, string> = {
    'regular': 'ESL Regular (1:1×4 | กลุ่ม×4)',
    'intensive': 'ESL Intensive (1:1×5 | กลุ่ม×3)',
    'power': 'ESL Power Intensive (1:1×6 | กลุ่ม×2)',
    'working holiday': 'Working Holiday',
    'immersion': 'Immersion (IAU)',
    'toeic': 'TOEIC Preparation',
    'ielts': 'IELTS Preparation',
    'business': 'Business English',
  };

  const roomThMap: Record<string, string> = {
    'pinnacle': 'ห้องเดี่ยว Pinnacle',
    'premium': 'ห้องเดี่ยว Premium',
    'standard': 'ห้องเดี่ยว Standard',
    'twin': 'ห้องแฝด (Twin)',
    'triple': 'ห้อง 3 คน (Triple)',
    'quad': 'ห้อง 4 คน (Quad)',
    'suite single': 'Suite ห้องเดี่ยว',
    'suite twin': 'Suite ห้องแฝด',
    'suite triple': 'Suite 3 คน',
    'suite quad': 'Suite 4 คน',
  };

  for (const sheetName of workbook.SheetNames) {
    const ws = workbook.Sheets[sheetName];
    const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });
    const weekKeys = ['1','2','3','4','8','12','16','20','24'];

    for (let ri = 0; ri < rows.length; ri++) {
      const row = rows[ri];
      if (!row || row.every(c => c === null)) continue;
      const rowText = row.map(c => String(c ?? '')).join(' ').toLowerCase();

      if (rowText.includes('enrollment') && !enrollmentFee) {
        const match = rowText.match(/(\d+)/);
        if (match) enrollmentFee = Number(match[1]);
      }

      if (rowText.includes('total') && (rowText.includes('19') || rowText.includes('25') || rowText.includes('89'))) {
        const nums = row.filter(c => c !== null && !isNaN(Number(c)) && Number(c) > 1000).map(Number);
        if (nums.length >= 4) {
          weekKeys.forEach((wk, i) => { if (nums[i] !== undefined) localFeesByWeek[wk] = nums[i]; });
        }
      }

      const possibleCourseFees = row.filter(c => c !== null && !isNaN(Number(c)) && Number(c) >= 700 && Number(c) <= 1500).map(Number);
      if (possibleCourseFees.length >= 3 && ri > 0) {
        const headerRow = rows[ri - 1] ?? [];
        const headerText = headerRow.map(c => String(c ?? '')).join(' ').toLowerCase();
        if (headerText.includes('esl') || headerText.includes('toeic') || headerText.includes('ielts') || headerText.includes('business')) {
          const nonNullHeaders = headerRow.filter(c => c !== null && String(c).trim());
          const nonNullPrices  = row.filter(c => c !== null && !isNaN(Number(c)) && Number(c) >= 700 && Number(c) <= 1500);
          nonNullHeaders.forEach((h, i) => {
            if (nonNullPrices[i]) {
              const name = String(h).trim();
              const price = Number(nonNullPrices[i]);
              const lname = name.toLowerCase();
              const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
              const nameTh = Object.entries(courseThMap).find(([k]) => lname.includes(k))?.[1] ?? name;
              if (price > 0 && name && !courses.find(c => c.id === id)) {
                courses.push({ id, name, nameTh, pricePerFourWeeks: price });
              }
            }
          });
        }
      }

      const roomKeywords = ['single', 'twin', 'triple', 'quad', 'suite', 'pinnacle', 'premium', 'standard'];
      if (roomKeywords.some(k => rowText.includes(k))) {
        const allCells = row;
        let currentName = '';
        for (let ci = 0; ci < allCells.length; ci++) {
          const cell = allCells[ci];
          if (typeof cell === 'string' && roomKeywords.some(k => cell.toLowerCase().includes(k))) {
            currentName = cell.trim();
          } else if (cell !== null && !isNaN(Number(cell)) && Number(cell) >= 700 && Number(cell) <= 3000 && currentName) {
            const lname = currentName.toLowerCase();
            const id = currentName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
            const nameTh = Object.entries(roomThMap).find(([k]) => lname.includes(k))?.[1] ?? currentName;
            if (!rooms.find(r => r.id === id)) {
              rooms.push({ id, name: currentName, nameTh, pricePerFourWeeks: Number(cell) });
            }
            currentName = '';
          }
        }
      }
    }
  }

  return { courses, rooms, localFeesByWeek, enrollmentFee };
}

// ─── PDF parser (actual pdf-parse output format) ─────────────────────────────
// pdf-parse concatenates cell text with no spaces, e.g.:
//   "Power ESL4006508609901,9802,9703,9605,940"
//   "Single Room5508501,0901,2702,5403,8105,0807,620"
//   "IELTS Starter--8909901,980---"
// Week header: "Course (USD)1 Week2 Weeks3 Weeks4 Weeks8 Weeks12 Weeks16 Weeks24 Weeks"
// Local fee:   "4weeks₱ 3,000₱ 12,300₱ 4,00000000000₱ 400₱ 2,000₱ 1,000₱ 22,700"

function parsePricePDF(text: string): PricingResult {
  const courses: PricingResult['courses'] = [];
  const rooms:   PricingResult['rooms']   = [];
  const localFeesByWeek: Record<string, number> = {};
  let enrollmentFee = 100;

  const courseThMap: Record<string, string> = {
    'power esl':          'ESL Power',
    'intensive beginner': 'ESL Intensive Beginner',
    'light esl':          'ESL Light',
    'intensive speaking': 'ESL Intensive Speaking',
    'ielts starter':      'IELTS Starter',
    'ielts target':       'IELTS Target',
    'toeic target':       'TOEIC Preparation (Target)',
    'toeic':              'TOEIC Preparation',
    'ielts':              'IELTS Preparation',
    'junior esl':         'Junior ESL & YLE',
    'general business':   'General Business & BEC',
    'business':           'Business English',
    'esl regular':        'ESL Regular',
    'esl intensive':      'ESL Intensive',
    'working holiday':    'Working Holiday',
    'immersion':          'Immersion (IAU)',
  };

  const roomThMap: Record<string, string> = {
    'single room':    'ห้องเดี่ยว',
    'twin room':      'ห้องแฝด (Twin)',
    'triple room':    'ห้อง 3 คน (Triple)',
    'quad room':      'ห้อง 4 คน (Quad)',
    'regular single': 'Regular Single',
    'super single':   'Super Single',
    'regular twin':   'Regular Twin',
    'super twin':     'Super Twin',
    'family unit':    'Family Unit',
  };

  function toId(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  }
  function toThCourse(name: string): string {
    const lname = name.toLowerCase();
    return Object.entries(courseThMap).find(([k]) => lname.includes(k))?.[1] ?? name;
  }
  function toThRoom(name: string, group: string): string {
    const lname = name.toLowerCase();
    const base = Object.entries(roomThMap).find(([k]) => lname.includes(k))?.[1] ?? name;
    return group ? `${base} (${group})` : base;
  }

  /**
   * Extract price tokens from a concatenated price string.
   * Each column is either "-" (not available) or a number:
   *   - 3 digits:              400, 650, 860
   *   - 1-2 digits + comma + 3 digits: 1,980  2,970  10,000
   * Returns array of numbers (-1 = not available/dash).
   */
  function extractPriceTokens(priceStr: string): number[] {
    const re = /-|\d{1,3},\d{3}|\d{3}/g;
    const tokens: number[] = [];
    let m: RegExpExecArray | null;
    while ((m = re.exec(priceStr)) !== null) {
      tokens.push(m[0] === '-' ? -1 : Number(m[0].replace(',', '')));
    }
    return tokens;
  }

  /**
   * Split a concatenated line into text name + price tokens.
   * Price tokens must match `numWeekCols` entries.
   * Strategy: extract ALL tokens, take last `numWeekCols` as prices,
   * the rest of the line (before first price token's position) is the name.
   */
  function splitLine(line: string, numWeekCols: number): { name: string; prices: number[] } | null {
    const re = /-|\d{1,3},\d{3}|\d{3}/g;
    const allMatches: { val: string; idx: number }[] = [];
    let m: RegExpExecArray | null;
    while ((m = re.exec(line)) !== null) {
      allMatches.push({ val: m[0], idx: m.index });
    }
    if (allMatches.length < numWeekCols) return null;

    // Take the last numWeekCols matches as price columns
    const priceMatches = allMatches.slice(allMatches.length - numWeekCols);
    const nameEnd = priceMatches[0].idx;
    const name = line.slice(0, nameEnd).trim();
    if (!name || /^\d/.test(name)) return null; // no valid text name

    const prices = priceMatches.map(t => t.val === '-' ? -1 : Number(t.val.replace(',', '')));
    return { name, prices };
  }

  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  // Extract enrollment fee
  for (const line of lines) {
    const m = line.match(/enrollment\s+fee\s*[:\-]?\s*\$?(\d+)/i);
    if (m) { enrollmentFee = Number(m[1]); break; }
  }

  let section: 'course' | 'room' | null = null;
  let numWeekCols = 0;
  let fourWeekIdx = -1;
  let roomGroup = '';
  let pendingNameLine = '';   // for multi-line names like "General Business\n& BEC"

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // ── Section transitions ──────────────────────────────────────────────────
    if (/tuition\s+fee/i.test(line)) {
      section = 'course'; numWeekCols = 0; fourWeekIdx = -1; pendingNameLine = ''; continue;
    }
    if (/dormitory\s+fee|room\s+fee/i.test(line)) {
      section = 'room'; numWeekCols = 0; fourWeekIdx = -1; roomGroup = ''; pendingNameLine = ''; continue;
    }
    if (/local\s+pay/i.test(line)) { section = null; continue; }

    // ── Local fee rows (only after section=null) ─────────────────────────────
    if (!section) {
      const wkMatch = line.match(/^(\d+)weeks?\b/i);
      if (wkMatch) {
        // TOTAL is the last ₱-prefixed number in the line
        const phpsMatches = [...line.matchAll(/₱\s*([\d,]+)/g)];
        if (phpsMatches.length > 0) {
          const total = Number(phpsMatches[phpsMatches.length - 1][1].replace(/,/g, ''));
          if (total > 1000) localFeesByWeek[wkMatch[1]] = total;
        }
      }
      continue;
    }

    // ── Week-column header: "...1 Week2 Weeks3 Weeks4 Weeks..." ─────────────
    // Numbers and "Week(s)" are concatenated with no spaces between columns,
    // so we count how many "NWeeks?" groups appear; ≥4 and includes "4 Weeks"
    // means this is the column-header row. We avoid \b because "3 Weeks4 Weeks"
    // has no word boundary between "s" and "4".
    const weekHeaderMatches = [...line.matchAll(/(\d+)\s*weeks?/gi)];
    if (weekHeaderMatches.length >= 4 && weekHeaderMatches.some(m => m[1] === '4')) {
      const wks = [...line.matchAll(/(\d+)\s*weeks?/gi)].map(m2 => Number(m2[1]));
      numWeekCols = wks.length;
      fourWeekIdx = wks.indexOf(4);

      // If line also contains a room group label (IB1, IB2, Condo…), capture it
      if (section === 'room') {
        const grpMatch = line.match(/^([A-Za-z0-9\-]+(?:\s+[A-Za-z]+)?)\s*(?:\(USD\))?/i);
        if (grpMatch) {
          const grp = grpMatch[1].trim();
          // Only treat as group if it doesn't look like a room name
          if (!/room|single|twin|triple|quad|suite/i.test(grp)) {
            roomGroup = grp;
          }
        }
      }
      continue;
    }

    if (numWeekCols === 0 || fourWeekIdx < 0) continue;

    // ── Handle pending 2-line name (e.g. "General Business" + "& BEC") ──────
    // If next line is a price line and we have a pending name, prepend it
    const parsed = splitLine(line, numWeekCols);

    if (!parsed) {
      // No prices extracted — could be:
      //  (a) a text-only name line ("General Business") → accumulate in pending
      //  (b) a pure-price line with no text prefix ("370570750890----")
      //      when a pendingNameLine exists — treat pending as name + parse prices

      const isPurePrice = /^[-\d,\s]+$/.test(line);
      if (isPurePrice && pendingNameLine) {
        // Extract price tokens directly from this line (no text prefix to strip)
        const re2 = /-|\d{1,3},\d{3}|\d{3}/g;
        const priceMatches: { val: string; idx: number }[] = [];
        let m2: RegExpExecArray | null;
        while ((m2 = re2.exec(line)) !== null) {
          priceMatches.push({ val: m2[0], idx: m2.index });
        }
        if (priceMatches.length >= numWeekCols) {
          const pm = priceMatches.slice(priceMatches.length - numWeekCols);
          const prices = pm.map(t => t.val === '-' ? -1 : Number(t.val.replace(',', '')));
          const price4 = prices[fourWeekIdx];
          if (price4 && price4 > 0) {
            const name = pendingNameLine;
            pendingNameLine = '';
            if (section === 'course') {
              const id = toId(name);
              if (!courses.find(c => c.id === id)) courses.push({ id, name, nameTh: toThCourse(name), pricePerFourWeeks: price4 });
            } else {
              const nameFull = roomGroup ? `${roomGroup} ${name}` : name;
              const id = toId(nameFull);
              if (!rooms.find(r => r.id === id)) rooms.push({ id, name: nameFull, nameTh: toThRoom(name, roomGroup), pricePerFourWeeks: price4 });
            }
          }
        }
        continue;
      }

      // Accumulate text-only lines into pending (append, don't overwrite)
      if (/[a-z]/i.test(line) && !/^\d/.test(line) && !/₱/.test(line)) {
        pendingNameLine = pendingNameLine ? pendingNameLine + ' ' + line : line;
      }
      continue;
    }

    // We have a valid name+prices row
    let name = parsed.name;
    if (!name && pendingNameLine) {
      name = pendingNameLine;
    } else if (pendingNameLine && name.startsWith('&')) {
      name = pendingNameLine + ' ' + name;
    }
    pendingNameLine = '';

    if (!name) continue;

    // Skip header/label rows
    if (/course.*usd|usd.*course/i.test(name) || /ib\d+|condo/i.test(name)) continue;

    const fourWeekPrice = parsed.prices[fourWeekIdx];
    if (!fourWeekPrice || fourWeekPrice <= 0) continue; // "-" for this duration

    if (section === 'course') {
      const nameTh = toThCourse(name);
      const id = toId(name);
      if (!courses.find(c => c.id === id)) {
        courses.push({ id, name, nameTh, pricePerFourWeeks: fourWeekPrice });
      }
    } else {
      // room — prefix with group to avoid duplicate IDs across IB1/IB2/Condo
      const nameFull = roomGroup ? `${roomGroup} ${name}` : name;
      const nameTh = toThRoom(name, roomGroup);
      const id = toId(nameFull);
      if (!rooms.find(r => r.id === id)) {
        rooms.push({ id, name: nameFull, nameTh, pricePerFourWeeks: fourWeekPrice });
      }
    }
  }

  return { courses, rooms, localFeesByWeek, enrollmentFee };
}

// ─── Image (JPG/PNG) via AI Vision ─────────────────────────────────────────
const PRICE_VISION_PROMPT = `Extract all course pricing, room/dormitory pricing, registration/enrollment fees, and local fees (by week: e.g. 4, 8, 12, 16, 20, 24 weeks) from this school price list image.
Identify:
- courses: array of objects { name: string, pricePerFourWeeks: number } (Look for prices matching 4 weeks/1 block or calculate per 4 weeks. If there is a price per week, convert to 4 weeks. Usually courses have ESL, IELTS, TOEIC, etc.)
- rooms: array of objects { name: string, pricePerFourWeeks: number } (Look for accommodation/dormitory: single, twin, triple, quad, etc.)
- localFeesByWeek: object mapping week number to PHP local fee amount (e.g. { "4": 15000, "8": 25000 }). Look for local payment/local fees details like SSP, visa extension, maintenance, water/electricity, etc., and sum them up per week if they are detailed, or find the total local payment per week duration.
- enrollmentFee: number (Look for registration fee or enrollment fee. Defaults to 100 if not found, or 0 if explicitly free).

Return ONLY a JSON object in this format:
{
  "courses": [
    { "name": "ESL Regular", "pricePerFourWeeks": 900 }
  ],
  "rooms": [
    { "name": "Triple Room", "pricePerFourWeeks": 850 }
  ],
  "localFeesByWeek": {
    "4": 25200
  },
  "enrollmentFee": 100
}
No conversation, markdown blocks (like \`\`\`json) are okay, but return valid JSON.`;

async function parseImagePrice(buf: Buffer, mimeType: string): Promise<PricingResult> {
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
        { type: 'text', text: PRICE_VISION_PROMPT },
      ],
    }],
  });

  const text = (msg.content[0] as any).text as string;
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('AI ไม่สามารถอ่านข้อมูลราคาจากรูปภาพได้ — ตรวจสอบว่ารูปมีตารางราคาชัดเจน');

  const parsed = JSON.parse(match[0]);

  const courseThMap: Record<string, string> = {
    'power esl':          'ESL Power',
    'intensive beginner': 'ESL Intensive Beginner',
    'light esl':          'ESL Light',
    'intensive speaking': 'ESL Intensive Speaking',
    'ielts starter':      'IELTS Starter',
    'ielts target':       'IELTS Target',
    'toeic target':       'TOEIC Preparation (Target)',
    'toeic':              'TOEIC Preparation',
    'ielts':              'IELTS Preparation',
    'junior esl':         'Junior ESL & YLE',
    'general business':   'General Business & BEC',
    'business':           'Business English',
    'esl regular':        'ESL Regular',
    'esl intensive':      'ESL Intensive',
    'working holiday':    'Working Holiday',
    'immersion':          'Immersion (IAU)',
  };

  const roomThMap: Record<string, string> = {
    'single room':    'ห้องเดี่ยว',
    'twin room':      'ห้องแฝด (Twin)',
    'triple room':    'ห้อง 3 คน (Triple)',
    'quad room':      'ห้อง 4 คน (Quad)',
    'regular single': 'Regular Single',
    'super single':   'Super Single',
    'regular twin':   'Regular Twin',
    'super twin':     'Super Twin',
    'family unit':    'Family Unit',
  };

  function toId(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  }
  function toThCourse(name: string): string {
    const lname = name.toLowerCase();
    return Object.entries(courseThMap).find(([k]) => lname.includes(k))?.[1] ?? name;
  }
  function toThRoom(name: string): string {
    const lname = name.toLowerCase();
    return Object.entries(roomThMap).find(([k]) => lname.includes(k))?.[1] ?? name;
  }

  const courses = (parsed.courses ?? []).map((c: any) => ({
    id: toId(c.name),
    name: String(c.name),
    nameTh: toThCourse(c.name),
    pricePerFourWeeks: Number(c.pricePerFourWeeks ?? 0)
  })).filter((c: any) => c.pricePerFourWeeks > 0);

  const rooms = (parsed.rooms ?? []).map((r: any) => ({
    id: toId(r.name),
    name: String(r.name),
    nameTh: toThRoom(r.name),
    pricePerFourWeeks: Number(r.pricePerFourWeeks ?? 0)
  })).filter((r: any) => r.pricePerFourWeeks > 0);

  const localFeesByWeek: Record<string, number> = {};
  if (parsed.localFeesByWeek) {
    for (const [k, v] of Object.entries(parsed.localFeesByWeek)) {
      if (!isNaN(Number(k)) && !isNaN(Number(v))) {
        localFeesByWeek[k] = Number(v);
      }
    }
  }

  return {
    courses,
    rooms,
    localFeesByWeek,
    enrollmentFee: Number(parsed.enrollmentFee ?? 100)
  };
}

// ─── Route ───────────────────────────────────────────────────────────────────

// POST /api/schools/:id/parse-price
router.post('/:id/parse-price', requireAuth, upload.single('file'), async (req, res) => {
  if (!req.file) { res.status(400).json({ error: 'No file uploaded' }); return; }

  try {
    const ext = (req.file.originalname.split('.').pop() ?? '').toLowerCase();
    const mimeType = req.file.mimetype;

    let pricing: PricingResult;

    if (ext === 'pdf') {
      const pdfData = await pdfParse(req.file.buffer);
      pricing = parsePricePDF(pdfData.text);
      if (pricing.courses.length === 0 && pricing.rooms.length === 0) {
        res.status(422).json({ error: 'ไม่พบข้อมูลราคาใน PDF — กรุณาตรวจสอบรูปแบบไฟล์' });
        return;
      }
    } else if (['xlsx', 'xls'].includes(ext)) {
      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      pricing = parseCIAExcel(workbook);
    } else if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext) || mimeType.startsWith('image/')) {
      pricing = await parseImagePrice(req.file.buffer, mimeType);
    } else {
      res.status(400).json({ error: 'รองรับเฉพาะไฟล์ Excel (.xlsx / .xls), PDF (.pdf) หรือรูปภาพ (JPEG/PNG/WEBP)' });
      return;
    }

    res.json({ ok: true, pricing });
  } catch (err) {
    res.status(500).json({ error: 'ไม่สามารถอ่านไฟล์ได้', message: String(err) });
  }
});

export default router;
