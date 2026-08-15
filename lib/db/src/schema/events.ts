import { pgTable, serial, text, timestamp, boolean, integer } from "drizzle-orm/pg-core";

export const eventsTable = pgTable("events", {
  id: serial("id").primaryKey(),
  titleTh: text("title_th").notNull(),
  title: text("title"),
  descriptionTh: text("description_th"),
  description: text("description"),
  eventDate: text("event_date"),           // e.g. "2026-09-15"
  eventTime: text("event_time"),           // e.g. "10:00-11:00"
  venueTh: text("venue_th"),               // e.g. "Google Meet · ออนไลน์"
  venue: text("venue"),
  meetUrl: text("meet_url"),               // Google Meet / Zoom link
  imageUrl: text("image_url"),
  eventType: text("event_type").default("seminar"), // seminar | workshop | online | offline
  ctaTextTh: text("cta_text_th"),
  ctaUrl: text("cta_url"),
  seatsTotal: integer("seats_total"),
  seatsRemaining: integer("seats_remaining"),
  isFeatured: boolean("is_featured").default(false),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Event = typeof eventsTable.$inferSelect;
export type InsertEvent = typeof eventsTable.$inferInsert;
