import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Table } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ContactStatusBadge } from '@/components/ui/badge';
import { contactsApi, Contact } from '@/lib/api';
import { formatDateTime, truncate } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';
import { Eye } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';

const statusOptions = [
  { value: '', label: 'ทั้งหมด' },
  { value: 'new', label: 'ใหม่' },
  { value: 'in_progress', label: 'กำลังดำเนินการ' },
  { value: 'replied', label: 'ตอบแล้ว' },
  { value: 'closed', label: 'ปิด' },
];

const statusUpdateOptions = [
  { value: 'new', label: 'ใหม่' },
  { value: 'in_progress', label: 'กำลังดำเนินการ' },
  { value: 'replied', label: 'ตอบแล้ว' },
  { value: 'closed', label: 'ปิด' },
];

export function ContactsPage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [viewContact, setViewContact] = useState<Contact | null>(null);
  const { register, handleSubmit, control, reset } = useForm<{ status: string; adminNotes: string }>({
    defaultValues: { status: '', adminNotes: '' },
  });

  const { data, isLoading } = useQuery({
    queryKey: ['contacts', page, statusFilter],
    queryFn: () => contactsApi.list({ page, limit: 20, ...(statusFilter ? { status: statusFilter } : {}) }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status, adminNotes }: { id: number; status: string; adminNotes: string }) =>
      contactsApi.updateStatus(id, status, adminNotes),
    onSuccess: (updated) => {
      toast('อัปเดตสถานะสำเร็จ', 'success');
      qc.invalidateQueries({ queryKey: ['contacts'] });
      setViewContact(updated);
    },
    onError: (e) => toast(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด', 'error'),
  });

  const openView = (contact: Contact) => {
    setViewContact(contact);
    reset({ status: contact.status, adminNotes: contact.adminNotes ?? '' });
  };

  const onSaveStatus = (id: number) => handleSubmit((form) => {
    updateMutation.mutate({ id, status: form.status, adminNotes: form.adminNotes });
  })();

  const columns = [
    { key: 'name', header: 'ชื่อ', cell: (r: Contact) => <span className="font-medium text-sm">{r.name}</span> },
    { key: 'email', header: 'อีเมล', cell: (r: Contact) => <span className="text-sm text-gray-600">{r.email}</span> },
    { key: 'phone', header: 'โทร', cell: (r: Contact) => <span className="text-sm">{r.phone ?? '-'}</span> },
    { key: 'subject', header: 'เรื่อง', cell: (r: Contact) => <span className="text-sm">{truncate(r.subject ?? r.message, 30)}</span> },
    { key: 'date', header: 'วันที่', cell: (r: Contact) => <span className="text-xs text-gray-500">{formatDateTime(r.createdAt)}</span> },
    {
      key: 'actions', header: '',
      cell: (r: Contact) => (
        <Button size="sm" variant="ghost" icon={<Eye className="h-3.5 w-3.5" />} onClick={() => openView(r)}>ดู</Button>
      ),
    },
  ];

  return (
    <AdminLayout title="ข้อความติดต่อ">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-200 flex gap-3">
          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="w-48"
          />
        </div>
        <div className="p-4">
          <Table
            data={data?.data ?? []}
            columns={columns}
            isLoading={isLoading}
            page={page}
            total={data?.total ?? 0}
            pageSize={20}
            onPageChange={setPage}
          />
        </div>
      </div>

      {viewContact && (
        <Modal
          open={!!viewContact}
          onClose={() => setViewContact(null)}
          title="รายละเอียดข้อความ"
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 text-xs mb-1">ชื่อ</p>
                <p className="font-medium">{viewContact.name}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">อีเมล</p>
                <p>{viewContact.email}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">โทรศัพท์</p>
                <p>{viewContact.phone ?? '-'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">วันที่</p>
                <p>{formatDateTime(viewContact.createdAt)}</p>
              </div>
            </div>
            {viewContact.subject && (
              <div>
                <p className="text-gray-500 text-xs mb-1">เรื่อง</p>
                <p className="text-sm font-medium">{viewContact.subject}</p>
              </div>
            )}
            <div>
              <p className="text-gray-500 text-xs mb-1">ข้อความ</p>
              <div className="bg-gray-50 rounded-lg p-3 text-sm leading-relaxed whitespace-pre-wrap">
                {viewContact.message}
              </div>
            </div>
            <div className="border-t border-gray-200 pt-4 space-y-3">
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select label="อัปเดตสถานะ" options={statusUpdateOptions} {...field} />
                )}
              />
              <Textarea label="บันทึกผู้ดูแล" rows={3} {...register('adminNotes')} placeholder="บันทึกเพิ่มเติม..." />
              <div className="flex justify-end">
                <Button
                  onClick={() => onSaveStatus(viewContact.id)}
                  loading={updateMutation.isPending}
                >
                  บันทึกสถานะ
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
}
