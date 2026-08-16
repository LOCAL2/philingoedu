import React, { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { ChevronLeft, ChevronRight, MapPin, Star } from 'lucide-react';
import { SCHOOL_COVER_PHOTO, SCHOOL_MIN_PRICE_4W } from '@/data/schoolsMeta';

const BASE = (import.meta.env.BASE_URL ?? '').replace(/\/$/, '');

interface ApiSchool {
  id: number;
  slug: string;
  name: string;
  nameTh: string | null;
  city: string | null;
  logoUrl: string | null;
  photos: string[] | null;
  rating: number | null;
  pricingConfig: any | null;
  isFeatured: boolean;
  isActive: boolean;
}

/** Starting price per week — prefers DB pricingConfig, falls back to static programs data */
function getStartingPrice(school: ApiSchool): string {
  // 1. Try DB pricingConfig
  const cfg = school.pricingConfig;
  if (cfg?.courses?.length && cfg?.rooms?.length) {
    try {
      const rate = cfg.exchangeRateUsdThb ?? 33.5;
      const minCourse = Math.min(...cfg.courses.map((c: any) => c.pricePerFourWeeks ?? 99999));
      const minRoom   = Math.min(...cfg.rooms.map((r: any) => r.pricePerFourWeeks ?? 99999));
      if (isFinite(minCourse) && isFinite(minRoom) && minCourse < 99999 && minRoom < 99999) {
        const thbW4 = Math.round((minCourse + minRoom) * rate);
        const perWeek = Math.round(thbW4 / 4);
        return `฿${perWeek.toLocaleString()}/สัปดาห์`;
      }
    } catch { /* fall through */ }
  }

  // 2. Fall back to static programs data (all-in THB prices, already accurate)
  const w4 = SCHOOL_MIN_PRICE_4W[school.slug];
  if (w4) {
    const perWeek = Math.round(w4 / 4);
    return `฿${perWeek.toLocaleString()}/สัปดาห์`;
  }

  return '';
}

/** Cover photo — prefers DB photos[0] → logoUrl → static fallback */
function getCoverPhoto(school: ApiSchool): string | null {
  if (school.photos && school.photos.length > 0) return school.photos[0];
  if (school.logoUrl) return school.logoUrl;
  return SCHOOL_COVER_PHOTO[school.slug] ?? null;
}

export function SchoolCarousel({ currentSlug }: { currentSlug: string }) {
  const [, navigate] = useLocation();
  const { data: raw } = useQuery<ApiSchool[]>({
    queryKey: ['schools-carousel'],
    queryFn: () =>
      fetch(`${BASE}/api/schools?isActive=true&limit=100`)
        .then(r => r.ok ? r.json() : { data: [] })
        .then(d => (d.data ?? []) as ApiSchool[]),
    staleTime: 60_000,
  });

  const schools = (raw ?? []).filter(s => s.slug !== currentSlug);
  const items = schools.length > 0 ? [...schools, ...schools] : [];

  const trackRef = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const CARD_W = 264;

  useEffect(() => {
    const el = trackRef.current;
    if (!el || schools.length === 0) return;
    el.scrollTo({ left: idx * CARD_W, behavior: 'smooth' });
    if (idx >= schools.length) {
      setTimeout(() => {
        if (trackRef.current) {
          trackRef.current.scrollLeft = 0;
          setIdx(0);
        }
      }, 350);
    }
  }, [idx, schools.length]);

  useEffect(() => {
    if (paused || schools.length === 0) return;
    const t = setInterval(() => setIdx(i => i + 1), 3500);
    return () => clearInterval(t);
  }, [paused, schools.length]);

  const prev = () => {
    setIdx(i => {
      if (i <= 0) {
        if (trackRef.current) trackRef.current.scrollLeft = schools.length * CARD_W;
        return schools.length - 1;
      }
      return i - 1;
    });
  };
  const next = () => setIdx(i => i + 1);

  const handleCardClick = (slug: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    navigate(`/schools/${slug}`);
  };

  if (schools.length === 0) return null;

  return (
    <section className="py-14 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
      <div className="container max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">🏫 สถาบันการศึกษาอื่นๆ ที่น่าสนใจ</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">เปรียบเทียบและเลือกสถาบันที่เหมาะกับคุณ</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={prev}
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
              className="w-9 h-9 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={next}
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
              className="w-9 h-9 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Carousel track */}
        <div
          className="overflow-hidden"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div
            ref={trackRef}
            className="flex gap-4 overflow-x-hidden"
            style={{ scrollbarWidth: 'none' }}
          >
            {items.map((school, i) => {
              const cover = getCoverPhoto(school);
              const price = getStartingPrice(school);
              const hasLogo = school.logoUrl && cover !== school.logoUrl;
              return (
                <div
                  key={`${school.id}-${i}`}
                  onClick={() => handleCardClick(school.slug)}
                  className="shrink-0 w-60 cursor-pointer group"
                >
                  <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                    {/* Cover image */}
                    <div className="relative h-36 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-700 dark:to-gray-600 overflow-hidden">
                      {cover ? (
                        <img
                          src={cover}
                          alt={school.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-4xl">🏫</span>
                        </div>
                      )}

                      {/* Dark gradient overlay for text readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                      {/* Logo badge bottom-left */}
                      {hasLogo && (
                        <div className="absolute bottom-2 left-2 w-10 h-10 bg-white rounded-lg shadow-md p-1 flex items-center justify-center">
                          <img src={school.logoUrl!} alt={school.nameTh || school.name} className="w-full h-full object-contain" loading="lazy" />
                        </div>
                      )}

                      {/* City label bottom-right */}
                      {school.city && (
                        <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full">
                          <MapPin className="w-2.5 h-2.5 shrink-0" />
                          <span className="truncate max-w-[80px]">{school.city}</span>
                        </div>
                      )}

                      {/* Featured badge */}
                      {school.isFeatured && (
                        <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Star className="w-2.5 h-2.5" /> แนะนำ
                        </div>
                      )}

                      {/* Rating badge */}
                      {school.rating && (
                        <div className="absolute top-2 left-2 flex items-center gap-0.5 bg-black/50 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full">
                          <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                          <span>{school.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-snug mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                        {school.name}
                      </h3>

                      {price && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          เริ่มต้น <span className="text-primary font-bold">{price}</span>
                        </p>
                      )}

                      <div className="w-full text-center text-xs font-semibold text-primary border border-primary/30 rounded-lg py-1.5 mt-3 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-colors">
                        ดูรายละเอียด →
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
