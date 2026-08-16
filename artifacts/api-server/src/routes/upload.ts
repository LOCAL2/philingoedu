import { Router } from "express";
import multer from "multer";
import path from "path";
import { requireAuth } from "../middlewares/auth.js";
import { uploadImageToSupabase } from "../lib/supabaseImages.js";

// Use memory storage — file is uploaded to storage, not written to local disk
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only images are allowed"));
  },
});

const router = Router();

// POST /api/upload — requires admin JWT
router.post("/", requireAuth, upload.single("file"), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }

  const ext = path.extname(req.file.originalname).toLowerCase() || ".jpg";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;

  try {
    await uploadImageToSupabase("uploads", filename, req.file.buffer, req.file.mimetype);
    const url = `/api/uploads/${filename}`;
    res.json({ url, filename });
  } catch (err) {
    res.status(500).json({ error: "Failed to upload file to storage", message: String(err) });
  }
});

// DELETE /api/upload/:filename — requires admin JWT
// Note: GCS objects are intentionally not deleted here — files may still be
// referenced in DB rows. Soft-delete the DB record instead.
router.delete("/:filename", requireAuth, (_req, res) => {
  res.json({ ok: true });
});

export default router;
