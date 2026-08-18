import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('WARNING: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

export const supabaseAdmin = createClient(
  SUPABASE_URL || '',
  SUPABASE_SERVICE_ROLE_KEY || ''
);

export function getStorageBucket() {
  return process.env.SUPABASE_STORAGE_BUCKET || 'uploads';
}

export class ObjectNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ObjectNotFoundError';
  }
}

export class ObjectStorageService {
  async getObjectEntityUploadURL(ttlSec: number = 3600, category?: string, originalName?: string): Promise<{ signedUrl: string; filePath: string }> {
    const bucket = getStorageBucket();
    // Use category-based prefix if provided, otherwise fallback to 'uploads'
    const prefix = category && ['banner', 'facilities', 'rooms', 'logo', 'video', 'other'].includes(category)
      ? category
      : 'uploads';
    // Preserve extension from original filename if available
    const ext = originalName ? originalName.replace(/.*(\.[^.]+)$/, '$1').toLowerCase() : '.bin';
    const safeName = `${Date.now()}-${Math.random().toString(36).substring(7)}${ext}`;
    const filePath = `${prefix}/${safeName}`;

    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .createSignedUploadUrl(filePath);
    
    if (error) throw error;
    return { signedUrl: data.signedUrl, filePath };
  }

  normalizeObjectEntityPath(url: string): string {
    try {
      const urlObj = new URL(url);
      // Supabase signed upload URL format:
      // https://<project>.supabase.co/storage/v1/object/upload/sign/<bucket>/<filePath>?token=...
      // We want to extract just the <filePath> part (relative to bucket root)
      const match = urlObj.pathname.match(/\/storage\/v1\/object\/upload\/sign\/[^/]+\/(.+)$/);
      if (match) return match[1]; // e.g. "banner/1786888546785-xojmy4.webp"
      // Fallback: return pathname without leading slash
      return urlObj.pathname.replace(/^\//, '');
    } catch {
      return url;
    }
  }

  /** Returns the public-facing serve URL for a stored object */
  getPublicUrl(filePath: string): string {
    const bucket = getStorageBucket();
    const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl;
  }

  async getObjectEntityReadURL(filePath: string, ttlSec: number = 3600): Promise<string> {
    const bucket = getStorageBucket();
    
    // If it's already a full URL, return it
    if (filePath.startsWith('http')) return filePath;

    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .createSignedUrl(filePath, ttlSec);
      
    if (error) throw error;
    return data.signedUrl;
  }
}

