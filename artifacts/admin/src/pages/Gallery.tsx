import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Table } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/Modal';
import { SearchBar } from '@/components/ui/SearchBar';
import { Toggle } from '@/components/ui/toggle';
import { StatusBadge } from '@/components/ui/badge';
import { useCrud } from '@/hooks/useCrud';
import { galleryApi, GalleryItem } from '@/lib/api';
import { Plus, Pencil, Trash2, Download, ChevronDown, ChevronUp, CheckCircle2, AlertCircle } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

// ── Fetch-from-URL panel ────────────────────────────────────────────────────
// NOTE: use absolute /api/... — BASE_URL is /admin/ which would route to the
// admin static server and return index.html instead of the API response.

function getToken() { return localStorage.getItem('philingo_admin_token'); }

async function fetchFromUrl(payload: {
  url: string; titleTh?: string; titleEn?: string; category?: string;
}): Promise<GalleryItem> {
  const res = await fetch('/api/gallery/fetch-url', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data as GalleryItem;
}

function FetchFromUrlPanel({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [titleTh, setTitleTh] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFetch = async () => {
    setError(null);
    setSuccess(null);
    if (!url.trim()) { setError('กรุณาวาง URL รูปภาพก่อน'); return; }
    setLoading(true);
    try {
      const item = await fetchFromUrl({ url: url.trim(), titleTh: titleTh || undefined, titleEn: titleEn || undefined, category: category || undefined });
      setSuccess(`✅ ดึงรูปสำเร็จ! บันทึกเป็น ID #${item.id} — ปรากฏในหน้าเว็บแล้ว`);
      setUrl(''); setTitleTh(''); setTitleEn(''); setCategory('');
      onSuccess();
    } catch (e: any) {
      setError(e.message ?? 'เกิดข้อผิดพลาด ลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-4 rounded-xl border border-indigo-200 bg-indigo-50 overflow-hidden">
      {/* Header toggle */}
      <button
        type="button"
        className="w-full flex items-center justify-between px-5 py-3 text-sm font-semibold text-indigo-900 hover:bg-indigo-100 transition-colors"
        onClick={() => { setOpen(v => !v); setError(null); setSuccess(null); }}
      >
        <span className="flex items-center gap-2"><Download className="h-4 w-4" /> ดึงรูปจาก URL (ไม่ต้องดาวน์โหลดเอง)</span>
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {open && (
        <div className="px-5 pb-5 pt-1 space-y-3 border-t border-indigo-200 bg-white">
          <p className="text-xs text-gray-500">
            วาง URL รูปจากเว็บโรงเรียน → ระบบดาวน์โหลดฝั่ง server (ไม่ติด CORS) → บันทึกเข้า Gallery อัตโนมัติ<br />
            รองรับ .jpg .png .webp .gif .avif · สูงสุด 10 MB ต่อรูป
          </p>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">URL รูปภาพ *</label>
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://school.example.com/images/room.jpg"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">ชื่อ (ภาษาไทย)</label>
              <input value={titleTh} onChange={e => setTitleTh(e.target.value)}
                placeholder="เช่น ห้องพัก CIA" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">ชื่อ (English)</label>
              <input value={titleEn} onChange={e => setTitleEn(e.target.value)}
                placeholder="e.g. CIA Room" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">หมวดหมู่</label>
              <select value={category} onChange={e => setCategory(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white">
                <option value="">เลือกหมวดหมู่</option>
                <option value="school">โรงเรียน</option>
                <option value="student">นักเรียน</option>
                <option value="event">กิจกรรม</option>
                <option value="other">อื่นๆ</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-start gap-2 rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-700">
              <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <Button onClick={handleFetch} loading={loading} icon={<Download className="h-4 w-4" />}>
            {loading ? 'กำลังดึงรูป...' : 'ดึงรูปเข้า Gallery'}
          </Button>
        </div>
      )}
    </div>
  );
}

// ── Gallery categories ───────────────────────────────────────────────────────
const galleryCategories = [
  { value: 'school', label: 'โรงเรียน' },
  { value: 'student', label: 'นักเรียน' },
  { value: 'event', label: 'กิจกรรม' },
  { value: 'other', label: 'อื่นๆ' },
];

const schema = z.object({
  imageUrl: z.string().min(1, 'กรุณากรอก URL รูปภาพ'),
  titleTh: z.string().optional(),
  titleEn: z.string().optional(),
  category: z.string().optional(),
  sortOrder: z.coerce.number().default(0),
  isActive: z.boolean(),
});

type FormData = z.infer<typeof schema>;

function GalleryForm({ defaultValues, onSave, onCancel, isLoading }: {
  defaultValues?: Partial<FormData>;
  onSave: (d: FormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}) {
  const [imageUploading, setImageUploading] = useState(false);
  const { register, handleSubmit, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { isActive: true, sortOrder: 0, ...defaultValues },
  });

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4">
      <Controller control={control} name="imageUrl" render={({ field }) => (
        <ImageUpload label="รูปภาพ *" value={field.value || ''} onChange={field.onChange} onUploadingChange={setImageUploading} required />
      )} />
      <div className="grid grid-cols-2 gap-4">
        <Input label="ชื่อ (TH)" {...register('titleTh')} />
        <Input label="ชื่อ (EN)" {...register('titleEn')} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Controller control={control} name="category" render={({ field }) => (
          <Select label="หมวดหมู่" options={galleryCategories} placeholder="เลือกหมวดหมู่" {...field} value={field.value ?? ''} />
        )} />
        <Input label="ลำดับ" type="number" {...register('sortOrder')} />
      </div>
      <Controller control={control} name="isActive" render={({ field }) => (
        <Toggle checked={field.value} onChange={field.onChange} label="เปิดใช้งาน" />
      )} />
      <div className="flex justify-end gap-2 pt-2">
        {imageUploading && (
          <p className="text-xs text-amber-600 self-center">⏳ รอรูปอัปโหลดเสร็จก่อนบันทึก</p>
        )}
        <Button variant="secondary" type="button" onClick={onCancel}>ยกเลิก</Button>
        <Button type="submit" loading={isLoading} disabled={imageUploading}>บันทึก</Button>
      </div>
    </form>
  );
}

export function GalleryPage() {
  const queryClient = useQueryClient();
  const crud = useCrud<GalleryItem>({ api: galleryApi, queryKey: 'gallery' });

  const columns = [
    {
      key: 'image', header: 'รูปภาพ', cell: (r: GalleryItem) => (
        <img src={r.imageUrl} alt={r.titleEn ?? 'gallery'} className="h-12 w-16 object-cover rounded border border-gray-200" />
      ),
    },
    { key: 'title', header: 'ชื่อ', cell: (r: GalleryItem) => <span className="text-sm">{r.titleTh ?? r.titleEn ?? '-'}</span> },
    { key: 'category', header: 'หมวดหมู่', cell: (r: GalleryItem) => <span className="text-sm text-gray-600">{r.category ?? '-'}</span> },
    {
      key: 'actions', header: '',
      cell: (r: GalleryItem) => (
        <div className="flex gap-1 justify-end">
          <Button size="sm" variant="ghost" icon={<Pencil className="h-3.5 w-3.5" />} onClick={() => crud.openEdit(r)}>แก้ไข</Button>
          <Button size="sm" variant="ghost" icon={<Trash2 className="h-3.5 w-3.5" />} onClick={() => crud.handleDelete(r.id)} className="text-red-500">ลบ</Button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout title="แกลเลอรี" actions={
      <Button icon={<Plus className="h-4 w-4" />} onClick={crud.openCreate}>เพิ่มรูปภาพ</Button>
    }>
      {/* ── Usage guide ── */}
      <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 px-5 py-4 text-sm text-blue-800 space-y-1">
        <p className="font-semibold text-blue-900">📸 วิธีใช้งาน Gallery</p>
        <p>รูปที่อัปโหลดที่นี่จะแสดงที่ <strong>หน้าแรก (/) → ส่วน "บรรยากาศการเรียน"</strong> โดยอัตโนมัติ</p>
        <p>ถ้ายังไม่มีรูปในระบบ เว็บจะแสดงรูปตัวอย่างเดิมแทน (fallback) ไม่มีพื้นที่ว่าง</p>
        <p>หมวดหมู่ใช้สำหรับจัดกลุ่มในหน้านี้ · ลำดับ (ตัวเลขน้อย = แสดงก่อน) · ต้องเปิดใช้งานถึงจะโชว์</p>
      </div>

      {/* ── Fetch-from-URL panel ── */}
      <FetchFromUrlPanel onSuccess={() => {
        queryClient.invalidateQueries({ queryKey: ['gallery'] });
        queryClient.invalidateQueries({ queryKey: ['gallery-home'] });
      }} />

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <SearchBar value={crud.search} onChange={crud.setSearch} placeholder="ค้นหาแกลเลอรี..." className="w-72" />
        </div>
        <div className="p-4">
          <Table data={crud.data} columns={columns} isLoading={crud.isLoading} page={crud.page} total={crud.total} pageSize={20} onPageChange={crud.setPage} />
        </div>
      </div>
      <Modal open={crud.showModal} onClose={crud.closeModal} title={crud.editItem ? 'แก้ไขรูปภาพ' : 'เพิ่มรูปภาพใหม่'}>
        <GalleryForm defaultValues={crud.editItem ?? undefined} onSave={crud.handleSave} onCancel={crud.closeModal} isLoading={crud.isSaving} />
      </Modal>
    </AdminLayout>
  );
}
