import { Router } from 'express';
import { eq, desc, and, gte, count, inArray } from 'drizzle-orm';
import { db } from '../lib/db.js';
import { requireAuth } from '../middlewares/auth.js';
import { contactSubmissionsTable, formSubmissionsTable, seminarRegistrationsTable, siteSettingsTable, newsletterSubscribersTable } from '@workspace/db';
import { sendEmail } from '../lib/email.js';

async function autoAddSubscriber(opts: { email: string; name?: string; phone?: string; lineId?: string; source: string }) {
  if (!opts.email) return;
  try {
    await db.insert(newsletterSubscribersTable)
      .values({ email: opts.email.trim().toLowerCase(), name: opts.name, phone: opts.phone, lineId: opts.lineId, source: opts.source })
      .onConflictDoUpdate({
        target: newsletterSubscribersTable.email,
        set: { name: opts.name, ...(opts.phone ? { phone: opts.phone } : {}), ...(opts.lineId ? { lineId: opts.lineId } : {}) },
      });
  } catch { /* non-critical */ }
}

const FALLBACK_EMAIL = process.env.ADMIN_EMAIL || 'info@philingoedu.com';

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

const router = Router();

// POST /contacts/contact — public form submission
router.post('/contact', async (req, res) => {
  try {
    const { name, email, phone, subject, message, utmSource, utmMedium, utmCampaign } = req.body;
    if (!name) {
      res.status(400).json({ error: 'Bad Request', message: 'Name is required' });
      return;
    }
    const safeEmail = email?.trim() || '';
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '';
    const [row] = await db.insert(contactSubmissionsTable).values({
      name, email: safeEmail, phone, subject, message,
      utmSource, utmMedium, utmCampaign, ipAddress: ip, status: 'new',
    }).returning();
    // Email + LINE notification
    const { email: notifyEmail, lineToken } = await getNotifySettings();

    const crow = (label: string, val?: string | null) =>
      val ? `<tr><td style="padding:6px 12px;font-weight:600;color:#555;white-space:nowrap;width:120px">${label}</td><td style="padding:6px 12px;color:#111">${val}</td></tr>` : '';

    const adminHtml = `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
  <div style="background:#1B4FD8;color:#fff;padding:20px 24px;border-radius:8px 8px 0 0">
    <h2 style="margin:0;font-size:18px">💬 ข้อความใหม่จาก ${name}</h2>
    <p style="margin:4px 0 0;opacity:.8;font-size:13px">Ref #${row.id} · ${new Date().toLocaleString('th-TH')}</p>
  </div>
  <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #e5e7eb;border-top:none">
    ${crow('ชื่อ', name)}
    ${crow('อีเมล', email)}
    ${crow('เบอร์โทร', phone)}
    ${crow('เรื่อง', subject)}
    ${crow('ข้อความ', message?.replace(/\n/g, '<br>'))}
  </table>
</div>`;

    const userHtml = `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
  <div style="background:#1B4FD8;color:#fff;padding:20px 24px;border-radius:8px 8px 0 0">
    <h2 style="margin:0;font-size:18px">✅ Philingo ได้รับข้อความของคุณแล้ว</h2>
    <p style="margin:4px 0 0;opacity:.8;font-size:13px">ทีมงานจะติดต่อกลับภายใน 24 ชั่วโมง</p>
  </div>
  <div style="background:#fff;border:1px solid #e5e7eb;border-top:none;padding:20px 24px">
    <p style="margin:0 0 16px;color:#374151">สวัสดีคุณ <b>${name}</b>,</p>
    <p style="margin:0 0 16px;color:#374151">เราได้รับข้อความของคุณแล้ว นี่คือข้อมูลที่คุณส่งมา:</p>
    <table style="width:100%;border-collapse:collapse;background:#f9fafb;border-radius:8px;overflow:hidden">
      ${crow('ชื่อ', name)}
      ${crow('อีเมล', email)}
      ${crow('เบอร์โทร', phone)}
      ${crow('เรื่อง', subject)}
      ${crow('ข้อความ', message?.replace(/\n/g, '<br>'))}
    </table>
    <div style="margin-top:20px;padding:14px;background:#eff6ff;border-radius:8px;border-left:4px solid #1B4FD8">
      <p style="margin:0;font-weight:600;color:#1e40af">ติดต่อทีม Philingo</p>
      <p style="margin:4px 0 0;color:#374151;font-size:14px">📞 061-656-4159 &nbsp;|&nbsp; 💬 LINE: @philingo</p>
    </div>
    <p style="margin:16px 0 0;font-size:12px;color:#9ca3af;text-align:center">Philingo — Thai Study Abroad Consultant · philingoedu.com</p>
  </div>
</div>`;

    await Promise.all([
      sendEmail({ to: notifyEmail, subject: `[Philingo] ข้อความใหม่จาก ${name}`, html: adminHtml }),
      sendEmail({ to: email, subject: `✅ Philingo ได้รับข้อความของคุณแล้ว`, html: userHtml }),
      lineNotify(lineToken, `💬 ข้อความใหม่\n👤 ${name}\n📞 ${phone || '-'}\n✉️ ${email}\n📌 เรื่อง: ${subject || '-'}`),
      autoAddSubscriber({ email, name, phone: phone || undefined, source: 'contact' }),
    ]);
    res.json({ ok: true, id: row.id });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', message: String(err) });
  }
});

// GET /contacts — admin list
router.get('/', requireAuth, async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Number(req.query.limit) || 20);
    const offset = (page - 1) * limit;
    const status = req.query.status as string | undefined;
    const where = status ? eq(contactSubmissionsTable.status, status as 'new' | 'in_progress' | 'replied' | 'closed') : undefined;
    const [{ total }] = await db.select({ total: count() }).from(contactSubmissionsTable).where(where);
    const data = await db.select().from(contactSubmissionsTable).where(where).orderBy(desc(contactSubmissionsTable.createdAt)).limit(limit).offset(offset);
    res.json({ data, total, page, limit });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', message: String(err) });
  }
});

// PATCH /contacts/:id/status — admin update
router.patch('/:id/status', requireAuth, async (req, res) => {
  try {
    const id = parseInt(String(req.params.id));
    const { status, adminNotes } = req.body;
    const [row] = await db.update(contactSubmissionsTable).set({ status, adminNotes }).where(eq(contactSubmissionsTable.id, id)).returning();
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', message: String(err) });
  }
});

// GET /contacts/stats — admin stats
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [total] = await db.select({ c: count() }).from(contactSubmissionsTable);
    const [newCount] = await db.select({ c: count() }).from(contactSubmissionsTable).where(gte(contactSubmissionsTable.createdAt, since));
    res.json({ total: total.c, newLast7d: newCount.c });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', message: String(err) });
  }
});

export default router;
