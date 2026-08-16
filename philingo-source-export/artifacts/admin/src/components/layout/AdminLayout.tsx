import React from 'react';
import { LogOut, ChevronDown } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/useToast';
import { useLocation } from 'wouter';

interface AdminLayoutProps {
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export function AdminLayout({ title, children, actions }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const handleLogout = async () => {
    await logout();
    toast('ออกจากระบบแล้ว', 'info');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      {/* Main content */}
      <div className="flex-1 ml-60 flex flex-col min-h-screen">
        {/* Top header */}
        <header className="sticky top-0 z-20 bg-white border-b border-gray-200 px-6 py-0 h-14 flex items-center justify-between shadow-sm">
          <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
          <div className="flex items-center gap-3">
            {actions}
            {/* User menu */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#1B4FD8] flex items-center justify-center text-white text-sm font-semibold">
                {user?.name?.charAt(0)?.toUpperCase() ?? 'A'}
              </div>
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900 leading-tight">{user?.name}</p>
                <p className="text-xs text-gray-500 leading-tight">{user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="ml-1 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
                title="ออกจากระบบ"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
