import React from 'react';
import { Link, useLocation } from 'wouter';
import { Home, Gift, GraduationCap, CalendarDays, School } from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  { href: '/',           icon: Home,          label: 'หน้าแรก' },
  { href: '/promotions', icon: Gift,           label: 'โปรโมชั่น' },
  { href: '/schools',    icon: School,         label: 'สถาบัน' },
  { href: '/courses',    icon: GraduationCap,  label: 'คอร์ส' },
  { href: '/seminars',   icon: CalendarDays,   label: 'สัมมนา' },
];

export function MobileNav() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-t border-gray-200/50 dark:border-gray-800/50 shadow-[0_-8px_30px_rgba(0,0,0,0.05)] pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-5 h-[68px]">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = location === href || (href !== '/' && location.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex flex-col items-center justify-center gap-1 w-full h-full transition-colors ${
                active
                  ? 'text-primary'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <div className="relative flex items-center justify-center w-10 h-10">
                {active && (
                  <motion.div
                    layoutId="mobile-nav-pill"
                    className="absolute inset-0 bg-primary/10 dark:bg-primary/20 rounded-full"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <motion.div
                  animate={active ? { scale: [1, 0.8, 1.1, 1] } : { scale: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <Icon className={`w-5 h-5 relative z-10 ${active ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                </motion.div>
                
                {active && (
                  <motion.span 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full" 
                  />
                )}
              </div>
              <span className={`text-[10px] leading-none transition-all ${active ? 'font-bold' : 'font-medium'}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
