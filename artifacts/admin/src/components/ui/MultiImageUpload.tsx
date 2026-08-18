import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Upload, X, Loader2, CheckCircle2, AlertCircle, Link2, Plus } from 'lucide-react';
import imageCompression from 'browser-image-compression';

interface UploadEntry {
  tempId: string;
  objectPath: string;   // filePath in bucket (e.g. "banner/1234.webp")
  publicUrl: string;    // permanent Supabase public URL — used to notify parent
  previewUrl: string;   // local blob URL — stays alive until unmount
  name: string;
  status: 'uploading' | 'done' | 'error';
  error?: string;
  replaceTargetUrl?: string;
}

interface MultiImageUploadProps {
  label: string;
  category: 'banner' | 'facilities' | 'rooms' | 'logo' | 'other';
  existingUrls?: string[];
  onUrlsChange: (urls: string[]) => void;
  maxFiles?: number;
  hint?: string;
}

/** Returns true if the URL is a legacy Replit object-store path that no longer resolves */
function isLegacyUrl(url: string): boolean {
  // Pattern: /api/storage/objects/uploads/<uuid-without-extension>
  return /\/api\/storage\/objects\/uploads\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(url);
}

function getToken(): string {
  return localStorage.getItem('philingo_admin_token') ?? '';
}

export function MultiImageUpload({
  label,
  category,
  existingUrls = [],
  onUrlsChange,
  maxFiles = 20,
  hint,
}: MultiImageUploadProps) {
  const [uploads, setUploads] = useState<UploadEntry[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // URL input state
  const [urlInputOpen, setUrlInputOpen] = useState(false);
  const [urlInputValue, setUrlInputValue] = useState('');
  const [urlInputError, setUrlInputError] = useState('');
  const urlInputRef = useRef<HTMLInputElement>(null);

  // Stable refs — prevent stale closures inside async uploadFile
  const existingUrlsRef = useRef<string[]>(existingUrls);
  const onUrlsChangeRef = useRef(onUrlsChange);
  const maxFilesRef     = useRef(maxFiles);
  existingUrlsRef.current = existingUrls;
  onUrlsChangeRef.current = onUrlsChange;
  maxFilesRef.current     = maxFiles;

  // Track all blob URLs so we can revoke them on unmount (memory cleanup)
  const blobUrlsRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    return () => {
      blobUrlsRef.current.forEach(u => URL.revokeObjectURL(u));
      blobUrlsRef.current.clear();
    };
  }, []);

  const uploadFile = useCallback(async (file: File, replaceTargetUrl?: string) => {
    const tempId = `${Date.now()}-${Math.random()}`;

    // Create blob URL immediately BEFORE compression — stays alive (not revoked) until component unmounts
    const blobUrl = URL.createObjectURL(file);
    blobUrlsRef.current.add(blobUrl);

    // Add uploading entry — blob shows immediately as thumbnail
    setUploads(prev => [...prev, {
      tempId,
      objectPath: '',
      publicUrl: '',
      previewUrl: blobUrl,
      name: file.name,
      status: 'uploading',
      replaceTargetUrl,
    }]);

    // Compress before upload — max 500 KB, 1920px wide, convert to WebP for smaller files
    let compressed: File = file;
    try {
      const result = await imageCompression(file, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: 'image/webp',
      });
      // Rename to .webp so the stored object has the correct extension
      const baseName = file.name.replace(/\.[^.]+$/, '');
      compressed = new File([result], `${baseName}.webp`, { type: 'image/webp' });
    } catch { /* fallback to original */ }

    try {
      // Step 1: get presigned URL from API
      const metaRes = await fetch('/api/storage/uploads/request-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ name: compressed.name, size: compressed.size, contentType: compressed.type, category }),
      });
      if (!metaRes.ok) {
        const body = await metaRes.json().catch(() => ({}));
        throw new Error(body.error || `Request failed: ${metaRes.status}`);
      }
      const { uploadURL, objectPath, publicUrl } = await metaRes.json();

      // Step 2: upload compressed file to Supabase via presigned URL
      const uploadRes = await fetch(uploadURL, {
        method: 'PUT',
        headers: { 'Content-Type': compressed.type },
        body: compressed,
      });
      if (!uploadRes.ok) throw new Error(`Upload failed: ${uploadRes.status}`);

      // Permanent Supabase public URL
      const finalUrl = publicUrl as string;

      // Mark done — blob URL is kept in previewUrl so thumbnail stays visible immediately
      setUploads(prev => prev.map(u =>
        u.tempId === tempId ? { ...u, objectPath, publicUrl: finalUrl, status: 'done' } : u
      ));

      // Notify parent with updated URL list.
      // maxFiles=1: replacement mode — emit only the new URL.
      // maxFiles>1: additive mode — append to existing list (de-duplicated).
      const current = existingUrlsRef.current;
      let merged;
      if (maxFilesRef.current === 1) {
        merged = [finalUrl];
      } else if (replaceTargetUrl) {
        merged = current.map(u => u === replaceTargetUrl ? finalUrl : u);
      } else {
        merged = [...current, ...(!current.includes(finalUrl) ? [finalUrl] : [])];
      }
      onUrlsChangeRef.current(merged);

    } catch (err: any) {
      setUploads(prev => prev.map(u =>
        u.tempId === tempId ? { ...u, status: 'error', error: err.message } : u
      ));
    }
  }, [category]);

  const [urlFetching, setUrlFetching] = useState(false);

  const handleAddUrl = async () => {
    const url = urlInputValue.trim();
    if (!url) { setUrlInputError('กรุณาใส่ URL รูป'); return; }
    try { new URL(url); } catch { setUrlInputError('URL ไม่ถูกต้อง — ต้องเริ่มด้วย http:// หรือ https://'); return; }
    const current = existingUrlsRef.current;
    if (current.includes(url)) { setUrlInputError('รูปนี้มีอยู่แล้ว'); return; }
    if (maxFilesRef.current > 1 && current.length >= maxFilesRef.current) {
      setUrlInputError(`ครบ ${maxFilesRef.current} รูปแล้ว`); return;
    }

    setUrlFetching(true);
    setUrlInputError('');
    try {
      // Download the external URL server-side and store in Supabase
      const r = await fetch('/api/storage/uploads/fetch-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ url, category }),
      });
      const data = await r.json();
      if (!r.ok || data.error) {
        setUrlInputError(data.error ?? `เกิดข้อผิดพลาด HTTP ${r.status}`);
        return;
      }
      const finalUrl: string = data.imageUrl;
      const merged = maxFilesRef.current === 1 ? [finalUrl] : [...current, finalUrl];
      onUrlsChangeRef.current(merged);
      setUrlInputValue('');
      // Keep panel open for batch adds
      setTimeout(() => urlInputRef.current?.focus(), 50);
    } catch (err: any) {
      setUrlInputError(err?.message ?? 'เชื่อมต่อ server ไม่ได้');
    } finally {
      setUrlFetching(false);
    }
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
    // maxFiles=1 → replacement mode: always allow 1 upload (new file replaces existing)
    // maxFiles>1 → additive mode: count remaining open slots
    const inProgress = uploads.filter(u => u.status === 'uploading').length;
    const remaining = maxFiles === 1
      ? 1
      : Math.max(0, maxFiles - existingUrls.length - inProgress);
    Array.from(files)
      .slice(0, remaining)
      .forEach(f => { if (allowed.includes(f.type)) uploadFile(f); });
  };

  const removeExisting = (url: string) => {
    onUrlsChangeRef.current(existingUrlsRef.current.filter(u => u !== url));
  };

  const removeUpload = (entry: UploadEntry) => {
    if (entry.status === 'done' && entry.publicUrl) {
      // Remove the Supabase public URL from parent
      onUrlsChangeRef.current(existingUrlsRef.current.filter(u => u !== entry.publicUrl));
    }
    // Revoke blob immediately since we're explicitly removing it
    URL.revokeObjectURL(entry.previewUrl);
    blobUrlsRef.current.delete(entry.previewUrl);
    setUploads(prev => prev.filter(u => u.tempId !== entry.tempId));
  };

  // Split valid vs legacy (Replit UUID) URLs
  const validUrls = existingUrls.filter(u => !isLegacyUrl(u));
  const legacyCount = existingUrls.length - validUrls.length;

  const totalCount = validUrls.length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-gray-700">{label}</label>
        <span className="text-xs text-gray-400">{totalCount} รูป</span>
      </div>

      {hint && <p className="text-xs text-gray-500">{hint}</p>}

      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
        className={`relative border-2 border-dashed rounded-xl px-4 py-6 text-center cursor-pointer transition-all ${
          dragging ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
        }`}
      >
        <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600 font-medium">
          วางรูปที่นี่ หรือ <span className="text-blue-600 underline">คลิกเลือกไฟล์</span>
        </p>
        <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP — สูงสุด {maxFiles} รูป</p>
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.gif,.avif"
          multiple
          className="hidden"
          onChange={e => { handleFiles(e.target.files); e.target.value = ''; }}
        />
      </div>

      {/* URL input section */}
      <div>
        <button
          type="button"
          onClick={() => { setUrlInputOpen(o => !o); setUrlInputError(''); setTimeout(() => urlInputRef.current?.focus(), 80); }}
          className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          <Link2 className="w-3.5 h-3.5" />
          {urlInputOpen ? 'ซ่อนช่องใส่ URL' : '+ เพิ่มด้วย URL รูป'}
        </button>
        {urlInputOpen && (
          <div className="mt-2 flex gap-2 items-start">
            <div className="flex-1">
              <input
                ref={urlInputRef}
                type="url"
                value={urlInputValue}
                onChange={e => { setUrlInputValue(e.target.value); setUrlInputError(''); }}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddUrl(); } }}
                placeholder="https://example.com/image.jpg"
                disabled={urlFetching}
                className={`w-full border rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-300 outline-none transition-colors disabled:opacity-50 ${
                  urlInputError ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              />
              {urlInputError && <p className="text-[11px] text-red-500 mt-1">{urlInputError}</p>}
              {urlFetching && <p className="text-[11px] text-blue-500 mt-1 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> กำลังดาวน์โหลดและบันทึกเข้า Supabase...</p>}
            </div>
            <button
              type="button"
              onClick={handleAddUrl}
              disabled={urlFetching || !urlInputValue.trim()}
              className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors whitespace-nowrap"
            >
              {urlFetching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              {urlFetching ? 'กำลังโหลด...' : 'เพิ่ม'}
            </button>
          </div>
        )}
      </div>

      {/* Thumbnail grid */}
      {(validUrls.length > 0 || uploads.length > 0) && (
        <div className="grid grid-cols-4 gap-2">

          {/* Render all valid existing slots */}
          {validUrls.map((url, i) => {
            const activeUpload = uploads.find(u => 
              (u.replaceTargetUrl === url && u.status !== 'done') || 
              (u.status === 'done' && u.publicUrl === url)
            );

            if (activeUpload) {
              return renderUploadEntry(activeUpload);
            }

            return (
              <div key={url} className="relative group aspect-video rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                <img
                  src={url}
                  alt={`รูป ${i + 1}`}
                  className="w-full h-full object-cover"
                  onError={e => { (e.target as HTMLImageElement).style.opacity = '0.3'; }}
                />
                <div className="absolute top-1 right-1 hidden group-hover:flex items-center gap-1 z-10">
                  <label
                    title="เปลี่ยนรูป"
                    onClick={e => e.stopPropagation()}
                    className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center shadow hover:bg-blue-600 cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2v6h-6"></path><path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path><path d="M3 22v-6h6"></path><path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path></svg>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,.gif,.avif"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
                          if (allowed.includes(file.type)) {
                            uploadFile(file, url);
                          }
                        }
                        e.target.value = '';
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    title="ลบรูป"
                    onClick={e => { e.stopPropagation(); removeExisting(url); }}
                    className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <span className="absolute bottom-1 left-1 bg-black/50 text-white text-[9px] px-1 rounded">{i + 1}</span>
              </div>
            );
          })}

          {/* Render additive uploads that are not replacing anything and are not done yet */}
          {uploads
            .filter(u => !u.replaceTargetUrl && u.status !== 'done')
            .map(u => renderUploadEntry(u))}
        </div>
      )}
    </div>
  );

  function renderUploadEntry(u: UploadEntry) {
    return (
      <div key={u.tempId} className={`relative group aspect-video rounded-lg overflow-hidden border bg-gray-50 ${
        u.status === 'error' ? 'border-red-300' : 'border-gray-200'
      }`}>
        <img src={u.previewUrl} alt={u.name} className="w-full h-full object-cover" />
        
        {u.status === 'uploading' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <Loader2 className="w-5 h-5 text-white animate-spin" />
          </div>
        )}
        {u.status === 'done' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-green-400 drop-shadow" />
          </div>
        )}
        {u.status === 'error' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-red-500/60">
            <AlertCircle className="w-5 h-5 text-white" />
            <span className="text-white text-[9px] px-1 text-center leading-tight">{u.error?.slice(0, 40)}</span>
          </div>
        )}
        {u.status !== 'uploading' && (
          <button
            type="button"
            onClick={e => { e.stopPropagation(); removeUpload(u); }}
            className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full hidden group-hover:flex items-center justify-center z-10"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
    );
  }
}
