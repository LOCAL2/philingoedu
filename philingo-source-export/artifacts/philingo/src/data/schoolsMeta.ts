/**
 * Static cover photos and starting prices for the school carousel.
 * These act as fallback when the DB has no photos/pricing yet.
 * Prices are THB all-in (course + cheapest room) for 4 weeks, from programs data.
 */

import campusImg  from '@assets/generated_images/campus-1.jpg';
import cebuImg    from '@assets/generated_images/cebu-1.jpg';
import baguioImg  from '@assets/generated_images/baguio-1.jpg';

/** slug → cover photo URL (used when DB has no photos) */
export const SCHOOL_COVER_PHOTO: Record<string, string> = {
  'cia':        campusImg,
  'qq-english': cebuImg,
  'philinter':  campusImg,
  'b-cebu':     cebuImg,
  'bcebu':      baguioImg,
  'cpils':      campusImg,
  'ev-academy': cebuImg,
  'smeag':      campusImg,
  'pines':      baguioImg,
};

/**
 * slug → minimum 4-week all-in price (THB).
 * Derived from programs[*].w4 — pick the lowest available w4 price.
 */
export const SCHOOL_MIN_PRICE_4W: Record<string, number> = {
  'cia':        32000,  // General English ESL w4
  'qq-english': 28000,  // Online+Onsite Combo w4 (lowest)
  'philinter':  31000,  // General English ESL w4
  'b-cebu':     31000,  // Intensive English w4
  'bcebu':      30000,  // Intensive English w4
  'cpils':      23000,  // ESL Light w4 (lowest)
  'ev-academy': 34000,  // General English ESL w4
  'smeag':      35000,  // General English Classic w4
  'pines':      33000,  // General English Sparta w4
};

/** Format a 4-week price as a per-week starting price string */
export function formatStartingPrice(slug: string): string {
  const w4 = SCHOOL_MIN_PRICE_4W[slug];
  if (!w4) return '';
  const perWeek = Math.round(w4 / 4);
  return `฿${perWeek.toLocaleString()}/สัปดาห์`;
}
