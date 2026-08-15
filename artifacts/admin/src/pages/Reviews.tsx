import React, { useCallback, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { MultiImageUpload } from '@/components/ui/MultiImageUpload';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { SearchBar } from '@/components/ui/SearchBar';
import { Toggle } from '@/components/ui/Toggle';
import { StatusBadge } from '@/components/ui/Badge';
import { useCrud } from '@/hooks/useCrud';
import { blogApi, BlogPost } from '@/lib/api';
import { Plus, Pencil, Trash2, Eye, Sparkles, Images, X, Loader2, Bot } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

/* ─── helpers ─────────────────────────────────────────────── */
function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\sก-๙a-z0-9-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function getToken() {
  return localStorage.getItem('philingo_admin_token') ?? '';
}

interface GalleryItem { id: number; imageUrl: string; titleTh: string | null; }

/* We store reviews as blog_posts with category = 'review'.
   Build a custom API object that always injects category='review' into list/create/update */

/* ─── Full BlogPost type for the form ─────────────────────── */
interface FullBlogPost extends BlogPost {
  titleTh: string;
  excerptTh: string | null;
  excerpt: string | null;
  content: string | null;
  contentTh: string | null;
  coverImageUrl: string | null;
  authorTh: string | null;
  tags: string[] | null;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  isFeatured: boolean;
}

/* ─── Zod schema ───────────────────────────────────────────── */
const schema = z.object({
  slug:            z.string().min(1, 'กรุณากรอก slug'),
  titleTh:         z.string().min(1, 'กรุณากรอกชื่อบทความ (ภาษาไทย)'),
  title:           z.string().optional().default(''),
  excerptTh:       z.string().optional().default(''),
  excerpt:         z.string().optional().default(''),
  contentTh:       z.string().optional().default(''),
  content:         z.string().optional().default(''),
  coverImageUrl:   z.string().optional().default(''),
  author:          z.string().optional().default(''),
  authorTh:        z.string().optional().default(''),
  tags:            z.string().optional().default(''),
  seoTitle:        z.string().optional().default(''),
  seoDescription:  z.string().optional().default(''),
  seoKeywords:     z.string().optional().default(''),
  isFeatured:      z.boolean().default(false),
  isPublished:     z.boolean().default(false),
});

type FormData = z.infer<typeof schema>;

const tagsToStr = (tags: string[] | null | undefined) => (tags ?? []).join(', ');
const strToTags = (s: string) => s.split(',').map(t => t.trim()).filter(Boolean);

/* ─── ReviewForm ───────────────────────────────────────────── */
function ReviewForm({
  defaultValues, onSave, onCancel, isLoading,
}: {
  defaultValues?: Partial<FullBlogPost>;
  onSave: (d: FormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}) {
  const { register, handleSubmit, control, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      slug:           defaultValues?.slug ?? '',
      titleTh:        defaultValues?.titleTh ?? '',
      title:          defaultValues?.title ?? '',
      excerptTh:      defaultValues?.excerptTh ?? '',
      excerpt:        defaultValues?.excerpt ?? '',
      contentTh:      defaultValues?.contentTh ?? '',
      content:        defaultValues?.content ?? '',
      coverImageUrl:  defaultValues?.coverImageUrl ?? '',
      author:         defaultValues?.author ?? '',
      authorTh:       defaultValues?.authorTh ?? '',
      tags:           tagsToStr(defaultValues?.tags),
      seoTitle:       defaultValues?.seoTitle ?? '',
      seoDescription: defaultValues?.seoDescription ?? '',
      seoKeywords:    defaultValues?.seoKeywords ?? '',
      isFeatured:     defaultValues?.isFeatured ?? false,
      isPublished:    defaultValues?.isPublished ?? false,
    },
  });

  const slugVal   = watch('slug');
  const seoTitle  = watch('seoTitle') ?? '';
  const seoDesc   = watch('seoDescription') ?? '';
  const contentTh = watch('contentTh') ?? '';

  const [activeTab, setActiveTab]       = useState<'content' | 'cover' | 'seo'>('content');
  const [showGallery, setShowGallery]   = useState(false);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [genContent, setGenContent]     = useState(false);
  const [genSeo, setGenSeo]             = useState(false);
  const [aiError, setAiError]           = useState('');

  const TAB = (t: typeof activeTab) =>
    `px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === t ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`;

  // AI: write full review article
  const handleGenerateContent = useCallback(async () => {
    const title = watch('titleTh');
    if (!title) { setAiError('กรุณากรอกชื่อบทความก่อนกด AI'); return; }
    setAiError('');
    setGenContent(true);
    try {
      const res = await fetch('/api/blog/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ title, category: 'school' }),
      });
      const d = await res.json();
      if (d.content) setValue('contentTh', d.content, { shouldDirty: true });
      else setAiError(d.error || 'AI ไม่ตอบสนอง กรุณาลองใหม่');
    } catch {
      setAiError('เชื่อมต่อ AI ไม่ได้ กรุณาลองใหม่');
    } finally {
      setGenContent(false);
    }
  }, [watch, setValue]);

  // Load gallery
  const loadGallery = useCallback(async () => {
    if (galleryItems.length > 0) { setShowGallery(true); return; }
    setGalleryLoading(true);
    setShowGallery(true);
    try {
      const res = await fetch('/api/gallery?isActive=true&limit=60');
      const d = await res.json();
      setGalleryItems(d.data ?? []);
    } catch { /* ignore */ }
    finally { setGalleryLoading(false); }
  }, [galleryItems.length]);

  // AI: generate SEO
  const handleGenerateSeo = useCallback(async () => {
    const title   = watch('titleTh');
    const content = watch('contentTh') || watch('excerptTh') || title;
    if (!title) { setAiError('กรุณากรอกชื่อบทความก่อน'); return; }
    setAiError('');
    setGenSeo(true);
    try {
      const res = await fetch('/api/blog/generate-seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ title, content }),
      });
      const d = await res.json();
      if (d.seoTitle)       setValue('seoTitle',       d.seoTitle,       { shouldDirty: true });
      if (d.seoDescription) setValue('seoDescription', d.seoDescription, { shouldDirty: true });
      if (d.seoKeywords)    setValue('seoKeywords',    d.seoKeywords,    { shouldDirty: true });
      if (!d.seoTitle)      setAiError(d.error || 'AI ไม่ตอบสนอง กรุณาลองใหม่');
    } catch {
      setAiError('เชื่อมต่อ AI ไม่ได้ กรุณาลองใหม่');
    } finally {
      setGenSeo(false);
    }
  }, [watch, setValue]);

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4">
      {/* Error banner */}
      {aiError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">
          <span className="flex-1">{aiError}</span>
          <button type="button" onClick={() => setAiError('')}><X className="h-3.5 w-3.5" /></button>
        </div>
      )}

      {/* Title + Slug row */}
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            ชื่อบทความ (ภาษาไทย) <span className="text-red-500">*</span>
          </label>
          <input
            {...register('titleTh')}
            onBlur={e => {
              if (!slugVal) setValue('slug', toSlug(e.target.value));
            }}
            placeholder="เช่น รีวิวเรียนที่ [ชื่อโรงเรียน] [ระยะเวลา] ได้ผลจริงไหม?"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-300 outline-none"
          />
          {errors.titleTh && <p className="text-xs text-red-500 mt-1">{errors.titleTh.message}</p>}
        </div>
        <Input label="ชื่อบทความ (English)" {...register('title')} placeholder="Optional English title" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Slug (URL) <span className="text-red-500">*</span></label>
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-400">/posts/</span>
            <input {...register('slug')} placeholder="review-school-name" className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-300 outline-none font-mono" />
          </div>
          {errors.slug && <p className="text-xs text-red-500 mt-1">{errors.slug.message}</p>}
        </div>
        <Input label="ผู้เขียน (TH)" {...register('authorTh')} placeholder="เช่น น้องมิ้น · CPILS 4 สัปดาห์" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-100 pb-3">
        <button type="button" className={TAB('content')} onClick={() => setActiveTab('content')}>📝 เนื้อหา</button>
        <button type="button" className={TAB('cover')} onClick={() => setActiveTab('cover')}>🖼️ รูปภาพ</button>
        <button type="button" className={TAB('seo')} onClick={() => setActiveTab('seo')}>🔍 SEO</button>
      </div>

      {/* ── Content tab ── */}
      {activeTab === 'content' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">สรุปย่อ (ไทย)</label>
              <textarea {...register('excerptTh')} rows={3} placeholder="ประโยคสั้นๆ 1-2 ประโยคที่โชว์บนการ์ด เช่น 'เรียน CPILS 4 สัปดาห์ TOEIC +85 คะแนน...'" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-300 outline-none resize-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Excerpt (EN)</label>
              <textarea {...register('excerpt')} rows={3} placeholder="Optional English excerpt..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-300 outline-none resize-none" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <div>
                <label className="block text-xs font-semibold text-gray-700">เนื้อหาหลัก (ภาษาไทย)</label>
                <p className="text-[11px] text-gray-400">รองรับ HTML: &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;&lt;li&gt;, &lt;strong&gt;, &lt;blockquote&gt;</p>
              </div>
              <button
                type="button"
                onClick={handleGenerateContent}
                disabled={genContent}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
              >
                {genContent
                  ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />กำลังเขียน...</>
                  : <><Bot className="h-3.5 w-3.5" />🤖 เขียนด้วย AI</>}
              </button>
            </div>
            <textarea
              {...register('contentTh')} rows={14}
              placeholder={'<h2>ทำไมถึงเลือกโรงเรียนนี้?</h2>\n<p>เลือกเพราะ...</p>\n<blockquote>ครูสอนดีมาก ทำให้สนุกทุกวัน</blockquote>'}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-blue-300 outline-none resize-y"
            />
            {genContent && (
              <p className="text-xs text-blue-600 animate-pulse mt-1">⏳ AI กำลังเขียนบทความรีวิว 800–1500 คำ อาจใช้เวลา 15–30 วินาที...</p>
            )}
            {contentTh && (
              <p className="text-[11px] text-gray-400 mt-1">
                {contentTh.replace(/<[^>]+>/g, '').trim().split(/\s+/).length} tokens
                · {contentTh.replace(/<[^>]+>/g, '').length} ตัวอักษร
              </p>
            )}
          </div>

          <Input label="Tags (คั่นด้วยจุลภาค)" {...register('tags')} placeholder="CPILS, Cebu, IELTS, ฟิลิปปินส์" />
        </div>
      )}

      {/* ── Cover tab ── */}
      {activeTab === 'cover' && (
        <div className="space-y-4">
          {/* Gallery picker button */}
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-700">รูปปก (Cover Image)</p>
            <button
              type="button"
              onClick={loadGallery}
              className="flex items-center gap-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors border border-purple-200"
            >
              <Images className="h-3.5 w-3.5" />
              เลือกจาก Gallery
            </button>
          </div>

          {/* Gallery grid */}
          {showGallery && (
            <div className="border border-purple-200 rounded-xl bg-purple-50/50 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-purple-700">คลิกรูปเพื่อใช้เป็นรูปปก</span>
                <button type="button" onClick={() => setShowGallery(false)}><X className="h-4 w-4 text-gray-400" /></button>
              </div>
              {galleryLoading ? (
                <div className="flex items-center justify-center py-4 gap-2 text-sm text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />กำลังโหลด...
                </div>
              ) : galleryItems.length === 0 ? (
                <p className="text-xs text-gray-500 py-2 text-center">ยังไม่มีรูปใน Gallery</p>
              ) : (
                <div className="grid grid-cols-5 gap-2 max-h-48 overflow-y-auto">
                  {galleryItems.map(item => (
                    <button
                      key={item.id} type="button"
                      onClick={() => { setValue('coverImageUrl', item.imageUrl, { shouldDirty: true }); setShowGallery(false); }}
                      className="group relative aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-purple-500 transition-all"
                    >
                      <img src={item.imageUrl} alt={item.titleTh ?? ''} className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        onError={e => { (e.target as HTMLImageElement).style.opacity = '0.3'; }} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <Controller control={control} name="coverImageUrl" render={({ field }) => (
            <MultiImageUpload
              label="อัปโหลดรูปใหม่"
              category="banner"
              existingUrls={field.value ? [field.value] : []}
              onUrlsChange={urls => field.onChange(urls[0] ?? '')}
              maxFiles={1}
              hint="แนะนำ 1200×630px ขึ้นไป สำหรับ SEO Open Graph"
            />
          )} />

          <div>
            <p className="text-xs text-gray-500 mb-1">หรือใส่ URL รูปโดยตรง</p>
            {/* Controlled input — ต้องใช้ value+onChange ไม่ใช่ register เพราะ
                register กับ Controller บน field เดียวกันจะ override กัน ทำให้
                การกด X ใน MultiImageUpload ไม่สามารถล้าง URL ได้ตอน submit */}
            <input
              value={watch('coverImageUrl') ?? ''}
              onChange={e => setValue('coverImageUrl', e.target.value, { shouldDirty: true })}
              placeholder="https://example.com/image.jpg"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-300 outline-none"
            />
          </div>

          {/* Preview */}
          {watch('coverImageUrl') && (
            <div className="rounded-xl overflow-hidden border border-gray-200">
              <img src={watch('coverImageUrl')} alt="preview" className="w-full h-40 object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </div>
          )}

          <Input label="ผู้เขียน (EN)" {...register('author')} placeholder="e.g. Jane Doe" />
        </div>
      )}

      {/* ── SEO tab ── */}
      {activeTab === 'seo' && (
        <div className="space-y-3">
          {/* AI SEO button */}
          <div className="flex items-center justify-between">
            <div className="text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 space-y-1 flex-1 mr-3">
              <p className="font-bold">💡 เคล็ดลับ SEO</p>
              <p>• SEO Title: keyword หลัก + ชื่อสถาบัน ≤ 60 ตัวอักษร</p>
              <p>• Meta Description: ดึงคนคลิก 150–160 ตัวอักษร</p>
            </div>
            <button
              type="button"
              onClick={handleGenerateSeo}
              disabled={genSeo}
              className="flex flex-col items-center gap-1 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-white text-xs font-medium px-4 py-3 rounded-xl transition-colors whitespace-nowrap"
            >
              {genSeo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {genSeo ? 'กำลังสร้าง...' : '✨ สร้าง SEO'}
              {!genSeo && <span className="font-normal opacity-80">อัตโนมัติ</span>}
            </button>
          </div>

          {/* SEO Title */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-gray-700">SEO Title</label>
              <span className={`text-[11px] ${seoTitle.length > 60 ? 'text-red-500' : 'text-gray-400'}`}>{seoTitle.length}/60</span>
            </div>
            <input {...register('seoTitle')} maxLength={70}
              placeholder="รีวิวเรียน [ชื่อโรงเรียน] [ระยะเวลา] ได้ผลจริงไหม? | Philingo"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-300 outline-none" />
          </div>

          {/* SEO Description */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-gray-700">Meta Description</label>
              <span className={`text-[11px] ${seoDesc.length > 160 ? 'text-red-500' : seoDesc.length > 130 ? 'text-yellow-500' : 'text-gray-400'}`}>{seoDesc.length}/160</span>
            </div>
            <textarea {...register('seoDescription')} maxLength={170} rows={3}
              placeholder="รีวิวจากนักเรียนจริง ประสบการณ์เรียนภาษาอังกฤษ ค่าใช้จ่าย และผลลัพธ์ที่ได้จริง..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-300 outline-none resize-none" />
          </div>

          {/* Keywords */}
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">Keywords (คั่นด้วยจุลภาค)</label>
            <input {...register('seoKeywords')}
              placeholder="รีวิวเรียนฟิลิปปินส์, เรียนที่เซบู, ค่าใช้จ่ายเรียนฟิลิปปินส์..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-300 outline-none" />
          </div>

          {/* Google Preview */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-[11px] text-gray-400 mb-2 uppercase font-bold tracking-wide">ตัวอย่าง Google Preview</p>
            <p className="text-green-700 text-xs mb-0.5">philingoedu.com/posts/{watch('slug') || 'slug'}</p>
            <p className="text-blue-700 font-semibold text-sm leading-snug line-clamp-1">
              {seoTitle || watch('titleTh') || 'SEO Title'}
            </p>
            <p className="text-gray-600 text-xs mt-1 line-clamp-2">
              {seoDesc || watch('excerptTh') || 'Meta description จะโชว์ที่นี่...'}
            </p>
          </div>
        </div>
      )}

      {/* Toggles */}
      <div className="flex items-center gap-6 pt-2 border-t border-gray-100">
        <Controller control={control} name="isFeatured" render={({ field }) => (
          <Toggle checked={field.value} onChange={field.onChange} label="⭐ Featured" />
        )} />
        <Controller control={control} name="isPublished" render={({ field }) => (
          <Toggle checked={field.value} onChange={field.onChange} label="🟢 เผยแพร่" />
        )} />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" type="button" onClick={onCancel}>ยกเลิก</Button>
        <Button type="submit" loading={isLoading}>💾 บันทึก</Button>
      </div>
    </form>
  );
}

/* ─── reviewsApi — wraps blogApi, always forces category='review' ── */
const reviewsApi = {
  list: (params?: Record<string, string | number>) =>
    blogApi.list({ ...params, category: 'review' }) as Promise<{ data: FullBlogPost[]; total: number }>,
  create: (d: any) =>
    blogApi.create({ ...d, category: 'review', tags: strToTags(d.tags ?? ''), publishedAt: d.isPublished ? new Date().toISOString() : null }) as Promise<FullBlogPost>,
  update: (id: number | string, d: any) =>
    blogApi.update(id, { ...d, category: 'review', tags: strToTags(d.tags ?? ''), publishedAt: d.isPublished ? new Date().toISOString() : null }) as Promise<FullBlogPost>,
  delete: (id: number | string) => blogApi.delete(id),
};

/* ─── ReviewsPage ──────────────────────────────────────────── */
export function ReviewsPage() {
  const crud = useCrud<FullBlogPost>({
    api: reviewsApi,
    queryKey: 'reviews',
  });

  const columns = [
    {
      key: 'cover', header: '',
      cell: (r: FullBlogPost) => r.coverImageUrl
        ? <img src={r.coverImageUrl} className="w-14 h-10 object-cover rounded-lg border border-gray-100" alt="" />
        : <div className="w-14 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-300 text-lg">🖼️</div>,
    },
    {
      key: 'titleTh', header: 'ชื่อบทความ',
      cell: (r: FullBlogPost) => (
        <div>
          <p className="font-semibold text-sm text-gray-900 line-clamp-1">{r.titleTh || r.title}</p>
          <p className="text-xs text-gray-400 font-mono">/posts/{r.slug}</p>
        </div>
      ),
    },
    { key: 'author', header: 'ผู้เขียน', cell: (r: FullBlogPost) => <span className="text-sm text-gray-600">{r.authorTh || r.author || '–'}</span> },
    {
      key: 'seo', header: 'SEO',
      cell: (r: FullBlogPost) => (
        <div className="flex gap-1">
          {r.seoTitle && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium">Title ✓</span>}
          {r.seoDescription && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium">Desc ✓</span>}
          {!r.seoTitle && !r.seoDescription && <span className="text-[10px] text-gray-400">–</span>}
        </div>
      ),
    },
    { key: 'views', header: 'ยอดชม', cell: (r: FullBlogPost) => <span className="text-sm">{r.views?.toLocaleString() ?? 0}</span> },
    { key: 'isFeatured', header: '⭐', cell: (r: FullBlogPost) => r.isFeatured ? <span className="text-yellow-500">⭐</span> : <span className="text-gray-300">–</span> },
    { key: 'status', header: 'สถานะ', cell: (r: FullBlogPost) => <StatusBadge active={r.isPublished} /> },
    {
      key: 'actions', header: '',
      cell: (r: FullBlogPost) => (
        <div className="flex gap-1 justify-end">
          <a href={`/posts/${r.slug}`} target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors">
            <Eye className="w-3.5 h-3.5" />
          </a>
          <Button size="sm" variant="ghost" icon={<Pencil className="h-3.5 w-3.5" />} onClick={() => crud.openEdit(r)}>แก้ไข</Button>
          <Button size="sm" variant="ghost" icon={<Trash2 className="h-3.5 w-3.5" />} onClick={() => crud.handleDelete(r.id)} className="text-red-500 hover:text-red-700">ลบ</Button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout title="บทความรีวิว" actions={
      <Button icon={<Plus className="h-4 w-4" />} onClick={crud.openCreate}>เพิ่มรีวิวใหม่</Button>
    }>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-200 flex items-center gap-3">
          <SearchBar value={crud.search} onChange={crud.setSearch} placeholder="ค้นหาบทความรีวิว..." className="w-72" />
          <span className="text-xs text-gray-400 ml-auto">รีวิวทั้งหมดใช้ URL: <strong>/posts/[slug]</strong></span>
        </div>
        <div className="p-4">
          <Table
            data={crud.data}
            columns={columns}
            isLoading={crud.isLoading}
            page={crud.page}
            total={crud.total}
            pageSize={20}
            onPageChange={crud.setPage}
          />
        </div>
      </div>

      <Modal
        open={crud.showModal}
        onClose={crud.closeModal}
        title={crud.editItem ? `แก้ไขรีวิว — ${crud.editItem.titleTh || crud.editItem.title}` : 'เพิ่มบทความรีวิวใหม่'}
        size="xl"
      >
        <ReviewForm
          defaultValues={crud.editItem ?? undefined}
          onSave={crud.handleSave}
          onCancel={crud.closeModal}
          isLoading={crud.isSaving}
        />
      </Modal>
    </AdminLayout>
  );
}
