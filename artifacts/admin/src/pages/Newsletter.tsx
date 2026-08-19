import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/Modal';
import { newsletterApi, NewsletterSubscriber } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';
import { Mail, Users, Send, Plus, Trash2, Download, CheckCircle, Clock, AlertCircle, MessageCircle, ExternalLink, Copy } from 'lucide-react';

interface Campaign {
  id: number; subject: string; body: string; status: string;
  sentAt: string | null; recipientCount: number; createdAt: string; createdBy: string | null;
}

export function NewsletterPage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [tab, setTab] = useState<'email' | 'line' | 'subscribers' | 'history'>('email');

  // Email compose
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [confirmSend, setConfirmSend] = useState(false);

  // LINE compose
  const [lineMsg, setLineMsg] = useState('');
  const [lineSent, setLineSent] = useState<{ lineCount: number; broadcastSent: boolean; lineIds: { name: string | null; lineId: string | null }[] } | null>(null);

  // Add subscriber modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newLineId, setNewLineId] = useState('');

  const { data: subsData, isLoading: subsLoading } = useQuery({
    queryKey: ['newsletter-subscribers'],
    queryFn: () => newsletterApi.getSubscribers(),
  });

  const { data: campaigns, isLoading: campLoading } = useQuery({
    queryKey: ['newsletter-campaigns'],
    queryFn: () => newsletterApi.getCampaigns(),
  });

  const sendMutation = useMutation({
    mutationFn: () => newsletterApi.send({ subject, body }),
    onSuccess: (data) => {
      toast({ type: 'success', message: `ส่ง Email สำเร็จ ${data.sent} คน` });
      setSubject(''); setBody(''); setConfirmSend(false);
      qc.invalidateQueries({ queryKey: ['newsletter-campaigns'] });
    },
    onError: (err: any) => toast({ type: 'error', message: err.message || 'เกิดข้อผิดพลาด' }),
  });

  const lineMutation = useMutation({
    mutationFn: () => newsletterApi.sendLine({ message: lineMsg }),
    onSuccess: (data) => {
      setLineSent(data);
      toast({ type: 'success', message: `ส่ง LINE สำเร็จ — ${data.lineCount} คนมี LINE ID` });
    },
    onError: (err: any) => toast({ type: 'error', message: err.message || 'เกิดข้อผิดพลาด' }),
  });

  const importMutation = useMutation({
    mutationFn: () => newsletterApi.importSubscribers(),
    onSuccess: (data) => {
      toast({ type: 'success', message: `นำเข้า ${data.imported} รายการสำเร็จ` });
      qc.invalidateQueries({ queryKey: ['newsletter-subscribers'] });
    },
    onError: (err: any) => toast({ type: 'error', message: err.message || 'เกิดข้อผิดพลาด' }),
  });

  const addSubscriberMutation = useMutation({
    mutationFn: () => newsletterApi.addSubscriber({ email: newEmail, name: newName, phone: newPhone, lineId: newLineId }),
    onSuccess: () => {
      toast({ type: 'success', message: 'เพิ่มผู้รับสำเร็จ' });
      setNewEmail(''); setNewName(''); setNewPhone(''); setNewLineId('');
      setShowAddModal(false);
      qc.invalidateQueries({ queryKey: ['newsletter-subscribers'] });
    },
    onError: () => toast({ type: 'error', message: 'อีเมลนี้มีอยู่แล้ว' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => newsletterApi.deleteSubscriber(id),
    onSuccess: () => {
      toast({ type: 'success', message: 'ลบแล้ว' });
      qc.invalidateQueries({ queryKey: ['newsletter-subscribers'] });
    },
  });

  const subscribers: NewsletterSubscriber[] = subsData?.data ?? [];
  const total = subsData?.total ?? 0;
  const lineCount = subscribers.filter(s => s.lineId).length;

  const copyLineIds = () => {
    const ids = subscribers.filter(s => s.lineId).map(s => `${s.name || ''} — ${s.lineId}`).join('\n');
    navigator.clipboard.writeText(ids);
    toast({ type: 'success', message: `คัดลอก LINE ID ${lineCount} รายการแล้ว` });
  };

  const statusIcon = (status: string) => {
    if (status === 'sent') return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (status === 'failed') return <AlertCircle className="h-4 w-4 text-red-500" />;
    return <Clock className="h-4 w-4 text-yellow-500" />;
  };

  const sourceColor: Record<string, string> = {
    seminar: 'bg-purple-100 text-purple-700',
    contact: 'bg-blue-100 text-blue-700',
    form: 'bg-green-100 text-green-700',
    website: 'bg-orange-100 text-orange-700',
    manual: 'bg-gray-100 text-gray-600',
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">ระบบข่าวสาร</h1>
            <p className="text-sm text-gray-500 mt-1">ส่งข่าวถึงผู้สนใจผ่าน Email และ LINE — เพิ่มอัตโนมัติเมื่อมีคนลงทะเบียน</p>
          </div>
          <div className="flex gap-3">
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
              <Mail className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-700">{total} Email</span>
            </div>
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
              <MessageCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-semibold text-green-700">{lineCount} LINE ID</span>
            </div>
          </div>
        </div>

        {/* Info banner */}
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-800">
          ✅ <b>Auto-collect:</b> เมื่อมีคนกรอกฟอร์มลงทะเบียน, ติดต่อ หรือสมัครงานสัมมนา — ระบบจะเพิ่มเป็นผู้รับข่าวอัตโนมัติทันที (รวม Email + LINE ID + เบอร์โทร)
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit flex-wrap">
          {([
            { key: 'email', label: '📧 ส่ง Email' },
            { key: 'line', label: '💬 ส่ง LINE' },
            { key: 'subscribers', label: '👥 ผู้รับทั้งหมด' },
            { key: 'history', label: '📋 ประวัติ' },
          ] as const).map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.key ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Email Tab ── */}
        {tab === 'email' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">หัวข้ออีเมล</label>
              <input value={subject} onChange={e => setSubject(e.target.value)}
                placeholder="เช่น โปรโมชั่นพิเศษ เดือนสิงหาคม! 🎉"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">เนื้อหา (รองรับ HTML)</label>
              <textarea value={body} onChange={e => setBody(e.target.value)} rows={12}
                placeholder={`<p>สวัสดีครับ/ค่ะ,</p>\n<p>เรามีข่าวดีมาแจ้ง...</p>`}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none resize-y" />
              <p className="text-xs text-gray-400 mt-1">รองรับ HTML เช่น &lt;b&gt;, &lt;p&gt;, &lt;a href="..."&gt;, &lt;img&gt;</p>
            </div>
            {body && (
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 text-xs font-medium text-gray-500 border-b flex items-center gap-2">
                  <Mail className="h-3 w-3" /> Preview
                </div>
                <div className="p-4 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: body }} />
              </div>
            )}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                จะส่งถึง <span className="font-semibold text-gray-900">{total} คน</span>
                {total === 0 && <span className="text-amber-600 ml-2">— ยังไม่มีผู้รับ</span>}
              </p>
              <Button onClick={() => setConfirmSend(true)} disabled={!subject.trim() || !body.trim() || total === 0}>
                <Send className="h-4 w-4 mr-2" /> ส่ง Email
              </Button>
            </div>
          </div>
        )}

        {/* ── LINE Tab ── */}
        {tab === 'line' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
              <div className="flex items-start gap-3 bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
                <MessageCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div>
                  <b>วิธีส่ง LINE:</b>
                  <ul className="mt-1 space-y-1 list-disc list-inside">
                    <li>ถ้ามี <b>LINE OA Token</b> (ตั้งใน Settings → line_oa_token) — จะ Broadcast ถึงผู้ติดตาม LINE OA ทั้งหมด</li>
                    <li>ระบบจะแสดง LINE ID ของผู้ลงทะเบียนให้ copy ไปส่งเองผ่าน LINE ได้</li>
                    <li>Admin จะได้รับแจ้งเตือนผ่าน LINE Notify ด้วย</li>
                  </ul>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ข้อความ LINE</label>
                <textarea value={lineMsg} onChange={e => setLineMsg(e.target.value)} rows={6}
                  placeholder="พิมพ์ข้อความที่ต้องการส่งหาผู้รับ..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none resize-y" />
                <p className="text-xs text-gray-400 mt-1">ข้อความ plain text — รองรับ emoji</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  ผู้รับที่มี LINE ID: <span className="font-semibold text-green-700">{lineCount} คน</span>
                </p>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={copyLineIds} disabled={lineCount === 0}>
                    <Copy className="h-4 w-4 mr-1" /> Copy LINE IDs
                  </Button>
                  <Button onClick={() => lineMutation.mutate()} disabled={!lineMsg.trim() || lineMutation.isPending}
                    className="bg-green-600 hover:bg-green-700 text-white">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    {lineMutation.isPending ? 'กำลังส่ง...' : 'ส่งข่าวทาง LINE'}
                  </Button>
                </div>
              </div>
            </div>

            {/* LINE IDs list + result */}
            {(lineSent || lineCount > 0) && (
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-5 py-3 border-b bg-gray-50 flex items-center justify-between">
                  <h3 className="font-medium text-sm text-gray-700">LINE ID ของผู้รับ ({lineCount} คน)</h3>
                  <Button size="sm" variant="ghost" onClick={copyLineIds}>
                    <Copy className="h-3.5 w-3.5 mr-1" /> Copy ทั้งหมด
                  </Button>
                </div>
                <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
                  {subscribers.filter(s => s.lineId).map(s => (
                    <div key={s.id} className="px-5 py-2.5 flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-gray-800">{s.name || '—'}</span>
                        <span className="ml-2 text-xs text-gray-400">{s.phone || ''}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-green-700 font-mono">{s.lineId}</span>
                        <a href={`https://line.me/R/ti/p/${s.lineId?.startsWith('@') ? s.lineId : `~${s.lineId}`}`}
                          target="_blank" rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-800">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                  {lineCount === 0 && (
                    <div className="px-5 py-8 text-center text-gray-400 text-sm">
                      ยังไม่มี LINE ID — รอผู้ลงทะเบียนระบุ LINE ID ในฟอร์ม
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Subscribers Tab ── */}
        {tab === 'subscribers' && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4 mr-1" /> เพิ่มผู้รับ
              </Button>
              <Button variant="outline" onClick={() => importMutation.mutate()} disabled={importMutation.isPending}>
                <Download className="h-4 w-4 mr-1" />
                {importMutation.isPending ? 'กำลังนำเข้า...' : 'นำเข้าจากฟอร์ม & ติดต่อ'}
              </Button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">ชื่อ / อีเมล</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">เบอร์โทร</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 text-green-700">LINE ID</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">แหล่งที่มา</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">วันที่</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {subsLoading ? (
                    <tr><td colSpan={6} className="text-center py-8 text-gray-400">กำลังโหลด...</td></tr>
                  ) : subscribers.length === 0 ? (
                    <tr><td colSpan={6} className="py-12 text-center text-gray-400">
                      <Users className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      <p>ยังไม่มีผู้รับ</p>
                      <p className="text-xs mt-1">กด "นำเข้าจากฟอร์ม & ติดต่อ" หรือรอผู้ลงทะเบียนใหม่</p>
                    </td></tr>
                  ) : subscribers.map(sub => (
                    <tr key={sub.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{sub.name || '—'}</p>
                        <p className="text-xs text-gray-500">{sub.email}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{sub.phone || '—'}</td>
                      <td className="px-4 py-3">
                        {sub.lineId ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-green-700 font-mono text-xs">{sub.lineId}</span>
                            <a href={`https://line.me/R/ti/p/${sub.lineId.startsWith('@') ? sub.lineId : `~${sub.lineId}`}`}
                              target="_blank" rel="noopener noreferrer" className="text-green-500 hover:text-green-700">
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        ) : <span className="text-gray-300 text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${sourceColor[sub.source] ?? 'bg-gray-100 text-gray-600'}`}>
                          {sub.source}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{formatDateTime(sub.createdAt)}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => deleteMutation.mutate(sub.id)} className="text-gray-400 hover:text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── History Tab ── */}
        {tab === 'history' && (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">หัวข้อ</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">สถานะ</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">ส่งถึง</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">ส่งโดย</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">วันที่ส่ง</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {campLoading ? (
                  <tr><td colSpan={5} className="text-center py-8 text-gray-400">กำลังโหลด...</td></tr>
                ) : !campaigns || campaigns.length === 0 ? (
                  <tr><td colSpan={5} className="py-12 text-center text-gray-400">
                    <Clock className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p>ยังไม่มีประวัติการส่ง</p>
                  </td></tr>
                ) : (campaigns as Campaign[]).map(c => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">{c.subject}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1">{statusIcon(c.status)}<span className="text-xs text-gray-600 capitalize">{c.status}</span></span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{c.recipientCount} คน</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{c.createdBy || '—'}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{c.sentAt ? formatDateTime(c.sentAt) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirm Send Email Modal */}
      <Modal open={confirmSend} onClose={() => setConfirmSend(false)} title="ยืนยันการส่ง Email">
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-xl p-4 space-y-1">
            <p className="text-sm text-blue-800"><span className="font-bold">หัวข้อ:</span> {subject}</p>
            <p className="text-sm text-blue-700">จะส่งถึง <span className="font-bold">{total} คน</span> ทันที</p>
          </div>
          <p className="text-sm text-gray-500">การส่งไม่สามารถยกเลิกได้หลังกด "ส่งเลย"</p>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setConfirmSend(false)}>ยกเลิก</Button>
            <Button onClick={() => sendMutation.mutate()} disabled={sendMutation.isPending}>
              <Send className="h-4 w-4 mr-2" />
              {sendMutation.isPending ? 'กำลังส่ง...' : 'ส่งเลย'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Subscriber Modal */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="เพิ่มผู้รับข่าวสาร">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล *</label>
              <input value={newEmail} onChange={e => setNewEmail(e.target.value)} type="email"
                placeholder="email@example.com"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ</label>
              <input value={newName} onChange={e => setNewName(e.target.value)}
                placeholder="ชื่อ-นามสกุล"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรศัพท์</label>
              <input value={newPhone} onChange={e => setNewPhone(e.target.value)} type="tel"
                placeholder="08X-XXX-XXXX"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-green-700">LINE ID</label>
              <input value={newLineId} onChange={e => setNewLineId(e.target.value)}
                placeholder="@lineid หรือ lineid"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="outline" onClick={() => setShowAddModal(false)}>ยกเลิก</Button>
            <Button onClick={() => addSubscriberMutation.mutate()} disabled={!newEmail || addSubscriberMutation.isPending}>
              เพิ่มผู้รับ
            </Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}
