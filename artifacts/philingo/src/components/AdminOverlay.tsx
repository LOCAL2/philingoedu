import React, { createContext, useContext, useEffect, useState } from 'react';

const BASE = (import.meta.env.BASE_URL ?? '').replace(/\/$/, '');

type AdminModeCtx = { isAdmin: boolean };
const AdminModeContext = createContext<AdminModeCtx>({ isAdmin: false });

/** Silently checks /api/auth/me — only admins who are logged in see the toolbar */
export function AdminModeProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Only attempt auth check if a token exists — avoids 401 console noise for public visitors
    const token = localStorage.getItem('philingo_admin_token');
    if (!token) return;
    fetch(`${BASE}/api/auth/me`, {
      credentials: 'include',
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => (r.ok ? r.json() : null))
      .then(user => { if (user?.id) setIsAdmin(true); })
      .catch(() => {});
  }, []);

  return (
    <AdminModeContext.Provider value={{ isAdmin }}>

      {children}
    </AdminModeContext.Provider>
  );
}

export function useAdminMode() {
  return useContext(AdminModeContext);
}

/** Yellow bar pinned to top — only visible when admin is logged in */
export function AdminModeToolbar() {
  const { isAdmin } = useAdminMode();
  if (!isAdmin) return null;
  return (
    <div className="fixed top-0 left-0 right-0 z-[300] flex items-center justify-between px-4 py-2 text-xs font-bold text-gray-900 shadow-xl bg-yellow-400">
      <span className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-gray-900 animate-pulse inline-block" />
        🔧 Admin Mode — hover เพื่อแก้ไข
      </span>
      <a
        href="/admin/"
        className="rounded-lg bg-gray-900 px-3 py-1.5 text-white hover:bg-gray-700 transition-colors"
      >
        ← Admin Panel
      </a>
    </div>
  );
}

/**
 * Wrap any CMS-connected section.
 * In admin mode: yellow border + edit button on hover.
 * For regular visitors: renders children as-is (no extra markup).
 */
export function AdminEditSection({
  children,
  href,
  label,
  className = '',
}: {
  children: React.ReactNode;
  href: string;
  label: string;
  className?: string;
}) {
  const { isAdmin } = useAdminMode();

  if (!isAdmin) return <>{children}</>;

  return (
    <div className={`relative group/ae ${className}`}>
      {children}
      {/* pointer-events-none stays on at ALL times so clicks always reach the children below.
          Only the edit button itself restores pointer-events-auto. */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-150 group-hover/ae:opacity-100 z-50">
        <div className="absolute inset-0 border-4 border-yellow-400 pointer-events-none" />
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          onClick={e => e.stopPropagation()}
          className="pointer-events-auto absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 whitespace-nowrap rounded-xl bg-yellow-400 px-6 py-3 text-sm font-bold text-gray-900 shadow-2xl transition-transform hover:scale-105 hover:bg-yellow-300"
        >
          ✏️ {label}
        </a>
      </div>
    </div>
  );
}
