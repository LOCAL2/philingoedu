import { Resend } from "resend";
import { logger } from "./logger.js";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

const DEFAULT_FROM = "Philingo <onboarding@resend.dev>";

export async function sendEmail(options: EmailOptions): Promise<void> {
  const { to, subject, html, from } = options;
  const fromAddr = from || process.env.RESEND_FROM || DEFAULT_FROM;

  // ── Resend (preferred) ───────────────────────────────────────────────────
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const { error } = await resend.emails.send({ from: fromAddr, to, subject, html });
      if (error) {
        logger.error({ error, to, subject }, "📧 Resend error");
      } else {
        logger.info({ to, subject }, "📧 Email sent via Resend");
      }
    } catch (err) {
      logger.error({ err, to, subject }, "📧 Resend failed");
    }
    return;
  }

  // ── Fallback: log to console (dev / not configured) ──────────────────────
  logger.info(
    { to, subject, body: html.replace(/<[^>]*>/g, "").slice(0, 200) },
    "📧 [NO EMAIL CONFIG] Email not sent — set RESEND_API_KEY in Secrets"
  );
}

export async function sendContactNotification(data: {
  name: string; email: string; phone?: string; subject?: string; message?: string;
}): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL || "info@philingoedu.com";
  await sendEmail({
    to: adminEmail,
    subject: `[Philingo] ข้อความใหม่จาก ${data.name}`,
    html: `<p><b>ชื่อ:</b> ${data.name}<br><b>Email:</b> ${data.email}<br><b>โทร:</b> ${data.phone || "-"}<br><b>เรื่อง:</b> ${data.subject || "-"}<br><b>ข้อความ:</b> ${data.message || "-"}</p>`,
  });
}
