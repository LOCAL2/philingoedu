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
import { testimonialsApi, Testimonial } from '@/lib/api';
import { Plus, Pencil, Trash2, Star } from 'lucide-react';

const schema = z.object({
  nameEn: z.string().min(1, 'กรุณากรอกชื่อ'),
  nameTh: z.string().optional(),
  school: z.string().optional(),
  rating: z.coerce.number().min(1).max(5),
  contentTh: z.string().optional(),
  contentEn: z.string().optional(),
  avatarUrl: z.string().optional(),
  featured: z.boolean(),
  isActive: z.boolean(),
});

type FormData = z.infer<typeof schema>;

function TestimonialForm({ defaultValues, onSave, onCancel, isLoading }: {
  defaultValues?: Partial<FormData>;
  onSave: (d: FormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}) {
  const { register, handleSubmit, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { isActive: true, featured: false, rating: 5, ...defaultValues },
  });

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input label="ชื่อ (EN)" error={errors.nameEn?.message} {...register('nameEn')} />
        <Input label="ชื่อ (TH)" {...register('nameTh')} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="โรงเรียน" {...register('school')} />
        <Input label="Rating (1-5)" type="number" min="1" max="5" error={errors.rating?.message} {...register('rating')} />
      </div>
      <Textarea label="รีวิว (TH)" rows={3} {...register('contentTh')} />
      <Textarea label="รีวิว (EN)" rows={3} {...register('contentEn')} />
      <Controller control={control} name="avatarUrl" render={({ field }) => (
        <ImageUpload label="รูปโปรไฟล์" value={field.value || ''} onChange={field.onChange} rounded />
      )} />
      <div className="flex gap-6">
        <Controller control={control} name="featured" render={({ field }) => (
          <Toggle checked={field.value} onChange={field.onChange} label="แนะนำ" />
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

export function TestimonialsPage() {
  const crud = useCrud<Testimonial>({ api: testimonialsApi, queryKey: 'testimonials' });

  const columns = [
    {
      key: 'name', header: 'ชื่อ', cell: (r: Testimonial) => (
        <div className="flex items-center gap-2">
          {r.avatarUrl ? (
            <img src={r.avatarUrl} alt={r.nameEn} className="h-7 w-7 rounded-full object-cover" />
          ) : (
            <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
              {(r.nameEn ?? r.name ?? '?').charAt(0)}
            </div>
          )}
          <span className="font-medium text-sm">{r.nameEn}</span>
        </div>
      ),
    },
    { key: 'school', header: 'โรงเรียน', cell: (r: Testimonial) => <span className="text-sm text-gray-600">{r.school ?? '-'}</span> },
    {
      key: 'rating', header: 'Rating', cell: (r: Testimonial) => (
        <div className="flex items-center gap-0.5">
          {Array.from({ length: r.rating }).map((_, i) => (
            <Star key={i} className="h-3 w-3 text-yellow-400 fill-yellow-400" />
          ))}
        </div>
      ),
    },
    { key: 'featured', header: 'แนะนำ', cell: (r: Testimonial) => <FeaturedBadge featured={r.featured} /> },
    { key: 'status', header: 'สถานะ', cell: (r: Testimonial) => <StatusBadge active={r.isActive} /> },
    {
      key: 'actions', header: '',
      cell: (r: Testimonial) => (
        <div className="flex gap-1 justify-end">
          <Button size="sm" variant="ghost" icon={<Pencil className="h-3.5 w-3.5" />} onClick={() => crud.openEdit(r)}>แก้ไข</Button>
          <Button size="sm" variant="ghost" icon={<Trash2 className="h-3.5 w-3.5" />} onClick={() => crud.handleDelete(r.id)} className="text-red-500">ลบ</Button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout title="รีวิว" actions={
      <Button icon={<Plus className="h-4 w-4" />} onClick={crud.openCreate}>เพิ่มรีวิว</Button>
    }>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <SearchBar value={crud.search} onChange={crud.setSearch} placeholder="ค้นหารีวิว..." className="w-72" />
        </div>
        <div className="p-4">
          <Table data={crud.data} columns={columns} isLoading={crud.isLoading} page={crud.page} total={crud.total} pageSize={20} onPageChange={crud.setPage} />
        </div>
      </div>
      <Modal open={crud.showModal} onClose={crud.closeModal} title={crud.editItem ? 'แก้ไขรีวิว' : 'เพิ่มรีวิวใหม่'} size="lg">
        <TestimonialForm defaultValues={crud.editItem ?? undefined} onSave={crud.handleSave} onCancel={crud.closeModal} isLoading={crud.isSaving} />
      </Modal>
    </AdminLayout>
  );
}
