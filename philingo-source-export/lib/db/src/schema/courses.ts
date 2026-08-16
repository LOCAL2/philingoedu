import { pgTable, serial, text, boolean, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const coursesTable = pgTable("courses", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  titleTh: text("title_th").notNull(),
  subtitle: text("subtitle"),
  subtitleTh: text("subtitle_th"),
  iconName: text("icon_name"),
  description: text("description"),
  descriptionTh: text("description_th"),
  duration: text("duration"),
  durationTh: text("duration_th"),
  suitableFor: text("suitable_for"),
  suitableForTh: text("suitable_for_th"),
  priceDisplay: text("price_display"),
  priceDisplayTh: text("price_display_th"),
  colorClass: text("color_class"),
  badge: text("badge"),
  badgeTh: text("badge_th"),
  features: jsonb("features").$type<string[]>().default([]),
  timetableConfig: jsonb("timetable_config").$type<Record<string, unknown> | null>().default(null),
  schoolSlug: text("school_slug"),
  isFeatured: boolean("is_featured").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  // Course Landing Page fields
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  heroBannerUrl: text("hero_banner_url"),
  curriculumDetails: jsonb("curriculum_details").$type<Record<string, unknown> | null>().default(null),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertCourseSchema = createInsertSchema(coursesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Course = typeof coursesTable.$inferSelect;
