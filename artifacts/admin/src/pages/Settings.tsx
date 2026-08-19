import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { settingsApi, api } from '@/lib/api';
import { useToast } from '@/hooks/useToast';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { MultiImageUpload } from '@/components/ui/MultiImageUpload';
import { KeyRound, Eye, EyeOff, ShieldOff, Shield } from 'lucide-react';

// Sessions for Education Fair meet-link inputs
const SEMINAR_SESSIONS = [
  { key: 'meet_2026-09-06-pm'      as const, date: 'อาทิตย์ 6 ก.ย. 2569',    school: "B'Cebu",           time: '14:00–15:00 น.', emoji: '🇵🇭' },
  { key: 'meet_2026-08-29-pm'      as const, date: 'เสาร์ 29 ส.ค. 2569',    school: 'Philinter Academy', time: '14:00–15:00 น.', emoji: '🌿' },
  { key: 'meet_2026-08-30-am'      as const, date: 'อาทิตย์ 30 ส.ค. 2569',  school: 'EV Academy',        time: '10:00–11:00 น.', emoji: '🎓' },
  { key: 'meet_2026-09-05-am'      as const, date: 'เสาร์ 5 ก.ย. 2569',     school: 'CPILS',             time: '10:00–11:00 น.', emoji: '🏫' },
  { key: 'meet_2026-09-05-pm'      as const, date: 'เสาร์ 5 ก.ย. 2569',     school: 'I.BREEZE',          time: '14:00–15:00 น.', emoji: '🌊' },
  { key: 'meet_2026-09-06-am'      as const, date: 'อาทิตย์ 6 ก.ย. 2569',   school: 'QQ English',        time: '10:00–11:00 น.', emoji: '📘' },
  { key: 'meet_2026-09-12-special' as const, date: 'เสาร์ 12 ก.ย. 2569 ✨',  school: 'CIA (รอบพิเศษ)',   time: '10:30 น. เป็นต้นไป', emoji: '⭐' },
] as const;

const DEFAULT_HERO_AVATARS = [
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=120&h=120&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=120&h=120&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&h=120&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&h=120&fit=crop&crop=faces',
];

const DEFAULT_TESTIMONIAL_AVATARS = [
  'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=120&h=120&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=120&h=120&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&h=120&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&h=120&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&h=120&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&h=120&fit=crop&crop=faces'
];

interface SettingsForm {
  site_name: string;
  site_description: string;
  contact_email: string;
  phone: string;
  address: string;
  facebook_url: string;
  messenger_url: string;
  line_id: string;
  line_url: string;
  instagram_url: string;
  tiktok_url: string;
  youtube_url: string;
  seo_title: string;
  seo_description: string;
  // Tracking & Ads
  facebook_pixel_id: string;
  google_tag_id: string;
  // Notification settings
  notification_email: string;
  line_notify_token: string;
  // Education Fair — per-session Google Meet links
  seminar_meet_link: string; // fallback / "all sessions"
  'meet_2026-08-29-pm': string;
  'meet_2026-08-30-am': string;
  'meet_2026-09-05-am': string;
  'meet_2026-09-05-pm': string;
  'meet_2026-09-06-am': string;
  'meet_2026-09-06-pm': string;
  'meet_2026-09-12-special': string;
  // Event auto-reply email
  event_reply_subject: string;
  event_reply_body: string;
  // Site protection
  image_protection: string;
  hero_student_avatars: string;
  home_testimonial_avatars: string;
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="border-b border-gray-200 pb-2 mb-4">
      <h3 className="font-semibold text-gray-900">{title}</h3>
    </div>
  );
}

export function SettingsPage() {
  const { toast } = useToast();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.get,
  });

  const { register, handleSubmit, watch, setValue, formState: { isSubmitting } } = useForm<SettingsForm>({
    values: settings
      ? {
          site_name: settings.site_name ?? '',
          site_description: settings.site_description ?? '',
          contact_email: settings.contact_email ?? '',
          phone: settings.phone ?? '',
          address: settings.address ?? '',
          facebook_url: settings.facebook_url ?? '',
          messenger_url: settings.messenger_url ?? '',
          line_id: settings.line_id ?? '',
          line_url: settings.line_official_add_url || settings.line_url || '',
          instagram_url: settings.instagram_url ?? '',
          tiktok_url: settings.tiktok_url ?? '',
          youtube_url: settings.youtube_url ?? '',
          seo_title: settings.seo_title ?? '',
          seo_description: settings.seo_description ?? '',
          facebook_pixel_id: settings.facebook_pixel_id ?? '',
          google_tag_id: settings.google_tag_id ?? '',
          notification_email: settings.notification_email ?? '',
          line_notify_token: settings.line_notify_token ?? '',
          seminar_meet_link: settings.seminar_meet_link ?? '',
          'meet_2026-08-29-pm':      settings['meet_2026-08-29-pm'] ?? '',
          'meet_2026-08-30-am':      settings['meet_2026-08-30-am'] ?? '',
          'meet_2026-09-05-am':      settings['meet_2026-09-05-am'] ?? '',
          'meet_2026-09-05-pm':      settings['meet_2026-09-05-pm'] ?? '',
          'meet_2026-09-06-am':      settings['meet_2026-09-06-am'] ?? '',
          'meet_2026-09-06-pm':      settings['meet_2026-09-06-pm'] ?? '',
          'meet_2026-09-12-special': settings['meet_2026-09-12-special'] ?? '',
          event_reply_subject: settings.event_reply_subject ?? '',
          event_reply_body: settings.event_reply_body ?? '',
          image_protection: settings.image_protection ?? 'off',
          hero_student_avatars: settings.hero_student_avatars && settings.hero_student_avatars !== '[]' ? settings.hero_student_avatars : JSON.stringify(DEFAULT_HERO_AVATARS),
          home_testimonial_avatars: settings.home_testimonial_avatars && settings.home_testimonial_avatars !== '[]' ? settings.home_testimonial_avatars : JSON.stringify(DEFAULT_TESTIMONIAL_AVATARS),
        }
      : undefined,
  });

  const saveMutation = useMutation({
    mutationFn: (form: SettingsForm) =>
      settingsApi.saveBatch(Object.fromEntries(Object.entries(form).filter(([, v]) => v != null)) as Record<string, string>),
    onSuccess: () => toast('บันทึกตั้งค่าสำเร็จ', 'success'),
    onError: (e) => toast(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด', 'error'),
  });

  if (isLoading) return <AdminLayout title="ตั้งค่า"><PageLoader /></AdminLayout>;

  return (
    <AdminLayout title="ตั้งค่าระบบ">
      <form onSubmit={handleSubmit((d) => saveMutation.mutate(d))} className="max-w-2xl space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <SectionTitle title="ข้อมูลทั่วไป" />
          <div className="space-y-4">
            <Input label="ชื่อเว็บไซต์" {...register('site_name')} />
            <Textarea label="คำอธิบายเว็บไซต์" rows={2} {...register('site_description')} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="อีเมลติดต่อ" type="email" {...register('contact_email')} />
              <Input label="เบอร์โทรศัพท์" {...register('phone')} />
            </div>
            <Textarea label="ที่อยู่" rows={2} {...register('address')} />
            <div>
              <MultiImageUpload
                label="รูปนักเรียนในหน้าแรก (Hero Section)"
                category="other"
                existingUrls={(() => {
                  try { return JSON.parse(watch('hero_student_avatars')); } catch { return []; }
                })()}
                onUrlsChange={urls => setValue('hero_student_avatars', JSON.stringify(urls), { shouldDirty: true })}
                maxFiles={4}
                hint="อัปโหลดได้สูงสุด 4 รูป (แสดงผลทับซ้อนกันในหน้าแรก)"
              />
              <input type="hidden" {...register('hero_student_avatars')} />
            </div>
            <div className="pt-2 border-t border-gray-100">
              <MultiImageUpload
                label="รูปโปรไฟล์นักเรียนในส่วน รีวิวหน้าแรก"
                category="other"
                existingUrls={(() => {
                  try { return JSON.parse(watch('home_testimonial_avatars')); } catch { return []; }
                })()}
                onUrlsChange={urls => setValue('home_testimonial_avatars', JSON.stringify(urls), { shouldDirty: true })}
                maxFiles={6}
                hint="อัปโหลดเรียงตามลำดับรีวิวในหน้าแรก (สูงสุด 6 รูป)"
              />
              <input type="hidden" {...register('home_testimonial_avatars')} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <SectionTitle title="โซเชียลมีเดีย" />
          <div className="space-y-4">
            <Input label="Facebook URL" placeholder="https://facebook.com/philingo.th" {...register('facebook_url')} />
            <Input label="Messenger URL" placeholder="https://m.me/philingo.th" {...register('messenger_url')} />
            <Input label="LINE ID (ไอดีส่วนตัวหรือ @handle)" placeholder="@philingo" {...register('line_id')} />
            <Input
              label="LINE Official — ลิงก์เพิ่มเพื่อน"
              placeholder="https://line.me/R/ti/p/@philingo หรือ https://lin.ee/xxxxx"
              {...register('line_url')}
            />
            <p className="text-xs text-gray-400 -mt-2">ลิงก์นี้จะแสดงบนหน้า "ขอบคุณ" และหน้าสัมมนา เพื่อให้นักเรียน Add LINE Official อัตโนมัติหลังลงทะเบียน</p>
            <Input label="Instagram URL" placeholder="https://instagram.com/..." {...register('instagram_url')} />
            <Input label="TikTok URL" placeholder="https://tiktok.com/@..." {...register('tiktok_url')} />
            <Input label="YouTube URL" placeholder="https://youtube.com/@..." {...register('youtube_url')} />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <SectionTitle title="SEO & Tracking" />
          <div className="space-y-4">
            <Input label="SEO Title" {...register('seo_title')} />
            <Textarea label="SEO Description" rows={3} {...register('seo_description')} />
            
            <div className="pt-4 border-t border-gray-100">
              <h4 className="text-sm font-semibold text-gray-800 mb-3">โค้ดติดตาม (Tracking Tags)</h4>
              <div className="space-y-3">
                <Input 
                  label="Facebook Pixel ID" 
                  placeholder="ตัวเลข เช่น 1234567890" 
                  {...register('facebook_pixel_id')} 
                />
                <Input 
                  label="Google Ads / Tag ID" 
                  placeholder="เช่น AW-123456789 หรือ G-XXXXXXX" 
                  {...register('google_tag_id')} 
                />
                <p className="text-xs text-gray-400">เมื่อระบุ ID ระบบจะติดตั้งโค้ดบนหน้าเว็บไซต์ให้อัตโนมัติ</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <SectionTitle title="🎓 Education Fair — Google Meet Links ตามสถาบัน" />
          <p className="text-sm text-gray-500 mb-5">
            ใส่ลิงก์ Google Meet แยกตามวัน/สถาบัน — ระบบจะส่งลิงก์ที่ถูกต้องในอีเมลยืนยันให้ผู้ลงทะเบียนอัตโนมัติทันที
          </p>
          <div className="space-y-3">
            {SEMINAR_SESSIONS.map(s => (
              <div key={s.key} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                <p className="text-xs font-semibold text-gray-600 mb-1.5">
                  {s.emoji} {s.date} · <span className="text-primary">{s.school}</span>
                  <span className="ml-2 text-gray-400 font-normal">({s.time})</span>
                </p>
                <Input
                  placeholder="https://meet.google.com/xxx-xxxx-xxx"
                  {...register(s.key as SessionKey)}
                />
              </div>
            ))}

            <div className="mt-2 pt-4 border-t border-dashed border-gray-200">
              <p className="text-xs font-semibold text-gray-500 mb-2">🔁 ลิงก์สำรอง (สำหรับผู้ที่เลือก "ต้องการเข้าทุก session")</p>
              <Input
                placeholder="https://meet.google.com/xxx-xxxx-xxx"
                {...register('seminar_meet_link')}
              />
              <p className="text-xs text-gray-400 mt-1">
                ถ้าผู้ลงทะเบียนไม่ได้เลือก session เฉพาะ ระบบจะใช้ลิงก์นี้แทน
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <SectionTitle title="📬 การแจ้งเตือน (Notifications)" />
          <div className="space-y-4">
            {/* Step 1 — recipient email */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-blue-800 mb-3">ขั้นตอนที่ 1 — ใส่อีเมลที่ต้องการรับแจ้งเตือน</p>
              <Input
                label="อีเมลผู้รับแจ้งเตือน"
                type="email"
                placeholder="team@philingo.com"
                {...register('notification_email')}
              />
              <p className="text-xs text-gray-500 mt-2">เมื่อมีนักเรียนกรอกแบบฟอร์ม ลงทะเบียนงาน หรือส่งข้อความ ระบบจะส่งเมลมาที่นี่</p>
            </div>

            {/* Step 2 — Resend API key instructions */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-amber-800 mb-2">ขั้นตอนที่ 2 — ตั้งค่า Resend API Key (ครั้งเดียว)</p>
              <ol className="text-xs text-amber-700 space-y-1 mb-3 list-decimal list-inside">
                <li>สมัครฟรีที่ <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="underline font-medium">resend.com</a></li>
                <li>ไปที่เมนู <b>API Keys</b> → สร้าง key ใหม่</li>
                <li>คัดลอก key (ขึ้นต้นด้วย <code className="bg-amber-100 px-1 rounded">re_</code>)</li>
                <li>แจ้งให้ทีม Philingo ใส่ key ไว้ใน Secrets ของ Replit ชื่อ <code className="bg-amber-100 px-1 rounded">RESEND_API_KEY</code></li>
              </ol>
              <p className="text-xs text-amber-600">✅ เมื่อตั้งค่าแล้ว ไม่ต้องทำซ้ำ — แค่เปลี่ยนอีเมลผู้รับข้างบนได้เลย</p>
            </div>

            {/* LINE Notify */}
            <Input
              label="LINE Notify Token (ทางเลือก)"
              placeholder="วางโทเคนจาก notify-bot.line.me"
              {...register('line_notify_token')}
            />
            <p className="text-xs text-gray-400 -mt-2">
              รับ Token ฟรีที่{' '}
              <a href="https://notify-bot.line.me/my/" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                notify-bot.line.me
              </a>{' '}
              — แจ้งเตือนเข้า LINE ทันทีเมื่อมีฟอร์มใหม่
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <SectionTitle title="📧 อีเมลตอบอัตโนมัติ — กิจกรรม (Event Auto-reply)" />
          <p className="text-xs text-gray-400 mb-4">
            เมื่อผู้เข้าร่วมลงทะเบียนกิจกรรมและใส่อีเมลไว้ ระบบจะส่งอีเมลนี้ให้อัตโนมัติ
            · ใช้ตัวแปร: <code className="bg-gray-100 px-1 rounded">{'{{name}}'}</code>
            <code className="bg-gray-100 px-1 rounded ml-1">{'{{event_title}}'}</code>
            <code className="bg-gray-100 px-1 rounded ml-1">{'{{event_date}}'}</code>
            <code className="bg-gray-100 px-1 rounded ml-1">{'{{event_time}}'}</code>
            <code className="bg-gray-100 px-1 rounded ml-1">{'{{venue}}'}</code>
            <code className="bg-gray-100 px-1 rounded ml-1">{'{{meet_url}}'}</code>
          </p>
          <div className="space-y-4">
            <Input
              label="หัวข้ออีเมล (Subject)"
              placeholder="ยืนยันการลงทะเบียน: {{event_title}}"
              {...register('event_reply_subject')}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                เนื้อหาอีเมล (HTML) — ถ้าว่างจะใช้ template เริ่มต้น
              </label>
              <textarea
                rows={8}
                placeholder={`<p>สวัสดีคุณ {{name}},</p>\n<p>ยืนยันการลงทะเบียน <b>{{event_title}}</b></p>\n<p>วันที่: {{event_date}} · {{event_time}}</p>\n<p>ลิงก์เข้าร่วม: {{meet_url}}</p>`}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none resize-y"
                {...register('event_reply_body')}
              />
              <p className="text-xs text-gray-400 mt-1">วางไว้ว่างเพื่อใช้ template สวยงามที่เตรียมไว้แล้ว</p>
            </div>
          </div>
        </div>

        {/* Image Protection */}
        <ImageProtectionCard watch={watch} setValue={setValue} register={register} />

        <div className="flex justify-end">
          <Button type="submit" size="lg" loading={saveMutation.isPending || isSubmitting}>
            บันทึกการตั้งค่าทั้งหมด
          </Button>
        </div>
      </form>

      {/* ── Change Password (separate form) ── */}
      <ChangePasswordCard />
    </AdminLayout>
  );
}

function ImageProtectionCard({ watch, setValue, register }: { watch: any; setValue: any; register: any }) {
  const val = watch('image_protection') ?? 'off';
  const isOn = val === 'on';
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <SectionTitle title="🔒 ป้องกันการคัดลอกรูปภาพ" />
      <p className="text-sm text-gray-500 mb-4">
        เมื่อเปิด ผู้เยี่ยมชมจะไม่สามารถคลิกขวาบันทึกรูปภาพ หรือลากรูปออกจากหน้าเว็บได้
        (ป้องกันได้ระดับหนึ่ง — ไม่ใช่การป้องกันแบบสมบูรณ์)
      </p>
      <button
        type="button"
        onClick={() => setValue('image_protection', isOn ? 'off' : 'on', { shouldDirty: true })}
        className={`flex items-center gap-3 px-5 py-3 rounded-xl font-semibold text-sm border-2 transition-all ${
          isOn
            ? 'bg-green-50 border-green-500 text-green-700'
            : 'bg-gray-50 border-gray-300 text-gray-500 hover:border-gray-400'
        }`}
      >
        {isOn ? <Shield className="w-5 h-5" /> : <ShieldOff className="w-5 h-5" />}
        {isOn ? 'เปิดอยู่ — คลิกเพื่อปิด' : 'ปิดอยู่ — คลิกเพื่อเปิด'}
      </button>
      {/* Hidden input keeps the field registered with react-hook-form */}
      <input type="hidden" {...register('image_protection')} />
    </div>
  );
}

function ChangePasswordCard() {
  const { toast } = useToast();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<{
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }>();

  const onSubmit = async (data: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
    if (data.newPassword !== data.confirmPassword) {
      toast('รหัสผ่านใหม่ไม่ตรงกัน', 'error'); return;
    }
    try {
      await api.post('/admin-users/me/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast('เปลี่ยนรหัสผ่านสำเร็จ ✅', 'success');
      reset();
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด', 'error');
    }
  };

  const inp = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none';

  return (
    <div className="max-w-2xl mt-8">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center gap-2 border-b border-gray-200 pb-3 mb-5">
          <KeyRound className="h-5 w-5 text-gray-500" />
          <h3 className="font-semibold text-gray-900">เปลี่ยนรหัสผ่าน</h3>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Current password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่านปัจจุบัน</label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                placeholder="••••••••"
                className={inp + ' pr-10'}
                {...register('currentPassword', { required: 'กรุณาระบุรหัสผ่านปัจจุบัน' })}
              />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" onClick={() => setShowCurrent(v => !v)}>
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.currentPassword && <p className="text-xs text-red-500 mt-1">{errors.currentPassword.message}</p>}
          </div>

          {/* New password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่านใหม่</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                placeholder="อย่างน้อย 8 ตัวอักษร"
                className={inp + ' pr-10'}
                {...register('newPassword', { required: 'กรุณาระบุรหัสผ่านใหม่', minLength: { value: 8, message: 'อย่างน้อย 8 ตัวอักษร' } })}
              />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" onClick={() => setShowNew(v => !v)}>
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.newPassword && <p className="text-xs text-red-500 mt-1">{errors.newPassword.message}</p>}
          </div>

          {/* Confirm password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ยืนยันรหัสผ่านใหม่</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                placeholder="พิมพ์รหัสผ่านใหม่อีกครั้ง"
                className={inp + ' pr-10'}
                {...register('confirmPassword', {
                  required: 'กรุณายืนยันรหัสผ่าน',
                  validate: v => v === watch('newPassword') || 'รหัสผ่านไม่ตรงกัน',
                })}
              />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" onClick={() => setShowConfirm(v => !v)}>
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>}
          </div>

          <div className="flex justify-end pt-1">
            <Button type="submit" loading={isSubmitting}>เปลี่ยนรหัสผ่าน</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
