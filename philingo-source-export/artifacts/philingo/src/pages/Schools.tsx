import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useSeoMeta } from '@/hooks/use-seo-meta';
import { Search, MapPin, Star, Coffee, Wifi, Home, ArrowRight, Thermometer, Building2, ShieldCheck } from 'lucide-react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import cebuImg    from '@assets/city-photos/cebu.jpg';
import baguioImg  from '@assets/city-photos/baguio.jpg';
import clarkImg   from '@assets/city-photos/clark.jpg';
import manilaImg  from '@assets/city-photos/manila.jpg';
import iloiloImg  from '@assets/city-photos/iloilo.jpg';

const CITY_PHOTO: Record<string, string> = {
  Cebu: cebuImg, Baguio: baguioImg, Clark: clarkImg, Manila: manilaImg, Iloilo: iloiloImg,
};

const CITIES = [
  { slug: 'cebu',   nameTh: 'เซบู',      nameEn: 'Cebu',   emoji: '🏖️', temp: '28–32°C', schoolCount: 19, photo: cebuImg,   gradient: 'from-blue-600 to-cyan-500' },
  { slug: 'baguio', nameTh: 'บาเกียว',   nameEn: 'Baguio', emoji: '🏔️', temp: '18–22°C', schoolCount: 11, photo: baguioImg, gradient: 'from-teal-600 to-emerald-500' },
  { slug: 'clark',  nameTh: 'คลาร์ก',    nameEn: 'Clark',  emoji: '✈️', temp: '25–33°C', schoolCount: 4,  photo: clarkImg,  gradient: 'from-orange-500 to-amber-500' },
  { slug: 'manila', nameTh: 'มะนิลา',    nameEn: 'Manila', emoji: '🌆', temp: '25–35°C', schoolCount: 4,  photo: manilaImg, gradient: 'from-purple-600 to-indigo-600' },
  { slug: 'iloilo', nameTh: 'อิโลอิโล', nameEn: 'Iloilo', emoji: '🌺', temp: '27–31°C', schoolCount: 5,  photo: iloiloImg, gradient: 'from-rose-500 to-pink-500' },
];

// Philingo partner schools — shown in the main grid with full detail pages
type SchoolEntry = { id: number; name: string; nameTh?: string; slug: string; city: string; tags: string[]; rating: number; type: string; partner: boolean };
const allSchools: SchoolEntry[] = [
  // ── Cebu Partners ─────────────────────────────────────────────────────────────────────
  { id: 1,  name: 'CIA (Cebu International Academy)', slug: 'cia',        city: 'Cebu',   tags: ['Semi-Sparta','New Campus','IELTS','TOEIC'], rating: 4.8, type: 'ESL, IELTS, TOEIC, Business', partner: true },
  { id: 2,  name: 'QQ English',                        slug: 'qq-english', city: 'Cebu',   tags: ['Callan Method','IT Park','ESL','IELTS'],    rating: 4.7, type: 'ESL, IELTS, Business',        partner: true },
  { id: 3,  name: 'Philinter Academy',                 slug: 'philinter',  city: 'Cebu',   tags: ['Business','Speaking','Cambridge'],           rating: 4.7, type: 'ESL, Business, Cambridge',    partner: true },
  { id: 4,  name: "B'Cebu Language School",            slug: 'b-cebu',     city: 'Cebu',   tags: ['New Campus','Intensive','IELTS'],            rating: 4.6, type: 'ESL, IELTS, TOEIC',          partner: true },
  { id: 5,  name: 'CPILS',                             slug: 'cpils',      city: 'Cebu',   tags: ['Native Teachers','IELTS','ESL'],             rating: 4.7, type: 'ESL, IELTS, TOEIC',          partner: true },
  { id: 6,  name: 'EV Academy',                        slug: 'ev-academy', city: 'Cebu',   tags: ['Resort Style','French Owner','IELTS'],       rating: 4.7, type: 'ESL, IELTS',                 partner: true },
  { id: 7,  name: 'SMEAG Global School',               slug: 'smeag',      city: 'Cebu',   tags: ['Sparta','IELTS Guarantee','Big Campus'],     rating: 4.8, type: 'ESL, IELTS, TOEIC',          partner: true },
  // ── Cebu Other ────────────────────────────────────────────────────────────────────────
  { id: 10, name: 'English Fella',                     slug: 'english-fella',   city: 'Cebu',   tags: ['Semi-Sparta','Speaking','IT Park'],          rating: 4.5, type: 'ESL, IELTS', partner: false },
  { id: 11, name: 'Cebu Pelis Institute (CPI)',        slug: 'cpi',             city: 'Cebu',   tags: ['ESL','Affordable'],                          rating: 4.4, type: 'ESL, Speaking', partner: false },
  { id: 12, name: 'CELLA English Academy',             slug: 'cella',           city: 'Cebu',   tags: ['ESL','IELTS','General English'],             rating: 4.5, type: 'ESL, IELTS', partner: false },
  { id: 13, name: 'CG Academy',                        slug: 'cg-academy',      city: 'Cebu',   tags: ['Callan','ESL'],                              rating: 4.4, type: 'ESL, Business', partner: false },
  { id: 14, name: 'IMS Academy',                       slug: 'ims-academy',     city: 'Cebu',   tags: ['Intensive','IELTS','Small Class'],           rating: 4.5, type: 'ESL, IELTS', partner: false },
  { id: 15, name: 'GLC English Academy',               slug: 'glc-english',     city: 'Cebu',   tags: ['ESL','IELTS'],                               rating: 4.4, type: 'ESL, IELTS', partner: false },
  { id: 16, name: 'I.BREEZE',                          slug: 'ibreeze',         city: 'Cebu',   tags: ['ESL','Semi-Sparta'],                         rating: 4.5, type: 'ESL, Speaking', partner: false },
  { id: 17, name: 'Winning English Academy',           slug: 'winning-english', city: 'Cebu',   tags: ['ESL','IELTS'],                               rating: 4.5, type: 'ESL, IELTS', partner: false },
  { id: 18, name: 'Genius English',                    slug: 'genius-english',  city: 'Cebu',   tags: ['Sparta','IELTS'],                            rating: 4.6, type: 'ESL, IELTS', partner: false },
  { id: 19, name: '3D Academy',                        slug: '3d-academy',      city: 'Cebu',   tags: ['3D System','ESL'],                           rating: 4.5, type: 'ESL, Business', partner: false },
  { id: 20, name: 'IDEA English',                      slug: 'idea-english',    city: 'Cebu',   tags: ['IDEA Method','IELTS'],                       rating: 4.5, type: 'ESL, IELTS', partner: false },
  { id: 21, name: 'BTES',                              slug: 'btes',            city: 'Cebu',   tags: ['Sparta','IELTS','TOEIC'],                    rating: 4.5, type: 'ESL, IELTS, TOEIC', partner: false },
  // ── Baguio Partners ───────────────────────────────────────────────────────────────────
  { id: 8,  name: 'PINES International Academy',       slug: 'pines',           city: 'Baguio', tags: ['Sparta','Cool Weather','IELTS'],             rating: 4.9, type: 'ESL, IELTS, TOEIC',     partner: true },
  { id: 9,  name: "B'Cebu (สาขาบาเกียว)",             slug: 'bcebu',           city: 'Baguio', tags: ["B'Sparta",'Baguio','Intensive'],             rating: 4.6, type: 'ESL, IELTS, Business',  partner: true },
  // ── Baguio Other ──────────────────────────────────────────────────────────────────────
  { id: 22, name: 'BECI Academy',                      slug: 'beci',            city: 'Baguio', tags: ['Sparta','IELTS'],                            rating: 4.6, type: 'ESL, IELTS', partner: false },
  { id: 23, name: 'MONOL International',               slug: 'monol',           city: 'Baguio', tags: ['Sparta','IELTS','Big Campus'],               rating: 4.7, type: 'ESL, IELTS, TOEIC', partner: false },
  { id: 24, name: 'HELP English Academy',              slug: 'help-english',    city: 'Baguio', tags: ['Semi-Sparta','Affordable'],                  rating: 4.5, type: 'ESL, IELTS', partner: false },
  { id: 25, name: 'JIC Academy',                       slug: 'jic-academy',     city: 'Baguio', tags: ['Japanese Mgmt','Business'],                  rating: 4.5, type: 'ESL, Business', partner: false },
  { id: 26, name: 'A&J Academy',                       slug: 'aj-academy',      city: 'Baguio', tags: ['ESL','Speaking'],                            rating: 4.4, type: 'ESL, Speaking', partner: false },
  { id: 27, name: 'WALES English Academy',             slug: 'wales-english',   city: 'Baguio', tags: ['Semi-Sparta','IELTS'],                       rating: 4.5, type: 'ESL, IELTS', partner: false },
  { id: 28, name: 'CNS Academy',                       slug: 'cns-academy',     city: 'Baguio', tags: ['Sparta','TOEIC'],                            rating: 4.5, type: 'ESL, TOEIC', partner: false },
  { id: 29, name: 'CIP English Academy',               slug: 'cip-english',     city: 'Baguio', tags: ['Comprehensive','IELTS','Business'],          rating: 4.6, type: 'ESL, IELTS, Business', partner: false },
  { id: 30, name: 'EG Academy',                        slug: 'eg-academy',      city: 'Baguio', tags: ['Sparta','Speaking'],                         rating: 4.4, type: 'ESL, Speaking', partner: false },
  // ── Clark ─────────────────────────────────────────────────────────────────────────────
  { id: 31, name: 'HANA Academy',                      slug: 'hana-academy',    city: 'Clark',  tags: ['ESL','Japanese Mgmt'],                       rating: 4.5, type: 'ESL, IELTS', partner: false },
  { id: 32, name: 'WE Academy',                        slug: 'we-academy',      city: 'Clark',  tags: ['ESL','Speaking'],                            rating: 4.4, type: 'ESL, IELTS', partner: false },
  { id: 33, name: 'GS Academy (NELS)',                  slug: 'gs-academy',      city: 'Clark',  tags: ['ESL','General English'],                     rating: 4.4, type: 'ESL, General English', partner: false },
  { id: 34, name: 'MK Education',                      slug: 'mk-education',    city: 'Clark',  tags: ['ESL','IELTS'],                               rating: 4.4, type: 'ESL, IELTS, TOEIC', partner: false },
  // ── Manila ────────────────────────────────────────────────────────────────────────────
  { id: 35, name: 'E-Room Language Center',            slug: 'e-room',             city: 'Manila',  tags: ['ESL','Online','Business'],                   rating: 4.4, type: 'ESL, Business',          partner: false },
  { id: 36, name: 'LSLC Language Skills Institute',   slug: 'lslc',               city: 'Manila',  tags: ['ESL','Professional'],                        rating: 4.4, type: 'ESL, Business, IELTS',    partner: false },
  { id: 37, name: 'Enderun Language Center',           slug: 'enderun',            city: 'Manila',  tags: ['Premium','BGC','Business'],                  rating: 4.7, type: 'ESL, Business, IELTS',    partner: false },
  { id: 38, name: 'WESLI',                             slug: 'wesli',              city: 'Manila',  tags: ['ESL','Eastwood','Business'],                 rating: 4.4, type: 'ESL, Business',          partner: false },
  // ── Iloilo ────────────────────────────────────────────────────────────────────────────
  { id: 39, name: 'We Academy',                        slug: 'we-academy-iloilo',  city: 'Iloilo',  tags: ['IELTS Computer-Based','ESL','Swimming Pool'], rating: 4.5, type: 'ESL, IELTS, TOEIC',      partner: true },
  { id: 40, name: 'GITC (Green International Tech)',   slug: 'gitc-iloilo',        city: 'Iloilo',  tags: ['ESL','IELTS','TOEIC','Quiet'],               rating: 4.5, type: 'ESL, IELTS, TOEIC',      partner: true },
  { id: 41, name: 'MK Education',                      slug: 'mk-education-iloilo',city: 'Iloilo',  tags: ['Family Program','Business English'],          rating: 4.4, type: 'ESL, IELTS, Business',   partner: true },
  { id: 42, name: 'PIA (Polyglot International)',      slug: 'pia-iloilo',         city: 'Iloilo',  tags: ['Modern','Small Class','ESL'],                rating: 4.5, type: 'ESL, IELTS, Speaking',    partner: true },
  { id: 43, name: 'Columbus English Academy',          slug: 'columbus-english',   city: 'Iloilo',  tags: ['Small School','Family Atmosphere'],          rating: 4.4, type: 'ESL, Speaking',           partner: true },
  // ── Cebu (additional) ─────────────────────────────────────────────────────────────────
  { id: 44, name: 'GITC',                              slug: 'gitc',               city: 'Cebu',    tags: ['ESL','IELTS','TOEIC'],                       rating: 4.4, type: 'ESL, IELTS, TOEIC',      partner: true },
];

export default function Schools() {
  const [search, setSearch] = useState('');
  useSeoMeta(
    'โรงเรียนสอนภาษาอังกฤษที่ฟิลิปปินส์ ครบทุกเมือง | Philingo',
    'เปรียบเทียบโรงเรียนสอนภาษาอังกฤษที่ฟิลิปปินส์กว่า 30 โรงเรียน ในเซบู บาเกียว คลาร์ก มะนิลา พร้อมราคาและรีวิว'
  );
  const [cityFilter, setCityFilter] = useState('All');
  const [partnerOnly, setPartnerOnly] = useState(false);

  const filtered = allSchools.filter(s => {
    const matchSearch  = (s.nameTh || s.name).toLowerCase().includes(search.toLowerCase()) || s.name.toLowerCase().includes(search.toLowerCase());
    const matchCity    = cityFilter === 'All' || s.city === cityFilter;
    const matchPartner = !partnerOnly || s.partner;
    return matchSearch && matchCity && matchPartner;
  });

  const totalByCity: Record<string, number> = {};
  allSchools.forEach(s => { totalByCity[s.city] = (totalByCity[s.city] ?? 0) + 1; });

  return (
    <Layout>
      {/* ── Hero ── */}
      <section className="bg-gradient-to-b from-primary/5 to-white dark:from-primary/10 dark:to-gray-900 py-14 border-b border-gray-100 dark:border-gray-800">
        <div className="container max-w-7xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-bold mb-4">
            🏫 โรงเรียนพาร์ทเนอร์ทั้งหมด
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-3 leading-tight">
            เลือกเมืองที่ใช่ เรียนให้ได้ผล
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            รวม <strong>{allSchools.length} สถาบัน</strong> ใน <strong>5 เมือง</strong> — เซบู, บาเกียว, คลาร์ก, มะนิลา และอิโลอิโล

          </p>
        </div>
      </section>

      {/* ── City Cards ── */}
      <section className="py-8 bg-white dark:bg-gray-900">
        <div className="container max-w-7xl mx-auto px-4">
          <h2 className="text-base font-bold text-gray-700 dark:text-gray-300 mb-4">🗺️ เลือกตามเมือง</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {CITIES.map(c => (
              <Link key={c.slug} href={`/schools/city/${c.slug}`}
                className="relative rounded-2xl overflow-hidden group shadow-sm hover:shadow-lg transition-all hover:-translate-y-1">
                <div className="h-32 md:h-40 overflow-hidden">
                  <img src={c.photo} alt={c.nameTh} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className={`absolute inset-0 bg-gradient-to-t ${c.gradient} opacity-60`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-lg">{c.emoji}</span>
                        <span className="text-white font-extrabold text-sm">{c.nameTh}</span>
                      </div>
                      <p className="text-white/75 text-[11px]">
                        <Thermometer className="w-2.5 h-2.5 inline" /> {c.temp} · <Building2 className="w-2.5 h-2.5 inline" /> {c.schoolCount} แห่ง
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-white/70 group-hover:text-white" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Filter ── */}
      <section className="py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-20 z-30 shadow-sm">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-3 items-center">
            <div className="relative w-full md:w-72 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input type="text" placeholder="ค้นหาชื่อสถาบัน..." value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-xl pl-9 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none" />
            </div>
            <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 hide-scrollbar">
              {[
                { value: 'All',    label: `ทุกเมือง (${allSchools.length})` },
                { value: 'Cebu',   label: `🏖️ Cebu (${totalByCity['Cebu'] ?? 0})` },
                { value: 'Baguio', label: `🏔️ Baguio (${totalByCity['Baguio'] ?? 0})` },
                { value: 'Clark',  label: `✈️ Clark (${totalByCity['Clark'] ?? 0})` },
                { value: 'Manila', label: `🌆 Manila (${totalByCity['Manila'] ?? 0})` },
                { value: 'Iloilo', label: `🌺 Iloilo` },
              ].map(opt => (
                <button key={opt.value} onClick={() => setCityFilter(opt.value)}
                  className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    cityFilter === opt.value ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                  }`}>
                  {opt.label}
                </button>
              ))}
            </div>
            {/* Partner toggle */}
            <button onClick={() => setPartnerOnly(p => !p)}
              className={`shrink-0 flex items-center gap-1.5 text-xs px-3 py-2 rounded-full font-medium transition-colors border ${
                partnerOnly ? 'bg-primary/10 text-primary border-primary/30' : 'bg-white dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700 hover:bg-gray-50'
              }`}>
              <ShieldCheck className="w-3.5 h-3.5" /> Philingo Partners เท่านั้น
            </button>
          </div>
        </div>
      </section>

      {/* ── School Grid ── */}
      <section className="py-10 bg-gray-50 dark:bg-gray-900/50">
        <div className="container max-w-7xl mx-auto px-4">
          {filtered.length > 0 ? (
            <motion.div 
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: { staggerChildren: 0.05 }
                }
              }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filtered.map(school => (
                <motion.div 
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { opacity: 1, y: 0 }
                  }}
                  key={school.id} 
                  className={`bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-sm border flex flex-col transition-all duration-300 group hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-1.5 ${
                    school.partner ? 'border-primary/20 dark:border-primary/30' : 'border-gray-100 dark:border-gray-700'
                  }`}
                >
                  <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-700 shrink-0">
                    <img src={school.photo || CITY_PHOTO[school.city] || cebuImg} alt={school.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> {school.rating}
                    </div>
                    {school.partner && (
                      <div className="absolute top-3 right-3 bg-primary text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm">
                        <ShieldCheck className="w-3 h-3" /> Partner
                      </div>
                    )}
                    <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-sm">
                      <MapPin className="w-3.5 h-3.5" /> {school.city}
                    </div>
                  </div>
                  <div className="p-5 relative flex flex-col flex-1">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1.5 leading-snug">{school.nameTh || school.name}</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-xs mb-3 font-medium">{school.type}</p>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {school.tags.map((tag, i) => (
                        <span key={i} className="bg-primary/5 text-primary dark:bg-primary/10 dark:text-primary/90 border border-primary/10 text-[10px] px-2.5 py-1 rounded-md font-bold uppercase tracking-wider">{tag}</span>
                      ))}
                    </div>
                    
                    <div className="mt-auto">
                      {/* Facility icons — shown for every card */}
                      <div className="grid grid-cols-3 gap-2 border-t border-b border-gray-100 dark:border-gray-700 py-3 mb-4 text-center text-gray-500 dark:text-gray-400 text-xs font-medium bg-gray-50/50 dark:bg-gray-800/50 rounded-xl">
                        <div className="flex flex-col items-center gap-1"><Home className="w-4 h-4 text-gray-400" />หอพัก</div>
                        <div className="flex flex-col items-center gap-1"><Coffee className="w-4 h-4 text-gray-400" />3 มื้อ</div>
                        <div className="flex flex-col items-center gap-1"><Wifi className="w-4 h-4 text-gray-400" />Wi-Fi</div>
                      </div>
                      
                      {/* CTA buttons */}
                      <div className="flex gap-3">
                        {school.partner ? (
                          <>
                            <Link href={`/schools/${school.slug}`}
                              className="flex-1 border-2 border-primary/20 text-primary hover:border-primary hover:bg-primary/5 font-bold py-2.5 rounded-xl transition-all text-center text-xs flex items-center justify-center">
                              ดูรายละเอียด
                            </Link>
                            <Link href="/register"
                              className="flex-1 bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/20 text-center font-bold py-2.5 rounded-xl transition-all text-xs flex items-center justify-center">
                              สมัครเรียน
                            </Link>
                          </>
                        ) : (
                          <>
                            <Link href={school.slug ? `/schools/${school.slug}` : `/schools/city/${school.city.toLowerCase()}`}
                              className="flex-1 border-2 border-primary/20 text-primary hover:border-primary hover:bg-primary/5 font-bold py-2.5 rounded-xl transition-all text-center text-xs flex items-center justify-center">
                              ดูรายละเอียด
                            </Link>
                            <Link href="/register"
                              className="flex-1 bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/20 text-center font-bold py-2.5 rounded-xl transition-all text-xs flex items-center justify-center">
                              สมัครเรียน
                            </Link>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-gray-500 font-medium">ไม่พบสถาบันที่ค้นหา</p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
