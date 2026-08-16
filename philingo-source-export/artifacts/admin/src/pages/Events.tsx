import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { SearchBar } from '@/components/ui/SearchBar';
import { Toggle } from '@/components/ui/Toggle';
import { StatusBadge } from '@/components/ui/Badge';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { useCrud } from '@/hooks/useCrud';
import { eventsApi, eventRegistrationsApi, PhilingoEvent, EventRegistration } from '@/lib/api';
import { useToast } from '@/hooks/useToast';
import { Plus, Pencil, Trash2, Calendar, MapPin, Users, Mail, Phone, X, Download } from 'lucide-react';

const schema = z.object({
  titleTh:        z.string().min(1, 'กรุณาระบุชื่อกิจกรรม'),
  title:          z.string().optional(),
  descriptionTh:  z.string().optional(),
  description:    z.string().optional(),
  eventDate:      z.string().optional(),
  eventTime:      z.string().optional(),
  venueTh:        z.string().optional(),
  venue:          z.string().optional(),
  meetUrl:        z.string().optional(),
  imageUrl:       z.string().optional(),
  eventType:      z.string().default('seminar'),
  ctaTextTh:      z.string().optional(),
  ctaUrl:         z.string().optional(),
  seatsTotal:     z.coerce.number().optional(),
  seatsRemaining: z.coerce.number().optional(),
  isFeatured:     z.boolean().default(false),
  isActive:       z.boolean().default(true),
  sortOrder:      z.coerce.number().default(0),
});
type FormData = z.infer<typeof schema>;

const EVENT_TYPES = [
  { value: 'seminar',  label: '🎓 Seminar ออนไลน์' },
  { value: 'workshop', label: '🛠️ Workshop' },
  { value: 'online',   label: '💻 กิจกรรมออนไลน์' },
  { value: 'offline',  label: '📍 กิจกรรม Onsite' },
];

/* ── Event form ─────────────────────────────────────────── */
function EventForm({ defaultValues, onSave, onCancel, isLoading }: {
  defaultValues?: Partial<FormData>; onSave: (d: FormData) => void;
  onCancel: () => void; isLoading?: boolean;
}) {
  const [imageUploading, setImageUploading] = useState(false);
  const { register, handleSubmit, control } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { isActive: true, isFeatured: false, sortOrder: 0, eventType: 'seminar', ...defaultValues },
  });
  const inp = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none';

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4 max-h-[72vh] overflow-y-auto pr-1">
      <Controller control={control} name="imageUrl" render={({ field }) => (
        <ImageUpload label="รูปภาพปกกิจกรรม" value={field.value || ''} onChange={field.onChange} onUploadingChange={setImageUploading} />
      )} />

      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b pb-1">ชื่อกิจกรรม</p>
      <div className="grid grid-cols-2 gap-3">
        <Input label="ชื่อกิจกรรม (TH) *" placeholder="Cebu Online Education Fair" {...register('titleTh')} />
        <Input label="ชื่อกิจกรรม (EN)" placeholder="Cebu Online Education Fair" {...register('title')} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">รายละเอียด (TH)</label>
          <textarea rows={3} placeholder="รายละเอียดกิจกรรม..." className={inp + ' resize-none'} {...register('descriptionTh')} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">รายละเอียด (EN)</label>
          <textarea rows={3} placeholder="Event description..." className={inp + ' resize-none'} {...register('description')} />
        </div>
      </div>

      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b pb-1">วันและเวลา</p>
      <div className="grid grid-cols-2 gap-3">
        <Input label="วันที่จัดงาน" type="date" {...register('eventDate')} />
        <Input label="เวลา (เช่น 10:00-11:00 น.)" placeholder="10:00–11:00 น." {...register('eventTime')} />
      </div>

      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b pb-1">สถานที่และลิงก์</p>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">ประเภทกิจกรรม</label>
        <select {...register('eventType')} className={inp}>
          {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="สถานที่ (TH)" placeholder="Google Meet · ออนไลน์" {...register('venueTh')} />
        <Input label="สถานที่ (EN)" placeholder="Google Meet · Online" {...register('venue')} />
      </div>
      <Input label="🔗 ลิงก์เข้าร่วม (Google Meet / Zoom) — ส่งให้ผู้ลงทะเบียนอัตโนมัติ" placeholder="https://meet.google.com/..." {...register('meetUrl')} />

      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b pb-1">ปุ่มลงทะเบียน</p>
      <div className="grid grid-cols-2 gap-3">
        <Input label="ข้อความปุ่ม (TH)" placeholder="ลงทะเบียนฟรี" {...register('ctaTextTh')} />
        <Input label="URL ปุ่ม" placeholder="/seminars#register" {...register('ctaUrl')} />
      </div>

      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b pb-1">ที่นั่ง</p>
      <div className="grid grid-cols-2 gap-3">
        <Input label="จำนวนที่นั่งทั้งหมด" type="number" placeholder="50" {...register('seatsTotal')} />
        <Input label="ที่นั่งที่เหลือ" type="number" placeholder="50" {...register('seatsRemaining')} />
      </div>

      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b pb-1">การแสดงผล</p>
      <Input label="ลำดับการแสดง (0 = แสดงก่อน)" type="number" {...register('sortOrder')} />
      <Controller control={control} name="isFeatured" render={({ field }) => (
        <Toggle checked={field.value} onChange={field.onChange} label="แนะนำ (Featured)" />
      )} />
      <Controller control={control} name="isActive" render={({ field }) => (
        <Toggle checked={field.value} onChange={field.onChange} label="เปิดใช้งาน (แสดงบนเว็บ)" />
      )} />

      <div className="flex justify-end gap-2 pt-2 sticky bottom-0 bg-white py-3 border-t">
        {imageUploading && (
          <p className="text-xs text-amber-600 self-center">⏳ รอรูปอัปโหลดเสร็จก่อนบันทึก</p>
        )}
        <Button variant="secondary" type="button" onClick={onCancel}>ยกเลิก</Button>
        <Button type="submit" loading={isLoading} disabled={imageUploading}>บันทึก</Button>
      </div>
    </form>
  );
}

/* ── Registrations modal ────────────────────────────────── */
function RegistrationsModal({ event, onClose }: { event: PhilingoEvent; onClose: () => void }) {
  const { toast } = useToast();
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['event-regs', event.id],
    queryFn: () => eventRegistrationsApi.list(event.id),
  });
  const rows = data?.data ?? [];

  const handleDelete = async (id: number) => {
    if (!confirm('ลบรายการนี้?')) return;
    await eventRegistrationsApi.delete(event.id, id);
    toast('ลบสำเร็จ', 'success');
    refetch();
  };

  const exportCsv = () => {
    const header = 'ชื่อ,อีเมล,โทร,LINE ID,หมายเหตุ,วันที่ลงทะเบียน,ส่งเมลแล้ว';
    const lines = rows.map(r =>
      [r.name, r.email ?? '', r.phone ?? '', r.lineId ?? '', r.note ?? '',
       new Date(r.registeredAt).toLocaleString('th-TH'), r.emailSent ? 'ใช่' : 'ไม่'].map(v => `"${v}"`).join(',')
    );
    const blob = new Blob(['\uFEFF' + [header, ...lines].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `registrations-${event.id}.csv`; a.click();
  };

  return (
    <Modal open onClose={onClose} title={`👥 ผู้ลงทะเบียน — ${event.titleTh}`} size="lg">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 text-blue-700 font-bold text-2xl px-4 py-2 rounded-xl">{data?.total ?? 0}</div>
            <span className="text-sm text-gray-500">คนลงทะเบียน</span>
          </div>
          <Button variant="secondary" size="sm" icon={<Download className="h-4 w-4" />} onClick={exportCsv}>Export CSV</Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
        ) : rows.length === 0 ? (
          <p className="text-center text-gray-400 py-8">ยังไม่มีผู้ลงทะเบียน</p>
        ) : (
          <div className="overflow-auto max-h-[50vh]">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">ชื่อ</th>
                  <th className="px-3 py-2 text-left">ติดต่อ</th>
                  <th className="px-3 py-2 text-left">หมายเหตุ</th>
                  <th className="px-3 py-2 text-left">วันที่</th>
                  <th className="px-3 py-2 text-center">📧</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((r, i) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-gray-400">{i + 1}</td>
                    <td className="px-3 py-2 font-medium">{r.name}</td>
                    <td className="px-3 py-2 text-gray-500 text-xs space-y-0.5">
                      {r.email && <div className="flex items-center gap-1"><Mail className="h-3 w-3" />{r.email}</div>}
                      {r.phone && <div className="flex items-center gap-1"><Phone className="h-3 w-3" />{r.phone}</div>}
                      {r.lineId && <div>LINE: {r.lineId}</div>}
                    </td>
                    <td className="px-3 py-2 text-gray-500 text-xs max-w-[120px] truncate">{r.note ?? '—'}</td>
                    <td className="px-3 py-2 text-gray-400 text-xs whitespace-nowrap">{new Date(r.registeredAt).toLocaleDateString('th-TH')}</td>
                    <td className="px-3 py-2 text-center">{r.emailSent ? '✅' : '—'}</td>
                    <td className="px-3 py-2">
                      <button onClick={() => handleDelete(r.id)} className="text-red-400 hover:text-red-600 p-1 rounded">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Modal>
  );
}

/* ── Main page ──────────────────────────────────────────── */
export function EventsPage() {
  const crud = useCrud<PhilingoEvent>({ api: eventsApi, queryKey: 'events' });
  const [viewRegsEvent, setViewRegsEvent] = useState<PhilingoEvent | null>(null);

  const eventTypeLabel = (t: string) => ({
    seminar: '🎓 Seminar', workshop: '🛠️ Workshop', online: '💻 ออนไลน์', offline: '📍 Onsite',
  }[t] ?? t);

  const columns = [
    {
      key: 'image', header: 'รูป',
      cell: (r: PhilingoEvent) => r.imageUrl
        ? <img src={r.imageUrl} alt="" className="h-10 w-16 object-cover rounded border" />
        : <div className="h-10 w-16 bg-gray-100 rounded flex items-center justify-center text-lg">📅</div>,
    },
    {
      key: 'title', header: 'ชื่อกิจกรรม',
      cell: (r: PhilingoEvent) => (
        <div>
          <p className="font-medium text-sm text-gray-900">{r.titleTh}</p>
          {r.eventDate && (
            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
              <Calendar className="h-3 w-3" />
              {new Date(r.eventDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
              {r.eventTime && ` · ${r.eventTime}`}
            </p>
          )}
          {r.venueTh && <p className="text-xs text-gray-400 flex items-center gap-1"><MapPin className="h-3 w-3" />{r.venueTh}</p>}
        </div>
      ),
    },
    { key: 'type', header: 'ประเภท', cell: (r: PhilingoEvent) => <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{eventTypeLabel(r.eventType ?? 'seminar')}</span> },
    {
      key: 'registrants', header: 'ผู้ลงทะเบียน',
      cell: (r: PhilingoEvent) => (
        <button onClick={() => setViewRegsEvent(r)}
          className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-sm px-3 py-1 rounded-full transition-colors">
          <Users className="h-3.5 w-3.5" /> ดูรายชื่อ
        </button>
      ),
    },
    {
      key: 'seats', header: 'ที่นั่ง',
      cell: (r: PhilingoEvent) => r.seatsTotal
        ? <span className="text-sm">{r.seatsRemaining ?? r.seatsTotal} / {r.seatsTotal}</span>
        : <span className="text-gray-300 text-sm">—</span>,
    },
    { key: 'status', header: 'สถานะ', cell: (r: PhilingoEvent) => <StatusBadge active={r.isActive} /> },
    {
      key: 'actions', header: '',
      cell: (r: PhilingoEvent) => (
        <div className="flex gap-1 justify-end">
          <Button size="sm" variant="ghost" icon={<Pencil className="h-3.5 w-3.5" />} onClick={() => crud.openEdit(r)}>แก้ไข</Button>
          <Button size="sm" variant="ghost" icon={<Trash2 className="h-3.5 w-3.5" />} onClick={() => crud.handleDelete(r.id)} className="text-red-500">ลบ</Button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout
      title="กิจกรรม"
      actions={
        <div className="flex items-center gap-2">
          <a href="/activities" target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            🌐 ดูหน้ากิจกรรม
          </a>
          <Button icon={<Plus className="h-4 w-4" />} onClick={crud.openCreate}>เพิ่มกิจกรรม</Button>
        </div>
      }
    >
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700">
        <b>💡 เคล็ดลับ:</b> ใส่ <b>ลิงก์ Google Meet</b> ในฟอร์มกิจกรรม — ระบบจะส่งอีเมลพร้อม link ให้ผู้ลงทะเบียนอัตโนมัติทันที
        · กดปุ่ม <b>"ดูรายชื่อ"</b> เพื่อดูว่ามีคนลงทะเบียนกี่คน
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <SearchBar value={crud.search} onChange={crud.setSearch} placeholder="ค้นหากิจกรรม..." className="w-72" />
        </div>
        <div className="p-4">
          <Table data={crud.data} columns={columns} isLoading={crud.isLoading}
            page={crud.page} total={crud.total} pageSize={20} onPageChange={crud.setPage} />
        </div>
      </div>

      {/* Edit / Create modal */}
      <Modal open={crud.showModal} onClose={crud.closeModal}
        title={crud.editItem ? 'แก้ไขกิจกรรม' : 'เพิ่มกิจกรรมใหม่'} size="lg">
        <EventForm defaultValues={crud.editItem ?? undefined}
          onSave={crud.handleSave} onCancel={crud.closeModal} isLoading={crud.isSaving} />
      </Modal>

      {/* Registrations modal */}
      {viewRegsEvent && <RegistrationsModal event={viewRegsEvent} onClose={() => setViewRegsEvent(null)} />}
    </AdminLayout>
  );
}
