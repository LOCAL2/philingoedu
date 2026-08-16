import { pgTable, serial, text, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const bannersTable = pgTable("banners", {
  id: serial("id").primaryKey(),
  title: text("title"),
  titleTh: text("title_th"),
  subtitle: text("subtitle"),
  subtitleTh: text("subtitle_th"),
  ctaText: text("cta_text"),
  ctaTextTh: text("cta_text_th"),
  ctaUrl: text("cta_url"),
  imageUrl: text("image_url"),
  mobileImageUrl: text("mobile_image_url"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertBannerSchema = createInsertSchema(bannersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertBanner = z.infer<typeof insertBannerSchema>;
export type Banner = typeof bannersTable.$inferSelect;
