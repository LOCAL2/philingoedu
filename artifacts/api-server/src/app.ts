import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import path from "path";
import fs from "fs";
import router from "./routes/index.js";
import { sitemapHandler } from "./routes/sitemap.js";
import { logger } from "./lib/logger.js";
import { supabaseAdmin, getStorageBucket } from "./lib/objectStorage.js";

const app: Express = express();

app.set("trust proxy", 1);

// Security headers
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false,
}));

// CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["*"];
app.use(cors({
  origin: allowedOrigins.includes("*") ? "*" : allowedOrigins,
  credentials: true,
}));

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 20,
  message: { error: "Too Many Requests", message: "Too many login attempts, try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});
const formLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Too Many Requests", message: "Too many form submissions, try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/auth", authLimiter);
app.use("/api/contacts", formLimiter);
app.use("/api/forms", formLimiter);

// Logging
app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Robots.txt
app.get("/robots.txt", (_req, res) => {
  res.type("text/plain");
  const siteUrl = process.env.SITE_URL || "https://philingoedu.com";
  res.send(`User-agent: *\nAllow: /\n${siteUrl ? `Sitemap: ${siteUrl}/sitemap.xml` : ""}`);
});

// Sitemap
app.get("/sitemap.xml", sitemapHandler);

// Serve uploaded images from Supabase
app.get("/api/uploads/:filename", async (req, res, _next) => {
  const filename = req.params.filename;
  if (!filename || filename.includes('/') || filename.includes('..')) {
    res.status(400).json({ error: 'Invalid filename' });
    return;
  }
  try {
    const bucket = getStorageBucket();
    const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(`uploads/${filename}`);
    res.redirect(301, data.publicUrl);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve image', message: String(err) });
  }
});

// No-cache for all dynamic API responses (prevents mobile browsers / CDN from serving stale data)
app.use("/api", (_req, res, next) => {
  // Skip image routes — they set their own long-lived Cache-Control headers
  if (!_req.path.startsWith("/uploads") && !_req.path.startsWith("/gallery/image/")) {
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");
  }
  next();
});

// API Routes
app.use("/api", router);

// ── Serve Static Frontends ────────────────────────────────────────────────────
// Admin panel at /admin (built to artifacts/admin/dist/public)
const getDistPath = (pkgName: string) => {
  const p1 = path.resolve(process.cwd(), `artifacts/${pkgName}/dist/public`);
  if (fs.existsSync(p1)) return p1;
  const p2 = path.resolve(process.cwd(), `../../artifacts/${pkgName}/dist/public`);
  if (fs.existsSync(p2)) return p2;
  return p1; // fallback
};

const adminDist = getDistPath("admin");
app.use("/admin", express.static(adminDist));
app.get("/admin/*path", (_req, res) => {
  res.sendFile(path.join(adminDist, "index.html"));
});

// Main frontend (built to artifacts/philingo/dist/public)
const philingoDist = getDistPath("philingo");
app.use(express.static(philingoDist));
app.get("*path", (_req, res) => {
  res.sendFile(path.join(philingoDist, "index.html"));
});

export default app;
