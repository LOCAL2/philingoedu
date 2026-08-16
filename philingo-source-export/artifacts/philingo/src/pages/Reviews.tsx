import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useSeoMeta } from '@/hooks/use-seo-meta';
import { Link } from 'wouter';
import { Star, ArrowRight, Clock, PlayCircle, Loader2 } from 'lucide-react';
import { SiGoogle, SiFacebook, SiLine } from 'react-icons/si';
import { useSettings } from '@/hooks/use-settings';
import { useQuery } from '@tanstack/react-query';

/* ── Types ────────────────────────────────────────────────── */
interface ReviewPost {
  id: number;
  slug: string;
  titleTh: string;
  title: string | null;
  excerptTh: string | null;
  excerpt: string | null;
  coverImageUrl: string | null;
  author: string | null;
  authorTh: string | null;
  tags: string[] | null;
  category: string | null;
  isFeatured: boolean;
  isPublished: boolean;
  publishedAt: string | null;
  views: number;
}

const BASE = (import.meta.env.BASE_URL ?? '').replace(/\/$/, '');

const stats = [
  { num: '5,000+', label: 'นักเรียนไทยที่ผ่านมา' },
  { num: '4.9★', label: 'คะแนนเฉลี่ย Google' },
  { num: '98%', label: 'แนะนำต่อให้เพื่อน' },
  { num: '8 ปี', label: 'ประสบการณ์ดูแล' },
];

/* Derive school name from tags (first tag that looks like a school name) */
const SCHOOL_NAMES = ['CIA', 'PINES', 'EV Academy', 'SMEAG', 'QQ English', 'I-BREEZE', "B'Cebu", 'Philinter', 'CPILS', 'OIC', 'Baguio'];
function schoolFromTags(tags: string[] | null): string | null {
  if (!tags?.length) return null;
  return tags.find(t => SCHOOL_NAMES.some(s => t.toUpperCase().includes(s.toUpperCase()))) ?? tags[0] ?? null;
}

export default function Reviews() {
  const [activeSchool, setActiveSchool] = useState('ทั้งหมด');
  useSeoMeta(
    'รีวิวจากนักเรียนจริง เรียนที่ฟิลิปปินส์ | Philingo',
    'อ่านรีวิวจากนักเรียนไทยที่เรียนภาษาอังกฤษที่ฟิลิปปินส์จริง รีวิวโรงเรียน ค่าใช้จ่าย และประสบการณ์'
  );
  const settings = useSettings();
  const LINE_URL = settings.line_url || 'https://lin.ee/zmlkhOn0';

  const { data: reviews = [], isLoading } = useQuery<ReviewPost[]>({
    queryKey: ['public-reviews'],
    queryFn: () =>
      fetch(`${BASE}/api/blog?category=review&isPublished=true&limit=100`, { cache: 'no-store' })
        .then(r => r.ok ? r.json() : { data: [] })
        .then(d => (d.data ?? []) as ReviewPost[]),
    staleTime: 0,
  });

  /* Build school filter list from tags in live data */
  const schoolSet = new Set<string>();
  reviews.forEach(r => { const s = schoolFromTags(r.tags); if (s) schoolSet.add(s.split('(')[0].trim()); });
  const allSchools = ['ทั้งหมด', ...Array.from(schoolSet).sort()];

  const filtered = activeSchool === 'ทั้งหมด'
    ? reviews
    : reviews.filter(r => {
        const school = schoolFromTags(r.tags);
        return school?.toLowerCase().includes(activeSchool.toLowerCase());
      });

  return (
    <Layout>
      {/* ── Hero ── */}
      <section className="bg-primary text-white pt-24 pb-32 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="container max-w-6xl mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">รีวิวจากนักเรียนจริง</h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-10">
            ประสบการณ์จริงจากนักเรียนไทยที่ไปเรียนภาษาอังกฤษที่ฟิลิปปินส์กับ Philingo
          </p>

          {/* Rating badges */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <div className="bg-white text-gray-900 px-6 py-4 rounded-2xl flex items-center gap-4 shadow-lg">
              <SiGoogle className="w-7 h-7 text-blue-500 shrink-0" />
              <div className="text-left">
                <div className="font-bold text-lg">4.9 / 5.0</div>
                <div className="flex text-yellow-400">{'★★★★★'.split('').map((s, i) => <span key={i}>{s}</span>)}</div>
              </div>
            </div>
            <div className="bg-blue-700 text-white px-6 py-4 rounded-2xl flex items-center gap-4 shadow-lg">
              <SiFacebook className="w-7 h-7 shrink-0" />
              <div className="text-left">
                <div className="font-bold text-lg">5.0 / 5.0</div>
                <div className="flex text-yellow-300">{'★★★★★'.split('').map((s, i) => <span key={i}>{s}</span>)}</div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {stats.map((s, i) => (
              <div key={i} className="bg-white/10 backdrop-blur rounded-2xl p-4">
                <div className="text-2xl font-black">{s.num}</div>
                <div className="text-xs text-white/70 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Blog-style Review Cards ── */}
      <section className="-mt-16 relative z-10 py-6 bg-gray-50 dark:bg-gray-900/50">
        <div className="container max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">บทความรีวิวทั้งหมด</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">คลิกอ่านรีวิวเต็มๆ จากนักเรียนจริง</p>

          {/* School filter — only show when data loaded */}
          {!isLoading && allSchools.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar mb-8">
              {allSchools.map(s => (
                <button key={s} onClick={() => setActiveSchool(s)}
                  className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                    activeSchool === s
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-primary/50'
                  }`}>
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Loading state */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {/* Empty state */}
          {!isLoading && filtered.length === 0 && (
            <div className="text-center py-16 text-gray-500 dark:text-gray-400">
              {reviews.length === 0
                ? 'ยังไม่มีบทความรีวิว — ทีมงานกำลังเพิ่มเนื้อหาเร็วๆ นี้'
                : `ไม่มีรีวิวสำหรับสถาบัน "${activeSchool}"`}
            </div>
          )}

          {/* Cards */}
          {!isLoading && filtered.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map(post => {
                const school = schoolFromTags(post.tags);
                const authorDisplay = post.authorTh || post.author;
                const title = post.titleTh || post.title || '';
                const excerpt = post.excerptTh || post.excerpt || '';
                const coverFallback = `https://picsum.photos/seed/${post.slug}/800/600`;

                return (
                  <article key={post.id} className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all group flex flex-col">
                    {/* Cover */}
                    <Link href={`/posts/${post.slug}`} className="block relative overflow-hidden aspect-[4/3]">
                      <img
                        src={post.coverImageUrl || coverFallback}
                        alt={title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                        รีวิว
                      </div>
                      {school && (
                        <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full">
                          {school.split('(')[0].trim()}
                        </div>
                      )}
                      {post.isFeatured && (
                        <div className="absolute bottom-3 left-3 bg-yellow-400 text-gray-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          ⭐ Featured
                        </div>
                      )}
                    </Link>

                    {/* Body */}
                    <div className="p-5 flex flex-col flex-1">
                      {/* Tags */}
                      {post.tags && post.tags.length > 0 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-1">
                          {post.tags.slice(0, 3).join(' · ')}
                        </p>
                      )}

                      <Link href={`/posts/${post.slug}`}>
                        <h2 className="font-bold text-primary dark:text-blue-400 leading-snug mb-1 line-clamp-3 text-[15px] hover:underline cursor-pointer">
                          {title}
                        </h2>
                      </Link>

                      {excerpt && (
                        <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed mb-4 line-clamp-2">
                          {excerpt}
                        </p>
                      )}

                      {/* Footer */}
                      <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                            {authorDisplay ? authorDisplay[0].toUpperCase() : 'P'}
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                              {authorDisplay || 'Philingo'}
                            </div>
                            {post.publishedAt && (
                              <div className="text-[11px] text-gray-400">
                                {new Date(post.publishedAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </div>
                            )}
                          </div>
                        </div>
                        <Link href={`/posts/${post.slug}`}
                          className="flex items-center gap-1 text-primary text-xs font-bold hover:underline shrink-0">
                          ดูต่อ <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <div className="bg-gradient-to-br from-primary to-blue-600 rounded-3xl p-10 text-white shadow-xl">
            <div className="text-4xl mb-4">🎓</div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3">อยากเป็นคนต่อไปที่ได้ไปเรียน?</h2>
            <p className="text-white/80 mb-8 max-w-xl mx-auto">ปรึกษาฟรี ไม่มีค่าใช้จ่าย ทีมงานช่วยวางแผนการเรียนให้เหมาะกับคุณโดยเฉพาะ</p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href={LINE_URL} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-2 bg-[#00B900] hover:bg-[#009900] text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-md">
                <SiLine className="w-5 h-5" /> ทักหา LINE
              </a>
              <Link href="/register"
                className="inline-flex items-center gap-2 bg-white text-primary font-bold px-8 py-3.5 rounded-xl hover:bg-gray-50 transition-all shadow-md">
                สมัครเรียนเลย <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
