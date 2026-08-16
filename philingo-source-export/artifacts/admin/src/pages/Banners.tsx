import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { Textarea } from '@/components/ui/Textarea';
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
import { bannersApi, Banner } from '@/lib/api';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const schema = z.object({
  titleTh:    z.string().optional(),
  title:      z.string().optional(),
  subtitleTh: z.string().optional(),
  subtitle:   z.string().optional(),
  ctaTextTh:  z.string().optional(),
  ctaText:    z.string().optional(),
  ctaUrl:     z.string().optional(),
  imageUrl:   z.string().min(1, 'กรุณาอัปโหลดหรือกรอก URL รูปภาพ'),
  sortOrder:  z.coerce.number().default(0),
  isActive:   z.boolean(),
});

type FormData = z.infer<typeof schema>;

function BannerForm({ defaultValues, onSave, onCancel, isLoading }: {
  defaultValues?: Partial<FormData>;
  onSave: (d: FormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}) {
  const [imageUploading, setImageUploading] = React.useState(false);
  const { register, handleSubmit, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { isActive: true, sortOrder: 0, ...defaultValues },
  });

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">

      {/* ── รูปภาพ ── */}
      <Controller control={control} name="imageUrl" render={({ field }) => (
        <ImageUpload
          label="รูปภาพแบนเนอร์ *"
          value={field.value || ''}
          onChange={field.onChange}
          onUploadingChange={setImageUploading}
          required
        />
      )} />
      {errors.imageUrl && <p className="text-xs text-red-500">{errors.imageUrl.message}</p>}

      {/* ── หัวข้อ ── */}
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b pb-1 pt-1">หัวข้อและคำอธิบาย</p>
      <div className="grid grid-cols-2 gap-4">
        <Input label="หัวข้อ (TH)" placeholder="เรียนภาษาอังกฤษที่ฟิลิปปินส์" {...register('titleTh')} />
        <Input label="หัวข้อ (EN)" placeholder="Study English in the Philippines" {...register('title')} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Textarea label="คำบรรยาย (TH)" placeholder="โปรโมชั่นพิเศษเดือนนี้ ลด ฿5,000" rows={2} {...register('subtitleTh')} />
        <Textarea label="คำบรรยาย (EN)" placeholder="Special offer this month, save ฿5,000" rows={2} {...register('subtitle')} />
      </div>

      {/* ── ปุ่ม CTA ── */}
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b pb-1 pt-1">ปุ่มกดบนแบนเนอร์</p>
      <div className="grid grid-cols-2 gap-4">
        <Input label="ข้อความปุ่ม (TH)" placeholder="ดูโปรโมชั่น" {...register('ctaTextTh')} />
        <Input label="ข้อความปุ่ม (EN)" placeholder="View Promotion" {...register('ctaText')} />
      </div>
      <Input label="URL ลิงก์ปุ่ม" placeholder="/promotions หรือ /schools/cia" {...register('ctaUrl')} />

      {/* ── การแสดงผล ── */}
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b pb-1 pt-1">การแสดงผล</p>
      <Input label="ลำดับการแสดง (0 = แสดงก่อน)" type="number" {...register('sortOrder')} />
      <Controller control={control} name="isActive" render={({ field }) => (
        <Toggle checked={field.value} onChange={field.onChange} label="เปิดใช้งาน (แสดงบนหน้าเว็บ)" />
      )} />

      <div className="flex justify-end gap-2 pt-2 sticky bottom-0 bg-white py-3 border-t">
        {imageUploading && (
          <p className="text-xs text-amber-600 self-center flex items-center gap-1">
            ⏳ กรุณารอให้รูปอัปโหลดเสร็จก่อนบันทึก
          </p>
        )}
        <Button variant="secondary" type="button" onClick={onCancel}>ยกเลิก</Button>
        <Button type="submit" loading={isLoading} disabled={imageUploading}>บันทึก</Button>
      </div>
    </form>
  );
}

export function BannersPage() {
  const crud = useCrud<Banner>({ api: bannersApi, queryKey: 'banners' });

  const columns = [
    {
      key: 'image', header: 'รูปภาพ',
      cell: (r: Banner) => (
        r.imageUrl
          ? <img src={r.imageUrl} alt={r.titleTh ?? r.title ?? 'banner'} className="h-12 w-28 object-cover rounded border border-gray-200" />
          : <div className="h-12 w-28 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">ไม่มีรูป</div>
      ),
    },
    {
      key: 'title', header: 'หัวข้อ',
      cell: (r: Banner) => (
        <div>
          <p className="font-medium text-sm text-gray-900">{r.titleTh ?? '-'}</p>
          {r.subtitleTh && <p className="text-xs text-gray-400 truncate max-w-[200px]">{r.subtitleTh}</p>}
        </div>
      ),
    },
    {
      key: 'cta', header: 'ปุ่ม',
      cell: (r: Banner) => r.ctaTextTh
        ? <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{r.ctaTextTh}</span>
        : <span className="text-xs text-gray-400">-</span>,
    },
    { key: 'sort', header: 'ลำดับ', cell: (r: Banner) => <span className="text-sm">{r.sortOrder}</span> },
    { key: 'status', header: 'สถานะ', cell: (r: Banner) => <StatusBadge active={r.isActive} /> },
    {
      key: 'actions', header: '',
      cell: (r: Banner) => (
        <div className="flex gap-1 justify-end">
          <Button size="sm" variant="ghost" icon={<Pencil className="h-3.5 w-3.5" />} onClick={() => crud.openEdit(r)}>แก้ไข</Button>
          <Button size="sm" variant="ghost" icon={<Trash2 className="h-3.5 w-3.5" />} onClick={() => crud.handleDelete(r.id)} className="text-red-500">ลบ</Button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout
      title="แบนเนอร์"
      actions={
        <div className="flex items-center gap-2">
          <a href="/activities" target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            🌐 หน้ากิจกรรม
          </a>
          <a href="/seminars" target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            🌐 หน้าสัมมนา
          </a>
          <Button icon={<Plus className="h-4 w-4" />} onClick={crud.openCreate}>เพิ่มแบนเนอร์</Button>
        </div>
      }
    >
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700 space-y-1">
        <p><b>📌 แบนเนอร์หน้ากิจกรรม / สัมมนา</b> — รูปภาพที่แสดงเป็น Hero Banner บนหน้า <b>กิจกรรม</b> และ <b>งานสัมมนา</b></p>
        <p>วิธีใช้: อัปโหลดรูปภาพแบนเนอร์ → เปิดใช้งาน → รูปจะแสดงบนหน้าเว็บทันที ระบบดึงแบนเนอร์ที่เปิดใช้งาน (Active) ลำดับแรกขึ้นแสดง</p>
        <p className="text-blue-600">💡 แนะนำขนาดรูป: <b>1200 × 630 px</b> (สัดส่วน 1.9:1) หรือใหญ่กว่า เพื่อความคมชัดบนทุกหน้าจอ</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <SearchBar value={crud.search} onChange={crud.setSearch} placeholder="ค้นหาแบนเนอร์..." className="w-72" />
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
        title={crud.editItem ? 'แก้ไขแบนเนอร์' : 'เพิ่มแบนเนอร์ใหม่'}
        size="lg"
      >
        <BannerForm
          defaultValues={crud.editItem ?? undefined}
          onSave={crud.handleSave}
          onCancel={crud.closeModal}
          isLoading={crud.isSaving}
        />
      </Modal>
    </AdminLayout>
  );
}
