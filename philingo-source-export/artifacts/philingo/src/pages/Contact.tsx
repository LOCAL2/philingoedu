import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useSeoMeta } from '@/hooks/use-seo-meta';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { SiLine, SiFacebook, SiTiktok, SiInstagram, SiYoutube } from 'react-icons/si';
import { contactApi } from '@/lib/api';

export default function Contact() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', lineId: '', subject: 'ปรึกษาเรื่องหลักสูตรและโรงเรียน', message: '' });
  const [submittedForm, setSubmittedForm] = useState<typeof form | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [settings, setSettings] = useState<Record<string, string>>({});
  useSeoMeta(
    'ติดต่อเรา | Philingo — ที่ปรึกษาเรียนต่อฟิลิปปินส์',
    'ติดต่อทีม Philingo สำหรับคำแนะนำการเรียนต่อฟิลิปปินส์ ทาง LINE โทรศัพท์ หรืออีเมล บริการฟรีไม่มีค่าใช้จ่าย'
  );
  useEffect(() => {
    const BASE = (import.meta.env.BASE_URL ?? '').replace(/\/$/, '');
    fetch(`${BASE}/api/settings`, { cache: 'no-store' }).then(r => r.ok ? r.json() : {}).then(setSettings).catch(() => {});
  }, []);

  const lineAddUrl = settings.line_url || 'https://lin.ee/zmlkhOn0';
  const lineId     = settings.line_id  || '@philingo';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) return;
    setIsSubmitting(true);
    try {
      // รวม LINE ID เข้า message ในรูปแบบที่ API ดึงออกมาได้
      const fullMessage = [
        form.lineId ? `LINE ID: ${form.lineId}` : '',
        form.message,
      ].filter(Boolean).join('\n');
      await contactApi.send({
        name: form.name,
        email: form.email || '',
        phone: form.phone,
        subject: form.subject || '',
        message: fullMessage || '-',
      });
      setSubmittedForm({ ...form });
      setStatus('success');
    } catch {
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inp = "w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50";

  return (
    <Layout>
      <section className="bg-gray-50 dark:bg-gray-900/50 py-16">
        <div className="container max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">ติดต่อเรา (Contact Us)</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            ปรึกษาเรื่องเรียนต่อฟิลิปปินส์ฟรี ไม่มีค่าใช้จ่าย ทีมงานพร้อมให้คำแนะนำด้วยความจริงใจ
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            
            {/* Contact Info & Map */}
            <div className="space-y-8">
              <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">ช่องทางการติดต่อ</h2>
                
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                      <Phone className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">เบอร์โทรศัพท์</h3>
                      <p className="text-lg text-primary font-bold">{settings.phone || '061-656-4159'}</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                      <SiLine className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">LINE Official</h3>
                      <p className="text-lg text-[#00B900] font-bold">{settings.line_id || '@philingo'}</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">อีเมล</h3>
                      <p className="text-gray-600 dark:text-gray-400">{settings.contact_email}</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">ที่อยู่บริษัท</h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        บริษัท ไทย สตั๊ดดี้ อะบรอด คอนซัลแทนท์ จำกัด<br/>
                        88/27 The City Pinklao<br/>
                        แขวงศาลาธรรมสพ เขตทวีวัฒนา กรุงเทพฯ 10170
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center shrink-0">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">เวลาทำการ</h3>
                      <p className="text-gray-600 dark:text-gray-400">จันทร์ - ศุกร์ : 09:00 - 18:00 น.</p>
                      <p className="text-gray-600 dark:text-gray-400">เสาร์ : 09:00 - 15:00 น.</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-700">
                  <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">ติดตามเราผ่าน Social Media</h3>
                  <div className="flex gap-4">
                    <a href="#" className="w-10 h-10 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:scale-110 transition-transform"><SiFacebook className="w-5 h-5"/></a>
                    <a href="#" className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:scale-110 transition-transform"><SiTiktok className="w-5 h-5"/></a>
                    <a href="#" className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FD1D1D] to-[#833AB4] text-white flex items-center justify-center hover:scale-110 transition-transform"><SiInstagram className="w-5 h-5"/></a>
                    <a href="#" className="w-10 h-10 rounded-full bg-[#FF0000] text-white flex items-center justify-center hover:scale-110 transition-transform"><SiYoutube className="w-5 h-5"/></a>
                  </div>
                </div>
              </div>

              {/* Map Placeholder */}
              <div className="bg-gray-200 dark:bg-gray-800 rounded-3xl overflow-hidden h-[300px] relative border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 font-medium">Google Maps Widget</p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white dark:bg-gray-800 p-8 md:p-10 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 h-fit">
              <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">ฝากข้อความถึงเรา</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">เจ้าหน้าที่จะติดต่อกลับภายใน 24 ชั่วโมง</p>
              
              {status === 'success' && submittedForm ? (
                <div className="py-4">
                  {/* Header */}
                  <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-3">
                      <CheckCircle2 className="w-9 h-9 text-green-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">ส่งข้อมูลสำเร็จ! 🎉</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">ทีมงานจะติดต่อกลับภายใน 24 ชั่วโมง</p>
                  </div>

                  {/* Summary of submitted data */}
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 mb-5 text-sm space-y-2">
                    <p className="font-semibold text-gray-700 dark:text-gray-300 mb-3">📋 ข้อมูลที่คุณส่งมา</p>
                    {[
                      ['ชื่อ', submittedForm.name],
                      ['เบอร์โทร', submittedForm.phone],
                      ['อีเมล', submittedForm.email],
                      ['LINE ID', submittedForm.lineId],
                      ['เรื่อง', submittedForm.subject],
                      ['ข้อความ', submittedForm.message],
                    ].filter(([, v]) => v).map(([label, val]) => (
                      <div key={label} className="flex gap-2">
                        <span className="text-gray-500 dark:text-gray-400 w-24 shrink-0">{label}</span>
                        <span className="text-gray-800 dark:text-gray-200 font-medium break-all">{val}</span>
                      </div>
                    ))}
                  </div>

                  {/* LINE CTA */}
                  <div className="bg-[#00B900]/10 border border-[#00B900]/30 rounded-2xl p-4 mb-4 text-center">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">🎁 รับใบเสนอราคาและโปรโมชั่นพิเศษ</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">แอด LINE Official เพื่อรับใบเสนอราคา + โปรโมชั่นเฉพาะคุณทันที</p>
                    <a
                      href={lineAddUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 bg-[#00B900] hover:bg-[#00A000] text-white font-bold px-6 py-3 rounded-xl transition-all hover:scale-105 shadow-md w-full text-sm"
                    >
                      <SiLine className="w-5 h-5" />
                      แอด LINE Official รับใบเสนอราคา ({lineId})
                    </a>
                  </div>

                  <button
                    onClick={() => { setStatus('idle'); setSubmittedForm(null); }}
                    className="w-full text-sm text-gray-400 hover:text-primary transition-colors"
                  >
                    ส่งข้อความใหม่
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {status === 'error' && (
                    <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง
                    </div>
                  )}
                  <div className="grid md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-900 dark:text-gray-200">ชื่อ-นามสกุล <span className="text-red-500">*</span></label>
                      <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inp} placeholder="ระบุชื่อจริง" required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-900 dark:text-gray-200">เบอร์โทรศัพท์ <span className="text-red-500">*</span></label>
                      <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className={inp} placeholder="08X-XXX-XXXX" required />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-900 dark:text-gray-200">อีเมล</label>
                      <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={inp} placeholder="example@email.com" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-900 dark:text-gray-200">LINE ID</label>
                      <input type="text" value={form.lineId} onChange={e => setForm(f => ({ ...f, lineId: e.target.value }))} className={inp} placeholder="ระบุ LINE ID" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900 dark:text-gray-200">เรื่องที่ต้องการสอบถาม</label>
                    <select value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} className={inp}>
                      <option>ปรึกษาเรื่องหลักสูตรและโรงเรียน</option>
                      <option>ขอใบเสนอราคา (Quotation)</option>
                      <option>สอบถามเรื่องโปรโมชั่น</option>
                      <option>อื่นๆ</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900 dark:text-gray-200">ข้อความเพิ่มเติม</label>
                    <textarea rows={4} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} className={`${inp} resize-none`} placeholder="ระบุรายละเอียดเพิ่มเติมที่ต้องการให้เราช่วยเหลือ..." />
                  </div>
                  <button type="submit" disabled={isSubmitting} className="w-full bg-primary hover:bg-primary/90 disabled:opacity-60 text-white font-bold py-4 rounded-xl shadow-lg transition-transform hover:-translate-y-1 flex items-center justify-center gap-2">
                    {isSubmitting ? <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5" /> : <Send className="w-5 h-5" />}
                    {isSubmitting ? 'กำลังส่ง...' : 'ส่งข้อความ'}
                  </button>
                </form>
              )}
            </div>
            
          </div>
        </div>
      </section>
    </Layout>
  );
}
