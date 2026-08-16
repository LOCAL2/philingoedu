import { Router } from "express";
import { db } from "@workspace/db";
import { newsletterSubscribersTable, newsletterCampaignsTable, contactSubmissionsTable, seminarRegistrationsTable, formSubmissionsTable, siteSettingsTable } from "@workspace/db/schema";
import { eq, desc, sql, and, ne, inArray } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth.js";
import { sendEmail } from "../lib/email.js";
import { logger } from "../lib/logger.js";

const router = Router();

// GET /api/newsletter/subscribers — list all subscribers (admin)
router.get("/subscribers", requireAuth, async (req, res) => {
  const { page = "1", limit = "50" } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  const [rows, [{ count }]] = await Promise.all([
    db.select().from(newsletterSubscribersTable)
      .orderBy(desc(newsletterSubscribersTable.createdAt))
      .limit(Number(limit)).offset(offset),
    db.select({ count: sql<number>`count(*)::int` }).from(newsletterSubscribersTable),
  ]);

  res.json({ data: rows, total: count, page: Number(page), limit: Number(limit) });
});

// POST /api/newsletter/subscribers — add subscriber manually (admin)
router.post("/subscribers", requireAuth, async (req, res) => {
  const { email, name, phone, lineId, source = "manual" } = req.body;
  if (!email) { res.status(400).json({ error: "Email required" }); return; }
  try {
    const [row] = await db.insert(newsletterSubscribersTable)
      .values({ email: email.trim().toLowerCase(), name, phone, lineId, source })
      .onConflictDoUpdate({
        target: newsletterSubscribersTable.email,
        set: { name, ...(phone ? { phone } : {}), ...(lineId ? { lineId } : {}) },
      })
      .returning();
    res.status(201).json(row);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/newsletter/subscribers/:id
router.delete("/subscribers/:id", requireAuth, async (req, res) => {
  await db.delete(newsletterSubscribersTable)
    .where(eq(newsletterSubscribersTable.id, Number(req.params.id)));
  res.json({ success: true });
});

// POST /api/newsletter/import — auto-import from all form sources (preserves lineId/phone)
router.post("/import", requireAuth, async (req, res) => {
  // Fetch contacts + seminars + form submissions
  const [contacts, seminars, forms] = await Promise.all([
    db.select({ email: contactSubmissionsTable.email, name: contactSubmissionsTable.name, phone: contactSubmissionsTable.phone })
      .from(contactSubmissionsTable),
    db.select({ email: seminarRegistrationsTable.email, name: seminarRegistrationsTable.name, phone: seminarRegistrationsTable.phone })
      .from(seminarRegistrationsTable),
    db.select({ email: formSubmissionsTable.email, name: formSubmissionsTable.name, phone: formSubmissionsTable.phone, message: formSubmissionsTable.message })
      .from(formSubmissionsTable),
  ]);

  const all = [
    ...contacts.map(r => ({ ...r, lineId: undefined as string | undefined, source: "contact" as const })),
    ...seminars.map(r => ({ ...r, lineId: undefined as string | undefined, source: "seminar" as const })),
    ...forms.map(r => {
      const match = r.message?.match(/LINE ID:\s*([^\n]+)/);
      return { ...r, lineId: match?.[1]?.trim() || undefined, source: "form" as const };
    }),
  ];

  let imported = 0;
  for (const row of all) {
    if (!row.email) continue;
    try {
      await db.insert(newsletterSubscribersTable)
        .values({
          email: row.email.trim().toLowerCase(),
          name: row.name,
          phone: (row as any).phone || undefined,
          lineId: (row as any).lineId || undefined,
          source: row.source,
        })
        .onConflictDoUpdate({
          target: newsletterSubscribersTable.email,
          set: {
            name: row.name,
            ...((row as any).phone ? { phone: (row as any).phone } : {}),
            ...((row as any).lineId ? { lineId: (row as any).lineId } : {}),
          },
        });
      imported++;
    } catch (_) {}
  }

  res.json({ imported, total: all.length });
});

// GET /api/newsletter/campaigns
router.get("/campaigns", requireAuth, async (req, res) => {
  const rows = await db.select().from(newsletterCampaignsTable)
    .orderBy(desc(newsletterCampaignsTable.createdAt))
    .limit(50);
  res.json(rows);
});

// POST /api/newsletter/send — compose & send email newsletter
router.post("/send", requireAuth, async (req, res) => {
  const { subject, body } = req.body;
  if (!subject || !body) { res.status(400).json({ error: "Subject and body required" }); return; }

  const [campaign] = await db.insert(newsletterCampaignsTable)
    .values({ subject, body, status: "draft", createdBy: (req as any).user?.email })
    .returning();

  const subscribers = await db.select({ email: newsletterSubscribersTable.email, name: newsletterSubscribersTable.name })
    .from(newsletterSubscribersTable)
    .where(eq(newsletterSubscribersTable.isActive, "true"));

  if (subscribers.length === 0) {
    await db.update(newsletterCampaignsTable)
      .set({ status: "sent", sentAt: new Date(), recipientCount: 0 })
      .where(eq(newsletterCampaignsTable.id, campaign.id));
    res.json({ success: true, sent: 0, campaignId: campaign.id });
    return;
  }

  let sent = 0;
  const failed: string[] = [];
  for (const sub of subscribers) {
    try {
      const unsubLink = `${process.env.PUBLIC_URL || "https://philingo.com"}/unsubscribe?email=${encodeURIComponent(sub.email)}`;
      await sendEmail({
        to: sub.email,
        subject,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
            <div style="background:#1565C0;padding:24px;text-align:center">
              <h2 style="color:white;margin:0">Philingo</h2>
            </div>
            <div style="padding:32px 24px">${body}</div>
            <div style="padding:16px 24px;background:#f9f9f9;font-size:12px;color:#999;text-align:center">
              คุณได้รับอีเมลนี้เพราะเคยติดต่อ Philingo<br/>
              <a href="${unsubLink}" style="color:#999">ยกเลิกการรับข่าวสาร</a>
            </div>
          </div>
        `,
      });
      sent++;
    } catch (err) {
      failed.push(sub.email);
      logger.error({ err, email: sub.email }, "Newsletter send failed");
    }
    await new Promise(r => setTimeout(r, 50));
  }

  await db.update(newsletterCampaignsTable)
    .set({ status: "sent", sentAt: new Date(), recipientCount: sent })
    .where(eq(newsletterCampaignsTable.id, campaign.id));

  res.json({ success: true, sent, failed: failed.length, campaignId: campaign.id });
});

// POST /api/newsletter/send-line — broadcast LINE Notify message to admin (with LINE ID list)
// For broadcasting via LINE OA Messaging API, set line_oa_token in settings.
router.post("/send-line", requireAuth, async (req, res) => {
  const { message } = req.body;
  if (!message) {
    res.status(400).json({ error: "Message required" });
    return;
  }

  // Fetch active subscribers with LINE IDs
  const subscribers = await db.select({
    id: newsletterSubscribersTable.id,
    name: newsletterSubscribersTable.name,
    lineId: newsletterSubscribersTable.lineId,
  })
    .from(newsletterSubscribersTable)
    .where(eq(newsletterSubscribersTable.isActive, "true"));

  const withLine = subscribers.filter(s => !!s.lineId);

  // Try LINE OA Messaging API broadcast (if token configured)
  let broadcastSent = false;
  try {
    const settingRows = await db.select().from(siteSettingsTable)
      .where(inArray(siteSettingsTable.key, ['line_oa_token', 'line_notify_token']));
    const settings: Record<string, string> = {};
    for (const r of settingRows) settings[r.key] = r.value ?? '';

    const oaToken = settings['line_oa_token'];
    if (oaToken) {
      // LINE Messaging API broadcast (sends to all followers of the OA)
      const resp = await fetch('https://api.line.me/v2/bot/message/broadcast', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${oaToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ type: 'text', text: message }] }),
      });
      if (resp.ok) broadcastSent = true;
    }

    // Also notify admin via LINE Notify
    const notifyToken = settings['line_notify_token'];
    if (notifyToken) {
      const lineIds = withLine.map(s => s.lineId).join(', ');
      await fetch('https://notify-api.line.me/api/notify', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${notifyToken}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ message: `📢 ส่งข่าวสาร LINE แล้ว\n${message}\n\nผู้รับที่มี LINE ID: ${withLine.length} คน${broadcastSent ? '\n✅ ส่ง Broadcast สำเร็จ' : ''}` }).toString(),
      });
    }
  } catch (e) {
    logger.warn({ e }, "LINE send failed");
  }

  res.json({
    success: true,
    broadcastSent,
    lineCount: withLine.length,
    lineIds: withLine.map(s => ({ name: s.name, lineId: s.lineId })),
  });
});

export default router;
