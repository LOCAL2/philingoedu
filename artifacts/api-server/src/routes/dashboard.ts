import { Router } from 'express';
import { count, gte, desc } from 'drizzle-orm';
import { db } from '../lib/db.js';
import { requireAuth } from '../middlewares/auth.js';
import {
  schoolsTable, coursesTable, blogPostsTable, testimonialsTable,
  contactSubmissionsTable, formSubmissionsTable, promotionsTable,
  seminarRegistrationsTable, siteSettingsTable,
} from '@workspace/db';
import { inArray } from 'drizzle-orm';

const router = Router();

// GET /dashboard/stats
router.get('/stats', requireAuth, async (_req, res) => {
  try {
    const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [[schools], [courses], [posts], [reviews], [contacts7d], [forms7d], [promos], [seminars], analyticsRows] = await Promise.all([
      db.select({ c: count() }).from(schoolsTable),
      db.select({ c: count() }).from(coursesTable),
      db.select({ c: count() }).from(blogPostsTable),
      db.select({ c: count() }).from(testimonialsTable),
      db.select({ c: count() }).from(contactSubmissionsTable).where(gte(contactSubmissionsTable.createdAt, since7d)),
      db.select({ c: count() }).from(formSubmissionsTable).where(gte(formSubmissionsTable.createdAt, since7d)),
      db.select({ c: count() }).from(promotionsTable),
      db.select({ c: count() }).from(seminarRegistrationsTable).where(gte(seminarRegistrationsTable.createdAt, since7d)),
      db.select().from(siteSettingsTable).where(inArray(siteSettingsTable.key, ['analytics_views_total', 'analytics_views_today', 'analytics_views_date'])),
    ]);

    const am: Record<string, string> = {};
    for (const r of analyticsRows) am[r.key] = r.value ?? '0';
    const todayStr = new Date().toISOString().slice(0, 10);

    res.json({
      totalSchools: schools.c,
      totalCourses: courses.c,
      totalBlogPosts: posts.c,
      totalTestimonials: reviews.c,
      totalPromotions: promos.c,
      newContacts7d: contacts7d.c,
      newForms7d: forms7d.c,
      newSeminars7d: seminars.c,
      pageViewsTotal: parseInt(am['analytics_views_total'] ?? '0', 10),
      pageViewsToday: am['analytics_views_date'] === todayStr ? parseInt(am['analytics_views_today'] ?? '0', 10) : 0,
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', message: String(err) });
  }
});

// GET /dashboard/recent — recent activity
router.get('/recent', requireAuth, async (_req, res) => {
  try {
    const [contacts, forms, seminars] = await Promise.all([
      db.select().from(contactSubmissionsTable).orderBy(desc(contactSubmissionsTable.createdAt)).limit(10),
      db.select().from(formSubmissionsTable).orderBy(desc(formSubmissionsTable.createdAt)).limit(10),
      db.select().from(seminarRegistrationsTable).orderBy(desc(seminarRegistrationsTable.createdAt)).limit(10),
    ]);
    res.json({ contacts, forms, seminars });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', message: String(err) });
  }
});

export default router;
