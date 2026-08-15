import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { dashboardApi } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import { ContactStatusBadge } from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { School, BookOpen, FileText, Mail, ClipboardList, Eye, TrendingUp } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ label, value, icon, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4 shadow-sm">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
      </div>
    </div>
  );
}

// Mock chart data if API doesn't have it
const mockChartData = Array.from({ length: 7 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (6 - i));
  return {
    date: d.toLocaleDateString('th-TH', { month: 'short', day: 'numeric' }),
    count: Math.floor(Math.random() * 10) + 1,
  };
});

export function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: dashboardApi.stats,
  });

  const { data: recent, isLoading: recentLoading } = useQuery({
    queryKey: ['dashboard', 'recent'],
    queryFn: dashboardApi.recent,
  });

  const chartData = recent?.submissionsPerDay?.length
    ? recent.submissionsPerDay.map((d) => ({
        date: new Date(d.date).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' }),
        count: d.count,
      }))
    : mockChartData;

  return (
    <AdminLayout title="Dashboard">
      {statsLoading ? (
        <PageLoader />
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4 mb-6">
            <StatCard
              label="โรงเรียนทั้งหมด"
              value={stats?.totalSchools ?? 0}
              icon={<School className="h-6 w-6 text-white" />}
              color="bg-[#1B4FD8]"
            />
            <StatCard
              label="หลักสูตรทั้งหมด"
              value={stats?.totalCourses ?? 0}
              icon={<BookOpen className="h-6 w-6 text-white" />}
              color="bg-purple-600"
            />
            <StatCard
              label="บทความ"
              value={stats?.blogPosts ?? 0}
              icon={<FileText className="h-6 w-6 text-white" />}
              color="bg-green-600"
            />
            <StatCard
              label="ติดต่อใหม่ (7d)"
              value={stats?.newContacts7d ?? 0}
              icon={<Mail className="h-6 w-6 text-white" />}
              color="bg-orange-500"
            />
            <StatCard
              label="ฟอร์มใหม่ (7d)"
              value={stats?.newForms7d ?? 0}
              icon={<ClipboardList className="h-6 w-6 text-white" />}
              color="bg-pink-600"
            />
            <StatCard
              label="ผู้เข้าชมวันนี้"
              value={stats?.pageViewsToday ?? 0}
              icon={<Eye className="h-6 w-6 text-white" />}
              color="bg-teal-500"
            />
            <StatCard
              label="ผู้เข้าชมทั้งหมด"
              value={stats?.pageViewsTotal ?? 0}
              icon={<TrendingUp className="h-6 w-6 text-white" />}
              color="bg-cyan-600"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <h2 className="text-base font-semibold text-gray-900 mb-4">
                การส่งแบบฟอร์ม / ติดต่อ (7 วันที่ผ่านมา)
              </h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} margin={{ top: 0, right: 8, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip
                    formatter={(val) => [val, 'รายการ']}
                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  />
                  <Bar dataKey="count" fill="#1B4FD8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Recent contacts */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <h2 className="text-base font-semibold text-gray-900 mb-4">
                ข้อความติดต่อล่าสุด
              </h2>
              {recentLoading ? (
                <div className="flex justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-4 border-[#1B4FD8] border-t-transparent" />
                </div>
              ) : (
                <div className="space-y-2">
                  {(recent?.contacts ?? []).slice(0, 8).map((c) => (
                    <div key={c.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{c.name}</p>
                        <p className="text-xs text-gray-500">{c.subject ?? c.email}</p>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1">
                        <ContactStatusBadge status={c.status} />
                        <p className="text-xs text-gray-400">{formatDateTime(c.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                  {(!recent?.contacts || recent.contacts.length === 0) && (
                    <p className="text-sm text-gray-400 text-center py-8">ไม่มีข้อมูล</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
