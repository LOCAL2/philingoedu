import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { settingsApi } from '@/lib/api';
import { useToast } from '@/hooks/useToast';
import { PageLoader } from '@/components/ui/LoadingSpinner';

interface TrackingSettingsForm {
  seo_title: string;
  seo_description: string;
  facebook_pixel_id: string;
  google_tag_id: string;
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="border-b border-gray-200 pb-2 mb-4">
      <h3 className="font-semibold text-gray-900">{title}</h3>
    </div>
  );
}

export function TrackingSettingsPage() {
  const { toast } = useToast();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.get,
  });

  const { register, handleSubmit, formState: { isSubmitting } } = useForm<TrackingSettingsForm>({
    values: settings
      ? {
          seo_title: settings.seo_title ?? '',
          seo_description: settings.seo_description ?? '',
          facebook_pixel_id: settings.facebook_pixel_id ?? '',
          google_tag_id: settings.google_tag_id ?? '',
        }
      : undefined,
  });

  const saveMutation = useMutation({
    mutationFn: (form: TrackingSettingsForm) =>
      settingsApi.saveBatch(Object.fromEntries(Object.entries(form).filter(([, v]) => v != null)) as Record<string, string>),
    onSuccess: () => toast('บันทึกตั้งค่าสำเร็จ', 'success'),
    onError: (e) => toast(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด', 'error'),
  });

  if (isLoading) return <AdminLayout title="SEO & โค้ดติดตาม"><PageLoader /></AdminLayout>;

  return (
    <AdminLayout title="SEO & โค้ดติดตาม">
      <form onSubmit={handleSubmit((d) => saveMutation.mutate(d))} className="max-w-2xl space-y-6">
        {/* SEO Section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <SectionTitle title="การตั้งค่า SEO (Search Engine Optimization)" />
          <div className="space-y-4">
            <Input label="SEO Title (หัวข้อเว็บไซต์ที่แสดงบน Google)" {...register('seo_title')} />
            <Textarea label="SEO Description (คำอธิบายเว็บไซต์ที่แสดงบน Google)" rows={3} {...register('seo_description')} />
          </div>
        </div>

        {/* Tracking Tags Section - Made highly visible */}
        <div className="bg-blue-50 rounded-xl border-2 border-blue-400 shadow-md p-6 relative overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-100 rounded-full opacity-50 pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6 border-b border-blue-200 pb-4">
              <div className="bg-blue-600 p-2.5 rounded-lg text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"/><path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-blue-900">ช่องใส่ Pixel และ Google Tag (Tracking Tags)</h2>
                <p className="text-sm text-blue-700 mt-1">
                  เมื่อระบุ ID ระบบจะติดตั้งโค้ดบนหน้าเว็บไซต์ทุกหน้าให้อัตโนมัติ (ไม่ต้องเขียนโค้ดเอง)
                </p>
              </div>
            </div>
            
            <div className="space-y-5 bg-white p-5 rounded-lg border border-blue-100 shadow-sm">
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1.5 flex items-center gap-2">
                  <span className="text-blue-600">🟦</span> Facebook Pixel ID
                </label>
                <Input 
                  placeholder="ตัวเลขล้วน เช่น 123456789012345" 
                  {...register('facebook_pixel_id')} 
                  className="border-gray-300 focus:border-blue-500 text-lg py-5"
                />
                <p className="text-xs text-gray-500 mt-1.5 ml-1">
                  * ใส่เฉพาะตัวเลข ID เท่านั้น ระบบจะครอบโค้ด Facebook Pixel ให้เอง
                </p>
              </div>
              
              <div className="pt-2">
                <label className="block text-sm font-bold text-gray-800 mb-1.5 flex items-center gap-2">
                  <span className="text-yellow-500">🟧</span> Google Ads / Google Analytics Tag ID
                </label>
                <Input 
                  placeholder="เช่น AW-123456789 หรือ G-XXXXXXX" 
                  {...register('google_tag_id')} 
                  className="border-gray-300 focus:border-blue-500 text-lg py-5"
                />
                <p className="text-xs text-gray-500 mt-1.5 ml-1">
                  * ใส่รหัสที่ขึ้นต้นด้วย AW- หรือ G- ได้เลย ระบบจะติดตั้ง gtag.js ให้อัตโนมัติ
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" size="lg" loading={saveMutation.isPending || isSubmitting}>
            บันทึกการตั้งค่า
          </Button>
        </div>
      </form>
    </AdminLayout>
  );
}
