import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { useSeoMeta } from '@/hooks/use-seo-meta';
import { AdminEditSection } from '@/components/AdminOverlay';
import { useLanguage } from '@/lib/language-context';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { ArrowRight, CheckCircle2, Star, MapPin, Calendar, Users, Trophy, GraduationCap, Video, Gift, Clock, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCountdown } from '@/hooks/use-countdown';
import { useQuery } from '@tanstack/react-query';
import { useSettings } from '@/hooks/use-settings';
import { galleryApi, GalleryImage } from '@/lib/api';
import { PhotoGallery } from '@/components/PhotoGallery';

const BASE_URL_PREFIX = (import.meta.env.BASE_URL ?? '').replace(/\/$/, '');

interface ApiPromo {
  id: number;
  titleTh: string; title: string;
  descriptionTh?: string | null; description?: string | null;
  originalPriceTh?: string | null; discountPriceTh?: string | null;
  seatsRemaining?: number | null; expiresAt?: string | null;
  imageUrl?: string | null; bonusTh?: string | null;
  isFeatured?: boolean; isActive: boolean;
}

interface ApiBanner {
  id: number;
  titleTh?: string | null; title?: string | null;
  subtitleTh?: string | null; subtitle?: string | null;
  ctaTextTh?: string | null; ctaText?: string | null;
  ctaUrl?: string | null;
  imageUrl: string;
  isActive: boolean; sortOrder: number;
}

interface ApiEvent {
  id: number;
  titleTh: string;
  eventDate: string | null;
  eventTime: string | null;
  venueTh: string | null;
  eventType: string | null;
  ctaTextTh: string | null;
  ctaUrl: string | null;
  meetUrl?: string | null;
  isFeatured: boolean;
  isActive: boolean;
}

function formatThaiDate(iso: string): string {
  const months = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
  const d = new Date(iso + 'T00:00:00+07:00');
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear() + 543}`;
}

function formatEventTime(t: string | null): string {
  if (!t) return '';
  return t.replace('(เวลาไทย)', '').replace('(Thai time)', '').replace(' - ', '–').trim();
}

function formatVenue(venueTh: string | null, eventType: string | null): string {
  if (!venueTh && !eventType) return '';
  if (eventType === 'online' || venueTh?.toLowerCase().includes('google meet')) return 'Google Meet · Online';
  if (eventType === 'online') return 'Online';
  return venueTh ?? '';
}

function resolveCtaUrl(ctaUrl: string | null, meetUrl: string | null | undefined): string {
  if (!ctaUrl || ctaUrl === 'register free' || ctaUrl === '#') return '/seminars#register';
  if (ctaUrl.startsWith('http') || ctaUrl.startsWith('/')) return ctaUrl;
  return meetUrl || '/seminars#register';
}

// Images
import heroImg from '@assets/f798a378-eb90-40b3-8d5e-72231d967e0c_1785171375147.png';
import cebuImg from '@assets/generated_images/cebu-1.jpg';
import campusImg from '@assets/generated_images/campus-1.jpg';
import classroomImg from '@assets/generated_images/classroom-1.jpg';
import blog1 from '@assets/generated_images/blog-1.jpg';
import blog2 from '@assets/generated_images/blog-2.jpg';
import blog3 from '@assets/generated_images/blog-3.jpg';
import marketing1 from '@assets/ee6abb87-5291-4391-a40c-0b39c0c6777e_1785171375148.png';
import seminarBanner from '@assets/ChatGPT_Image_Aug_5,_2026,_01_22_01_PM_1786027729183.png';
import tiecaLogo from '@assets/image_1785227701433.png';
import tsabLogo from '@assets/image_1785230017503.png';

// School logos
import ciaLogo from '@assets/image_1785200711221.png';
import qqLogo from '@assets/image_1785200772068.png';
import philinterLogo from '@assets/image_1785200753254.png';
import bcebuLogo from '@assets/image_1785200917465.png';

// ── Hero avatar group (4 overlapping circles, Thai/Asian faces)
// TODO: เปลี่ยน URL ด้านล่างเป็นรูปภาพจริงของนักเรียนไทยได้เลย
const HERO_AVATARS = [
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=120&h=120&fit=crop&crop=faces', // นักเรียนไทย คนที่ 1 (หญิง)
  'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=120&h=120&fit=crop&crop=faces',    // นักเรียนไทย คนที่ 2 (ชาย)
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&h=120&fit=crop&crop=faces', // นักเรียนไทย คนที่ 3 (หญิง)
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&h=120&fit=crop&crop=faces', // นักเรียนไทย คนที่ 4 (ชาย)
];

// ── Homepage testimonials (Thai/Asian avatar photos)
// TODO: เปลี่ยน photo URL ตรงแต่ละรายการเป็นรูปจริงได้เลย
const reviews = [
  { id: 1, name: 'พี่นนท์', course: 'IELTS 12 Weeks', school: 'SMEAG, Cebu', text: 'ไปเรียน IELTS ที่เซบูได้ผลเกินคาดครับ จากตอนแรกสอบได้แค่ 4.5 เรียนไป 3 เดือนได้ 6.5 เลย ครูใส่ใจมาก สอนเจาะจุดอ่อนเราได้ตรงจุด บรรยากาศก็น่าเรียนมากครับ', rating: 5, photo: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=120&h=120&fit=crop&crop=faces' /* พี่นนท์ — เปลี่ยนได้ */ },
  { id: 2, name: 'น้องฟ้า', course: 'ESL 8 Weeks', school: 'CIA, Cebu', text: 'เรียน CIA Cebu ระบบ Semi Sparta ทำให้ใช้ภาษาอังกฤษตลอดเวลาค่ะ ตอนนี้กล้าพูดมากขึ้นเยอะเลย ขอบคุณ Philingo ที่แนะนำดีมากเลย', rating: 5, photo: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=120&h=120&fit=crop&crop=faces' /* น้องฟ้า — เปลี่ยนได้ */ },
  { id: 3, name: 'คุณเอก', course: 'Business English 4 Weeks', school: 'Philinter, Cebu', text: 'มีเวลาแค่เดือนเดียวเลยเลือกคอร์ส Business ที่ Philinter ครู Native สอนดีมาก ได้เทคนิคการเขียนอีเมลและนำเสนองานเยอะมากครับ', rating: 5, photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&h=120&fit=crop&crop=faces' /* คุณเอก — เปลี่ยนได้ */ },
  { id: 4, name: 'น้องบีม', course: 'ESL 12 Weeks', school: "B'Cebu, Cebu", text: "โรงเรียนสวยมาก แคมปัสใหม่ ห้องพักสะอาด เพื่อนต่างชาติเยอะ ได้ใช้ภาษาอังกฤษทั้งในและนอกห้องเรียน พี่ๆ Philingo ดูแลดีตั้งแต่วันสมัครจนบินกลับเลยค่ะ", rating: 5, photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&h=120&fit=crop&crop=faces' /* น้องบีม — เปลี่ยนได้ */ },
  { id: 5, name: 'แม่นุ่น', course: 'Family Program', school: 'CIA, Cebu', text: 'พาลูกไปเรียนช่วงปิดเทอม แม่เรียนคลาสเบาๆ ลูกก็สนุกมากกับครูที่ดูแลดี มีครูพี่เลี้ยงคอยช่วย สะดวกสบายมากค่ะ ปีหน้าจะไปอีกแน่นอน', rating: 5, photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&h=120&fit=crop&crop=faces' /* แม่นุ่น — เปลี่ยนได้ */ },
  { id: 6, name: 'พี่ป้อง', course: 'TOEIC 8 Weeks', school: 'CPILS, Cebu', text: 'ระบบจัดการดีมากครับ มีสอบ Mock Test ทุกสัปดาห์ทำให้รู้พัฒนาการของตัวเอง คะแนน TOEIC อัพขึ้นมา 300 คะแนนใน 2 เดือน คุ้มค่าเงินทุกบาทครับ', rating: 5, photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&h=120&fit=crop&crop=faces' /* พี่ป้อง — เปลี่ยนได้ */ },
];

// ── Gallery fallback images (hardcode เดิม — ใช้เมื่อ /api/gallery ยังว่าง)
const GALLERY_FALLBACK = [
  { imageUrl: heroImg,      titleTh: 'บรรยากาศนักเรียน Philingo' },
  { imageUrl: classroomImg, titleTh: 'ห้องเรียนภาษาอังกฤษที่ฟิลิปปินส์' },
  { imageUrl: blog3,        titleTh: 'กิจกรรมนักเรียน Philingo' },
  { imageUrl: campusImg,    titleTh: 'วิทยาเขตโรงเรียนสอนภาษาอังกฤษ' },
  { imageUrl: marketing1,   titleTh: 'ประสบการณ์เรียนฟิลิปปินส์' },
  { imageUrl: cebuImg,      titleTh: 'เมืองเซบู ฟิลิปปินส์' },
];

function GallerySection({ t }: { t: (key: string) => string }) {
  const { data, isError } = useQuery({
    queryKey: ['gallery-home'],
    queryFn: () => galleryApi.list(),
    staleTime: 0, // always fresh — admin uploads show immediately
  });

  const items: GalleryImage[] = data?.data ?? [];
  const displayItems = (isError || items.length === 0) ? GALLERY_FALLBACK : items;

  return (
    <section className="py-24 bg-transparent">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">{t('home.photo_gallery')}</h2>
          <p className="text-gray-600 dark:text-gray-400">บรรยากาศการเรียนและกิจกรรมของนักเรียนที่ฟิลิปปินส์</p>
        </div>

        <PhotoGallery
          items={displayItems}
          columns={{ mobile: 1, tablet: 2, desktop: 3 }}
        />
      </div>
    </section>
  );
}

export default function Home() {
  const { t } = useLanguage();
  const settings = useSettings();
  // Use Global SEO from admin site_settings; fall back to page-specific default if not set
  useSeoMeta(
    settings.seo_title  || 'Philingo — เรียนภาษาอังกฤษที่ฟิลิปปินส์ ที่ปรึกษาอันดับ 1 ของไทย',
    settings.seo_description || 'Philingo บริการที่ปรึกษาเรียนต่อฟิลิปปินส์สำหรับคนไทย ครบวงจรตั้งแต่เลือกโรงเรียน จองที่พัก รับโปรโมชั่น และดูแลตลอดการเรียน'
  );
  const lineUrl = settings.line_url || (settings.line_id ? `https://line.me/R/ti/p/${encodeURIComponent(settings.line_id)}` : 'https://lin.ee/nBR4rsN');
  const [activeReview, setActiveReview] = React.useState(0);
  const reviewsPerPage = 3;

  const { data: livePromos = [] } = useQuery<ApiPromo[]>({
    queryKey: ['home-promos'],
    queryFn: () =>
      fetch(`${BASE_URL_PREFIX}/api/promotions?isActive=true&limit=6`)
        .then(r => r.ok ? r.json() : { data: [] })
        .then(d => (d.data ?? []) as ApiPromo[]),
    staleTime: 60_000,
  });

  const { data: liveBanners = [] } = useQuery<ApiBanner[]>({
    queryKey: ['home-banners'],
    queryFn: () =>
      fetch(`${BASE_URL_PREFIX}/api/banners?isActive=true&limit=10`, { cache: 'no-store' })
        .then(r => r.ok ? r.json() : { data: [] })
        .then(d => (d.data ?? []) as ApiBanner[]),
    staleTime: 0,
  });

  const { data: featuredEvents = [] } = useQuery<ApiEvent[]>({
    queryKey: ['home-featured-event'],
    queryFn: () =>
      fetch(`${BASE_URL_PREFIX}/api/events?isActive=true&isFeatured=true&limit=1`)
        .then(r => r.ok ? r.json() : { data: [] })
        .then(d => (d.data ?? d) as ApiEvent[]),
    staleTime: 60_000,
  });

  const featuredEvent = featuredEvents[0] ?? null;
  // Always call useCountdown (hooks can't be conditional) — use far future if no event
  const FAR_FUTURE = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString();
  const eventCountdownTarget = featuredEvent?.eventDate
    ? `${featuredEvent.eventDate}T10:00:00+07:00`
    : FAR_FUTURE;
  const eventCountdown = useCountdown(eventCountdownTarget);

  // Overlay rendered ON the banner image (in the dark/black area at the bottom)
  const eventOverlay = featuredEvent && !eventCountdown.isExpired ? (
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#050d24]/95 via-[#050d24]/80 to-transparent px-4 md:px-6 py-4 md:py-5 pointer-events-none">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 flex-wrap">
        {/* Countdown boxes */}
        <div className="flex items-center gap-2">
          <span className="text-white/60 text-[11px] font-medium hidden md:block">นับถอยหลัง</span>
          <div className="flex gap-1.5 text-center">
            {[
              { val: eventCountdown.days,    label: 'วัน' },
              { val: eventCountdown.hours,   label: 'ชม.' },
              { val: eventCountdown.minutes, label: 'นาที' },
              { val: eventCountdown.seconds, label: 'วิ' },
            ].map((item, i) => (
              <div key={i} className="bg-white/20 backdrop-blur-sm rounded-lg px-2.5 py-1.5 min-w-[44px]">
                <div className="text-xl font-black text-white tabular-nums leading-none">{String(item.val).padStart(2,'0')}</div>
                <div className="text-[9px] text-white/50 mt-0.5">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
        {/* Date / Venue / Time pills */}
        <div className="flex flex-wrap gap-1.5 text-xs">
          {featuredEvent.eventDate && (
            <span className="flex items-center gap-1 bg-white/15 text-white px-2.5 py-1 rounded-full">
              <Calendar className="w-3 h-3 shrink-0" />{formatThaiDate(featuredEvent.eventDate)}
            </span>
          )}
          {formatVenue(featuredEvent.venueTh, featuredEvent.eventType) && (
            <span className="flex items-center gap-1 bg-white/15 text-white px-2.5 py-1 rounded-full">
              <Video className="w-3 h-3 shrink-0" />{formatVenue(featuredEvent.venueTh, featuredEvent.eventType)}
            </span>
          )}
          {featuredEvent.eventTime && (
            <span className="flex items-center gap-1 bg-white/15 text-white px-2.5 py-1 rounded-full">
              <Clock className="w-3 h-3 shrink-0" />{formatEventTime(featuredEvent.eventTime)}
            </span>
          )}
        </div>
        {/* CTA button — pointer-events-auto คืนให้ปุ่มนี้คลิกได้แม้ parent เป็น none */}
        <Link
          href={resolveCtaUrl(featuredEvent.ctaUrl, featuredEvent.meetUrl)}
          className="shrink-0 bg-[#F5B800] hover:bg-[#e0a800] text-gray-900 font-bold px-5 py-2.5 rounded-xl text-sm transition-all hover:scale-105 shadow-lg whitespace-nowrap pointer-events-auto"
        >
          {featuredEvent.ctaTextTh?.replace(/^🎟️\s*/, '') ?? 'ลงทะเบียนฟรี'} →
        </Link>
      </div>
    </div>
  ) : null;

  return (
    <Layout>
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1565C0] via-[#2980D6] to-[#5BB6F0] dark:from-gray-900 dark:via-blue-900 dark:to-blue-800 pt-16 pb-24 lg:py-32">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 opacity-20 dark:opacity-10 pointer-events-none">
          <div className="w-[800px] h-[800px] rounded-full bg-gradient-to-tr from-primary to-accent blur-[100px]" />
        </div>
        
        <div className="container max-w-7xl mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6 lg:space-y-8 order-1 lg:order-1"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white font-medium text-xs lg:text-sm backdrop-blur-md border border-white/30 w-fit">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-400"></span>
                </span>
                Powered by Thai Study Abroad Consultant · สมาชิก TIECA
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.15] text-white">
                {t('home.hero_title')}
              </h1>
              
              <p className="text-base md:text-xl text-blue-100 max-w-lg leading-relaxed">
                {t('home.hero_subtitle')}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 pt-2 lg:pt-4">
                <Link href="/seminars" className="inline-flex justify-center items-center gap-2 bg-[#FFFF66] hover:bg-yellow-300 text-gray-900 px-6 lg:px-8 py-3.5 lg:py-4 rounded-xl font-bold text-base lg:text-lg transition-all hover:scale-105 hover:shadow-xl shadow-yellow-400/30 shadow-lg">
                  {t('common.apply_now')} <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/contact" className="inline-flex justify-center items-center gap-2 bg-white/15 backdrop-blur-md border-2 border-white/60 text-white hover:bg-white/25 px-6 lg:px-8 py-3.5 lg:py-4 rounded-xl font-semibold text-base lg:text-lg transition-all">
                  {t('common.consult_free')}
                </Link>
              </div>
              
              <div className="flex items-center gap-4 pt-4 lg:pt-6">
                <div className="flex -space-x-3">
                  {HERO_AVATARS.map((src, i) => (
                    <img key={i} src={src} className="w-10 h-10 lg:w-11 lg:h-11 rounded-full border-2 border-white object-cover" alt="Student" />
                  ))}
                </div>
                <div className="text-xs lg:text-sm">
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Star className="w-3.5 h-3.5 lg:w-4 lg:h-4 fill-current" /><Star className="w-3.5 h-3.5 lg:w-4 lg:h-4 fill-current" /><Star className="w-3.5 h-3.5 lg:w-4 lg:h-4 fill-current" /><Star className="w-3.5 h-3.5 lg:w-4 lg:h-4 fill-current" /><Star className="w-3.5 h-3.5 lg:w-4 lg:h-4 fill-current" />
                  </div>
                  <span className="font-bold text-white">5000+</span><span className="text-blue-100"> นักเรียนไว้วางใจ</span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative order-first lg:order-2 w-full max-w-md lg:max-w-none mx-auto mt-0 lg:mt-0"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/3] group">
                <img src={heroImg} alt="Students" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-6 left-6 text-white">
                  <div className="font-semibold text-xl flex items-center gap-2"><MapPin className="w-5 h-5"/> Cebu City, Philippines</div>
                  <div className="text-white/80">CIA · QQ English · Philinter · B'Cebu</div>
                </div>
              </div>
              
              {/* Floating Badge */}
              <div className="absolute -top-6 -right-6 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-xl animate-bounce" style={{ animationDuration: '3s' }}>
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
                    <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Guarantee</div>
                    <div className="font-bold text-gray-900 dark:text-white">Visa Approved</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. Stats Bar */}
      <section className="bg-primary text-white py-12 relative z-20 -mt-6 mx-4 lg:mx-auto max-w-7xl rounded-2xl shadow-xl">
        <div className="container px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/20">
            {[
              { num: '20+', label: t('home.stats.years'), icon: Trophy },
              { num: '5,000+', label: t('home.stats.students'), icon: Users },
              { num: '50+', label: t('home.stats.schools'), icon: CheckCircle2 },
              { num: '95%', label: t('home.stats.satisfaction'), icon: Star },
            ].map((stat, i) => (
              <div key={i} className="px-4">
                <stat.icon className="w-8 h-8 mx-auto mb-3 text-secondary" />
                <div className="text-3xl md:text-4xl font-bold mb-1">{stat.num}</div>
                <div className="text-sm md:text-base text-white/80 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Why Choose Us */}
      <section className="py-24 bg-transparent">
        <div className="container max-w-7xl mx-auto px-4">
          {/* ── Big heading ── */}
          <div className="text-center mb-14">
            {/* BIG heading */}
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 dark:text-white leading-tight mb-4">
              ทำไมต้องเลือกเรา
            </h2>

            {/* Brand sub-row */}
            <p className="text-lg md:text-xl font-semibold text-gray-600 dark:text-gray-400 mb-4">
              Philingo <span className="text-primary font-bold">by</span> Thai Study Abroad Consultant
            </p>

            <p className="text-base md:text-lg font-medium text-gray-500 dark:text-gray-400 mb-1">
              ประสบการณ์กว่า 20 ปี ในการดูแลนักเรียนไทยศึกษาต่อต่างประเทศ
            </p>
            <div className="inline-flex items-center gap-2 px-5 py-2 mb-6 rounded-full border-2 border-yellow-400 bg-yellow-400/10 dark:bg-yellow-400/15 shadow-sm">
              <span className="text-yellow-500 dark:text-yellow-300 text-[11px] font-black tracking-[0.18em] uppercase">
                ✦ Trusted Education Consultant Since 2003 ✦
              </span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              เราให้คำปรึกษา ดูแลการสมัครเรียน ที่พัก และการเดินทางครบวงจร
              พร้อมแนะนำโรงเรียนที่เหมาะกับเป้าหมายของคุณ
              <span className="font-semibold text-gray-700 dark:text-gray-200"> โดยไม่มีค่าใช้จ่ายในการให้คำปรึกษา</span>
            </p>
          </div>

          {/* Trust — กลุ่มบริษัทในเครือ */}
          <div className="mb-14">
            <p className="text-center text-xs font-semibold text-gray-400 uppercase tracking-widest mb-5">
              กลุ่มบริษัทในเครือ Thai Study Abroad Consultant
            </p>
            <div className="flex flex-wrap justify-center items-center gap-4">
              {/* TSAB */}
              <div className="flex items-center justify-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-6 py-4 rounded-2xl shadow-sm w-48 h-20">
                <img src={tsabLogo} alt="Thai Study Abroad Consultant" className="h-12 w-36 object-contain" />
              </div>
              {/* TIECA */}
              <div className="flex items-center gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-6 py-4 rounded-2xl shadow-sm w-48 h-20">
                <img src={tiecaLogo} alt="TIECA" className="h-12 w-12 object-contain shrink-0" />
                <div>
                  <div className="text-xs font-bold text-gray-800 dark:text-gray-200 leading-tight">สมาชิก TIECA</div>
                  <div className="text-[10px] text-gray-400 dark:text-gray-500 leading-tight mt-0.5">สมาคมนักเรียนต่างชาติ</div>
                </div>
              </div>
              {/* Text badges */}
              {[
                { emoji: '⭐', text: 'ประสบการณ์\nกว่า 20 ปี' },
                { emoji: '✅', text: 'บริษัทจด\nทะเบียนถูกต้อง' },
              ].map((b, i) => (
                <div key={i} className="flex flex-col items-center justify-center gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-6 py-4 rounded-2xl shadow-sm w-48 h-20 text-center">
                  <span className="text-2xl leading-none">{b.emoji}</span>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 whitespace-pre-line leading-tight">{b.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: 'เรียนกับเจ้าของภาษา', desc: 'ครูผู้สอนผ่านการคัดเลือกและมีใบรับรอง TESOL/TEFL', icon: Users, color: 'bg-blue-100 text-blue-600' },
              { title: 'เรียนตัวต่อตัว (1:1)', desc: 'เน้นพัฒนาจุดอ่อนและจุดแข็งของนักเรียนเป็นรายบุคคลอย่างได้ผล', icon: Users, color: 'bg-yellow-100 text-yellow-600' },
              { title: 'ราคาคุ้มค่า', desc: 'รวมค่าเรียน ที่พัก อาหาร และซักรีด เริ่มต้นเพียง 3X,XXX บาท/เดือน', icon: Users, color: 'bg-green-100 text-green-600' },
              { title: 'ดูแลครบวงจร', desc: 'บริการทำวีซ่า จองตั๋วเครื่องบิน และมีเจ้าหน้าที่ดูแลตลอดโครงการ', icon: Users, color: 'bg-purple-100 text-purple-600' },
              { title: 'ที่พักสะดวกสบาย', desc: 'มีหอพักในตัวโรงเรียน ปลอดภัย มีสระว่ายน้ำ ฟิตเนส', icon: Users, color: 'bg-red-100 text-red-600' },
              { title: 'เว็บในเครือ Thai Study Abroad', desc: 'Philingo คือแบรนด์ในเครือ Thai Study Abroad Consultant สมาชิก TIECA มาตรฐานระดับสากล', icon: Trophy, color: 'bg-sky-100 text-sky-600' },
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/75 backdrop-blur-sm dark:bg-gray-800 p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all border border-white/80 dark:border-gray-700"
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${feature.color}`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3.5 Banner Section — single banner, no slider */}
      <section className="py-10 bg-white dark:bg-gray-900">
        <div className="container max-w-7xl mx-auto px-4">
          {liveBanners.length > 0 ? (() => {
            const banner = liveBanners[0];
            return (
              <AdminEditSection href="/admin/banners" label="แก้ไขแบนเนอร์">
                <div className="rounded-3xl overflow-hidden shadow-2xl relative">
                  <Link href="/activities">
                    <img
                      src={banner.imageUrl || seminarBanner}
                      alt={banner.titleTh ?? banner.title ?? 'banner'}
                      loading="lazy"
                      className="w-full h-auto block cursor-pointer"
                      onError={(e) => { (e.target as HTMLImageElement).src = seminarBanner; }}
                    />
                  </Link>
                  {eventOverlay}
                </div>
              </AdminEditSection>
            );
          })() : (
            /* ── Static Seminar Banner fallback ── */
            <div className="rounded-3xl overflow-hidden shadow-2xl relative">
              <Link href="/activities">
                <img src={seminarBanner} alt="Philingo Cebu Education Fair 2026" loading="lazy" className="w-full h-auto object-cover cursor-pointer" />
              </Link>
              {eventOverlay}
            </div>
          )}
        </div>
      </section>

      {/* 3.6 Seminar Register CTA */}
      <section className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 py-6">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <p className="text-white font-extrabold text-xl md:text-2xl">🎟️ ลงทะเบียนเข้าร่วมงาน — <span className="underline">ฟรี!</span> ไม่มีค่าใช้จ่าย</p>
          <p className="text-white/80 text-sm mt-1 mb-4">พบตัวแทน 7 สถาบันชั้นนำ ผ่าน Google Meet · รับโปรพิเศษเฉพาะผู้เข้าร่วม</p>
          <Link href="/seminars#register"
            className="inline-block bg-white hover:bg-gray-50 text-rose-600 font-extrabold px-10 py-3 rounded-xl text-base transition-all hover:scale-105 shadow-lg whitespace-nowrap">
            ลงทะเบียนทันที →
          </Link>
        </div>
      </section>
      <section className="py-5 text-center" style={{background:'linear-gradient(135deg,#FF6B00 0%,#FF9F00 35%,#FFD700 60%,#FF9F00 80%,#FF6B00 100%)'}}>
        <div className="container max-w-4xl mx-auto px-4 flex items-center justify-center gap-2 flex-wrap">
          <span className="text-white text-lg">🎁</span>
          <p className="text-white font-bold text-base md:text-lg drop-shadow-sm">
            สิทธิพิเศษสำหรับผู้เข้าร่วมงาน — <span className="underline decoration-wavy decoration-white/70">เป็นไปตามเงื่อนไขที่แต่ละสถาบันกำหนด</span>
          </p>
        </div>
      </section>

      {/* 4. Featured Courses */}
      <section className="py-24 bg-[hsl(178_55%_83%)] dark:bg-gray-900 overflow-hidden">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">{t('home.featured_courses')}</h2>
            <p className="text-gray-500 dark:text-gray-400">เลือกหลักสูตรที่ตรงกับเป้าหมายของคุณ</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'General English (ESL)', desc: 'ปูพื้นฐาน ฟัง พูด อ่าน เขียน เหมาะสำหรับทุกคน', icon: Users },
              { title: 'IELTS Guarantee', desc: 'รับประกันคะแนนสอบ ไม่ผ่านเรียนฟรีจนกว่าจะได้', icon: GraduationCap },
              { title: 'Business English', desc: 'ภาษาอังกฤษเพื่อธุรกิจ เน้นการเจรจา พรีเซนต์', icon: Trophy },
              { title: 'Summer Camp', desc: 'แคมป์ช่วงปิดเทอมสำหรับเด็ก 8-15 ปี พร้อมคนดูแล', icon: Users },
            ].map((course, i) => (
              <div key={i} className="w-full bg-white/80 backdrop-blur-sm dark:bg-gray-800 p-8 rounded-3xl border border-white/90 dark:border-gray-700 hover:shadow-xl hover:border-primary/30 transition-all text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <course.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{course.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">{course.desc}</p>
                <Link href="/courses" className="text-primary font-medium hover:underline inline-flex items-center justify-center gap-1">
                  ดูรายละเอียด <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-8">
            <Link href="/courses" className="inline-flex items-center gap-2 bg-white/80 hover:bg-white text-primary font-semibold px-8 py-3 rounded-full border border-primary/20 hover:border-primary/50 shadow-sm hover:shadow-md transition-all">
              ดูหลักสูตรทั้งหมด <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Promotions with Timer */}
      <section className="py-24 bg-[hsl(178_50%_82%)] dark:bg-red-900/10 border-y border-[hsl(178_40%_75%)] dark:border-red-900/30">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">{t('home.latest_promotions')}</h2>
            <p className="text-gray-600 dark:text-gray-400">โปรโมชั่นพิเศษจำนวนจำกัด จองก่อนได้สิทธิ์ก่อน</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {livePromos.length > 0 ? (
              livePromos.slice(0, 6).map(promo => (
                <PromoCardGrid key={promo.id} promo={promo} />
              ))
            ) : (
              /* fallback static cards shown while DB is empty */
              <>
                <PromoCardGrid promo={{ id: 1, title: 'Cebu Summer Package', titleTh: 'Cebu Summer Package', descriptionTh: 'เรียนภาษาอังกฤษในเซบูพร้อมที่พักครบวงจร เหมาะสำหรับผู้เริ่มต้นถึงระดับกลาง', originalPriceTh: '65,000', discountPriceTh: '55,000', seatsRemaining: 5, expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), imageUrl: cebuImg, bonusTh: 'ฟรี! ค่าสมัครเรียน + คู่มือเตรียมตัว', isActive: true }} />
                <PromoCardGrid promo={{ id: 2, title: 'IELTS Guarantee Course', titleTh: 'IELTS Guarantee Course', descriptionTh: 'การันตีคะแนน IELTS 6.0+ หรือเรียนต่อฟรี เหมาะสำหรับผู้ต้องการยื่นเรียนต่อ/วีซ่า', originalPriceTh: '89,000', discountPriceTh: '79,000', seatsRemaining: 2, expiresAt: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(), imageUrl: classroomImg, bonusTh: 'ฟรี! Mock Test 4 ครั้ง + เอกสารสมัครสอบ', isActive: true }} />
                <PromoCardGrid promo={{ id: 3, title: 'General English 3 Months', titleTh: 'General English 3 เดือน', descriptionTh: 'หลักสูตรภาษาอังกฤษทั่วไป 3 เดือนครบวงจร ฟัง พูด อ่าน เขียน ครบทุกทักษะ', originalPriceTh: '120,000', discountPriceTh: '99,000', seatsRemaining: 10, expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), imageUrl: campusImg, bonusTh: 'ฟรี! ค่าธรรมเนียมวีซ่า + ประกันสุขภาพ 3 เดือน', isActive: true }} />
              </>
            )}
          </div>

          <div className="text-center mt-12">
            <Link href="/promotions" className="inline-flex items-center gap-2 bg-white/70 hover:bg-white/90 border border-white/80 text-gray-800 font-semibold px-8 py-3 rounded-full transition-colors shadow-sm">
              ดูโปรโมชั่นทั้งหมด <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 6. Partner Schools */}
      <section className="py-24 bg-transparent">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">{t('home.partner_schools')}</h2>
            <p className="text-gray-600 dark:text-gray-400">สถาบันภาษาชั้นนำในฟิลิปปินส์ที่ได้รับความไว้วางใจ</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'CIA Academy', city: 'Mactan, Cebu', logo: ciaLogo, programs: ['Semi Sparta','IELTS','TOEIC','Business English'], accent: 'border-red-200 dark:border-red-900/30' },
              { name: 'QQ English', city: 'IT Park, Cebu', logo: qqLogo, programs: ['Callan Method','General English','IELTS','Business English'], accent: 'border-sky-200 dark:border-sky-900/30' },
              { name: 'Philinter', city: 'Mactan, Cebu', logo: philinterLogo, programs: ['Business English','Speaking','ESL','Cambridge'], accent: 'border-green-200 dark:border-green-900/30' },
              { name: "B'Cebu", city: 'Banilad, Cebu', logo: bcebuLogo, programs: ['Intensive English','IELTS','TOEIC','ห้องพักใหม่'], accent: 'border-blue-200 dark:border-blue-900/30' },
            ].map((school, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`bg-white/75 backdrop-blur-sm dark:bg-gray-800 rounded-2xl border-2 ${school.accent} p-6 hover:shadow-xl transition-all group`}
              >
                <div className="h-16 flex items-center justify-center mb-4">
                  <img src={school.logo} alt={school.name} className="h-12 w-auto object-contain group-hover:scale-105 transition-transform" />
                </div>
                <div className="font-bold text-lg text-gray-900 dark:text-white mb-1 text-center">{school.name}</div>
                <div className="flex items-center justify-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-4">
                  <MapPin className="w-3 h-3" /> {school.city}
                </div>
                <ul className="space-y-1.5">
                  {school.programs.map((p, j) => (
                    <li key={j} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />{p}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link href="/schools" className="inline-flex items-center gap-2 bg-white/60 dark:bg-gray-800 text-gray-900 dark:text-white px-6 py-3 rounded-full font-medium hover:bg-white/80 dark:hover:bg-gray-700 transition-colors border border-white/70">
              ดูโรงเรียนทั้งหมด 50+ แห่ง <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>


      {/* 7.5 Reviews Carousel */}
      <section className="py-24 bg-[hsl(178_60%_82%)] dark:bg-gray-900/50">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">{t('home.student_reviews')}</h2>
            <p className="text-gray-700 dark:text-gray-400">เสียงจากนักเรียนที่ผ่านการดูแลของเราจริงๆ</p>
          </div>

          {/* Carousel */}
          <div className="relative">
            <div className="grid md:grid-cols-3 gap-6">
              {reviews.slice(activeReview, activeReview + reviewsPerPage).map((r) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/80 backdrop-blur-sm dark:bg-gray-800 rounded-2xl p-7 shadow-lg border-2 border-[#FFFF66]/50 dark:border-gray-700 flex flex-col gap-4"
                >
                  <div className="flex items-center gap-1 text-yellow-500">
                    {[...Array(r.rating)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed flex-1">"{r.text}"</p>
                  <div className="flex items-center gap-3 pt-2 border-t border-[#FFFF66]/30 dark:border-gray-700">
                    <img
                      src={r.photo}
                      alt={r.name}
                      loading="lazy"
                      className="w-14 h-14 rounded-full object-cover shrink-0 border-3 border-primary shadow-md"
                      style={{ border: '3px solid #1B4FD8' }}
                    />
                    <div>
                      <div className="font-bold text-gray-900 dark:text-white text-base">{r.name}</div>
                      <div className="text-xs text-primary font-medium">{r.course}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{r.school}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Dots + Arrows */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={() => setActiveReview(Math.max(0, activeReview - reviewsPerPage))}
                disabled={activeReview === 0}
                className="w-10 h-10 rounded-full bg-white/70 border-2 border-primary text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors disabled:opacity-30 shadow-sm"
              >
                ←
              </button>
              <div className="flex gap-2">
                {Array.from({ length: Math.ceil(reviews.length / reviewsPerPage) }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveReview(i * reviewsPerPage)}
                    className={`h-2.5 rounded-full transition-all ${
                      activeReview / reviewsPerPage === i
                        ? 'bg-primary w-6'
                        : 'bg-primary/30 w-2.5'
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={() => setActiveReview(Math.min(reviews.length - reviewsPerPage, activeReview + reviewsPerPage))}
                disabled={activeReview + reviewsPerPage >= reviews.length}
                className="w-10 h-10 rounded-full bg-white/70 border-2 border-primary text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors disabled:opacity-30 shadow-sm"
              >
                →
              </button>
            </div>
          </div>

          <div className="text-center mt-10">
            <Link href="/reviews" className="inline-flex items-center gap-2 bg-white/70 hover:bg-white/90 border border-white/80 text-gray-800 font-semibold px-8 py-3 rounded-full transition-colors shadow-sm">
              ดูรีวิวทั้งหมด <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 8. Photo Gallery — ดึงจาก /api/gallery; ถ้าว่างใช้ fallback hardcode */}
      <GallerySection t={t} />

      {/* 9. Blog Preview */}
      <section className="py-24 bg-transparent">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">{t('home.latest_blog')}</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'เทคนิคอัพคะแนน IELTS จาก 5.0 เป็น 6.5 ใน 3 เดือน', img: blog1, cat: 'IELTS' },
              { title: 'รีวิวเที่ยววันหยุดในฟิลิปปินส์ เรียน 5 วัน เที่ยว 2 วัน', img: blog2, cat: 'ท่องเที่ยว' },
              { title: 'อัพเดทขั้นตอนการทำวีซ่านักเรียนฟิลิปปินส์ 2024', img: blog3, cat: 'วีซ่า' }
            ].map((post, i) => (
              <div key={i} className="group cursor-pointer">
                <div className="relative rounded-3xl overflow-hidden aspect-[4/3] mb-4">
                  <img src={post.img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={post.title} />
                  <div className="absolute top-4 left-4 bg-[#FFFF66]/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-800">
                    {post.cat}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">{post.title}</h3>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/blog" className="inline-flex items-center gap-2 bg-white/70 hover:bg-white/90 border border-white/80 text-gray-800 font-semibold px-8 py-3 rounded-full transition-colors shadow-sm">
              อ่านบทความทั้งหมด <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="container max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">พร้อมที่จะเริ่มการเปลี่ยนแปลงแล้วหรือยัง?</h2>
          <p className="text-primary-foreground/80 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
            ปรึกษาเราฟรี ไม่มีค่าใช้จ่าย ทีมงานผู้เชี่ยวชาญพร้อมให้คำแนะนำหลักสูตรที่เหมาะสมกับเป้าหมายและงบประมาณของคุณ
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/register" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold px-8 py-4 rounded-xl text-lg transition-transform hover:scale-105 shadow-xl">
              ปรึกษาฟรีตอนนี้
            </Link>
            <a href={lineUrl} target="_blank" rel="noreferrer" className="bg-[#00B900] hover:bg-[#00A000] text-white font-bold px-8 py-4 rounded-xl text-lg transition-transform hover:scale-105 shadow-xl flex items-center justify-center gap-2">
              <CheckCircle2 className="w-6 h-6" /> คุยผ่าน LINE
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
}

function PromoCardGrid({ promo }: { promo: ApiPromo }) {
  const timeLeft = useCountdown(promo.expiresAt ?? '');
  const [imgError, setImgError] = React.useState(false);

  return (
    <div className="bg-white/90 backdrop-blur-sm dark:bg-gray-800 rounded-2xl shadow-lg border border-red-100 dark:border-red-900/30 overflow-hidden flex flex-col group">
      {/* Image */}
      <div className="relative h-44 overflow-hidden bg-gray-100 dark:bg-gray-700">
        {promo.imageUrl && !imgError ? (
          <img src={promo.imageUrl} alt={promo.titleTh} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" onError={() => setImgError(true)} />
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
          href="/promotions"
          className="bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-xl text-center text-sm transition-transform hover:-translate-y-0.5 shadow-md shadow-primary/20 mt-auto"
        >
          ดูรายละเอียด
        </Link>
      </div>
    </div>
  );
}
