import { Router } from 'express';
import { eq, desc, and, count, gte, lte, inArray } from 'drizzle-orm';
import { db } from '../lib/db.js';
import { requireAuth } from '../middlewares/auth.js';
import { formSubmissionsTable, seminarRegistrationsTable, siteSettingsTable, newsletterSubscribersTable } from '@workspace/db';
import { sendEmail } from '../lib/email.js';

/** Auto-add a subscriber to the newsletter list (silent — never throws) */
async function autoAddSubscriber(opts: {
  email: string; name?: string; phone?: string; lineId?: string; source: string;
}): Promise<void> {
  if (!opts.email) return;
  try {
    await db.insert(newsletterSubscribersTable)
      .values({
        email: opts.email.trim().toLowerCase(),
        name: opts.name,
        phone: opts.phone,
        lineId: opts.lineId,
        source: opts.source,
      })
      .onConflictDoUpdate({
        target: newsletterSubscribersTable.email,
        set: {
          name: opts.name,
          ...(opts.phone ? { phone: opts.phone } : {}),
          ...(opts.lineId ? { lineId: opts.lineId } : {}),
        },
      });
  } catch { /* non-critical */ }
}

const router = Router();

const FALLBACK_EMAIL = process.env.ADMIN_EMAIL || 'info@philingoedu.com';

/** Session metadata for email labels */
const SESSION_MAP: Record<string, { school: string; date: string; time: string }> = {
  '2026-08-29-am':      { school: "B'Cebu",            date: 'เสาร์ 29 ส.ค. 2569',    time: '10:00–11:00 น.' },
  '2026-08-29-pm':      { school: 'Philinter Academy',  date: 'เสาร์ 29 ส.ค. 2569',    time: '14:00–15:00 น.' },
  '2026-08-30-am':      { school: 'EV Academy',         date: 'อาทิตย์ 30 ส.ค. 2569',  time: '10:00–11:00 น.' },
  '2026-09-05-am':      { school: 'CPILS',              date: 'เสาร์ 5 ก.ย. 2569',     time: '10:00–11:00 น.' },
  '2026-09-05-pm':      { school: 'I.BREEZE',           date: 'เสาร์ 5 ก.ย. 2569',     time: '14:00–15:00 น.' },
  '2026-09-06-am':      { school: 'QQ English',         date: 'อาทิตย์ 6 ก.ย. 2569',   time: '10:00–11:00 น.' },
  '2026-09-12-special': { school: 'CIA (รอบพิเศษ)',    date: 'เสาร์ 12 ก.ย. 2569 ✨',  time: '10:30 น. เป็นต้นไป' },
};

/** Fetch public contact info + the correct Google Meet link for the chosen session */
async function getContactSettings(preferredDate?: string): Promise<{
  lineId: string; phone: string; meetLink: string; lineUrl: string;
  sessionLabel: string; sessionSchool: string; sessionTime: string;
}> {
  const sessionKey = preferredDate && preferredDate !== 'all' ? `meet_${preferredDate}` : null;
  const keysToFetch = ['line_id', 'phone', 'seminar_meet_link', 'line_url',
    ...(sessionKey ? [sessionKey] : [])];
  const fallback = {
    lineId: '@philingo', phone: '061-656-4159', meetLink: '', lineUrl: 'https://lin.ee/zmlkhOn0',
    sessionLabel: '29 ส.ค. – 12 ก.ย. 2569', sessionSchool: '', sessionTime: '10:00–11:00 น.',
  };
  try {
    const rows = await db.select().from(siteSettingsTable).where(inArray(siteSettingsTable.key, keysToFetch));
    const m: Record<string, string> = {};
    for (const r of rows) m[r.key] = r.value ?? '';
    const meta = preferredDate && SESSION_MAP[preferredDate] ? SESSION_MAP[preferredDate] : null;
    // Session-specific link first, fall back to global seminar_meet_link
    const meetLink = (sessionKey ? m[sessionKey] : '') || m['seminar_meet_link'] || '';
    return {
      lineId:        m['line_id']  || fallback.lineId,
      phone:         m['phone']    || fallback.phone,
      lineUrl:       m['line_url'] || fallback.lineUrl,
      meetLink,
      sessionLabel:  meta ? meta.date  : fallback.sessionLabel,
      sessionSchool: meta ? meta.school : fallback.sessionSchool,
      sessionTime:   meta ? meta.time  : fallback.sessionTime,
    };
  } catch {
    return fallback;
  }
}

/** Fetch notification settings from DB (notification_email + line_notify_token) */
async function getNotifySettings(): Promise<{ email: string; lineToken: string }> {
  try {
    const rows = await db.select().from(siteSettingsTable).where(
      inArray(siteSettingsTable.key, ['notification_email', 'line_notify_token'])
    );
    const m: Record<string, string> = {};
    for (const r of rows) m[r.key] = r.value ?? '';
    return { email: m['notification_email'] || FALLBACK_EMAIL, lineToken: m['line_notify_token'] || '' };
  } catch {
    return { email: FALLBACK_EMAIL, lineToken: '' };
  }
}

/** Get visitor count summary */
async function getVisitorCount(): Promise<{ total: number; today: number }> {
  try {
    const rows = await db.select().from(siteSettingsTable).where(
      inArray(siteSettingsTable.key, ['analytics_views_total', 'analytics_views_today', 'analytics_views_date'])
    );
    const m: Record<string, string> = {};
    for (const r of rows) m[r.key] = r.value ?? '0';
    const todayStr = new Date().toISOString().slice(0, 10);
    return {
      total: parseInt(m['analytics_views_total'] ?? '0', 10),
      today: m['analytics_views_date'] === todayStr ? parseInt(m['analytics_views_today'] ?? '0', 10) : 0,
    };
  } catch {
    return { total: 0, today: 0 };
  }
}

/** Send LINE Notify message if token is set */
async function lineNotify(token: string, message: string): Promise<void> {
  if (!token) return;
  try {
    await fetch('https://notify-api.line.me/api/notify', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ message }).toString(),
    });
  } catch (e) {
    console.warn('[LINE Notify] failed:', e);
  }
}

// POST /forms/submit — public form submission
router.post('/submit', async (req, res) => {
  try {
    const { type, name, email, phone, schoolInterest, programInterest, startDate, duration, budget, message, utmSource, utmMedium, utmCampaign } = req.body;
    if (!name || !type) {
      res.status(400).json({ error: 'Bad Request', message: 'name and type are required' });
      return;
    }
    const safeEmail = email?.trim() || '';
    const [row] = await db.insert(formSubmissionsTable).values({
      type, name, email: safeEmail, phone, schoolInterest, programInterest, startDate, duration, budget, message,
      utmSource, utmMedium, utmCampaign, status: 'new',
    }).returning();
    // Extract LINE ID from message field (format: "LINE ID: @abc\n...")
    const lineIdMatch = message?.match(/LINE ID:\s*([^\n]+)/);
    const lineId = lineIdMatch?.[1]?.trim() || '';
    const { email: notifyEmail, lineToken } = await getNotifySettings();
    const visitors = await getVisitorCount();

    // ── Helper: build a styled row ────────────────────────────────────
    const row_ = (label: string, val?: string | null) =>
      val ? `<tr><td style="padding:6px 12px;font-weight:600;color:#555;white-space:nowrap;width:140px">${label}</td><td style="padding:6px 12px;color:#111">${val}</td></tr>` : '';

    const typeLabel: Record<string, string> = { contact: 'ติดต่อ', apply: 'สมัครเรียน', consult: 'ปรึกษาฟรี', quotation: 'ขอใบเสนอราคา', scholarship: 'ทุนการศึกษา', seminar: 'ลงทะเบียนสัมมนา' };

    // ── Admin notification (full data) ────────────────────────────────
    const adminHtml = `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
  <div style="background:#1B4FD8;color:#fff;padding:20px 24px;border-radius:8px 8px 0 0">
    <h2 style="margin:0;font-size:18px">📋 แบบฟอร์มใหม่ — ${typeLabel[type] || type}</h2>
    <p style="margin:4px 0 0;opacity:.8;font-size:13px">Ref #${row.id} · ${new Date().toLocaleString('th-TH')}</p>
  </div>
  <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #e5e7eb;border-top:none">
    ${row_('ชื่อ', name)}
    ${row_('อีเมล', safeEmail)}
    ${row_('เบอร์โทร', phone)}
    ${row_('LINE ID', lineId)}
    ${row_('โรงเรียนที่สนใจ', schoolInterest)}
    ${row_('หลักสูตร', programInterest)}
    ${row_('วันที่ต้องการเริ่ม', startDate)}
    ${row_('ระยะเวลา', duration)}
    ${row_('งบประมาณ', budget)}
    ${row_('ข้อความ', message?.replace(/\n/g, '<br>'))}
  </table>
  <p style="margin:12px 0 0;font-size:12px;color:#9ca3af">📊 ผู้เข้าชมวันนี้ ${visitors.today.toLocaleString()} · ทั้งหมด ${visitors.total.toLocaleString()}</p>
</div>`;

    // ── User auto-reply (shows their submitted data) ──────────────────
    const userAutoReply = safeEmail ? (async () => {
      const c = await getContactSettings();
      const userHtml = `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
  <div style="background:#1B4FD8;color:#fff;padding:20px 24px;border-radius:8px 8px 0 0">
    <h2 style="margin:0;font-size:18px">✅ Philingo ได้รับข้อมูลของคุณแล้ว</h2>
    <p style="margin:4px 0 0;opacity:.8;font-size:13px">ทีมงานจะติดต่อกลับภายใน 24 ชั่วโมง</p>
  </div>
  <div style="background:#fff;border:1px solid #e5e7eb;border-top:none;padding:20px 24px">
    <p style="margin:0 0 16px;color:#374151">สวัสดีคุณ <b>${name}</b>,</p>
    <p style="margin:0 0 16px;color:#374151">เราได้รับข้อมูลของคุณเรียบร้อยแล้ว นี่คือสรุปข้อมูลที่คุณส่งมา:</p>
    <table style="width:100%;border-collapse:collapse;background:#f9fafb;border-radius:8px;overflow:hidden">
      ${row_('ประเภทคำขอ', typeLabel[type] || type)}
      ${row_('ชื่อ', name)}
      ${row_('อีเมล', safeEmail)}
      ${row_('เบอร์โทร', phone)}
      ${row_('LINE ID', lineId)}
      ${row_('โรงเรียนที่สนใจ', schoolInterest)}
      ${row_('หลักสูตร', programInterest)}
      ${row_('วันที่ต้องการเริ่ม', startDate)}
      ${row_('ระยะเวลา', duration)}
      ${row_('งบประมาณ', budget)}
      ${row_('ข้อความ', message?.replace(/\n/g, '<br>'))}
    </table>
    <div style="margin-top:24px;padding:16px;background:#eff6ff;border-radius:8px;border-left:4px solid #1B4FD8">
      <p style="margin:0;font-weight:600;color:#1e40af">ติดต่อทีม Philingo</p>
      <p style="margin:4px 0 0;color:#374151;font-size:14px">📞 ${c.phone} &nbsp;|&nbsp; 💬 LINE: ${c.lineId}</p>
    </div>
    <p style="margin:16px 0 0;font-size:12px;color:#9ca3af;text-align:center">Philingo — Thai Study Abroad Consultant · philingo.co.th</p>
  </div>
</div>`;
      return sendEmail({ to: safeEmail, subject: `✅ Philingo ได้รับ${typeLabel[type] || 'แบบฟอร์ม'}ของคุณแล้ว`, html: userHtml });
    })() : Promise.resolve();

    await Promise.all([
      sendEmail({ to: notifyEmail, subject: `[Philingo] ${typeLabel[type] || type} จาก ${name}`, html: adminHtml }),
      userAutoReply,
      lineNotify(lineToken, `📋 แบบฟอร์มใหม่ [${typeLabel[type] || type}]\n👤 ${name}\n📞 ${phone || '-'}\n✉️ ${safeEmail || '-'}\n💬 LINE: ${lineId || '-'}\n🏫 ${schoolInterest || '-'}`),
      autoAddSubscriber({ email: safeEmail || undefined, name, phone: phone || undefined, lineId: lineId || undefined, source: 'form' }),
    ]);
    res.json({ ok: true, id: row.id });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', message: String(err) });
  }
});

// POST /forms/seminar — seminar registration
router.post('/seminar', async (req, res) => {
  try {
    const { eventName, name, email, phone, lineId, schoolInterest, programInterest, numParticipants, specialRequests, preferredDate, utmSource, utmMedium, utmCampaign } = req.body;
    if (!name || !phone) {
      res.status(400).json({ error: 'Bad Request', message: 'name and phone required' });
      return;
    }
    const safeEmail = email?.trim() || '';
    const [row] = await db.insert(seminarRegistrationsTable).values({
      eventName: eventName || 'Philingo Cebu Online Education Fair 2026',
      name, email: safeEmail, phone, schoolInterest, programInterest, numParticipants, specialRequests,
      utmSource, utmMedium, utmCampaign, status: 'new',
    }).returning();
    const { email: notifyEmail, lineToken } = await getNotifySettings();
    const visitors2 = await getVisitorCount();

    const srow = (label: string, val?: string | null) =>
      val ? `<tr><td style="padding:6px 12px;font-weight:600;color:#555;white-space:nowrap;width:160px">${label}</td><td style="padding:6px 12px;color:#111">${val}</td></tr>` : '';

    const adminHtml2 = `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
  <div style="background:#1B4FD8;color:#fff;padding:20px 24px;border-radius:8px 8px 0 0">
    <h2 style="margin:0;font-size:18px">🎪 ลงทะเบียนงาน — ${row.eventName}</h2>
    <p style="margin:4px 0 0;opacity:.8;font-size:13px">Ref #${row.id} · ${new Date().toLocaleString('th-TH')}</p>
  </div>
  <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #e5e7eb;border-top:none">
    ${srow('ชื่อ', name)}
    ${srow('เบอร์โทร', phone)}
    ${srow('LINE ID', lineId)}
    ${srow('อีเมล', safeEmail)}
    ${srow('โรงเรียนที่สนใจ', schoolInterest)}
    ${srow('หลักสูตรที่สนใจ', programInterest)}
    ${srow('จำนวนผู้เข้าร่วม', String(numParticipants || 1))}
    ${srow('คำขอพิเศษ', specialRequests)}
  </table>
  <p style="margin:12px 0 0;font-size:12px;color:#9ca3af">📊 ผู้เข้าชมวันนี้ ${visitors2.today.toLocaleString()} · ทั้งหมด ${visitors2.total.toLocaleString()}</p>
</div>`;

    const userHtml2 = safeEmail ? (async () => {
      const c = await getContactSettings(preferredDate);
      const sessionLine = c.sessionSchool
        ? `${c.sessionLabel} · ${c.sessionSchool} · ${c.sessionTime}`
        : `29 ส.ค. – 12 ก.ย. 2569 · เวลา 10:00–11:00 น.`;

      const meetBlock = c.meetLink
        ? `<!-- Google Meet CTA -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px">
            <tr>
              <td style="background:#1B4FD8;border-radius:12px;padding:20px 24px;text-align:center">
                <p style="margin:0 0 4px;color:#bfdbfe;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px">🎥 ลิงก์ Google Meet ของคุณ</p>
                <p style="margin:0 0 12px;color:#fff;font-size:14px">${sessionLine}</p>
                <a href="${c.meetLink}" style="display:inline-block;background:#fff;color:#1B4FD8;font-weight:700;padding:12px 32px;border-radius:8px;text-decoration:none;font-size:15px">
                  เข้าร่วม Google Meet →
                </a>
                <p style="margin:10px 0 0;color:#bfdbfe;font-size:11px">⏰ กรุณาเข้าก่อนเวลาอย่างน้อย 5 นาที</p>
              </td>
            </tr>
          </table>`
        : `<div style="margin-top:16px;padding:14px;background:#fef9c3;border-radius:8px;border-left:4px solid #eab308">
            <p style="margin:0;font-weight:600;color:#713f12">📅 ${sessionLine}</p>
            <p style="margin:6px 0 0;color:#374151;font-size:13px">ทีมงานจะส่งลิงก์ Google Meet ให้ทาง LINE Official ก่อนวันงาน 1–2 วัน</p>
          </div>`;

      const promoBlock = `
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px">
          <tr>
            <td style="background:linear-gradient(135deg,#fff7ed,#fef3c7);border:1px solid #fed7aa;border-radius:12px;padding:16px 20px">
              <p style="margin:0 0 6px;font-weight:700;color:#c2410c;font-size:14px">🎁 สิทธิพิเศษสำหรับผู้เข้าร่วมงาน</p>
              <p style="margin:0;font-size:13px;color:#374151;line-height:1.7">
                ผู้ที่เข้าร่วมงานและสมัครเรียนผ่าน Philingo จะได้รับโปรโมชั่นและสิทธิพิเศษต่างๆ<br>
                <b>เป็นไปตามเงื่อนไขที่แต่ละสถาบันกำหนด</b>
              </p>
            </td>
          </tr>
        </table>`;

      const html = `
<div style="font-family:'Sarabun',sans-serif;max-width:600px;margin:0 auto;background:#f8fafc">
  <!-- Header -->
  <div style="background:linear-gradient(135deg,#1B4FD8,#0ea5e9);padding:28px 28px 24px;border-radius:12px 12px 0 0;text-align:center">
    <div style="font-size:40px;margin-bottom:8px">🎉</div>
    <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700">ลงทะเบียนสำเร็จแล้ว!</h1>
    <p style="margin:6px 0 0;color:#bfdbfe;font-size:13px">${row.eventName}</p>
  </div>

  <!-- Body -->
  <div style="background:#fff;border:1px solid #e2e8f0;border-top:none;padding:24px 28px;border-radius:0 0 12px 12px">

    <p style="margin:0 0 6px;color:#1e293b;font-size:15px">สวัสดีคุณ <b>${name}</b> 👋</p>
    <p style="margin:0 0 20px;color:#475569;font-size:14px;line-height:1.6">
      ขอบคุณที่ลงทะเบียนเข้าร่วม <b>${row.eventName}</b>!<br>
      เราดีใจมากที่จะได้พบคุณในงาน 🇵🇭
    </p>

    ${meetBlock}
    ${promoBlock}

    <!-- Registration summary -->
    <p style="margin:20px 0 8px;font-weight:600;color:#1e293b;font-size:13px">📋 ข้อมูลที่ลงทะเบียน</p>
    <table style="width:100%;border-collapse:collapse;background:#f8fafc;border-radius:8px;overflow:hidden;font-size:13px">
      ${srow('ชื่อ', name)}
      ${srow('เบอร์โทร', phone)}
      ${srow('LINE ID', lineId)}
      ${srow('โรงเรียนที่สนใจ', schoolInterest)}
      ${srow('หลักสูตรที่สนใจ', programInterest)}
      ${c.sessionSchool ? srow('Session ที่เลือก', `${c.sessionSchool} · ${c.sessionLabel}`) : ''}
    </table>

    <!-- Tips -->
    <div style="margin-top:16px;padding:14px 18px;background:#f0f9ff;border-radius:10px;border-left:4px solid #0ea5e9">
      <p style="margin:0 0 8px;font-weight:700;color:#0369a1;font-size:13px">💡 เตรียมพร้อมก่อนวันงาน</p>
      <ul style="margin:0;padding-left:18px;color:#334155;font-size:13px;line-height:1.8">
        <li>เตรียมคำถามที่อยากถามผู้แทนโรงเรียนไว้ล่วงหน้า</li>
        <li>เปิดเบราเซอร์บนคอมพิวเตอร์เพื่อประสบการณ์ที่ดีที่สุด</li>
        <li>เพิ่ม LINE Official Philingo เพื่อรับการแจ้งเตือนก่อนงาน</li>
      </ul>
    </div>

    <!-- LINE CTA -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px">
      <tr>
        <td style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:14px 18px">
          <p style="margin:0 0 8px;font-weight:600;color:#166534;font-size:13px">🟢 เพิ่ม LINE Official — รับข่าวสารและลิงก์งานก่อนใคร</p>
          <a href="${c.lineUrl}" style="display:inline-block;background:#00B900;color:#fff;font-weight:700;padding:10px 24px;border-radius:8px;text-decoration:none;font-size:13px">
            ➕ เพิ่ม LINE @philingo
          </a>
        </td>
      </tr>
    </table>

    <!-- Contact -->
    <div style="margin-top:16px;padding:12px 18px;background:#eff6ff;border-radius:10px">
      <p style="margin:0;font-size:13px;color:#1e40af;font-weight:600">📞 มีคำถาม? ติดต่อทีม Philingo</p>
      <p style="margin:4px 0 0;font-size:13px;color:#374151">${c.phone} &nbsp;|&nbsp; LINE: ${c.lineId}</p>
    </div>

    <p style="margin:20px 0 0;font-size:11px;color:#94a3b8;text-align:center">
      Philingo — Thai Study Abroad Consultant · philingoedu.com<br>
      อีเมลนี้ส่งอัตโนมัติ ไม่ต้องตอบกลับ
    </p>
  </div>
</div>`;
      const hasLink = !!c.meetLink;
      const subject = hasLink
        ? `✅ ลงทะเบียนสำเร็จ — ลิงก์ Google Meet ${c.sessionSchool || 'งานสัมมนา'} อยู่ในอีเมลนี้`
        : `✅ ลงทะเบียน ${row.eventName} สำเร็จ — รอรับลิงก์ Meet ทาง LINE`;
      return sendEmail({ to: safeEmail, subject, html });
    })() : Promise.resolve();

    await Promise.all([
      sendEmail({ to: notifyEmail, subject: `[Philingo] ลงทะเบียนงาน ${row.eventName} — ${name}`, html: adminHtml2 }),
      userHtml2,
      lineNotify(lineToken, `🎪 ลงทะเบียนงาน: ${row.eventName}\n👤 ${name}\n📞 ${phone}\n💬 LINE: ${lineId || '-'}\n✉️ ${safeEmail || '-'}\n🏫 ${schoolInterest || '-'}\n👥 จำนวน: ${numParticipants || 1} คน`),
      ...(safeEmail ? [autoAddSubscriber({ email: safeEmail, name, phone: phone || undefined, source: 'seminar' })] : []),
    ]);
    res.json({ ok: true, id: row.id });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', message: String(err) });
  }
});

// GET /forms — admin list
router.get('/', requireAuth, async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Number(req.query.limit) || 20);
    const offset = (page - 1) * limit;
    const conditions = [];
    if (req.query.type) conditions.push(eq(formSubmissionsTable.type, req.query.type as 'contact' | 'apply' | 'consult' | 'quotation' | 'scholarship' | 'seminar'));
    const where = conditions.length ? and(...conditions) : undefined;
    const [{ total }] = await db.select({ total: count() }).from(formSubmissionsTable).where(where);
    const data = await db.select().from(formSubmissionsTable).where(where).orderBy(desc(formSubmissionsTable.createdAt)).limit(limit).offset(offset);
    res.json({ data, total, page, limit });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', message: String(err) });
  }
});

// GET /forms/seminars — admin seminar registrations
router.get('/seminars', requireAuth, async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Number(req.query.limit) || 20);
    const offset = (page - 1) * limit;
    const [{ total }] = await db.select({ total: count() }).from(seminarRegistrationsTable);
    const data = await db.select().from(seminarRegistrationsTable).orderBy(desc(seminarRegistrationsTable.createdAt)).limit(limit).offset(offset);
    res.json({ data, total, page, limit });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', message: String(err) });
  }
});

// PATCH /forms/:id/status
router.patch('/:id/status', requireAuth, async (req, res) => {
  try {
    const id = parseInt(String(req.params.id));
    const { status, adminNotes } = req.body;
    const [row] = await db.update(formSubmissionsTable).set({ status, adminNotes }).where(eq(formSubmissionsTable.id, id)).returning();
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', message: String(err) });
  }
});

// GET /forms/export — CSV download (authenticated)
router.get('/export', requireAuth, async (req, res) => {
  try {
    const conditions: ReturnType<typeof eq>[] = [];
    if (req.query.type) conditions.push(eq(formSubmissionsTable.type, req.query.type as 'contact' | 'apply' | 'consult' | 'quotation' | 'scholarship' | 'seminar'));
    if (req.query.from) conditions.push(gte(formSubmissionsTable.createdAt, new Date(String(req.query.from))));
    if (req.query.to) {
      const toDate = new Date(String(req.query.to));
      toDate.setHours(23, 59, 59, 999);
      conditions.push(lte(formSubmissionsTable.createdAt, toDate));
    }
    const where = conditions.length ? and(...conditions) : undefined;
    const rows = await db.select().from(formSubmissionsTable).where(where).orderBy(desc(formSubmissionsTable.createdAt));

    const headers = ['ID','ประเภท','ชื่อ','อีเมล','โทรศัพท์','โรงเรียนที่สนใจ','หลักสูตร','วันเริ่ม','ระยะเวลา','งบประมาณ','ข้อความ','สถานะ','UTM Source','UTM Medium','UTM Campaign','วันที่ส่ง'];
    const csvRows = rows.map(r => [
      r.id, r.type, r.name, r.email, r.phone ?? '', r.schoolInterest ?? '', r.programInterest ?? '',
      r.startDate ?? '', r.duration ?? '', r.budget ?? '', r.message ?? '', r.status,
      r.utmSource ?? '', r.utmMedium ?? '', r.utmCampaign ?? '',
      r.createdAt.toISOString().replace('T', ' ').slice(0, 19),
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));

    const csv = [headers.join(','), ...csvRows].join('\r\n');
    const date = new Date().toISOString().split('T')[0];
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="forms-${date}.csv"`);
    res.send('\uFEFF' + csv); // UTF-8 BOM for Excel
  } catch (err) {
    res.status(500).json({ error: 'Export failed', message: String(err) });
  }
});

// GET /forms/seminars/export — CSV download (authenticated)
router.get('/seminars/export', requireAuth, async (req, res) => {
  try {
    const conditions: ReturnType<typeof eq>[] = [];
    if (req.query.from) conditions.push(gte(seminarRegistrationsTable.createdAt, new Date(String(req.query.from))));
    if (req.query.to) {
      const toDate = new Date(String(req.query.to));
      toDate.setHours(23, 59, 59, 999);
      conditions.push(lte(seminarRegistrationsTable.createdAt, toDate));
    }
    const where = conditions.length ? and(...conditions) : undefined;
    const rows = await db.select().from(seminarRegistrationsTable).where(where).orderBy(desc(seminarRegistrationsTable.createdAt));

    const headers = ['ID','งานสัมมนา','ชื่อ','อีเมล','โทรศัพท์','โรงเรียนที่สนใจ','หลักสูตร','จำนวนผู้เข้าร่วม','ความต้องการพิเศษ','สถานะ','UTM Source','UTM Medium','วันที่ลงทะเบียน'];
    const csvRows = rows.map(r => [
      r.id, r.eventName, r.name, r.email, r.phone, r.schoolInterest ?? '', r.programInterest ?? '',
      r.numParticipants ?? '', r.specialRequests ?? '', r.status,
      r.utmSource ?? '', r.utmMedium ?? '',
      r.createdAt.toISOString().replace('T', ' ').slice(0, 19),
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));

    const csv = [headers.join(','), ...csvRows].join('\r\n');
    const date = new Date().toISOString().split('T')[0];
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="seminar-registrations-${date}.csv"`);
    res.send('\uFEFF' + csv);
  } catch (err) {
    res.status(500).json({ error: 'Export failed', message: String(err) });
  }
});

// GET /forms/stats
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [total] = await db.select({ c: count() }).from(formSubmissionsTable);
    const [newCount] = await db.select({ c: count() }).from(formSubmissionsTable).where(gte(formSubmissionsTable.createdAt, since));
    const [seminars] = await db.select({ c: count() }).from(seminarRegistrationsTable);
    res.json({ total: total.c, newLast7d: newCount.c, seminars: seminars.c });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', message: String(err) });
  }
});

export default router;
