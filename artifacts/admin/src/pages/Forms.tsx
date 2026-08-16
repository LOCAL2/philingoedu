import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Table } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/select';
import { FormTypeBadge, ContactStatusBadge } from '@/components/ui/badge';
import { formsApi, FormSubmission, SeminarRegistration } from '@/lib/api';
import { formatDateTime, truncate } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';
import { Eye, Download, ClipboardList, CalendarDays } from 'lucide-react';

const typeOptions = [
  { value: '', label: 'ทุกประเภท' },
  { value: 'apply', label: 'สมัครเรียน' },
  { value: 'consult', label: 'ขอคำปรึกษา' },
  { value: 'quotation', label: 'ขอใบเสนอราคา' },
  { value: 'seminar', label: 'สัมมนา' },
];

const statusOptions = [
  { value: 'new', label: 'ใหม่' },
  { value: 'in_progress', label: 'กำลังดำเนินการ' },
  { value: 'replied', label: 'ตอบแล้ว' },
  { value: 'closed', label: 'ปิด' },
];

function downloadCsvBlob(url: string, filename: string) {
  const token = localStorage.getItem('philingo_admin_token');
  return fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    .then(r => { if (!r.ok) throw new Error('Export failed'); return r.blob(); })
    .then(blob => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
    });
}

export function FormsPage() {
  const qc = useQueryClient();
  const { toast } = useToast();

  // tab state
  const [activeTab, setActiveTab] = useState<'forms' | 'seminars'>('forms');

  // forms tab state
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [viewForm, setViewForm] = useState<FormSubmission | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // seminars tab state
  const [semPage, setSemPage] = useState(1);
  const [semFrom, setSemFrom] = useState('');
  const [semTo, setSemTo] = useState('');
  const [viewSeminar, setViewSeminar] = useState<SeminarRegistration | null>(null);
  const [isSemExporting, setIsSemExporting] = useState(false);

  // ── Forms query ──
  const { data, isLoading } = useQuery({
    queryKey: ['forms', page, typeFilter, fromDate, toDate],
    queryFn: () => formsApi.list({
      page, limit: 20,
      ...(typeFilter ? { type: typeFilter } : {}),
      ...(fromDate ? { from: fromDate } : {}),
      ...(toDate ? { to: toDate } : {}),
    }),
    enabled: activeTab === 'forms',
  });

  // ── Seminars query ──
  const { data: semData, isLoading: semLoading } = useQuery({
    queryKey: ['seminars', semPage, semFrom, semTo],
    queryFn: () => formsApi.listSeminars({
      page: semPage, limit: 20,
      ...(semFrom ? { from: semFrom } : {}),
      ...(semTo ? { to: semTo } : {}),
    }),
    enabled: activeTab === 'seminars',
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => formsApi.updateStatus(id, status),
    onSuccess: (updated) => {
      toast('อัปเดตสำเร็จ', 'success');
      qc.invalidateQueries({ queryKey: ['forms'] });
      setViewForm(updated);
    },
    onError: (e) => toast(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด', 'error'),
  });

  // ── Export handlers ──
  const handleExportForms = async () => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams();
      if (typeFilter) params.set('type', typeFilter);
      if (fromDate) params.set('from', fromDate);
      if (toDate) params.set('to', toDate);
      const qs = params.toString() ? '?' + params.toString() : '';
      const date = new Date().toISOString().split('T')[0];
      await downloadCsvBlob(`/api/forms/export${qs}`, `forms-${date}.csv`);
      toast('Export สำเร็จ', 'success');
    } catch {
      toast('Export ไม่สำเร็จ', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportSeminars = async () => {
    setIsSemExporting(true);
    try {
      const params = new URLSearchParams();
      if (semFrom) params.set('from', semFrom);
      if (semTo) params.set('to', semTo);
      const qs = params.toString() ? '?' + params.toString() : '';
      const date = new Date().toISOString().split('T')[0];
      await downloadCsvBlob(`/api/forms/seminars/export${qs}`, `seminar-registrations-${date}.csv`);
      toast('Export สำเร็จ', 'success');
    } catch {
      toast('Export ไม่สำเร็จ', 'error');
    } finally {
      setIsSemExporting(false);
    }
  };

  // ── Columns ──
  const formColumns = [
    { key: 'type', header: 'ประเภท', cell: (r: FormSubmission) => <FormTypeBadge type={r.formType} /> },
    { key: 'name', header: 'ชื่อ', cell: (r: FormSubmission) => <span className="font-medium text-sm">{r.name}</span> },
    { key: 'email', header: 'อีเมล', cell: (r: FormSubmission) => <span className="text-sm text-gray-600 dark:text-gray-400">{r.email}</span> },
    { key: 'phone', header: 'โทร', cell: (r: FormSubmission) => <span className="text-sm">{r.phone ?? '-'}</span> },
    { key: 'school', header: 'โรงเรียน', cell: (r: FormSubmission) => <span className="text-sm">{r.schoolInterest ? truncate(r.schoolInterest, 20) : '-'}</span> },
    { key: 'date', header: 'วันที่', cell: (r: FormSubmission) => <span className="text-xs text-gray-500">{formatDateTime(r.createdAt)}</span> },
    { key: 'status', header: 'สถานะ', cell: (r: FormSubmission) => <ContactStatusBadge status={r.status} /> },
    {
      key: 'actions', header: '',
      cell: (r: FormSubmission) => (
        <Button size="sm" variant="ghost" icon={<Eye className="h-3.5 w-3.5" />} onClick={() => setViewForm(r)}>ดู</Button>
      ),
    },
  ];

  const seminarColumns = [
    { key: 'event', header: 'งานสัมมนา', cell: (r: SeminarRegistration) => <span className="text-sm font-medium">{truncate(r.eventName, 25)}</span> },
    { key: 'name', header: 'ชื่อ', cell: (r: SeminarRegistration) => <span className="font-medium text-sm">{r.name}</span> },
    { key: 'email', header: 'อีเมล', cell: (r: SeminarRegistration) => <span className="text-sm text-gray-600 dark:text-gray-400">{r.email}</span> },
    { key: 'phone', header: 'โทร', cell: (r: SeminarRegistration) => <span className="text-sm">{r.phone}</span> },
    { key: 'school', header: 'โรงเรียน', cell: (r: SeminarRegistration) => <span className="text-sm">{r.schoolInterest ? truncate(r.schoolInterest, 18) : '-'}</span> },
    { key: 'participants', header: 'จำนวน', cell: (r: SeminarRegistration) => <span className="text-sm text-center">{r.numParticipants ?? '1'}</span> },
    { key: 'date', header: 'วันที่', cell: (r: SeminarRegistration) => <span className="text-xs text-gray-500">{formatDateTime(r.createdAt)}</span> },
    { key: 'status', header: 'สถานะ', cell: (r: SeminarRegistration) => <ContactStatusBadge status={r.status} /> },
    {
      key: 'actions', header: '',
      cell: (r: SeminarRegistration) => (
        <Button size="sm" variant="ghost" icon={<Eye className="h-3.5 w-3.5" />} onClick={() => setViewSeminar(r)}>ดู</Button>
      ),
    },
  ];

  return (
    <AdminLayout title="แบบฟอร์มที่ส่งมา">
      {/* ── Tabs ── */}
      <div className="flex gap-1 mb-4 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('forms')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'forms'
              ? 'bg-white dark:bg-gray-700 shadow text-[#1B4FD8] dark:text-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <ClipboardList className="h-4 w-4" />
          ฟอร์มทั่วไป
          {data?.total != null && (
            <span className="bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5 rounded-full">{data.total}</span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('seminars')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'seminars'
              ? 'bg-white dark:bg-gray-700 shadow text-[#1B4FD8] dark:text-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <CalendarDays className="h-4 w-4" />
          ลงทะเบียนสัมมนา
          {semData?.total != null && (
            <span className="bg-orange-100 text-orange-700 text-xs px-1.5 py-0.5 rounded-full">{semData.total}</span>
          )}
        </button>
      </div>

      {/* ── Forms Tab ── */}
      {activeTab === 'forms' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          {/* Toolbar */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-wrap gap-3 items-center">
            <Select
              options={typeOptions}
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
              className="w-44"
            />
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500 whitespace-nowrap">จาก</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500 whitespace-nowrap">ถึง</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => { setToDate(e.target.value); setPage(1); }}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {(fromDate || toDate || typeFilter) && (
              <button
                onClick={() => { setFromDate(''); setToDate(''); setTypeFilter(''); setPage(1); }}
                className="text-xs text-gray-400 hover:text-gray-600 underline"
              >
                ล้างตัวกรอง
              </button>
            )}
            <div className="ml-auto">
              <Button
                size="sm"
                variant="outline"
                icon={<Download className="h-4 w-4" />}
                onClick={handleExportForms}
                disabled={isExporting}
              >
                {isExporting ? 'กำลัง Export...' : 'Export CSV'}
              </Button>
            </div>
          </div>
          <div className="p-4">
            <Table
              data={data?.data ?? []}
              columns={formColumns}
              isLoading={isLoading}
              page={page}
              total={data?.total ?? 0}
              pageSize={20}
              onPageChange={setPage}
            />
          </div>
        </div>
      )}

      {/* ── Seminars Tab ── */}
      {activeTab === 'seminars' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          {/* Toolbar */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500 whitespace-nowrap">จาก</label>
              <input
                type="date"
                value={semFrom}
                onChange={(e) => { setSemFrom(e.target.value); setSemPage(1); }}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500 whitespace-nowrap">ถึง</label>
              <input
                type="date"
                value={semTo}
                onChange={(e) => { setSemTo(e.target.value); setSemPage(1); }}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {(semFrom || semTo) && (
              <button
                onClick={() => { setSemFrom(''); setSemTo(''); setSemPage(1); }}
                className="text-xs text-gray-400 hover:text-gray-600 underline"
              >
                ล้างตัวกรอง
              </button>
            )}
            <div className="ml-auto">
              <Button
                size="sm"
                variant="outline"
                icon={<Download className="h-4 w-4" />}
                onClick={handleExportSeminars}
                disabled={isSemExporting}
              >
                {isSemExporting ? 'กำลัง Export...' : 'Export CSV'}
              </Button>
            </div>
          </div>
          <div className="p-4">
            <Table
              data={semData?.data ?? []}
              columns={seminarColumns}
              isLoading={semLoading}
              page={semPage}
              total={semData?.total ?? 0}
              pageSize={20}
              onPageChange={setSemPage}
            />
          </div>
        </div>
      )}

      {/* ── Form Detail Modal ── */}
      {viewForm && (
        <Modal open={!!viewForm} onClose={() => setViewForm(null)} title="รายละเอียดแบบฟอร์ม" size="lg">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FormTypeBadge type={viewForm.formType} />
              <ContactStatusBadge status={viewForm.status} />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-gray-500 text-xs mb-1">ชื่อ</p><p className="font-medium">{viewForm.name}</p></div>
              <div><p className="text-gray-500 text-xs mb-1">อีเมล</p><p>{viewForm.email}</p></div>
              <div><p className="text-gray-500 text-xs mb-1">โทรศัพท์</p><p>{viewForm.phone ?? '-'}</p></div>
              <div><p className="text-gray-500 text-xs mb-1">โรงเรียนที่สนใจ</p><p>{viewForm.schoolInterest ?? '-'}</p></div>
              <div><p className="text-gray-500 text-xs mb-1">วันที่ส่ง</p><p>{formatDateTime(viewForm.createdAt)}</p></div>
              {(() => {
                const lineIdMatch = viewForm.message?.match(/LINE ID:\s*([^\n]+)/);
                const lineId = lineIdMatch?.[1]?.trim();
                return lineId ? <div><p className="text-gray-500 text-xs mb-1">LINE ID</p><p className="font-semibold text-green-600 dark:text-green-400">{lineId}</p></div> : null;
              })()}
              {viewForm.message && (
                <div className="col-span-2">
                  <p className="text-gray-500 text-xs mb-1">ข้อความ / รายละเอียด</p>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 whitespace-pre-line text-xs font-mono">
                    {viewForm.message}
                  </div>
                </div>
              )}
            </div>
            {viewForm.data && Object.keys(viewForm.data).length > 0 && (
              <div>
                <p className="text-gray-500 text-xs mb-2">ข้อมูลเพิ่มเติม</p>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-sm space-y-1">
                  {Object.entries(viewForm.data).map(([k, v]) => (
                    <div key={k} className="flex gap-2">
                      <span className="text-gray-500 min-w-28">{k}:</span>
                      <span>{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex items-center gap-3">
              <Select
                options={statusOptions}
                value={viewForm.status}
                onChange={(e) => updateMutation.mutate({ id: viewForm.id, status: e.target.value })}
                className="w-48"
              />
              {updateMutation.isPending && (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#1B4FD8] border-t-transparent" />
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* ── Seminar Detail Modal ── */}
      {viewSeminar && (
        <Modal open={!!viewSeminar} onClose={() => setViewSeminar(null)} title="รายละเอียดการลงทะเบียนสัมมนา" size="lg">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full font-medium">สัมมนา</span>
              <ContactStatusBadge status={viewSeminar.status} />
            </div>
            <div>
              <p className="text-gray-500 text-xs mb-1">งานสัมมนา</p>
              <p className="font-semibold text-[#1B4FD8]">{viewSeminar.eventName}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-gray-500 text-xs mb-1">ชื่อ</p><p className="font-medium">{viewSeminar.name}</p></div>
              <div><p className="text-gray-500 text-xs mb-1">อีเมล</p><p>{viewSeminar.email}</p></div>
              <div><p className="text-gray-500 text-xs mb-1">โทรศัพท์</p><p>{viewSeminar.phone}</p></div>
              <div><p className="text-gray-500 text-xs mb-1">จำนวนผู้เข้าร่วม</p><p>{viewSeminar.numParticipants ?? '1'} คน</p></div>
              <div><p className="text-gray-500 text-xs mb-1">โรงเรียนที่สนใจ</p><p>{viewSeminar.schoolInterest ?? '-'}</p></div>
              <div><p className="text-gray-500 text-xs mb-1">หลักสูตร</p><p>{viewSeminar.programInterest ?? '-'}</p></div>
              {(() => {
                const lineIdMatch = viewSeminar.specialRequests?.match(/LINE ID:\s*([^|]+)/);
                const lineId = lineIdMatch?.[1]?.trim();
                return lineId ? <div><p className="text-gray-500 text-xs mb-1">LINE ID</p><p className="font-semibold text-green-600 dark:text-green-400">{lineId}</p></div> : null;
              })()}
              {viewSeminar.specialRequests && (
                <div className="col-span-2">
                  <p className="text-gray-500 text-xs mb-1">ความต้องการพิเศษ</p>
                  <p>
                    {(() => {
                      const reqs = viewSeminar.specialRequests;
                      if (reqs.includes('LINE ID:')) {
                        // Strip out LINE ID prefix and separator for clean display
                        const split = reqs.split('|');
                        const filtered = split.filter(s => !s.trim().startsWith('LINE ID:'));
                        return filtered.join('|').trim();
                      }
                      return reqs;
                    })()}
                  </p>
                </div>
              )}
              <div><p className="text-gray-500 text-xs mb-1">วันที่ลงทะเบียน</p><p>{formatDateTime(viewSeminar.createdAt)}</p></div>
              {viewSeminar.utmSource && (
                <div><p className="text-gray-500 text-xs mb-1">แหล่งที่มา</p><p>{viewSeminar.utmSource}{viewSeminar.utmMedium ? ` / ${viewSeminar.utmMedium}` : ''}</p></div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
}
