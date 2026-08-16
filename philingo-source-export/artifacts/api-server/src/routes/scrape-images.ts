import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { db } from '@workspace/db';
import { schoolsTable as schools } from '@workspace/db/schema';
import { eq } from 'drizzle-orm';

export const scrapeImagesRouter = Router();

/** Resolve a potentially-relative URL against the page origin */
function resolveUrl(src: string, base: string): string | null {
  try {
    if (!src || src.startsWith('data:') || src.startsWith('blob:')) return null;
    return new URL(src, base).href;
  } catch {
    return null;
  }
}

/** Basic check — skip tiny tracking pixels and SVG icons */
function looksLikePhoto(url: string): boolean {
  const lower = url.toLowerCase();
  // Skip common non-photo patterns
  if (/\.(svg|ico|gif|woff|woff2|ttf|eot)(\?|$)/i.test(lower)) return false;
  if (/logo|icon|favicon|pixel|tracking|analytics|placeholder|blank|spacer|arrow|btn|button/i.test(lower)) return false;
  return true;
}

/**
 * POST /api/schools/:id/scrape-images
 * Fetches the school's website and extracts image URLs.
 * Returns: { images: string[], meta: { og?: string, title?: string } }
 */
scrapeImagesRouter.post('/:id/scrape-images', requireAuth, async (req, res) => {
  const schoolId = Number(req.params.id);
  if (isNaN(schoolId)) return res.status(400).json({ error: 'Invalid school ID' });

  const [school] = await db.select().from(schools).where(eq(schools.id, schoolId)).limit(1);
  if (!school) return res.status(404).json({ error: 'School not found' });

  const websiteUrl: string | null = (school as any).websiteUrl ?? null;
  if (!websiteUrl) return res.status(422).json({ error: 'โรงเรียนนี้ยังไม่มี URL เว็บไซต์ กรุณาใส่ URL ก่อน' });

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15_000);

    const response = await fetch(websiteUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PhilingoBot/1.0; +https://philingo.com)',
        'Accept': 'text/html,application/xhtml+xml,*/*;q=0.8',
        'Accept-Language': 'th,en;q=0.9',
      },
    }).finally(() => clearTimeout(timer));

    if (!response.ok) {
      return res.status(422).json({ error: `ดึงเว็บไม่ได้: HTTP ${response.status}` });
    }

    const html = await response.text();
    const base = new URL(websiteUrl).origin;
    const finalUrl = response.url || websiteUrl;

    const found = new Set<string>();

    // 1. OG image (highest priority — usually the best representative image)
    const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    const ogImage = ogMatch ? resolveUrl(ogMatch[1], finalUrl) : null;
    if (ogImage) found.add(ogImage);

    // 2. Twitter card image
    const tcMatch = html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i);
    if (tcMatch) { const u = resolveUrl(tcMatch[1], finalUrl); if (u) found.add(u); }

    // 3. <img src="..."> and srcset
    const imgSrcRe = /<img[^>]+src=["']([^"']+)["']/gi;
    let m: RegExpExecArray | null;
    while ((m = imgSrcRe.exec(html)) !== null) {
      const u = resolveUrl(m[1], finalUrl);
      if (u && looksLikePhoto(u)) found.add(u);
    }

    // 4. CSS background-image: url(...)
    const bgRe = /background(?:-image)?\s*:\s*url\(['"]?([^'")\s]+)['"]?\)/gi;
    while ((m = bgRe.exec(html)) !== null) {
      const u = resolveUrl(m[1], finalUrl);
      if (u && looksLikePhoto(u) && /\.(jpg|jpeg|png|webp)/i.test(u)) found.add(u);
    }

    // 5. data-src / data-lazy-src (lazy-loaded images)
    const dataSrcRe = /data-(?:src|lazy-src|original|bg|image)=["']([^"']+)["']/gi;
    while ((m = dataSrcRe.exec(html)) !== null) {
      const u = resolveUrl(m[1], finalUrl);
      if (u && looksLikePhoto(u)) found.add(u);
    }

    // Title for reference
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const pageTitle = titleMatch ? titleMatch[1].trim() : '';

    const images = Array.from(found).filter(looksLikePhoto).slice(0, 80);

    return res.json({
      images,
      meta: { og: ogImage ?? undefined, title: pageTitle, source: finalUrl },
    });

  } catch (err: any) {
    if (err.name === 'AbortError') {
      return res.status(422).json({ error: 'Timeout: เว็บโรงเรียนใช้เวลาโหลดนานเกินไป (>15s)' });
    }
    return res.status(422).json({ error: `ดึงรูปไม่ได้: ${err.message}` });
  }
});
