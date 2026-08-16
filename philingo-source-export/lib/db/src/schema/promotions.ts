import { pgTable, serial, text, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const promotionsTable = pgTable("promotions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  titleTh: text("title_th").notNull(),
  description: text("description"),
  descriptionTh: text("description_th"),
  terms: text("terms"),
  termsTh: text("terms_th"),
  imageUrl: text("image_url"),
  discountText: text("discount_text"),
  discountTextTh: text("discount_text_th"),
  /** ราคาปกติ (text เพื่อใส่ได้ทั้ง "65,000" และ "฿65,000") */
  originalPriceTh: text("original_price_th"),
  /** ราคาหลังลด */
  discountPriceTh: text("discount_price_th"),
  /** จำนวนที่นั่งคงเหลือ */
  seatsRemaining: integer("seats_remaining"),
  /** ของแถม / สิทธิพิเศษเพิ่มเติม */
  bonusTh: text("bonus_th"),
  expiresAt: timestamp("expires_at"),
  isFeatured: boolean("is_featured").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertPromotionSchema = createInsertSchema(promotionsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPromotion = z.infer<typeof insertPromotionSchema>;
export type Promotion = typeof promotionsTable.$inferSelect;
