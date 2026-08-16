import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { useSeoMeta } from '@/hooks/use-seo-meta';
import {
  BookOpen, GraduationCap, Briefcase, Baby, Users, Monitor, Map, Clock,
  Shield, Laptop, Globe2, Star, MessageSquare, TrendingUp, Zap, Award,
  Heart, FileText, Building, Target, CheckCircle2
} from 'lucide-react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';

// ── Icon map from DB iconName string ──────────────────────────────
const ICON_MAP: Record<string, React.ElementType> = {
  BookOpen, GraduationCap, Briefcase, Baby, Users, Monitor, Map, Clock,
  Shield, Laptop, Globe2, Star, MessageSquare, TrendingUp, Zap, Award,
  Heart, FileText, Building, Target,
};

// ── Color map: DB colorClass (bg-X-500) → light badge classes ──────
const COLOR_MAP: Record<string, string> = {
  'bg-blue-500':   'bg-blue-100 text-blue-600',
  'bg-indigo-500': 'bg-indigo-100 text-indigo-600',
  'bg-green-500':  'bg-green-100 text-green-600',
  'bg-amber-500':  'bg-amber-100 text-amber-600',
  'bg-pink-500':   'bg-pink-100 text-pink-600',
  'bg-yellow-500': 'bg-yellow-100 text-yellow-600',
  'bg-violet-500': 'bg-violet-100 text-violet-600',
  'bg-cyan-500':   'bg-cyan-100 text-cyan-600',
  'bg-rose-500':   'bg-rose-100 text-rose-600',
  'bg-red-500':    'bg-red-100 text-red-600',
  'bg-slate-500':  'bg-slate-100 text-slate-600',
  'bg-teal-500':   'bg-teal-100 text-teal-600',
  'bg-purple-500': 'bg-purple-100 text-purple-600',
  'bg-sky-500':    'bg-sky-100 text-sky-600',
  'bg-emerald-500':'bg-emerald-100 text-emerald-600',
};

interface ApiCourse {
  id: number;
  slug: string;
  title: string;
  titleTh: string;
  descriptionTh: string | null;
  description: string | null;
  durationTh: string | null;
  duration: string | null;
  suitableForTh: string | null;
  priceDisplayTh: string | null;
  priceDisplay: string | null;
  colorClass: string | null;
  iconName: string | null;
  badgeTh: string | null;
  badge: string | null;
  isActive: boolean;
  sortOrder: number;
}

const BASE = (import.meta.env.BASE_URL ?? '').replace(/\/$/, '');

function fetchCourses(): Promise<ApiCourse[]> {
  return fetch(`${BASE}/api/courses?isActive=true&limit=50`)
    .then(r => r.ok ? r.json() : { data: [] })
    .then(d => (d.data ?? []) as ApiCourse[]);
}

export default function Courses() {
  const { data: courses = [], isLoading } = useQuery<ApiCourse[]>({
    queryKey: ['courses-public'],
    queryFn: fetchCourses,
    staleTime: 60_000,
  });
  useSeoMeta(
    'หลักสูตรภาษาอังกฤษที่ฟิลิปปินส์ทุกประเภท | Philingo',
    'เปรียบเทียบหลักสูตรภาษาอังกฤษที่ฟิลิปปินส์ ตั้งแต่ General English, IELTS, Business English จนถึงหลักสูตรเด็กและ Online'
  );

  return (
    <Layout>
      <section className="bg-gray-50 dark:bg-gray-900/50 py-16">
        <div className="container max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">หลักสูตรภาษาอังกฤษที่ฟิลิปปินส์</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            เลือกหลักสูตรที่ตรงกับเป้าหมายของคุณ ไม่ว่าจะเป็นการเรียนเพื่อการทำงาน สอบเรียนต่อ หรือพัฒนาทักษะการสื่อสารทั่วไป
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container max-w-7xl mx-auto px-4">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 animate-pulse">
                  <div className="w-14 h-14 rounded-xl bg-gray-200 dark:bg-gray-700 mb-6" />
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2 mb-4" />
                  <div className="space-y-2 mb-6">
                    <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded" />
                    <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-4/5" />
                  </div>
                  <div className="h-12 bg-gray-100 dark:bg-gray-700 rounded-xl mb-4" />
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-6" />
                  <div className="h-12 bg-gray-100 dark:bg-gray-700 rounded-xl" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {courses.map((course) => {
                const Icon = ICON_MAP[course.iconName ?? ''] ?? BookOpen;
                const colorCls = COLOR_MAP[course.colorClass ?? ''] ?? 'bg-blue-100 text-blue-600';
                const title = course.titleTh || course.title;
                const desc = course.descriptionTh || course.description || '';
                const duration = course.durationTh || course.duration || '-';
                const suitable = course.suitableForTh || '-';
                const price = course.priceDisplayTh || course.priceDisplay || '-';
                const badge = course.badgeTh || course.badge;

                return (
                  <div
                    key={course.id}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all flex flex-col group"
                  >
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${colorCls} group-hover:scale-110 transition-transform`}>
                      <Icon className="w-7 h-7" />
                    </div>

                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
                      {badge && (
                        <span className="shrink-0 text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full whitespace-nowrap">
                          {badge}
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">{course.title}</div>

                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 flex-1 line-clamp-3">
                      {desc}
                    </p>

                    <div className="space-y-2 mb-5 bg-gray-50 dark:bg-gray-900 p-3.5 rounded-xl text-sm">
                      <div className="flex items-start gap-2">
                        <Clock className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                        <span className="text-gray-700 dark:text-gray-300 font-medium">{duration}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Users className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                        <span className="text-gray-700 dark:text-gray-300 text-xs">{suitable}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 mb-5">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-lg font-bold text-primary">{price}</span>
                    </div>

                    <Link href="/contact" className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-primary hover:text-white text-gray-900 dark:text-white text-center py-3 rounded-xl font-medium transition-colors mt-auto">
                      ปรึกษาหลักสูตรฟรี
                    </Link>
                  </div>
                );
              })}

              {courses.length === 0 && !isLoading && (
                <div className="col-span-full text-center py-20 text-gray-400">ไม่พบหลักสูตร</div>
              )}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
