import { Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../lib/db.js';
import { schoolsTable, blogPostsTable } from '@workspace/db';

const staticPages = [
  '/',
  '/schools',
  '/courses',
  '/blog',
  '/about',
  '/contact',
  '/promotions',
  '/faq',
  '/gallery',
  '/team',
];

export async function sitemapHandler(_req: Request, res: Response): Promise<void> {
  try {
    const baseUrl = process.env.SITE_URL || 'https://philingo.com';

    const [schools, blogPosts] = await Promise.all([
      db.select({ slug: schoolsTable.slug, updatedAt: schoolsTable.updatedAt })
        .from(schoolsTable)
        .where(eq(schoolsTable.isActive, true)),
      db.select({ slug: blogPostsTable.slug, updatedAt: blogPostsTable.updatedAt })
        .from(blogPostsTable)
        .where(eq(blogPostsTable.isPublished, true)),
    ]);

    const urls: string[] = [];

    // Static pages
    for (const page of staticPages) {
      urls.push(`
  <url>
    <loc>${baseUrl}${page}</loc>
    <changefreq>weekly</changefreq>
    <priority>${page === '/' ? '1.0' : '0.8'}</priority>
  </url>`);
    }

    // School pages
    for (const school of schools) {
      urls.push(`
  <url>
    <loc>${baseUrl}/schools/${school.slug}</loc>
    <lastmod>${school.updatedAt.toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`);
    }

    // Blog pages
    for (const post of blogPosts) {
      urls.push(`
  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${post.updatedAt.toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`);
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><error>Failed to generate sitemap</error>');
  }
}
