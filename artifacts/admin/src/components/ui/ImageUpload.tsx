import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Upload, Link, X, ImageIcon, Loader2, CheckCircle2 } from 'lucide-react';
import imageCompression from 'browser-image-compression';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  onUploadingChange?: (uploading: boolean) => void;
  label?: string;
  rounded?: boolean;
  required?: boolean;
  className?: string;
}

function getToken(): string {
  return localStorage.getItem('philingo_admin_token') ?? '';
}

/** objectPath from server (/objects/uploads/xxx) → serve URL (/api/storage/objects/uploads/xxx) */
function serveUrl(objectPath: string): string {
  return '/api/storage' + objectPath;
}

export function ImageUpload({
  value,
  onChange,
  onUploadingChange,
  label,
  rounded = false,
  required,
  className = '',
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlDraft, setUrlDraft] = useState(value);
  // Show local blob preview instantly while upload runs in background.
  // Blob URL is kept alive after upload success so there's no blank gap while
  // GCS loads (GCS cold-start can take 3-4s). It's replaced when a new upload
  // starts, or revoked on unmount via the useEffect below.
  const [localPreview, setLocalPreview] = useState('');

  // Revoke previous blob URL whenever localPreview is replaced or component unmounts
  useEffect(() => {
    return () => {
      if (localPreview.startsWith('blob:')) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately — no waiting for compression or server
    const blobUrl = URL.createObjectURL(file);
    setLocalPreview(blobUrl); // replaces old blob → useEffect revokes the old one
    setUploading(true);
    onUploadingChange?.(true);
    setDone(false);
    setError('');

    // Compress before upload — max 500 KB, 1920px wide, convert to WebP for smaller files
    let uploadFile: File = file;
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: 'image/webp',
      });
      // Rename to .webp so the stored object has the correct extension
      const baseName = file.name.replace(/\.[^.]+$/, '');
      uploadFile = new File([compressed], `${baseName}.webp`, { type: 'image/webp' });
    } catch { /* fallback to original file if compression fails */ }

    try {
      // Step 1: request presigned URL from Object Storage
      const metaRes = await fetch('/api/storage/uploads/request-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          name: uploadFile.name,
          size: uploadFile.size,
          contentType: uploadFile.type,
          category: 'other',
        }),
      });

      if (!metaRes.ok) {
        const body = await metaRes.json().catch(() => ({}));
        throw new Error(body.error || `Request failed: ${metaRes.status}`);
      }

      const { uploadURL, objectPath } = await metaRes.json();

      // Step 2: upload compressed file directly to GCS
      const uploadRes = await fetch(uploadURL, {
        method: 'PUT',
        headers: { 'Content-Type': uploadFile.type },
        body: uploadFile,
      });
      if (!uploadRes.ok) throw new Error(`Upload failed: ${uploadRes.status}`);

      const url = serveUrl(objectPath);
      onChange(url);
      setUrlDraft(url);
      setDone(true);
      setTimeout(() => setDone(false), 3000);
    } catch (err: any) {
      setError(err.message || 'อัปโหลดล้มเหลว กรุณาลองใหม่');
      setLocalPreview(''); // error: clear blob → useEffect revokes it → แสดง value เดิมหรือว่าง
    } finally {
      setUploading(false);
      onUploadingChange?.(false);
      // ไม่ revoke blobUrl ที่นี่ — useEffect จัดการเมื่อ localPreview เปลี่ยนหรือ unmount
      // ไม่ clear localPreview เมื่อสำเร็จ — ให้ blob แสดงต่อขณะ GCS โหลด (GCS ใช้เวลา 3-4s)
      if (inputRef.current) inputRef.current.value = '';
    }
  }, [onChange]);

  const handleUrlSave = () => {
    onChange(urlDraft);
    setShowUrlInput(false);
  };

  const handleClear = () => {
    onChange('');
    setUrlDraft('');
    setLocalPreview('');
    setShowUrlInput(false);
    setError('');
  };

  const displaySrc = localPreview || value;
  const previewClass = rounded
    ? 'h-16 w-16 rounded-full object-cover border-2 border-gray-200'
    : 'h-20 w-32 rounded-lg object-cover border border-gray-200';

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="flex items-start gap-3">
        {/* Preview */}
        <div className={`relative flex items-center justify-center bg-gray-50 border border-dashed border-gray-300 shrink-0 ${
          rounded ? 'h-16 w-16 rounded-full' : 'h-20 w-32 rounded-lg'
        }`}>
          {displaySrc ? (
            <>
              <img
                src={displaySrc}
                alt="preview"
                className={previewClass}
                onError={e => { (e.target as HTMLImageElement).style.opacity = '0.3'; }}
              />
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
                  <Loader2 className="h-5 w-5 text-white animate-spin" />
                </div>
              )}
            </>
          ) : (
            <ImageIcon className="h-7 w-7 text-gray-300" />
          )}
        </div>

        {/* Controls */}
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap gap-2">
            {/* Upload button — label wraps hidden input for instant file picker */}
            <label className={`flex items-center gap-1.5 cursor-pointer text-xs font-medium px-3 py-1.5 rounded-lg transition-colors border ${
              done
                ? 'bg-green-50 border-green-300 text-green-700'
                : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200'
            }`}>
              {uploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : done ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                <Upload className="h-3.5 w-3.5" />
              )}
              {uploading ? 'กำลังอัปโหลด...' : done ? 'อัปโหลดสำเร็จ' : 'อัปโหลดรูป'}
              <input
                ref={inputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.gif,.webp,.avif,.svg"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>

            {/* URL button */}
            <button
              type="button"
              onClick={() => { setUrlDraft(value); setShowUrlInput(!showUrlInput); }}
              className="flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors border border-gray-200"
            >
              <Link className="h-3.5 w-3.5" />
              ใช้ URL
            </button>

            {/* Clear */}
            {(value || localPreview) && (
              <button
                type="button"
                onClick={handleClear}
                className="flex items-center gap-1 text-gray-400 hover:text-red-500 text-xs px-2 py-1.5 rounded-lg transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* URL input */}
          {showUrlInput && (
            <div className="flex gap-2">
              <input
                type="text"
                value={urlDraft}
                onChange={e => setUrlDraft(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="flex-1 border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-400 outline-none"
              />
              <button
                type="button"
                onClick={handleUrlSave}
                className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-blue-700"
              >
                ตกลง
              </button>
            </div>
          )}

          {/* Path hint */}
          {value && !showUrlInput && !uploading && (
            <p className="text-xs text-gray-400 truncate max-w-xs">{value}</p>
          )}
          {uploading && (
            <p className="text-xs text-blue-500">⬆ กำลังส่งไฟล์ไปยัง Cloud Storage...</p>
          )}

          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      </div>
    </div>
  );
}
