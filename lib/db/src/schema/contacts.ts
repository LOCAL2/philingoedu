import { pgTable, serial, text, timestamp, pgEnum, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const submissionStatusEnum = pgEnum("submission_status", ["new", "in_progress", "replied", "closed"]);
export const formTypeEnum = pgEnum("form_type", ["contact", "apply", "consult", "quotation", "scholarship", "seminar"]);

export const contactSubmissionsTable = pgTable("contact_submissions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  subject: text("subject"),
  message: text("message"),
  utmSource: text("utm_source"),
  utmMedium: text("utm_medium"),
  utmCampaign: text("utm_campaign"),
  ipAddress: text("ip_address"),
  status: submissionStatusEnum("status").notNull().default("new"),
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const formSubmissionsTable = pgTable("form_submissions", {
  id: serial("id").primaryKey(),
  type: formTypeEnum("type").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  schoolInterest: text("school_interest"),
  programInterest: text("program_interest"),
  startDate: text("start_date"),
  duration: text("duration"),
  budget: text("budget"),
  message: text("message"),
  utmSource: text("utm_source"),
  utmMedium: text("utm_medium"),
  utmCampaign: text("utm_campaign"),
  status: submissionStatusEnum("status").notNull().default("new"),
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const seminarRegistrationsTable = pgTable("seminar_registrations", {
  id: serial("id").primaryKey(),
  eventName: text("event_name").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  schoolInterest: text("school_interest"),
  programInterest: text("program_interest"),
  numParticipants: text("num_participants"),
  specialRequests: text("special_requests"),
  utmSource: text("utm_source"),
  utmMedium: text("utm_medium"),
  utmCampaign: text("utm_campaign"),
  status: submissionStatusEnum("status").notNull().default("new"),
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const newsletterSubscribersTable = pgTable("newsletter_subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  phone: text("phone"),
  lineId: text("line_id"),
  source: text("source").notNull().default("manual"), // manual | contact | seminar | form | website
  isActive: text("is_active").notNull().default("true"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  unsubscribedAt: timestamp("unsubscribed_at"),
});

export const newsletterCampaignsTable = pgTable("newsletter_campaigns", {
  id: serial("id").primaryKey(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  sentAt: timestamp("sent_at"),
  recipientCount: integer("recipient_count").notNull().default(0),
  status: text("status").notNull().default("draft"), // draft | sent | failed
  createdBy: text("created_by"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type NewsletterSubscriber = typeof newsletterSubscribersTable.$inferSelect;
export type NewsletterCampaign = typeof newsletterCampaignsTable.$inferSelect;

export const insertContactSubmissionSchema = createInsertSchema(contactSubmissionsTable).omit({ id: true, createdAt: true, status: true, adminNotes: true, ipAddress: true });
export const insertFormSubmissionSchema = createInsertSchema(formSubmissionsTable).omit({ id: true, createdAt: true, status: true, adminNotes: true });
export const insertSeminarRegistrationSchema = createInsertSchema(seminarRegistrationsTable).omit({ id: true, createdAt: true, status: true, adminNotes: true });

export type InsertContactSubmission = z.infer<typeof insertContactSubmissionSchema>;
export type ContactSubmission = typeof contactSubmissionsTable.$inferSelect;
export type InsertFormSubmission = z.infer<typeof insertFormSubmissionSchema>;
export type FormSubmission = typeof formSubmissionsTable.$inferSelect;
export type InsertSeminarRegistration = z.infer<typeof insertSeminarRegistrationSchema>;
export type SeminarRegistration = typeof seminarRegistrationsTable.$inferSelect;
