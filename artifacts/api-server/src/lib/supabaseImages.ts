/**
 * supabaseImages.ts
 * Shared helper for storing and serving images in Supabase Storage.
 *
 * Gallery images  → Supabase prefix "gallery/"
 * General uploads → Supabase prefix "uploads/"
 */

import { supabaseAdmin, getStorageBucket } from './objectStorage.js';

/**
 * Upload a Buffer to Supabase under <prefix>/<filename>.
 * Sets Cache-Control on the object metadata so CDNs can cache it.
 */
export async function uploadImageToSupabase(
  prefix: string,
  filename: string,
  buffer: Buffer,
  contentType: string,
): Promise<void> {
  const bucket = getStorageBucket();
  const path = `${prefix}/${filename}`;
  
  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(path, buffer, {
      contentType,
      cacheControl: '31536000',
      upsert: true
    });

  if (error) {
    throw new Error(`Failed to upload image to Supabase: ${error.message}`);
  }
}
