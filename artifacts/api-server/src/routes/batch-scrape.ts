import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { db } from '@workspace/db';
import { schoolsTable } from '@workspace/db/schema';
import { isNotNull, eq } from 'drizzle-orm';

export const batchScrapeRouter = Router();

function resolveUrl(src: string, base: string): string | null {
  try {
    if (!src || src.startsWith('data:') || src.startsWith('blob:')) return null;
    return new URL(src, base).href;
  } catch { return null; }
}

function looksLikePhoto(url: string): boolean {
  const lower = url.toLowerCase();
  if (/\.(svg|ico|gif|woff|woff2|ttf|eot)(\?|$)/i.test(lower)) return false;
  if (/logo|icon|favicon|pixel|tracking|analytics|placeholder|blank|spacer|arrow|btn|button/i.test(lower)) return false;
  return true;
}

async function scrapeOgImage(websiteUrl: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12_000);
    const response = await fetch(websiteUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PhilingoBot/1.0)',
        'Accept': 'text/html,*/*;q=0.8',
      },
    }).finally(() => clearTimeout(timer));
    if (!response.ok) return null;
    const html = await response.text();
    const finalUrl = response.url || websiteUrl;
    // 1. OG image
    const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    if (ogMatch) {
      const u = resolveUrl(ogMatch[1], finalUrl);
      if (u && looksLikePhoto(u)) return u;
    }
    // 2. Twitter card image
    const tcMatch = html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i);
    if (tcMatch) {
      const u = resolveUrl(tcMatch[1], finalUrl);
      if (u && looksLikePhoto(u)) return u;
    }
    return null;
  } catch { return null; }
}

/**
 * POST /api/admin/batch-scrape-banners
 * For each school with websiteUrl and no banner photo, fetch the OG image and save it.
 * Returns progress per school.
 */
batchScrapeRouter.post('/batch-scrape-banners', requireAuth, async (req, res) => {
  const { force = false } = req.body ?? {};

  // Get all schools with a websiteUrl
  const schools = await db
    .select({
      id: schoolsTable.id,
      slug: schoolsTable.slug,
      name: schoolsTable.name,
      websiteUrl: schoolsTable.websiteUrl,
      photos: schoolsTable.photos,
    })
    .from(schoolsTable)
    .where(isNotNull(schoolsTable.websiteUrl));

  const results: { slug: string; status: 'ok' | 'skip' | 'fail'; imageUrl?: string; error?: string }[] = [];

  for (const school of schools) {
    const existing = (school.photos as string[] | null) ?? [];
    if (!force && existing.length > 0) {
      results.push({ slug: school.slug, status: 'skip' });
      continue;
    }
    if (!school.websiteUrl) {
      results.push({ slug: school.slug, status: 'skip' });
      continue;
    }
    try {
      const imageUrl = await scrapeOgImage(school.websiteUrl);
      if (imageUrl) {
        // Prepend to existing (or start fresh)
        const merged = [imageUrl, ...existing.filter(u => u !== imageUrl)];
        await db.update(schoolsTable)
          .set({ photos: merged, updatedAt: new Date() })
          .where(eq(schoolsTable.id, school.id));
        results.push({ slug: school.slug, status: 'ok', imageUrl });
      } else {
        results.push({ slug: school.slug, status: 'fail', error: 'no OG image found' });
      }
    } catch (e: any) {
      results.push({ slug: school.slug, status: 'fail', error: e.message });
    }
  }

  const ok   = results.filter(r => r.status === 'ok').length;
  const skip = results.filter(r => r.status === 'skip').length;
  const fail = results.filter(r => r.status === 'fail').length;
  res.json({ ok, skip, fail, results });
});
