import { randomUUID } from 'crypto';
import { createClient } from '@supabase/supabase-js';

const getEnv = (key: string): string => {
  const val = process.env[key];
  if (!val) throw new Error(`${key} env var is required`);
  return val;
};

export const supabaseAdmin = createClient(
  getEnv('SUPABASE_URL'),
  getEnv('SUPABASE_SERVICE_ROLE_KEY'),
  {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  }
);

export function getStorageBucket(): string {
  return process.env.SUPABASE_STORAGE_BUCKET || 'uploads';
}

export class ObjectNotFoundError extends Error {
  constructor() {
    super('Object not found');
    this.name = 'ObjectNotFoundError';
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

export class ObjectStorageService {
  private getBucketName(): string {
    return getStorageBucket();
  }

  async getObjectEntityReadURL(objectPath: string, _ttlSec = 86400): Promise<string> {
    const bucketName = this.getBucketName();
    const { data } = supabaseAdmin.storage.from(bucketName).getPublicUrl(objectPath);
    return data.publicUrl;
  }

  async getObjectEntityUploadURL(_ttlSec: number = 900): Promise<string> {
    const bucketName = this.getBucketName();
    const objectId = randomUUID();
    const objectPath = `uploads/${objectId}`;

    const { data, error } = await supabaseAdmin.storage.from(bucketName).createSignedUploadUrl(objectPath);
    
    if (error) {
      throw new Error(`Failed to create signed upload URL: ${error.message}`);
    }

    if (!data || !data.signedUrl) {
      throw new Error('Failed to create signed upload URL: No URL returned');
    }

    return data.signedUrl;
  }

  normalizeObjectEntityPath(uploadURLOrPath: string): string {
    try {
      const urlObj = new URL(uploadURLOrPath);
      const match = urlObj.pathname.match(new RegExp(`/storage/v1/object/(?:upload/)?sign/${this.getBucketName()}/(.+)`));
      if (match) {
        return `/objects/${match[1]}`;
      }
      return uploadURLOrPath;
    } catch {
      return uploadURLOrPath;
    }
  }
}
