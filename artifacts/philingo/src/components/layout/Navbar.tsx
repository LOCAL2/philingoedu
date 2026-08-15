import React from 'react';
import { useLanguage } from '../../lib/language-context';
import { Link, useLocation } from 'wouter';
import { Menu, X, Sun, Moon, ChevronDown, ChevronUp } from 'lucide-react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '@assets/philingo_logo_transparent.png';

// School logos for dropdown
import ciaLogo      from '@assets/image_1785200711221.png';
import qqLogo       from '@assets/image_1785200772068.png';
import philinterLogo from '@assets/image_1785200753254.png';
import bcebuLogo    from '@assets/image_1785200917465.png';
import cpilsLogo    from '@assets/image_1785200802634.png';
import evLogo       from '@assets/image_1785200695195.png';

const SCHOOL_MENU = [
  { slug: 'cia',        name: 'CIA',          city: 'Mactan, Cebu',   logo: ciaLogo,       logoText: null },
  { slug: 'qq-english', name: 'QQ English',   city: 'IT Park, Cebu',  logo: qqLogo,        logoText: null },
  { slug: 'philinter',  name: 'Philinter',    city: 'Mactan, Cebu',   logo: philinterLogo, logoText: null },
  { slug: 'b-cebu',     name: "B'Cebu",       city: 'Banilad, Cebu',  logo: bcebuLogo,     logoText: null },
  { slug: 'cpils',      name: 'CPILS',        city: 'Cebu City',      logo: cpilsLogo,     logoText: null },
  { slug: 'ev-academy', name: 'EV Academy',   city: 'Cebu City',      logo: evLogo,        logoText: null },
  { slug: 'smeag',      name: 'SMEAG',        city: 'Cebu City',      logo: null,          logoText: 'SMEAG' },
  { slug: 'pines',      name: 'PINES',        city: 'Baguio City',    logo: null,          logoText: 'PINES' },
  { slug: 'bcebu',      name: "B'Cebu Baguio",city: 'Baguio City',    logo: bcebuLogo,     logoText: null },
];

export function Navbar() {
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = React.useState(false);
  const [showSchools, setShowSchools] = React.useState(false);
  const [, setLocation] = useLocation();
  const schoolsTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const [location] = useLocation();

  const openSchools  = () => { if (schoolsTimer.current) clearTimeout(schoolsTimer.current); setShowSchools(true); };
  const closeSchools = () => { schoolsTimer.current = setTimeout(() => setShowSchools(false), 120); };

  const mainLinks: { href: string; label: string; hasDropdown?: boolean }[] = [
    { href: '/', label: t('nav.home') },
    { href: '/about', label: t('nav.about') },
    { href: '/courses', label: t('nav.courses') },
    { href: '/schools', label: t('nav.schools'), hasDropdown: true },
    { href: '/promotions', label: t('nav.promotions') },
    { href: '/seminars', label: 'งานสัมมนา' },
  ];

  const moreLinks = [
    { href: '/why-philippines', label: t('nav.why_ph') },
    { href: '/services', label: t('nav.services') },
    { href: '/reviews', label: t('nav.reviews') },
    { href: '/blog', label: t('nav.blog') },
    { href: '/faq', label: t('nav.faq') },
    { href: '/contact', label: t('nav.contact') },
  ];

  const allLinks: { href: string; label: string; hasDropdown?: boolean }[] = [...mainLinks, ...moreLinks];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-yellow-300 bg-white/97 backdrop-blur supports-[backdrop-filter]:bg-white/95 shadow-sm">
      {/* ── Main row ── */}
      <div className="container max-w-7xl mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <img src={logo} alt="Philingo" className="h-12 w-auto" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-2 xl:gap-3 text-[13px] font-medium whitespace-nowrap flex-1 justify-center">
          {allLinks.map((link) => {
            if (link.hasDropdown) {
              return (
                <div
                  key={link.href}
                  className="relative py-2"
                  onMouseEnter={openSchools}
                  onMouseLeave={closeSchools}
                >
                  <Link
                    href={link.href}
                    className={`inline-flex items-center gap-1 whitespace-nowrap transition-colors hover:text-primary ${location === link.href || location.startsWith('/schools/') ? 'text-primary font-bold' : 'text-gray-700 dark:text-gray-300'}`}
                  >
                    {link.label}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${showSchools ? 'rotate-180 text-primary' : ''}`} />
                  </Link>

                  {/* Schools Mega Dropdown */}
                  <AnimatePresence>
                    {showSchools && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-0 bg-white dark:bg-gray-900 shadow-2xl rounded-2xl border border-gray-100 dark:border-gray-800 p-4 z-50 w-[640px]"
                        onMouseEnter={openSchools}
                        onMouseLeave={closeSchools}
                      >
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 px-1">
                          โรงเรียนพาร์ทเนอร์ทั้งหมด
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          {SCHOOL_MENU.map((s) => (
                            <Link
                              key={s.slug}
                              href={`/schools/${s.slug}`}
                              onClick={() => setShowSchools(false)}
                              className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors group border border-transparent hover:border-primary/20"
                            >
                              <div className="w-10 h-10 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center shrink-0 border border-gray-100 dark:border-gray-700 shadow-sm">
                                {s.logo ? (
                                  <img src={s.logo} alt={s.name} className="w-7 h-7 object-contain" />
                                ) : (
                                  <span className="text-[10px] font-black text-gray-700 dark:text-gray-300">{s.logoText}</span>
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="text-sm font-bold text-gray-800 dark:text-gray-200 group-hover:text-primary leading-tight truncate">{s.name}</div>
                                <div className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight mt-0.5">{s.city}</div>
                              </div>
                            </Link>
                          ))}
                        </div>
                        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 text-center">
                          <Link
                            href="/schools"
                            onClick={() => setShowSchools(false)}
                            className="inline-flex items-center justify-center gap-1.5 text-sm font-bold text-primary hover:underline"
                          >
                            ดูโรงเรียนทั้งหมด <ChevronDown className="w-4 h-4 -rotate-90" />
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap transition-colors hover:text-primary ${location === link.href ? 'text-primary font-bold' : 'text-gray-700 dark:text-gray-300'}`}
              >
                {link.label}
              </Link>
            );
          })}

        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Language Toggle */}
          <div className="flex items-center bg-gray-100 rounded-full p-1">
            <button
              onClick={() => setLanguage('th')}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${language === 'th' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'}`}
            >
              TH
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${language === 'en' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'}`}
            >
              EN
            </button>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* CTAs (desktop) */}
          <div className="hidden xl:flex items-center gap-2 shrink-0">
            <Link href="/register" className="bg-primary hover:bg-primary/90 text-white px-3 py-1.5 rounded-md text-xs font-semibold transition-colors shadow-sm whitespace-nowrap">
              {t('common.apply_now')}
            </Link>
            <Link href="/contact" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-3 py-1.5 rounded-md text-xs font-semibold transition-colors shadow-sm whitespace-nowrap">
              {t('common.register_free')}
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden flex items-center gap-1.5 bg-primary/10 text-primary px-3.5 py-2 rounded-lg text-sm font-bold active:scale-95 transition-transform min-h-[44px] min-w-[44px] justify-center"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? 'ปิดเมนู' : 'เปิดเมนู'}
            aria-expanded={isOpen}
            aria-controls="mobile-drawer"
          >
            {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            <span className="hidden sm:inline">เมนู</span>
          </button>
        </div>
      </div>

      {/* ── Mobile nav — dropdown select (replaces horizontal scroll strip) ── */}
      <div className="lg:hidden border-t border-gray-100 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm px-4 py-2">
        <div className="relative">
          {/* Current page label shown in the select */}
          <select
            value={
              allLinks.find(l => l.href === location || (l.href === '/schools' && location.startsWith('/schools/')))?.href ?? ''
            }
            onChange={e => { if (e.target.value) setLocation(e.target.value); }}
            className="w-full appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 font-bold text-sm rounded-xl px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary cursor-pointer shadow-sm"
            aria-label="เลือกหน้า"
          >
            <option value="" disabled>— เลือกหน้า —</option>
            {allLinks.map(link => (
              <option key={link.href} value={link.href}>{link.label}</option>
            ))}
          </select>
          {/* Custom arrow icon */}
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            <ChevronDown className="w-4 h-4" />
          </span>
        </div>
      </div>

      {/* Mobile Full Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed inset-0 z-30 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              id="mobile-drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="lg:hidden fixed inset-y-0 right-0 z-40 w-4/5 max-w-sm bg-white dark:bg-gray-900 shadow-2xl border-l border-gray-100 dark:border-gray-800 flex flex-col"
              role="dialog"
              aria-modal="true"
              aria-label="เมนูนำทาง"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
                <span className="font-bold text-gray-900 dark:text-white">เมนู</span>
                <button onClick={() => setIsOpen(false)} className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                <div className="space-y-1">
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-2">เมนูหลัก</div>
                  {mainLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`block text-base font-bold p-3 rounded-xl transition-colors ${location === link.href ? 'bg-primary/10 text-primary' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>

                <div className="space-y-1">
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-2">เพิ่มเติม</div>
                  {moreLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`block text-sm font-medium p-3 rounded-xl transition-colors ${location === link.href ? 'bg-primary/10 text-primary font-bold' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>

                {/* Schools sub-grid in mobile drawer */}
                <div className="pt-2">
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-3">โรงเรียนทั้งหมด</div>
                  <div className="grid grid-cols-2 gap-2">
                    {SCHOOL_MENU.map((s) => (
                      <Link
                        key={s.slug}
                        href={`/schools/${s.slug}`}
                        onClick={() => setIsOpen(false)}
                        className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-gray-50 dark:bg-gray-800 hover:bg-primary/10 text-center border border-transparent active:scale-95 transition-all"
                      >
                        <div className="w-10 h-10 bg-white dark:bg-gray-700 rounded-xl flex items-center justify-center border border-gray-100 dark:border-gray-600 shadow-sm">
                          {s.logo ? (
                            <img src={s.logo} alt={s.name} className="w-7 h-7 object-contain" />
                          ) : (
                            <span className="text-[10px] font-black text-gray-700 dark:text-gray-300">{s.logoText}</span>
                          )}
                        </div>
                        <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 leading-tight">{s.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 space-y-3">
                {/* Language Toggle */}
                <div className="flex items-center justify-between px-1">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">ภาษา / Language</span>
                  <div className="flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full p-1 gap-1">
                    <button
                      onClick={() => setLanguage('th')}
                      className={`px-4 py-1.5 text-sm font-bold rounded-full transition-all ${language === 'th' ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                    >
                      TH
                    </button>
                    <button
                      onClick={() => setLanguage('en')}
                      className={`px-4 py-1.5 text-sm font-bold rounded-full transition-all ${language === 'en' ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                    >
                      EN
                    </button>
                  </div>
                </div>
                <Link href="/register" onClick={() => setIsOpen(false)} className="flex items-center justify-center w-full bg-primary hover:bg-primary/90 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all">
                  {t('common.apply_now')}
                </Link>
                <Link href="/contact" onClick={() => setIsOpen(false)} className="flex items-center justify-center w-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white py-3 rounded-xl font-bold active:scale-95 transition-all">
                  {t('common.register_free')}
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
