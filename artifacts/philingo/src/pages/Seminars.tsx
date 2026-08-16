import React, { useState, useEffect, useRef } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useSeoMeta } from '@/hooks/use-seo-meta';
import {
  Calendar, MapPin, Video, CheckCircle2, Clock, Users, Star,
  ArrowRight, Gift, Phone, MessageCircle, ChevronDown, ChevronUp,
  Building2, Award, Globe, Mail, BookOpen, Mic2, Handshake, Plane,
  Shield, Heart, Zap,
} from 'lucide-react';
import { SiLine, SiMessenger } from 'react-icons/si';
import { useCountdown } from '@/hooks/use-countdown';
import { motion, AnimatePresence } from 'framer-motion';

const FIRST_EVENT = new Date('2026-08-29T10:00:00+07:00').toISOString();
const EVENT_END   = new Date('2026-09-12T12:00:00+07:00').toISOString();

import seminarBannerFallback from '@/assets/fair-banner.png';
import { AdminEditSection } from '@/components/AdminOverlay';
import { useQuery } from '@tanstack/react-query';

// School logos
import qqLogo       from '@assets/image_1785200772068.png';
import ciaLogo      from '@assets/image_1785200711221.png';
import cpilsLogo    from '@assets/image_1785200802634.png';
import philinterLogo from '@assets/image_1785200753254.png';
import bcebuLogo    from '@assets/image_1785200917465.png';
import evLogo       from '@assets/image_1785200695195.png';

/* ─── Static data ──────────────────────────────────────────────────── */

const sessions = [
  // ── เสาร์ 29 ส.ค. ──────────────────────────────────────────────────────
  {
    date: 'เสาร์ 29 ส.ค. 2569',   dateShort: "29 ส.ค. (B'Cebu)", dateValue: '2026-08-29-am',
    time: '10:00–11:00 น.',        round: 'รอบเช้า',  school: "B'Cebu",   location: 'Banilad, Cebu',
    topic: 'หลักสูตรเข้มข้น แคมปัสใหม่ สิ่งอำนวยความสะดวกครบ',
    logo: bcebuLogo,
    bg: 'from-indigo-500 to-violet-600', textColor: 'text-indigo-600',
    pillColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    programs: ['Intensive English', 'IELTS', 'TOEIC', 'ห้องพักใหม่ทันสมัย'],
    presenter: "ผู้แทน B'Cebu",
  },
  {
    date: 'เสาร์ 29 ส.ค. 2569',   dateShort: '29 ส.ค. (Philinter)', dateValue: '2026-08-29-pm',
    time: '14:00–15:00 น.',        round: 'รอบบ่าย', school: 'Philinter Academy', location: 'Mactan, Cebu',
    topic: 'Business English และ Speaking สำหรับการทำงาน',
    logo: philinterLogo,
    bg: 'from-green-500 to-emerald-700', textColor: 'text-green-600',
    pillColor: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    programs: ['Business English', 'Speaking', 'ESL', 'Cambridge English'],
    presenter: 'ผู้แทน Philinter Academy',
  },
  // ── อาทิตย์ 30 ส.ค. ─────────────────────────────────────────────────────
  {
    date: 'อาทิตย์ 30 ส.ค. 2569', dateShort: '30 ส.ค. (EV Academy)', dateValue: '2026-08-30-am',
    time: '10:00–11:00 น.',        round: 'รอบเช้า',  school: 'EV Academy',  location: 'Cebu City',
    topic: 'เรียนภาษาในสภาพแวดล้อมที่ทันสมัย คุณภาพครูมืออาชีพ',
    logo: evLogo,
    bg: 'from-purple-500 to-violet-700', textColor: 'text-purple-600',
    pillColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    programs: ['General English', 'IELTS', 'TOEIC', 'Speaking'],
    presenter: 'ผู้แทน EV Academy',
  },
  // ── เสาร์ 5 ก.ย. ────────────────────────────────────────────────────────
  {
    date: 'เสาร์ 5 ก.ย. 2569',    dateShort: '5 ก.ย. (CPILS)',    dateValue: '2026-09-05-am',
    time: '10:00–11:00 น.',        round: 'รอบเช้า',  school: 'CPILS',       location: 'Cebu City',
    topic: 'โรงเรียน ESL แห่งแรกของเซบู พร้อมครู Native',
    logo: cpilsLogo,
    bg: 'from-orange-500 to-amber-500', textColor: 'text-orange-500',
    pillColor: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    programs: ['ESL', 'TOEIC', 'IELTS', 'Native English Teachers'],
    presenter: 'ผู้แทน CPILS',
  },
  {
    date: 'เสาร์ 5 ก.ย. 2569',    dateShort: '5 ก.ย. (I.BREEZE)', dateValue: '2026-09-05-pm',
    time: '14:00–15:00 น.',        round: 'รอบบ่าย', school: 'I.BREEZE',    location: 'Mabolo, Cebu',
    topic: 'เรียนภาษาในบรรยากาศรีสอร์ต เหมาะกับทุกวัย',
    logo: null,
    bg: 'from-teal-500 to-emerald-600', textColor: 'text-teal-500',
    pillColor: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
    programs: ['General English', 'Speaking', 'Family Program', 'Junior Program'],
    presenter: 'ผู้แทน I.BREEZE',
  },
  // ── อาทิตย์ 6 ก.ย. ──────────────────────────────────────────────────────
  {
    date: 'อาทิตย์ 6 ก.ย. 2569',  dateShort: '6 ก.ย. (QQ English)', dateValue: '2026-09-06-am',
    time: '10:00–11:00 น.',        round: 'รอบเช้า',  school: 'QQ English',  location: 'IT Park, Cebu',
    topic: 'เรียนภาษาอังกฤษด้วย Callan Method พูดคล่องเร็ว',
    logo: qqLogo,
    bg: 'from-sky-500 to-blue-600', textColor: 'text-sky-500',
    pillColor: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
    programs: ['Callan Method', 'General English', 'IELTS', 'Business English'],
    presenter: 'ผู้แทน QQ English',
  },
  // ── รอบพิเศษ เสาร์ 12 ก.ย. ──────────────────────────────────────────────
  {
    date: 'เสาร์ 12 ก.ย. 2569 ✨ รอบพิเศษ', dateShort: '12 ก.ย. (CIA)', dateValue: '2026-09-12-special',
    time: '10:30 น. เป็นต้นไป',   round: 'รอบพิเศษ', school: 'CIA',          location: 'Mactan, Cebu',
    topic: 'IELTS, TOEIC และแคมปัสใหม่ระดับพรีเมียม',
    logo: ciaLogo, isSpecial: true,
    bg: 'from-red-600 to-red-800', textColor: 'text-red-600',
    pillColor: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    programs: ['Semi Sparta', 'IELTS', 'TOEIC', 'Business English'],
    presenter: 'ผู้แทน CIA',
  },
];

const perks = [
  { icon: '🎟️', text: 'ฟรีค่าสมัครเรียน (ตามเงื่อนไขของแต่ละโรงเรียน)' },
  { icon: '💸', text: 'ส่วนลดค่าเรียนพิเศษเฉพาะผู้เข้าร่วมงาน' },
  { icon: '🚗', text: 'ฟรี Airport Pickup รับถึงสนามบิน' },
  { icon: '💻', text: 'ฟรี Online English Class ก่อนบิน' },
  { icon: '📱', text: 'ฟรี eSIM สำหรับใช้งานในฟิลิปปินส์' },
  { icon: '🎯', text: 'ฟรีให้คำปรึกษาแผนการเรียนแบบตัวต่อตัว' },
  { icon: '🎁', text: 'สิทธิ์ลุ้นรับ Lucky Draw ของรางวัลพิเศษ' },
];

const audience = [
  { emoji: '🎓', label: 'นักเรียน / นักศึกษา' },
  { emoji: '💼', label: 'คนทำงาน' },
  { emoji: '📝', label: 'ผู้เตรียมสอบ IELTS' },
  { emoji: '📊', label: 'ผู้เตรียมสอบ TOEIC' },
  { emoji: '🌏', label: 'ผู้วางแผนเรียนต่อต่างประเทศ' },
  { emoji: '✈️', label: 'ผู้ต้องการพัฒนาภาษาอังกฤษ' },
];

const whyAttend = [
  { Icon: Building2, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',  title: 'พบตัวแทนโรงเรียน',    desc: 'คุยตรงกับผู้แทนโรงเรียนชั้นนำ 6 แห่งจากเซบู ฟิลิปปินส์' },
  { Icon: BookOpen,  color: 'text-teal-600 bg-teal-100 dark:bg-teal-900/30',  title: 'เปรียบเทียบหลักสูตร', desc: 'ข้อมูลครบ ค่าเรียน ที่พัก โปรแกรม ฟีเจอร์พิเศษแต่ละโรง' },
  { Icon: Gift,      color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30', title: 'โปรโมชั่นเฉพาะงาน', desc: 'ส่วนลดพิเศษ ทุนการศึกษา และสิทธิพิเศษที่หาไม่ได้นอกงาน' },
  { Icon: Award,     color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30', title: 'ทุนการศึกษา',        desc: 'สอบถามทุนและโปรแกรมพิเศษจากแต่ละโรงเรียนโดยตรง' },
  { Icon: Mic2,      color: 'text-rose-600 bg-rose-100 dark:bg-rose-900/30',   title: 'Live Q&A สดๆ',        desc: 'ถามตอบสดกับตัวแทนโรงเรียน ไม่มีกั้น ทุกข้อสงสัย' },
  { Icon: Heart,     color: 'text-pink-600 bg-pink-100 dark:bg-pink-900/30',   title: 'ที่พักและสิ่งอำนวยฯ', desc: 'รู้ทุกรายละเอียดห้องพัก อาหาร สิ่งอำนวยความสะดวก' },
  { Icon: Shield,    color: 'text-green-600 bg-green-100 dark:bg-green-900/30', title: 'คำแนะนำวีซ่า',        desc: 'ข้อมูลวีซ่านักเรียน ขั้นตอน เอกสาร และค่าธรรมเนียม' },
  { Icon: Handshake, color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30', title: 'ปรึกษาฟรีตัวต่อตัว', desc: 'จับคู่ปรึกษาแผนเรียนส่วนตัวกับผู้เชี่ยวชาญ Philingo' },
];

const faqs = [
  { q: 'เข้าร่วมงานอย่างไร?', a: 'ลงทะเบียนผ่านฟอร์มด้านล่าง หลังจากนั้นเราจะส่งลิงก์ Google Meet ให้ผ่าน LINE Official ก่อนวันงาน 1–2 วัน' },
  { q: 'งานนี้เสียค่าใช้จ่ายไหม?', a: 'ฟรีทั้งหมด ไม่มีค่าลงทะเบียน ไม่มีค่าเข้าร่วมงาน ไม่มีค่าสมัครใดๆ ทั้งสิ้น' },
  { q: 'ผู้ปกครองเข้าร่วมได้ไหม?', a: 'ได้เลยครับ ยินดีต้อนรับผู้ปกครองที่ต้องการข้อมูลสำหรับวางแผนการศึกษาให้บุตรหลาน' },
  { q: 'จะได้รับโปรโมชั่นจากงานไหม?', a: 'ใช่ ผู้ลงทะเบียนผ่านงานนี้จะได้รับสิทธิ์โปรโมชั่นพิเศษจากทุกโรงเรียน รวมถึงส่วนลดค่าเรียน ฟรีค่าสมัคร และของรางวัลพิเศษ' },
  { q: 'ถามคำถามโรงเรียนได้ไหมระหว่างงาน?', a: 'ได้เลย ทุก session มีช่วง Live Q&A สด สามารถพิมพ์คำถามในช่อง Chat หรือพูดคุยตรงกับผู้แทนโรงเรียนได้เลย' },
  { q: 'หากเข้าร่วมไม่ได้ในวันนั้น ทำอย่างไร?', a: 'ลงทะเบียนไว้ก่อนได้เลย เราจะแจ้งให้ทราบหาก session ที่คุณสนใจมีการบันทึก หรือติดต่อทีมงาน Philingo เพื่อนัดปรึกษาส่วนตัว' },
];

const BASE = (import.meta.env.BASE_URL ?? '/').replace(/\/$/, '');

const testimonials = [
  {
    name: 'น้ำ ศิริพร', role: 'เรียนที่ QQ English 12 สัปดาห์',
    avatarUrl: `${BASE}/testimonials/nam-siriporn.webp`,
    text: 'เข้าร่วมงานสัมมนาแล้วได้ข้อมูลครบมาก เปรียบเทียบโรงเรียนได้ง่าย ได้โปรส่วนลดค่าเรียนพิเศษด้วย ทีม Philingo ดูแลดีมากตั้งแต่ต้นจนถึงกลับถึงไทย ⭐⭐⭐⭐⭐',
    school: 'QQ English', color: 'border-sky-200 bg-sky-50/50 dark:bg-sky-900/10',
  },
  {
    name: 'พีท วุฒิชัย', role: 'เรียนที่ CIA 8 สัปดาห์',
    avatarUrl: `${BASE}/testimonials/pete-wutichai.webp`,
    text: 'ได้คุยกับผู้แทน CIA โดยตรงในงาน สอบถามเรื่องหลักสูตร IELTS ได้คำตอบชัดเจน ตัดสินใจได้เร็วมาก ราคาโปรที่ได้จากงานถูกกว่าที่อื่นเยอะเลยครับ ⭐⭐⭐⭐⭐',
    school: 'CIA', color: 'border-red-200 bg-red-50/50 dark:bg-red-900/10',
  },
  {
    name: 'แนน ปภาวี', role: 'เรียนที่ CPILS 16 สัปดาห์',
    avatarUrl: `${BASE}/testimonials/nan-papawi.webp`,
    text: 'งาน Education Fair ของ Philingo ดีมาก ได้ข้อมูลจริงๆ ไม่มีการปิดบัง ผู้แทนโรงเรียนตอบตรง ทีมงานช่วยวางแผนการเรียนให้ตรงกับเป้าหมาย TOEIC ของเราได้พอดี ⭐⭐⭐⭐⭐',
    school: 'CPILS', color: 'border-orange-200 bg-orange-50/50 dark:bg-orange-900/10',
  },
];

/* ─── JSON-LD Schemas ──────────────────────────────────────────────── */
function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/* ─── FAQ Accordion item ───────────────────────────────────────────── */
function FaqItem({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
      >
        <span className="font-semibold text-gray-900 dark:text-white text-sm">{q}</span>
        {open ? <ChevronUp className="w-4 h-4 text-primary shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            <div className="px-6 pb-5 text-sm text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-700 pt-4 bg-white dark:bg-gray-800">
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Main page ────────────────────────────────────────────────────── */
export default function Seminars() {
  const timeLeft = useCountdown(FIRST_EVENT);
  const BASE_S = import.meta.env.BASE_URL?.replace(/\/$/, '') || '';

  // Fetch event data (primary source — admin edits Events to update banner + info)
  const { data: eventData } = useQuery<{ imageUrl?: string; titleTh?: string; descriptionTh?: string }>({
    queryKey: ['seminar-event'],
    queryFn: () => fetch(`${BASE_S}/api/events/1`, { cache: 'no-store' }).then(r => r.ok ? r.json() : {}),
    staleTime: 0,
  });
  // Fallback: banners table (kept for backward compat)
  const { data: bannersData } = useQuery<{ data: { imageUrl: string }[] }>({
    queryKey: ['seminar-banner'],
    queryFn: () => fetch(`${BASE_S}/api/banners?isActive=true&limit=1`, { cache: 'no-store' }).then(r => r.ok ? r.json() : { data: [] }),
    staleTime: 0,
    enabled: !eventData?.imageUrl,
  });
  const heroBannerUrl = eventData?.imageUrl || bannersData?.data?.[0]?.imageUrl || seminarBannerFallback;

  // Settings (line, phone, meet link)
  const [lineAddUrl,   setLineAddUrl]   = useState('https://lin.ee/nBR4rsN');
  const [messengerUrl, setMessengerUrl] = useState('https://m.me/philingo.th');
  const [sitePhone,    setSitePhone]    = useState('061-656-4159');
  const [meetLink,     setMeetLink]     = useState('');

  useEffect(() => {
    const BASE = import.meta.env.BASE_URL?.replace(/\/$/, '') || '';
    fetch(`${BASE}/api/settings`, { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then((s: Record<string, string> | null) => {
        if (!s) return;
        if (s.phone)                    setSitePhone(s.phone);
        // For seminar CTA: prefer the dedicated "add" URL, then fallback to line_url or line_id
        if (s.line_official_add_url)    setLineAddUrl(s.line_official_add_url);
        else if (s.line_url)            setLineAddUrl(s.line_url);
        else if (s.line_id)             setLineAddUrl(`https://line.me/R/ti/p/${encodeURIComponent(s.line_id)}`);
        // Always sync messenger — empty in admin = hide button
        setMessengerUrl(s.messenger_url ?? '');
        if (s.seminar_meet_link)        setMeetLink(s.seminar_meet_link);
      })
      .catch(() => {});
  }, []);

  // Form state
  const [form, setForm] = useState({
    firstName: '', lastName: '', nickname: '', email: '', phone: '', lineId: '',
    age: '', education: '', englishLevel: '', schools: [] as string[],
    program: '', preferredDate: '', questions: '', consent: false,
  });
  const [submitted,         setSubmitted]         = useState(false);
  const [isSubmitting,      setIsSubmitting]      = useState(false);
  const [submitError,       setSubmitError]       = useState('');
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);

  // Auto-redirect to LINE Official 5 seconds after successful registration
  useEffect(() => {
    if (!submitted) return;
    setRedirectCountdown(5);
    const id = setInterval(() => {
      setRedirectCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(id);
          window.open(lineAddUrl, '_blank');
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [submitted, lineAddUrl]);

  const handleSchoolToggle = (school: string) => {
    setForm(prev => ({
      ...prev,
      schools: prev.schools.includes(school)
        ? prev.schools.filter(s => s !== school)
        : [...prev.schools, school],
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.consent) { setSubmitError('กรุณายอมรับเงื่อนไขการใช้งานก่อน'); return; }
    setIsSubmitting(true);
    setSubmitError('');
    try {
      const BASE = import.meta.env.BASE_URL?.replace(/\/$/, '') || '';
      const specialRequests = [
        form.age        ? `อายุ: ${form.age} ปี`              : '',
        form.education  ? `การศึกษา: ${form.education}`        : '',
        form.englishLevel ? `ระดับอังกฤษ: ${form.englishLevel}` : '',
        form.preferredDate ? `วันที่ต้องการ: ${form.preferredDate}` : '',
        form.questions  ? `คำถาม: ${form.questions}`           : '',
      ].filter(Boolean).join(' | ');

      const res = await fetch(`${BASE}/api/forms/seminar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${form.firstName} ${form.lastName}`.trim() || form.nickname,
          phone: form.phone,
          email: form.email || undefined,
          lineId: form.lineId,
          schoolInterest: form.schools.join(', '),
          programInterest: form.program,
          preferredDate: form.preferredDate || undefined,
          specialRequests,
          numParticipants: 1,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as any).message || `HTTP ${res.status}`);
      }
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setSubmitError('เกิดข้อผิดพลาด: ' + (err instanceof Error ? err.message : 'กรุณาลองใหม่อีกครั้ง'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // FAQ open state
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useSeoMeta(
    'Philingo Cebu Online Education Fair 2026 🇵🇭 | รับฟรีตั๋วเครื่องบิน 20 ที่นั่ง',
    'ลงทะเบียนฟรี! รับฟรีตั๋วเครื่องบินไป-กลับ 20 ที่นั่ง เมื่อสมัครเรียน พบตัวแทน 7 สถาบันชั้นนำจากเซบู ผ่าน Google Meet 29 ส.ค. – 12 ก.ย. 2569',
    'Philingo, Education Fair, เรียนต่อฟิลิปปินส์, เซบู, โรงเรียนภาษา, IELTS, TOEIC, QQ English, CIA, CPILS, EV Academy, ตั๋วเครื่องบินฟรี'
  );

  /* JSON-LD schemas */
  const eventSchema = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: 'Philingo Cebu Online Education Fair 2026',
    startDate: '2026-08-29T10:00:00+07:00',
    endDate: '2026-09-12T12:00:00+07:00',
    eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    location: { '@type': 'VirtualLocation', url: 'https://meet.google.com' },
    organizer: {
      '@type': 'Organization',
      name: 'Philingo — Thai Study Abroad Consultant',
      url: 'https://philingoedu.com',
    },
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'THB', availability: 'https://schema.org/InStock' },
    image: heroBannerUrl,
    description: 'งาน Online Education Fair เรียนต่อฟิลิปปินส์ พบตัวแทนโรงเรียนภาษาชั้นนำ 6 แห่งจากเซบู ผ่าน Google Meet ฟรีไม่มีค่าใช้จ่าย',
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Philingo — Thai Study Abroad Consultant',
    url: 'https://philingoedu.com',
    contactPoint: { '@type': 'ContactPoint', telephone: sitePhone, contactType: 'customer service' },
    sameAs: [lineAddUrl],
    description: 'บริษัทที่ปรึกษาด้านการศึกษาต่างประเทศ เชี่ยวชาญเรียนต่อฟิลิปปินส์ สมาชิก TIECA',
  };

  const isExpired = new Date() >= new Date(EVENT_END);

  return (
    <Layout>
      {/* JSON-LD schemas */}
      <JsonLd data={eventSchema} />
      <JsonLd data={faqSchema} />
      <JsonLd data={orgSchema} />

      {/* ── HERO — Banner Image + overlay bar ── */}
      <AdminEditSection href="/admin/banners" label="แก้ไขแบนเนอร์สัมมนา">
        <section className="bg-white dark:bg-gray-900 pt-0 pb-0">
          <div className="md:container md:max-w-7xl md:mx-auto md:px-4 md:pt-4">
            <div className="relative overflow-hidden shadow-2xl md:rounded-3xl min-h-[450px] md:min-h-[520px]">
              <img
                src={heroBannerUrl}
                alt="Philingo Cebu Online Education Fair 2026"
                className="w-full h-full object-cover object-left-top md:object-top absolute inset-0 md:relative md:h-auto"
                loading="eager"
                fetchPriority="high"
              />
              {/* overlay bar — compact on mobile (<640px), normal on sm+ */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm px-3 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-1.5 sm:gap-3">
                  {/* countdown */}
                  {!isExpired ? (
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                      <span className="text-white/70 text-xs font-semibold uppercase tracking-wider whitespace-nowrap hidden sm:block">นับถอยหลัง</span>
                      <div className="flex gap-1 sm:gap-1.5 text-center">
                        {[
                          { val: timeLeft.days,    label: 'วัน' },
                          { val: timeLeft.hours,   label: 'ชม.' },
                          { val: timeLeft.minutes, label: 'นาที' },
                          { val: timeLeft.seconds, label: 'วิ' },
                        ].map((t, i) => (
                          <div key={i} className="bg-white/10 border border-white/20 rounded-lg px-1.5 py-1 sm:px-2.5 sm:py-1.5 min-w-[36px] sm:min-w-[44px] text-center">
                            <div className="text-white text-base sm:text-xl font-bold tabular-nums leading-none">{String(t.val).padStart(2, '0')}</div>
                            <div className="text-white/50 text-[9px] mt-0.5">{t.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <span className="text-white/80 text-xs font-semibold">งานสิ้นสุดแล้ว · ติดต่อทีม Philingo สำหรับข้อมูลงานถัดไป</span>
                  )}
                  {/* date + platform */}
                  <div className="flex flex-wrap justify-center gap-1 sm:gap-2 text-xs">
                    <div className="flex items-center gap-1 sm:gap-1.5 bg-white/10 border border-white/20 text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded-full whitespace-nowrap">
                      <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-yellow-400 shrink-0" />
                      <span>29 ส.ค. – 12 ก.ย. 2569</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-1.5 bg-[#1a73e8]/60 border border-[#4285f4]/40 text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded-full whitespace-nowrap">
                      <Video className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white shrink-0" />
                      <span className="font-semibold">Google Meet · Online</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-1.5 bg-white/10 border border-white/20 text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded-full whitespace-nowrap">
                      <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-green-400 shrink-0" />
                      <span>10:00–11:00 น.</span>
                    </div>
                  </div>
                  {/* CTA */}
                  <a href="#register" className="shrink-0 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs sm:text-sm px-4 py-1.5 sm:px-5 sm:py-2 rounded-lg transition-all hover:scale-105 shadow-md whitespace-nowrap border border-rose-400">
                    🎟️ ลงทะเบียนเข้าร่วมงาน →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </AdminEditSection>

      {/* ── REGISTER CTA PINK BOX ── */}
      <section className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 py-6">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <p className="text-white font-extrabold text-xl md:text-2xl">🎟️ ลงทะเบียนเข้าร่วมงาน — <span className="underline">ฟรี!</span> ไม่มีค่าใช้จ่าย</p>
          <p className="text-white/80 text-sm mt-1 mb-4">พบตัวแทน 7 สถาบันชั้นนำ ผ่าน Google Meet · รับโปรพิเศษเฉพาะผู้เข้าร่วม</p>
          <a href="#register"
            className="inline-block bg-white hover:bg-gray-50 text-rose-600 font-extrabold px-10 py-3 rounded-xl text-base transition-all hover:scale-105 shadow-lg whitespace-nowrap">
            ลงทะเบียนทันที →
          </a>
        </div>
      </section>

      {/* ── PROMO HEADLINE BANNER ── */}
      <section className="py-6 text-center" style={{background: 'linear-gradient(135deg, #FF6B00 0%, #FF9F00 35%, #FFD700 60%, #FF9F00 80%, #FF6B00 100%)'}}>
        <div className="container max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <Plane className="w-6 h-6 text-white drop-shadow shrink-0" />
            <p className="text-white font-extrabold text-xl md:text-2xl drop-shadow-md">
              ✈️ รับฟรี! ตั๋วเครื่องบินไป-กลับ <span className="underline decoration-wavy decoration-white/70">20 ที่นั่ง</span> เมื่อสมัครเรียน
            </p>
          </div>
          <p className="text-white/90 text-xs mt-2 font-medium">
            เงื่อนไขและโปรโมชั่นเพิ่มเติมเป็นไปตามที่แต่ละสถาบันกำหนด
          </p>
        </div>
      </section>

      {/* ── SCHOOL LOGOS STRIP ── */}
      <section className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 py-10">
        <div className="container max-w-5xl mx-auto px-4">
          <p className="text-center text-sm font-extrabold text-primary uppercase tracking-widest mb-8">🏫 สถาบันที่เข้าร่วมงาน</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {[
              { logo: bcebuLogo,      name: "B'Cebu",           color: 'text-indigo-700' },
              { logo: philinterLogo,  name: 'Philinter Academy', color: 'text-green-700' },
              { logo: evLogo,         name: 'EV Academy',        color: 'text-purple-700' },
              { logo: cpilsLogo,      name: 'CPILS',             color: 'text-orange-500' },
              { logo: null,           name: 'I.BREEZE',          color: 'text-teal-600' },
              { logo: qqLogo,         name: 'QQ English',        color: 'text-sky-600' },
              { logo: ciaLogo,        name: 'CIA',               color: 'text-red-700' },
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-2 transition-all duration-300 hover:scale-110 hover:-translate-y-1">
                {s.logo ? (
                  <img src={s.logo} alt={s.name} className="h-12 md:h-16 w-auto object-contain drop-shadow-sm" loading="lazy" />
                ) : (
                  <div className="h-12 md:h-16 flex items-center justify-center bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-extrabold text-lg px-5 rounded-xl shadow-sm">
                    I.BREEZE
                  </div>
                )}
                <span className={`text-xs font-bold ${s.color}`}>{s.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY ATTEND — icon cards ── */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">🎯 ทำไมต้องเข้าร่วม?</h2>
            <p className="text-gray-500 dark:text-gray-400">8 เหตุผลที่ไม่ควรพลาดงานนี้</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {whyAttend.map(({ Icon, color, title, desc }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-2">{title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SCHEDULE ── */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">📅 ตารางสัมมนา</h2>
            <p className="text-gray-500 dark:text-gray-400">7 สถาบัน · รอบเช้า 10:00–11:00 น. · รอบบ่าย 14:00–15:00 น. · ผ่าน Google Meet</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border overflow-hidden hover:shadow-xl transition-shadow ${
                  (s as any).isOpen ? 'border-dashed border-gray-300 dark:border-gray-600 opacity-80' :
                  (s as any).isSpecial ? 'border-2 border-red-300 dark:border-red-800' :
                  'border-gray-100 dark:border-gray-700'
                }`}
              >
                <div className={`bg-gradient-to-r ${s.bg} p-5 flex items-center justify-between`}>
                  <div className="text-white">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold opacity-80 uppercase tracking-wider">Session {i + 1}</span>
                      <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">{s.round}</span>
                      {(s as any).isSpecial && <span className="text-[10px] bg-yellow-400 text-gray-900 px-2 py-0.5 rounded-full font-bold">✨ พิเศษ</span>}
                    </div>
                    <div className="font-bold text-lg">{s.school}</div>
                    <div className="text-xs opacity-80 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />{s.location}
                    </div>
                  </div>
                  <div className="bg-white/20 rounded-xl p-3 text-center min-w-[56px]">
                    {s.logo ? (
                      <img src={s.logo} alt={s.school} className="h-10 w-auto object-contain" loading="lazy" />
                    ) : (s as any).isOpen ? (
                      <div className="text-white font-bold text-xl">?</div>
                    ) : (
                      <div className="text-white font-bold text-sm">I.B</div>
                    )}
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 text-sm font-medium text-primary mb-2">
                    <Calendar className="w-4 h-4 shrink-0" />{s.date}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
                    <Clock className="w-4 h-4 shrink-0" />{s.time}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 mb-4">
                    <Users className="w-3.5 h-3.5 shrink-0" />{s.presenter}
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-medium leading-relaxed mb-4">{s.topic}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {s.programs.map((p, j) => (
                      <span key={j} className={`text-xs font-medium px-2.5 py-1 rounded-full ${s.pillColor}`}>{p}</span>
                    ))}
                  </div>
                  {!(s as any).isOpen && (
                    <a href="#register" className="mt-4 block text-center text-xs font-semibold text-primary border border-primary/30 rounded-xl py-2 hover:bg-primary hover:text-white transition-all">
                      ลงทะเบียน Session นี้ →
                    </a>
                  )}
                  {(s as any).isOpen && (
                    <div className="mt-4 text-center text-xs text-gray-400 border border-dashed border-gray-300 rounded-xl py-2">
                      🔔 ลงทะเบียนรับข่าวสารก่อนใคร
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GOOGLE MEET SECTION ── */}
      <section className="py-14 bg-gradient-to-br from-[#1a73e8]/5 to-blue-50 dark:from-[#1a73e8]/10 dark:to-gray-900/80 border-y border-blue-100 dark:border-blue-900/30">
        <div className="container max-w-3xl mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg flex items-center justify-center border border-blue-100 dark:border-blue-900/30">
              <Video className="w-8 h-8 text-[#1a73e8]" />
            </div>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">💻 ช่องทางเข้าร่วมงาน</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">งานจัดผ่าน Google Meet ออนไลน์ 100% ไม่ต้องเดินทาง</p>
          <div className="grid sm:grid-cols-3 gap-4 mb-8 text-sm">
            {[
              { icon: <Calendar className="w-5 h-5 text-blue-600" />, label: 'วันที่', val: '29 ส.ค. – 12 ก.ย. 2569' },
              { icon: <Clock className="w-5 h-5 text-green-600" />, label: 'เวลา', val: 'รอบเช้า 10:00 น. · รอบบ่าย 14:00 น.' },
              { icon: <Video className="w-5 h-5 text-purple-600" />, label: 'แพลตฟอร์ม', val: 'Google Meet (ฟรี)' },
            ].map((item, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
                <div className="flex justify-center mb-3">{item.icon}</div>
                <div className="text-xs text-gray-500 mb-1">{item.label}</div>
                <div className="font-semibold text-gray-900 dark:text-white">{item.val}</div>
              </div>
            ))}
          </div>
          {meetLink ? (
            <a
              href={meetLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white font-bold px-8 py-3.5 rounded-xl transition-all hover:scale-105 shadow-lg"
            >
              <Video className="w-5 h-5" /> เข้าร่วม Google Meet
            </a>
          ) : (
            <div className="bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 max-w-md mx-auto">
              <div className="text-blue-600 dark:text-blue-400 font-semibold mb-2">📧 รับลิงก์หลังลงทะเบียน</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">ลิงก์ Google Meet จะถูกส่งให้ผ่าน <strong>LINE Official</strong> และ <strong>อีเมล</strong> ก่อนวันงาน 1–2 วัน</p>
              <a href="#register" className="mt-4 inline-block bg-[#F5B800] text-gray-900 font-bold px-6 py-2.5 rounded-lg text-sm hover:bg-[#e0a800] transition-all">
                ลงทะเบียนเพื่อรับลิงก์
              </a>
            </div>
          )}
        </div>
      </section>

      {/* ── PERKS ── */}
      <section className="py-20 bg-gradient-to-br from-[#F5B800] to-[#f97316] text-gray-900">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">🎁 โปรโมชั่นเฉพาะผู้เข้าร่วมงาน</h2>
            <p className="text-gray-900/70 text-lg">สิทธิพิเศษที่ไม่มีวันไหนให้ นอกจากวันงาน</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {perks.map((perk, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="bg-white/80 backdrop-blur-sm rounded-xl p-5 flex items-start gap-4 shadow-sm"
              >
                <span className="text-2xl">{perk.icon}</span>
                <span className="text-sm font-medium text-gray-800 leading-relaxed">{perk.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHO IS THIS FOR ── */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">👨‍🏫 เหมาะสำหรับ</h2>
            <p className="text-gray-500 dark:text-gray-400">ทุกคนที่สนใจพัฒนาภาษาอังกฤษในฟิลิปปินส์</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {audience.map((a, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-5 text-center hover:border-primary transition-colors">
                <div className="text-3xl mb-2">{a.emoji}</div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{a.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW TO JOIN ── */}
      <section className="py-16 bg-primary text-white">
        <div className="container max-w-4xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">📌 วิธีเข้าร่วมงาน (ง่ายมาก!)</h2>
          <div className="flex flex-col md:flex-row items-stretch gap-0">
            {[
              { num: 1, text: 'ลงทะเบียนออนไลน์ด้านล่าง' },
              { num: 2, text: 'รับอีเมลและ SMS ยืนยัน' },
              { num: 3, text: 'เพิ่มเพื่อน LINE Official' },
              { num: 4, text: 'รับลิงก์ Google Meet' },
              { num: 5, text: 'เข้าร่วมสัมมนาฟรี 🎉' },
            ].map((step, i) => (
              <div key={i} className="flex md:flex-col items-center gap-3 md:gap-2 flex-1">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-white text-primary rounded-full flex items-center justify-center font-bold text-lg shrink-0">{step.num}</div>
                <p className="text-sm md:text-center text-white/90 leading-snug">{step.text}</p>
                {i < 4 && <ArrowRight className="w-5 h-5 text-white/50 md:hidden shrink-0" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REGISTRATION FORM (enhanced) ── */}
      <section id="register" className="py-20 bg-gray-50 dark:bg-gray-900/50 scroll-mt-20">
        <div className="container max-w-2xl mx-auto px-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            {/* Form header */}
            <div className="bg-gradient-to-r from-[#1B4FD8] to-[#0ea5e9] p-8 text-white text-center">
              <div className="text-4xl mb-3">🎓</div>
              <h2 className="text-2xl font-bold mb-2">ลงทะเบียนเข้าร่วมงาน</h2>
              <p className="text-white/80 text-sm">ฟรี ไม่มีค่าใช้จ่าย · กรอกข้อมูลภายใน 2 นาที</p>
            </div>

            {submitted ? (
              <div className="p-10 text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">ลงทะเบียนสำเร็จ!</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-1">
                  ระบบส่ง <b>อีเมลยืนยัน + ลิงก์ Google Meet</b> ไปยังอีเมลของคุณแล้ว
                </p>
                <p className="text-gray-400 text-sm mb-6">กรุณาตรวจสอบกล่อง Inbox (และโฟลเดอร์ Spam)</p>

                {/* LINE CTA + countdown */}
                <a href={lineAddUrl} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-2 bg-[#00B900] hover:bg-[#00A000] text-white font-bold px-8 py-3 rounded-xl transition-colors text-base shadow-md">
                  <SiLine className="w-5 h-5" />
                  เพิ่ม LINE Official รับข่าวสารก่อนงาน
                </a>

                {redirectCountdown !== null && (
                  <p className="text-sm text-gray-400 mt-4 animate-pulse">
                    🔗 กำลังเปิด LINE Official ใน {redirectCountdown} วินาที...
                  </p>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-8 space-y-5">
                {submitError && (
                  <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{submitError}</div>
                )}

                {/* Name row */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">ชื่อจริง <span className="text-red-500">*</span></label>
                    <input type="text" required placeholder="เช่น สมชาย" value={form.firstName}
                      onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))}
                      className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-gray-900 dark:text-white placeholder:text-gray-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">นามสกุล <span className="text-red-500">*</span></label>
                    <input type="text" required placeholder="เช่น ใจดี" value={form.lastName}
                      onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))}
                      className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-gray-900 dark:text-white placeholder:text-gray-400" />
                  </div>
                </div>

                {/* Nickname + age */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">ชื่อเล่น</label>
                    <input type="text" placeholder="เช่น โอ๊ต" value={form.nickname}
                      onChange={e => setForm(p => ({ ...p, nickname: e.target.value }))}
                      className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-gray-900 dark:text-white placeholder:text-gray-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">อายุ</label>
                    <input type="number" min="10" max="80" placeholder="เช่น 25" value={form.age}
                      onChange={e => setForm(p => ({ ...p, age: e.target.value }))}
                      className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-gray-900 dark:text-white placeholder:text-gray-400" />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">อีเมล (สำหรับรับยืนยัน)</label>
                  <input type="email" placeholder="email@example.com" value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-gray-900 dark:text-white placeholder:text-gray-400" />
                </div>

                {/* Phone + LINE */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">เบอร์โทรศัพท์ <span className="text-red-500">*</span></label>
                    <input type="tel" required placeholder="08X-XXX-XXXX" value={form.phone}
                      onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                      className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-gray-900 dark:text-white placeholder:text-gray-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">LINE ID <span className="text-red-500">*</span></label>
                    <input type="text" required placeholder="@yourlineid" value={form.lineId}
                      onChange={e => setForm(p => ({ ...p, lineId: e.target.value }))}
                      className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-gray-900 dark:text-white placeholder:text-gray-400" />
                  </div>
                </div>

                {/* Education + English Level */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">ระดับการศึกษา</label>
                    <select value={form.education} onChange={e => setForm(p => ({ ...p, education: e.target.value }))}
                      className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-gray-900 dark:text-white">
                      <option value="">เลือก...</option>
                      <option>มัธยมปลาย / ม.6</option>
                      <option>ปวช / ปวส</option>
                      <option>ปริญญาตรี</option>
                      <option>ปริญญาโท / เอก</option>
                      <option>ทำงานแล้ว</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">ระดับภาษาอังกฤษ</label>
                    <select value={form.englishLevel} onChange={e => setForm(p => ({ ...p, englishLevel: e.target.value }))}
                      className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-gray-900 dark:text-white">
                      <option value="">เลือก...</option>
                      <option>เริ่มต้น (Beginner)</option>
                      <option>พื้นฐาน (Elementary)</option>
                      <option>ปานกลาง (Intermediate)</option>
                      <option>ค่อนข้างดี (Upper-intermediate)</option>
                      <option>ดีมาก (Advanced)</option>
                    </select>
                  </div>
                </div>

                {/* Preferred School */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">สถาบันที่สนใจ (เลือกได้มากกว่า 1)</label>
                  <div className="grid grid-cols-2 gap-3">
                    {sessions.filter(s => !(s as any).isOpen).map((s) => (
                      <label key={s.school}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                          form.schools.includes(s.school)
                            ? 'border-primary bg-primary/5 dark:bg-primary/10'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <input type="checkbox" value={s.school} checked={form.schools.includes(s.school)}
                          onChange={() => handleSchoolToggle(s.school)}
                          className="accent-primary w-4 h-4 shrink-0" />
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{s.school}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Preferred program + date */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">หลักสูตรที่สนใจ</label>
                    <select value={form.program} onChange={e => setForm(p => ({ ...p, program: e.target.value }))}
                      className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-gray-900 dark:text-white">
                      <option value="">เลือก...</option>
                      <option>General English</option>
                      <option>IELTS Preparation</option>
                      <option>TOEIC Boost</option>
                      <option>Business English</option>
                      <option>Semi-Sparta</option>
                      <option>Callan Method</option>
                      <option>Speaking / Conversation</option>
                      <option>ยังไม่แน่ใจ</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Session ที่ต้องการเข้าร่วม</label>
                    <select value={form.preferredDate} onChange={e => setForm(p => ({ ...p, preferredDate: e.target.value }))}
                      className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-gray-900 dark:text-white">
                      <option value="">เลือก...</option>
                      {sessions.filter(s => !(s as any).isOpen).map(s => (
                        <option key={s.dateValue} value={s.dateValue}>{s.dateShort} — {s.school}</option>
                      ))}
                      <option value="all">ต้องการเข้าทุก session</option>
                    </select>
                  </div>
                </div>

                {/* Questions */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">คำถามสำหรับโรงเรียน (ถ้ามี)</label>
                  <textarea rows={3} placeholder="เช่น อยากทราบค่าใช้จ่ายรวมสำหรับ IELTS 12 สัปดาห์ที่ CIA ..."
                    value={form.questions} onChange={e => setForm(p => ({ ...p, questions: e.target.value }))}
                    className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-gray-900 dark:text-white placeholder:text-gray-400 resize-none" />
                </div>

                {/* Consent */}
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={form.consent} onChange={e => setForm(p => ({ ...p, consent: e.target.checked }))}
                    className="accent-primary w-4 h-4 mt-0.5 shrink-0" />
                  <span className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    ฉันยินยอมให้ Philingo เก็บรวบรวมและใช้ข้อมูลส่วนตัวเพื่อประสานงานงานสัมมนาและให้คำปรึกษาด้านการศึกษา
                    ตามนโยบายความเป็นส่วนตัวของ Philingo
                  </span>
                </label>

                <button type="submit" disabled={isSubmitting}
                  className="w-full bg-[#1B4FD8] hover:bg-[#1B4FD8]/90 disabled:opacity-60 text-white font-bold py-4 rounded-xl text-lg transition-all hover:scale-[1.02] shadow-lg">
                  {isSubmitting ? '⏳ กำลังส่ง...' : 'ลงทะเบียนฟรีเลย 🎉'}
                </button>

                <p className="text-xs text-center text-gray-400 dark:text-gray-500">
                  ข้อมูลของคุณจะถูกใช้เพื่อประสานงานเท่านั้น ไม่มีการเปิดเผยต่อบุคคลที่สาม
                </p>
              </form>
            )}
          </div>

          {/* Contact strip */}
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <a href={`tel:${sitePhone.replace(/[^0-9]/g, '')}`}
              className="flex items-center justify-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-5 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:border-primary transition-colors text-sm font-medium">
              <Phone className="w-4 h-4 text-primary" /> {sitePhone}
            </a>
            <a href={lineAddUrl} target="_blank" rel="noreferrer"
              className="flex items-center justify-center gap-2 bg-[#00B900] text-white px-5 py-3 rounded-xl hover:bg-[#00A000] transition-colors text-sm font-medium">
              <SiLine className="w-4 h-4" /> LINE Official
            </a>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container max-w-3xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">❓ คำถามที่พบบ่อย</h2>
            <p className="text-gray-500 dark:text-gray-400">ตอบทุกข้อสงสัยก่อนตัดสินใจลงทะเบียน</p>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <FaqItem key={i} q={faq.q} a={faq.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">⭐ เสียงจากนักเรียน Philingo</h2>
            <p className="text-gray-500 dark:text-gray-400">ประสบการณ์จริงจากนักเรียนที่ผ่านมาแล้ว</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`bg-white dark:bg-gray-800 rounded-2xl border-2 p-6 hover:shadow-lg transition-shadow ${t.color}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={t.avatarUrl}
                    alt={t.name}
                    className="w-12 h-12 rounded-full object-cover object-top flex-shrink-0"
                    loading="lazy"
                    decoding="async"
                  />
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white text-sm">{t.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{t.role}</div>
                  </div>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{t.text}</p>
              </motion.div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <a href="/blog?category=review" className="inline-flex items-center gap-2 text-primary font-semibold hover:underline text-sm">
              อ่านรีวิวเพิ่มเติมจากนักเรียนทั้งหมด <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ── ORGANIZER ── */}
      <section className="py-20 bg-gradient-to-br from-[#1B4FD8] to-[#0ea5e9] text-white">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <p className="text-white/70 text-sm font-semibold uppercase tracking-widest mb-4">ผู้จัดงาน</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Philingo</h2>
          <p className="text-white/80 text-lg mb-2">Thai Study Abroad Consultant Co., Ltd.</p>
          <p className="text-white/70 text-sm mb-10">สมาชิก TIECA · ประสบการณ์กว่า 20 ปีในการแนะนำเรียนต่อต่างประเทศ</p>

          <div className="grid sm:grid-cols-3 gap-6 mb-12">
            {[
              { icon: <Award className="w-6 h-6" />, label: '20+ ปีประสบการณ์', val: 'ผู้เชี่ยวชาญด้านเรียนต่อฟิลิปปินส์' },
              { icon: <Users className="w-6 h-6" />, label: '5,000+ นักเรียน', val: 'ที่เราดูแลมาแล้วทั่วประเทศไทย' },
              { icon: <Shield className="w-6 h-6" />, label: 'สมาชิก TIECA', val: 'มาตรฐานที่ปรึกษาการศึกษาต่างประเทศ' },
            ].map((item, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex justify-center mb-3 text-yellow-300">{item.icon}</div>
                <div className="font-bold text-lg">{item.label}</div>
                <div className="text-white/70 text-xs mt-1">{item.val}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <a href={`tel:${sitePhone.replace(/[^0-9]/g, '')}`}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white px-5 py-3 rounded-xl transition-all text-sm font-medium">
              <Phone className="w-4 h-4" /> {sitePhone}
            </a>
            <a href={lineAddUrl} target="_blank" rel="noreferrer"
              className="flex items-center gap-2 bg-[#00B900] hover:bg-[#00A000] text-white px-5 py-3 rounded-xl transition-all text-sm font-medium">
              <SiLine className="w-4 h-4" /> LINE Official
            </a>
            {messengerUrl && (
              <a href={messengerUrl} target="_blank" rel="noreferrer"
                className="flex items-center gap-2 bg-gradient-to-tr from-[#00C6FF] to-[#0072FF] hover:opacity-90 text-white px-5 py-3 rounded-xl transition-all text-sm font-medium">
                <SiMessenger className="w-4 h-4" /> Messenger
              </a>
            )}
            <a href="https://philingoedu.com" target="_blank" rel="noreferrer"
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white px-5 py-3 rounded-xl transition-all text-sm font-medium">
              <Globe className="w-4 h-4" /> philingoedu.com
            </a>
          </div>
        </div>
      </section>

      {/* ── STICKY MOBILE CTA ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 py-3 pb-[env(safe-area-inset-bottom)]"
           style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #ec4899 50%, #f43f5e 100%)' }}>
        <a
          href="#register"
          className="flex items-center justify-center gap-2 w-full bg-white/15 hover:bg-white/25 border-2 border-white/40 text-white font-extrabold py-4 rounded-2xl text-base transition-all active:scale-95 shadow-xl tracking-wide"
        >
          🎟️ ลงทะเบียนเข้าร่วมงานฟรี!
        </a>
      </div>
    </Layout>
  );
}
