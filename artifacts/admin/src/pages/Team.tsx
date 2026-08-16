import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Table } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Modal } from '@/components/ui/Modal';
import { SearchBar } from '@/components/ui/SearchBar';
import { Toggle } from '@/components/ui/toggle';
import { StatusBadge } from '@/components/ui/badge';
import { useCrud } from '@/hooks/useCrud';
import { teamApi, TeamMember } from '@/lib/api';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const schema = z.object({
  nameEn: z.string().min(1, 'กรุณากรอกชื่อ'),
  nameTh: z.string().optional(),
  role: z.string().optional(),
  avatarUrl: z.string().optional(),
  bio: z.string().optional(),
  sortOrder: z.coerce.number().default(0),
  isActive: z.boolean(),
});

type FormData = z.infer<typeof schema>;

function TeamForm({ defaultValues, onSave, onCancel, isLoading }: {
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
      <div className="grid grid-cols-2 gap-4">
        <Input label="ชื่อ (EN)" error={errors.nameEn?.message} {...register('nameEn')} />
        <Input label="ชื่อ (TH)" {...register('nameTh')} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="ตำแหน่ง (Role)" {...register('role')} />
        <Input label="ลำดับ" type="number" {...register('sortOrder')} />
      </div>
      <Controller control={control} name="avatarUrl" render={({ field }) => (
        <ImageUpload label="รูปโปรไฟล์" value={field.value || ''} onChange={field.onChange} rounded />
      )} />
      <Textarea label="ประวัติ (Bio)" rows={3} {...register('bio')} />
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

export function TeamPage() {
  const crud = useCrud<TeamMember>({ api: teamApi, queryKey: 'team' });

  const columns = [
    {
      key: 'avatar', header: 'รูป', cell: (r: TeamMember) =>
        r.avatarUrl ? (
          <img src={r.avatarUrl} alt={r.nameEn} className="h-9 w-9 rounded-full object-cover" />
        ) : (
          <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600">
            {r.nameEn.charAt(0)}
          </div>
        ),
    },
    { key: 'name', header: 'ชื่อ', cell: (r: TeamMember) => (
      <div>
        <p className="font-medium text-sm">{r.nameEn}</p>
        {r.nameTh && <p className="text-xs text-gray-500">{r.nameTh}</p>}
      </div>
    ) },
    { key: 'role', header: 'ตำแหน่ง', cell: (r: TeamMember) => <span className="text-sm text-gray-600">{r.role ?? '-'}</span> },
    {
      key: 'actions', header: '',
      cell: (r: TeamMember) => (
        <div className="flex gap-1 justify-end">
          <Button size="sm" variant="ghost" icon={<Pencil className="h-3.5 w-3.5" />} onClick={() => crud.openEdit(r)}>แก้ไข</Button>
          <Button size="sm" variant="ghost" icon={<Trash2 className="h-3.5 w-3.5" />} onClick={() => crud.handleDelete(r.id)} className="text-red-500">ลบ</Button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout title="ทีม" actions={
      <Button icon={<Plus className="h-4 w-4" />} onClick={crud.openCreate}>เพิ่มสมาชิก</Button>
    }>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <SearchBar value={crud.search} onChange={crud.setSearch} placeholder="ค้นหาสมาชิก..." className="w-72" />
        </div>
        <div className="p-4">
          <Table data={crud.data} columns={columns} isLoading={crud.isLoading} page={crud.page} total={crud.total} pageSize={20} onPageChange={crud.setPage} />
        </div>
      </div>
      <Modal open={crud.showModal} onClose={crud.closeModal} title={crud.editItem ? 'แก้ไขสมาชิก' : 'เพิ่มสมาชิกใหม่'}>
        <TeamForm defaultValues={crud.editItem ?? undefined} onSave={crud.handleSave} onCancel={crud.closeModal} isLoading={crud.isSaving} />
      </Modal>
    </AdminLayout>
  );
}
