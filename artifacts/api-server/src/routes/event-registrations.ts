import { Router } from "express";
import { db } from "../lib/db.js";
import { eventRegistrationsTable, eventsTable, siteSettingsTable } from "@workspace/db/schema";
import { eq, desc, sql, inArray } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth.js";
import { sendEmail } from "../lib/email.js";

const router = Router();

// GET /api/events/:eventId/registrations — admin list
router.get("/:eventId/registrations", requireAuth, async (req, res) => {
  try {
    const eventId = Number(req.params.eventId);
    const rows = await db
      .select()
      .from(eventRegistrationsTable)
      .where(eq(eventRegistrationsTable.eventId, eventId))
      .orderBy(desc(eventRegistrationsTable.registeredAt));
    const [{ total }] = await db
      .select({ total: sql<number>`count(*)::int` })
      .from(eventRegistrationsTable)
      .where(eq(eventRegistrationsTable.eventId, eventId));
    res.json({ data: rows, total });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// POST /api/events/:eventId/register — public registration
router.post("/:eventId/register", async (req, res) => {
  try {
    const eventId = Number(req.params.eventId);
    const { name, email, phone, lineId, note } = req.body;

    if (!name) { res.status(400).json({ error: "กรุณาระบุชื่อ" }); return; }

    // Get event details
    const [event] = await db.select().from(eventsTable).where(eq(eventsTable.id, eventId)).limit(1);
    if (!event || !event.isActive) { res.status(404).json({ error: "ไม่พบกิจกรรมนี้" }); return; }

    // Save registration
    const [reg] = await db
      .insert(eventRegistrationsTable)
      .values({ eventId, name, email: email || null, phone: phone || null, lineId: lineId || null, note: note || null })
      .returning();

    // Update seats remaining
    if (event.seatsRemaining !== null && event.seatsRemaining > 0) {
      await db.update(eventsTable)
        .set({ seatsRemaining: event.seatsRemaining - 1 })
        .where(eq(eventsTable.id, eventId));
    }

    // Send auto-reply email if email provided
    let emailSent = false;
    if (email) {
      try {
        // Fetch email template from settings
        const settingRows = await db.select().from(siteSettingsTable).where(
          inArray(siteSettingsTable.key, ["event_reply_subject", "event_reply_body", "notification_email", "line_id", "phone"])
        );
        const s: Record<string, string> = {};
        for (const r of settingRows) s[r.key] = r.value ?? "";

        const subject = s.event_reply_subject || `ยืนยันการลงทะเบียน: ${event.titleTh}`;
        const bodyTemplate = s.event_reply_body || defaultReplyTemplate();

        const html = bodyTemplate
          .replace(/{{name}}/g, name)
          .replace(/{{event_title}}/g, event.titleTh)
          .replace(/{{event_date}}/g, event.eventDate ? new Date(event.eventDate).toLocaleDateString("th-TH", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "-")
          .replace(/{{event_time}}/g, event.eventTime || "-")
          .replace(/{{venue}}/g, event.venueTh || "-")
          .replace(/{{meet_url}}/g, event.meetUrl ? `<a href="${event.meetUrl}">${event.meetUrl}</a>` : "-")
          .replace(/{{meet_url_raw}}/g, event.meetUrl || "-")
          .replace(/{{cta_url}}/g, event.ctaUrl || event.meetUrl || "#")
          .replace(/{{line_id}}/g, s.line_id || "@philingo")
          .replace(/{{phone}}/g, s.phone || "061-656-4159");

        await sendEmail({ to: email, subject, html });

        // Mark email sent
        await db.update(eventRegistrationsTable).set({ emailSent: true }).where(eq(eventRegistrationsTable.id, reg.id));
        emailSent = true;
      } catch { /* non-critical */ }
    }

    res.status(201).json({ ok: true, registrationId: reg.id, emailSent });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// DELETE /api/events/:eventId/registrations/:id — admin remove
router.delete("/:eventId/registrations/:id", requireAuth, async (req, res) => {
  await db.delete(eventRegistrationsTable).where(eq(eventRegistrationsTable.id, Number(req.params.id)));
  res.json({ ok: true });
});

function defaultReplyTemplate(): string {
  return `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
  <div style="background:#1B4FD8;padding:24px;border-radius:12px 12px 0 0">
    <h1 style="color:#fff;margin:0;font-size:22px">✅ ยืนยันการลงทะเบียนสำเร็จ</h1>
  </div>
  <div style="background:#f9fafb;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb">
    <p style="color:#374151">สวัสดีคุณ <b>{{name}}</b>,</p>
    <p style="color:#374151">ทีมงาน Philingo ได้รับการลงทะเบียนของคุณสำหรับกิจกรรม <b>{{event_title}}</b> เรียบร้อยแล้ว 🎉</p>
    <table style="width:100%;background:#fff;border:1px solid #e5e7eb;border-radius:8px;margin:16px 0">
      <tr><td style="padding:10px 16px;color:#6b7280;font-size:14px;border-bottom:1px solid #f3f4f6">📅 วันและเวลา</td><td style="padding:10px 16px;font-weight:600;border-bottom:1px solid #f3f4f6">{{event_date}} · {{event_time}}</td></tr>
      <tr><td style="padding:10px 16px;color:#6b7280;font-size:14px;border-bottom:1px solid #f3f4f6">📍 สถานที่</td><td style="padding:10px 16px;font-weight:600;border-bottom:1px solid #f3f4f6">{{venue}}</td></tr>
      <tr><td style="padding:10px 16px;color:#6b7280;font-size:14px">🔗 ลิงก์เข้าร่วม</td><td style="padding:10px 16px;font-weight:600">{{meet_url}}</td></tr>
    </table>
    <div style="text-align:center;margin:24px 0">
      <a href="{{cta_url}}" style="display:inline-block;background:#1B4FD8;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:700;font-size:16px">🔗 เข้าร่วมกิจกรรม</a>
    </div>
    <p style="color:#6b7280;font-size:13px">หากมีคำถาม ติดต่อ LINE: {{line_id}} หรือโทร {{phone}}</p>
    <p style="color:#6b7280;font-size:13px">ทีมงาน Philingo 🇵🇭</p>
  </div>
</div>`;
}

export default router;
