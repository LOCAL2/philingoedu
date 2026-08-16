import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { SearchBar } from '@/components/ui/SearchBar';
import { Toggle } from '@/components/ui/Toggle';
import { StatusBadge } from '@/components/ui/Badge';
import { useCrud } from '@/hooks/useCrud';
import { partnersApi, Partner } from '@/lib/api';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const partnerTypes = [
  { value: 'school', label: 'โรงเรียน' },
  { value: 'agency', label: 'เอเจนซี' },
  { value: 'sponsor', label: 'ผู้สนับสนุน' },
  { value: 'media', label: 'สื่อ' },
  { value: 'other', label: 'อื่นๆ' },
];

const schema = z.object({
  name: z.string().min(1, 'กรุณากรอกชื่อ'),
  logoUrl: z.string().optional(),
  partnerType: z.string().optional(),
  websiteUrl: z.string().optional(),
  isActive: z.boolean(),
});

type FormData = z.infer<typeof schema>;

function PartnerForm({ defaultValues, onSave, onCancel, isLoading }: {
  defaultValues?: Partial<FormData>;
  onSave: (d: FormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}) {
  const { register, handleSubmit, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { isActive: true, ...defaultValues },
  });

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4">
      <Input label="ชื่อพาร์ทเนอร์" error={errors.name?.message} {...register('name')} />
      <div className="grid grid-cols-2 gap-4">
        <Controller control={control} name="logoUrl" render={({ field }) => (
          <ImageUpload label="โลโก้" value={field.value || ''} onChange={field.onChange} />
        )} />
        <Controller control={control} name="partnerType" render={({ field }) => (
          <Select label="ประเภท" options={partnerTypes} placeholder="เลือกประเภท" {...field} value={field.value ?? ''} />
        )} />
      </div>
      <Input label="Website URL" {...register('websiteUrl')} placeholder="https://..." />
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

export function PartnersPage() {
  const crud = useCrud<Partner>({ api: partnersApi, queryKey: 'partners' });

  const columns = [
    { key: 'name', header: 'ชื่อ', cell: (r: Partner) => <span className="font-medium text-sm">{r.name}</span> },
    {
      key: 'logo', header: 'โลโก้', cell: (r: Partner) =>
        r.logoUrl ? (
          <img src={r.logoUrl} alt={r.name} className="h-8 w-auto max-w-16 object-contain" />
        ) : (
          <span className="text-sm text-gray-400">-</span>
        ),
    },
    { key: 'type', header: 'ประเภท', cell: (r: Partner) => <span className="text-sm text-gray-600">{r.partnerType ?? '-'}</span> },
    { key: 'status', header: 'สถานะ', cell: (r: Partner) => <StatusBadge active={r.isActive} /> },
    {
      key: 'actions', header: '',
      cell: (r: Partner) => (
        <div className="flex gap-1 justify-end">
          <Button size="sm" variant="ghost" icon={<Pencil className="h-3.5 w-3.5" />} onClick={() => crud.openEdit(r)}>แก้ไข</Button>
          <Button size="sm" variant="ghost" icon={<Trash2 className="h-3.5 w-3.5" />} onClick={() => crud.handleDelete(r.id)} className="text-red-500">ลบ</Button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout title="พาร์ทเนอร์" actions={
      <Button icon={<Plus className="h-4 w-4" />} onClick={crud.openCreate}>เพิ่มพาร์ทเนอร์</Button>
    }>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <SearchBar value={crud.search} onChange={crud.setSearch} placeholder="ค้นหาพาร์ทเนอร์..." className="w-72" />
        </div>
        <div className="p-4">
          <Table data={crud.data} columns={columns} isLoading={crud.isLoading} page={crud.page} total={crud.total} pageSize={20} onPageChange={crud.setPage} />
        </div>
      </div>
      <Modal open={crud.showModal} onClose={crud.closeModal} title={crud.editItem ? 'แก้ไขพาร์ทเนอร์' : 'เพิ่มพาร์ทเนอร์ใหม่'}>
        <PartnerForm defaultValues={crud.editItem ?? undefined} onSave={crud.handleSave} onCancel={crud.closeModal} isLoading={crud.isSaving} />
      </Modal>
    </AdminLayout>
  );
}
