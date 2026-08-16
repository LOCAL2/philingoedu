import React, { useState, useMemo } from 'react';
import { Calculator, MessageCircle, ChevronDown, Info, Tag, Package } from 'lucide-react';
import { SiLine } from 'react-icons/si';

/* ─── Types ─────────────────────────────────────────────────────── */
interface CourseOption {
  id: string;
  name: string;
  nameTh: string;
  pricePerFourWeeks: number;
  /** Package mode: total USD per duration (key = "4","8","12"...) including room+meal+reg */
  packagePrices?: Record<string, number>;
}
interface RoomOption    { id: string; name: string; nameTh: string; pricePerFourWeeks: number; }
interface PromoDiscount { enabled: boolean; discountPerFourWeeks: number; minWeeks: number; label: string; }
export interface PromoRule {
  id: string; label: string; enabled: boolean;
  courseIds: string[]; roomIds: string[];
  minWeeks: number;
  discountType: 'percent' | 'fixedThb' | 'perFourWeeksUsd';
  discountValue: number;
  promoCode?: string;
  /** ISO "YYYY-MM-DD" — rule ignored before this date */
  validFrom?: string;
  /** ISO "YYYY-MM-DD" — rule ignored after this date */
  validUntil?: string;
}
export interface PricingConfig {
  enrollmentFee: number;
  courses: CourseOption[];
  rooms: RoomOption[];
  localFeesByWeek: Record<string, number>;
  localFeesByWeekAzon?: Record<string, number>;
  promoDiscount: PromoDiscount;
  /** Per-course/room/duration promotion rules */
  promoRules?: PromoRule[];
  durationOptions: number[];
  exchangeRateUsdThb?: number;
  exchangeRatePhpThb?: number;
  /** When true: packages include accommodation — room selector is hidden */
  bundledPackage?: boolean;
  /** Short description of what package includes, shown under price */
  packageIncludes?: string;
}

interface Props { config: PricingConfig; schoolName: string; lineUrl?: string; }

const LINE_URL = 'https://lin.ee/nBR4rsN';
const DEFAULT_USD_THB = 33.50;
const DEFAULT_PHP_THB = 0.50;

function fmt(n: number)    { return n.toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 0 }); }
function fmtUsd(n: number) { return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0 }); }

/* Course category groupings for grouped <optgroup> */
const CATEGORY_ORDER = [
  // Philinter
  { key: 'esl',      label: 'ESL & Speaking',         ids: ['intensive-esl','general-esl','ips','light-esl'] },
  { key: 'ielts',    label: 'IELTS',                   ids: ['ielts-intensive','ielts-guar-8','ielts-guar-12'] },
  { key: 'toeic',    label: 'TOEIC & Business',        ids: ['toeic-regular','toeic-guar-12','focus-industry','basic-business','advanced-business'] },
  { key: 'premium',  label: 'Premium',                 ids: ['premium-speaking','junior-speaking'] },
  { key: 'junior',   label: 'Junior & Family',         ids: ['junior-esl','junior-ielts'] },
  // EV Academy
  { key: 'sparta',   label: 'Sparta (เข้มข้น)',        ids: ['sparta-intensive-esl','sparta-ielts','sparta-specific','sparta-ps6','sparta-ps8'] },
  { key: 'semi',     label: 'Semi-Sparta (กึ่งเข้มข้น)', ids: ['semi-esl-classic','semi-specific','semi-ps6','semi-ps8'] },
  // B'Cebu
  { key: 'bcebu-esl',     label: 'ESL & Speaking',  ids: ['bcebu-speed-esl','bcebu-intensive-esl','bcebu-sparta','bcebu-lite-esl-4','bcebu-lite-esl-2'] },
  { key: 'bcebu-biz',     label: 'Business English', ids: ['bcebu-business'] },
  { key: 'bcebu-ielts',   label: 'IELTS',            ids: ['bcebu-ielts','bcebu-ielts-sparta','bcebu-ielts-guar'] },
  { key: 'bcebu-junior',  label: 'Junior & Kids',    ids: ['bcebu-junior-esl','bcebu-kids-center'] },
  // CPILS
  { key: 'cpils-esl',     label: 'ESL & Speaking',   ids: ['cpils-esl-light','cpils-general-esl','cpils-esl-premium','cpils-sparta'] },
  { key: 'cpils-biz',     label: 'Business / Professional', ids: ['cpils-business','cpils-medical','cpils-hospitality','cpils-tesol','cpils-working'] },
  { key: 'cpils-toeic',   label: 'TOEIC / TOEFL',    ids: ['cpils-toeic-toefl','cpils-toeic-guar'] },
  { key: 'cpils-ielts',   label: 'IELTS',             ids: ['cpils-ielts','cpils-ielts-guar-8','cpils-ielts-guar-12'] },
];

const DEFAULT_PROMO = { enabled: false, discountPerFourWeeks: 0, minWeeks: 4, label: '' };

/** Returns "YYYY-MM-DD" for today in local time */
function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** False if the rule's validity window excludes today */
function isDateActive(r: PromoRule): boolean {
  const today = todayIso();
  if (r.validFrom  && today < r.validFrom)  return false;
  if (r.validUntil && today > r.validUntil) return false;
  return true;
}

/** Sum all matching PromoRule discounts → returns USD equivalent */
function calcPromoRulesUsd(
  rules: PromoRule[], courseId: string, roomId: string,
  weeks: number, subtotalUsd: number, usdRate: number,
): number {
  const blocks = weeks / 4;
  return (rules ?? [])
    .filter(r => r.enabled)
    .filter(isDateActive)
    .filter(r => r.courseIds.length === 0 || r.courseIds.includes(courseId))
    .filter(r => r.roomIds.length  === 0 || r.roomIds.includes(roomId))
    .filter(r => weeks >= r.minWeeks)
    .reduce((sum, r) => {
      if (r.discountType === 'percent')      return sum + Math.round(subtotalUsd * r.discountValue / 100);
      if (r.discountType === 'fixedThb')     return sum + Math.round(r.discountValue / usdRate);
      /* perFourWeeksUsd */                  return sum + Math.round(r.discountValue * blocks);
    }, 0);
}

export function PriceCalculator({ config, schoolName, lineUrl = LINE_URL }: Props) {
  const isPackageMode = !!config.bundledPackage;
  // defensive: older DB configs may not have promoDiscount
  const promo = config.promoDiscount ?? DEFAULT_PROMO;

  const [selectedCourse, setSelectedCourse] = useState(config.courses[0]?.id ?? '');
  const [selectedRoom,   setSelectedRoom]   = useState(config.rooms[0]?.id ?? '');
  const [duration,       setDuration]       = useState(config.durationOptions[0] ?? 4);
  const [usdRate,        setUsdRate]        = useState(config.exchangeRateUsdThb ?? DEFAULT_USD_THB);
  const [phpRate,        setPhpRate]        = useState(config.exchangeRatePhpThb ?? DEFAULT_PHP_THB);
  const [showRateEdit,   setShowRateEdit]   = useState(false);

  const course = config.courses.find(c => c.id === selectedCourse);
  const room   = config.rooms.find(r => r.id === selectedRoom);

  const isAzon = (roomId: string) => roomId.startsWith('azon');
  const getLocalFee = (roomId: string, dur: number) => {
    const table = isAzon(roomId) && config.localFeesByWeekAzon
      ? config.localFeesByWeekAzon
      : config.localFeesByWeek;
    return table[String(dur)] ?? 0;
  };

  const calc = useMemo(() => {
    if (!course) return null;
    const localPhp = getLocalFee(room?.id ?? '', duration);
    const localThb = localPhp * phpRate;

    if (isPackageMode && course.packagePrices) {
      const schoolUsd = course.packagePrices[String(duration)] ?? 0;
      const schoolThb = schoolUsd * usdRate;
      return { isPackage: true, schoolUsd, schoolThb, localPhp, localThb, totalThb: schoolThb + localThb,
               enrollment: 0, tuition: 0, accommodation: 0, promoAmount: 0, promoEnabled: false, promoRulesUsd: 0 };
    }

    const blocks        = duration / 4;
    const enrollment    = config.enrollmentFee;
    const tuition       = course.pricePerFourWeeks * blocks;
    const accommodation = (room?.pricePerFourWeeks ?? 0) * blocks;
    const promoEnabled  = promo.enabled && duration >= promo.minWeeks;
    const promoAmount   = promoEnabled ? promo.discountPerFourWeeks * blocks : 0;
    const subtotalUsd   = enrollment + tuition + accommodation;
    const promoRulesUsd = calcPromoRulesUsd(config.promoRules ?? [], selectedCourse, selectedRoom, duration, subtotalUsd, usdRate);
    const schoolUsd     = subtotalUsd - promoAmount - promoRulesUsd;
    const schoolThb     = schoolUsd * usdRate;
    return { isPackage: false, enrollment, tuition, accommodation, promoAmount, promoEnabled, promoRulesUsd,
             schoolUsd, schoolThb, localPhp, localThb, totalThb: schoolThb + localThb };
  }, [course, room, duration, usdRate, phpRate, config, isPackageMode]);

  const durations = config.durationOptions;

  const tableRows = useMemo(() => {
    if (!course) return [];
    return durations.map(d => {
      const localPhp = getLocalFee(room?.id ?? '', d);
      if (isPackageMode && course.packagePrices) {
        const packageUsd = course.packagePrices[String(d)] ?? 0;
        const grandThb = packageUsd * usdRate + localPhp * phpRate;
        return { d, isPackage: true, packageUsd, localPhp, grandThb };
      }
      const blocks = d / 4;
      const enrollment = config.enrollmentFee;
      const tuition    = course.pricePerFourWeeks * blocks;
      const accom      = (room?.pricePerFourWeeks ?? 0) * blocks;
      const promoAmt   = promo.enabled && d >= promo.minWeeks
        ? promo.discountPerFourWeeks * blocks : 0;
      const subtotal   = enrollment + tuition + accom;
      const rulesAmt   = calcPromoRulesUsd(config.promoRules ?? [], course.id, room?.id ?? '', d, subtotal, usdRate);
      const totalUsd   = subtotal - promoAmt - rulesAmt;
      const grandThb   = totalUsd * usdRate + localPhp * phpRate;
      return { d, isPackage: false, packageUsd: 0, totalUsd, accom, tuition, promo: promoAmt + rulesAmt, enrollment, localPhp, grandThb };
    });
  }, [course, room, usdRate, phpRate, config, durations, isPackageMode]);

  /* build grouped courses — only for non-bundled (Philinter-style) */
  const grouped = useMemo(() => {
    if (isPackageMode) return [{ label: '', courses: config.courses }];
    const courseMap = new Map(config.courses.map(c => [c.id, c]));
    const result: { label: string; courses: CourseOption[] }[] = [];
    const used = new Set<string>();
    for (const cat of CATEGORY_ORDER) {
      const items = cat.ids.map(id => courseMap.get(id)).filter(Boolean) as CourseOption[];
      if (items.length) { result.push({ label: cat.label, courses: items }); items.forEach(c => used.add(c.id)); }
    }
    const rest = config.courses.filter(c => !used.has(c.id));
    if (rest.length) result.push({ label: 'อื่นๆ', courses: rest });
    return result;
  }, [config.courses, isPackageMode]);

  return (
    <div className="space-y-6 pb-20 sm:pb-0">
      {/* ── Package includes banner ── */}
      {isPackageMode && (
        <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-2xl px-5 py-4">
          <Package className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-blue-800 dark:text-blue-300 text-sm">📦 ราคาแพ็กเกจรวมทุกอย่าง</p>
            <p className="text-blue-700 dark:text-blue-400 text-sm mt-0.5">
              {config.packageIncludes ?? 'รวม: ค่าเล่าเรียน + ที่พัก (แคปซูล) + อาหาร 3 มื้อ + รับสนามบิน + ค่าสมัคร'}
            </p>
          </div>
        </div>
      )}

      {/* ── Promo alert (non-bundled only) ── */}
      {!isPackageMode && promo.enabled && (
        <div className="flex items-start gap-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-2xl px-5 py-4">
          <Tag className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-yellow-800 dark:text-yellow-300 text-sm">🎁 ราคาโปรพิเศษเฉพาะนักเรียน Philingo</p>
            <p className="text-yellow-700 dark:text-yellow-400 text-sm mt-0.5">{promo.label}</p>
          </div>
          <a href={lineUrl} target="_blank" rel="noreferrer"
            className="bg-[#00B900] hover:bg-[#009900] text-white text-xs font-bold px-3 py-1.5 rounded-lg shrink-0 flex items-center gap-1.5">
            <SiLine className="w-3.5 h-3.5" /> ทักเลย
          </a>
        </div>
      )}

      {/* ── Selectors ── */}
      <div className={`grid gap-4 ${isPackageMode ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
        {/* Course */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">เลือกแผนการเรียน</label>
          <div className="relative">
            <select
              value={selectedCourse}
              onChange={e => setSelectedCourse(e.target.value)}
              className="w-full appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 pr-10 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              {grouped.map(group => group.label ? (
                <optgroup key={group.label} label={`── ${group.label} ──`}>
                  {group.courses.map(c => (
                    <option key={c.id} value={c.id}>{c.nameTh}</option>
                  ))}
                </optgroup>
              ) : (
                group.courses.map(c => (
                  <option key={c.id} value={c.id}>{c.nameTh}</option>
                ))
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          {!isPackageMode && course && (
            <p className="text-xs text-gray-400 mt-1">{course.name} · {fmtUsd(course.pricePerFourWeeks)}/4wk</p>
          )}
          {isPackageMode && course?.packagePrices && (
            <p className="text-xs text-gray-400 mt-1">{course.name} · จาก {fmtUsd(course.packagePrices[String(durations[0])] ?? 0)}</p>
          )}
        </div>

        {/* Room — only for non-bundled */}
        {!isPackageMode && config.rooms.length > 0 && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">เลือกห้องพัก</label>
            <div className="relative">
              <select
                value={selectedRoom}
                onChange={e => setSelectedRoom(e.target.value)}
                className="w-full appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 pr-10 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <optgroup label="── Dormitory (หอพัก) ──">
                  {config.rooms.filter(r => !r.id.startsWith('azon')).map(r => (
                    <option key={r.id} value={r.id}>{r.nameTh} (+{fmtUsd(r.pricePerFourWeeks)}/4wk)</option>
                  ))}
                </optgroup>
                {config.rooms.some(r => r.id.startsWith('azon')) && (
                  <optgroup label="── AZON Condominium ──">
                    {config.rooms.filter(r => r.id.startsWith('azon')).map(r => (
                      <option key={r.id} value={r.id}>{r.nameTh} (+{fmtUsd(r.pricePerFourWeeks)}/4wk)</option>
                    ))}
                  </optgroup>
                )}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            {room && isAzon(room.id) && (
              <p className="text-xs text-amber-500 mt-1">⚡ AZON: ค่าไฟสูงกว่า — local fee แตกต่างจากหอพัก</p>
            )}
          </div>
        )}

        {/* Duration */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">ระยะเวลา</label>
          <div className="relative">
            <select
              value={duration}
              onChange={e => setDuration(Number(e.target.value))}
              className="w-full appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 pr-10 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              {config.durationOptions.map(d => (
                <option key={d} value={d}>{d} สัปดาห์ (≈ {d / 4} เดือน)</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* ── Exchange rate ── */}
      <div className="text-xs">
        <button onClick={() => setShowRateEdit(v => !v)}
          className="flex items-center gap-1 text-gray-500 hover:text-primary transition-colors">
          <Info className="w-3.5 h-3.5 shrink-0" />
          อัตราแลกเปลี่ยน: $1 = ฿{usdRate.toFixed(2)} · ₱1 = ฿{phpRate.toFixed(2)}
          <ChevronDown className={`w-3 h-3 shrink-0 transition-transform ${showRateEdit ? 'rotate-180' : ''}`} />
        </button>
        {showRateEdit && (
          <div className="flex flex-wrap items-center gap-3 mt-2 pl-5">
            {[{ label: 'USD', val: usdRate, set: setUsdRate, min: 20, max: 60 },
              { label: 'PHP', val: phpRate, set: setPhpRate, min: 0.3, max: 1 }].map(({ label, val, set, min, max }) => (
              <span key={label} className="flex items-center gap-1">
                <span className="text-gray-500">{label}:</span>
                <input type="number" step="0.01" min={min} max={max} value={val}
                  onChange={e => set(Number(e.target.value))}
                  className="w-20 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-xs bg-white dark:bg-gray-800" />
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Result card ── */}
      {calc && (
        <div className="bg-gradient-to-br from-primary/5 to-blue-50 dark:from-gray-800 dark:to-gray-800 border border-primary/20 dark:border-gray-700 rounded-2xl p-6">
          <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-4">
            {schoolName} · {course?.nameTh}{!isPackageMode && room ? ` · ${room.nameTh}` : ''} · {duration} สัปดาห์
          </p>

          {/* Package mode line items */}
          {calc.isPackage ? (
            <div className="space-y-2.5 mb-5">
              <div className="flex justify-between items-baseline gap-2 text-sm">
                <span className="text-gray-700 dark:text-gray-300 min-w-0">
                  📦 แพ็กเกจ ({course?.nameTh})
                  <span className="block text-xs text-gray-400">รวม: เรียน + แคปซูล + อาหาร + รับสนาม + ค่าสมัคร</span>
                </span>
                <span className="font-semibold text-gray-900 dark:text-white tabular-nums shrink-0">{fmtUsd(calc.schoolUsd)}</span>
              </div>
            </div>
          ) : (
            /* Itemized mode line items */
            <div className="space-y-2.5 mb-5">
              {[
                { label: 'ค่าสมัครเรียน (Registration Fee)',  usd: calc.enrollment },
                { label: `ค่าเล่าเรียน (${course?.name})`,    usd: calc.tuition },
                { label: `ที่พัก + อาหาร (${room?.nameTh})`,  usd: calc.accommodation },
                ...(calc.promoEnabled ? [{ label: '🎁 ' + promo.label, usd: -calc.promoAmount, negative: true }] : []),
                ...((calc.promoRulesUsd ?? 0) > 0 ? [{ label: '🎁 ส่วนลด Promotion (ตามเงื่อนไข)', usd: -(calc.promoRulesUsd ?? 0), negative: true }] : []),
              ].map((row, i) => (
                <div key={i} className="flex justify-between items-baseline gap-2 text-sm">
                  <span className={`min-w-0 ${row.negative ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'}`}>{row.label}</span>
                  <span className={`font-semibold tabular-nums shrink-0 ${row.negative ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                    {row.negative ? `−${fmtUsd(-row.usd)}` : fmtUsd(row.usd)}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-primary/20 dark:border-gray-600 pt-4 space-y-2">
            <div className="flex justify-between items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400 min-w-0">
                {calc.isPackage ? 'รวมแพ็กเกจ (ชำระล่วงหน้า)' : 'รวมค่าโรงเรียน (ชำระล่วงหน้า)'}
              </span>
              <div className="text-right shrink-0">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{fmtUsd(calc.schoolUsd)}</span>
                <span className="text-xs text-gray-500 ml-2">≈ ฿{fmt(calc.schoolThb)}</span>
              </div>
            </div>
            <div className="flex justify-between items-center gap-2">
              <div className="min-w-0">
                <span className="text-sm text-gray-600 dark:text-gray-400">Local Fee (ชำระที่โรงเรียน)</span>
                <p className="text-[10px] text-gray-400">SSP, Visa ext., ค่าไฟ, ID Card ฯลฯ</p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">₱{fmt(calc.localPhp)}</span>
                <span className="text-xs text-gray-500 ml-1">≈ ฿{fmt(calc.localThb)}</span>
              </div>
            </div>
            <div className="flex justify-between items-center gap-2 pt-2 border-t border-primary/20 dark:border-gray-600">
              <span className="font-bold text-gray-900 dark:text-white min-w-0">รวมทั้งหมด (ประมาณ)</span>
              <div className="text-right shrink-0">
                <span className="text-2xl font-black text-primary">฿{fmt(calc.totalThb)}</span>
                <p className="text-xs text-gray-400">≈ {fmtUsd(calc.schoolUsd + calc.localThb / usdRate)}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <a href={lineUrl} target="_blank" rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-2 bg-[#00B900] hover:bg-[#009900] text-white font-bold py-3.5 rounded-xl transition-all hover:scale-[1.02]">
              <SiLine className="w-5 h-5" /> ขอใบเสนอราคา + โปรพิเศษ
            </a>
            <a href="/contact"
              className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold py-3.5 px-6 rounded-xl transition-all">
              <MessageCircle className="w-4 h-4" /> ปรึกษาฟรี
            </a>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 text-center">
            * ราคาโดยประมาณ อัตราแลกเปลี่ยน $1=฿{usdRate.toFixed(2)} · ₱1=฿{phpRate.toFixed(2)} · ยังไม่รวมค่าธรรมเนียมโอนเงิน
          </p>
        </div>
      )}

      {/* ── Summary table ── */}
      <div>
        <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
          <Calculator className="w-4 h-4 text-primary" />
          {isPackageMode
            ? `ตารางราคา — ${course?.nameTh}`
            : `ตารางเปรียบเทียบราคา — ${course?.nameTh} · ${room?.nameTh}`}
        </h4>
        <p className="text-xs text-gray-400 text-center mb-1 sm:hidden">← เลื่อนดูราคาทุกช่วงสัปดาห์ →</p>
        <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-700">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-400 font-semibold whitespace-nowrap">รายการ</th>
                {tableRows.map(r => (
                  <th key={r.d} className={`text-right px-3 py-3 font-semibold whitespace-nowrap text-xs ${duration === r.d ? 'text-primary' : 'text-gray-500 dark:text-gray-400'}`}>
                    {r.d} สัปดาห์
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-xs">
              {isPackageMode ? (
                /* Package mode rows */
                <>
                  <tr>
                    <td className="px-4 py-2.5 text-gray-700 dark:text-gray-300">
                      แพ็กเกจ (รวมเรียน+พัก+อาหาร)
                    </td>
                    {tableRows.map(r => (
                      <td key={r.d} className="px-3 py-2.5 text-right tabular-nums text-gray-900 dark:text-white">
                        {r.packageUsd ? fmtUsd(r.packageUsd) : '—'}
                      </td>
                    ))}
                  </tr>
                  <tr className="bg-gray-50 dark:bg-gray-800 text-gray-500 text-xs">
                    <td className="px-4 py-2">Local Fee (₱)</td>
                    {tableRows.map(r => (
                      <td key={r.d} className="px-3 py-2 text-right tabular-nums">₱{fmt(r.localPhp)}</td>
                    ))}
                  </tr>
                </>
              ) : (
                /* Itemized mode rows */
                <>
                  {[
                    { label: 'ค่าสมัคร', key: 'enrollment', bg: '' },
                    { label: 'ค่าเรียน', key: 'tuition', bg: 'bg-gray-50/50 dark:bg-gray-800/30' },
                    { label: 'ที่พัก+อาหาร', key: 'accom', bg: '' },
                  ].map(({ label, key, bg }) => (
                    <tr key={key} className={bg}>
                      <td className="px-4 py-2.5 text-gray-700 dark:text-gray-300">{label}</td>
                      {tableRows.map(r => (
                        <td key={r.d} className="px-3 py-2.5 text-right tabular-nums text-gray-900 dark:text-white">
                          {fmtUsd((r as any)[key] ?? 0)}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {promo.enabled && (
                    <tr className="bg-green-50/50 dark:bg-green-900/10">
                      <td className="px-4 py-2 text-green-600 dark:text-green-400">ส่วนลด Philingo</td>
                      {tableRows.map(r => (
                        <td key={r.d} className="px-3 py-2 text-right tabular-nums text-green-600 dark:text-green-400">
                          {(r as any).promo > 0 ? `−${fmtUsd((r as any).promo)}` : '—'}
                        </td>
                      ))}
                    </tr>
                  )}
                  <tr className="bg-primary/5 dark:bg-primary/10 font-semibold border-t-2 border-primary/20 text-xs">
                    <td className="px-4 py-2.5 text-gray-800 dark:text-white">รวม USD</td>
                    {tableRows.map(r => <td key={r.d} className="px-3 py-2.5 text-right tabular-nums">{fmtUsd((r as any).totalUsd ?? 0)}</td>)}
                  </tr>
                  <tr className="bg-gray-50 dark:bg-gray-800 text-gray-500 text-xs">
                    <td className="px-4 py-2">Local Fee (₱)</td>
                    {tableRows.map(r => (
                      <td key={r.d} className="px-3 py-2 text-right tabular-nums">₱{fmt(r.localPhp)}</td>
                    ))}
                  </tr>
                </>
              )}
              <tr className="bg-primary/10 dark:bg-primary/20 font-bold">
                <td className="px-4 py-3 text-primary text-sm">รวมทั้งหมด ≈ ฿</td>
                {tableRows.map(r => (
                  <td key={r.d} className={`px-3 py-3 text-right tabular-nums text-primary font-black whitespace-nowrap ${duration === r.d ? 'underline underline-offset-2' : ''}`}>
                    ฿{fmt(r.grandThb)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
          * Local Fee ชำระเป็นเงินสดเปโซที่โรงเรียน · ราคา THB คำนวณ ณ $1 = ฿{usdRate.toFixed(2)} · ₱1 = ฿{phpRate.toFixed(2)}
        </p>
      </div>
    </div>
  );
}
