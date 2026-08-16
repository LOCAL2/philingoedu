import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import adminUsersRouter from "./admin-users.js";
import schoolsRouter from "./schools.js";
import coursesRouter from "./courses.js";
import blogRouter from "./blog.js";
import faqsRouter from "./faqs.js";
import testimonialsRouter from "./testimonials.js";
import bannersRouter from "./banners.js";
import promotionsRouter from "./promotions.js";
import partnersRouter from "./partners.js";
import galleryRouter from "./gallery.js";
import teamRouter from "./team.js";
import contactsRouter from "./contacts.js";
import formsRouter from "./forms.js";
import settingsRouter from "./settings.js";
import dashboardRouter from "./dashboard.js";
import newsletterRouter from "./newsletter.js";
import eventsRouter from "./events.js";
import eventRegistrationsRouter from "./event-registrations.js";
import uploadRouter from "./upload.js";
import storageRouter from "./storage.js";
import analyticsRouter from "./analytics.js";
import parsePriceRouter from "./parse-price.js";
import { parsePromoRouter } from "./parse-promo.js";
import { scrapeImagesRouter } from "./scrape-images.js";
import { batchScrapeRouter } from "./batch-scrape.js";
import { generateDescriptionRouter } from "./generate-description.js";

const router: IRouter = Router();

// Health
router.use(healthRouter);

// Auth
router.use("/auth", authRouter);
router.use("/admin-users", adminUsersRouter);

// Content (public read, auth write)
router.use("/schools", parsePriceRouter);
router.use("/schools", parsePromoRouter);
router.use("/schools", scrapeImagesRouter);
router.use("/schools", generateDescriptionRouter);
router.use("/admin", batchScrapeRouter);
router.use("/schools", schoolsRouter);
router.use("/courses", coursesRouter);
router.use("/blog", blogRouter);
router.use("/faqs", faqsRouter);
router.use("/testimonials", testimonialsRouter);
router.use("/banners", bannersRouter);
router.use("/promotions", promotionsRouter);
router.use("/partners", partnersRouter);
router.use("/gallery", galleryRouter);
router.use("/team", teamRouter);

// Forms & Submissions
router.use("/contacts", contactsRouter);
router.use("/forms", formsRouter);

// Admin
router.use("/settings", settingsRouter);
router.use("/dashboard", dashboardRouter);
router.use("/newsletter", newsletterRouter);
router.use("/events", eventsRouter);
router.use("/events", eventRegistrationsRouter);
router.use("/upload", uploadRouter);
router.use(storageRouter);
router.use("/analytics", analyticsRouter);

// ── Temporary DB backup download (admin-only) ──────────────────────────────
import { requireAuth } from '../middlewares/auth.js';
import fs from 'fs';
import path from 'path';
router.get('/db-backup/download', (req, res) => {
  const file = path.resolve('/home/runner/workspace/philingo_db_export_20260806.sql');
  if (!fs.existsSync(file)) { res.status(404).json({ error: 'Backup file not found' }); return; }
  res.setHeader('Content-Disposition', 'attachment; filename="philingo_db_export_20260806.sql"');
  res.setHeader('Content-Type', 'application/octet-stream');
  res.sendFile(file);
});

export default router;
