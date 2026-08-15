import { pgTable, serial, integer, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { eventsTable } from "./events";

export const eventRegistrationsTable = pgTable("event_registrations", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => eventsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  lineId: text("line_id"),
  note: text("note"),
  emailSent: boolean("email_sent").default(false),
  registeredAt: timestamp("registered_at").notNull().defaultNow(),
});

export type EventRegistration = typeof eventRegistrationsTable.$inferSelect;
export type InsertEventRegistration = typeof eventRegistrationsTable.$inferInsert;
