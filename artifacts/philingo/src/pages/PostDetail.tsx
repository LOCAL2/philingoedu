import React, { useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Link, useParams } from 'wouter';
import { ArrowLeft, Clock, User, Tag, Calendar, Loader2, Share2 } from 'lucide-react';
import { SiLine } from 'react-icons/si';
import { motion } from 'framer-motion';
import { useSettings } from '@/hooks/use-settings';
import { useQuery } from '@tanstack/react-query';

const BASE = (import.meta.env.BASE_URL ?? '').replace(/\/$/, '');

interface LivePost {
  id: number;
  slug: string;
  titleTh: string;
  title: string | null;
  excerptTh: string | null;
  excerpt: string | null;
  contentTh: string | null;
  content: string | null;
  coverImageUrl: string | null;
  author: string | null;
  authorTh: string | null;
  tags: string[] | null;
  category: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  isFeatured: boolean;
  isPublished: boolean;
  publishedAt: string | null;
  views: number;
}

/* ── Lightweight Markdown → HTML converter ───────────────── */
function mdToHtml(text: string): string {
  if (!text) return '';
  // Strip code-fence wrapper that AI sometimes adds (e.g. ```html ... ``` or unclosed ```html)
  let stripped = text.trim();
  stripped = stripped.replace(/^```(?:html|md|json)?\s*\n?/i, ''); // remove opening fence
  stripped = stripped.replace(/\n?```\s*$/i, '');                   // remove closing fence if present
  stripped = stripped.trim();
  // Already HTML — render as-is (after stripping any code fence)
  if (/<(p|h[1-6]|ul|ol|div|section)\b/i.test(stripped)) return stripped;

  // Normalise line endings (\r\n Windows, \r old Mac → \n)
  const normalised = stripped.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  const lines = normalised.split('\n');
  const out: string[] = [];
  let inUl = false;

  for (const raw of lines) {
    const trimmed = raw.trim();
    const line = raw
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>');

    if (/^#{1,2} /.test(raw)) {
      if (inUl) { out.push('</ul>'); inUl = false; }
      out.push(`<h2>${line.replace(/^#{1,2} /, '')}</h2>`);
    } else if (/^### /.test(raw)) {
      if (inUl) { out.push('</ul>'); inUl = false; }
      out.push(`<h3>${line.replace(/^### /, '')}</h3>`);
    } else if (/^[-*] /.test(raw)) {
      if (!inUl) { out.push('<ul>'); inUl = true; }
      out.push(`<li>${line.replace(/^[-*] /, '')}</li>`);
    } else if (/^---+$/.test(trimmed)) {
      // Horizontal rule / section divider
      if (inUl) { out.push('</ul>'); inUl = false; }
      out.push('<hr />');
    } else if (trimmed === '') {
      if (inUl) { out.push('</ul>'); inUl = false; }
      // Empty line → paragraph break (rendered as spacing via prose CSS)
      out.push('<p>&nbsp;</p>');
    } else {
      if (inUl) { out.push('</ul>'); inUl = false; }
      out.push(`<p>${line}</p>`);
    }
  }
  if (inUl) out.push('</ul>');
  return out.join('\n');
}

/* ── Enhance Q: / A: blocks with styled cards ───────────────── */
function enhanceFaqHtml(html: string): string {
  const qCard = (text: string) =>
    `<div class="not-prose my-3 flex gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">` +
    `<span class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">Q</span>` +
    `<p class="m-0 font-semibold leading-snug text-blue-900 dark:text-blue-100">${text}</p></div>`;
  const aCard = (text: string) =>
    `<div class="not-prose mb-4 flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950">` +
    `<span class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">A</span>` +
    `<p class="m-0 leading-relaxed text-emerald-900 dark:text-emerald-100">${text}</p></div>`;

  // ── Pass 1: <p> tags containing inline or standalone Q:/A: patterns ──────
  html = html.replace(/<p>([\s\S]*?)<\/p>/gi, (_match, inner) => {
    const t = inner.trim();
    if (!/Q:/i.test(t)) {
      if (/^A:\s*/i.test(t)) return aCard(t.replace(/^A:\s*/i, '').trim());
      return _match;
    }
    const parts = t.split(/(?=\bQ:\s)|(?=\bA:\s)/i);
    let hasQA = false;
    const out: string[] = [];
    for (const part of parts) {
      const p = part.trim();
      if (!p) continue;
      if (/^Q:\s*/i.test(p)) { out.push(qCard(p.replace(/^Q:\s*/i, '').trim())); hasQA = true; }
      else if (/^A:\s*/i.test(p)) { out.push(aCard(p.replace(/^A:\s*/i, '').trim())); hasQA = true; }
      else { out.push(`<p>${p}</p>`); }
    }
    return hasQA ? out.join('\n') : _match;
  });

  // ── Pass 2: Raw plain-text Q:/A: lines NOT inside HTML tags (mixed content) ─
  // Matches lines that start with Q: or A: at a line boundary, outside of tags
  html = html.replace(/(?:^|\n)(Q:[ \t]+)([^\n<]+)/gm, (_m, _pfx, text) =>
    '\n' + qCard(text.trim()));
  html = html.replace(/(?:^|\n)(A:[ \t]+)([^\n<]+)/gm, (_m, _pfx, text) =>
    '\n' + aCard(text.trim()));
  // Plain-text --- dividers and FAQ headings
  html = html.replace(/(?:^|\n)---+(?:\n|$)/gm, '\n<hr />\n');

  return html;
}

/* ── Parse FAQ blocks from content (Q: / A: pattern) ───────── */
function parseFaq(content: string): { q: string; a: string }[] {
  const pairs: { q: string; a: string }[] = [];
  const faqRegex = /Q:\s*(.+?)\s*\n+A:\s*([\s\S]+?)(?=\nQ:|\n*$)/gi;
  let m: RegExpExecArray | null;
  while ((m = faqRegex.exec(content)) !== null) {
    pairs.push({ q: m[1].trim(), a: m[2].trim().replace(/<[^>]+>/g, '') });
  }
  return pairs;
}

const CATEGORY_LABELS: Record<string, string> = {
  news: 'ข่าวสาร', tips: 'เคล็ดลับ', school: 'รีวิวสถาบัน',
  life: 'ชีวิตในต่างประเทศ', other: 'ทั่วไป', review: 'รีวิว',
};

/* ── SEO JSON-LD helpers ─────────────────────────────────── */
function StructuredData({ post, url }: { post: LivePost; url: string }) {
  const title    = post.seoTitle || post.titleTh || post.title || '';
  const desc     = post.seoDescription || post.excerptTh || post.excerpt || '';
  const cover    = post.coverImageUrl
    ? (post.coverImageUrl.startsWith('http') ? post.coverImageUrl : post.coverImageUrl)
    : '';
  const author   = post.authorTh || post.author || 'Philingo';
  const date     = post.publishedAt ?? new Date().toISOString();
  const keywords = [
    ...(post.seoKeywords ? post.seoKeywords.split(',').map(s => s.trim()) : []),
    ...(post.tags ?? []),
  ].filter(Boolean).join(', ');
  const section  = CATEGORY_LABELS[post.category ?? ''] ?? 'บทความ';

  const publisher = {
    '@type': 'Organization',
    name: 'Philingo by Thai Study Abroad Consultant',
    url: 'https://philingoedu.com',
    logo: { '@type': 'ImageObject', url: 'https://philingoedu.com/logo.png' },
    sameAs: ['https://www.facebook.com/philingo', 'https://lin.ee/philingo'],
  };

  // Article
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: desc,
    image: [cover],
    author: { '@type': 'Person', name: author },
    publisher,
    datePublished: date,
    dateModified: date,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    keywords,
    articleSection: section,
    inLanguage: 'th',
  };

  // BreadcrumbList
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'หน้าแรก', item: 'https://philingoedu.com' },
      { '@type': 'ListItem', position: 2, name: section, item: `https://philingoedu.com/${post.category === 'review' || !post.category ? 'reviews' : 'blog'}` },
      { '@type': 'ListItem', position: 3, name: title, item: url },
    ],
  };

  // FAQPage (parse Q:/A: blocks from content)
  const rawContent = post.contentTh || post.content || '';
  const faqItems = parseFaq(rawContent);
  const faqLd = faqItems.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  } : null;

  const scripts = [articleLd, breadcrumbLd, ...(faqLd ? [faqLd] : [])];

  return (
    <>
      {scripts.map((ld, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      ))}
    </>
  );
}

/* ── Full meta head injection ────────────────────────────── */
function PostMeta({ post }: { post: LivePost }) {
  const title    = post.seoTitle || post.titleTh || post.title || 'Philingo รีวิว';
  const desc     = post.seoDescription || post.excerptTh || post.excerpt || '';
  const keywords = [
    ...(post.seoKeywords ? post.seoKeywords.split(',').map(s => s.trim()) : []),
    ...(post.tags ?? []),
  ].filter(Boolean).join(', ');
  const cover    = post.coverImageUrl ?? '';
  const author   = post.authorTh || post.author || 'Philingo';
  const section  = CATEGORY_LABELS[post.category ?? ''] ?? 'บทความ';
  const canonical = typeof window !== 'undefined' ? window.location.href : '';
  const date     = post.publishedAt ?? '';

  useEffect(() => {
    document.title = `${title} | Philingo`;

    const set = (name: string, val: string, prop = false) => {
      if (!val) return;
      const sel = prop ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let el = document.querySelector(sel) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        prop ? el.setAttribute('property', name) : el.setAttribute('name', name);
        document.head.appendChild(el);
      }
      el.content = val;
    };
    const setLink = (rel: string, href: string) => {
      if (!href) return;
      let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
      if (!el) { el = document.createElement('link'); el.rel = rel; document.head.appendChild(el); }
      el.href = href;
    };

    // ── Standard SEO ──────────────────────────────────────
    set('description', desc);
    set('keywords', keywords);
    set('author', author);
    set('robots', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
    set('googlebot', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
    setLink('canonical', canonical);

    // ── Open Graph (complete) ─────────────────────────────
    set('og:type', 'article', true);
    set('og:title', title, true);
    set('og:description', desc, true);
    set('og:image', cover, true);
    set('og:image:width', '1200', true);
    set('og:image:height', '630', true);
    set('og:image:alt', title, true);
    set('og:url', canonical, true);
    set('og:site_name', 'Philingo — เรียนต่อฟิลิปปินส์', true);
    set('og:locale', 'th_TH', true);

    // ── Article Open Graph ────────────────────────────────
    set('article:published_time', date, true);
    set('article:modified_time', date, true);
    set('article:author', author, true);
    set('article:section', section, true);
    (post.tags ?? []).forEach(tag => set('article:tag', tag, true));

    // ── Twitter Card ──────────────────────────────────────
    set('twitter:card', 'summary_large_image');
    set('twitter:site', '@philingo_th');
    set('twitter:creator', '@philingo_th');
    set('twitter:title', title);
    set('twitter:description', desc);
    set('twitter:image', cover);
    set('twitter:image:alt', title);

  }, [title, desc, keywords, cover, author, section, canonical, date]);

  return <StructuredData post={post} url={canonical} />;
}

/* ── Related posts ─────────────────────────────────────── */
function RelatedPosts({ currentId, category }: { currentId: number; category: string | null }) {
  const { data } = useQuery<{ data: LivePost[] }>({
    queryKey: ['related-posts', category],
    queryFn: () =>
      fetch(`${BASE}/api/blog?category=${category || 'review'}&isPublished=true&limit=4`)
        .then(r => r.ok ? r.json() : { data: [] }),
    staleTime: 60_000,
  });
  const related = (data?.data ?? []).filter(p => p.id !== currentId).slice(0, 3);
  if (!related.length) return null;

  return (
    <div>
      <h4 className="font-bold text-gray-700 dark:text-gray-300 text-sm mb-3">รีวิวอื่นๆ ที่น่าสนใจ</h4>
      <div className="space-y-3">
        {related.map(r => (
          <Link key={r.id} href={`/posts/${r.slug}`}
            className="flex gap-3 group items-start p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            {r.coverImageUrl && (
              <img src={r.coverImageUrl} alt={r.titleTh || r.title || ''} className="w-16 h-12 object-cover rounded-lg shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 line-clamp-2 group-hover:text-primary transition-colors leading-tight">
                {r.titleTh || r.title}
              </p>
              <p className="text-[11px] text-gray-400 mt-1">{r.authorTh || r.author || 'Philingo'}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ── Main component ─────────────────────────────────────── */
export default function PostDetail() {
  const settings  = useSettings();
  const LINE_URL  = settings.line_url || 'https://lin.ee/nBR4rsN';
  const params    = useParams<{ id: string }>();
  const slug      = params?.id ?? '';

  const { data: post, isLoading, isError } = useQuery<LivePost>({
    queryKey: ['post', slug],
    queryFn: () =>
      fetch(`${BASE}/api/blog/${encodeURIComponent(slug)}`, { cache: 'no-store' })
        .then(r => { if (!r.ok) throw new Error('not found'); return r.json(); }),
    enabled: !!slug,
    retry: false,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  /* Track view count once */
  useEffect(() => {
    if (post?.id) {
      fetch(`${BASE}/api/blog/${post.id}/sort`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: '{}' }).catch(() => {});
    }
  }, [post?.id]);

  /* ── Loading ── */
  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  /* ── Not found ── */
  if (isError || !post) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
          <div className="text-6xl">📄</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ไม่พบบทความ</h1>
          <p className="text-gray-500 text-sm">บทความนี้อาจถูกลบหรือ URL ไม่ถูกต้อง</p>
          <Link href="/reviews" className="text-primary hover:underline flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> กลับไปหน้ารีวิว
          </Link>
        </div>
      </Layout>
    );
  }

  const isReview  = !post.category || post.category === 'review';
  const backHref  = isReview ? '/reviews' : '/blog';
  const backLabel = isReview ? 'รีวิวทั้งหมด' : 'บทความทั้งหมด';
  const title     = post.titleTh || post.title || '';
  const content   = post.contentTh || post.content || '';
  const author    = post.authorTh || post.author || '';
  const coverFallback = `https://picsum.photos/seed/${post.slug}/1200/630`;

  return (
    <Layout>
      <PostMeta post={post} />

      {/* Hero image */}
      <div className="w-full h-72 md:h-96 relative overflow-hidden bg-gray-900">
        <img
          src={post.coverImageUrl || coverFallback}
          alt={title}
          fetchPriority="high"
          className="w-full h-full object-cover"
        />
        {/* Thin gradient only at bottom for text legibility — image itself is 100% opacity */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 container max-w-4xl mx-auto px-4 pb-8">
          <Link href={backHref} className="inline-flex items-center gap-1.5 text-white/80 hover:text-white text-sm mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> {backLabel}
          </Link>
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.slice(0, 3).map((tag, i) => (
                <span key={i} className="inline-block bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="container max-w-4xl mx-auto px-4 py-10">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* ── Article body ── */}
          <article className="lg:col-span-2">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-tight mb-4">
                {title}
              </h1>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
                {author && (
                  <span className="flex items-center gap-1.5">
                    <User className="w-4 h-4" /> {author}
                  </span>
                )}
                {post.publishedAt && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {new Date(post.publishedAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                )}
                {post.views > 0 && (
                  <span className="flex items-center gap-1.5 text-xs">
                    👁 {post.views.toLocaleString()} ครั้ง
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => { if (navigator.share) navigator.share({ title, url: window.location.href }); else navigator.clipboard.writeText(window.location.href); }}
                  className="flex items-center gap-1.5 ml-auto text-primary hover:underline"
                >
                  <Share2 className="w-4 h-4" /> แชร์
                </button>
              </div>

              {/* Excerpt (if content missing) */}
              {!content && (post.excerptTh || post.excerpt) && (
                <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-6 italic">
                  {post.excerptTh || post.excerpt}
                </p>
              )}

              {/* Content — convert Markdown → HTML if needed */}
              {content ? (
                <div
                  className="prose prose-lg dark:prose-invert max-w-none
                    prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white
                    prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed
                    prose-blockquote:border-primary prose-blockquote:bg-primary/5 prose-blockquote:rounded-r-2xl prose-blockquote:italic
                    prose-img:rounded-2xl prose-img:shadow-lg prose-img:max-w-full prose-img:h-auto
                    prose-a:text-primary prose-a:underline
                    prose-ul:list-disc prose-ul:pl-5 prose-li:text-gray-700 dark:prose-li:text-gray-300
                    prose-strong:text-gray-900 dark:prose-strong:text-white
                    [&_img]:max-w-full [&_img]:h-auto [&_img]:w-auto"
                  dangerouslySetInnerHTML={{ __html: enhanceFaqHtml(mdToHtml(content)) }}
                />
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <div className="text-4xl mb-3">📝</div>
                  <p>เนื้อหากำลังอัปเดต — กลับมาเยี่ยมชมเร็วๆ นี้</p>
                </div>
              )}

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  {post.tags.map((t, i) => (
                    <span key={i} className="flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-full">
                      <Tag className="w-3 h-3" /> {t}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          </article>

          {/* ── Sidebar ── */}
          <aside className="space-y-5">
            {/* CTA */}
            <div className="bg-primary rounded-2xl p-6 text-white text-center">
              <div className="text-3xl mb-3">🎓</div>
              <h3 className="font-bold text-lg mb-2">สนใจเรียนที่นี่?</h3>
              <p className="text-sm text-white/80 mb-4">ปรึกษาฟรีกับทีม Philingo รับโปรโมชั่นพิเศษ</p>
              <a href={LINE_URL} target="_blank" rel="noreferrer"
                className="flex items-center justify-center gap-2 bg-[#00B900] hover:bg-[#009900] text-white font-bold py-3 px-4 rounded-xl transition-all text-sm mb-2">
                <SiLine className="w-4 h-4" /> ทักหาผ่าน LINE
              </a>
              <Link href="/register"
                className="flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-4 rounded-xl transition-all text-sm">
                สมัครเรียนเลย
              </Link>
            </div>

            {/* School/tags info */}
            {post.tags && post.tags.length > 0 && (
              <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-5">
                <h4 className="font-bold text-gray-700 dark:text-gray-300 text-sm mb-3">ข้อมูลในบทความนี้</h4>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((t, i) => (
                    <span key={i} className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-full">{t}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Related posts */}
            <RelatedPosts currentId={post.id} category={post.category} />
          </aside>
        </div>
      </div>
    </Layout>
  );
}
