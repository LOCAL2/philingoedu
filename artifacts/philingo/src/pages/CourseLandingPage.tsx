import React, { useEffect } from 'react';
import { Link, useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '@/components/layout/Layout';
import { useSettings } from '@/hooks/use-settings';
import { CheckCircle2, Clock, MapPin, Star, ArrowLeft, BookOpen } from 'lucide-react';
import { SiLine } from 'react-icons/si';

// ─── Types ──────────────────────────────────────────────────────────────────
interface Course {
  id: number;
  slug: string;
  title: string;
  titleTh: string;
  subtitle?: string;
  subtitleTh?: string;
  description?: string;
  descriptionTh?: string;
  duration?: string;
  durationTh?: string;
  suitableFor?: string;
  suitableForTh?: string;
  priceDisplay?: string;
  priceDisplayTh?: string;
  badge?: string;
  badgeTh?: string;
  features?: string[];
  schoolSlug?: string;
  metaTitle?: string;
  metaDescription?: string;
  heroBannerUrl?: string;
  curriculumDetails?: Record<string, unknown> | null;
}

interface School {
  id: number;
  slug: string;
  name: string;
  nameTh?: string;
  city?: string;
  logo?: string;
}

// ─── Component ──────────────────────────────────────────────────────────────
export default function CourseLandingPage() {
  const params = useParams<{ schoolSlug: string; courseSlug: string }>();
  const { schoolSlug, courseSlug } = params;
  const settings = useSettings();
  const BASE = (import.meta.env.BASE_URL ?? '').replace(/\/$/, '');

  const lineUrl = settings.line_url || 'https://lin.ee/zmlkhOn0';

  const { data: course, isLoading, isError } = useQuery<Course>({
    queryKey: ['course-landing', schoolSlug, courseSlug],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/courses/${schoolSlug}/${courseSlug}`);
      if (!res.ok) throw new Error('Course not found');
      return res.json();
    },
    staleTime: 60_000,
    enabled: Boolean(schoolSlug && courseSlug),
  });

  const { data: school } = useQuery<School>({
    queryKey: ['school-detail', schoolSlug],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/schools/${schoolSlug}`);
      if (!res.ok) throw new Error('School not found');
      return res.json();
    },
    staleTime: 60_000,
    enabled: Boolean(schoolSlug),
  });

  // ── Per-page SEO ──────────────────────────────────────────────────────────
  const pageTitle = course?.metaTitle ||
    (course ? `${course.titleTh} — ${school?.name || schoolSlug} | Philingo` : 'หลักสูตรภาษาอังกฤษ | Philingo');
  const pageDesc  = course?.metaDescription ||
    (course?.descriptionTh ? course.descriptionTh.slice(0, 160) : 'รายละเอียดหลักสูตรภาษาอังกฤษที่ฟิลิปปินส์ — Philingo');

  useEffect(() => {
    document.title = pageTitle;
    const metaDesc = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (metaDesc) metaDesc.content = pageDesc;
    const ogTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]');
    if (ogTitle) ogTitle.content = pageTitle;
    const ogDesc = document.querySelector<HTMLMetaElement>('meta[property="og:description"]');
    if (ogDesc) ogDesc.content = pageDesc;
    return () => {
      document.title = 'Philingo — Study English, Live Philippines';
    };
  }, [pageTitle, pageDesc]);

  // ── JSON-LD Course Schema ─────────────────────────────────────────────────
  useEffect(() => {
    if (!course) return;
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'course-jsonld';
    script.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: course.titleTh,
      description: course.descriptionTh || course.descriptionTh || '',
      provider: {
        '@type': 'Organization',
        name: school?.name || schoolSlug,
        sameAs: `https://philingo.com/schools/${schoolSlug}`,
      },
      offers: course.priceDisplayTh ? [{
        '@type': 'Offer',
        price: course.priceDisplayTh,
        priceCurrency: 'THB',
      }] : undefined,
      timeRequired: course.durationTh || course.duration || undefined,
      inLanguage: 'en',
      educationalLevel: 'Beginner to Advanced',
      url: `https://philingo.com/schools/${schoolSlug}/courses/${courseSlug}`,
    });
    document.head.appendChild(script);
    return () => { document.getElementById('course-jsonld')?.remove(); };
  }, [course, school, schoolSlug, courseSlug]);

  // ── Loading / Error states ─────────────────────────────────────────────────
  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-gray-500">กำลังโหลดข้อมูลหลักสูตร…</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (isError || !course) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4 text-center">
          <BookOpen className="w-16 h-16 text-gray-300" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ไม่พบข้อมูลหลักสูตรนี้</h1>
          <p className="text-gray-500">หลักสูตรนี้อาจยังไม่มีหน้า Landing Page หรือ URL ไม่ถูกต้อง</p>
          <Link href={`/schools/${schoolSlug}`}
            className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors">
            ← กลับหน้าโรงเรียน
          </Link>
        </div>
      </Layout>
    );
  }

  const hasPrice = course.priceDisplayTh && !/฿\s*0[^0-9]/.test(course.priceDisplayTh);
  const curriculum = course.curriculumDetails as { sessions?: { time: string; activity: string }[]; notes?: string } | null;

  return (
    <Layout>
      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-primary via-[#1B6FE8] to-[#0A3FA8] text-white pt-24 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 70% 50%, white 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

        <div className="container max-w-4xl mx-auto px-4 relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-white/70 text-sm mb-6 flex-wrap">
            <Link href="/schools" className="hover:text-white transition-colors">โรงเรียน</Link>
            <span>/</span>
            <Link href={`/schools/${schoolSlug}`} className="hover:text-white transition-colors">
              {school?.name || schoolSlug}
            </Link>
            <span>/</span>
            <span className="text-white">หลักสูตร</span>
          </div>

          {/* School name */}
          {school && (
            <Link href={`/schools/${schoolSlug}`}
              className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium mb-4 transition-colors group">
              {school.logo && (
                <img src={school.logo} alt={school.name} loading="lazy"
                  className="w-7 h-7 rounded-md object-contain bg-white p-0.5" />
              )}
              <span className="group-hover:underline">{school.name}</span>
              {school.city && (
                <span className="flex items-center gap-1 text-xs text-white/60">
                  <MapPin className="w-3 h-3" />{school.city}
                </span>
              )}
            </Link>
          )}

          {/* Course title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
            {course.titleTh}
          </h1>
          {course.subtitleTh && (
            <p className="text-lg text-white/80 mb-6">{course.subtitleTh}</p>
          )}

          {/* Badges */}
          <div className="flex flex-wrap gap-3 mb-8">
            {course.durationTh && (
              <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">
                <Clock className="w-4 h-4" /> {course.durationTh}
              </div>
            )}
            {hasPrice && (
              <div className="flex items-center gap-1.5 bg-yellow-400/20 border border-yellow-300/30 px-4 py-2 rounded-full text-sm font-bold text-yellow-200">
                <Star className="w-4 h-4 fill-current" /> {course.priceDisplayTh}
              </div>
            )}
            {(course.badgeTh || course.badge) && (
              <div className="bg-amber-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                {course.badgeTh || course.badge}
              </div>
            )}
          </div>

          {/* CTA */}
          <a href={lineUrl} target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-2 bg-[#00B900] hover:bg-[#009900] text-white font-bold px-8 py-4 rounded-xl text-lg transition-colors shadow-xl">
            <SiLine className="w-5 h-5" /> สอบถามและสำรองที่นั่งผ่าน LINE
          </a>
        </div>
      </section>

      {/* ── Hero Banner (if set in admin) ── */}
      {course.heroBannerUrl && (
        <div className="w-full max-h-80 overflow-hidden">
          <img src={course.heroBannerUrl} alt={course.titleTh} loading="lazy"
            className="w-full h-full object-cover" />
        </div>
      )}

      {/* ── Main content ── */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900/50">
        <div className="container max-w-4xl mx-auto px-4 space-y-12">

          {/* Overview */}
          {course.descriptionTh && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">📋 ภาพรวมหลักสูตร</h2>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">{course.descriptionTh}</p>
              </div>
            </div>
          )}

          {/* Suitable for */}
          {course.suitableForTh && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">🎯 เหมาะสำหรับ</h2>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 border border-blue-100 dark:border-blue-800">
                <p className="text-blue-900 dark:text-blue-300 leading-relaxed">{course.suitableForTh}</p>
              </div>
            </div>
          )}

          {/* Learning outcomes / features */}
          {Array.isArray(course.features) && course.features.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">✅ สิ่งที่จะได้รับ</h2>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
                <ul className="space-y-3">
                  {course.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Curriculum / Daily schedule */}
          {curriculum?.sessions && curriculum.sessions.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">📅 ตารางเรียนตัวอย่าง</h2>
              <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-primary/10 dark:bg-primary/20">
                      <th className="text-left px-6 py-3 font-bold text-gray-700 dark:text-gray-200 w-1/3">เวลา</th>
                      <th className="text-left px-6 py-3 font-bold text-gray-700 dark:text-gray-200">กิจกรรม</th>
                    </tr>
                  </thead>
                  <tbody>
                    {curriculum.sessions.map((s, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-750'}>
                        <td className="px-6 py-3 text-primary font-medium">{s.time}</td>
                        <td className="px-6 py-3 text-gray-700 dark:text-gray-300">{s.activity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {curriculum.notes && (
                  <div className="px-6 py-3 bg-gray-50 dark:bg-gray-900/40 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">{curriculum.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Back to school + CTA */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href={`/schools/${schoolSlug}`}
              className="flex items-center justify-center gap-2 flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold px-6 py-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              กลับหน้าโรงเรียน
            </Link>
            <a href={lineUrl} target="_blank" rel="noreferrer"
              className="flex items-center justify-center gap-2 flex-1 bg-[#00B900] hover:bg-[#009900] text-white font-bold px-6 py-4 rounded-xl transition-colors shadow-lg">
              <SiLine className="w-5 h-5" /> สอบถามผ่าน LINE
            </a>
            <Link href="/register"
              className="flex items-center justify-center gap-2 flex-1 bg-primary hover:bg-primary/90 text-white font-bold px-6 py-4 rounded-xl transition-colors shadow-lg">
              ลงทะเบียนรับคำปรึกษา
            </Link>
          </div>
        </div>
      </section>

      {/* ── Sticky Mobile CTA ── */}
      <div className="fixed bottom-[68px] md:hidden left-0 right-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 truncate">{course.titleTh}</p>
            {hasPrice && <p className="text-sm font-bold text-primary">{course.priceDisplayTh}</p>}
          </div>
          <a href={lineUrl} target="_blank" rel="noreferrer"
            className="flex items-center gap-2 bg-[#00B900] text-white text-sm font-bold px-5 py-2.5 rounded-xl shrink-0 transition-colors hover:bg-[#009900]">
            <SiLine className="w-4 h-4" /> LINE
          </a>
        </div>
      </div>
    </Layout>
  );
}
