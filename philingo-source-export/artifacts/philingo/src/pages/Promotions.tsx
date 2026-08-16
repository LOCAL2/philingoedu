import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { useSeoMeta } from '@/hooks/use-seo-meta';
import { useCountdown } from '@/hooks/use-countdown';
import { Gift, Clock, AlertCircle } from 'lucide-react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import cebuImg from '@assets/generated_images/cebu-1.jpg';
import campusImg from '@assets/generated_images/campus-1.jpg';
import classroomImg from '@assets/generated_images/classroom-1.jpg';

interface ApiPromo {
  id: number;
  titleTh: string;
  title: string;
  descriptionTh: string | null;
  description: string | null;
  originalPriceTh: string | null;
  discountPriceTh: string | null;
  seatsRemaining: number | null;
  bonusTh: string | null;
  expiresAt: string | null;
  imageUrl: string | null;
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: number;
}

const BASE = (import.meta.env.BASE_URL ?? '').replace(/\/$/, '');

function fetchPromos(): Promise<ApiPromo[]> {
  return fetch(`${BASE}/api/promotions?isActive=true&limit=100`)
    .then(r => r.ok ? r.json() : { data: [] })
    .then(d => (d.data ?? []) as ApiPromo[]);
}

export default function Promotions() {
  const { data: promos = [], isLoading } = useQuery<ApiPromo[]>({
    queryKey: ['promotions-public'],
    queryFn: fetchPromos,
    staleTime: 0,
  });
  useSeoMeta(
    'โปรโมชั่นพิเศษ เรียนฟิลิปปินส์ 2026 | Philingo',
    'รวมโปรโมชั่นและส่วนลดพิเศษสำหรับนักเรียนที่ต้องการเรียนภาษาอังกฤษที่ฟิลิปปินส์ ปี 2026 อัปเดตทุกเดือน'
  );

  return (
    <Layout>
      <section className="bg-red-50 dark:bg-red-900/10 py-16">
        <div className="container max-w-7xl mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-full font-bold mb-6">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            HOT DEALS
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">โปรโมชั่นพิเศษ</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            ประหยัดกว่าเมื่อจองล่วงหน้า จำนวนที่นั่งจำกัด!
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container max-w-7xl mx-auto px-4">

          {isLoading && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-red-100 dark:border-red-900/30 overflow-hidden animate-pulse h-80" />
              ))}
            </div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {!isLoading && promos.length > 0
              ? promos.map(promo => <PromoCardGrid key={promo.id} promo={promo} />)
              : !isLoading && (
                <>
                  <PromoCardGrid promo={{ id: 1, title: 'Cebu Summer Package', titleTh: 'Cebu Summer Package', description: '', descriptionTh: 'เรียนภาษาอังกฤษในเซบูพร้อมที่พักครบวงจร เหมาะสำหรับผู้เริ่มต้นถึงระดับกลาง', originalPriceTh: '65,000', discountPriceTh: '55,000', seatsRemaining: 5, expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), imageUrl: cebuImg, bonusTh: 'ฟรี! ค่าสมัครเรียน + คู่มือเตรียมตัว', isFeatured: true, isActive: true, sortOrder: 1 }} />
                  <PromoCardGrid promo={{ id: 2, title: 'IELTS Guarantee Course', titleTh: 'IELTS Guarantee Course', description: '', descriptionTh: 'การันตีคะแนน IELTS 6.0+ หรือเรียนต่อฟรี เหมาะสำหรับผู้ต้องการยื่นเรียนต่อ/วีซ่า', originalPriceTh: '89,000', discountPriceTh: '79,000', seatsRemaining: 2, expiresAt: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(), imageUrl: classroomImg, bonusTh: 'ฟรี! Mock Test 4 ครั้ง + เอกสารสมัครสอบ', isFeatured: false, isActive: true, sortOrder: 2 }} />
                  <PromoCardGrid promo={{ id: 3, title: 'General English 3 Months', titleTh: 'General English 3 เดือน', description: '', descriptionTh: 'หลักสูตรภาษาอังกฤษทั่วไป 3 เดือนครบวงจร ฟัง พูด อ่าน เขียน ครบทุกทักษะ', originalPriceTh: '120,000', discountPriceTh: '99,000', seatsRemaining: 10, expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), imageUrl: campusImg, bonusTh: 'ฟรี! ค่าธรรมเนียมวีซ่า + ประกันสุขภาพ 3 เดือน', isFeatured: false, isActive: true, sortOrder: 3 }} />
                </>
              )
            }
          </div>

        </div>
      </section>
    </Layout>
  );
}

function PromoCardGrid({ promo }: { promo: ApiPromo }) {
  const timeLeft = useCountdown(promo.expiresAt ?? '');

  return (
    <div className="bg-white/90 backdrop-blur-sm dark:bg-gray-800 rounded-2xl shadow-lg border border-red-100 dark:border-red-900/30 overflow-hidden flex flex-col group">
      {/* Image */}
      <div className="relative h-44 overflow-hidden bg-gray-100 dark:bg-gray-700">
        {promo.imageUrl ? (
          <img src={promo.imageUrl} alt={promo.titleTh} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">🎁</div>
        )}
        {promo.seatsRemaining != null && (
          <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> เหลือ {promo.seatsRemaining} ที่นั่ง
          </div>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {promo.titleTh || promo.title}
        </h3>

        {/* Price */}
        {(promo.discountPriceTh || promo.originalPriceTh) && (
          <div className="flex items-end gap-3 mb-3">
            {promo.discountPriceTh && (
              <span className="text-2xl font-black text-red-600 dark:text-red-400">฿{promo.discountPriceTh}</span>
            )}
            {promo.originalPriceTh && (
              <span className="text-gray-400 line-through text-sm mb-0.5">฿{promo.originalPriceTh}</span>
            )}
          </div>
        )}

        {(promo.descriptionTh || promo.description) && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
            {promo.descriptionTh || promo.description}
          </p>
        )}

        {promo.bonusTh && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/50 px-3 py-2 rounded-lg flex items-center gap-2 mb-3 text-xs">
            <Gift className="w-4 h-4 text-yellow-600 shrink-0" />
            <span className="text-yellow-800 dark:text-yellow-400">{promo.bonusTh}</span>
          </div>
        )}

        {/* Countdown */}
        {promo.expiresAt && (
          <div className="mt-auto bg-black/5 dark:bg-gray-900 p-3 rounded-xl border border-white/60 dark:border-gray-700 mb-4">
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1.5 text-center flex items-center justify-center gap-1">
              <Clock className="w-3 h-3" /> สิ้นสุดโปรโมชั่นในอีก
            </div>
            <div className="grid grid-cols-4 gap-1.5 text-center">
              {[{ v: timeLeft.days, l: 'วัน' }, { v: timeLeft.hours, l: 'ชม.' }, { v: timeLeft.minutes, l: 'นาที' }, { v: timeLeft.seconds, l: 'วิ', red: true }].map((it, i) => (
                <div key={i} className="bg-white/70 dark:bg-gray-800 rounded-lg p-1.5 shadow-sm">
                  <div className={`text-base font-bold ${it.red ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>{it.v}</div>
                  <div className="text-[9px] text-gray-400">{it.l}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Link
          href="/register"
          className="bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-xl text-center text-sm transition-transform hover:-translate-y-0.5 shadow-md shadow-primary/20 mt-auto"
        >
          ลงทะเบียนรับสิทธิ์
        </Link>
      </div>
    </div>
  );
}
