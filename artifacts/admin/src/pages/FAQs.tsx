import React from 'react';
import { useForm, Controller } from 'react-hook-form';
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
import { StatusBadge } from '@/components/ui/badge';
import { useCrud } from '@/hooks/useCrud';
import { faqsApi, FAQ } from '@/lib/api';
import { truncate } from '@/lib/utils';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const faqCategories = [
  { value: 'general', label: 'ทั่วไป' },
  { value: 'payment', label: 'การชำระเงิน' },
  { value: 'visa', label: 'วีซ่า' },
  { value: 'school', label: 'โรงเรียน' },
  { value: 'course', label: 'หลักสูตร' },
];

const schema = z.object({
  questionTh: z.string().min(1, 'กรุณากรอกคำถามภาษาไทย'),
  questionEn: z.string().optional(),
  answerTh: z.string().min(1, 'กรุณากรอกคำตอบภาษาไทย'),
  answerEn: z.string().optional(),
  category: z.string().optional(),
  sortOrder: z.coerce.number().default(0),
  isActive: z.boolean(),
});

type FormData = z.infer<typeof schema>;

function FAQForm({ defaultValues, onSave, onCancel, isLoading }: {
  defaultValues?: Partial<FormData>;
  onSave: (d: FormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}) {
  const { register, handleSubmit, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { isActive: true, sortOrder: 0, ...defaultValues },
  });

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4">
      <Textarea label="คำถาม (TH)" rows={2} error={errors.questionTh?.message} {...register('questionTh')} />
      <Textarea label="คำถาม (EN)" rows={2} {...register('questionEn')} />
      <Textarea label="คำตอบ (TH)" rows={4} error={errors.answerTh?.message} {...register('answerTh')} />
      <Textarea label="คำตอบ (EN)" rows={4} {...register('answerEn')} />
      <div className="grid grid-cols-2 gap-4">
        <Controller control={control} name="category" render={({ field }) => (
          <Select label="หมวดหมู่" options={faqCategories} placeholder="เลือกหมวดหมู่" {...field} value={field.value ?? ''} />
        )} />
        <Input label="ลำดับ" type="number" {...register('sortOrder')} />
      </div>
      <Controller control={control} name="isActive" render={({ field }) => (
        <Toggle checked={field.value} onChange={field.onChange} label="เปิดใช้งาน" />
      )} />
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" type="button" onClick={onCancel}>ยกเลิก</Button>
        <Button type="submit" loading={isLoading}>บันทึก</Button>
      </div>
    </form>
  );
}

export function FAQsPage() {
  const crud = useCrud<FAQ>({ api: faqsApi, queryKey: 'faqs' });

  const columns = [
    { key: 'question', header: 'คำถาม (TH)', cell: (r: FAQ) => <span className="text-sm font-medium">{truncate(r.questionTh, 60)}</span> },
    { key: 'category', header: 'หมวดหมู่', cell: (r: FAQ) => <span className="text-sm text-gray-600">{r.category ?? '-'}</span> },
    { key: 'sort', header: 'ลำดับ', cell: (r: FAQ) => <span className="text-sm">{r.sortOrder}</span> },
    { key: 'status', header: 'สถานะ', cell: (r: FAQ) => <StatusBadge active={r.isActive} /> },
    {
      key: 'actions', header: '',
      cell: (r: FAQ) => (
        <div className="flex gap-1 justify-end">
          <Button size="sm" variant="ghost" icon={<Pencil className="h-3.5 w-3.5" />} onClick={() => crud.openEdit(r)}>แก้ไข</Button>
          <Button size="sm" variant="ghost" icon={<Trash2 className="h-3.5 w-3.5" />} onClick={() => crud.handleDelete(r.id)} className="text-red-500 hover:text-red-700">ลบ</Button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout title="FAQ" actions={
      <Button icon={<Plus className="h-4 w-4" />} onClick={crud.openCreate}>เพิ่ม FAQ</Button>
    }>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <SearchBar value={crud.search} onChange={crud.setSearch} placeholder="ค้นหา FAQ..." className="w-72" />
        </div>
        <div className="p-4">
          <Table data={crud.data} columns={columns} isLoading={crud.isLoading} page={crud.page} total={crud.total} pageSize={20} onPageChange={crud.setPage} />
        </div>
      </div>
      <Modal open={crud.showModal} onClose={crud.closeModal} title={crud.editItem ? 'แก้ไข FAQ' : 'เพิ่ม FAQ ใหม่'} size="lg">
        <FAQForm defaultValues={crud.editItem ?? undefined} onSave={crud.handleSave} onCancel={crud.closeModal} isLoading={crud.isSaving} />
      </Modal>
    </AdminLayout>
  );
}
