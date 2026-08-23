import React from 'react';
import { useLocation, Link } from 'wouter';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  School,
  BookOpen,
  FileText,
  HelpCircle,
  Star,
  Gift,
  Image,
  Handshake,
  Camera,
  Users,
  Mail,
  ClipboardList,
  Settings,
  Send,
  CalendarDays,
  MessageSquare,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'โรงเรียน', href: '/schools', icon: <School className="h-5 w-5" /> },
  { label: 'หลักสูตร', href: '/courses', icon: <BookOpen className="h-5 w-5" /> },
  { label: 'บทความ', href: '/blog', icon: <FileText className="h-5 w-5" /> },
  { label: 'บทความรีวิว', href: '/reviews', icon: <MessageSquare className="h-5 w-5" /> },
  { label: 'FAQ', href: '/faqs', icon: <HelpCircle className="h-5 w-5" /> },
  { label: 'รีวิว', href: '/testimonials', icon: <Star className="h-5 w-5" /> },
  { label: 'โปรโมชั่น', href: '/promotions', icon: <Gift className="h-5 w-5" /> },
  { label: 'แบนเนอร์', href: '/banners', icon: <Image className="h-5 w-5" /> },
  { label: 'พาร์ทเนอร์', href: '/partners', icon: <Handshake className="h-5 w-5" /> },
  { label: 'แกลเลอรี', href: '/gallery', icon: <Camera className="h-5 w-5" /> },
  { label: 'ทีม', href: '/team', icon: <Users className="h-5 w-5" /> },
  { label: 'ติดต่อ', href: '/contacts', icon: <Mail className="h-5 w-5" /> },
  { label: 'แบบฟอร์ม', href: '/forms', icon: <ClipboardList className="h-5 w-5" /> },
  { label: 'กิจกรรม', href: '/events', icon: <CalendarDays className="h-5 w-5" /> },
  { label: 'Newsletter', href: '/newsletter', icon: <Send className="h-5 w-5" /> },
  { label: 'ตั้งค่าระบบ', href: '/settings', icon: <Settings className="h-5 w-5" /> },
  { label: 'SEO & ติดตาม', href: '/tracking', icon: <Settings className="h-5 w-5" /> },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <aside
      className="fixed top-0 left-0 h-full w-60 flex flex-col z-30"
      style={{ backgroundColor: '#1B4FD8' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 py-5 border-b border-white/10">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
          style={{ backgroundColor: '#F5B800', color: '#1B4FD8' }}
        >
          P
        </div>
        <div>
          <p className="text-white font-bold text-base leading-tight">Philingo</p>
          <p className="text-blue-200 text-xs">Admin Panel</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3">
        {navItems.map((item) => {
          const isActive = location === item.href || location.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 mx-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all mb-0.5',
                isActive
                  ? 'bg-white/15 text-white'
                  : 'text-blue-100 hover:bg-white/10 hover:text-white'
              )}
            >
              <span className={cn(isActive ? 'text-white' : 'text-blue-200')}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-white/10 space-y-2">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 w-full rounded-lg bg-yellow-400 px-3 py-2.5 text-xs font-bold text-gray-900 hover:bg-yellow-300 transition-colors"
        >
          🌐 ดูหน้าเว็บ
        </a>
        <p className="text-blue-300 text-xs text-center">© 2025 Philingo CMS</p>
      </div>
    </aside>
  );
}
