import { pgTable, serial, text, boolean, timestamp, integer, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const schoolsTable = pgTable("schools", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  nameTh: text("name_th").notNull(),
  tagline: text("tagline"),
  taglineTh: text("tagline_th"),
  city: text("city").notNull(),
  country: text("country").notNull().default("Philippines"),
  logoUrl: text("logo_url"),
  coverImageUrl: text("cover_image_url"),
  rating: real("rating").notNull().default(4.5),
  studentsCount: text("students_count"),
  nationalityCount: text("nationality_count"),
  foundedYear: integer("founded_year"),
  description: text("description"),
  descriptionTh: text("description_th"),
  highlights: jsonb("highlights").$type<string[]>().default([]),
  facilities: jsonb("facilities").$type<string[]>().default([]),
  programs: jsonb("programs").$type<{ name: string; nameTh: string; duration: string; w4?: number; w8?: number; w12?: number; w24?: number }[]>().default([]),
  photos: jsonb("photos").$type<string[]>().default([]),
  youtubeId: text("youtube_id"),
  websiteUrl: text("website_url"),
  mapUrl: text("map_url"),
  accentClass: text("accent_class"),
  tags: jsonb("tags").$type<string[]>().default([]),
  pricingConfig: jsonb("pricing_config").$type<import('./pricing').PricingConfig | null>().default(null),
  timetableConfig: jsonb("timetable_config").$type<Record<string, unknown> | null>().default(null),
  isFeatured: boolean("is_featured").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  // SEO fields (per-school)
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  seoKeywords: text("seo_keywords"),
  seoH1Override: text("seo_h1_override"),
  seoMarketingMeta: text("seo_marketing_meta"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertSchoolSchema = createInsertSchema(schoolsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertSchool = z.infer<typeof insertSchoolSchema>;
export type School = typeof schoolsTable.$inferSelect;
