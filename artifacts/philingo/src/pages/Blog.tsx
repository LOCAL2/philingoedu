import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useSeoMeta } from '@/hooks/use-seo-meta';
import { Link } from 'wouter';
import { ArrowRight, Clock, User, Loader2 } from 'lucide-react';

const BASE = (import.meta.env.BASE_URL ?? '').replace(/\/$/, '');

interface BlogPost {
  id: number;
  slug: string;
  title: string;
  titleTh: string | null;
  excerpt: string | null;
  excerptTh: string | null;
  category: string;
  author: string;
  authorTh: string | null;
  coverImageUrl: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
}

const CATEGORY_TH: Record<string, string> = {
  life: 'ชีวิตในฟิลิปปินส์',
  tips: 'คำแนะนำ',
  review: 'รีวิว',
  'Visa & Travel': 'วีซ่า & เดินทาง',
  'Tips & Guides': 'Tips & Guides',
  Destinations: 'จุดหมายปลายทาง',
  'Exam Prep': 'เตรียมสอบ',
};

const catLabel = (c: string) => CATEGORY_TH[c] ?? c;
const getTitle = (p: BlogPost) => p.titleTh || p.title;
const getExcerpt = (p: BlogPost) => p.excerptTh || p.excerpt || '';
const getAuthor = (p: BlogPost) => p.authorTh || p.author || 'ทีม Philingo';
const getCover = (p: BlogPost) =>
  p.coverImageUrl || `https://picsum.photos/seed/${p.slug}/800/450`;
const fmtDate = (p: BlogPost) =>
  new Date(p.publishedAt || p.createdAt).toLocaleDateString('th-TH', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

export default function Blog() {
  const [activeCat, setActiveCat] = useState('ทั้งหมด');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [cats, setCats] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useSeoMeta(
    'บทความน่ารู้เรื่องเรียนต่อฟิลิปปินส์ | Philingo',
    'อ่านบทความ รีวิว และคำแนะนำเกี่ยวกับการเรียนภาษาอังกฤษที่ฟิลิปปินส์ จากทีม Philingo',
  );

  const fetchPosts = React.useCallback(() => {
    fetch(`${BASE}/api/blog?isPublished=true&limit=100`, { cache: 'no-store' })
      .then(r => { if (!r.ok) throw new Error(String(r.status)); return r.json(); })
      .then((j: { data: BlogPost[] }) => {
        const data = j.data ?? [];
        setPosts(data);
        const unique = [...new Set(data.map(p => p.category).filter(Boolean))];
        setCats(unique);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  // fetch on mount + refetch whenever the tab comes back into focus
  // (so image/content changes made in admin are visible without a full reload)
  useEffect(() => {
    fetchPosts();
    const onVisible = () => { if (document.visibilityState === 'visible') fetchPosts(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [fetchPosts]);

  const filtered = activeCat === 'ทั้งหมด'
    ? posts
    : posts.filter(p => p.category === activeCat);

  const [featured, ...rest] = filtered;

  return (
    <Layout>
      {/* ── Header ── */}
      <section className="bg-gray-50 dark:bg-gray-900/50 pt-20 pb-16">
        <div className="container max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            บทความน่ารู้
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-12">
            อัพเดทข่าวสาร ทริคการเรียนภาษา รีวิวสถาบัน และเรื่องราวการใช้ชีวิตในฟิลิปปินส์
          </p>

          {/* Category filter — แสดงเมื่อโหลดเสร็จ */}
          {!loading && !error && (
            <div className="flex flex-wrap justify-center gap-2">
              {['ทั้งหมด', ...cats].map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCat(cat)}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors border ${activeCat === cat
                      ? 'bg-primary text-white border-primary shadow-md'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700'
                    }`}
                >
                  {cat === 'ทั้งหมด' ? 'ทั้งหมด' : catLabel(cat)}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Content ── */}
      <section className="py-12">
        <div className="container max-w-7xl mx-auto px-4">

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-24 gap-3 text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>กำลังโหลดบทความ...</span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="text-center py-20 text-red-500">
              โหลดบทความไม่สำเร็จ กรุณาลองใหม่อีกครั้ง
            </div>
          )}

          {/* Empty */}
          {!loading && !error && filtered.length === 0 && (
            <div className="text-center py-20 text-gray-500">
              ไม่มีบทความในหมวดหมู่นี้
            </div>
          )}

          {/* ── Featured card ── */}
          {!loading && !error && featured && (
            <Link href={`/posts/${featured.slug}`} className="group block mb-10">
              <article className="relative rounded-3xl overflow-hidden shadow-md border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all bg-white dark:bg-gray-800">
                <div className="md:grid md:grid-cols-5 md:h-72">
                  <div className="md:col-span-2 relative aspect-[16/9] md:aspect-auto md:h-full overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center">
                    <img
                      src={getCover(featured)}
                      alt={getTitle(featured)}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                      {featured.category === 'review' ? '⭐ รีวิว' : catLabel(featured.category)}
                    </div>
                  </div>
                  <div className="md:col-span-3 p-6 flex flex-col justify-center">
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-2">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" /> {getAuthor(featured)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {fmtDate(featured)}
                      </span>
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-primary dark:text-blue-400 leading-snug mb-2 line-clamp-2 group-hover:underline">
                      {getTitle(featured)}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4 line-clamp-2">
                      {getExcerpt(featured)}
                    </p>
                    <span className="inline-flex items-center gap-2 text-primary font-bold text-sm mt-auto md:mt-0">
                      อ่านต่อ <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          )}

          {/* ── Grid ── */}
          {!loading && !error && rest.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {rest.map(post => (
                <article
                  key={post.id}
                  className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all group flex flex-col"
                >
                  <Link href={`/posts/${post.slug}`} className="block relative overflow-hidden aspect-[16/9] bg-gray-100 dark:bg-gray-700 flex items-center">
                    <img
                      src={getCover(post)}
                      alt={getTitle(post)}
                      loading="lazy"
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-primary text-xs font-bold px-3 py-1 rounded-full">
                      {post.category === 'review' ? '⭐ รีวิว' : catLabel(post.category)}
                    </div>
                  </Link>

                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-3">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {fmtDate(post)}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" /> {getAuthor(post)}
                      </span>
                    </div>

                    <Link href={`/posts/${post.slug}`}>
                      <h2 className="font-bold text-primary dark:text-blue-400 leading-snug mb-2 line-clamp-3 text-[15px] hover:underline cursor-pointer">
                        {getTitle(post)}
                      </h2>
                    </Link>

                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4 line-clamp-2">
                      {getExcerpt(post)}
                    </p>

                    <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                      <Link
                        href={`/posts/${post.slug}`}
                        className="inline-flex items-center gap-2 text-primary font-bold text-sm hover:underline"
                      >
                        อ่านต่อ <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
