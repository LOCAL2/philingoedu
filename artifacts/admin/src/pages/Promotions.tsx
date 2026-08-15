import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Modal } from '@/components/ui/Modal';
import { SearchBar } from '@/components/ui/SearchBar';
import { Toggle } from '@/components/ui/Toggle';
import { StatusBadge, FeaturedBadge } from '@/components/ui/Badge';
import { useCrud } from '@/hooks/useCrud';
import { promotionsApi, Promotion } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const schema = z.object({
  titleTh: z.string().min(1, 'กรุณากรอกชื่อโปรโมชั่น'),
  titleEn: z.string().optional(),
  descriptionTh: z.string().optional(),
  originalPriceTh: z.string().optional(),
  discountPriceTh: z.string().optional(),
  seatsRemaining: z.coerce.number().int().min(0).optional(),
  bonusTh: z.string().optional(),
  discountPercent: z.coerce.number().optional(),
  expiresAt: z.string().optional(),
  imageUrl: z.string().optional(),
  isFeatured: z.boolean(),
  isActive: z.boolean(),
});

type FormData = z.infer<typeof schema>;

function PromotionForm({ defaultValues, onSave, onCancel, isLoading }: {
  defaultValues?: Partial<FormData>;
  onSave: (d: FormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}) {
  const { register, handleSubmit, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { isActive: true, featured: false, ...defaultValues },
  });

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input label="ชื่อโปรโมชั่น (TH)" error={errors.titleTh?.message} {...register('titleTh')} />
        <Input label="ชื่อโปรโมชั่น (EN)" {...register('titleEn')} />
      </div>

      {/* Price block */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
        <p className="text-sm font-semibold text-red-800">💰 ราคา</p>
        <div className="grid grid-cols-2 gap-3">
          <Input label="ราคาปกติ (เช่น 65,000)" placeholder="65,000" {...register('originalPriceTh')} />
          <Input label="ราคาลด / โปรโมชั่น (เช่น 55,000)" placeholder="55,000" {...register('discountPriceTh')} />
        </div>
      </div>

      {/* Countdown + seats */}
      <div className="grid grid-cols-2 gap-4">
        <Input label="วันหมดอายุ (นับถอยหลัง)" type="date" {...register('expiresAt')} />
        <Input label="ที่นั่งคงเหลือ (จำนวน)" type="number" min="0" placeholder="เช่น 5" {...register('seatsRemaining')} />
      </div>

      <Textarea label="รายละเอียดโปรโมชั่น" rows={3} placeholder="อธิบายโปรโมชั่นนี้..." {...register('descriptionTh')} />
      <Input label="ของแถม / สิทธิพิเศษเพิ่มเติม" placeholder="เช่น ฟรีกระเป๋าเดินทาง Philingo" {...register('bonusTh')} />

      <Controller control={control} name="imageUrl" render={({ field }) => (
        <ImageUpload label="รูปภาพโปรโมชั่น (ไม่บังคับ)" value={field.value || ''} onChange={field.onChange} />
      )} />
      <div className="flex gap-6">
        <Controller control={control} name="isFeatured" render={({ field }) => (
          <Toggle checked={field.value} onChange={field.onChange} label="แนะนำ (แสดงหน้าหลัก)" />
        )} />
        <Controller control={control} name="isActive" render={({ field }) => (
          <Toggle checked={field.value} onChange={field.onChange} label="เปิดใช้งาน" />
        )} />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" type="button" onClick={onCancel}>ยกเลิก</Button>
        <Button type="submit" loading={isLoading}>บันทึก</Button>
      </div>
    </form>
  );
}

export function PromotionsPage() {
  const crud = useCrud<Promotion>({ api: promotionsApi, queryKey: 'promotions' });

  const columns = [
    { key: 'titleTh', header: 'ชื่อโปรโมชั่น', cell: (r: Promotion) => <span className="font-medium text-sm">{r.titleTh}</span> },
    { key: 'discount', header: 'ส่วนลด', cell: (r: Promotion) => <span className="text-sm">{r.discountPercent != null ? `${r.discountPercent}%` : '-'}</span> },
    { key: 'expires', header: 'หมดอายุ', cell: (r: Promotion) => <span className="text-sm">{formatDate(r.expiresAt)}</span> },
    { key: 'featured', header: 'แนะนำ', cell: (r: Promotion) => <FeaturedBadge featured={r.isFeatured} /> },
    { key: 'status', header: 'สถานะ', cell: (r: Promotion) => <StatusBadge active={r.isActive} /> },
    {
      key: 'actions', header: '',
      cell: (r: Promotion) => (
        <div className="flex gap-1 justify-end">
          <Button size="sm" variant="ghost" icon={<Pencil className="h-3.5 w-3.5" />} onClick={() => crud.openEdit(r)}>แก้ไข</Button>
          <Button size="sm" variant="ghost" icon={<Trash2 className="h-3.5 w-3.5" />} onClick={() => crud.handleDelete(r.id)} className="text-red-500">ลบ</Button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout title="โปรโมชั่น" actions={
      <Button icon={<Plus className="h-4 w-4" />} onClick={crud.openCreate}>เพิ่มโปรโมชั่น</Button>
    }>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <SearchBar value={crud.search} onChange={crud.setSearch} placeholder="ค้นหาโปรโมชั่น..." className="w-72" />
        </div>
        <div className="p-4">
          <Table data={crud.data} columns={columns} isLoading={crud.isLoading} page={crud.page} total={crud.total} pageSize={20} onPageChange={crud.setPage} />
        </div>
      </div>
      <Modal open={crud.showModal} onClose={crud.closeModal} title={crud.editItem ? 'แก้ไขโปรโมชั่น' : 'เพิ่มโปรโมชั่นใหม่'} size="lg">
        <PromotionForm defaultValues={crud.editItem ?? undefined} onSave={crud.handleSave} onCancel={crud.closeModal} isLoading={crud.isSaving} />
      </Modal>
    </AdminLayout>
  );
}
