import React, { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { MultiImageUpload } from '@/components/ui/MultiImageUpload';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Table } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/Modal';
import { SearchBar } from '@/components/ui/SearchBar';
import { Toggle } from '@/components/ui/toggle';
import { StatusBadge, FeaturedBadge } from '@/components/ui/badge';
import { useCrud } from '@/hooks/useCrud';
import { schoolsApi, School, PricingConfig, PricingCourseOption, PricingRoomOption, PricingFacilityItem, PromoRule } from '@/lib/api';
import { Plus, Pencil, Trash2, Star, Calculator, ChevronDown, ChevronUp, Save, X, Image, Building2, Upload, FileText, Printer, Video, Youtube, Link2, Loader2, CheckCircle2, AlertCircle, Globe, Download, Sparkles, RefreshCw, MapPin, ShieldCheck, Home, Coffee, Wifi } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import cebuImg    from '@assets/city-photos/cebu.jpg';
import baguioImg  from '@assets/city-photos/baguio.jpg';
import clarkImg   from '@assets/city-photos/clark.jpg';
import manilaImg  from '@assets/city-photos/manila.jpg';
import iloiloImg  from '@assets/city-photos/iloilo.jpg';

const CITY_PHOTO: Record<string, string> = {
  'Cebu City': cebuImg, Cebu: cebuImg, 
  'Baguio City': baguioImg, Baguio: baguioImg, 
  'Clark': clarkImg, Mabalacat: clarkImg, Angeles: clarkImg,
  'Manila': manilaImg,
  'Iloilo': iloiloImg,
};

/* ─── Basic school form ─────────────────────────────────────────── */
const schema = z.object({
  nameEn:            z.string().min(1, 'กรุณากรอกชื่อภาษาอังกฤษ'),
  nameTh:            z.string().min(1, 'กรุณากรอกชื่อภาษาไทย'),
  city:              z.string().min(1, 'กรุณากรอกเมือง'),
  slug:              z.string().optional(),
  tagline:           z.string().optional(),
  taglineTh:         z.string().optional(),
  rating:            z.coerce.number().min(0).max(5),
  logoUrl:           z.string().optional(),
  websiteUrl:        z.string().optional(),
  mapUrl:            z.string().optional(),
  youtubeId:         z.string().optional(),
  descriptionTh:     z.string().optional(),
  highlightsTxt:     z.string().optional(), // newline-separated → saved as string[]
  tagsTxt:           z.string().optional(), // comma-separated → saved as string[]
  featured:          z.boolean(),
  isActive:          z.boolean(),
  // SEO fields (per-school)
  seoTitle:          z.string().optional(),
  seoDescription:    z.string().optional(),
  seoKeywords:       z.string().optional(),
  seoH1Override:     z.string().optional(),
  seoMarketingMeta:  z.string().optional(),
});
type FormData = z.infer<typeof schema>;

/** Map a School DB object → form default values */
function schoolToFormData(s: any): Partial<FormData> {
  return {
    nameEn: s.nameEn ?? s.name ?? '',
    nameTh: s.nameTh ?? '',
    slug: s.slug ?? '',
    city: s.city ?? '',
    tagline: s.tagline ?? '',
    taglineTh: s.taglineTh ?? '',
    rating: s.rating ?? 4,
    logoUrl: s.logoUrl ?? '',
    websiteUrl: s.websiteUrl ?? '',
    mapUrl: s.mapUrl ?? '',
    youtubeId: s.youtubeId ?? '',
    descriptionTh: s.descriptionTh ?? s.description ?? '',
    highlightsTxt: Array.isArray(s.highlights) ? s.highlights.join('\n') : '',
    tagsTxt: Array.isArray(s.tags) ? s.tags.join(', ') : '',
    featured: s.isFeatured ?? s.featured ?? false,
    isActive: s.isActive ?? true,
    // SEO fields
    seoTitle: s.seoTitle ?? '',
    seoDescription: s.seoDescription ?? '',
    seoKeywords: s.seoKeywords ?? '',
    seoH1Override: s.seoH1Override ?? '',
    seoMarketingMeta: s.seoMarketingMeta ?? '',
  };
}

function SchoolForm({ defaultValues, onSave, onCancel, isLoading, schoolId }: {
  defaultValues?: Partial<FormData>; onSave: (data: any) => void; onCancel: () => void; isLoading?: boolean; schoolId?: number;
}) {
  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { featured: false, isActive: true, rating: 4, ...defaultValues },
  });

  const [aiLoading, setAiLoading]       = useState(false);
  const [aiSeoLoading, setAiSeoLoading] = useState(false);
  const [aiError, setAiError]           = useState('');
  const BASE = ((import.meta as any).env.BASE_URL ?? '').replace(/\/$/, '');

  const handleAiGenerate = async () => {
    if (!schoolId) { setAiError('กรุณาบันทึกข้อมูลสถาบันก่อนใช้ AI (ต้องมี ID)'); return; }
    setAiLoading(true);
    setAiError('');
    try {
      const r = await fetch(`/api/schools/${schoolId}/generate-description`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('philingo_admin_token')}` },
      });
      const d = await r.json();
      if (d.error) { setAiError(d.error); return; }
      if (d.descriptionTh || d.description) setValue('descriptionTh', d.descriptionTh ?? d.description, { shouldDirty: true });
      if (d.taglineTh)        setValue('taglineTh',        d.taglineTh,        { shouldDirty: true });
      if (d.highlights?.length) setValue('highlightsTxt', d.highlights.join('\n'), { shouldDirty: true });
      if (d.seoH1Override)    setValue('seoH1Override',    d.seoH1Override,    { shouldDirty: true });
      if (d.seoDescription)   setValue('seoDescription',   d.seoDescription,   { shouldDirty: true });
      if (d.seoMarketingMeta) setValue('seoMarketingMeta', d.seoMarketingMeta, { shouldDirty: true });
    } catch (e: any) {
      setAiError(e.message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleGenerateSeo = async () => {
    const { getValues } = { getValues: () => ({ nameEn: '', nameTh: '', descriptionTh: '' }) };
    // read current field values via DOM (no watch available — use register ref approach)
    const form = document.querySelector<HTMLFormElement>('form');
    const nameEn = (form?.querySelector('[name="nameEn"]') as HTMLInputElement)?.value || '';
    const nameTh = (form?.querySelector('[name="nameTh"]') as HTMLInputElement)?.value || '';
    const desc   = (form?.querySelector('[name="descriptionTh"]') as HTMLTextAreaElement)?.value || '';
    const title  = nameTh || nameEn;
    if (!title) { setAiError('กรุณากรอกชื่อสถาบันก่อนสร้าง SEO'); return; }
    setAiSeoLoading(true);
    setAiError('');
    try {
      const r = await fetch(`/api/blog/generate-seo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('philingo_admin_token')}` },
        body: JSON.stringify({ title: `${title} — เรียนภาษาอังกฤษที่ฟิลิปปินส์`, content: desc || title }),
      });
      const d = await r.json();
      if (d.seoTitle)         setValue('seoTitle',         d.seoTitle,         { shouldDirty: true });
      if (d.seoDescription)   setValue('seoDescription',   d.seoDescription,   { shouldDirty: true });
      if (d.seoKeywords)      setValue('seoKeywords',      d.seoKeywords,      { shouldDirty: true });
      if (d.seoMarketingMeta) setValue('seoMarketingMeta', d.seoMarketingMeta, { shouldDirty: true });
      if (!d.seoTitle)        setAiError(d.error || 'AI ไม่ตอบสนอง');
    } catch (e: any) {
      setAiError(e.message);
    } finally {
      setAiSeoLoading(false);
    }
  };

  const handleFormSave = (data: FormData) => {
    const { highlightsTxt, tagsTxt, featured, nameEn, ...rest } = data;
    // Normalize youtubeId: accept full URL (https://youtu.be/xxx, watch?v=xxx, shorts/xxx) or bare 11-char ID
    let youtubeId = rest.youtubeId?.trim() ?? '';
    if (youtubeId) {
      const match = youtubeId.match(/(?:v=|youtu\.be\/|embed\/|shorts\/|live\/)([A-Za-z0-9_-]{11})/);
      if (match) youtubeId = match[1];
      if (youtubeId.length !== 11) youtubeId = ''; // invalid — clear
    }
    onSave({
      ...rest,
      name: nameEn,
      youtubeId: youtubeId || null,
      isFeatured: featured,
      highlights: highlightsTxt ? highlightsTxt.split('\n').map(s => s.trim()).filter(Boolean) : [],
      tags: tagsTxt ? tagsTxt.split(',').map(s => s.trim()).filter(Boolean) : [],
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSave)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">

      {/* ── ข้อมูลพื้นฐาน ── */}
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b pb-1">ข้อมูลพื้นฐาน</p>
      <div className="grid grid-cols-2 gap-4">
        <Input label="ชื่อ (EN)" error={errors.nameEn?.message} {...register('nameEn')} />
        <Input label="ชื่อ (TH)" error={errors.nameTh?.message} {...register('nameTh')} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="เมือง / ที่ตั้ง" placeholder="Mactan, Cebu City" error={errors.city?.message} {...register('city')} />
        <Input label="Rating (0–5)" type="number" step="0.1" min="0" max="5" error={errors.rating?.message} {...register('rating')} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Tagline (EN)" placeholder="Semi-Sparta | New Campus | Cebu" {...register('tagline')} />
        <Input label="Tagline (TH)" placeholder="Semi-Sparta | แคมปัสใหม่ | เซบู" {...register('taglineTh')} />
      </div>
      <Controller control={control} name="logoUrl" render={({ field }) => (
        <ImageUpload label="โลโก้โรงเรียน" value={field.value || ''} onChange={field.onChange} />
      )} />

      {/* ── บทความข้อมูลสถาบัน ── */}
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b pb-1 pt-2">บทความข้อมูลสถาบัน</p>

      {/* AI generate button */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={handleAiGenerate}
          disabled={aiLoading || !schoolId}
          className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
        >
          {aiLoading
            ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> กำลังเขียน...</>
            : <><Sparkles className="w-3.5 h-3.5" /> ✨ เขียนด้วย AI</>
          }
        </button>
        <button
          type="button"
          onClick={handleAiGenerate}
          disabled={aiLoading || !schoolId}
          className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> 🔄 สร้างใหม่
        </button>
        {!schoolId && <span className="text-xs text-amber-600">⚠ บันทึกข้อมูลสถาบันก่อน แล้วเปิดแก้ไขอีกครั้งเพื่อใช้ AI</span>}
        {aiError && <span className="text-xs text-red-600">❌ {aiError}</span>}
        {aiLoading && <span className="text-xs text-violet-600">⏳ Claude กำลังเขียนบทความ 500-800 คำ... รอสักครู่</span>}
      </div>

      <Textarea
        label="คำอธิบายสถาบัน (ภาษาไทย)"
        placeholder="รายละเอียดสถาบัน ประวัติ จุดเด่น ทำไมถึงแนะนำ... หรือกด ✨ เขียนด้วย AI ด้านบน"
        rows={8}
        {...register('descriptionTh')}
      />
      <Textarea
        label="จุดเด่น (Highlights) — แต่ละบรรทัด = 1 ข้อ"
        placeholder={"แคมปัสพรีเมียม Mactan Island\nนักเรียน 800+ จาก 15 ชาติ\nSemi-Sparta ออกแบบให้พูดได้ไว"}
        rows={4}
        {...register('highlightsTxt')}
      />
      <Input
        label="Tags (คั่นด้วยจุลภาค)"
        placeholder="Semi-Sparta, IELTS, New Campus, TOEIC"
        {...register('tagsTxt')}
      />

      {/* ── ลิงก์และสื่อ ── */}
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b pb-1 pt-2">ลิงก์และสื่อ</p>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Website URL" placeholder="https://www.school.com" {...register('websiteUrl')} />
        <Input label="YouTube URL หรือ Video ID" placeholder="https://youtu.be/dQw4w9WgXcQ หรือ dQw4w9WgXcQ" {...register('youtubeId')} />
      </div>
      <Input label="Google Maps URL" placeholder="https://www.google.com/maps/..." {...register('mapUrl')} />

      {/* ── SEO ── */}
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b pb-1 pt-2">🔍 SEO (ต่อสถาบัน)</p>
      <div className="flex items-start gap-3">
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-xs text-blue-700 space-y-0.5 flex-1">
          <p className="font-semibold">ฟิลด์ SEO แยกต่อสถาบัน — ถ้าว่างจะ fallback ไปใช้ชื่อ/คำอธิบายของสถาบันนั้น</p>
          <p>กรอกครบจะช่วยให้ Google จัดอันดับแต่ละหน้าแยกกัน (ไม่เป็น duplicate content)</p>
        </div>
        <button
          type="button"
          onClick={handleGenerateSeo}
          disabled={aiSeoLoading}
          className="flex flex-col items-center gap-1 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-white text-xs font-medium px-4 py-3 rounded-xl transition-colors whitespace-nowrap shrink-0"
        >
          {aiSeoLoading
            ? <><Loader2 className="h-4 w-4 animate-spin" />กำลังสร้าง...</>
            : <><Sparkles className="h-4 w-4" />✨ สร้าง SEO<br/>อัตโนมัติ</>}
        </button>
      </div>
      <Input
        label="SEO Title"
        placeholder="เช่น CIA Cebu International Academy — เรียนภาษาอังกฤษที่ฟิลิปปินส์ | Philingo"
        {...register('seoTitle')}
      />
      <Textarea
        label="SEO Description"
        placeholder="คำอธิบายหน้าสถาบันนี้สำหรับ Google (150-160 ตัวอักษร)"
        rows={3}
        {...register('seoDescription')}
      />
      <Input
        label="SEO Keywords (คั่นด้วยจุลภาค)"
        placeholder="เช่น CIA Cebu, เรียนภาษาอังกฤษฟิลิปปินส์, Semi-Sparta, IELTS"
        {...register('seoKeywords')}
      />
      <Input
        label="H1 Override (หัวข้อหลักบนหน้าเว็บ)"
        placeholder="ถ้าว่าง จะใช้ชื่อสถาบัน เช่น CIA (Cebu International Academy) เป็น H1"
        {...register('seoH1Override')}
      />
      <Textarea
        label="Marketing Meta Description (ใช้เป็น description เพื่อขาย)"
        placeholder="เขียนให้ดึงดูดคลิก เช่น ✈️ เรียนกับ CIA โรงเรียนอันดับ 1 เซบู..."
        rows={3}
        {...register('seoMarketingMeta')}
      />
      <Input
        label="Slug URL (URL ของหน้า)"
        placeholder="เช่น cia → URL คือ /schools/cia"
        {...register('slug')}
      />

      {/* ── สถานะ ── */}
      <div className="flex gap-6 pt-2">
        <Controller control={control} name="featured" render={({ field }) => (
          <Toggle checked={field.value} onChange={field.onChange} label="แนะนำ (Featured)" />
        )} />
        <Controller control={control} name="isActive" render={({ field }) => (
          <Toggle checked={field.value} onChange={field.onChange} label="เปิดใช้งาน" />
        )} />
      </div>
      <div className="flex justify-end gap-2 pt-2 sticky bottom-0 bg-white py-3 border-t">
        <Button variant="secondary" type="button" onClick={onCancel}>ยกเลิก</Button>
        <Button type="submit" loading={isLoading}>บันทึก</Button>
      </div>
    </form>
  );
}

/* ─── Pricing Editor ─────────────────────────────────────────────── */
const DEFAULT_PRICING: PricingConfig = {
  enrollmentFee: 100,
  exchangeRateUsdThb: 33.50,
  exchangeRatePhpThb: 0.50,
  durationOptions: [4, 8, 12, 16, 20, 24],
  courses: [
    { id: 'esl_regular',   name: 'ESL Regular',        nameTh: 'ESL ปกติ',            pricePerFourWeeks: 900  },
    { id: 'esl_intensive', name: 'ESL Intensive',       nameTh: 'ESL เข้มข้น',         pricePerFourWeeks: 1000 },
    { id: 'ielts',         name: 'IELTS',               nameTh: 'IELTS',              pricePerFourWeeks: 1050 },
    { id: 'toeic',         name: 'TOEIC',               nameTh: 'TOEIC',              pricePerFourWeeks: 1000 },
    { id: 'business',      name: 'Business English',    nameTh: 'Business English',   pricePerFourWeeks: 1050 },
  ],
  rooms: [
    { id: 'quad',            name: 'Quad Room',       nameTh: 'ห้อง 4 คน (Quad)',    pricePerFourWeeks: 750  },
    { id: 'triple',          name: 'Triple Room',      nameTh: 'ห้อง 3 คน (Triple)', pricePerFourWeeks: 850  },
    { id: 'twin',            name: 'Twin Room',        nameTh: 'ห้อง 2 คน (Twin)',   pricePerFourWeeks: 1100 },
    { id: 'single_standard', name: 'Single Standard',  nameTh: 'ห้องเดี่ยว Standard', pricePerFourWeeks: 1500 },
    { id: 'single_premium',  name: 'Single Premium',   nameTh: 'ห้องเดี่ยว Premium',  pricePerFourWeeks: 1700 },
  ],
  localFeesByWeek: { '4': 25200, '8': 37330, '12': 55240, '16': 66780, '20': 78320, '24': 89860 },
  promoDiscount: { enabled: true, discountPerFourWeeks: 100, minWeeks: 4, label: 'ส่วนลด Promotion เมื่อลงทะเบียนเรียน 4 สัปดาห์ขึ้นไป' },
};

const DURATION_LABELS: Record<string, string> = { '4':'4 สัปดาห์','8':'8 สัปดาห์','12':'12 สัปดาห์','16':'16 สัปดาห์','20':'20 สัปดาห์','24':'24 สัปดาห์' };

function PricingEditor({ school, onClose }: { school: School; onClose: () => void }) {
  const qc = useQueryClient();
  const BASE = ((import.meta as any).env.BASE_URL ?? '').replace(/\/$/, '');
  const { data: siteSettings = {} } = useQuery<Record<string,string>>({
    queryKey: ['admin-site-settings'],
    queryFn: () => fetch(`/api/settings`, { headers: { Authorization: `Bearer ${localStorage.getItem('philingo_admin_token')}` } }).then(r => r.ok ? r.json() : {}),
    staleTime: 60_000,
  });
  const [cfg, setCfg] = useState<PricingConfig>(school.pricingConfig ?? JSON.parse(JSON.stringify(DEFAULT_PRICING)));
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'pricing' | 'photos' | 'timetable' | 'quotation' | 'video'>('pricing');
  const [parseStatus, setParseStatus] = useState('');
  const [promoUploadStatus, setPromoUploadStatus] = useState('');
  const [timetableUploadStatus, setTimetableUploadStatus] = useState('');
  const [qStudentName, setQStudentName] = useState('');
  const [qWeeks, setQWeeks]             = useState(4);
  const [qCourse, setQCourse]           = useState(cfg.courses[0]?.id ?? '');
  const [qRoom, setQRoom]               = useState(cfg.rooms[0]?.id ?? '');
  const [qNotes, setQNotes]             = useState('');
  const [qApplyPromo, setQApplyPromo]   = useState(true);

  // ── Video tab state ──
  const [vidAddMode, setVidAddMode]           = useState<'none' | 'youtube' | 'upload'>('none');
  const [vidYtInput, setVidYtInput]           = useState('');
  const [vidYtTitle, setVidYtTitle]           = useState('');
  const [vidYtTitleTh, setVidYtTitleTh]       = useState('');
  const [vidUploadStatus, setVidUploadStatus] = useState('');
  const [vidProgress, setVidProgress]         = useState(0);
  const vidInputRef = useRef<HTMLInputElement>(null);

  // ── Banner photos state (saved to school.photos) ──
  const [bannerPhotos, setBannerPhotos] = useState<string[]>((school as any).photos ?? []);
  // Keep bannerPhotos in sync when school.photos changes (e.g. after save + query refetch)
  useEffect(() => {
    setBannerPhotos((school as any).photos ?? []);
  }, [(school as any).photos]);
  const saveBannerMutation = useMutation({
    mutationFn: () => schoolsApi.update(school.id, { photos: bannerPhotos } as any),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['schools'] }); setSaved(true); setTimeout(() => setSaved(false), 2000); },
  });

  // ── Timetable state ──
  type SlotType = 'one-on-one' | 'group' | 'meal' | 'self-study' | 'free';
  interface TSlot { time: string; activity: string; type: SlotType; }
  interface TCourse { courseId: string; courseName: string; courseNameTh: string; tag: string; slots: TSlot[]; }
  interface TConfig { schedules: TCourse[]; rules: string[]; note: string; }

  const SLOT_TYPES: { value: SlotType; label: string; color: string }[] = [
    { value: 'one-on-one', label: '🔵 เรียน 1:1', color: 'bg-blue-100 text-blue-700' },
    { value: 'group',      label: '🟢 เรียนกลุ่ม', color: 'bg-emerald-100 text-emerald-700' },
    { value: 'meal',       label: '🟡 อาหาร',    color: 'bg-amber-100 text-amber-700' },
    { value: 'self-study', label: '🟣 ติวเอง',   color: 'bg-purple-100 text-purple-700' },
    { value: 'free',       label: '⚪ เวลาว่าง',  color: 'bg-gray-100 text-gray-600' },
  ];

  const DEFAULT_TIMETABLE: TConfig = { schedules: [], rules: [], note: '' };
  const [timetable, setTimetable] = useState<TConfig>(
    (school as any).timetableConfig
      ? JSON.parse(JSON.stringify((school as any).timetableConfig))
      : DEFAULT_TIMETABLE
  );
  const [activeCourseIdx, setActiveCourseIdx] = useState(0);

  const addCourseTab = () => setTimetable(t => ({
    ...t,
    schedules: [...t.schedules, { courseId: `course_${Date.now()}`, courseName: '', courseNameTh: '', tag: '', slots: [] }],
  }));
  const removeCourseTab = (i: number) => setTimetable(t => ({ ...t, schedules: t.schedules.filter((_, idx) => idx !== i) }));
  const updateCourseField = (i: number, field: keyof TCourse, val: string) =>
    setTimetable(t => { const s = [...t.schedules]; s[i] = { ...s[i], [field]: val }; return { ...t, schedules: s }; });

  const addSlot = (ci: number) => setTimetable(t => {
    const s = [...t.schedules]; const slots = [...s[ci].slots, { time: '', activity: '', type: 'group' as SlotType }];
    s[ci] = { ...s[ci], slots }; return { ...t, schedules: s };
  });
  const removeSlot = (ci: number, si: number) => setTimetable(t => {
    const s = [...t.schedules]; s[ci] = { ...s[ci], slots: s[ci].slots.filter((_, i) => i !== si) };
    return { ...t, schedules: s };
  });
  const updateSlot = (ci: number, si: number, field: keyof TSlot, val: string) => setTimetable(t => {
    const s = [...t.schedules]; const slots = [...s[ci].slots]; slots[si] = { ...slots[si], [field]: val as any };
    s[ci] = { ...s[ci], slots }; return { ...t, schedules: s };
  });

  const saveTimetableMutation = useMutation({
    mutationFn: () => schoolsApi.update(school.id, { timetableConfig: timetable } as any),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['schools'] }); setSaved(true); setTimeout(() => setSaved(false), 2000); },
  });

  const saveMutation = useMutation({
    mutationFn: () => schoolsApi.update(school.id, { pricingConfig: cfg } as any),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['schools'] }); setSaved(true); setTimeout(() => setSaved(false), 2000); },
  });

  /* helpers */
  const updateCourse = (i: number, field: keyof PricingCourseOption, val: string | number) =>
    setCfg(c => { const courses = [...c.courses]; courses[i] = { ...courses[i], [field]: val }; return { ...c, courses }; });
  const addCourse = () => setCfg(c => ({ ...c, courses: [...c.courses, { id: `course_${Date.now()}`, name: '', nameTh: '', pricePerFourWeeks: 900 }] }));
  const removeCourse = (i: number) => setCfg(c => ({ ...c, courses: c.courses.filter((_, idx) => idx !== i) }));

  const updateRoom = (i: number, field: keyof PricingRoomOption, val: string | number) =>
    setCfg(c => { const rooms = [...c.rooms]; rooms[i] = { ...rooms[i], [field]: val }; return { ...c, rooms }; });
  const addRoom = () => setCfg(c => ({ ...c, rooms: [...c.rooms, { id: `room_${Date.now()}`, name: '', nameTh: '', pricePerFourWeeks: 750 }] }));
  const removeRoom = (i: number) => setCfg(c => ({ ...c, rooms: c.rooms.filter((_, idx) => idx !== i) }));

  const updateLocalFee = (wk: string, val: string) =>
    setCfg(c => ({ ...c, localFeesByWeek: { ...c.localFeesByWeek, [wk]: Number(val) || 0 } }));

  /* helpers — room photos */
  const updateRoomPhotos = (i: number, raw: string) => {
    const photos = raw.split('\n').map(s => s.trim()).filter(Boolean);
    setCfg(c => { const rooms = [...c.rooms]; rooms[i] = { ...rooms[i], photos }; return { ...c, rooms }; });
  };

  /* helpers — facility photos */
  const facilityPhotos: PricingFacilityItem[] = cfg.facilityPhotos ?? [];
  const updateFacility = (i: number, field: keyof PricingFacilityItem, val: string) =>
    setCfg(c => { const arr = [...(c.facilityPhotos ?? [])]; arr[i] = { ...arr[i], [field]: val }; return { ...c, facilityPhotos: arr }; });
  const addFacility = () => setCfg(c => ({ ...c, facilityPhotos: [...(c.facilityPhotos ?? []), { id: `fac_${Date.now()}`, labelTh: '', label: '', emoji: '📷', photoUrl: '', descriptionTh: '' }] }));
  const removeFacility = (i: number) => setCfg(c => ({ ...c, facilityPhotos: (c.facilityPhotos ?? []).filter((_, idx) => idx !== i) }));

  /* ── Price file upload handler — parse + auto-save ── */
  const handlePriceFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';  // allow re-upload of same file
    setParseStatus('⏳ กำลังอ่านไฟล์...');
    const fd = new FormData();
    fd.append('file', file);
    try {
      const r = await fetch(`/api/schools/${school.id}/parse-price`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('philingo_admin_token')}` },
        body: fd,
      });
      const data = await r.json();
      if (!data.ok) { setParseStatus('❌ ' + (data.error ?? 'เกิดข้อผิดพลาด')); return; }
      const p = data.pricing;

      // Build new config from parsed result
      const newCfg = {
        ...cfg,
        enrollmentFee: p.enrollmentFee ?? cfg.enrollmentFee,
        courses: p.courses?.length ? p.courses : cfg.courses,
        rooms:   p.rooms?.length   ? p.rooms   : cfg.rooms,
        localFeesByWeek: Object.keys(p.localFeesByWeek ?? {}).length ? p.localFeesByWeek : cfg.localFeesByWeek,
      };
      setCfg(newCfg);  // update form UI

      // Auto-save immediately — no need to click "บันทึก"
      setParseStatus('⏳ กำลังบันทึก...');
      await schoolsApi.update(school.id, { pricingConfig: newCfg } as any);
      qc.invalidateQueries({ queryKey: ['schools'] });
      setParseStatus(`✅ บันทึกแล้ว: ${p.courses?.length ?? 0} หลักสูตร · ${p.rooms?.length ?? 0} ห้องพัก — ราคาแสดงบนเว็บทันที`);
    } catch (err: any) {
      setParseStatus('❌ ' + (err?.message ?? 'อัปโหลดล้มเหลว'));
    }
  };

  /* ── Quotation helpers ── */
  const qDurationFactor = (w: number) => {
    if (w === 1) return 0.40; if (w === 2) return 0.60; if (w === 3) return 0.80;
    return w / 4;
  };

  const TAB_CLS = (t: string) => `flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === t ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`;

  return (
    <div className="text-sm flex flex-col max-h-[75vh]">
      {/* ── Tab strip ── */}
      <div className="flex gap-2 mb-4 pb-3 border-b border-gray-100 shrink-0 flex-wrap">
        <button className={TAB_CLS('pricing')} onClick={() => setActiveTab('pricing')}>
          <Calculator className="w-3.5 h-3.5" /> ราคา &amp; หลักสูตร
        </button>
        <button className={TAB_CLS('photos')} onClick={() => setActiveTab('photos')}>
          <Image className="w-3.5 h-3.5" /> 📸 อัปโหลดรูปภาพ
        </button>
        <button className={TAB_CLS('timetable')} onClick={() => setActiveTab('timetable')}>
          📅 ตารางเรียน
        </button>
        <button className={TAB_CLS('quotation')} onClick={() => setActiveTab('quotation')}>
          <FileText className="w-3.5 h-3.5" /> 📄 ใบเสนอราคา
        </button>
        <button className={TAB_CLS('video')} onClick={() => setActiveTab('video')}>
          <Video className="w-3.5 h-3.5" /> 🎥 วีดีโอ
        </button>
      </div>

      {/* ── Tab content ── */}
      <div className="overflow-y-auto pr-1 flex-1 space-y-6">

        {/* ══ PRICING TAB ══ */}
        {activeTab === 'pricing' && <>
          {/* ── Auto-fill from Excel / PDF ── */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
            <p className="text-xs font-semibold text-blue-800">📂 อัปโหลดไฟล์ราคาเพื่อเติมข้อมูลอัตโนมัติ</p>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Excel button */}
              <label className="flex items-center gap-2 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors">
                <Upload className="w-3.5 h-3.5" /> 📊 Excel (.xlsx / .xls)
                <input type="file" accept=".xlsx,.xls" className="hidden" onChange={handlePriceFileUpload} />
              </label>
              {/* PDF button */}
              <label className="flex items-center gap-2 cursor-pointer bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors">
                <Upload className="w-3.5 h-3.5" /> 📄 PDF Price List
                <input type="file" accept=".pdf" className="hidden" onChange={handlePriceFileUpload} />
              </label>
              {/* Image button */}
              <label className="flex items-center gap-2 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors">
                <Upload className="w-3.5 h-3.5" /> 🖼️ รูปภาพราคา (JPEG / PNG)
                <input type="file" accept=".jpg,.jpeg,.png,.webp" className="hidden" onChange={handlePriceFileUpload} />
              </label>
              {parseStatus && <span className="text-xs text-blue-700">{parseStatus}</span>}
            </div>
          </div>
          <section>
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-blue-600" /> อัตราแลกเปลี่ยน
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">$1 = ฿ (USD → THB)</label>
                <input type="number" step="0.01" value={cfg.exchangeRateUsdThb ?? 33.50}
                  onChange={e => setCfg(c => ({ ...c, exchangeRateUsdThb: Number(e.target.value) }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 outline-none" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">₱1 = ฿ (PHP → THB)</label>
                <input type="number" step="0.01" value={cfg.exchangeRatePhpThb ?? 0.50}
                  onChange={e => setCfg(c => ({ ...c, exchangeRatePhpThb: Number(e.target.value) }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 outline-none" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">ค่าสมัคร (USD)</label>
                <input type="number" value={cfg.enrollmentFee}
                  onChange={e => setCfg(c => ({ ...c, enrollmentFee: Number(e.target.value) }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 outline-none" />
              </div>
            </div>
          </section>
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-800">ราคาหลักสูตร (USD / 4 สัปดาห์)</h3>
              <button onClick={addCourse} className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> เพิ่มหลักสูตร</button>
            </div>
            <div className="space-y-2">
              {cfg.courses.map((c, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                  <input placeholder="ID" value={c.id} onChange={e => updateCourse(i, 'id', e.target.value)} className="col-span-2 border border-gray-200 rounded px-2 py-1.5 text-xs" />
                  <input placeholder="ชื่อ EN" value={c.name} onChange={e => updateCourse(i, 'name', e.target.value)} className="col-span-3 border border-gray-200 rounded px-2 py-1.5 text-xs" />
                  <input placeholder="ชื่อ TH" value={c.nameTh} onChange={e => updateCourse(i, 'nameTh', e.target.value)} className="col-span-3 border border-gray-200 rounded px-2 py-1.5 text-xs" />
                  <div className="col-span-3 flex items-center gap-1"><span className="text-gray-400 text-xs">$</span>
                    <input type="number" value={c.pricePerFourWeeks} onChange={e => updateCourse(i, 'pricePerFourWeeks', Number(e.target.value))} className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs" /></div>
                  <button onClick={() => removeCourse(i)} className="col-span-1 text-red-400 hover:text-red-600 flex items-center justify-center"><X className="w-3.5 h-3.5" /></button>
                </div>
              ))}
            </div>
          </section>
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-800">ราคาห้องพัก (USD / 4 สัปดาห์)</h3>
              <button onClick={addRoom} className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> เพิ่มห้อง</button>
            </div>
            <div className="space-y-2">
              {cfg.rooms.map((r, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                  <input placeholder="ID" value={r.id} onChange={e => updateRoom(i, 'id', e.target.value)} className="col-span-2 border border-gray-200 rounded px-2 py-1.5 text-xs" />
                  <input placeholder="ชื่อ EN" value={r.name} onChange={e => updateRoom(i, 'name', e.target.value)} className="col-span-3 border border-gray-200 rounded px-2 py-1.5 text-xs" />
                  <input placeholder="ชื่อ TH" value={r.nameTh} onChange={e => updateRoom(i, 'nameTh', e.target.value)} className="col-span-3 border border-gray-200 rounded px-2 py-1.5 text-xs" />
                  <div className="col-span-3 flex items-center gap-1"><span className="text-gray-400 text-xs">$</span>
                    <input type="number" value={r.pricePerFourWeeks} onChange={e => updateRoom(i, 'pricePerFourWeeks', Number(e.target.value))} className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs" /></div>
                  <button onClick={() => removeRoom(i)} className="col-span-1 text-red-400 hover:text-red-600 flex items-center justify-center"><X className="w-3.5 h-3.5" /></button>
                </div>
              ))}
            </div>
          </section>
          <section>
            <h3 className="font-bold text-gray-800 mb-3">Local Fee (PHP) ตามระยะเวลา</h3>
            <div className="grid grid-cols-3 gap-3">
              {(cfg.durationOptions ?? [4,8,12,16,20,24]).map(wk => (
                <div key={wk}>
                  <label className="block text-xs text-gray-500 mb-1">{DURATION_LABELS[String(wk)] ?? `${wk} สัปดาห์`} (PHP)</label>
                  <div className="flex items-center gap-1"><span className="text-gray-400 text-xs">₱</span>
                    <input type="number" value={cfg.localFeesByWeek?.[String(wk)] ?? 0}
                      onChange={e => updateLocalFee(String(wk), e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 outline-none text-xs" /></div>
                </div>
              ))}
            </div>
          </section>
          <section>
            <h3 className="font-bold text-gray-800 mb-3">🎁 ส่วนลด &amp; โปรโมชั่น</h3>
            <div className="space-y-3 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
              {/* Enable toggle + upload */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="promoEnabled" checked={cfg.promoDiscount?.enabled ?? false}
                    onChange={e => setCfg(c => ({ ...c, promoDiscount: { ...c.promoDiscount, enabled: e.target.checked } }))}
                    className="w-4 h-4 rounded accent-yellow-500" />
                  <label htmlFor="promoEnabled" className="text-sm font-semibold text-gray-800">เปิดใช้งานส่วนลด Promo</label>
                </div>
                <label className="flex items-center gap-1.5 text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-800 border border-yellow-300 rounded-lg px-3 py-1.5 cursor-pointer font-medium transition-colors">
                  <Upload className="w-3.5 h-3.5" /> อัปโหลดไฟล์โปรโมชั่น
                  <input type="file" accept=".xlsx,.xls,.csv,.pdf,.jpg,.jpeg,.png" className="hidden" onChange={async e => {
                    const file = e.target.files?.[0]; if (!file) return;
                    setPromoUploadStatus('⏳ กำลังอ่านไฟล์...');
                    const fd = new FormData(); fd.append('file', file);
                    try {
                      const r = await fetch(`/api/schools/${school.id}/parse-promo`, {
                        method: 'POST', headers: { Authorization: `Bearer ${localStorage.getItem('philingo_admin_token')}` }, body: fd,
                      });
                      const d = await r.json();
                      if (!r.ok) throw new Error(d.error || `HTTP ${r.status}`);
                      if (d.promoRules) {
                        setCfg(c => ({ ...c, promoRules: d.promoRules }));
                        setPromoUploadStatus(`✅ อ่านโปรโมชั่นสำเร็จ — ${d.promoRules.length} กฎ`);
                      } else if (d.promoDiscount) {
                        setCfg(c => ({ ...c, promoDiscount: { ...c.promoDiscount, ...d.promoDiscount } }));
                        setPromoUploadStatus('✅ อ่านโปรโมชั่นสำเร็จ');
                      }
                    } catch (err: any) { setPromoUploadStatus(`❌ ${err.message}`); }
                    e.target.value = '';
                  }} />
                </label>
              </div>
              {promoUploadStatus && <p className="text-xs text-yellow-800 bg-yellow-100 rounded-lg px-3 py-1.5">{promoUploadStatus}</p>}

              {/* ── PromoRules table ── */}
              {(cfg as any).promoRules && (cfg as any).promoRules.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-yellow-800">📋 กฎโปรโมชั่น ({(cfg as any).promoRules.length} รายการ)</p>
                    <button type="button" onClick={() => setCfg(c => ({ ...c, promoRules: [] } as any))}
                      className="text-[10px] text-red-400 hover:text-red-600 underline">ล้างทั้งหมด</button>
                  </div>
                  <div className="overflow-x-auto rounded-lg border border-yellow-200">
                    <table className="w-full text-[11px]">
                      <thead className="bg-yellow-100 text-yellow-800">
                        <tr>
                          <th className="px-2 py-1.5 text-left">คอร์ส</th>
                          <th className="px-2 py-1.5 text-left">ห้องพัก</th>
                          <th className="px-2 py-1.5 text-left">สัปดาห์ขั้นต่ำ</th>
                          <th className="px-2 py-1.5 text-left">ประเภท</th>
                          <th className="px-2 py-1.5 text-left">จำนวน</th>
                          <th className="px-2 py-1.5 text-left">ชื่อโปร</th>
                          <th className="px-2 py-1.5 text-left">วันเริ่ม</th>
                          <th className="px-2 py-1.5 text-left">วันหมดอายุ</th>
                          <th className="px-2 py-1.5 text-left">เปิด</th>
                          <th className="px-2 py-1.5 text-left"></th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        {((cfg as any).promoRules as PromoRule[]).map((rule, i) => {
                          const today = new Date().toISOString().slice(0, 10);
                          const isExpired = !!rule.validUntil && today > rule.validUntil;
                          const notStarted = !!rule.validFrom && today < rule.validFrom;
                          const updateRule = (patch: Partial<PromoRule>) =>
                            setCfg(c => { const r = [...((c as any).promoRules as PromoRule[])]; r[i] = { ...r[i], ...patch }; return { ...c, promoRules: r } as any; });
                          return (
                          <tr key={rule.id} className={`border-t border-yellow-100 ${isExpired ? 'bg-red-50' : notStarted ? 'bg-gray-50' : ''}`}>
                            <td className="px-2 py-1.5 text-gray-600 text-[10px]">{rule.courseIds.length ? rule.courseIds.join(', ') : 'ทั้งหมด'}</td>
                            <td className="px-2 py-1.5 text-gray-600 text-[10px]">{rule.roomIds.length ? rule.roomIds.join(', ') : 'ทั้งหมด'}</td>
                            <td className="px-2 py-1.5 text-gray-600">{rule.minWeeks}w+</td>
                            <td className="px-2 py-1.5 text-gray-600">
                              {rule.discountType === 'percent' ? '%' : rule.discountType === 'fixedThb' ? '฿' : '$/4wk'}
                            </td>
                            <td className="px-2 py-1.5 font-semibold text-green-700">
                              {rule.discountType === 'percent' ? `${rule.discountValue}%` : rule.discountType === 'fixedThb' ? `฿${rule.discountValue.toLocaleString()}` : `$${rule.discountValue}`}
                            </td>
                            <td className="px-2 py-1.5 text-gray-700 max-w-[100px]">
                              <div className="truncate">{rule.label}</div>
                              {isExpired && <span className="text-[9px] font-bold text-red-600 bg-red-100 rounded px-1">หมดอายุ</span>}
                              {notStarted && <span className="text-[9px] font-bold text-gray-500 bg-gray-100 rounded px-1">ยังไม่เริ่ม</span>}
                            </td>
                            <td className="px-1 py-1">
                              <input type="date" value={rule.validFrom ?? ''} onChange={e => updateRule({ validFrom: e.target.value || undefined })}
                                className="text-[10px] border border-gray-200 rounded px-1 py-0.5 w-[100px]" />
                            </td>
                            <td className="px-1 py-1">
                              <input type="date" value={rule.validUntil ?? ''} onChange={e => updateRule({ validUntil: e.target.value || undefined })}
                                className={`text-[10px] border rounded px-1 py-0.5 w-[100px] ${isExpired ? 'border-red-300 bg-red-50' : 'border-gray-200'}`} />
                            </td>
                            <td className="px-2 py-1.5">
                              <input type="checkbox" checked={rule.enabled}
                                onChange={e => updateRule({ enabled: e.target.checked })}
                                className="w-3.5 h-3.5 accent-yellow-500" />
                            </td>
                            <td className="px-2 py-1.5">
                              <button type="button" onClick={() => setCfg(c => ({ ...c, promoRules: ((c as any).promoRules as PromoRule[]).filter((_, idx) => idx !== i) } as any))}
                                className="text-red-400 hover:text-red-600 text-xs">✕</button>
                            </td>
                          </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Discount type selector */}
              <div>
                <label className="block text-xs text-gray-600 mb-1 font-medium">ประเภทส่วนลด</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {([
                    { val: 'percent',      label: '% ส่วนลด',    desc: 'ลด X% จากราคาทั้งหมด' },
                    { val: 'fixedThb',     label: '฿ คงที่',     desc: 'ลดราคาคงที่ (บาท)' },
                    { val: 'perFourWeeks', label: '$/4wk',       desc: 'ลด X USD ทุก 4 สัปดาห์' },
                  ] as const).map(opt => (
                    <button key={opt.val} type="button"
                      onClick={() => setCfg(c => ({ ...c, promoDiscount: { ...c.promoDiscount, discountType: opt.val } as any }))}
                      className={`px-3 py-2 rounded-lg border text-xs font-semibold transition-all ${
                        ((cfg.promoDiscount as any)?.discountType ?? 'perFourWeeks') === opt.val
                          ? 'bg-yellow-500 text-white border-yellow-500 shadow-sm'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-yellow-300'
                      }`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic value field based on type */}
              <div className="grid grid-cols-2 gap-3">
                {(() => {
                  const dt = (cfg.promoDiscount as any)?.discountType ?? 'perFourWeeks';
                  if (dt === 'percent') return (
                    <div><label className="block text-xs text-gray-500 mb-1">ส่วนลด (%)</label>
                      <div className="relative">
                        <input type="number" min="0" max="100" value={(cfg.promoDiscount as any)?.discountPercent ?? 10}
                          onChange={e => setCfg(c => ({ ...c, promoDiscount: { ...c.promoDiscount, discountPercent: Number(e.target.value) } as any }))}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 pr-7 outline-none text-xs" />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">%</span>
                      </div>
                    </div>
                  );
                  if (dt === 'fixedThb') return (
                    <div><label className="block text-xs text-gray-500 mb-1">ส่วนลดคงที่ (บาท)</label>
                      <input type="number" min="0" value={(cfg.promoDiscount as any)?.discountFixedThb ?? 0}
                        onChange={e => setCfg(c => ({ ...c, promoDiscount: { ...c.promoDiscount, discountFixedThb: Number(e.target.value) } as any }))}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none text-xs" />
                    </div>
                  );
                  return (
                    <div><label className="block text-xs text-gray-500 mb-1">ลด (USD) ทุก 4 สัปดาห์</label>
                      <input type="number" min="0" value={cfg.promoDiscount?.discountPerFourWeeks ?? 100}
                        onChange={e => setCfg(c => ({ ...c, promoDiscount: { ...c.promoDiscount, discountPerFourWeeks: Number(e.target.value) } }))}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none text-xs" />
                    </div>
                  );
                })()}
                <div><label className="block text-xs text-gray-500 mb-1">สัปดาห์ขั้นต่ำ</label>
                  <input type="number" min="1" value={cfg.promoDiscount?.minWeeks ?? 4}
                    onChange={e => setCfg(c => ({ ...c, promoDiscount: { ...c.promoDiscount, minWeeks: Number(e.target.value) } }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none text-xs" /></div>
              </div>

              {/* Label + promo code */}
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs text-gray-500 mb-1">ข้อความแสดง (ในใบเสนอราคา)</label>
                  <input type="text" value={cfg.promoDiscount?.label ?? ''}
                    onChange={e => setCfg(c => ({ ...c, promoDiscount: { ...c.promoDiscount, label: e.target.value } }))}
                    placeholder="โปรพิเศษ เดือนนี้เท่านั้น!"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none text-xs" /></div>
                <div><label className="block text-xs text-gray-500 mb-1">Promo Code (ไม่บังคับ)</label>
                  <input type="text" value={(cfg.promoDiscount as any)?.promoCode ?? ''}
                    onChange={e => setCfg(c => ({ ...c, promoDiscount: { ...c.promoDiscount, promoCode: e.target.value } as any }))}
                    placeholder="PHILINGO10"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none text-xs" /></div>
              </div>

              {/* Preview */}
              {cfg.promoDiscount?.enabled && (
                <div className="text-[11px] bg-white border border-yellow-200 rounded-lg px-3 py-2 text-yellow-800">
                  👀 ตัวอย่าง:{' '}
                  {(() => {
                    const dt = (cfg.promoDiscount as any)?.discountType ?? 'perFourWeeks';
                    if (dt === 'percent') return `ลด ${(cfg.promoDiscount as any).discountPercent ?? 10}% จากยอดรวม`;
                    if (dt === 'fixedThb') return `ลด ฿${((cfg.promoDiscount as any).discountFixedThb ?? 0).toLocaleString()} คงที่`;
                    const blocks = Math.max(1, Math.floor((cfg.promoDiscount?.minWeeks ?? 4) / 4));
                    return `ลด $${cfg.promoDiscount?.discountPerFourWeeks ?? 0} × ${blocks} บล็อก = ลดราว ฿${Math.round((cfg.promoDiscount?.discountPerFourWeeks ?? 0) * blocks * (cfg.exchangeRateUsdThb ?? 33.5)).toLocaleString()}`;
                  })()}
                  {cfg.promoDiscount?.label ? ` — "${cfg.promoDiscount.label}"` : ''}
                </div>
              )}
            </div>
          </section>
        </>}

        {/* ══ QUOTATION TAB ══ */}
        {activeTab === 'quotation' && (() => {
          const usdThb = cfg.exchangeRateUsdThb ?? 33.50;
          const phpThb = cfg.exchangeRatePhpThb ?? 0.50;
          const factor = qDurationFactor(qWeeks);
          const selCourse = cfg.courses.find(c => c.id === qCourse);
          const selRoom   = cfg.rooms.find(r => r.id === qRoom);
          const tuitionUsd = selCourse ? Math.round(selCourse.pricePerFourWeeks * factor) : 0;
          const roomUsd    = selRoom   ? Math.round(selRoom.pricePerFourWeeks   * factor) : 0;
          const enrollUsd  = cfg.enrollmentFee ?? 100;
          const localPhp   = cfg.localFeesByWeek?.[String(qWeeks)] ?? 0;
          const tuitionThb = Math.round(tuitionUsd * usdThb);
          const roomThb    = Math.round(roomUsd    * usdThb);
          const enrollThb  = Math.round(enrollUsd  * usdThb);
          const localThb   = Math.round(localPhp   * phpThb);
          const subtotalThb = tuitionThb + roomThb + enrollThb + localThb;
          const totalUsd    = tuitionUsd + roomUsd + enrollUsd;

          // ── Promo discount calculation ──
          const promo = cfg.promoDiscount;
          const promoActive = qApplyPromo && promo?.enabled && qWeeks >= (promo.minWeeks ?? 4);
          let discountThb = 0;
          if (promoActive) {
            const dt = (promo as any).discountType ?? 'perFourWeeks';
            if (dt === 'percent') {
              discountThb = Math.round(subtotalThb * ((promo as any).discountPercent ?? 0) / 100);
            } else if (dt === 'fixedThb') {
              discountThb = (promo as any).discountFixedThb ?? 0;
            } else {
              const blocks = Math.max(1, Math.round(qWeeks / 4));
              discountThb = Math.round((promo?.discountPerFourWeeks ?? 0) * blocks * usdThb);
            }
          }
          const totalThb = subtotalThb - discountThb;

          // Pre-compute promo row HTML (avoids nested template literals in the html string)
          const promoRowHtml = promoActive && discountThb > 0
            ? '<tr style="background:#f0fdf4"><td style="color:#16a34a;font-weight:700">🎁 ส่วนลด Promo'
              + '<span style="font-size:11px;color:#166534;display:block">'
              + (promo?.label || '')
              + ((promo as any)?.promoCode ? ' · CODE: ' + (promo as any).promoCode : '')
              + '</span></td>'
              + '<td style="text-align:right;color:#16a34a">–</td>'
              + '<td style="text-align:right;font-weight:700;color:#16a34a">−฿' + discountThb.toLocaleString() + '</td></tr>'
            : '';
          const totalTdStyle = promoActive && discountThb > 0 ? ' style="color:#fde047"' : '';
          const totalLabel = '💰 รวมทั้งหมด' + (promoActive && discountThb > 0 ? ' (หลังส่วนลด)' : '') + ' (ประมาณการ)'
            + (promoActive && discountThb > 0 ? '<br/><span style="font-size:11px;font-weight:400;opacity:.7;text-decoration:line-through">ก่อนลด ฿' + subtotalThb.toLocaleString() + '</span>' : '');

          const handlePrint = () => {
            const today = new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' });
            const html = `<!DOCTYPE html><html><head>
<meta charset="utf-8"/><title>ใบเสนอราคา – ${school.name}</title>
<link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700;900&display=swap" rel="stylesheet"/>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Sarabun',sans-serif;padding:44px;color:#111;max-width:740px;margin:0 auto;font-size:14px}
.header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px;padding-bottom:20px;border-bottom:3px solid #2563eb}
.logo{font-size:34px;font-weight:900;color:#2563eb;letter-spacing:-1px}.logo span{color:#f59e0b}
.contact{font-size:11px;color:#6b7280;margin-top:6px;line-height:1.7}
.doc-info{text-align:right;font-size:12px;color:#6b7280;line-height:1.8}
.doc-info .to{font-size:15px;font-weight:700;color:#111;margin-top:4px}
h1{font-size:24px;font-weight:800;color:#1d4ed8;margin-bottom:4px}
.subtitle{font-size:14px;color:#6b7280;margin-bottom:12px}
.badge{display:inline-flex;align-items:center;gap:6px;background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe;border-radius:99px;padding:4px 14px;font-size:12px;font-weight:700;margin-bottom:22px}
table{width:100%;border-collapse:collapse;margin:18px 0;border-radius:10px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.07)}
thead th{background:#1d4ed8;color:#fff;padding:11px 16px;text-align:left;font-size:13px;font-weight:700}
tbody td{padding:11px 16px;border-bottom:1px solid #e5e7eb;font-size:13px;vertical-align:top}
.amt{text-align:right;font-family:monospace}.thb{text-align:right;font-family:monospace;font-weight:700;color:#1d4ed8}
.sub{font-size:11px;color:#9ca3af;margin-top:3px;display:block}
.total-row td{background:#1d4ed8;color:#fff;font-weight:800;padding:14px 16px;font-size:16px}
.total-row .thb{color:#fbbf24;font-size:20px}
.note-box{background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:16px;margin-top:22px;font-size:12px;color:#6b7280;line-height:2}
.footer{margin-top:32px;padding-top:16px;border-top:1px solid #e5e7eb;text-align:center;font-size:11px;color:#9ca3af}
@media print{body{padding:22px}}
</style></head><body>
<div class="header">
  <div><div class="logo">Phi<span>lingo</span></div>
  <div class="contact">🌐 ${siteSettings.website || 'www.philingo.com'}<br/>📱 LINE: ${siteSettings.line_id || '@philingo'}<br/>📞 ${siteSettings.phone || ''}</div></div>
  <div class="doc-info"><div>📅 วันที่: ${today}</div>${qStudentName ? `<div class="to">ถึง: ${qStudentName}</div>` : ''}</div>
</div>
<h1>ใบเสนอราคาเรียนภาษาอังกฤษ</h1>
<div class="subtitle">${school.name} · ${school.city ?? ''}</div>
<div class="badge">⏱ ระยะเวลา ${qWeeks} สัปดาห์</div>
<table>
  <thead><tr><th style="width:55%">รายการ</th><th class="amt" style="width:20%">USD / PHP</th><th class="thb" style="width:25%;color:#fbbf24">THB (บาท)</th></tr></thead>
  <tbody>
    <tr><td>💼 ค่าเรียน<span class="sub">${selCourse?.nameTh || selCourse?.name || '–'} · ${qWeeks} สัปดาห์ (×${factor.toFixed(2)})</span></td><td class="amt">$${tuitionUsd.toLocaleString()}</td><td class="thb">฿${tuitionThb.toLocaleString()}</td></tr>
    <tr><td>🛏️ ค่าที่พัก<span class="sub">${selRoom?.nameTh || selRoom?.name || '–'} · ${qWeeks} สัปดาห์</span></td><td class="amt">$${roomUsd.toLocaleString()}</td><td class="thb">฿${roomThb.toLocaleString()}</td></tr>
    <tr><td>📋 ค่าสมัคร (Enrollment Fee)</td><td class="amt">$${enrollUsd.toLocaleString()}</td><td class="thb">฿${enrollThb.toLocaleString()}</td></tr>
    <tr><td>📑 Local Fees รวม (${qWeeks} สัปดาห์)<span class="sub">SSP · E-Card · วีซ่า · ไฟ · น้ำ · Misc · Airport · หนังสือ · มัดจำ</span></td><td class="amt" style="color:#ea580c">₱${localPhp.toLocaleString()}</td><td class="thb">฿${localThb.toLocaleString()}</td></tr>
     ${promoRowHtml}
     <tr class="total-row"><td>${totalLabel}</td><td class="amt">$${totalUsd.toLocaleString()}</td><td class="thb"${totalTdStyle}>฿${totalThb.toLocaleString()}</td></tr>
  </tbody>
</table>
<div style="font-size:11px;color:#9ca3af;text-align:right">อัตราแลกเปลี่ยน: $1 = ฿${usdThb} | ₱1 = ฿${phpThb}</div>
${qNotes ? `<div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:14px;margin-top:14px;font-size:13px"><strong>📝 หมายเหตุ:</strong> ${qNotes}</div>` : ''}
<div class="note-box">⚠️ <strong>ข้อมูลสำคัญ:</strong><br/>• ราคาด้านบนเป็นการประมาณการเท่านั้น อาจมีการเปลี่ยนแปลงตามอัตราแลกเปลี่ยน<br/>• Local Fees รวม: SSP (₱8,000) + SSP E-Card (₱4,500) + ค่าน้ำ + ค่าไฟ + Miscellaneous + Airport Pickup + หนังสือ + รูปถ่าย + มัดจำ<br/>• ติดต่อ Philingo เพื่อยืนยันราคาและรับส่วนลดพิเศษ</div>
<div class="footer">Philingo — ที่ปรึกษาเรียนภาษาอังกฤษต่างประเทศ | ${siteSettings.website || 'www.philingo.com'} | LINE: ${siteSettings.line_id || '@philingo'} | ${siteSettings.phone || ''}</div>
</body></html>`;
            const w = window.open('', '_blank', 'width=800,height=970,scrollbars=yes');
            if (w) { w.document.write(html); w.document.close(); setTimeout(() => w.print(), 600); }
          };

          return (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-3">
                <h3 className="font-bold text-blue-800 flex items-center gap-2 text-sm"><FileText className="w-4 h-4" /> สร้างใบเสนอราคา</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1 font-medium">ชื่อนักเรียน</label>
                    <input value={qStudentName} onChange={e => setQStudentName(e.target.value)} placeholder="คุณ..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-300 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1 font-medium">ระยะเวลา</label>
                    <select value={qWeeks} onChange={e => setQWeeks(Number(e.target.value))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-300 outline-none">
                      {[1,2,3,4,8,12,16,20,24].map(w => <option key={w} value={w}>{w} สัปดาห์</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1 font-medium">หลักสูตร</label>
                    <select value={qCourse} onChange={e => setQCourse(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-300 outline-none">
                      <option value="">-- เลือก --</option>
                      {cfg.courses.map(c => <option key={c.id} value={c.id}>{c.nameTh || c.name} (${c.pricePerFourWeeks})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1 font-medium">ห้องพัก</label>
                    <select value={qRoom} onChange={e => setQRoom(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-300 outline-none">
                      <option value="">-- เลือก --</option>
                      {cfg.rooms.map(r => <option key={r.id} value={r.id}>{r.nameTh || r.name} (${r.pricePerFourWeeks})</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1 font-medium">หมายเหตุ</label>
                  <textarea value={qNotes} onChange={e => setQNotes(e.target.value)} rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-300 outline-none resize-none" />
                </div>
              </div>

              {/* Promo toggle */}
              {promo?.enabled && (
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input type="checkbox" checked={qApplyPromo} onChange={e => setQApplyPromo(e.target.checked)} className="w-3.5 h-3.5 rounded accent-yellow-500" />
                  <span className="font-medium text-yellow-700">ใช้ส่วนลด Promo: {promo.label || 'ส่วนลดพิเศษ'}</span>
                </label>
              )}

              {/* Breakdown */}
              <div className="rounded-xl overflow-hidden border border-gray-200 text-xs">
                <div className="bg-gray-800 text-white px-4 py-2 font-bold flex items-center justify-between">
                  <span>💰 สรุปราคา ({qWeeks} สัปดาห์ · ×{factor.toFixed(2)})</span>
                  {promoActive && <span className="text-yellow-300 text-[10px] font-normal">🎁 {promo?.label}</span>}
                </div>
                {[
                  { label: `💼 ค่าเรียน – ${selCourse?.nameTh || selCourse?.name || '–'}`, usd: `$${tuitionUsd.toLocaleString()}`, thb: tuitionThb },
                  { label: `🛏️ ค่าที่พัก – ${selRoom?.nameTh || selRoom?.name || '–'}`, usd: `$${roomUsd.toLocaleString()}`, thb: roomThb },
                  { label: '📋 ค่าสมัคร', usd: `$${enrollUsd}`, thb: enrollThb },
                  { label: `📑 Local Fees (${qWeeks} สัปดาห์)`, usd: localPhp ? `₱${localPhp.toLocaleString()}` : '–', thb: localThb },
                ].map((r, i) => (
                  <div key={i} className="flex items-center gap-2 px-4 py-2 border-b border-gray-100">
                    <span className="flex-1 text-gray-600">{r.label}</span>
                    <span className="text-gray-400 w-20 text-right tabular-nums">{r.usd}</span>
                    <span className="font-bold text-blue-700 w-24 text-right tabular-nums">฿{r.thb.toLocaleString()}</span>
                  </div>
                ))}
                {promoActive && discountThb > 0 && (
                  <div className="flex items-center gap-2 px-4 py-2 border-b border-green-100 bg-green-50">
                    <span className="flex-1 text-green-700 font-semibold">🎁 ส่วนลด Promo — {promo?.label}</span>
                    <span className="text-green-400 w-20 text-right tabular-nums">–</span>
                    <span className="font-bold text-green-600 w-24 text-right tabular-nums">−฿{discountThb.toLocaleString()}</span>
                  </div>
                )}
                <div className="bg-blue-600 text-white px-4 py-2.5 flex items-center justify-between font-bold">
                  <span>รวมทั้งหมด{promoActive && discountThb > 0 ? ' (หลังส่วนลด)' : ''}</span>
                  <div className="text-right">
                    {promoActive && discountThb > 0 && <div className="text-xs text-blue-200 line-through tabular-nums">฿{subtotalThb.toLocaleString()}</div>}
                    <span className="text-lg tabular-nums">฿{totalThb.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <button onClick={handlePrint} className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-colors text-sm">
                <Printer className="w-4 h-4" /> 🖨️ พิมพ์ / ดาวน์โหลด PDF
              </button>
            </div>
          );
        })()}

        {/* ══ VIDEO TAB ══ */}
        {activeTab === 'video' && (() => {
          type VideoItem = { id: string; type: 'youtube' | 'upload'; url: string; youtubeId?: string; title?: string; titleTh?: string; };
          const videos: VideoItem[] = (cfg as any).videos ?? [];
          const setVideos = (vids: VideoItem[]) => setCfg(c => ({ ...c, videos: vids } as any));

          const extractYoutubeId = (input: string): string | null => {
            const patterns = [
              /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/,
              /^([A-Za-z0-9_-]{11})$/,
            ];
            for (const p of patterns) { const m = input.match(p); if (m) return m[1]; }
            return null;
          };

          // Use component-level state (no useState inside render — hooks rules compliant)
          const ytInput = vidYtInput; const setYtInput = setVidYtInput;
          const ytTitle = vidYtTitle; const setYtTitle = setVidYtTitle;
          const ytTitleTh = vidYtTitleTh; const setYtTitleTh = setVidYtTitleTh;
          const addMode = vidAddMode; const setAddMode = setVidAddMode;

          const addYoutube = () => {
            const yid = extractYoutubeId(ytInput.trim());
            if (!yid) { alert('URL ไม่ถูกต้อง กรุณาวาง YouTube URL หรือ Video ID'); return; }
            const url = `https://www.youtube.com/watch?v=${yid}`;
            setVideos([...videos, { id: `yt_${Date.now()}`, type: 'youtube', url, youtubeId: yid, title: ytTitle || undefined, titleTh: ytTitleTh || undefined }]);
            setYtInput(''); setYtTitle(''); setYtTitleTh(''); setAddMode('none');
          };

          const handleVideoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const MB = file.size / 1024 / 1024;
            setVidUploadStatus(`⏳ กำลังขอ URL อัปโหลด... (${MB.toFixed(0)} MB)`);
            setVidProgress(0);
            try {
              // NOTE: use absolute /api/... — BASE_URL is /admin/ which misdirects to admin static server
              const metaRes = await fetch('/api/storage/uploads/request-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('philingo_admin_token')}` },
                body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type, category: 'video' }),
              });
              if (!metaRes.ok) { const b = await metaRes.json().catch(() => ({})); throw new Error(b.error || `HTTP ${metaRes.status}`); }
              const { uploadURL, objectPath } = await metaRes.json();
              setVidUploadStatus(`⬆ กำลังอัปโหลด ${file.name}...`);
              await new Promise<void>((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.upload.onprogress = ev => { if (ev.lengthComputable) setVidProgress(Math.round((ev.loaded / ev.total) * 100)); };
                xhr.onload = () => xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Upload failed: ${xhr.status}`));
                xhr.onerror = () => reject(new Error('Network error'));
                xhr.open('PUT', uploadURL);
                xhr.setRequestHeader('Content-Type', file.type);
                xhr.send(file);
              });
              const serveUrl = `/api/storage${objectPath}`;
              setVideos([...videos, { id: `up_${Date.now()}`, type: 'upload', url: serveUrl }]);
              setVidUploadStatus('✅ อัปโหลดสำเร็จ');
              setVidProgress(100);
              setTimeout(() => { setVidUploadStatus(''); setVidProgress(0); setVidAddMode('none'); }, 2500);
            } catch (err: any) {
              setVidUploadStatus(`❌ ${err.message}`);
            }
            e.target.value = '';
          };

          return (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm"><Video className="w-4 h-4 text-blue-600" /> วีดีโอโรงเรียน ({videos.length} รายการ)</h3>
                <div className="flex gap-2">
                  <button onClick={() => setAddMode(addMode === 'youtube' ? 'none' : 'youtube')} className="flex items-center gap-1.5 text-xs bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg px-3 py-1.5 font-medium transition-colors">
                    <Youtube className="w-3.5 h-3.5" /> YouTube URL
                  </button>
                  <button onClick={() => setAddMode(addMode === 'upload' ? 'none' : 'upload')} className="flex items-center gap-1.5 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg px-3 py-1.5 font-medium transition-colors">
                    <Upload className="w-3.5 h-3.5" /> อัปโหลดไฟล์ MP4
                  </button>
                </div>
              </div>

              {addMode === 'youtube' && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
                  <p className="text-xs font-semibold text-red-700 flex items-center gap-1.5"><Youtube className="w-3.5 h-3.5" /> เพิ่มวีดีโอ YouTube</p>
                  <input value={ytInput} onChange={e => setYtInput(e.target.value)}
                    placeholder="วาง YouTube URL หรือ Video ID เช่น https://www.youtube.com/watch?v=xxxxx"
                    className="w-full border border-red-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-red-300 outline-none" />
                  <div className="grid grid-cols-2 gap-2">
                    <input value={ytTitleTh} onChange={e => setYtTitleTh(e.target.value)} placeholder="ชื่อวีดีโอ (TH)" className="border border-red-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-red-300 outline-none" />
                    <input value={ytTitle}   onChange={e => setYtTitle(e.target.value)}   placeholder="ชื่อวีดีโอ (EN)" className="border border-red-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-red-300 outline-none" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={addYoutube} className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold py-2 rounded-lg transition-colors">+ เพิ่มวีดีโอ</button>
                    <button onClick={() => setAddMode('none')} className="px-4 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg">ยกเลิก</button>
                  </div>
                </div>
              )}

              {addMode === 'upload' && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
                  <p className="text-xs font-semibold text-blue-700 flex items-center gap-1.5"><Upload className="w-3.5 h-3.5" /> อัปโหลดไฟล์วีดีโอ (รองรับไฟล์ &gt;200 MB)</p>
                  <p className="text-[11px] text-blue-500">รองรับ MP4, MOV, WebM — ไฟล์จะอัปโหลดตรงไปยัง Cloud Storage พร้อม progress bar</p>
                  <label className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-blue-300 hover:border-blue-400 rounded-xl py-6 cursor-pointer text-blue-600 text-sm font-medium bg-white/50 transition-colors">
                    <Upload className="w-5 h-5" /> คลิกเลือกไฟล์วีดีโอ
                    <input ref={vidInputRef} type="file" accept="video/*,.mp4,.mov,.webm,.mkv,.avi" className="hidden" onChange={handleVideoFile} />
                  </label>
                  {vidUploadStatus && (
                    <div className="space-y-1.5">
                      <p className="text-xs text-blue-700">{vidUploadStatus}</p>
                      {vidProgress > 0 && vidProgress < 100 && (
                        <div className="w-full bg-blue-100 rounded-full h-3 overflow-hidden">
                          <div className="bg-blue-600 h-3 rounded-full transition-all duration-300" style={{ width: `${vidProgress}%` }} />
                        </div>
                      )}
                      {vidProgress > 0 && <p className="text-[11px] text-blue-500 text-right font-mono">{vidProgress}%</p>}
                    </div>
                  )}
                </div>
              )}

              {videos.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-xs border-2 border-dashed border-gray-200 rounded-xl">
                  <Video className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  ยังไม่มีวีดีโอ · กดปุ่มด้านบนเพื่อเพิ่ม
                </div>
              ) : (
                <div className="space-y-3">
                  {videos.map((v, i) => (
                    <div key={v.id} className="flex items-start gap-3 bg-gray-50 border border-gray-200 rounded-xl p-3">
                      <div className="shrink-0 w-28 aspect-video bg-gray-900 rounded-lg overflow-hidden">
                        {v.type === 'youtube' && v.youtubeId ? (
                          <img src={`https://img.youtube.com/vi/${v.youtubeId}/mqdefault.jpg`} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400"><Video className="w-6 h-6" /></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${v.type === 'youtube' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                          {v.type === 'youtube' ? '▶ YouTube' : '📁 Upload'}
                        </span>
                        <p className="text-[10px] text-gray-400 font-mono truncate">{v.url?.slice(0, 55) ?? ''}</p>
                        <div className="grid grid-cols-2 gap-1.5">
                          <input value={v.titleTh ?? ''} onChange={e => { const vs = [...videos]; vs[i] = { ...vs[i], titleTh: e.target.value }; setVideos(vs); }}
                            placeholder="ชื่อ (TH)" className="border border-gray-200 rounded px-2 py-1 text-[11px] focus:ring-1 focus:ring-blue-300 outline-none" />
                          <input value={v.title ?? ''} onChange={e => { const vs = [...videos]; vs[i] = { ...vs[i], title: e.target.value }; setVideos(vs); }}
                            placeholder="ชื่อ (EN)" className="border border-gray-200 rounded px-2 py-1 text-[11px] focus:ring-1 focus:ring-blue-300 outline-none" />
                        </div>
                      </div>
                      <button onClick={() => setVideos(videos.filter((_, idx) => idx !== i))}
                        className="shrink-0 w-7 h-7 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-[11px] text-gray-400 bg-gray-50 rounded-lg px-3 py-2">
                💡 กดปุ่ม <strong>บันทึก</strong> ด้านล่างเพื่อบันทึกวีดีโอ — วีดีโอจะขึ้นบนหน้าโรงเรียนทันที
              </p>
            </div>
          );
        })()}

        {/* ══ PHOTOS TAB ══ */}
        {activeTab === 'photos' && (
          <section className="space-y-8">

            {/* 1. Banner slides */}
            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">🖼️</span>
                <h3 className="font-bold text-gray-800 text-sm">Banner สไลด์หลัก</h3>
              </div>
              <p className="text-xs text-gray-400 mb-4">รูปภาพที่แสดงในแกลเลอรีหลักบนหน้ารายละเอียดโรงเรียน</p>
              <MultiImageUpload
                label="อัปโหลด Banner"
                category="banner"
                existingUrls={bannerPhotos}
                onUrlsChange={setBannerPhotos}
                maxFiles={15}
                hint="ลากและวางรูปที่นี่ หรือคลิกเพื่อเลือก — แนะนำ 1280×720px ขึ้นไป"
              />
            </div>

            {/* 2. Room type photos */}
            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">🛏️</span>
                <h3 className="font-bold text-gray-800 text-sm">รูปประเภทห้องพัก</h3>
              </div>
              <p className="text-xs text-gray-400 mb-4">อัปโหลดรูปสำหรับแต่ละประเภทห้อง (Tab Room บนเว็บ)</p>
              <div className="space-y-4">
                {cfg.rooms.map((r, i) => (
                  <div key={r.id} className="bg-white rounded-lg border border-gray-100 p-3">
                    <div className="flex items-center mb-3">
                      <p className="text-xs font-semibold text-gray-700">
                        {r.nameTh || r.name || `ห้อง ${i + 1}`}
                        <span className="ml-1 text-gray-400 font-normal">({r.id})</span>
                      </p>
                    </div>
                    <MultiImageUpload
                      label={`รูป ${r.nameTh || r.name}`}
                      category="rooms"
                      existingUrls={r.photos ?? []}
                      onUrlsChange={urls => {
                        setCfg(c => {
                          const rooms = [...c.rooms];
                          rooms[i] = { ...rooms[i], photos: urls };
                          return { ...c, rooms };
                        });
                      }}
                      maxFiles={8}
                    />
                  </div>
                ))}
                {cfg.rooms.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-4">ยังไม่มีห้องพัก — เพิ่มที่แท็บ "ราคา &amp; หลักสูตร" ก่อน</p>
                )}
              </div>
            </div>

            {/* 3. Facility photos */}
            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-base">🏊</span>
                  <h3 className="font-bold text-gray-800 text-sm">สิ่งอำนวยความสะดวก</h3>
                </div>
                <button onClick={addFacility} className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5" /> เพิ่ม
                </button>
              </div>
              <p className="text-xs text-gray-400 mb-4">อัปโหลดรูป + กรอกชื่อของแต่ละสิ่งอำนวยความสะดวก</p>
              <div className="space-y-3">
                {facilityPhotos.map((f, i) => (
                  <div key={f.id} className="bg-white rounded-lg border border-gray-100 p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <input placeholder="🏊" value={f.emoji} onChange={e => updateFacility(i, 'emoji', e.target.value)}
                        className="w-10 border border-gray-200 rounded px-2 py-1 text-xs text-center" />
                      <input placeholder="ชื่อภาษาไทย เช่น สระว่ายน้ำ" value={f.labelTh} onChange={e => updateFacility(i, 'labelTh', e.target.value)}
                        className="flex-1 border border-gray-200 rounded px-2 py-1 text-xs" />
                      <input placeholder="English" value={f.label} onChange={e => updateFacility(i, 'label', e.target.value)}
                        className="flex-1 border border-gray-200 rounded px-2 py-1 text-xs" />
                      <button onClick={() => removeFacility(i)} className="text-red-400 hover:text-red-600"><X className="w-3.5 h-3.5" /></button>
                    </div>
                    <input placeholder="คำอธิบาย (ไม่บังคับ)" value={f.descriptionTh ?? ''} onChange={e => updateFacility(i, 'descriptionTh', e.target.value)}
                      className="w-full border border-gray-200 rounded px-2 py-1 text-xs" />
                    {/* Photo upload for this facility */}
                    <MultiImageUpload
                      label="รูปสิ่งอำนวยความสะดวกนี้"
                      category="facilities"
                      existingUrls={f.photoUrl ? [f.photoUrl] : []}
                      onUrlsChange={urls => updateFacility(i, 'photoUrl', urls[0] ?? '')}
                      maxFiles={1}
                      hint="อัปโหลดได้ 1 รูป"
                    />
                  </div>
                ))}
                {facilityPhotos.length === 0 && (
                  <div className="text-center py-6 text-gray-400 text-xs">ยังไม่มีข้อมูล · กด "+ เพิ่ม" ด้านบน</div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ══ TIMETABLE TAB ══ */}
        {activeTab === 'timetable' && (
          <section className="space-y-4">
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-700">
              <strong>วิธีใช้:</strong> เลือกรูปแบบการแสดงผลตารางเรียนเป็น "แบบรูปภาพโดยตรง" เพื่อแนบรูปตารางเรียน หรือ "แบบกรอกตารางย่อย"
            </div>

            <div className="flex items-center gap-6 bg-gray-50 border border-gray-200 rounded-xl p-3.5">
              <span className="text-xs font-bold text-gray-700">รูปแบบตารางเรียน:</span>
              <label className="flex items-center gap-1.5 text-xs cursor-pointer font-semibold text-gray-700">
                <input
                  type="radio"
                  name="timetableFormat"
                  checked={!timetable.imageUrl}
                  onChange={() => setTimetable(t => ({ ...t, imageUrl: undefined }))}
                  className="w-4 h-4 accent-blue-600"
                />
                กรอกข้อมูลคาบเรียนย่อย (Text)
              </label>
              <label className="flex items-center gap-1.5 text-xs cursor-pointer font-semibold text-gray-700">
                <input
                  type="radio"
                  name="timetableFormat"
                  checked={!!timetable.imageUrl}
                  onChange={() => setTimetable(t => ({ ...t, imageUrl: t.imageUrl || '' }))}
                  className="w-4 h-4 accent-blue-600"
                />
                แสดงรูปภาพตารางเรียนโดยตรง (Image File)
              </label>
            </div>

            {timetable.imageUrl !== undefined ? (
              /* ── Option: Image upload directly ── */
              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base">📅</span>
                  <h3 className="font-bold text-gray-800 text-sm">รูปภาพตารางเรียน</h3>
                </div>
                <p className="text-xs text-gray-400">อัปโหลดไฟล์รูปภาพตารางเรียน (JPEG / PNG / WEBP) เพื่อนำไปแสดงบนหน้าเว็บแทนตารางย่อย</p>
                <MultiImageUpload
                  label="รูปภาพตารางเรียน"
                  category="other"
                  existingUrls={timetable.imageUrl ? [timetable.imageUrl] : []}
                  onUrlsChange={urls => setTimetable(t => ({ ...t, imageUrl: urls[0] ?? '' }))}
                  maxFiles={1}
                  hint="อัปโหลดได้ 1 รูปภาพ (แนะนำไฟล์รูปที่ชัดเจน อ่านง่าย)"
                />
              </div>
            ) : (
              /* ── Option: Normal slots ── */
              <>
                {/* Course tabs */}
                <div className="flex gap-2 flex-wrap items-center">
                  {timetable.schedules.map((s, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <button
                        onClick={() => setActiveCourseIdx(i)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeCourseIdx === i ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                      >
                        {s.courseNameTh || s.courseName || `คอร์ส ${i + 1}`}
                      </button>
                      <button onClick={() => { removeCourseTab(i); setActiveCourseIdx(Math.max(0, i - 1)); }}
                        className="text-red-400 hover:text-red-600"><X className="w-3 h-3" /></button>
                    </div>
                  ))}
                  <button onClick={() => { addCourseTab(); setActiveCourseIdx(timetable.schedules.length); }}
                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 px-2 py-1.5 border border-blue-200 rounded-lg">
                    <Plus className="w-3 h-3" /> เพิ่มคอร์ส
                  </button>
                </div>

                {timetable.schedules.length === 0 && (
                  <div className="text-center py-8 text-gray-400 text-xs">ยังไม่มีคอร์ส · กด "+ เพิ่มคอร์ส" ด้านบน</div>
                )}

                {timetable.schedules[activeCourseIdx] && (() => {
                  const ci = activeCourseIdx;
                  const sc = timetable.schedules[ci];
                  return (
                    <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 space-y-4">
                      {/* Course meta */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">ชื่อคอร์ส (TH)</label>
                          <input value={sc.courseNameTh} onChange={e => updateCourseField(ci, 'courseNameTh', e.target.value)}
                            placeholder="ESL ปกติ" className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs" />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">ชื่อคอร์ส (EN)</label>
                          <input value={sc.courseName} onChange={e => updateCourseField(ci, 'courseName', e.target.value)}
                            placeholder="ESL Regular" className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs" />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Course ID (ไม่ซ้ำ)</label>
                          <input value={sc.courseId} onChange={e => updateCourseField(ci, 'courseId', e.target.value)}
                            placeholder="esl_regular" className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs font-mono" />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Badge (เช่น 1:1×4 | กลุ่ม×4)</label>
                          <input value={sc.tag} onChange={e => updateCourseField(ci, 'tag', e.target.value)}
                            placeholder="1:1×4 | กลุ่ม×4" className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs" />
                        </div>
                      </div>

                      {/* Time slots */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-gray-700">ช่วงเวลา ({sc.slots.length} คาบ)</span>
                          <button onClick={() => addSlot(ci)}
                            className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1">
                            <Plus className="w-3 h-3" /> เพิ่มคาบ
                          </button>
                        </div>
                        <div className="space-y-1.5">
                          {sc.slots.map((slot, si) => (
                            <div key={si} className="grid grid-cols-12 gap-1.5 items-center">
                              <input value={slot.time} onChange={e => updateSlot(ci, si, 'time', e.target.value)}
                                placeholder="08:00 – 08:50"
                                className="col-span-3 border border-gray-200 rounded px-2 py-1.5 text-xs font-mono" />
                              <input value={slot.activity} onChange={e => updateSlot(ci, si, 'activity', e.target.value)}
                                placeholder="เรียน 1 ต่อ 1 ชั่วโมงที่ 1"
                                className="col-span-5 border border-gray-200 rounded px-2 py-1.5 text-xs" />
                              <select value={slot.type} onChange={e => updateSlot(ci, si, 'type', e.target.value)}
                                className="col-span-3 border border-gray-200 rounded px-2 py-1.5 text-xs bg-white">
                                {SLOT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                              </select>
                              <button onClick={() => removeSlot(ci, si)}
                                className="col-span-1 text-red-400 hover:text-red-600 flex items-center justify-center">
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                          {sc.slots.length === 0 && (
                            <div className="text-xs text-gray-400 text-center py-3 border border-dashed border-gray-200 rounded-lg">
                              ยังไม่มีคาบเรียน · กด "+ เพิ่มคาบ"
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </>
            )}

            {/* Rules & note */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">กฎของโรงเรียน (1 ข้อต่อบรรทัด)</label>
                <textarea rows={5}
                  placeholder={'ห้ามใช้ภาษาไทยในบริเวณโรงเรียน\nเคอร์ฟิว 22:00 น.'}
                  value={timetable.rules.join('\n')}
                  onChange={e => setTimetable(t => ({ ...t, rules: e.target.value.split('\n').filter(Boolean) }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs resize-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">หมายเหตุ</label>
                <textarea rows={5}
                  placeholder="ตารางอาจมีการปรับเปลี่ยนเล็กน้อย..."
                  value={timetable.note}
                  onChange={e => setTimetable(t => ({ ...t, note: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs resize-none" />
              </div>
            </div>
          </section>
        )}

      </div>

      {/* ── Actions ── */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 shrink-0 mt-3">
        <p className="text-xs text-gray-400">บันทึกแล้วข้อมูลจะแสดงบนเว็บไซต์ทันที</p>
        <div className="flex gap-2">
          <Button variant="secondary" type="button" onClick={onClose}>ปิด</Button>
          <Button
            type="button"
            loading={activeTab === 'timetable' ? saveTimetableMutation.isPending : activeTab === 'photos' ? saveBannerMutation.isPending || saveMutation.isPending : saveMutation.isPending}
            onClick={() => {
              if (activeTab === 'timetable') { saveTimetableMutation.mutate(); }
              else if (activeTab === 'photos') { saveBannerMutation.mutate(); saveMutation.mutate(); }
              else { saveMutation.mutate(); }
            }}
            icon={<Save className="w-4 h-4" />}
          >
            {saved ? '✓ บันทึกแล้ว' : 'บันทึก'}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ─── Inline Uploaders for Table ───────────────────────────────────── */
function InlineLogoUpload({ school }: { school: School }) {
  const qc = useQueryClient();
  const updateMutation = useMutation({
    mutationFn: (newUrl: string) => schoolsApi.update(school.id, { logoUrl: newUrl } as any),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['schools'] }),
  });

  return (
    <div className="w-48">
      <ImageUpload
        value={school.logoUrl || ''}
        onChange={(url) => { if (url !== school.logoUrl) updateMutation.mutate(url); }}
      />
    </div>
  );
}

function InlineCoverUpload({ school }: { school: School }) {
  const qc = useQueryClient();
  const updateMutation = useMutation({
    mutationFn: (newUrl: string) => {
      const currentPhotos = (school as any).photos || [];
      // Replace the first photo or add as first photo
      const newPhotos = currentPhotos.length > 0 ? [newUrl, ...currentPhotos.slice(1)] : [newUrl];
      return schoolsApi.update(school.id, { photos: newPhotos } as any);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['schools'] }),
  });
  
  const currentUrl = ((school as any).photos && (school as any).photos.length > 0) ? (school as any).photos[0] : '';

  return (
    <div className="w-48">
      <ImageUpload
        value={currentUrl}
        onChange={(url) => { if (url !== currentUrl) updateMutation.mutate(url); }}
      />
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────────── */
export function SchoolsPage() {
  const crud = useCrud<School>({ api: schoolsApi, queryKey: 'schools' });
  const [pricingSchool, setPricingSchool] = useState<School | null>(null);
  const [coverSchool, setCoverSchool] = useState<School | null>(null);
  const BASE = ((import.meta as any).env.BASE_URL ?? '').replace(/\/$/, '');
  const qc = useQueryClient();

  // ── Batch auto-scrape OG images for all schools ──
  const [batchStatus, setBatchStatus] = useState<string>('');
  const [batchLoading, setBatchLoading] = useState(false);
  const handleBatchScrape = async (force = false) => {
    setBatchLoading(true);
    setBatchStatus('⏳ กำลังดึงรูปทุกโรงเรียน...');
    try {
      const r = await fetch(`/api/admin/batch-scrape-banners`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('philingo_admin_token')}` },
        body: JSON.stringify({ force }),
      });
      const d = await r.json();
      setBatchStatus(`✅ สำเร็จ ${d.ok} โรงเรียน | ข้าม ${d.skip} | ล้มเหลว ${d.fail}`);
      qc.invalidateQueries({ queryKey: ['schools'] });
    } catch (e: any) {
      setBatchStatus('❌ เกิดข้อผิดพลาด: ' + e.message);
    } finally {
      setBatchLoading(false);
    }
  };

  // Keep pricingSchool in sync with latest query data so photos/pricing
  // updates are reflected in the editor immediately after save + refetch.
  useEffect(() => {
    if (!pricingSchool) return;
    const fresh = crud.data.find((s: School) => s.id === pricingSchool.id);
    if (fresh) setPricingSchool(fresh);
  }, [crud.data]);

  const columns = [
    {
      key: 'logo', header: 'โลโก้',
      cell: (row: School) =>
        row.logoUrl ? (
          <img src={row.logoUrl} alt={row.nameEn} className="h-8 w-8 object-contain rounded" />
        ) : (
          <div className="h-8 w-8 bg-blue-100 rounded flex items-center justify-center text-xs text-blue-600 font-bold">
            {row.nameEn?.charAt(0)}
          </div>
        ),
    },
    {
      key: 'cover', header: 'หน้าปก',
      cell: (row: School) => {
        const isValidPhoto = (url: string | undefined | null) => 
          url && !url.includes('/school/city-photos/') && !url.includes('/school/generated/');
        
        let validPhoto = null;
        if ((row as any).photos && (row as any).photos.length > 0) {
          validPhoto = (row as any).photos.find(isValidPhoto);
        }
        if (!validPhoto && isValidPhoto((row as any).heroImageUrl)) {
          validPhoto = (row as any).heroImageUrl;
        }
        const photoUrl = validPhoto || CITY_PHOTO[row.city] || cebuImg;
        return (
          <div className="relative group w-16 h-10 rounded overflow-hidden cursor-pointer border border-gray-200" onClick={() => setCoverSchool(row)}>
            <img src={photoUrl} alt="cover" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Pencil className="w-3 h-3 text-white" />
            </div>
          </div>
        );
      }
    },
    {
      key: 'name', header: 'ชื่อโรงเรียน',
      cell: (row: School) => (
        <div>
          <p className="font-medium text-gray-900 text-sm">{row.nameEn}</p>
          <p className="text-xs text-gray-500">{row.nameTh}</p>
        </div>
      ),
    },
    { key: 'city', header: 'เมือง', cell: (row: School) => <span className="text-sm">{row.city}</span> },
    {
      key: 'rating', header: 'Rating',
      cell: (row: School) => (
        <div className="flex items-center gap-1 text-sm">
          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
          {row.rating}
        </div>
      ),
    },
    { key: 'featured', header: 'แนะนำ', cell: (row: School) => <FeaturedBadge isFeatured={row.featured} /> },
    {
      key: 'pricing', header: 'ราคา & หลักสูตร',
      cell: (row: School) => (
        <button
          onClick={() => setPricingSchool(row)}
          className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
            row.pricingConfig
              ? 'bg-green-100 text-green-700 hover:bg-green-200'
              : 'bg-gray-100 text-gray-500 hover:bg-blue-50 hover:text-blue-600'
          }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          {row.pricingConfig ? 'แก้ไขราคา' : 'ตั้งค่าราคา'}
        </button>
      ),
    },
    {
      key: 'actions', header: '',
      cell: (row: School) => (
        <div className="flex gap-1 justify-end">
          <Button size="sm" variant="ghost" icon={<Pencil className="h-3.5 w-3.5" />} onClick={() => crud.openEdit(row)}>แก้ไข</Button>
          <Button size="sm" variant="ghost" icon={<Trash2 className="h-3.5 w-3.5" />} onClick={() => crud.handleDelete(row.id)} className="text-red-500 hover:text-red-700">ลบ</Button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout
      title="โรงเรียน"
      actions={
        <Button icon={<Plus className="h-4 w-4" />} onClick={crud.openCreate}>
          เพิ่มโรงเรียน
        </Button>
      }
    >
      {/* ── Batch auto-scrape banner ── */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3 flex-wrap">
        <Globe className="w-4 h-4 text-blue-600 shrink-0" />
        <span className="text-sm text-blue-700 font-medium">ดึงรูปแบนเนอร์จากเว็บโรงเรียนอัตโนมัติ</span>
        <button
          onClick={() => handleBatchScrape(false)}
          disabled={batchLoading}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
        >
          {batchLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5" />}
          ดึงรูปโรงเรียนที่ยังไม่มีรูป
        </button>
        <button
          onClick={() => handleBatchScrape(true)}
          disabled={batchLoading}
          className="flex items-center gap-1.5 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
        >
          <Download className="w-3.5 h-3.5" /> ดึงรูปใหม่ทุกโรงเรียน (ทับของเดิม)
        </button>
        {batchStatus && <span className="text-xs text-blue-700 font-medium">{batchStatus}</span>}
        <span className="text-xs text-blue-500 ml-auto">ดึง OG image จาก website URL ของแต่ละโรงเรียน</span>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <SearchBar value={crud.search} onChange={crud.setSearch} placeholder="ค้นหาโรงเรียน..." className="w-72" />
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

      {/* Basic info modal */}
      <Modal
        open={crud.showModal}
        onClose={crud.closeModal}
        title={crud.editItem ? `แก้ไข — ${crud.editItem.name}` : 'เพิ่มโรงเรียนใหม่'}
        size="xl"
      >
        <SchoolForm
          defaultValues={crud.editItem ? schoolToFormData(crud.editItem) : undefined}
          onSave={crud.handleSave}
          onCancel={crud.closeModal}
          isLoading={crud.isSaving}
          schoolId={crud.editItem?.id}
        />
      </Modal>

      {/* Pricing editor modal */}
      <Modal
        open={!!pricingSchool}
        onClose={() => setPricingSchool(null)}
        title={`ตั้งราคา — ${pricingSchool?.nameEn ?? ''}`}
        size="xl"
      >
        {pricingSchool && (
          <PricingEditor school={pricingSchool} onClose={() => setPricingSchool(null)} />
        )}
      </Modal>

      {/* Cover image editor modal */}
      <Modal
        open={!!coverSchool}
        onClose={() => setCoverSchool(null)}
        title={`เปลี่ยนรูปหน้าปก — ${coverSchool?.nameEn ?? ''}`}
      >
        {coverSchool && (
          <div className="p-4 flex flex-col items-center justify-center">
             <InlineCoverUpload school={coverSchool} />
             <p className="text-xs text-gray-500 mt-6 text-center bg-gray-50 p-3 rounded-lg border border-gray-200">
               <AlertCircle className="w-4 h-4 inline-block mr-1 text-amber-500" />
               <strong>หมายเหตุ:</strong> ระบบหน้าเว็บหลัก (/schools) ตอนนี้ยังดึงรายชื่อและรูปภาพแบบคงที่ (Hardcoded) 
               หากต้องการให้รูปภาพและข้อมูลจากระบบ Admin อัปเดตไปยังหน้าเว็บหลักแบบ Realtime จะต้องทำการเชื่อมต่อ API ก่อนครับ
             </p>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
