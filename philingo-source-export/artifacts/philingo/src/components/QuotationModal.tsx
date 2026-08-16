import React, { useState } from 'react';
import { X, Printer, FileText, Tag } from 'lucide-react';
import logoUrl from '@assets/philingo_logo_transparent.png';

interface PricingCourse { id: string; name: string; nameTh: string; pricePerFourWeeks: number; }
interface PricingRoom   { id: string; name: string; nameTh: string; pricePerFourWeeks: number; }
interface PromoDiscount {
  enabled: boolean;
  discountType?: 'perFourWeeks' | 'percent' | 'fixedThb';
  discountPerFourWeeks?: number;
  discountPercent?: number;
  discountFixedThb?: number;
  minWeeks?: number;
  label?: string;
  promoCode?: string;
}
interface PromoRule {
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

interface ContactInfo {
  phone?: string;
  lineId?: string;
  lineUrl?: string;
  website?: string;
}

interface QuotationModalProps {
  school: {
    name: string;
    city: string;
    pricingConfig: {
      enrollmentFee: number;
      courses: PricingCourse[];
      rooms: PricingRoom[];
      localFeesByWeek?: Record<string, number>;
      exchangeRateUsdThb?: number;
      exchangeRatePhpThb?: number;
      promoDiscount?: PromoDiscount;
      promoRules?: PromoRule[];
    };
  };
  contactInfo?: ContactInfo;
  onClose: () => void;
}

const WEEK_OPTIONS = [1, 2, 3, 4, 8, 12, 16, 20, 24];

function durationFactor(w: number): number {
  if (w === 1) return 0.40;
  if (w === 2) return 0.60;
  if (w === 3) return 0.80;
  return w / 4;
}

function calcPromoDiscount(promo: PromoDiscount | undefined, weeks: number, subtotalThb: number, usdThb: number): number {
  if (!promo?.enabled) return 0;
  if (weeks < (promo.minWeeks ?? 4)) return 0;
  const dt = promo.discountType ?? 'perFourWeeks';
  if (dt === 'percent')   return Math.round(subtotalThb * (promo.discountPercent ?? 0) / 100);
  if (dt === 'fixedThb')  return promo.discountFixedThb ?? 0;
  const blocks = Math.max(1, Math.round(weeks / 4));
  return Math.round((promo.discountPerFourWeeks ?? 0) * blocks * usdThb);
}

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

function calcPromoRulesThb(
  rules: PromoRule[], courseId: string, roomId: string,
  weeks: number, factor: number, subtotalUsd: number, usdThb: number,
): number {
  return (rules ?? [])
    .filter(r => r.enabled)
    .filter(isDateActive)
    .filter(r => r.courseIds.length === 0 || r.courseIds.includes(courseId))
    .filter(r => r.roomIds.length  === 0 || r.roomIds.includes(roomId))
    .filter(r => weeks >= r.minWeeks)
    .reduce((sum, r) => {
      if (r.discountType === 'percent')   return sum + Math.round(subtotalUsd * usdThb * r.discountValue / 100);
      if (r.discountType === 'fixedThb')  return sum + r.discountValue;
      /* perFourWeeksUsd */               return sum + Math.round(r.discountValue * factor * usdThb);
    }, 0);
}

export function QuotationModal({ school, contactInfo, onClose }: QuotationModalProps) {
  const pc = school.pricingConfig;
  const phone   = contactInfo?.phone   || '061-656-4159';
  const lineId  = contactInfo?.lineId  || '@philingo';
  const lineUrl = contactInfo?.lineUrl || `https://line.me/R/ti/p/${encodeURIComponent(contactInfo?.lineId || '@philingo')}`;
  const website = contactInfo?.website || 'www.philingoedu.com';
  const usdThb = pc.exchangeRateUsdThb ?? 33.50;
  const phpThb = pc.exchangeRatePhpThb ?? 0.50;

  const [studentName, setStudentName] = useState('');
  const [courseId, setCourseId]       = useState(pc.courses[0]?.id ?? '');
  const [roomId, setRoomId]           = useState(pc.rooms[0]?.id ?? '');
  const [weeks, setWeeks]             = useState(4);
  const [notes, setNotes]             = useState('');
  const [applyPromo, setApplyPromo]   = useState(true);

  const factor = durationFactor(weeks);
  const course = pc.courses.find(c => c.id === courseId);
  const room   = pc.rooms.find(r => r.id === roomId);

  const tuitionUsd = course ? Math.round(course.pricePerFourWeeks * factor) : 0;
  const roomUsd    = room   ? Math.round(room.pricePerFourWeeks * factor)   : 0;
  const enrollUsd  = pc.enrollmentFee ?? 100;
  const localPhp   = pc.localFeesByWeek?.[String(weeks)] ?? 0;

  const tuitionThb  = Math.round(tuitionUsd * usdThb);
  const roomThb     = Math.round(roomUsd    * usdThb);
  const enrollThb   = Math.round(enrollUsd  * usdThb);
  const localThb    = Math.round(localPhp   * phpThb);
  const subtotalThb = tuitionThb + roomThb + enrollThb + localThb;
  const totalUsd    = tuitionUsd + roomUsd + enrollUsd;

  const promo         = pc.promoDiscount;
  const promoActive   = applyPromo && !!promo?.enabled && weeks >= (promo.minWeeks ?? 4);
  const discountThb   = promoActive ? calcPromoDiscount(promo, weeks, subtotalThb, usdThb) : 0;
  const rulesDiscThb  = applyPromo ? calcPromoRulesThb(pc.promoRules ?? [], courseId, roomId, weeks, factor, totalUsd, usdThb) : 0;
  const totalDiscThb  = discountThb + rulesDiscThb;
  const totalThb      = subtotalThb - totalDiscThb;

  const handlePrint = () => {
    const today = new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' });
    const absoluteLogoUrl = window.location.origin + logoUrl;
    const html = `<!DOCTYPE html><html><head>
<meta charset="utf-8"/>
<title>ใบเสนอราคา – ${school.name}</title>
<link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700;900&display=swap" rel="stylesheet"/>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Sarabun',sans-serif;padding:44px;color:#111;max-width:740px;margin:0 auto;font-size:14px}
  .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px;padding-bottom:20px;border-bottom:3px solid #2563eb}
  .logo img{height:52px;width:auto;display:block;object-fit:contain}
  .contact{font-size:11px;color:#6b7280;margin-top:6px;line-height:1.7}
  .doc-info{text-align:right;font-size:12px;color:#6b7280;line-height:1.8}
  .doc-info .to{font-size:15px;font-weight:700;color:#111;margin-top:4px}
  h1{font-size:24px;font-weight:800;color:#1d4ed8;margin-bottom:4px}
  .subtitle{font-size:14px;color:#6b7280;margin-bottom:12px}
  .badge{display:inline-flex;align-items:center;gap:6px;background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe;border-radius:99px;padding:4px 14px;font-size:12px;font-weight:700;margin-bottom:22px}
  .promo-badge{display:inline-flex;align-items:center;gap:6px;background:#fefce8;color:#a16207;border:1px solid #fde68a;border-radius:99px;padding:4px 14px;font-size:12px;font-weight:700;margin-left:8px}
  table{width:100%;border-collapse:collapse;margin:18px 0;border-radius:10px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.07)}
  thead th{background:#1d4ed8;color:#fff;padding:11px 16px;text-align:left;font-size:13px;font-weight:700}
  tbody td{padding:11px 16px;border-bottom:1px solid #e5e7eb;font-size:13px;vertical-align:top}
  .amt{text-align:right;font-family:monospace;white-space:nowrap}
  .thb{text-align:right;font-family:monospace;font-weight:700;color:#1d4ed8;white-space:nowrap}
  .sub{font-size:11px;color:#9ca3af;margin-top:3px;display:block}
  .promo-row td{background:#f0fdf4;color:#16a34a;font-weight:700}
  .promo-row .thb{color:#16a34a}
  .total-row td{background:#1d4ed8;color:#fff;font-weight:800;padding:14px 16px;font-size:16px}
  .total-row .thb{color:#fbbf24;font-size:20px}
  .subtotal-note{font-size:11px;color:#9ca3af;text-decoration:line-through}
  .rate-note{font-size:11px;color:#9ca3af;margin-top:6px;text-align:right}
  .note-box{background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:16px;margin-top:22px;font-size:12px;color:#6b7280;line-height:2}
  .user-note{background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:14px;margin-top:14px;font-size:13px}
  .footer{margin-top:32px;padding-top:16px;border-top:1px solid #e5e7eb;text-align:center;font-size:11px;color:#9ca3af}
  @media print{body{padding:22px}}
</style></head><body>
<div class="header">
  <div>
    <div class="logo"><img src="${absoluteLogoUrl}" alt="Philingo"/></div>
    <div class="contact">
      🌐 ${website}<br/>
      📱 LINE: ${lineId}<br/>
      📞 ${phone}
    </div>
  </div>
  <div class="doc-info">
    <div>📅 วันที่: ${today}</div>
    ${studentName ? `<div class="to">ถึง: ${studentName}</div>` : ''}
  </div>
</div>

<h1>ใบเสนอราคาเรียนภาษาอังกฤษ</h1>
<div class="subtitle">${school.name} &nbsp;·&nbsp; ${school.city}</div>
<div>
  <span class="badge">⏱ ระยะเวลา ${weeks} สัปดาห์</span>
  ${(promoActive && discountThb > 0) || rulesDiscThb > 0 ? `<span class="promo-badge">🎁 ${promo?.label || 'ส่วนลดพิเศษ'}${rulesDiscThb > 0 ? ' + ส่วนลดตามเงื่อนไข' : ''}${promo?.promoCode ? ' · ' + promo.promoCode : ''}</span>` : ''}
</div>

<table>
  <thead>
    <tr>
      <th style="width:55%">รายการ</th>
      <th class="amt" style="width:20%">USD / PHP</th>
      <th class="thb" style="width:25%;color:#fbbf24">THB (บาท)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>💼 ค่าเรียน<span class="sub">${course?.nameTh || course?.name || '–'} · ${weeks} สัปดาห์ (×${factor.toFixed(2)})</span></td>
      <td class="amt">$${tuitionUsd.toLocaleString()}</td>
      <td class="thb">฿${tuitionThb.toLocaleString()}</td>
    </tr>
    <tr>
      <td>🛏️ ค่าที่พัก<span class="sub">${room?.nameTh || room?.name || '–'} · ${weeks} สัปดาห์ (×${factor.toFixed(2)})</span></td>
      <td class="amt">$${roomUsd.toLocaleString()}</td>
      <td class="thb">฿${roomThb.toLocaleString()}</td>
    </tr>
    <tr>
      <td>📋 ค่าสมัคร (Enrollment Fee)</td>
      <td class="amt">$${enrollUsd.toLocaleString()}</td>
      <td class="thb">฿${enrollThb.toLocaleString()}</td>
    </tr>
    <tr>
      <td>📑 Local Fees รวม (${weeks} สัปดาห์)<span class="sub">SSP · SSP E-Card · วีซ่า · ไฟ · น้ำ · Misc · Airport · หนังสือ · รูปถ่าย · มัดจำ</span></td>
      <td class="amt" style="color:#ea580c">₱${localPhp.toLocaleString()}</td>
      <td class="thb">฿${localThb.toLocaleString()}</td>
    </tr>
    ${promoActive && discountThb > 0 ? `
    <tr class="promo-row">
      <td>🎁 ส่วนลด Promo<span class="sub">${promo?.label || 'ส่วนลดพิเศษ'}${promo?.promoCode ? ' · CODE: ' + promo.promoCode : ''}</span></td>
      <td class="amt">–</td>
      <td class="thb">−฿${discountThb.toLocaleString()}</td>
    </tr>
    ` : ''}
    ${rulesDiscThb > 0 ? `
    <tr class="promo-row">
      <td>🎁 ส่วนลด Promotion (ตามคอร์ส/ห้อง/ระยะเวลา)<span class="sub">คอร์ส: ${pc.courses.find(c=>c.id===courseId)?.nameTh||courseId} · ห้อง: ${pc.rooms.find(r=>r.id===roomId)?.nameTh||roomId} · ${weeks} สัปดาห์</span></td>
      <td class="amt">–</td>
      <td class="thb">−฿${rulesDiscThb.toLocaleString()}</td>
    </tr>
    ` : ''}
    <tr class="total-row">
      <td>💰 รวมทั้งหมด${totalDiscThb > 0 ? ' (หลังส่วนลด)' : ''} (ประมาณการ)${totalDiscThb > 0 ? `<span class="subtotal-note" style="font-size:11px;display:block;margin-top:2px">ราคาก่อนลด ฿${subtotalThb.toLocaleString()}</span>` : ''}</td>
      <td class="amt">$${totalUsd.toLocaleString()}</td>
      <td class="thb" style="${totalDiscThb > 0 ? 'color:#fde047' : ''}">฿${totalThb.toLocaleString()}</td>
    </tr>
  </tbody>
</table>

<div class="rate-note">อัตราแลกเปลี่ยนที่ใช้คำนวณ: $1 = ฿${usdThb} &nbsp;|&nbsp; ₱1 = ฿${phpThb}</div>

${notes ? `<div class="user-note"><strong>📝 หมายเหตุ:</strong> ${notes}</div>` : ''}

<div class="note-box">
  ⚠️ <strong>ข้อมูลสำคัญ:</strong><br/>
  • ราคาด้านบนเป็นการประมาณการเท่านั้น อาจมีการเปลี่ยนแปลงตามอัตราแลกเปลี่ยนและนโยบายของโรงเรียน<br/>
  • Local Fees รวม: SSP (₱8,000) + SSP E-Card (₱4,500) + ค่าน้ำ + ค่าไฟ + Miscellaneous + Airport Pickup + หนังสือเรียน + รูปถ่าย + มัดจำ<br/>
  • สำหรับระยะสั้น (1-3 สัปดาห์): คิดเป็น 40% / 60% / 80% ของราคา 4 สัปดาห์ตามลำดับ<br/>
  • กรุณาติดต่อ Philingo เพื่อยืนยันราคาและรับส่วนลดพิเศษสำหรับลูกค้า Philingo
</div>

<div class="footer">
  Philingo — ที่ปรึกษาเรียนภาษาอังกฤษต่างประเทศอันดับ 1 ของไทย<br/>
  ${website} &nbsp;|&nbsp; LINE: ${lineId} &nbsp;|&nbsp; โทร ${phone}
</div>
</body></html>`;

    const w = window.open('', '_blank', 'width=800,height=970,scrollbars=yes');
    if (w) { w.document.write(html); w.document.close(); setTimeout(() => w.print(), 600); }
  };

  const rows = [
    { icon: '💼', label: `ค่าเรียน – ${course?.nameTh || course?.name || '(ยังไม่เลือก)'}`, usd: `$${tuitionUsd.toLocaleString()}`, thb: tuitionThb, green: false },
    { icon: '🛏️', label: `ค่าที่พัก – ${room?.nameTh   || room?.name   || '(ยังไม่เลือก)'}`, usd: `$${roomUsd.toLocaleString()}`,    thb: roomThb,    green: false },
    { icon: '📋', label: 'ค่าสมัคร (Enrollment Fee)',                                           usd: `$${enrollUsd}`,                  thb: enrollThb,  green: false },
    { icon: '📑', label: `Local Fees (${weeks} สัปดาห์)`,                                       usd: localPhp ? `₱${localPhp.toLocaleString()}` : '–', thb: localThb, green: false },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-xl max-h-[94vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-t-3xl sm:rounded-t-2xl flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-base">ใบเสนอราคา</div>
              <div className="text-blue-200 text-xs">{school.name}</div>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          {/* Student name */}
          <input
            value={studentName} onChange={e => setStudentName(e.target.value)}
            placeholder="ชื่อของคุณ (ไม่บังคับ)"
            className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-300 outline-none dark:bg-gray-800 dark:text-white"
          />

          {/* Duration + Course */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">ระยะเวลา</label>
              <select value={weeks} onChange={e => setWeeks(Number(e.target.value))}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-300 outline-none dark:bg-gray-800 dark:text-white">
                {WEEK_OPTIONS.map(w => <option key={w} value={w}>{w} สัปดาห์</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">หลักสูตร</label>
              <select value={courseId} onChange={e => setCourseId(e.target.value)}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-300 outline-none dark:bg-gray-800 dark:text-white">
                <option value="">-- เลือกหลักสูตร --</option>
                {pc.courses.map(c => (
                  <option key={c.id} value={c.id}>{c.nameTh || c.name} (${c.pricePerFourWeeks}/4wk)</option>
                ))}
              </select>
            </div>
          </div>

          {/* Room selector (dropdown — full width, touch-friendly) */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-2">ประเภทห้องพัก</label>
            <div className="relative">
              <select
                value={roomId}
                onChange={e => setRoomId(e.target.value)}
                className="w-full min-h-[44px] appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 pr-10 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {pc.rooms.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.nameTh || r.name} — ${r.pricePerFourWeeks}/4wk
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">▾</span>
            </div>
          </div>

          {/* Promo toggle */}
          {promo?.enabled && (
            <label className={`flex items-center gap-2.5 cursor-pointer p-3 rounded-xl border transition-all ${
              applyPromo ? 'bg-yellow-50 border-yellow-300 text-yellow-800' : 'bg-gray-50 border-gray-200 text-gray-500'
            }`}>
              <input type="checkbox" checked={applyPromo} onChange={e => setApplyPromo(e.target.checked)} className="w-4 h-4 rounded accent-yellow-500" />
              <Tag className="w-3.5 h-3.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold">ใช้ส่วนลด Promo</div>
                <div className="text-[11px] truncate">{promo.label || 'ส่วนลดพิเศษ'}
                  {promo.promoCode && <span className="ml-1 bg-yellow-200 text-yellow-800 rounded px-1 font-mono">{promo.promoCode}</span>}
                </div>
              </div>
              {promoActive && discountThb > 0 && (
                <span className="shrink-0 text-xs font-bold text-green-600">−฿{discountThb.toLocaleString()}</span>
              )}
            </label>
          )}

          {/* Breakdown */}
          <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="bg-gray-800 dark:bg-gray-700 text-white px-4 py-2.5 text-sm font-bold">
              💰 สรุปราคา ({weeks} สัปดาห์ · ×{factor.toFixed(2)})
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-800">
              {rows.map((r, i) => (
                <div key={i} className="flex items-center gap-2 px-4 py-2.5">
                  <span className="text-base shrink-0">{r.icon}</span>
                  <span className="text-xs text-gray-600 dark:text-gray-400 flex-1 truncate">{r.label}</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 tabular-nums w-20 text-right">{r.usd}</span>
                  <span className="text-sm font-bold text-blue-700 dark:text-blue-400 tabular-nums w-24 text-right">฿{r.thb.toLocaleString()}</span>
                </div>
              ))}
              {promoActive && discountThb > 0 && (
                <div className="flex items-center gap-2 px-4 py-2.5 bg-green-50 dark:bg-green-900/20">
                  <span className="text-base shrink-0">🎁</span>
                  <span className="text-xs text-green-700 dark:text-green-400 flex-1 font-semibold">{promo?.label || 'ส่วนลด Promo'}</span>
                  <span className="text-xs text-green-400 tabular-nums w-20 text-right">–</span>
                  <span className="text-sm font-bold text-green-600 dark:text-green-400 tabular-nums w-24 text-right">−฿{discountThb.toLocaleString()}</span>
                </div>
              )}
            </div>
            <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between">
              <span className="font-bold text-sm">รวมทั้งหมด{promoActive && discountThb > 0 ? ' (หลังลด)' : ''}</span>
              <div className="text-right">
                {promoActive && discountThb > 0 && (
                  <div className="text-xs text-blue-200 line-through tabular-nums">฿{subtotalThb.toLocaleString()}</div>
                )}
                <span className="text-xl font-black tabular-nums">฿{totalThb.toLocaleString()}</span>
              </div>
            </div>
            <div className="px-4 py-2 text-[11px] text-gray-400 bg-gray-50 dark:bg-gray-900">
              $1 = ฿{usdThb} &nbsp;|&nbsp; ₱1 = ฿{phpThb}
            </div>
          </div>

          {/* Notes */}
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
            placeholder="หมายเหตุเพิ่มเติม..."
            className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-300 outline-none resize-none dark:bg-gray-800 dark:text-white" />

          {/* Print */}
          <button onClick={handlePrint}
            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 active:scale-95 text-white font-bold py-3 rounded-xl transition-all text-sm">
            <Printer className="w-4 h-4" /> พิมพ์ / ดาวน์โหลด PDF
          </button>
          <p className="text-center text-[11px] text-gray-400 pb-1">
            ราคาเป็นการประมาณการ · ติดต่อ Philingo เพื่อยืนยันราคา
          </p>
        </div>
      </div>
    </div>
  );
}
