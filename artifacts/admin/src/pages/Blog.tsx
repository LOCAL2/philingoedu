import React, { useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Table } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/Modal';
import { SearchBar } from '@/components/ui/SearchBar';
import { Toggle } from '@/components/ui/toggle';
import { Badge } from '@/components/ui/badge';
import { useCrud } from '@/hooks/useCrud';
import { blogApi, BlogPost } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Plus, Pencil, Trash2, Sparkles, Bot, Images, X, Loader2 } from 'lucide-react';

const categories = [
  { value: 'review', label: '⭐ รีวิวสถาบัน' },
  { value: 'news', label: 'ข่าวสาร' },
  { value: 'tips', label: 'เคล็ดลับ' },
  { value: 'school', label: 'โรงเรียน' },
  { value: 'life', label: 'ชีวิตในต่างประเทศ' },
  { value: 'other', label: 'อื่นๆ' },
];

function getToken() {
  return localStorage.getItem('philingo_admin_token') ?? '';
}

const schema = z.object({
  title: z.string().min(1, 'กรุณากรอกชื่อบทความ'),
  titleTh: z.string().optional(),
  slug: z.string().min(1, 'กรุณากรอก slug'),
  category: z.string().optional(),
  author: z.string().optional(),
  excerpt: z.string().optional(),
  contentTh: z.string().optional(),
  coverImageUrl: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.string().optional(),
  isPublished: z.boolean(),
  tags: z.array(z.string()).optional(),
  reviewSchoolId: z.number().optional(),
});

type BlogFormData = z.infer<typeof schema>;

interface SchoolOption { id: number; name: string; city: string; }


interface GalleryItem { id: number; imageUrl: string; titleTh: string | null; }

function BlogForm({ defaultValues, onSave, onCancel, isLoading }: {
  defaultValues?: Partial<BlogPost>;
  onSave: (d: BlogFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}) {
  const [imageUploading, setImageUploading] = useState(false);
  const [schools, setSchools] = useState<SchoolOption[]>([]);

  // Load schools list once for the review school selector
  React.useEffect(() => {
    fetch('/api/schools?limit=100')
      .then(r => r.json())
      .then(d => {
        const list: SchoolOption[] = (d?.data ?? []).map((s: { id: number; name: string; city?: string }) => ({
          id: s.id,
          name: s.name,
          city: s.city ?? '',
        }));
        setSchools(list);
      })
      .catch(() => {});
  }, []);

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<BlogFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      isPublished: defaultValues?.isPublished ?? false,
      title: defaultValues?.title ?? '',
      titleTh: defaultValues?.titleTh ?? '',
      slug: defaultValues?.slug ?? '',
      category: defaultValues?.category ?? '',
      author: defaultValues?.author ?? '',
      excerpt: defaultValues?.excerpt ?? '',
      contentTh: defaultValues?.contentTh ?? '',
      coverImageUrl: defaultValues?.coverImageUrl ?? '',
      seoTitle: defaultValues?.seoTitle ?? '',
      seoDescription: defaultValues?.seoDescription ?? '',
      seoKeywords: defaultValues?.seoKeywords ?? '',
      tags: defaultValues?.tags ?? [],
    } satisfies Partial<BlogFormData>,
  });

  const [genContent, setGenContent] = useState(false);
  const [genSeo, setGenSeo] = useState(false);
  const [fetchCover, setFetchCover] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  // Map Thai/English title keywords → Unsplash search terms
  const getUnsplashKw = (title: string) => {
    if (/เซบู|cebu/i.test(title)) return 'cebu,philippines,study';
    if (/บาเกีย|baguio/i.test(title)) return 'baguio,philippines,mountain';
    if (/คลาร์ก|clark/i.test(title)) return 'philippines,study,english';
    if (/ที่เที่ยว|travel|tourist|ท่องเที่ยว/i.test(title)) return 'travel,tropical,philippines';
    if (/อาหาร|food/i.test(title)) return 'food,tropical,asian';
    if (/sim|ซิม|อินเตอร์เน็ต|internet/i.test(title)) return 'mobile,technology,travel';
    if (/ค่าใช้จ่าย|ราคา|cost|price|budget/i.test(title)) return 'money,budgeting,travel';
    if (/สุขภาพ|health|โรงพยาบาล|hospital/i.test(title)) return 'health,hospital,care';
    if (/เรียน|study|english|ภาษาอังกฤษ/i.test(title)) return 'study,english,classroom';
    return 'study,english,philippines';
  };

  const contentTh = watch('contentTh') ?? '';
  const seoTitle = watch('seoTitle') ?? '';
  const seoDesc = watch('seoDescription') ?? '';

  // Auto-generate slug from title
  const handleTitleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    const slug = e.target.value
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    if (!watch('slug')) setValue('slug', slug);
  }, [setValue, watch]);

  // Load gallery images
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

  // AI: write full article
  const handleGenerateContent = useCallback(async () => {
    const title = watch('title');
    const category = watch('category');
    if (!title) { setAiError('กรุณากรอกชื่อบทความก่อนกดเขียนด้วย AI'); return; }
    setAiError('');
    setGenContent(true);
    try {
      const res = await fetch('/api/blog/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ title, category }),
      });
      const d = await res.json();
      if (d.content) {
        setValue('contentTh', d.content, { shouldDirty: true });
      } else {
        setAiError(d.error || 'AI ไม่ตอบสนอง กรุณาลองใหม่');
      }
    } catch {
      setAiError('เชื่อมต่อ AI ไม่ได้ กรุณาลองใหม่');
    } finally {
      setGenContent(false);
    }
  }, [watch, setValue]);

  // AI: generate SEO
  const handleGenerateSeo = useCallback(async () => {
    const title = watch('title');
    const content = watch('contentTh');
    if (!content || content.trim().length < 50) {
      setAiError('กรุณาเขียนเนื้อหาบทความก่อน (อย่างน้อย 50 ตัวอักษร)');
      return;
    }
    setAiError('');
    setGenSeo(true);
    try {
      const res = await fetch('/api/blog/generate-seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ title, content }),
      });
      const d = await res.json();
      if (d.seoTitle) setValue('seoTitle', d.seoTitle, { shouldDirty: true });
      if (d.seoDescription) setValue('seoDescription', d.seoDescription, { shouldDirty: true });
      if (d.seoKeywords) setValue('seoKeywords', d.seoKeywords, { shouldDirty: true });
      if (!d.seoTitle) setAiError(d.error || 'AI ไม่ตอบสนอง กรุณาลองใหม่');
    } catch {
      setAiError('เชื่อมต่อ AI ไม่ได้ กรุณาลองใหม่');
    } finally {
      setGenSeo(false);
    }
  }, [watch, setValue]);

  // Auto-fetch cover image from Unsplash (server-side via gallery/fetch-url → GCS)
  const handleFetchCover = useCallback(async () => {
    const title = watch('title') || watch('slug') || 'philippines study';
    const kw = getUnsplashKw(title);
    const url = `https://loremflickr.com/800/450/${kw}`;
    setFetchCover(true);
    setAiError('');
    try {
      const res = await fetch('/api/gallery/fetch-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ url, titleTh: title }),
      });
      const d = await res.json();
      if (d.imageUrl) {
        setValue('coverImageUrl', d.imageUrl, { shouldDirty: true });
      } else {
        setAiError(d.error || 'ดึงรูปปกไม่สำเร็จ — ลองอัปโหลดเองหรือเลือกจาก Gallery');
      }
    } catch {
      setAiError('เชื่อมต่อ server ไม่ได้ กรุณาลองใหม่');
    } finally {
      setFetchCover(false);
    }
  }, [watch, setValue]);

  const selectedCategory = watch('category');

  const handleSave = (data: BlogFormData) => {
    // titleTh defaults to title if not filled (DB requires notNull)
    if (!data.titleTh) data.titleTh = data.title;

    // When category=review, attach selected school name as the first tag
    if (data.reviewSchoolId) {
      const school = schools.find(s => s.id === data.reviewSchoolId);
      if (school) {
        const existingTags = (data.tags ?? []).filter(t =>
          !schools.some(s => s.name === t)
        );
        data.tags = [school.name, ...existingTags];
      }
    }

    // Always pass tags so existing tags are preserved
    if (!data.tags) data.tags = defaultValues?.tags ?? [];

    onSave(data);
  };

  return (
    <form onSubmit={handleSubmit(handleSave)} className="space-y-5">
      {/* Error banner */}
      {aiError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">
          <span className="flex-1">{aiError}</span>
          <button type="button" onClick={() => setAiError('')}><X className="h-3.5 w-3.5" /></button>
        </div>
      )}

      {/* Row 1: title + slug */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="ชื่อบทความ (ไทย)"
          error={errors.title?.message}
          {...register('title')}
          onBlur={handleTitleBlur}
        />
        <Input label="Slug (URL)" error={errors.slug?.message} placeholder="my-article-slug" {...register('slug')} />
      </div>

      {/* Row 2: author + category */}
      <div className="grid grid-cols-2 gap-4">
        <Input label="ผู้เขียน" {...register('author')} />
        <Controller control={control} name="category" render={({ field }) => (
          <Select label="หมวดหมู่" options={categories} placeholder="เลือกหมวดหมู่" {...field} value={field.value ?? ''} />
        )} />
      </div>

      {/* Row 2b: school selector — แสดงเฉพาะหมวด "รีวิวสถาบัน" */}
      {selectedCategory === 'review' && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3">
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">📍 ข้อมูลรีวิว</p>
          <div className="grid grid-cols-2 gap-4">
            <Controller
              control={control}
              name="reviewSchoolId"
              render={({ field }) => {
                // Group schools by city
                const cityGroups = schools.reduce<Record<string, SchoolOption[]>>((acc, s) => {
                  const city = s.city || 'ไม่ระบุเมือง';
                  if (!acc[city]) acc[city] = [];
                  acc[city].push(s);
                  return acc;
                }, {});

                // Pre-select from existing tags when editing
                const preselect = field.value ?? (() => {
                  const existingTags = defaultValues?.tags ?? [];
                  const match = schools.find(s => existingTags.includes(s.name));
                  return match?.id;
                })();

                return (
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">สถาบันที่รีวิว</label>
                    <select
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={preselect ?? ''}
                      onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                    >
                      <option value="">— เลือกสถาบัน —</option>
                      {Object.entries(cityGroups).sort(([a], [b]) => a.localeCompare(b)).map(([city, list]) => (
                        <optgroup key={city} label={`📌 ${city}`}>
                          {list.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                    {preselect && schools.find(s => s.id === preselect) && (
                      <p className="text-xs text-amber-600 mt-1">
                        ✅ {schools.find(s => s.id === preselect)?.name} · {schools.find(s => s.id === preselect)?.city}
                      </p>
                    )}
                  </div>
                );
              }}
            />
            <Input
              label="ชื่อผู้เขียนรีวิว (ผู้เรียน)"
              placeholder="เช่น น้องมิน อายุ 22 ปี"
              {...register('author')}
            />
          </div>
        </div>
      )}

      {/* Cover image + Gallery picker */}
      <div className="space-y-2">
        <div className="flex items-end gap-3 flex-wrap">
          <div className="flex-1 min-w-[240px]">
            <Controller control={control} name="coverImageUrl" render={({ field }) => (
              <ImageUpload label="รูปภาพปก" value={field.value || ''} onChange={field.onChange} onUploadingChange={setImageUploading} />
            )} />
          </div>
          <button
            type="button"
            onClick={handleFetchCover}
            disabled={fetchCover}
            title="ดึงรูปปกจาก Unsplash อัตโนมัติตามหัวข้อบทความ"
            className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors border border-emerald-200 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {fetchCover ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            {fetchCover ? 'กำลังดึงรูป...' : 'Auto Cover'}
          </button>
          <button
            type="button"
            onClick={loadGallery}
            className="flex items-center gap-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors border border-purple-200 whitespace-nowrap"
          >
            <Images className="h-3.5 w-3.5" />
            เลือกจาก Gallery
          </button>
        </div>

        {/* Gallery picker grid */}
        {showGallery && (
          <div className="border border-purple-200 rounded-xl bg-purple-50/50 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-purple-700">รูปใน Gallery ({galleryItems.length} รูป) — คลิกเพื่อใช้เป็นรูปปก</span>
              <button type="button" onClick={() => setShowGallery(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            {galleryLoading ? (
              <div className="flex items-center justify-center py-4 gap-2 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />กำลังโหลด...
              </div>
            ) : galleryItems.length === 0 ? (
              <p className="text-xs text-gray-500 py-2 text-center">ยังไม่มีรูปใน Gallery — ไปเพิ่มที่เมนู Gallery ก่อน</p>
            ) : (
              <div className="grid grid-cols-5 gap-2 max-h-48 overflow-y-auto">
                {galleryItems.map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => { setValue('coverImageUrl', item.imageUrl, { shouldDirty: true }); setShowGallery(false); }}
                    className="group relative aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-purple-500 transition-all"
                    title={item.titleTh ?? ''}
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.titleTh ?? ''}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      onError={e => { (e.target as HTMLImageElement).style.opacity = '0.3'; }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Excerpt */}
      <Textarea label="สรุปย่อ (Excerpt)" rows={2} placeholder="สรุปย่อสำหรับแสดงในหน้ารายการบทความ..." {...register('excerpt')} />

      {/* Content (Thai) — rich text editor */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">
            เนื้อหาบทความ
            <span className="ml-2 text-xs text-gray-400 font-normal">
              {contentTh ? `${contentTh.replace(/<[^>]+>/g, '').trim().split(/\s+/).filter(Boolean).length} คำ` : '0 คำ'}
            </span>
          </label>
          <button
            type="button"
            onClick={handleGenerateContent}
            disabled={genContent}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
          >
            {genContent ? (
              <><Loader2 className="h-3.5 w-3.5 animate-spin" />กำลังเขียน...</>
            ) : (
              <><Bot className="h-3.5 w-3.5" />🤖 เขียนด้วย AI</>
            )}
          </button>
        </div>
        <Controller
          name="contentTh"
          control={control}
          render={({ field }) => (
            <RichTextEditor
              value={field.value ?? ''}
              onChange={field.onChange}
              placeholder="เนื้อหาบทความ... หรือกด '🤖 เขียนด้วย AI' ให้ AI เขียนให้อัตโนมัติ
ลากรูปภาพมาวางที่ตำแหน่งที่ต้องการได้เลย"
              minHeight={420}
            />
          )}
        />
        {genContent && (
          <p className="text-xs text-blue-600 animate-pulse">⏳ AI กำลังเขียนบทความ 800–1500 คำ อาจใช้เวลา 15–30 วินาที...</p>
        )}
      </div>

      {/* SEO Section */}
      <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-yellow-500" />
            SEO Metadata
          </h3>
          <button
            type="button"
            onClick={handleGenerateSeo}
            disabled={genSeo || contentTh.trim().length < 50}
            title={contentTh.trim().length < 50 ? 'เขียนเนื้อหาก่อนจึงจะสร้าง SEO ได้' : ''}
            className="flex items-center gap-1.5 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
          >
            {genSeo ? (
              <><Loader2 className="h-3.5 w-3.5 animate-spin" />กำลังสร้าง...</>
            ) : (
              <><Sparkles className="h-3.5 w-3.5" />✨ สร้าง SEO อัตโนมัติ</>
            )}
          </button>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-gray-600">SEO Title</label>
            <span className={`text-xs ${seoTitle.length > 60 ? 'text-red-500' : 'text-gray-400'}`}>
              {seoTitle.length}/60
            </span>
          </div>
          <input
            {...register('seoTitle')}
            type="text"
            maxLength={80}
            placeholder="หัวข้อที่แสดงใน Google (ไม่เกิน 60 ตัวอักษร)"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-gray-600">SEO Description</label>
            <span className={`text-xs ${seoDesc.length > 160 ? 'text-red-500' : seoDesc.length > 130 ? 'text-yellow-500' : 'text-gray-400'}`}>
              {seoDesc.length}/160
            </span>
          </div>
          <textarea
            {...register('seoDescription')}
            rows={2}
            maxLength={200}
            placeholder="คำอธิบายที่แสดงใน Google (150-160 ตัวอักษร)"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none resize-none"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Keywords (คั่นด้วยจุลภาค)</label>
          <input
            {...register('seoKeywords')}
            type="text"
            placeholder="เรียนฟิลิปปินส์, เรียนภาษาอังกฤษ, ฟิลิปปินส์, ค่าใช้จ่าย..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
          />
        </div>
      </div>

      {/* Publish toggle */}
      <Controller control={control} name="isPublished" render={({ field }) => (
        <Toggle checked={field.value} onChange={field.onChange} label="เผยแพร่บทความ" />
      )} />

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
        {imageUploading && (
          <p className="text-xs text-amber-600 self-center">⏳ รอรูปอัปโหลดเสร็จก่อนบันทึก</p>
        )}
        <Button variant="secondary" type="button" onClick={onCancel}>ยกเลิก</Button>
        <Button type="submit" loading={isLoading} disabled={imageUploading}>บันทึก</Button>
      </div>
    </form>
  );
}

// ── keyword helper (same logic as BlogForm.getUnsplashKw) ──
function getUnsplashKwBulk(title: string): string {
  if (/เซบู|cebu/i.test(title)) return 'cebu,philippines,study';
  if (/บาเกีย|baguio/i.test(title)) return 'baguio,philippines,mountain';
  if (/คลาร์ก|clark/i.test(title)) return 'philippines,study,english';
  if (/ที่เที่ยว|travel|tourist|ท่องเที่ยว/i.test(title)) return 'travel,tropical,philippines';
  if (/อาหาร|food/i.test(title)) return 'food,tropical,asian';
  if (/sim|ซิม|อินเตอร์เน็ต|internet/i.test(title)) return 'mobile,technology,travel';
  if (/ค่าใช้จ่าย|ราคา|cost|price|budget/i.test(title)) return 'money,budgeting,travel';
  if (/สุขภาพ|health|โรงพยาบาล|hospital/i.test(title)) return 'health,hospital,care';
  if (/เรียน|study|english|ภาษาอังกฤษ/i.test(title)) return 'study,english,classroom';
  return 'study,english,philippines';
}

export function BlogPage() {
  const crud = useCrud<BlogPost>({ api: blogApi, queryKey: 'blog' });

  // ── Bulk Auto Cover state ──
  const [bulkRunning, setBulkRunning] = useState(false);
  const [bulkStatus, setBulkStatus] = useState<{ done: number; total: number; errors: number; finished: boolean } | null>(null);

  const handleBulkAutoCover = async () => {
    if (bulkRunning) return;
    setBulkRunning(true);
    setBulkStatus(null);
    const token = getToken();

    try {
      // 1. Fetch all posts (all pages, high limit)
      const res = await fetch('/api/blog?limit=200', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const allPosts: BlogPost[] = Array.isArray(data) ? data : (data.data ?? []);

      // 2. Filter only posts without a cover image
      const noCover = allPosts.filter(p => !p.coverImageUrl);
      if (noCover.length === 0) {
        setBulkStatus({ done: 0, total: 0, errors: 0, finished: true });
        setBulkRunning(false);
        return;
      }

      let done = 0;
      let errors = 0;
      setBulkStatus({ done: 0, total: noCover.length, errors: 0, finished: false });

      // 3. Process sequentially — one at a time to avoid rate-limit spikes
      for (const post of noCover) {
        try {
          const title = post.titleTh || post.title || 'philippines study';
          const kw = getUnsplashKwBulk(title);
          const unsplashUrl = `https://loremflickr.com/800/450/${kw}`;

          // a) Fetch image via server → GCS
          const fetchRes = await fetch('/api/gallery/fetch-url', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ url: unsplashUrl, titleTh: title }),
          });
          const fetchData = await fetchRes.json();

          if (fetchData.imageUrl) {
            // b) Patch blog post with the new cover URL
            const patchRes = await fetch(`/api/blog/${post.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ coverImageUrl: fetchData.imageUrl }),
            });
            if (patchRes.ok) { done++; } else { errors++; }
          } else {
            errors++;
          }
        } catch {
          errors++;
        }
        // Update progress after each post
        setBulkStatus({ done, total: noCover.length, errors, finished: false });
      }

      setBulkStatus({ done, total: noCover.length, errors, finished: true });

    } catch {
      setBulkStatus(s => s ? { ...s, finished: true } : { done: 0, total: 0, errors: 1, finished: true });
    } finally {
      setBulkRunning(false);
      // Reload list to show new cover thumbnails
      setTimeout(() => crud.setPage(1), 800);
    }
  };

  const columns = [
    {
      key: 'cover', header: 'ปก',
      cell: (r: BlogPost) => r.coverImageUrl
        ? <img src={r.coverImageUrl} alt="cover" className="w-12 h-8 object-cover rounded" />
        : <span className="text-xs text-gray-400 italic">ไม่มี</span>,
    },
    { key: 'title', header: 'ชื่อบทความ', cell: (r: BlogPost) => <span className="font-medium text-sm">{r.title}</span> },
    { key: 'category', header: 'หมวดหมู่', cell: (r: BlogPost) => <span className="text-sm text-gray-600">{r.category ?? '-'}</span> },
    { key: 'author', header: 'ผู้เขียน', cell: (r: BlogPost) => <span className="text-sm">{r.author ?? '-'}</span> },
    { key: 'publishedAt', header: 'เผยแพร่', cell: (r: BlogPost) => <span className="text-sm">{r.isPublished ? formatDate(r.publishedAt) : '-'}</span> },
    { key: 'views', header: 'ยอดชม', cell: (r: BlogPost) => <span className="text-sm">{r.views.toLocaleString()}</span> },

    {
      key: 'actions', header: '',
      cell: (r: BlogPost) => (
        <div className="flex gap-1 justify-end">
          <Button size="sm" variant="ghost" icon={<Pencil className="h-3.5 w-3.5" />} onClick={() => crud.openEdit(r)}>แก้ไข</Button>
          <Button size="sm" variant="ghost" icon={<Trash2 className="h-3.5 w-3.5" />} onClick={() => crud.handleDelete(r.id)} className="text-red-500 hover:text-red-700">ลบ</Button>
        </div>
      ),
    },
  ];

  // Progress bar width
  const pct = bulkStatus && bulkStatus.total > 0 ? Math.round((bulkStatus.done / bulkStatus.total) * 100) : 0;

  return (
    <AdminLayout title="บทความ" actions={
      <div className="flex items-center gap-2 flex-wrap justify-end">
        <button
          onClick={handleBulkAutoCover}
          disabled={bulkRunning}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {bulkRunning
            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
            : <Sparkles className="h-3.5 w-3.5" />}
          {bulkRunning ? `Auto Cover... ${bulkStatus?.done ?? 0}/${bulkStatus?.total ?? '?'}` : '✨ Auto Cover ทั้งหมด'}
        </button>
        <Button icon={<Plus className="h-4 w-4" />} onClick={crud.openCreate}>เพิ่มบทความ</Button>
      </div>
    }>
      {/* Bulk progress bar */}
      {bulkStatus && (
        <div className="mb-4 rounded-xl border border-purple-200 bg-purple-50 p-4">
          {bulkStatus.total === 0 ? (
            <p className="text-sm text-purple-700 font-medium">✅ บทความทุกชิ้นมีรูปปกครบแล้ว ไม่มีอะไรต้องทำ</p>
          ) : (
            <>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-purple-800">
                  {bulkStatus.finished
                    ? `✅ เสร็จแล้ว — ใส่รูปปกสำเร็จ ${bulkStatus.done}/${bulkStatus.total} บทความ${bulkStatus.errors > 0 ? ` · ผิดพลาด ${bulkStatus.errors}` : ''}`
                    : `กำลังดำเนินการ ${bulkStatus.done}/${bulkStatus.total}...`}
                </span>
                <span className="text-xs text-purple-600">{pct}%</span>
              </div>
              <div className="w-full h-2 bg-purple-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-600 rounded-full transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </>
          )}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <SearchBar value={crud.search} onChange={crud.setSearch} placeholder="ค้นหาบทความ..." className="w-72" />
        </div>
        <div className="p-4">
          <Table data={crud.data} columns={columns} isLoading={crud.isLoading} page={crud.page} total={crud.total} pageSize={20} onPageChange={crud.setPage} />
        </div>
      </div>
      <Modal open={crud.showModal} onClose={crud.closeModal} title={crud.editItem ? 'แก้ไขบทความ' : 'เพิ่มบทความใหม่'} size="xl">
        <BlogForm defaultValues={crud.editItem ?? undefined} onSave={crud.handleSave} onCancel={crud.closeModal} isLoading={crud.isSaving} />
      </Modal>
    </AdminLayout>
  );
}
