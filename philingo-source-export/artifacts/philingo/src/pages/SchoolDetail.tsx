import React, { useState, useEffect, useRef } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Link, useParams } from 'wouter';
import { PriceCalculator, PricingConfig } from '@/components/PriceCalculator';
import { RoomTypeTabs, RoomTypeDetail } from '@/components/RoomTypeTabs';
import { FacilitiesGallery, FacilityItem } from '@/components/FacilitiesGallery';
import { CourseTimetable, TimetableConfig } from '@/components/CourseTimetable';
import { MapPin, Star, Users, Clock, CheckCircle2, Wifi, Coffee, Home as HomeIcon, Dumbbell, BookOpen, ArrowLeft, Download, Play, Phone, ChevronLeft, ChevronRight, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { SiLine } from 'react-icons/si';

import { SchoolCarousel } from '@/components/SchoolCarousel';
import { QuotationModal } from '@/components/QuotationModal';
import philingoLogo from '@assets/philingo_logo_transparent.png';

/* ─── VideoPlayer component ──────────────────────────────────────── */
type VItem = { id: string; type: 'youtube' | 'upload'; url: string; youtubeId?: string; titleTh?: string; title?: string; };
function VideoPlayer({ video, index }: { video: VItem; index: number }) {
  const [playing, setPlaying] = useState(false);
  const isYoutube = video.type === 'youtube';
  const ytId = video.youtubeId ?? (isYoutube
    ? video.url.match(/(?:v=|youtu\.be\/|embed\/|shorts\/|live\/)([A-Za-z0-9_-]{11})/)?.[1] ?? null
    : null);
  const label = video.titleTh || video.title || (isYoutube ? '▶ YouTube' : `วีดีโอ ${index + 1}`);

  return (
    <div className="w-full">
      {(video.titleTh || video.title) && (
        <p className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">{label}</p>
      )}
      {isYoutube && ytId ? (
        !playing ? (
          <div className="relative w-full rounded-2xl overflow-hidden bg-gray-900 cursor-pointer group" style={{ aspectRatio: '16/9' }} onClick={() => setPlaying(true)}>
            <img src={`https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`} alt={label} className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" onError={e => { (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`; }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xl">
                <Play className="w-7 h-7 md:w-8 md:h-8 text-white fill-white ml-1" />
              </div>
            </div>
            <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-lg font-medium">▶ แตะเพื่อเล่น</div>
          </div>
        ) : (
          <div className="w-full rounded-2xl overflow-hidden bg-gray-900" style={{ aspectRatio: '16/9' }}>
            <iframe
              src={`https://www.youtube.com/embed/${ytId}?autoplay=1&playsinline=1`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        )
      ) : (
        /* Direct video file (uploaded to object storage) */
        <div className="w-full rounded-2xl overflow-hidden bg-gray-900" style={{ aspectRatio: '16/9' }}>
          <video controls className="w-full h-full" preload="metadata" playsInline poster="">
            <source src={video.url} type="video/mp4" />
            <source src={video.url} />
            เบราว์เซอร์ไม่รองรับการเล่นวีดีโอ
          </video>
        </div>
      )}
    </div>
  );
}

// Available images
import campusImg from '@assets/generated_images/campus-1.jpg';
import classroomImg from '@assets/generated_images/classroom-1.jpg';
import cebuImg from '@assets/generated_images/cebu-1.jpg';
import baguioImg from '@assets/generated_images/baguio-1.jpg';
import heroImg from '@assets/f798a378-eb90-40b3-8d5e-72231d967e0c_1785171375147.png';
import marketing1 from '@assets/ee6abb87-5291-4391-a40c-0b39c0c6777e_1785171375148.png';
import iloiloImg from '@assets/city-photos/iloilo.jpg';
import cebuCityImg from '@assets/city-photos/cebu.jpg';

// Room & facility photos
import roomQuad    from '@assets/room-quad.jpg';
import roomTriple  from '@assets/room-triple.jpg';
import roomTwin    from '@assets/room-twin.jpg';
import roomSingle  from '@assets/room-single.jpg';
import facCafeteria  from '@assets/facility-cafeteria.jpg';
import facClassroom  from '@assets/facility-classroom.jpg';
import facPool       from '@assets/facility-pool.jpg';
import facLibrary    from '@assets/facility-library.jpg';

// School logos
import ciaLogo from '@assets/image_1785200711221.png';
import qqLogo from '@assets/image_1785200772068.png';
import philinterLogo from '@assets/image_1785200753254.png';
import bcebuLogo from '@assets/image_1785200917465.png';
import cpilsLogo from '@assets/image_1785200802634.png';
import evLogo from '@assets/image_1785200695195.png';
import { useSettings } from '@/hooks/use-settings';
import { useSeoMeta } from '@/hooks/use-seo-meta';
import { schoolsCebu2 } from '@/data/schoolsCebu2';
import { schoolsBaguio2 } from '@/data/schoolsBaguio2';
import { schoolsOther } from '@/data/schoolsOther';

// ─── Types ────────────────────────────────────────────────────────
interface CoursePrice { name: string; duration: string; w4?: number; w8?: number; w12?: number; w24?: number; }
// Legacy simple room type (used by non-CIA schools)
interface RoomType { name: string; persons: string; pricePerWeek: number; amenities: string[]; }
interface SchoolData {
  slug: string;
  name: string;
  tagline: string;
  city: string;
  country: string;
  logo: string | null;
  logoText?: string;
  rating: number;
  students: string;
  nationality: string;
  founded: number;
  photos: string[];
  highlights: string[];
  description: string;
  facilities: { icon: React.ComponentType<any>; label: string }[];
  facilityItems?: FacilityItem[];   // rich facilities with photos
  programs: CoursePrice[];
  roomTypes: RoomType[];
  richRooms?: RoomTypeDetail[];     // detailed rooms with photos + tabs
  timetable?: TimetableConfig;      // weekly class schedule
  youtubeId: string | null;
  website: string;
  mapUrl: string;
  accent: string;
  tags: string[];
  pricingConfig?: PricingConfig | null;
}

// ─── School Data ──────────────────────────────────────────────────
const facilitySet = [
  { icon: HomeIcon, label: 'หอพักในตัวโรงเรียน' },
  { icon: Coffee, label: 'อาหาร 3 มื้อ' },
  { icon: Wifi, label: 'Wi-Fi ฟรีทุกพื้นที่' },
  { icon: Dumbbell, label: 'ฟิตเนส / สระว่ายน้ำ' },
  { icon: BookOpen, label: 'ห้องสมุดและห้องติวเพิ่ม' },
  { icon: Users, label: 'ครู Native ผ่าน TESOL' },
];

// ─── Helpers: auto-generate richRooms & facilityItems ─────────────
function makeRichRooms(rooms: RoomType[], photos: string[]): RoomTypeDetail[] {
  const sizeMap: Record<number, string> = { 4: '28 ตร.ม.', 3: '22 ตร.ม.', 2: '18 ตร.ม.', 1: '14 ตร.ม.' };
  return rooms.map((room, i) => {
    const cap = parseInt(room.persons) || 1;
    const hasPvt = room.amenities.some(a => a.includes('ในตัว'));
    return {
      id: `room_${i}`,
      name: room.name,
      nameTh: room.name,
      capacity: cap,
      bedConfig: cap > 1 ? `เตียงเดี่ยว ${cap} หลัง` : 'เตียงเดี่ยว หรือ Double',
      size: sizeMap[cap] ?? '14 ตร.ม.',
      bathroom: hasPvt ? 'private' : 'shared',
      pricePerWeek: room.pricePerWeek,
      priceNote: `฿${room.pricePerWeek.toLocaleString()}/สัปดาห์ · รวมอาหาร 3 มื้อ + ซักรีด`,
      amenities: room.amenities,
      photos: [photos[i % photos.length], photos[(i + 1) % photos.length]],
      description: `${room.name} · ${room.persons} · ${hasPvt ? 'ห้องน้ำส่วนตัว' : 'ห้องน้ำรวม'}`,
    } as RoomTypeDetail;
  });
}

function commonFacilityItems(): FacilityItem[] {
  return [
    { id: 'dorm',      labelTh: 'หอพักในตัวโรงเรียน',    label: 'On-campus Dormitory',   emoji: '🏠', photo: campusImg,    descriptionTh: 'หอพักอยู่ในบริเวณแคมปัส ปลอดภัย มีระบบรักษาความปลอดภัยตลอด 24 ชั่วโมง' },
    { id: 'cafeteria', labelTh: 'อาหาร 3 มื้อ',           label: 'Cafeteria (3 Meals)',    emoji: '🍽️', photo: facCafeteria, descriptionTh: 'อาหาร 3 มื้อรวมในราคาค่าห้อง เมนูหลากหลาย อาหารเอเชียและฟิลิปปินส์' },
    { id: 'wifi',      labelTh: 'Wi-Fi ฟรีทุกพื้นที่',   label: 'Free Wi-Fi',            emoji: '📶', photo: classroomImg, descriptionTh: 'ครอบคลุมทุกพื้นที่ทั้งห้องเรียน ห้องพัก โรงอาหาร และพื้นที่ส่วนกลาง' },
    { id: 'gym',       labelTh: 'ฟิตเนส / สระว่ายน้ำ',    label: 'Fitness / Pool',        emoji: '🏋️', photo: facPool,      descriptionTh: 'ห้องฟิตเนสและสระว่ายน้ำ เปิดให้บริการหลังเวลาเรียนและวันหยุด' },
    { id: 'library',   labelTh: 'ห้องสมุดและห้องติวเพิ่ม', label: 'Library / Study Room',  emoji: '📚', photo: facLibrary,   descriptionTh: 'ห้องสมุดพร้อม Self-Study Table หนังสือ IELTS/TOEIC ครบ เปิดทุกวัน' },
    { id: 'teacher',   labelTh: 'ครู Native ผ่าน TESOL',   label: 'Native TESOL Teachers', emoji: '👥', photo: facClassroom, descriptionTh: 'ครูผู้สอนทุกคนผ่านการรับรองมาตรฐาน TESOL/TEFL จากต่างประเทศ' },
  ] as FacilityItem[];
}

const schoolsData: Record<string, SchoolData> = {
  'cia': {
    slug: 'cia', name: 'CIA (Cebu International Academy)', tagline: 'แคมปัสพรีเมียมแห่งใหม่ | Semi-Sparta | IELTS & TOEIC เน้นเข้ม',
    city: 'Mactan, Cebu', country: 'Philippines', logo: ciaLogo, rating: 4.8, students: '800+', nationality: '15+ ชาติ', founded: 2003,
    photos: [campusImg, classroomImg, heroImg, cebuImg, marketing1],
    description: 'CIA Cebu International Academy เป็นหนึ่งในโรงเรียนสอนภาษาอังกฤษชั้นนำในเซบู ก่อตั้งมาตั้งแต่ปี 2003 มีแคมปัสพรีเมียมที่ Mactan Island แนวการสอนแบบ Semi-Sparta ที่ได้รับความนิยมสูงในหมู่นักเรียนไทย เหมาะสำหรับผู้ที่ต้องการพัฒนา IELTS และ TOEIC อย่างจริงจัง',
    highlights: ['Semi-Sparta ได้ผลเร็ว', 'แคมปัสใหม่ระดับพรีเมียม', 'IELTS Guarantee Option', 'นักเรียน 15+ ชาติ'],
    facilities: facilitySet,
    programs: [
      { name: 'General English (ESL)', duration: '4–24 สัปดาห์', w4: 32000, w8: 60000, w12: 85000, w24: 155000 },
      { name: 'IELTS Preparation', duration: '8–16 สัปดาห์', w8: 68000, w12: 95000 },
      { name: 'TOEIC Boost', duration: '4–12 สัปดาห์', w4: 34000, w8: 63000, w12: 88000 },
      { name: 'Business English', duration: '4–8 สัปดาห์', w4: 36000, w8: 66000 },
    ],
    roomTypes: [
      { name: 'ห้อง 3 คน (Triple)', persons: '3 คน/ห้อง', pricePerWeek: 3800, amenities: ['แอร์', 'Wi-Fi', 'ห้องน้ำรวม', 'ซักรีดฟรี'] },
      { name: 'ห้องคู่ (Double)', persons: '2 คน/ห้อง', pricePerWeek: 4800, amenities: ['แอร์', 'Wi-Fi', 'ห้องน้ำในตัว', 'ซักรีดฟรี'] },
      { name: 'ห้องเดี่ยว (Single)', persons: '1 คน/ห้อง', pricePerWeek: 6500, amenities: ['แอร์', 'Wi-Fi', 'ห้องน้ำในตัว', 'ซักรีดฟรี', 'โต๊ะทำงาน'] },
    ],
    // ── Rich room data (tabbed viewer) ──────────────────────────────
    richRooms: [
      {
        id: 'quad', name: 'Quad Room', nameTh: 'ห้อง 4 คน (Quad)',
        capacity: 4, bedConfig: 'เตียงเดี่ยว 4 หลัง', size: '28 ตร.ม.', bathroom: 'shared',
        pricePerWeek: 2813, priceNote: '≈ $750/4wk · รวมอาหาร 3 มื้อ + ซักรีด',
        amenities: ['แอร์', 'Wi-Fi', 'ห้องน้ำรวม', 'ตู้เก็บของส่วนตัว', 'ซักรีดฟรี'],
        photos: [roomQuad, campusImg],
        description: 'เหมาะสำหรับนักเรียนที่ต้องการเพื่อนใหม่และบรรยากาศ Semi-Sparta คึกคัก ราคาประหยัดที่สุดในแคมปัส มีตู้ล็อกเกอร์ส่วนตัว',
      },
      {
        id: 'triple', name: 'Triple Room', nameTh: 'ห้อง 3 คน (Triple)',
        capacity: 3, bedConfig: 'เตียงเดี่ยว 3 หลัง', size: '22 ตร.ม.', bathroom: 'shared',
        pricePerWeek: 3188, priceNote: '≈ $850/4wk · รวมอาหาร 3 มื้อ + ซักรีด',
        amenities: ['แอร์', 'Wi-Fi', 'ห้องน้ำรวม', 'ตู้เก็บของส่วนตัว', 'ซักรีดฟรี'],
        photos: [roomTriple, campusImg],
        description: 'ยอดนิยมสำหรับนักเรียนไทย สมดุลระหว่างความเป็นส่วนตัวและราคา มีเพื่อนร่วมห้อง 2 คน เสริมแรงจูงใจในการเรียน',
      },
      {
        id: 'twin', name: 'Twin Room', nameTh: 'ห้อง 2 คน (Twin)',
        capacity: 2, bedConfig: 'เตียงเดี่ยว 2 หลัง', size: '18 ตร.ม.', bathroom: 'private',
        pricePerWeek: 4125, priceNote: '≈ $1,100/4wk · รวมอาหาร 3 มื้อ + ซักรีด',
        amenities: ['แอร์', 'Wi-Fi', 'ห้องน้ำในตัว', 'โต๊ะทำงาน', 'ซักรีดฟรี'],
        photos: [roomTwin, campusImg],
        description: 'ห้องน้ำส่วนตัว เหมาะสำหรับคู่สามี-ภรรยา เพื่อน หรือพี่น้องที่มาด้วยกัน',
      },
      {
        id: 'single_standard', name: 'Single Standard', nameTh: 'ห้องเดี่ยว Standard',
        capacity: 1, bedConfig: 'เตียงเดี่ยว 1 หลัง', size: '14 ตร.ม.', bathroom: 'private',
        pricePerWeek: 5625, priceNote: '≈ $1,500/4wk · รวมอาหาร 3 มื้อ + ซักรีด',
        amenities: ['แอร์', 'Wi-Fi', 'ห้องน้ำในตัว', 'โต๊ะทำงาน', 'ตู้เสื้อผ้า', 'ซักรีดฟรี'],
        photos: [roomSingle, campusImg],
        description: 'ห้องส่วนตัว 100% มีสมาธิในการเรียนเต็มที่ ไม่ต้องกังวลเรื่องเพื่อนร่วมห้อง เหมาะสำหรับคนที่จริงจังกับการเรียน',
      },
      {
        id: 'single_premium', name: 'Single Premium / Pinnacle', nameTh: 'ห้องเดี่ยว Premium',
        capacity: 1, bedConfig: 'เตียงใหญ่ (Double)', size: '18 ตร.ม.', bathroom: 'private',
        pricePerWeek: 6375, priceNote: '≈ $1,700/4wk · รวมอาหาร 3 มื้อ + ซักรีด',
        amenities: ['แอร์', 'Wi-Fi', 'ห้องน้ำในตัว', 'โต๊ะทำงาน', 'ตู้เสื้อผ้า', 'ซักรีดฟรี', 'TV'],
        photos: [roomSingle, heroImg],
        description: 'ห้องพรีเมียมขนาดใหญ่กว่า Standard ตกแต่งทันสมัย เตียง Double นอนสบาย เหมาะสำหรับนักเรียนที่ต้องการความสะดวกสบายสูงสุด',
      },
      {
        id: 'suite', name: 'Suite Single', nameTh: 'Suite (ห้องชุด)',
        capacity: 1, bedConfig: 'เตียงใหญ่ (Queen)', size: '28 ตร.ม.', bathroom: 'private',
        pricePerWeek: 9375, priceNote: '≈ $2,500/4wk · รวมอาหาร 3 มื้อ + ซักรีด',
        amenities: ['แอร์', 'Wi-Fi', 'ห้องน้ำในตัว', 'โต๊ะทำงาน', 'ตู้เสื้อผ้า', 'ซักรีดฟรี', 'TV', 'โซฟา', 'มินิบาร์'],
        photos: [heroImg, roomSingle],
        description: 'ห้องชุดระดับโรงแรม 4 ดาว พื้นที่กว้างขวาง มีมุมพักผ่อน เหมาะสำหรับผู้บริหารหรือผู้ที่ต้องการความเป็นส่วนตัวสูงสุด',
      },
    ] as RoomTypeDetail[],

    // ── Rich facility data (photo gallery) ─────────────────────────
    facilityItems: [
      { id: 'classroom',  labelTh: 'ห้องเรียน 1 ต่อ 1',  label: 'One-on-One Classroom',  emoji: '📚', photo: facClassroom, descriptionTh: 'ห้องเรียนส่วนตัวทุกห้อง ออกแบบให้ครูและนักเรียนโฟกัสได้เต็มที่ มีกระดานไวท์บอร์ด อุปกรณ์ครบ อากาศเย็น' },
      { id: 'cafeteria',  labelTh: 'โรงอาหาร 3 มื้อ',     label: 'Cafeteria',             emoji: '🍽️', photo: facCafeteria, descriptionTh: 'อาหาร 3 มื้อในราคาค่าห้องพัก เมนูหลากหลาย อาหารเอเชียและฟิลิปปินส์ มีเมนูมังสวิรัติให้เลือก' },
      { id: 'pool',       labelTh: 'สระว่ายน้ำ',           label: 'Swimming Pool',         emoji: '🏊', photo: facPool, descriptionTh: 'สระว่ายน้ำกลางแจ้ง เปิดให้ใช้บริการหลัง 17:00 และวันหยุดสุดสัปดาห์ บรรยากาศรีสอร์ทริมทะเล Mactan' },
      { id: 'library',    labelTh: 'ห้องสมุด & ติวเพิ่ม',  label: 'Library / Study Room',  emoji: '📖', photo: facLibrary, descriptionTh: 'ห้องสมุดเงียบสงบ หนังสือเตรียม IELTS/TOEIC ครบ โต๊ะอ่านหนังสือ 24 ชั่วโมง เหมาะสำหรับ Semi-Sparta Study Time' },
      { id: 'gym',        labelTh: 'ฟิตเนส & ออกกำลังกาย', label: 'Fitness / Gym',         emoji: '💪', photo: campusImg, descriptionTh: 'ห้องฟิตเนสพร้อมอุปกรณ์ครบครัน ลู่วิ่ง ดัมเบล อุปกรณ์ออกกำลังกาย เปิดให้บริการทุกวัน' },
      { id: 'campus',     labelTh: 'แคมปัสพรีเมียม',       label: 'Premium Campus',        emoji: '🏫', photo: heroImg, descriptionTh: 'แคมปัสใหม่ที่ Mactan Island ออกแบบทันสมัย พื้นที่สีเขียว บรรยากาศร่มรื่น ห่างจากชายหาด 5 นาที' },
    ] as FacilityItem[],

    // ── Timetable ──────────────────────────────────────────────────
    timetable: {
      schedules: [
        {
          courseId: 'esl_regular', courseName: 'ESL Regular', courseNameTh: 'ESL Regular', tag: '1:1×4 | กลุ่ม×4',
          slots: [
            { time: '07:00 – 08:00', activity: 'อาหารเช้า (Breakfast)',     type: 'meal' },
            { time: '08:00 – 08:50', activity: 'เรียน 1 ต่อ 1  ชั่วโมงที่ 1', type: 'one-on-one' },
            { time: '09:00 – 09:50', activity: 'เรียน 1 ต่อ 1  ชั่วโมงที่ 2', type: 'one-on-one' },
            { time: '10:00 – 10:50', activity: 'เรียน 1 ต่อ 1  ชั่วโมงที่ 3', type: 'one-on-one' },
            { time: '11:00 – 11:50', activity: 'เรียน 1 ต่อ 1  ชั่วโมงที่ 4', type: 'one-on-one' },
            { time: '12:00 – 13:00', activity: 'อาหารกลางวัน (Lunch)',       type: 'meal' },
            { time: '13:00 – 13:50', activity: 'เรียนกลุ่ม  ชั่วโมงที่ 1',   type: 'group' },
            { time: '14:00 – 14:50', activity: 'เรียนกลุ่ม  ชั่วโมงที่ 2',   type: 'group' },
            { time: '15:00 – 15:50', activity: 'เรียนกลุ่ม  ชั่วโมงที่ 3',   type: 'group' },
            { time: '16:00 – 16:50', activity: 'เรียนกลุ่ม  ชั่วโมงที่ 4',   type: 'group' },
            { time: '17:00 – 18:00', activity: 'เวลาอิสระ / กิจกรรม',        type: 'free' },
            { time: '18:00 – 19:00', activity: 'อาหารเย็น (Dinner)',          type: 'meal' },
            { time: '19:00 – 22:00', activity: 'ติวเอง (Self-Study บังคับ)',  type: 'self-study' },
            { time: '22:00',         activity: 'เคอร์ฟิว (Curfew)',           type: 'free' },
          ],
        },
        {
          courseId: 'esl_intensive', courseName: 'ESL Intensive', courseNameTh: 'ESL Intensive', tag: '1:1×5 | กลุ่ม×3',
          slots: [
            { time: '07:00 – 08:00', activity: 'อาหารเช้า',                  type: 'meal' },
            { time: '08:00 – 08:50', activity: 'เรียน 1 ต่อ 1  ชั่วโมงที่ 1', type: 'one-on-one' },
            { time: '09:00 – 09:50', activity: 'เรียน 1 ต่อ 1  ชั่วโมงที่ 2', type: 'one-on-one' },
            { time: '10:00 – 10:50', activity: 'เรียน 1 ต่อ 1  ชั่วโมงที่ 3', type: 'one-on-one' },
            { time: '11:00 – 11:50', activity: 'เรียน 1 ต่อ 1  ชั่วโมงที่ 4', type: 'one-on-one' },
            { time: '12:00 – 13:00', activity: 'อาหารกลางวัน',                type: 'meal' },
            { time: '13:00 – 13:50', activity: 'เรียน 1 ต่อ 1  ชั่วโมงที่ 5', type: 'one-on-one' },
            { time: '14:00 – 14:50', activity: 'เรียนกลุ่ม  ชั่วโมงที่ 1',   type: 'group' },
            { time: '15:00 – 15:50', activity: 'เรียนกลุ่ม  ชั่วโมงที่ 2',   type: 'group' },
            { time: '16:00 – 16:50', activity: 'เรียนกลุ่ม  ชั่วโมงที่ 3',   type: 'group' },
            { time: '17:00 – 18:00', activity: 'เวลาอิสระ',                   type: 'free' },
            { time: '18:00 – 19:00', activity: 'อาหารเย็น',                   type: 'meal' },
            { time: '19:00 – 22:00', activity: 'ติวเอง (Self-Study บังคับ)',  type: 'self-study' },
            { time: '22:00',         activity: 'เคอร์ฟิว',                    type: 'free' },
          ],
        },
        {
          courseId: 'ielts', courseName: 'IELTS Preparation', courseNameTh: 'IELTS Prep', tag: '1:1×4 | กลุ่ม×4',
          slots: [
            { time: '07:00 – 08:00', activity: 'อาหารเช้า',                      type: 'meal' },
            { time: '08:00 – 08:50', activity: 'IELTS 1:1 · Reading & Writing 1', type: 'one-on-one' },
            { time: '09:00 – 09:50', activity: 'IELTS 1:1 · Reading & Writing 2', type: 'one-on-one' },
            { time: '10:00 – 10:50', activity: 'IELTS 1:1 · Speaking Practice 1', type: 'one-on-one' },
            { time: '11:00 – 11:50', activity: 'IELTS 1:1 · Speaking Practice 2', type: 'one-on-one' },
            { time: '12:00 – 13:00', activity: 'อาหารกลางวัน',                    type: 'meal' },
            { time: '13:00 – 13:50', activity: 'IELTS Group · Listening',          type: 'group' },
            { time: '14:00 – 14:50', activity: 'IELTS Group · Reading',            type: 'group' },
            { time: '15:00 – 15:50', activity: 'IELTS Group · Writing Workshop',   type: 'group' },
            { time: '16:00 – 16:50', activity: 'IELTS Group · Mock Test Review',   type: 'group' },
            { time: '17:00 – 18:00', activity: 'เวลาอิสระ',                        type: 'free' },
            { time: '18:00 – 19:00', activity: 'อาหารเย็น',                        type: 'meal' },
            { time: '19:00 – 22:00', activity: 'IELTS Self-Study (บังคับ)',        type: 'self-study' },
            { time: '22:00',         activity: 'เคอร์ฟิว',                         type: 'free' },
          ],
        },
        {
          courseId: 'toeic', courseName: 'TOEIC', courseNameTh: 'TOEIC', tag: '1:1×4 | กลุ่ม×4',
          slots: [
            { time: '07:00 – 08:00', activity: 'อาหารเช้า',                        type: 'meal' },
            { time: '08:00 – 08:50', activity: 'TOEIC 1:1 · Vocabulary & Grammar 1',type: 'one-on-one' },
            { time: '09:00 – 09:50', activity: 'TOEIC 1:1 · Vocabulary & Grammar 2',type: 'one-on-one' },
            { time: '10:00 – 10:50', activity: 'TOEIC 1:1 · Listening Strategy 1',  type: 'one-on-one' },
            { time: '11:00 – 11:50', activity: 'TOEIC 1:1 · Reading Strategy 1',    type: 'one-on-one' },
            { time: '12:00 – 13:00', activity: 'อาหารกลางวัน',                      type: 'meal' },
            { time: '13:00 – 13:50', activity: 'TOEIC Group · Part 1–4 Drill',      type: 'group' },
            { time: '14:00 – 14:50', activity: 'TOEIC Group · Part 5–7 Drill',      type: 'group' },
            { time: '15:00 – 15:50', activity: 'TOEIC Group · Full Mock Test',       type: 'group' },
            { time: '16:00 – 16:50', activity: 'TOEIC Group · Score Analysis',       type: 'group' },
            { time: '17:00 – 18:00', activity: 'เวลาอิสระ',                          type: 'free' },
            { time: '18:00 – 19:00', activity: 'อาหารเย็น',                          type: 'meal' },
            { time: '19:00 – 22:00', activity: 'ติวเอง (Self-Study บังคับ)',          type: 'self-study' },
            { time: '22:00',         activity: 'เคอร์ฟิว',                            type: 'free' },
          ],
        },
      ],
      rules: [
        'ห้ามใช้ภาษาไทยในบริเวณโรงเรียน (English Only Zone)',
        'ห้ามออกนอกแคมปัสหลัง 22:00 น.',
        'ช่วง 19:00–22:00 ต้องอยู่ในห้องสมุด/ห้องพักเพื่อ Self-Study',
        'ห้ามดื่มแอลกอฮอล์ในบริเวณแคมปัส',
        'ต้องเข้าชั้นเรียนครบ 100% ยกเว้นมีใบรับรองแพทย์',
      ],
      note: 'ตารางอาจมีการปรับเปลี่ยนเล็กน้อยตามปฏิทินโรงเรียน · วันเสาร์มีกิจกรรมพิเศษ/ทัศนศึกษา',
    } as TimetableConfig,

    youtubeId: null, website: 'https://www.cebucia.com', mapUrl: 'https://www.google.com/maps/search/?api=1&query=CIA+Cebu+International+Academy+Mactan+Island+Cebu',
    accent: 'from-red-800 to-red-600', tags: ['Semi-Sparta', 'New Campus', 'IELTS', 'TOEIC'],
    pricingConfig: {
      enrollmentFee: 100,
      exchangeRateUsdThb: 33.50,
      exchangeRatePhpThb: 0.50,
      durationOptions: [4, 8, 12, 16, 20, 24],
      courses: [
        { id: 'esl_regular',   name: 'ESL Regular',        nameTh: 'ESL ปกติ',            pricePerFourWeeks: 900  },
        { id: 'esl_intensive', name: 'ESL Intensive',       nameTh: 'ESL เข้มข้น',          pricePerFourWeeks: 1000 },
        { id: 'esl_power',     name: 'ESL Power Intensive', nameTh: 'ESL Power Intensive', pricePerFourWeeks: 1100 },
        { id: 'toeic',         name: 'TOEIC',               nameTh: 'TOEIC',               pricePerFourWeeks: 1000 },
        { id: 'ielts',         name: 'IELTS',               nameTh: 'IELTS',               pricePerFourWeeks: 1050 },
        { id: 'business',      name: 'Business English',    nameTh: 'Business English',    pricePerFourWeeks: 1050 },
      ],
      rooms: [
        { id: 'quad',             name: 'Quad Room',        nameTh: 'ห้อง 4 คน (Quad)',       pricePerFourWeeks: 750  },
        { id: 'triple',           name: 'Triple Room',      nameTh: 'ห้อง 3 คน (Triple)',      pricePerFourWeeks: 850  },
        { id: 'twin',             name: 'Twin Room',        nameTh: 'ห้อง 2 คน (Twin)',        pricePerFourWeeks: 1100 },
        { id: 'single_standard',  name: 'Single Standard',  nameTh: 'ห้องเดี่ยว Standard',     pricePerFourWeeks: 1500 },
        { id: 'single_premium',   name: 'Single Premium',   nameTh: 'ห้องเดี่ยว Premium/Pinnacle', pricePerFourWeeks: 1700 },
        { id: 'suite_single',     name: 'Suite Single',     nameTh: 'Suite (1 คน)',            pricePerFourWeeks: 2500 },
      ],
      localFeesByWeek: { '4': 25200, '8': 37330, '12': 55240, '16': 66780, '20': 78320, '24': 89860 },
      promoDiscount: {
        enabled: true,
        discountPerFourWeeks: 100,
        minWeeks: 4,
        label: 'ส่วนลด Promotion เมื่อลงทะเบียนเรียน 4 สัปดาห์ขึ้นไป',
      },
    },
  },
  'qq-english': {
    slug: 'qq-english', name: 'QQ English', tagline: 'Callan Method | IT Park Cebu | พูดคล่องเร็วที่สุด',
    city: 'IT Park, Cebu', country: 'Philippines', logo: qqLogo, rating: 4.7, students: '500+', nationality: '12+ ชาติ', founded: 2008,
    photos: [campusImg, classroomImg, cebuImg, heroImg, marketing1],
    description: 'QQ English ตั้งอยู่ใจกลาง IT Park Cebu City ใช้วิธีการสอนแบบ Callan Method ที่พัฒนาทักษะการพูดได้เร็วกว่าปกติถึง 4 เท่า เปิดรับนักเรียนใหม่ทุกสัปดาห์ เหมาะสำหรับคนที่ต้องการพูดคล่องและมีความมั่นใจในการสื่อสาร',
    highlights: ['Callan Method เรียนเร็วกว่า 4x', 'ทำเลดีใจกลาง IT Park', 'เริ่มเรียนได้ทุกสัปดาห์', 'ครู Native ผ่าน TEFL'],
    facilities: facilitySet,
    programs: [
      { name: 'Callan General English', duration: '4–24 สัปดาห์', w4: 30000, w8: 56000, w12: 79000, w24: 145000 },
      { name: 'IELTS by Callan', duration: '8–16 สัปดาห์', w8: 65000, w12: 90000 },
      { name: 'Business English', duration: '4–8 สัปดาห์', w4: 33000, w8: 61000 },
      { name: 'Online + Onsite Combo', duration: '4–12 สัปดาห์', w4: 28000, w8: 52000, w12: 73000 },
    ],
    roomTypes: [
      { name: 'ห้อง 4 คน (Quad)', persons: '4 คน/ห้อง', pricePerWeek: 3200, amenities: ['แอร์', 'Wi-Fi', 'ห้องน้ำรวม', 'ซักรีดฟรี'] },
      { name: 'ห้องคู่ (Double)', persons: '2 คน/ห้อง', pricePerWeek: 4500, amenities: ['แอร์', 'Wi-Fi', 'ห้องน้ำในตัว', 'ซักรีดฟรี'] },
      { name: 'ห้องเดี่ยว (Single)', persons: '1 คน/ห้อง', pricePerWeek: 6200, amenities: ['แอร์', 'Wi-Fi', 'ห้องน้ำในตัว', 'ซักรีดฟรี', 'มินิฟริดจ์'] },
    ],
    timetable: {
      schedules: [
        { courseId: 'callan-esl', courseName: 'Callan General English', courseNameTh: 'Callan ESL', tag: '1:1×4 | กลุ่ม×4',
          slots: [
            { time: '08:00 – 08:30', activity: 'อาหารเช้า', type: 'meal' },
            { time: '08:30 – 09:20', activity: 'Callan 1:1 · ถาม-ตอบ ด้วนด่วน (Rapid Q&A) 1', type: 'one-on-one' },
            { time: '09:30 – 10:20', activity: 'Callan 1:1 · ถาม-ตอบ ด้วนด่วน (Rapid Q&A) 2', type: 'one-on-one' },
            { time: '10:30 – 11:20', activity: 'Callan 1:1 · ถาม-ตอบ ด้วนด่วน (Rapid Q&A) 3', type: 'one-on-one' },
            { time: '11:30 – 12:20', activity: 'Callan 1:1 · ถาม-ตอบ ด้วนด่วน (Rapid Q&A) 4', type: 'one-on-one' },
            { time: '12:30 – 13:30', activity: 'อาหารกลางวัน', type: 'meal' },
            { time: '13:30 – 14:20', activity: 'กลุ่ม Callan · Rapid-fire Dictation', type: 'group' },
            { time: '14:30 – 15:20', activity: 'กลุ่ม Callan · Reading & Recall', type: 'group' },
            { time: '15:30 – 16:20', activity: 'กลุ่ม Callan · Conversation Drills', type: 'group' },
            { time: '16:30 – 17:20', activity: 'กลุ่ม Callan · Pronunciation Lab', type: 'group' },
            { time: '17:30 – 19:00', activity: 'เวลาอิสระ (ไม่มีเคอร์ฟิว)', type: 'free' },
            { time: '19:00 – 20:00', activity: 'อาหารเย็น', type: 'meal' },
            { time: '20:00 – 22:00', activity: 'เวลาอิสระ (ไม่มีบังคับ Self-Study)', type: 'free' },
          ],
        },
        { courseId: 'callan-ielts', courseName: 'IELTS by Callan', courseNameTh: 'IELTS Callan', tag: '1:1×4 | กลุ่ม×4',
          slots: [
            { time: '08:00 – 08:30', activity: 'อาหารเช้า', type: 'meal' },
            { time: '08:30 – 09:20', activity: 'IELTS 1:1 · Speaking Rapid Q&A 1', type: 'one-on-one' },
            { time: '09:30 – 10:20', activity: 'IELTS 1:1 · Speaking Rapid Q&A 2', type: 'one-on-one' },
            { time: '10:30 – 11:20', activity: 'IELTS 1:1 · Reading & Vocabulary', type: 'one-on-one' },
            { time: '11:30 – 12:20', activity: 'IELTS 1:1 · Writing Workshop', type: 'one-on-one' },
            { time: '12:30 – 13:30', activity: 'อาหารกลางวัน', type: 'meal' },
            { time: '13:30 – 14:20', activity: 'IELTS กลุ่ม · Listening Practice', type: 'group' },
            { time: '14:30 – 15:20', activity: 'IELTS กลุ่ม · Reading Strategies', type: 'group' },
            { time: '15:30 – 16:20', activity: 'IELTS กลุ่ม · Writing Task 1 & 2', type: 'group' },
            { time: '16:30 – 17:20', activity: 'IELTS กลุ่ม · Mock Speaking Test', type: 'group' },
            { time: '17:30 – 19:00', activity: 'เวลาอิสระ', type: 'free' },
            { time: '19:00 – 20:00', activity: 'อาหารเย็น', type: 'meal' },
            { time: '20:00 – 22:00', activity: 'เวลาอิสระ / ทบทวนด้วยตนเอง (สมัครใจ)', type: 'free' },
          ],
        },
      ],
      rules: [
        'Callan Method: ห้ามหยุดคิดนาน — ตอบทันทีเพื่อสร้างความคล่อง',
        'ใช้ภาษาอังกฤษในชั้นเรียนตลอดเวลา',
        'ไม่มีเคอร์ฟิว — รับผิดชอบตัวเองในเวลาส่วนตัว',
        'เข้าเรียนตรงเวลา ไม่ขาดคลาสโดยไม่แจ้งล่วงหน้า',
      ],
      note: 'QQ English ใช้ Callan Method ซึ่งเน้นการพูดและตอบสนองด้วนด่วน ช่วยพัฒนาทักษะการพูดได้เร็วกว่าวิธีเรียนปกติถึง 4 เท่า · ไม่มีเคอร์ฟิว เหมาะกับผู้ที่ต้องการอิสระในเวลาว่าง',
    } as TimetableConfig,
    youtubeId: null, website: 'https://www.qqenglish.com', mapUrl: 'https://www.google.com/maps/search/?api=1&query=QQ+English+IT+Park+Cebu+City+Philippines',
    accent: 'from-sky-500 to-blue-600', tags: ['Callan Method', 'ESL', 'IELTS', 'IT Park'],
  },
  'philinter': {
    slug: 'philinter', name: 'Philinter Academy', tagline: 'Philosophy · Interaction | Business & Speaking เน้นมาก',
    city: 'Mactan, Cebu', country: 'Philippines', logo: philinterLogo, rating: 4.7, students: '400+', nationality: '10+ ชาติ', founded: 2003,
    photos: [campusImg, classroomImg, heroImg, cebuImg, marketing1],
    description: 'Philinter Academy ก่อตั้งปี 2003 เป็นโรงเรียนที่เน้นปรัชญาการเรียนรู้ผ่านการปฏิสัมพันธ์จริง (Philosophy · Interaction) เหมาะสำหรับผู้ที่ต้องการพัฒนาภาษาอังกฤษเพื่อการทำงาน Business English, Speaking Course และการสอบ Cambridge สภาพแวดล้อมสงบ อยู่ Mactan Island',
    highlights: ['Business English ระดับ Professional', 'Cambridge English Official Centre', 'Speaking Focus ทุกคลาส', 'แคมปัสสงบ Mactan Island'],
    facilities: facilitySet,
    programs: [
      { name: 'General English (ESL)', duration: '4–24 สัปดาห์', w4: 31000, w8: 58000, w12: 82000, w24: 150000 },
      { name: 'Business English', duration: '4–8 สัปดาห์', w4: 35000, w8: 64000 },
      { name: 'IELTS Preparation', duration: '8–16 สัปดาห์', w8: 67000, w12: 93000 },
      { name: 'Cambridge English', duration: '8–12 สัปดาห์', w8: 70000, w12: 98000 },
    ],
    roomTypes: [
      { name: 'ห้อง 3 คน (Triple)', persons: '3 คน/ห้อง', pricePerWeek: 3600, amenities: ['แอร์', 'Wi-Fi', 'ห้องน้ำรวม', 'ซักรีดฟรี'] },
      { name: 'ห้องคู่ (Double)', persons: '2 คน/ห้อง', pricePerWeek: 4700, amenities: ['แอร์', 'Wi-Fi', 'ห้องน้ำในตัว', 'ซักรีดฟรี'] },
      { name: 'ห้องเดี่ยว (Single)', persons: '1 คน/ห้อง', pricePerWeek: 6300, amenities: ['แอร์', 'Wi-Fi', 'ห้องน้ำในตัว', 'ซักรีดฟรี', 'โต๊ะทำงาน'] },
    ],
    timetable: {
      schedules: [
        { courseId: 'business-english', courseName: 'Business English', courseNameTh: 'Business English', tag: '1:1×4 | กลุ่ม×4',
          slots: [
            { time: '07:30 – 08:00', activity: 'อาหารเช้า', type: 'meal' },
            { time: '08:00 – 08:50', activity: 'Business 1:1 · Presentations & Meetings 1', type: 'one-on-one' },
            { time: '09:00 – 09:50', activity: 'Business 1:1 · Negotiations & Emails 2', type: 'one-on-one' },
            { time: '10:00 – 10:50', activity: 'Business 1:1 · Speaking Practice 3', type: 'one-on-one' },
            { time: '11:00 – 11:50', activity: 'Business 1:1 · Professional Vocabulary 4', type: 'one-on-one' },
            { time: '12:00 – 13:00', activity: 'อาหารกลางวัน', type: 'meal' },
            { time: '13:00 – 13:50', activity: 'กลุ่ม · Business Communication', type: 'group' },
            { time: '14:00 – 14:50', activity: 'กลุ่ม · Presentation Skills', type: 'group' },
            { time: '15:00 – 15:50', activity: 'กลุ่ม · Discussion & Debate', type: 'group' },
            { time: '16:00 – 16:50', activity: 'กลุ่ม · Cambridge Exam Practice', type: 'group' },
            { time: '17:00 – 18:30', activity: 'เวลาอิสระ', type: 'free' },
            { time: '18:30 – 19:30', activity: 'อาหารเย็น', type: 'meal' },
            { time: '19:30 – 21:00', activity: 'Conversation Club (ภาคสมัครใจ)', type: 'self-study' },
          ],
        },
        { courseId: 'esl-speaking', courseName: 'General English (ESL)', courseNameTh: 'ESL ทั่วไป', tag: '1:1×4 | กลุ่ม×4',
          slots: [
            { time: '07:30 – 08:00', activity: 'อาหารเช้า', type: 'meal' },
            { time: '08:00 – 08:50', activity: 'ESL 1:1 · Grammar & Speaking 1', type: 'one-on-one' },
            { time: '09:00 – 09:50', activity: 'ESL 1:1 · Vocabulary & Reading 2', type: 'one-on-one' },
            { time: '10:00 – 10:50', activity: 'ESL 1:1 · Listening & Pronunciation 3', type: 'one-on-one' },
            { time: '11:00 – 11:50', activity: 'ESL 1:1 · Free Speaking Practice 4', type: 'one-on-one' },
            { time: '12:00 – 13:00', activity: 'อาหารกลางวัน', type: 'meal' },
            { time: '13:00 – 13:50', activity: 'กลุ่ม · Speaking & Roleplay', type: 'group' },
            { time: '14:00 – 14:50', activity: 'กลุ่ม · Listening Comprehension', type: 'group' },
            { time: '15:00 – 15:50', activity: 'กลุ่ม · Grammar Review', type: 'group' },
            { time: '16:00 – 16:50', activity: 'กลุ่ม · Writing Skills', type: 'group' },
            { time: '17:00 – 18:30', activity: 'เวลาอิสระ', type: 'free' },
            { time: '18:30 – 19:30', activity: 'อาหารเย็น', type: 'meal' },
            { time: '19:30 – 21:00', activity: 'Evening Conversation Club (สมัครใจ)', type: 'self-study' },
          ],
        },
      ],
      rules: [
        'ใช้ภาษาอังกฤษในบริเวณโรงเรียนตลอดเวลา',
        'เข้าเรียนตรงเวลา แต่งกายสุภาพในชั้นเรียน',
        'Conversation Club เย็นเป็นกิจกรรมสมัครใจ แนะนำให้เข้าร่วม',
        'ปฏิบัติตามระเบียบของหอพักและโรงเรียน',
      ],
      note: 'Philinter เน้น Business English และ Speaking อย่างจริงจัง · Evening Conversation Club ทุกวันเป็นโอกาสพูดคุยกับนักเรียนนานาชาติ · ไม่มีเคอร์ฟิวบังคับ',
    } as TimetableConfig,
    youtubeId: null, website: 'https://www.philinter.com', mapUrl: 'https://www.google.com/maps/search/?api=1&query=Philinter+Academy+Mactan+Cebu+Philippines',
    accent: 'from-green-800 to-green-600', tags: ['Business English', 'Speaking', 'Cambridge', 'ESL'],
  },
  'b-cebu': {
    slug: 'b-cebu', name: "B'Cebu Language School", tagline: 'แคมปัสใหม่ ห้องพักทันสมัย | Intensive English | Banilad Cebu',
    city: 'Banilad, Cebu', country: 'Philippines', logo: bcebuLogo, rating: 4.6, students: '300+', nationality: '10+ ชาติ', founded: 2015,
    photos: [campusImg, classroomImg, cebuImg, heroImg, marketing1],
    description: "B'Cebu Language School ตั้งอยู่ในย่าน Banilad ใจกลาง Cebu City เปิดใหม่ด้วยแคมปัสและห้องพักระดับพรีเมียม เหมาะสำหรับนักเรียนที่ต้องการสภาพแวดล้อมการเรียนที่ทันสมัยและสะดวกสบาย พร้อมหลักสูตร Intensive English ที่เน้นผลลัพธ์จริง",
    highlights: ['แคมปัสและห้องพักใหม่ล่าสุด', 'Intensive Speaking ทุกวัน', 'ทำเลดี ใกล้ร้านอาหาร', 'Class Size เล็ก ดูแลทั่วถึง'],
    facilities: facilitySet,
    programs: [
      { name: 'Intensive English', duration: '4–24 สัปดาห์', w4: 31000, w8: 58000, w12: 83000, w24: 150000 },
      { name: 'IELTS Preparation', duration: '8–12 สัปดาห์', w8: 65000, w12: 91000 },
      { name: 'TOEIC Boost', duration: '4–8 สัปดาห์', w4: 32000, w8: 60000 },
    ],
    roomTypes: [
      { name: 'ห้อง 3 คน (Triple)', persons: '3 คน/ห้อง', pricePerWeek: 3700, amenities: ['แอร์', 'Wi-Fi', 'ห้องน้ำรวม', 'ซักรีดฟรี'] },
      { name: 'ห้องคู่ (Double)', persons: '2 คน/ห้อง', pricePerWeek: 4900, amenities: ['แอร์', 'Wi-Fi', 'ห้องน้ำในตัว', 'ซักรีดฟรี'] },
      { name: 'ห้องเดี่ยว Standard', persons: '1 คน/ห้อง', pricePerWeek: 6400, amenities: ['แอร์', 'Wi-Fi', 'ห้องน้ำในตัว', 'ซักรีดฟรี'] },
      { name: 'ห้อง Suite (Premium)', persons: '1 คน/ห้อง', pricePerWeek: 8200, amenities: ['แอร์', 'Wi-Fi', 'ห้องน้ำในตัว', 'ซักรีดฟรี', 'TV', 'มินิฟริดจ์', 'โซฟา'] },
    ],
    timetable: {
      schedules: [
        { courseId: 'bsparta-esl', courseName: "Intensive English (B'Sparta)", courseNameTh: "ESL B'Sparta", tag: '1:1×4 | กลุ่ม×4',
          slots: [
            { time: '07:30 – 08:00', activity: 'อาหารเช้า', type: 'meal' },
            { time: '08:00 – 08:50', activity: 'ESL 1:1 · Grammar & Speaking 1', type: 'one-on-one' },
            { time: '09:00 – 09:50', activity: 'ESL 1:1 · Vocabulary & Reading 2', type: 'one-on-one' },
            { time: '10:00 – 10:50', activity: 'ESL 1:1 · Listening & Pronunciation 3', type: 'one-on-one' },
            { time: '11:00 – 11:50', activity: 'ESL 1:1 · Free Speaking Practice 4', type: 'one-on-one' },
            { time: '12:00 – 13:00', activity: 'อาหารกลางวัน', type: 'meal' },
            { time: '13:00 – 13:50', activity: 'กลุ่ม · Speaking & Roleplay', type: 'group' },
            { time: '14:00 – 14:50', activity: 'กลุ่ม · Listening Comprehension', type: 'group' },
            { time: '15:00 – 15:50', activity: 'กลุ่ม · Grammar Review', type: 'group' },
            { time: '16:00 – 16:50', activity: 'กลุ่ม · Writing Skills', type: 'group' },
            { time: '17:00 – 19:00', activity: 'เวลาอิสระ', type: 'free' },
            { time: '19:00 – 20:00', activity: 'อาหารเย็น', type: 'meal' },
            { time: '19:00 – 22:00', activity: 'Self-Study บังคับ (B\'Sparta)', type: 'self-study' },
          ],
        },
        { courseId: 'bsparta-ielts', courseName: 'IELTS Preparation', courseNameTh: 'IELTS', tag: '1:1×4 | กลุ่ม×4',
          slots: [
            { time: '07:30 – 08:00', activity: 'อาหารเช้า', type: 'meal' },
            { time: '08:00 – 08:50', activity: 'IELTS 1:1 · Speaking Practice 1', type: 'one-on-one' },
            { time: '09:00 – 09:50', activity: 'IELTS 1:1 · Reading & Vocabulary 2', type: 'one-on-one' },
            { time: '10:00 – 10:50', activity: 'IELTS 1:1 · Writing Task 1 & 2 (3)', type: 'one-on-one' },
            { time: '11:00 – 11:50', activity: 'IELTS 1:1 · Listening Strategies 4', type: 'one-on-one' },
            { time: '12:00 – 13:00', activity: 'อาหารกลางวัน', type: 'meal' },
            { time: '13:00 – 13:50', activity: 'IELTS กลุ่ม · Listening Practice', type: 'group' },
            { time: '14:00 – 14:50', activity: 'IELTS กลุ่ม · Reading Strategies', type: 'group' },
            { time: '15:00 – 15:50', activity: 'IELTS กลุ่ม · Writing Workshop', type: 'group' },
            { time: '16:00 – 16:50', activity: 'IELTS กลุ่ม · Mock Speaking Test', type: 'group' },
            { time: '17:00 – 19:00', activity: 'เวลาอิสระ', type: 'free' },
            { time: '19:00 – 20:00', activity: 'อาหารเย็น', type: 'meal' },
            { time: '19:00 – 22:00', activity: 'Self-Study บังคับ (B\'Sparta) 19:00–22:00', type: 'self-study' },
          ],
        },
      ],
      rules: [
        "B'Sparta: Self-Study บังคับ 19:00–22:00 ทุกวันจันทร์–ศุกร์",
        'เคอร์ฟิว 22:00 น. ต้องอยู่ในหอพักหลัง 22:00',
        'English Only Zone ในบริเวณโรงเรียน ห้ามพูดภาษาอื่น',
        'เข้าเรียนตรงเวลา ขาดเรียนต้องแจ้งล่วงหน้า',
      ],
      note: "B'Sparta คือโปรแกรม Intensive สูงสุดของ B'Cebu Cebu · มี Self-Study บังคับและเคอร์ฟิว 22:00 · เหมาะสำหรับผู้ที่ต้องการพัฒนาอย่างเข้มข้นในเวลาอันสั้น",
    } as TimetableConfig,
    youtubeId: null, website: 'https://bcebu.com', mapUrl: 'https://www.google.com/maps/search/?api=1&query=BCebu+Language+School+Banilad+Cebu+Philippines',
    accent: 'from-blue-700 to-indigo-700', tags: ['Intensive', 'New Campus', 'IELTS', 'TOEIC'],
  },
  'bcebu': {
    slug: 'bcebu', name: "B'Cebu Language School (สาขาบาเกียว)",
    tagline: 'วิทยาเขตบาเกียว | อากาศเย็นสบาย 18-22°C | Intensive English | Baguio City',
    city: 'Baguio City', country: 'Philippines', logo: bcebuLogo, rating: 4.6, students: '200+', nationality: '10+ ชาติ', founded: 2018,
    photos: [baguioImg, classroomImg, campusImg, heroImg, marketing1],
    description: "B'Cebu Language School สาขาบาเกียว ตั้งอยู่ในเมืองบาเกียว ซิตี้ (Baguio City) หรือที่คนไทยเรียกว่าเมืองปาเกียว เมืองท่องเที่ยวบนภูเขาสูง 1,500 เมตร อากาศเย็นสบายตลอดปี หลักสูตรเดียวกับสาขา Cebu ไม่ว่าจะเป็น Intensive ESL, B'Sparta, IELTS, Business English รองรับนักเรียนจากทั่วโลกในบรรยากาศการเรียนที่ผ่อนคลายและค่าครองชีพต่ำกว่าเซบู",
    highlights: [
      'อากาศเย็นสบาย 18-22°C ตลอดปี ไม่ร้อน',
      'หลักสูตรครบ: ESL, IELTS, Business, Junior',
      'ค่าครองชีพต่ำกว่า Cebu City',
      'Class Size เล็ก ดูแลทั่วถึงทุกคน',
    ],
    facilities: facilitySet,
    programs: [
      { name: 'Intensive English', duration: '4–24 สัปดาห์', w4: 30000, w8: 56000, w12: 80000, w24: 145000 },
      { name: 'IELTS Preparation', duration: '8–12 สัปดาห์', w8: 63000, w12: 89000 },
      { name: 'Business English', duration: '4–8 สัปดาห์', w4: 31000, w8: 58000 },
    ],
    roomTypes: [
      { name: 'ห้อง 3 คน (Triple)', persons: '3 คน/ห้อง', pricePerWeek: 4688, amenities: ['แอร์', 'Wi-Fi', 'ห้องน้ำรวม', 'ซักรีดฟรี'] },
      { name: 'ห้องแฝด (Twin)', persons: '2 คน/ห้อง', pricePerWeek: 5938, amenities: ['แอร์', 'Wi-Fi', 'ห้องน้ำในตัว', 'ซักรีดฟรี'] },
      { name: 'ห้องเดี่ยว (Single)', persons: '1 คน/ห้อง', pricePerWeek: 8438, amenities: ['แอร์', 'Wi-Fi', 'ห้องน้ำในตัว', 'ซักรีดฟรี'] },
    ],
    timetable: {
      schedules: [
        { courseId: 'bsparta-baguio-esl', courseName: "Intensive English (B'Sparta)", courseNameTh: "ESL B'Sparta บาเกียว", tag: '1:1×4 | กลุ่ม×4',
          slots: [
            { time: '07:30 – 08:00', activity: 'อาหารเช้า (อากาศเย็น 18–22°C)', type: 'meal' },
            { time: '08:00 – 08:50', activity: 'ESL 1:1 · Grammar & Speaking 1', type: 'one-on-one' },
            { time: '09:00 – 09:50', activity: 'ESL 1:1 · Vocabulary & Reading 2', type: 'one-on-one' },
            { time: '10:00 – 10:50', activity: 'ESL 1:1 · Listening & Pronunciation 3', type: 'one-on-one' },
            { time: '11:00 – 11:50', activity: 'ESL 1:1 · Free Speaking Practice 4', type: 'one-on-one' },
            { time: '12:00 – 13:00', activity: 'อาหารกลางวัน', type: 'meal' },
            { time: '13:00 – 13:50', activity: 'กลุ่ม · Speaking & Conversation', type: 'group' },
            { time: '14:00 – 14:50', activity: 'กลุ่ม · Listening Practice', type: 'group' },
            { time: '15:00 – 15:50', activity: 'กลุ่ม · Grammar Workshop', type: 'group' },
            { time: '16:00 – 16:50', activity: 'กลุ่ม · Writing Skills', type: 'group' },
            { time: '17:00 – 19:00', activity: 'เวลาอิสระ (เที่ยวเมืองบาเกียวได้)', type: 'free' },
            { time: '19:00 – 20:00', activity: 'อาหารเย็น', type: 'meal' },
            { time: '19:00 – 22:00', activity: "Self-Study บังคับ (B'Sparta) 19:00–22:00", type: 'self-study' },
          ],
        },
        { courseId: 'bsparta-baguio-ielts', courseName: 'IELTS Preparation', courseNameTh: 'IELTS บาเกียว', tag: '1:1×4 | กลุ่ม×4',
          slots: [
            { time: '07:30 – 08:00', activity: 'อาหารเช้า (อากาศเย็น 18–22°C)', type: 'meal' },
            { time: '08:00 – 08:50', activity: 'IELTS 1:1 · Speaking Practice 1', type: 'one-on-one' },
            { time: '09:00 – 09:50', activity: 'IELTS 1:1 · Reading & Vocabulary 2', type: 'one-on-one' },
            { time: '10:00 – 10:50', activity: 'IELTS 1:1 · Writing Task 1 & 2 (3)', type: 'one-on-one' },
            { time: '11:00 – 11:50', activity: 'IELTS 1:1 · Listening Strategies 4', type: 'one-on-one' },
            { time: '12:00 – 13:00', activity: 'อาหารกลางวัน', type: 'meal' },
            { time: '13:00 – 13:50', activity: 'IELTS กลุ่ม · Listening', type: 'group' },
            { time: '14:00 – 14:50', activity: 'IELTS กลุ่ม · Reading Strategies', type: 'group' },
            { time: '15:00 – 15:50', activity: 'IELTS กลุ่ม · Writing Workshop', type: 'group' },
            { time: '16:00 – 16:50', activity: 'IELTS กลุ่ม · Mock Speaking Test', type: 'group' },
            { time: '17:00 – 19:00', activity: 'เวลาอิสระ (เที่ยวบาเกียวซิตี้)', type: 'free' },
            { time: '19:00 – 20:00', activity: 'อาหารเย็น', type: 'meal' },
            { time: '19:00 – 22:00', activity: "Self-Study บังคับ (B'Sparta) 19:00–22:00", type: 'self-study' },
          ],
        },
      ],
      rules: [
        "B'Sparta: Self-Study บังคับ 19:00–22:00 ทุกวันจันทร์–ศุกร์",
        'เคอร์ฟิว 22:00 น. ต้องอยู่ในหอพักหลัง 22:00',
        'English Only Zone บริเวณโรงเรียน ห้ามพูดภาษาอื่น',
        'เข้าเรียนตรงเวลา อากาศบาเกียวเย็น แต่งกายให้อบอุ่น',
      ],
      note: "B'Cebu บาเกียว อากาศเย็นสบาย 18–22°C ตลอดปี · ระบบ B'Sparta เหมือนสาขา Cebu ทุกประการ · Self-Study บังคับ เคอร์ฟิว 22:00 · ค่าครองชีพต่ำกว่าเซบู",
    } as TimetableConfig,
    youtubeId: null, website: 'https://bcebu.com', mapUrl: 'https://www.google.com/maps/search/?api=1&query=BCebu+Language+School+Baguio+City+Philippines',
    accent: 'from-teal-600 to-cyan-700', tags: ["B'Cebu", 'Baguio', 'อากาศเย็น', 'Intensive'],
  },
  'cpils': {
    slug: 'cpils', name: 'CPILS', tagline: 'Center for Premier International Language Studies | ใจกลาง Cebu City | Native Speaker 100%',
    city: 'Cebu City', country: 'Philippines', logo: cpilsLogo, rating: 4.7, students: '600+', nationality: '15+ ชาติ', founded: 1999,
    photos: [campusImg, classroomImg, cebuImg, heroImg, marketing1],
    description: 'CPILS (Center for Premier International Language Studies) ก่อตั้งปี 1999 ตั้งอยู่ใจกลาง Cebu City ตึก Benedicto ถนน MJ Cuenco เป็นโรงเรียนภาษาอังกฤษแห่งแรกของเซบูและหนึ่งในสถาบันที่มีชื่อเสียงที่สุด ด้วยประสบการณ์กว่า 25 ปี หลักสูตรครอบคลุม ESL, IELTS, TOEIC/TOEFL, Business English, Medical English, TESOL และ IELTS/TOEIC Guarantee ที่การันตีผลคะแนน พร้อมห้องพักแบบ Standard และ Premium ในตึกเดียวกัน',
    highlights: [
      'ก่อตั้งปี 1999 — สถาบันแห่งแรกของเซบู 25+ ปี',
      'ครู Native Speaker 100% ทุกคลาส',
      'IELTS Guarantee & TOEIC Guarantee Programs',
      'หลักสูตรหลากหลาย: ESL, IELTS, TOEIC, Business, Medical, TESOL',
      'ห้องพัก Standard & Premium ในตึกเดียวกับโรงเรียน',
      'Scholarship 5% สำหรับนักเรียนลงทะเบียน 4 สัปดาห์ขึ้นไป',
    ],
    facilities: facilitySet,
    programs: [
      { name: 'ESL Light', duration: '4–24 สัปดาห์', w4: 23000, w8: 42000, w12: 62000, w24: 119000 },
      { name: 'General ESL / ESL Plus', duration: '4–24 สัปดาห์', w4: 33000, w8: 63000, w12: 93000, w24: 181000 },
      { name: 'ESL Premium / Premier Sparta', duration: '4–24 สัปดาห์', w4: 36000, w8: 68000, w12: 100000, w24: 196000 },
      { name: 'IELTS', duration: '4–24 สัปดาห์', w4: 37000, w8: 71000, w12: 105000, w24: 204000 },
      { name: 'IELTS Guarantee (12 สัปดาห์)', duration: '12 สัปดาห์เท่านั้น', w12: 109000 },
      { name: 'TOEIC/TOEFL', duration: '4–24 สัปดาห์', w4: 36000, w8: 68000, w12: 100000, w24: 196000 },
    ],
    roomTypes: [
      { name: 'ห้อง 4 คน (Quad)', persons: '4 คน/ห้อง', pricePerWeek: 4375, amenities: ['แอร์', 'Wi-Fi', 'ห้องน้ำรวม', 'ซักรีดฟรี'] },
      { name: 'ห้อง 3 คน (Triple)', persons: '3 คน/ห้อง', pricePerWeek: 4844, amenities: ['แอร์', 'Wi-Fi', 'ห้องน้ำรวม', 'ซักรีดฟรี'] },
      { name: 'ห้องแฝด (Twin)', persons: '2 คน/ห้อง', pricePerWeek: 5250, amenities: ['แอร์', 'Wi-Fi', 'ห้องน้ำในตัว', 'ซักรีดฟรี'] },
      { name: 'ห้องเดี่ยว (Single)', persons: '1 คน/ห้อง', pricePerWeek: 6219, amenities: ['แอร์', 'Wi-Fi', 'ห้องน้ำในตัว', 'ซักรีดฟรี', 'โต๊ะทำงาน'] },
      { name: 'Premium Single', persons: '1 คน/ห้อง', pricePerWeek: 6781, amenities: ['แอร์', 'Wi-Fi', 'ห้องน้ำในตัว', 'ซักรีดฟรี', 'โต๊ะทำงาน', 'Premium เฟอร์นิเจอร์'] },
    ],
    timetable: {
      schedules: [
        { courseId: 'cpils-esl', courseName: 'General ESL / ESL Plus', courseNameTh: 'ESL ทั่วไป (Native Speaker)', tag: '1:1×4 | กลุ่ม×4',
          slots: [
            { time: '08:00 – 08:30', activity: 'อาหารเช้า', type: 'meal' },
            { time: '08:30 – 09:20', activity: 'ESL 1:1 Native · Speaking & Fluency 1', type: 'one-on-one' },
            { time: '09:30 – 10:20', activity: 'ESL 1:1 Native · Grammar & Usage 2', type: 'one-on-one' },
            { time: '10:30 – 11:20', activity: 'ESL 1:1 Native · Vocabulary & Reading 3', type: 'one-on-one' },
            { time: '11:30 – 12:20', activity: 'ESL 1:1 Native · Free Conversation 4', type: 'one-on-one' },
            { time: '12:30 – 13:30', activity: 'อาหารกลางวัน', type: 'meal' },
            { time: '13:30 – 14:20', activity: 'กลุ่ม Native · Conversation & Discussion', type: 'group' },
            { time: '14:30 – 15:20', activity: 'กลุ่ม Native · Listening Comprehension', type: 'group' },
            { time: '15:30 – 16:20', activity: 'กลุ่ม Native · Pronunciation Lab', type: 'group' },
            { time: '16:30 – 17:20', activity: 'กลุ่ม Native · Writing & Grammar', type: 'group' },
            { time: '17:30 – 18:30', activity: 'เวลาอิสระ', type: 'free' },
            { time: '18:30 – 19:30', activity: 'อาหารเย็น', type: 'meal' },
            { time: '19:30 – 21:30', activity: 'Self-Study (สมัครใจ)', type: 'self-study' },
          ],
        },
        { courseId: 'cpils-ielts', courseName: 'IELTS / IELTS Guarantee', courseNameTh: 'IELTS (Native Speaker)', tag: '1:1×4 | กลุ่ม×4',
          slots: [
            { time: '08:00 – 08:30', activity: 'อาหารเช้า', type: 'meal' },
            { time: '08:30 – 09:20', activity: 'IELTS 1:1 Native · Speaking Mock Test 1', type: 'one-on-one' },
            { time: '09:30 – 10:20', activity: 'IELTS 1:1 Native · Reading & Skimming 2', type: 'one-on-one' },
            { time: '10:30 – 11:20', activity: 'IELTS 1:1 Native · Writing Task 1 & 2 (3)', type: 'one-on-one' },
            { time: '11:30 – 12:20', activity: 'IELTS 1:1 Native · Vocabulary & Grammar 4', type: 'one-on-one' },
            { time: '12:30 – 13:30', activity: 'อาหารกลางวัน', type: 'meal' },
            { time: '13:30 – 14:20', activity: 'IELTS กลุ่ม Native · Listening Practice', type: 'group' },
            { time: '14:30 – 15:20', activity: 'IELTS กลุ่ม Native · Reading Strategies', type: 'group' },
            { time: '15:30 – 16:20', activity: 'IELTS กลุ่ม Native · Writing Workshop', type: 'group' },
            { time: '16:30 – 17:20', activity: 'IELTS กลุ่ม Native · Speaking Clinic', type: 'group' },
            { time: '17:30 – 18:30', activity: 'เวลาอิสระ', type: 'free' },
            { time: '18:30 – 19:30', activity: 'อาหารเย็น', type: 'meal' },
            { time: '19:30 – 21:30', activity: 'IELTS Self-Study (สมัครใจ)', type: 'self-study' },
          ],
        },
      ],
      rules: [
        'ครูทุกคนเป็น Native Speaker — ใช้ภาษาอังกฤษในชั้นเรียนตลอดเวลา',
        'เข้าเรียนตรงเวลา แจ้งล่วงหน้าหากต้องการเลื่อนคลาส',
        'Self-Study เป็นแบบสมัครใจ ไม่บังคับ',
        'ปฏิบัติตามระเบียบของหอพักและโรงเรียน',
      ],
      note: 'CPILS ก่อตั้งปี 1999 ใช้ Native Speaker 100% ทุกคลาส · IELTS Guarantee และ TOEIC Guarantee มีในหลักสูตรเฉพาะ · Self-Study ไม่บังคับ เหมาะกับผู้ที่ต้องการความยืดหยุ่น',
    } as TimetableConfig,
    youtubeId: null, website: 'https://www.cpils.com', mapUrl: 'https://www.google.com/maps/search/?api=1&query=CPILS+Center+for+Premier+International+Language+Studies+Cebu+City',
    accent: 'from-orange-500 to-amber-600', tags: ['Native Teachers', 'ESL', 'TOEIC Guarantee', 'IELTS Guarantee'],
  },
  'ev-academy': {
    slug: 'ev-academy', name: 'EV Academy', tagline: 'We Teach English to the World | Premium Resort Campus | French-Managed',
    city: 'Cebu City', country: 'Philippines', logo: evLogo, rating: 4.7, students: '400+', nationality: '20+ ชาติ', founded: 2010,
    photos: [campusImg, classroomImg, cebuImg, marketing1, heroImg],
    description: 'EV Academy โรงเรียนภาษาอังกฤษสไตล์รีสอร์ท บริหารโดยชาวฝรั่งเศส มีมาตรฐานยุโรป แคมปัสสวยงามมีสระว่ายน้ำ เหมาะสำหรับผู้ที่ต้องการเรียนในสภาพแวดล้อมระดับพรีเมียม และเน้นการพัฒนาทักษะ IELTS เป็นพิเศษ',
    highlights: ['Resort-Style Campus', 'French-Managed Quality', 'IELTS Specialist', 'Semi-Sparta System'],
    facilities: facilitySet,
    programs: [
      { name: 'General English (ESL)', duration: '4–24 สัปดาห์', w4: 34000, w8: 64000, w12: 90000, w24: 165000 },
      { name: 'IELTS Preparation', duration: '8–16 สัปดาห์', w8: 72000, w12: 100000 },
      { name: 'Business English', duration: '4–8 สัปดาห์', w4: 37000, w8: 68000 },
    ],
    roomTypes: [
      { name: 'ห้องคู่ Standard', persons: '2 คน/ห้อง', pricePerWeek: 5200, amenities: ['แอร์', 'Wi-Fi', 'ห้องน้ำในตัว', 'ซักรีดฟรี'] },
      { name: 'ห้องเดี่ยว Standard', persons: '1 คน/ห้อง', pricePerWeek: 7000, amenities: ['แอร์', 'Wi-Fi', 'ห้องน้ำในตัว', 'ซักรีดฟรี', 'โต๊ะทำงาน'] },
      { name: 'Suite Premium', persons: '1 คน/ห้อง', pricePerWeek: 9500, amenities: ['แอร์', 'Wi-Fi', 'ห้องน้ำในตัว', 'ซักรีดฟรี', 'TV', 'มินิฟริดจ์', 'วิวสระ'] },
    ],
    timetable: {
      schedules: [
        { courseId: 'ev-esl', courseName: 'General English (ESL)', courseNameTh: 'ESL รีสอร์ท', tag: '1:1×4 | กลุ่ม×3',
          slots: [
            { time: '07:30 – 08:00', activity: 'อาหารเช้า (ริมสระ)', type: 'meal' },
            { time: '08:00 – 08:50', activity: 'ESL 1:1 · Grammar & Speaking 1', type: 'one-on-one' },
            { time: '09:00 – 09:50', activity: 'ESL 1:1 · Vocabulary & Reading 2', type: 'one-on-one' },
            { time: '10:00 – 10:50', activity: 'ESL 1:1 · Listening & Pronunciation 3', type: 'one-on-one' },
            { time: '11:00 – 11:50', activity: 'ESL 1:1 · Free Conversation 4', type: 'one-on-one' },
            { time: '12:00 – 13:00', activity: 'อาหารกลางวัน', type: 'meal' },
            { time: '13:00 – 13:50', activity: 'กลุ่ม · Speaking & Roleplay', type: 'group' },
            { time: '14:00 – 14:50', activity: 'กลุ่ม · Listening & Grammar', type: 'group' },
            { time: '15:00 – 15:50', activity: 'กลุ่ม · Writing & Vocabulary', type: 'group' },
            { time: '16:30 – 18:00', activity: 'เวลาว่าง / ว่ายน้ำในสระรีสอร์ท', type: 'free' },
            { time: '18:00 – 19:00', activity: 'อาหารเย็น', type: 'meal' },
            { time: '19:00 – 21:00', activity: 'Self-Study (สมัครใจ)', type: 'self-study' },
          ],
        },
        { courseId: 'ev-ielts', courseName: 'IELTS Preparation', courseNameTh: 'IELTS รีสอร์ท', tag: '1:1×4 | กลุ่ม×3',
          slots: [
            { time: '07:30 – 08:00', activity: 'อาหารเช้า (ริมสระ)', type: 'meal' },
            { time: '08:00 – 08:50', activity: 'IELTS 1:1 · Speaking Mock Test 1', type: 'one-on-one' },
            { time: '09:00 – 09:50', activity: 'IELTS 1:1 · Reading & Skimming 2', type: 'one-on-one' },
            { time: '10:00 – 10:50', activity: 'IELTS 1:1 · Writing Task 1 & 2 (3)', type: 'one-on-one' },
            { time: '11:00 – 11:50', activity: 'IELTS 1:1 · Listening Strategies 4', type: 'one-on-one' },
            { time: '12:00 – 13:00', activity: 'อาหารกลางวัน', type: 'meal' },
            { time: '13:00 – 13:50', activity: 'IELTS กลุ่ม · Listening Practice', type: 'group' },
            { time: '14:00 – 14:50', activity: 'IELTS กลุ่ม · Reading Strategies', type: 'group' },
            { time: '15:00 – 15:50', activity: 'IELTS กลุ่ม · Writing Workshop', type: 'group' },
            { time: '16:30 – 18:00', activity: 'เวลาว่าง / ว่ายน้ำในสระรีสอร์ท', type: 'free' },
            { time: '18:00 – 19:00', activity: 'อาหารเย็น', type: 'meal' },
            { time: '19:00 – 21:00', activity: 'IELTS Self-Study (สมัครใจ)', type: 'self-study' },
          ],
        },
      ],
      rules: [
        'ใช้ภาษาอังกฤษในบริเวณโรงเรียน (English Zone)',
        'เข้าเรียนตรงเวลา แต่งกายสุภาพ',
        'สระว่ายน้ำ: 16:30–18:00 น. เวลาผ่อนคลายหลังเรียน',
        'Self-Study เป็นแบบสมัครใจ ไม่บังคับ',
      ],
      note: 'EV Academy สไตล์รีสอร์ท บริหารโดยฝรั่งเศส · ว่ายน้ำได้ 16:30–18:00 น. ทุกวัน · Semi-Sparta ผ่อนคลายกว่า Sparta เต็ม · เหมาะสำหรับผู้ต้องการเรียน IELTS ในบรรยากาศพรีเมียม',
    } as TimetableConfig,
    youtubeId: null, website: 'https://www.ev-academy.com', mapUrl: 'https://www.google.com/maps/search/?api=1&query=EV+Academy+Cebu+Philippines',
    accent: 'from-amber-600 to-yellow-600', tags: ['Resort Style', 'IELTS', 'French Owner', 'Premium'],
  },
  'smeag': {
    slug: 'smeag', name: 'SMEAG Global School', tagline: 'สถาบันชั้นนำเซบู | Sparta & Semi-Sparta | IELTS Guarantee',
    city: 'Cebu City', country: 'Philippines', logo: null, logoText: 'SMEAG', rating: 4.8, students: '1200+', nationality: '20+ ชาติ', founded: 1996,
    photos: [campusImg, classroomImg, cebuImg, marketing1, heroImg],
    description: 'SMEAG Global School เป็นหนึ่งในโรงเรียนภาษาอังกฤษที่ใหญ่ที่สุดและมีชื่อเสียงที่สุดในเซบู มีทั้งแคมปัส Sparta และ Classic ให้เลือก รองรับนักเรียนจากทั่วโลกกว่า 1,200 คน พร้อม IELTS Guarantee Program ที่การันตีคะแนน',
    highlights: ['IELTS Score Guarantee', 'Sparta & Semi-Sparta Option', 'แคมปัสใหญ่ 2 แห่ง', 'รองรับ 1,200+ นักเรียน'],
    facilities: facilitySet,
    programs: [
      { name: 'General English (Classic)', duration: '4–24 สัปดาห์', w4: 35000, w8: 66000, w12: 93000, w24: 170000 },
      { name: 'IELTS Guarantee (5.5→6.5)', duration: '12–24 สัปดาห์', w12: 105000, w24: 195000 },
      { name: 'TOEIC Boost', duration: '4–12 สัปดาห์', w4: 36000, w8: 67000, w12: 94000 },
      { name: 'Business English', duration: '4–8 สัปดาห์', w4: 38000, w8: 70000 },
    ],
    roomTypes: [
      { name: 'ห้อง 3 คน (Triple)', persons: '3 คน/ห้อง', pricePerWeek: 3500, amenities: ['แอร์', 'Wi-Fi', 'ห้องน้ำรวม', 'ซักรีดฟรี'] },
      { name: 'ห้องคู่ (Double)', persons: '2 คน/ห้อง', pricePerWeek: 4600, amenities: ['แอร์', 'Wi-Fi', 'ห้องน้ำในตัว', 'ซักรีดฟรี'] },
      { name: 'ห้องเดี่ยว (Single)', persons: '1 คน/ห้อง', pricePerWeek: 6000, amenities: ['แอร์', 'Wi-Fi', 'ห้องน้ำในตัว', 'ซักรีดฟรี'] },
      { name: 'Suite Deluxe', persons: '1 คน/ห้อง', pricePerWeek: 8500, amenities: ['แอร์', 'Wi-Fi', 'ห้องน้ำในตัว', 'ซักรีดฟรี', 'TV', 'บาลโคนี'] },
    ],
    timetable: {
      schedules: [
        { courseId: 'smeag-sparta', courseName: 'Sparta Campus (IELTS)', courseNameTh: 'Sparta Campus เข้มข้น', tag: '1:1×4 | กลุ่ม×4',
          slots: [
            { time: '07:00 – 07:30', activity: 'อาหารเช้า', type: 'meal' },
            { time: '07:30 – 08:20', activity: 'IELTS 1:1 · Speaking Practice 1', type: 'one-on-one' },
            { time: '08:30 – 09:20', activity: 'IELTS 1:1 · Reading & Vocabulary 2', type: 'one-on-one' },
            { time: '09:30 – 10:20', activity: 'IELTS 1:1 · Writing Task 1 & 2 (3)', type: 'one-on-one' },
            { time: '10:30 – 11:20', activity: 'IELTS 1:1 · Listening Strategies 4', type: 'one-on-one' },
            { time: '11:30 – 12:30', activity: 'อาหารกลางวัน', type: 'meal' },
            { time: '12:30 – 13:20', activity: 'IELTS กลุ่ม · Listening Practice', type: 'group' },
            { time: '13:30 – 14:20', activity: 'IELTS กลุ่ม · Reading Strategies', type: 'group' },
            { time: '14:30 – 15:20', activity: 'IELTS กลุ่ม · Writing Workshop', type: 'group' },
            { time: '15:30 – 16:20', activity: 'IELTS กลุ่ม · Speaking Clinic', type: 'group' },
            { time: '16:30 – 19:00', activity: 'เวลาอิสระ', type: 'free' },
            { time: '19:00 – 20:00', activity: 'อาหารเย็น', type: 'meal' },
            { time: '19:00 – 22:00', activity: 'Self-Study บังคับ (Sparta) 19:00–22:00', type: 'self-study' },
          ],
        },
        { courseId: 'smeag-classic', courseName: 'Classic Campus (General English)', courseNameTh: 'Classic Campus ผ่อนคลาย', tag: '1:1×4 | กลุ่ม×4',
          slots: [
            { time: '08:00 – 08:30', activity: 'อาหารเช้า', type: 'meal' },
            { time: '08:30 – 09:20', activity: 'ESL 1:1 · Grammar & Speaking 1', type: 'one-on-one' },
            { time: '09:30 – 10:20', activity: 'ESL 1:1 · Vocabulary & Reading 2', type: 'one-on-one' },
            { time: '10:30 – 11:20', activity: 'ESL 1:1 · Listening & Pronunciation 3', type: 'one-on-one' },
            { time: '11:30 – 12:20', activity: 'ESL 1:1 · Free Conversation 4', type: 'one-on-one' },
            { time: '12:30 – 13:30', activity: 'อาหารกลางวัน', type: 'meal' },
            { time: '13:30 – 14:20', activity: 'กลุ่ม · Conversation & Discussion', type: 'group' },
            { time: '14:30 – 15:20', activity: 'กลุ่ม · Listening Practice', type: 'group' },
            { time: '15:30 – 16:20', activity: 'กลุ่ม · Grammar Review', type: 'group' },
            { time: '16:30 – 17:20', activity: 'กลุ่ม · Writing Skills', type: 'group' },
            { time: '17:30 – 18:30', activity: 'เวลาอิสระ', type: 'free' },
            { time: '18:30 – 19:30', activity: 'อาหารเย็น', type: 'meal' },
            { time: '19:30 – 22:00', activity: 'Self-Study (สมัครใจ)', type: 'self-study' },
          ],
        },
      ],
      rules: [
        'Sparta Campus: Self-Study บังคับ 19:00–22:00 น. เคอร์ฟิว 22:00',
        'Classic Campus: Self-Study สมัครใจ ยืดหยุ่นกว่า',
        'English Only Zone ในบริเวณโรงเรียนทั้ง 2 แคมปัส',
        'IELTS Guarantee: ต้องเรียนครบตามเงื่อนไขและทำ Mock Tests ทุกสัปดาห์',
      ],
      note: 'SMEAG มี 2 แคมปัส: Sparta Campus (เข้มข้น มี self-study บังคับ เคอร์ฟิว 22:00) และ Classic Campus (ผ่อนคลายกว่า self-study สมัครใจ) · IELTS Guarantee รับประกันผลคะแนน',
    } as TimetableConfig,
    youtubeId: null, website: 'https://www.smeag.com', mapUrl: 'https://www.google.com/maps/search/?api=1&query=SMEAG+Global+School+Cebu+Philippines',
    accent: 'from-red-600 to-orange-600', tags: ['Sparta', 'IELTS Guarantee', 'Big Campus', 'Classic'],
  },
  // ── Iloilo Schools ──────────────────────────────────────────────────────────
  'we-academy-iloilo': {
    slug: 'we-academy-iloilo', name: 'We Academy Iloilo', tagline: 'ศูนย์สอบ IELTS Computer-Based | สระว่ายน้ำ | Jaro, Iloilo City',
    city: 'Jaro, Iloilo City', country: 'Philippines', logo: null, logoText: 'WE', rating: 4.5, students: '300+', nationality: '10+ ชาติ', founded: 2010,
    photos: [iloiloImg, campusImg, classroomImg, heroImg, marketing1],
    description: 'We Academy Iloilo เป็นโรงเรียนภาษาอังกฤษขนาดใหญ่ที่ได้รับความนิยมในเมืองอิโลอิโล ตั้งอยู่ย่าน Jaro เป็นศูนย์สอบ IELTS Computer-Based อย่างเป็นทางการ มีสิ่งอำนวยความสะดวกครบครัน ทั้งสระว่ายน้ำ ฟิตเนส และหอพักในแคมปัส รองรับนักเรียนต่างชาติหลากหลายสัญชาติ ค่าเรียนคุ้มค่าเมื่อเทียบกับคุณภาพการสอน',
    highlights: ['ศูนย์สอบ IELTS Computer-Based อย่างเป็นทางการ', 'มีสระว่ายน้ำ ฟิตเนส หอพักในแคมปัส', 'รองรับนักเรียนหลากหลายสัญชาติ', 'ค่าครองชีพอิโลอิโลต่ำกว่าเซบู 20–30%'],
    facilities: facilitySet,
    programs: [
      { name: 'General English (ESL)', duration: '4–24 สัปดาห์', w4: 22000, w8: 40000, w12: 56000, w24: 100000 },
      { name: 'IELTS Preparation', duration: '8–16 สัปดาห์', w8: 45000, w12: 62000 },
      { name: 'TOEIC Boost', duration: '4–12 สัปดาห์', w4: 23000, w8: 42000, w12: 58000 },
      { name: 'Business English', duration: '4–8 สัปดาห์', w4: 24000, w8: 44000 },
    ],
    roomTypes: [
      { name: 'ห้อง 3 คน (Triple)', persons: '3 คน/ห้อง', pricePerWeek: 2800, amenities: ['แอร์', 'Wi-Fi', 'ห้องน้ำรวม', 'ซักรีดฟรี'] },
      { name: 'ห้องแฝด (Twin)', persons: '2 คน/ห้อง', pricePerWeek: 3600, amenities: ['แอร์', 'Wi-Fi', 'ห้องน้ำในตัว', 'ซักรีดฟรี'] },
      { name: 'ห้องเดี่ยว (Single)', persons: '1 คน/ห้อง', pricePerWeek: 4800, amenities: ['แอร์', 'Wi-Fi', 'ห้องน้ำในตัว', 'ซักรีดฟรี', 'โต๊ะทำงาน'] },
    ],
    timetable: {
      schedules: [
        { courseId: 'esl', courseName: 'ESL General English', courseNameTh: 'ESL ทั่วไป', tag: '1:1×4 | กลุ่ม×3',
          slots: [
            { time: '08:00 – 08:30', activity: 'อาหารเช้า', type: 'meal' },
            { time: '08:30 – 09:20', activity: 'เรียน 1 ต่อ 1 ชั่วโมงที่ 1', type: 'one-on-one' },
            { time: '09:30 – 10:20', activity: 'เรียน 1 ต่อ 1 ชั่วโมงที่ 2', type: 'one-on-one' },
            { time: '10:30 – 11:20', activity: 'เรียน 1 ต่อ 1 ชั่วโมงที่ 3', type: 'one-on-one' },
            { time: '11:30 – 12:20', activity: 'เรียน 1 ต่อ 1 ชั่วโมงที่ 4', type: 'one-on-one' },
            { time: '12:30 – 13:30', activity: 'อาหารกลางวัน', type: 'meal' },
            { time: '13:30 – 14:20', activity: 'เรียนกลุ่ม ชั่วโมงที่ 1', type: 'group' },
            { time: '14:30 – 15:20', activity: 'เรียนกลุ่ม ชั่วโมงที่ 2', type: 'group' },
            { time: '15:30 – 16:20', activity: 'เรียนกลุ่ม ชั่วโมงที่ 3', type: 'group' },
            { time: '16:30 – 18:00', activity: 'เวลาอิสระ / กิจกรรม', type: 'free' },
            { time: '18:00 – 19:00', activity: 'อาหารเย็น', type: 'meal' },
            { time: '19:00 – 21:00', activity: 'Self-Study (สมัครใจ)', type: 'self-study' },
          ],
        },
        { courseId: 'ielts', courseName: 'IELTS Preparation', courseNameTh: 'IELTS', tag: '1:1×4 | กลุ่ม×3',
          slots: [
            { time: '08:00 – 08:30', activity: 'อาหารเช้า', type: 'meal' },
            { time: '08:30 – 09:20', activity: 'IELTS 1:1 · Reading & Writing 1', type: 'one-on-one' },
            { time: '09:30 – 10:20', activity: 'IELTS 1:1 · Reading & Writing 2', type: 'one-on-one' },
            { time: '10:30 – 11:20', activity: 'IELTS 1:1 · Speaking Practice 1', type: 'one-on-one' },
            { time: '11:30 – 12:20', activity: 'IELTS 1:1 · Speaking Practice 2', type: 'one-on-one' },
            { time: '12:30 – 13:30', activity: 'อาหารกลางวัน', type: 'meal' },
            { time: '13:30 – 14:20', activity: 'IELTS Group · Listening', type: 'group' },
            { time: '14:30 – 15:20', activity: 'IELTS Group · Reading', type: 'group' },
            { time: '15:30 – 16:20', activity: 'IELTS Group · Writing Workshop', type: 'group' },
            { time: '16:30 – 18:00', activity: 'เวลาอิสระ', type: 'free' },
            { time: '18:00 – 19:00', activity: 'อาหารเย็น', type: 'meal' },
            { time: '19:00 – 21:00', activity: 'IELTS Self-Study', type: 'self-study' },
          ],
        },
      ],
      rules: ['ส่งเสริมการใช้ภาษาอังกฤษในบริเวณโรงเรียน', 'เข้าเรียนตรงเวลา มีความรับผิดชอบต่อตารางเรียน', 'ปฏิบัติตามกฎของหอพักและโรงเรียน'],
      note: 'ตารางอาจมีการปรับเปลี่ยนตามปฏิทินโรงเรียน · วันเสาร์มีกิจกรรมพิเศษ',
    } as TimetableConfig,
    youtubeId: null, website: 'https://www.weacademy-iloilo.com', mapUrl: 'https://www.google.com/maps/search/?api=1&query=We+Academy+Iloilo+Jaro+Iloilo+City+Philippines',
    accent: 'from-sky-500 to-blue-600', tags: ['IELTS Computer-Based', 'ESL', 'IELTS', 'Swimming Pool'],
  },

  'gitc-iloilo': {
    slug: 'gitc-iloilo', name: 'GITC Iloilo (Green International Technological College)', tagline: 'นิยมจากนักเรียนญี่ปุ่น–เกาหลี | ESL & IELTS | La Paz, Iloilo City',
    city: 'La Paz, Iloilo City', country: 'Philippines', logo: null, logoText: 'GITC', rating: 4.5, students: '200+', nationality: '8+ ชาติ', founded: 2005,
    photos: [iloiloImg, campusImg, classroomImg, heroImg, marketing1],
    description: 'GITC (Green International Technological College) สาขาอิโลอิโล ตั้งอยู่ย่าน La Paz เป็นโรงเรียนที่ได้รับความนิยมสูงในหมู่นักเรียนญี่ปุ่นและเกาหลี เน้นการพัฒนาทักษะการสื่อสารจริง บรรยากาศเงียบสงบ เหมาะสำหรับผู้ที่ต้องการเรียนอย่างจริงจัง ค่าครองชีพโดยรวมต่ำกว่าเมืองใหญ่มาก',
    highlights: ['นิยมสูงในหมู่นักเรียนญี่ปุ่นและเกาหลี', 'เน้นพัฒนาทักษะการสื่อสารจริง', 'บรรยากาศเงียบสงบ เหมาะกับการเรียน', 'ค่าครองชีพต่ำกว่าเซบูและมะนิลา'],
    facilities: facilitySet,
    programs: [
      { name: 'General English (ESL)', duration: '4–24 สัปดาห์', w4: 21000, w8: 39000, w12: 54000, w24: 97000 },
      { name: 'IELTS Preparation', duration: '8–16 สัปดาห์', w8: 43000, w12: 60000 },
      { name: 'TOEIC Boost', duration: '4–12 สัปดาห์', w4: 22000, w8: 40000, w12: 56000 },
    ],
    roomTypes: [
      { name: 'ห้อง 3 คน (Triple)', persons: '3 คน/ห้อง', pricePerWeek: 2700, amenities: ['แอร์', 'Wi-Fi', 'ห้องน้ำรวม', 'ซักรีดฟรี'] },
      { name: 'ห้องแฝด (Twin)', persons: '2 คน/ห้อง', pricePerWeek: 3400, amenities: ['แอร์', 'Wi-Fi', 'ห้องน้ำในตัว', 'ซักรีดฟรี'] },
      { name: 'ห้องเดี่ยว (Single)', persons: '1 คน/ห้อง', pricePerWeek: 4600, amenities: ['แอร์', 'Wi-Fi', 'ห้องน้ำในตัว', 'ซักรีดฟรี', 'โต๊ะทำงาน'] },
    ],
    timetable: {
      schedules: [
        { courseId: 'esl', courseName: 'ESL General English', courseNameTh: 'ESL ทั่วไป', tag: '1:1×4 | กลุ่ม×3',
          slots: [
            { time: '08:00 – 08:30', activity: 'อาหารเช้า', type: 'meal' },
            { time: '08:30 – 09:20', activity: 'เรียน 1 ต่อ 1 ชั่วโมงที่ 1', type: 'one-on-one' },
            { time: '09:30 – 10:20', activity: 'เรียน 1 ต่อ 1 ชั่วโมงที่ 2', type: 'one-on-one' },
            { time: '10:30 – 11:20', activity: 'เรียน 1 ต่อ 1 ชั่วโมงที่ 3', type: 'one-on-one' },
            { time: '11:30 – 12:20', activity: 'เรียน 1 ต่อ 1 ชั่วโมงที่ 4', type: 'one-on-one' },
            { time: '12:30 – 13:30', activity: 'อาหารกลางวัน', type: 'meal' },
            { time: '13:30 – 14:20', activity: 'เรียนกลุ่ม ชั่วโมงที่ 1', type: 'group' },
            { time: '14:30 – 15:20', activity: 'เรียนกลุ่ม ชั่วโมงที่ 2', type: 'group' },
            { time: '15:30 – 16:20', activity: 'เรียนกลุ่ม ชั่วโมงที่ 3', type: 'group' },
            { time: '16:30 – 18:00', activity: 'เวลาอิสระ / กิจกรรม', type: 'free' },
            { time: '18:00 – 19:00', activity: 'อาหารเย็น', type: 'meal' },
            { time: '19:00 – 21:00', activity: 'Self-Study (สมัครใจ)', type: 'self-study' },
          ],
        },
      ],
      rules: ['ส่งเสริมการใช้ภาษาอังกฤษในบริเวณโรงเรียน', 'เข้าเรียนตรงเวลา มีวินัยในการเรียน', 'ปฏิบัติตามกฎของหอพักและโรงเรียน'],
      note: 'ตารางอาจมีการปรับเปลี่ยนตามปฏิทินโรงเรียน',
    } as TimetableConfig,
    youtubeId: null, website: 'http://gitc.edu.ph', mapUrl: 'https://www.google.com/maps/search/?api=1&query=GITC+Green+International+Technological+College+Iloilo+City+Philippines',
    accent: 'from-teal-500 to-emerald-600', tags: ['ESL', 'IELTS', 'TOEIC', 'Quiet Atmosphere'],
  },

  'mk-education-iloilo': {
    slug: 'mk-education-iloilo', name: 'MK Education Iloilo', tagline: 'Family Program | Business English | Mandurriao, Iloilo City',
    city: 'Mandurriao, Iloilo City', country: 'Philippines', logo: null, logoText: 'MK', rating: 4.4, students: '150+', nationality: '6+ ชาติ', founded: 2012,
    photos: [iloiloImg, campusImg, classroomImg, heroImg, marketing1],
    description: 'MK Education อิโลอิโล ตั้งอยู่ย่าน Mandurriao เชี่ยวชาญด้าน Family Program สำหรับผู้ปกครองและบุตรหลาน พร้อมหลักสูตร Business English และ IELTS สำหรับผู้ใหญ่และวัยทำงาน บุคลากรดูแลนักเรียนอย่างใกล้ชิดเป็นส่วนตัว เหมาะสำหรับผู้ที่ต้องการพัฒนาภาษาอังกฤษเพื่อการทำงานจริง',
    highlights: ['Family Program สำหรับผู้ปกครองและบุตรหลาน', 'Business English เน้นภาษาเพื่อการทำงาน', 'ดูแลนักเรียนอย่างใกล้ชิดเป็นส่วนตัว', 'เหมาะสำหรับผู้ใหญ่และวัยทำงาน'],
    facilities: facilitySet,
    programs: [
      { name: 'General English (ESL)', duration: '4–24 สัปดาห์', w4: 21000, w8: 38000, w12: 53000, w24: 95000 },
      { name: 'Business English', duration: '4–12 สัปดาห์', w4: 24000, w8: 44000, w12: 62000 },
      { name: 'IELTS Preparation', duration: '8–16 สัปดาห์', w8: 44000, w12: 61000 },
      { name: 'Family Program (2 คน)', duration: '4–12 สัปดาห์', w4: 36000, w8: 68000, w12: 95000 },
    ],
    roomTypes: [
      { name: 'ห้อง 3 คน (Triple)', persons: '3 คน/ห้อง', pricePerWeek: 2700, amenities: ['แอร์', 'Wi-Fi', 'ห้องน้ำรวม', 'ซักรีดฟรี'] },
      { name: 'ห้องแฝด (Twin)', persons: '2 คน/ห้อง', pricePerWeek: 3500, amenities: ['แอร์', 'Wi-Fi', 'ห้องน้ำในตัว', 'ซักรีดฟรี'] },
      { name: 'ห้องเดี่ยว (Single)', persons: '1 คน/ห้อง', pricePerWeek: 4700, amenities: ['แอร์', 'Wi-Fi', 'ห้องน้ำในตัว', 'ซักรีดฟรี', 'โต๊ะทำงาน'] },
    ],
    timetable: {
      schedules: [
        { courseId: 'esl', courseName: 'ESL / Business English', courseNameTh: 'ESL / Business', tag: '1:1×4 | กลุ่ม×3',
          slots: [
            { time: '08:00 – 08:30', activity: 'อาหารเช้า', type: 'meal' },
            { time: '08:30 – 09:20', activity: 'เรียน 1 ต่อ 1 ชั่วโมงที่ 1', type: 'one-on-one' },
            { time: '09:30 – 10:20', activity: 'เรียน 1 ต่อ 1 ชั่วโมงที่ 2', type: 'one-on-one' },
            { time: '10:30 – 11:20', activity: 'เรียน 1 ต่อ 1 ชั่วโมงที่ 3', type: 'one-on-one' },
            { time: '11:30 – 12:20', activity: 'เรียน 1 ต่อ 1 ชั่วโมงที่ 4', type: 'one-on-one' },
            { time: '12:30 – 13:30', activity: 'อาหารกลางวัน', type: 'meal' },
            { time: '13:30 – 14:20', activity: 'เรียนกลุ่ม · Business Communication', type: 'group' },
            { time: '14:30 – 15:20', activity: 'เรียนกลุ่ม · Presentation Skills', type: 'group' },
            { time: '15:30 – 16:20', activity: 'เรียนกลุ่ม · Discussion & Debate', type: 'group' },
            { time: '16:30 – 18:00', activity: 'เวลาอิสระ', type: 'free' },
            { time: '18:00 – 19:00', activity: 'อาหารเย็น', type: 'meal' },
            { time: '19:00 – 21:00', activity: 'Self-Study (สมัครใจ)', type: 'self-study' },
          ],
        },
      ],
      rules: ['ส่งเสริมการใช้ภาษาอังกฤษในบริเวณโรงเรียน', 'เข้าเรียนตรงเวลา มีความรับผิดชอบ', 'Family Program: ผู้ปกครองและบุตรหลานเรียนพร้อมกัน'],
      note: 'ตารางสำหรับ Family Program อาจแตกต่าง กรุณาสอบถามล่วงหน้า',
    } as TimetableConfig,
    youtubeId: null, website: 'https://www.mk-edu.net', mapUrl: 'https://www.google.com/maps/search/?api=1&query=MK+Education+Mandurriao+Iloilo+City+Philippines',
    accent: 'from-amber-500 to-orange-500', tags: ['Family Program', 'Business English', 'IELTS', 'ESL'],
  },

  'pia-iloilo': {
    slug: 'pia-iloilo', name: 'PIA (Polyglot International Academy) Iloilo', tagline: 'โรงเรียนรุ่นใหม่ | ห้องเรียนเล็ก | Mandurriao, Iloilo City',
    city: 'Mandurriao, Iloilo City', country: 'Philippines', logo: null, logoText: 'PIA', rating: 4.5, students: '150+', nationality: '8+ ชาติ', founded: 2018,
    photos: [iloiloImg, campusImg, classroomImg, heroImg, marketing1],
    description: 'PIA (Polyglot International Academy) อิโลอิโล เป็นโรงเรียนรุ่นใหม่ บรรยากาศทันสมัย ตั้งอยู่ย่าน Mandurriao ได้รับรีวิวจากนักเรียนต่างชาติในระดับดีมาก ห้องเรียนขนาดเล็กทำให้ครูดูแลได้อย่างทั่วถึง เน้นการสื่อสารและการใช้ภาษาในชีวิตจริง เหมาะสำหรับนักเรียนวัยมหาวิทยาลัยและผู้ที่เพิ่งเริ่มต้นเรียนภาษาอังกฤษ',
    highlights: ['โรงเรียนรุ่นใหม่ บรรยากาศทันสมัย', 'ห้องเรียนเล็ก ดูแลนักเรียนทุกคนอย่างใกล้ชิด', 'รีวิวจากนักเรียนต่างชาติดีมาก', 'เน้นการสื่อสารในชีวิตจริง'],
    facilities: facilitySet,
    programs: [
      { name: 'General English (ESL)', duration: '4–24 สัปดาห์', w4: 22000, w8: 40000, w12: 56000, w24: 100000 },
      { name: 'IELTS Preparation', duration: '8–16 สัปดาห์', w8: 44000, w12: 61000 },
      { name: 'Speaking Focus', duration: '4–12 สัปดาห์', w4: 23000, w8: 42000, w12: 58000 },
    ],
    roomTypes: [
      { name: 'ห้องแฝด (Twin)', persons: '2 คน/ห้อง', pricePerWeek: 3500, amenities: ['แอร์', 'Wi-Fi', 'ห้องน้ำในตัว', 'ซักรีดฟรี'] },
      { name: 'ห้องเดี่ยว (Single)', persons: '1 คน/ห้อง', pricePerWeek: 4700, amenities: ['แอร์', 'Wi-Fi', 'ห้องน้ำในตัว', 'ซักรีดฟรี', 'โต๊ะทำงาน'] },
    ],
    timetable: {
      schedules: [
        { courseId: 'esl', courseName: 'ESL / Speaking Focus', courseNameTh: 'ESL / Speaking', tag: '1:1×4 | กลุ่ม×3',
          slots: [
            { time: '08:00 – 08:30', activity: 'อาหารเช้า', type: 'meal' },
            { time: '08:30 – 09:20', activity: 'เรียน 1 ต่อ 1 ชั่วโมงที่ 1', type: 'one-on-one' },
            { time: '09:30 – 10:20', activity: 'เรียน 1 ต่อ 1 ชั่วโมงที่ 2', type: 'one-on-one' },
            { time: '10:30 – 11:20', activity: 'เรียน 1 ต่อ 1 ชั่วโมงที่ 3', type: 'one-on-one' },
            { time: '11:30 – 12:20', activity: 'เรียน 1 ต่อ 1 ชั่วโมงที่ 4', type: 'one-on-one' },
            { time: '12:30 – 13:30', activity: 'อาหารกลางวัน', type: 'meal' },
            { time: '13:30 – 14:20', activity: 'Group Speaking · Roleplay & Conversation', type: 'group' },
            { time: '14:30 – 15:20', activity: 'Group · Listening & Pronunciation', type: 'group' },
            { time: '15:30 – 16:20', activity: 'Group · Grammar & Vocabulary', type: 'group' },
            { time: '16:30 – 18:00', activity: 'เวลาอิสระ / กิจกรรม', type: 'free' },
            { time: '18:00 – 19:00', activity: 'อาหารเย็น', type: 'meal' },
            { time: '19:00 – 21:00', activity: 'Self-Study (สมัครใจ)', type: 'self-study' },
          ],
        },
      ],
      rules: ['ส่งเสริมการใช้ภาษาอังกฤษในบริเวณโรงเรียน', 'เข้าเรียนตรงเวลา', 'บรรยากาศเป็นกันเอง ไม่เข้มงวดเกินไป'],
      note: 'ตารางอาจมีการปรับเปลี่ยนตามปฏิทินโรงเรียน',
    } as TimetableConfig,
    youtubeId: null, website: 'https://iloilopia.com', mapUrl: 'https://www.google.com/maps/search/?api=1&query=PIA+Polyglot+International+Academy+Iloilo+Mandurriao+Philippines',
    accent: 'from-purple-500 to-violet-600', tags: ['Modern', 'Small Class', 'ESL', 'Speaking'],
  },

  'columbus-english': {
    slug: 'columbus-english', name: 'Columbus English Academy', tagline: 'โรงเรียนขนาดเล็ก | บรรยากาศครอบครัว | Jaro, Iloilo City',
    city: 'Jaro, Iloilo City', country: 'Philippines', logo: null, logoText: 'CEA', rating: 4.4, students: '80+', nationality: '5+ ชาติ', founded: 2014,
    photos: [iloiloImg, campusImg, classroomImg, heroImg, marketing1],
    description: 'Columbus English Academy เป็นโรงเรียนขนาดเล็กที่มีบรรยากาศแบบครอบครัว ตั้งอยู่ย่าน Jaro เมืองอิโลอิโล ครูสามารถติดตามพัฒนาการนักเรียนได้อย่างใกล้ชิดทุกคน บรรยากาศเป็นกันเอง เหมาะสำหรับผู้ที่ต้องการเรียนแบบไม่แออัดและชอบสังคมขนาดเล็ก',
    highlights: ['โรงเรียนขนาดเล็ก ดูแลทุกคนอย่างทั่วถึง', 'บรรยากาศแบบครอบครัว เป็นกันเอง', 'เหมาะสำหรับผู้เริ่มต้นและไม่ชอบสังคมแออัด', 'ครูติดตามพัฒนาการอย่างใกล้ชิด'],
    facilities: facilitySet,
    programs: [
      { name: 'General English (ESL)', duration: '4–16 สัปดาห์', w4: 19000, w8: 35000, w12: 49000 },
      { name: 'Speaking Intensive', duration: '4–8 สัปดาห์', w4: 21000, w8: 38000 },
    ],
    roomTypes: [
      { name: 'ห้องแฝด (Twin)', persons: '2 คน/ห้อง', pricePerWeek: 3200, amenities: ['แอร์', 'Wi-Fi', 'ห้องน้ำในตัว', 'ซักรีดฟรี'] },
      { name: 'ห้องเดี่ยว (Single)', persons: '1 คน/ห้อง', pricePerWeek: 4300, amenities: ['แอร์', 'Wi-Fi', 'ห้องน้ำในตัว', 'ซักรีดฟรี', 'โต๊ะทำงาน'] },
    ],
    timetable: {
      schedules: [
        { courseId: 'esl', courseName: 'ESL / Speaking', courseNameTh: 'ESL ทั่วไป', tag: '1:1×3 | กลุ่ม×3',
          slots: [
            { time: '08:00 – 08:30', activity: 'อาหารเช้า', type: 'meal' },
            { time: '08:30 – 09:20', activity: 'เรียน 1 ต่อ 1 ชั่วโมงที่ 1', type: 'one-on-one' },
            { time: '09:30 – 10:20', activity: 'เรียน 1 ต่อ 1 ชั่วโมงที่ 2', type: 'one-on-one' },
            { time: '10:30 – 11:20', activity: 'เรียน 1 ต่อ 1 ชั่วโมงที่ 3', type: 'one-on-one' },
            { time: '11:30 – 12:20', activity: 'เรียนกลุ่ม · Conversation', type: 'group' },
            { time: '12:30 – 13:30', activity: 'อาหารกลางวัน', type: 'meal' },
            { time: '13:30 – 14:20', activity: 'เรียนกลุ่ม · Grammar & Vocabulary', type: 'group' },
            { time: '14:30 – 15:20', activity: 'เรียนกลุ่ม · Listening & Pronunciation', type: 'group' },
            { time: '15:30 – 18:00', activity: 'เวลาอิสระ / กิจกรรม', type: 'free' },
            { time: '18:00 – 19:00', activity: 'อาหารเย็น', type: 'meal' },
          ],
        },
      ],
      rules: ['ส่งเสริมการใช้ภาษาอังกฤษ', 'บรรยากาศผ่อนคลาย แต่มุ่งมั่นพัฒนา', 'ดูแลกันแบบครอบครัว'],
      note: 'โรงเรียนขนาดเล็ก ตารางอาจยืดหยุ่นตามนักเรียน',
    } as TimetableConfig,
    youtubeId: null, website: '', mapUrl: 'https://www.google.com/maps/search/?api=1&query=Columbus+English+Academy+Jaro+Iloilo+City+Philippines',
    accent: 'from-rose-500 to-pink-500', tags: ['Small School', 'ESL', 'Family Atmosphere', 'Boutique'],
  },

  // ── Cebu Additional ──────────────────────────────────────────────────────────
  'gitc': {
    slug: 'gitc', name: 'GITC (Green International Technological College)', tagline: 'ESL & IELTS & TOEIC | La Paz, Cebu City',
    city: 'La Paz, Cebu City', country: 'Philippines', logo: null, logoText: 'GITC', rating: 4.4, students: '250+', nationality: '10+ ชาติ', founded: 2003,
    photos: [cebuCityImg, campusImg, classroomImg, heroImg, marketing1],
    description: 'GITC (Green International Technological College) สาขาเซบู ก่อตั้งปี 2003 ตั้งอยู่ย่าน La Paz ใจกลาง Cebu City เป็นโรงเรียนที่ได้รับความนิยมจากนักเรียนเอเชีย ครอบคลุมหลักสูตร ESL, IELTS, TOEIC ค่าเรียนประหยัดเมื่อเทียบกับโรงเรียนอื่นในเซบู เหมาะสำหรับผู้ที่ต้องการเรียนในเมืองเซบูด้วยงบประมาณที่ยืดหยุ่น',
    highlights: ['ก่อตั้งปี 2003 ประสบการณ์กว่า 20 ปี', 'หลักสูตร ESL, IELTS, TOEIC ครบครัน', 'ค่าเรียนประหยัดเมื่อเทียบกับโรงเรียนอื่นในเซบู', 'ทำเลดี ใจกลาง Cebu City'],
    facilities: facilitySet,
    programs: [
      { name: 'General English (ESL)', duration: '4–24 สัปดาห์', w4: 26000, w8: 48000, w12: 68000, w24: 120000 },
      { name: 'IELTS Preparation', duration: '8–16 สัปดาห์', w8: 52000, w12: 73000 },
      { name: 'TOEIC Boost', duration: '4–12 สัปดาห์', w4: 27000, w8: 49000, w12: 69000 },
    ],
    roomTypes: [
      { name: 'ห้อง 3 คน (Triple)', persons: '3 คน/ห้อง', pricePerWeek: 3000, amenities: ['แอร์', 'Wi-Fi', 'ห้องน้ำรวม', 'ซักรีดฟรี'] },
      { name: 'ห้องแฝด (Twin)', persons: '2 คน/ห้อง', pricePerWeek: 3800, amenities: ['แอร์', 'Wi-Fi', 'ห้องน้ำในตัว', 'ซักรีดฟรี'] },
      { name: 'ห้องเดี่ยว (Single)', persons: '1 คน/ห้อง', pricePerWeek: 5200, amenities: ['แอร์', 'Wi-Fi', 'ห้องน้ำในตัว', 'ซักรีดฟรี', 'โต๊ะทำงาน'] },
    ],
    timetable: {
      schedules: [
        { courseId: 'esl', courseName: 'ESL General English', courseNameTh: 'ESL ทั่วไป', tag: '1:1×4 | กลุ่ม×3',
          slots: [
            { time: '08:00 – 08:30', activity: 'อาหารเช้า', type: 'meal' },
            { time: '08:30 – 09:20', activity: 'เรียน 1 ต่อ 1 ชั่วโมงที่ 1', type: 'one-on-one' },
            { time: '09:30 – 10:20', activity: 'เรียน 1 ต่อ 1 ชั่วโมงที่ 2', type: 'one-on-one' },
            { time: '10:30 – 11:20', activity: 'เรียน 1 ต่อ 1 ชั่วโมงที่ 3', type: 'one-on-one' },
            { time: '11:30 – 12:20', activity: 'เรียน 1 ต่อ 1 ชั่วโมงที่ 4', type: 'one-on-one' },
            { time: '12:30 – 13:30', activity: 'อาหารกลางวัน', type: 'meal' },
            { time: '13:30 – 14:20', activity: 'เรียนกลุ่ม ชั่วโมงที่ 1', type: 'group' },
            { time: '14:30 – 15:20', activity: 'เรียนกลุ่ม ชั่วโมงที่ 2', type: 'group' },
            { time: '15:30 – 16:20', activity: 'เรียนกลุ่ม ชั่วโมงที่ 3', type: 'group' },
            { time: '16:30 – 18:00', activity: 'เวลาอิสระ', type: 'free' },
            { time: '18:00 – 19:00', activity: 'อาหารเย็น', type: 'meal' },
            { time: '19:00 – 21:00', activity: 'Self-Study (สมัครใจ)', type: 'self-study' },
          ],
        },
      ],
      rules: ['ส่งเสริมการใช้ภาษาอังกฤษในบริเวณโรงเรียน', 'เข้าเรียนตรงเวลา มีวินัยในการเรียน', 'ปฏิบัติตามกฎของหอพักและโรงเรียน'],
      note: 'ตารางอาจมีการปรับเปลี่ยนตามปฏิทินโรงเรียน',
    } as TimetableConfig,
    youtubeId: null, website: 'http://gitc.edu.ph', mapUrl: 'https://www.google.com/maps/search/?api=1&query=GITC+Green+International+Technological+College+La+Paz+Cebu+City+Philippines',
    accent: 'from-green-600 to-emerald-600', tags: ['ESL', 'IELTS', 'TOEIC', 'Affordable'],
  },

  'pines': {
    slug: 'pines', name: 'PINES International Academy', tagline: 'บาเกียว | อากาศเย็น | Sparta เข้มข้น',
    city: 'Baguio City', country: 'Philippines', logo: null, logoText: 'PINES', rating: 4.9, students: '700+', nationality: '15+ ชาติ', founded: 1994,
    photos: [baguioImg, campusImg, classroomImg, heroImg, marketing1],
    description: 'PINES International Academy ตั้งอยู่ที่เมืองบาเกียว ซิตี้ (Baguio City) หรือที่คนไทยเรียกว่าเมืองปาเกียว เมืองบนภูเขาที่อากาศเย็นตลอดปี ระบบ Sparta เข้มข้นช่วยพัฒนาภาษาอังกฤษได้อย่างรวดเร็ว เป็นที่นิยมสูงสุดในหมู่นักเรียนไทย',
    highlights: ['อากาศเย็นสบาย 18-22°C', 'Sparta System เข้มข้น', 'ที่นิยมสูงในหมู่นักเรียนไทย', 'IELTS Focus ผลลัพธ์ดี'],
    facilities: facilitySet,
    programs: [
      { name: 'General English (Sparta)', duration: '4–24 สัปดาห์', w4: 33000, w8: 62000, w12: 88000, w24: 160000 },
      { name: 'IELTS Preparation', duration: '8–16 สัปดาห์', w8: 68000, w12: 95000 },
      { name: 'TOEIC Program', duration: '4–12 สัปดาห์', w4: 34000, w8: 63000, w12: 89000 },
    ],
    roomTypes: [
      { name: 'ห้อง 3 คน (Triple)', persons: '3 คน/ห้อง', pricePerWeek: 3300, amenities: ['เครื่องทำความร้อน', 'Wi-Fi', 'ห้องน้ำรวม', 'ซักรีดฟรี'] },
      { name: 'ห้องคู่ (Double)', persons: '2 คน/ห้อง', pricePerWeek: 4400, amenities: ['เครื่องทำความร้อน', 'Wi-Fi', 'ห้องน้ำในตัว', 'ซักรีดฟรี'] },
      { name: 'ห้องเดี่ยว (Single)', persons: '1 คน/ห้อง', pricePerWeek: 5900, amenities: ['เครื่องทำความร้อน', 'Wi-Fi', 'ห้องน้ำในตัว', 'ซักรีดฟรี', 'โต๊ะทำงาน'] },
    ],
    timetable: {
      schedules: [
        { courseId: 'pines-sparta-esl', courseName: 'General English (Full Sparta)', courseNameTh: 'Full Sparta ESL', tag: '1:1×4 | กลุ่ม×4',
          slots: [
            { time: '07:00 – 07:30', activity: 'อาหารเช้า (อากาศเย็น 18–22°C)', type: 'meal' },
            { time: '07:30 – 08:20', activity: 'ESL 1:1 · Grammar & Speaking 1', type: 'one-on-one' },
            { time: '08:30 – 09:20', activity: 'ESL 1:1 · Vocabulary & Usage 2', type: 'one-on-one' },
            { time: '09:30 – 10:20', activity: 'ESL 1:1 · Listening & Pronunciation 3', type: 'one-on-one' },
            { time: '10:30 – 11:20', activity: 'ESL 1:1 · Free Speaking Practice 4', type: 'one-on-one' },
            { time: '11:30 – 12:30', activity: 'อาหารกลางวัน (English Only Zone)', type: 'meal' },
            { time: '12:30 – 13:20', activity: 'กลุ่ม · Conversation & Discussion', type: 'group' },
            { time: '13:30 – 14:20', activity: 'กลุ่ม · Listening Comprehension', type: 'group' },
            { time: '14:30 – 15:20', activity: 'กลุ่ม · Grammar Workshop', type: 'group' },
            { time: '15:30 – 16:20', activity: 'กลุ่ม · Writing Skills', type: 'group' },
            { time: '16:30 – 19:00', activity: 'เวลาอิสระ', type: 'free' },
            { time: '19:00 – 20:00', activity: 'อาหารเย็น', type: 'meal' },
            { time: '19:00 – 22:30', activity: 'Self-Study บังคับ (Full Sparta) 19:00–22:30', type: 'self-study' },
          ],
        },
        { courseId: 'pines-sparta-ielts', courseName: 'IELTS Preparation (Full Sparta)', courseNameTh: 'Full Sparta IELTS', tag: '1:1×4 | กลุ่ม×4',
          slots: [
            { time: '07:00 – 07:30', activity: 'อาหารเช้า (อากาศเย็น 18–22°C)', type: 'meal' },
            { time: '07:30 – 08:20', activity: 'IELTS 1:1 · Speaking Mock Test 1', type: 'one-on-one' },
            { time: '08:30 – 09:20', activity: 'IELTS 1:1 · Reading & Skimming 2', type: 'one-on-one' },
            { time: '09:30 – 10:20', activity: 'IELTS 1:1 · Writing Task 1 & 2 (3)', type: 'one-on-one' },
            { time: '10:30 – 11:20', activity: 'IELTS 1:1 · Listening Strategies 4', type: 'one-on-one' },
            { time: '11:30 – 12:30', activity: 'อาหารกลางวัน (English Only Zone)', type: 'meal' },
            { time: '12:30 – 13:20', activity: 'IELTS กลุ่ม · Listening Practice', type: 'group' },
            { time: '13:30 – 14:20', activity: 'IELTS กลุ่ม · Reading Strategies', type: 'group' },
            { time: '14:30 – 15:20', activity: 'IELTS กลุ่ม · Writing Workshop', type: 'group' },
            { time: '15:30 – 16:20', activity: 'IELTS กลุ่ม · Speaking Clinic', type: 'group' },
            { time: '16:30 – 19:00', activity: 'เวลาอิสระ', type: 'free' },
            { time: '19:00 – 20:00', activity: 'อาหารเย็น', type: 'meal' },
            { time: '19:00 – 22:30', activity: 'Self-Study บังคับ (Full Sparta) 19:00–22:30', type: 'self-study' },
          ],
        },
      ],
      rules: [
        'Full Sparta: Self-Study บังคับ 19:00–22:30 น. ทุกวันจันทร์–ศุกร์',
        'เคอร์ฟิว 22:30 น. ต้องอยู่ในหอพักหลัง 22:30',
        'English Only Zone ทั่วทั้งแคมปัส ห้ามพูดภาษาอื่นโดยเด็ดขาด',
        'ห้ามออกนอกแคมปัสหลังเวลาเรียน โดยไม่ได้รับอนุญาต',
        'เข้าเรียนตรงเวลา ขาดเรียนมีผลต่อสถานะนักเรียน',
      ],
      note: 'PINES บาเกียว ก่อตั้งปี 1994 — Full Sparta เข้มข้นที่สุดในฟิลิปปินส์ · Self-Study บังคับ 19:00–22:30 · เคอร์ฟิว 22:30 · English Only Zone ทั้งแคมปัส · ที่นิยมสูงสุดในหมู่นักเรียนไทย',
    } as TimetableConfig,
    youtubeId: null, website: 'https://pinesacademy.com', mapUrl: 'https://www.google.com/maps/search/?api=1&query=PINES+International+Academy+Baguio+City+Philippines',
    accent: 'from-teal-700 to-emerald-700', tags: ['Sparta', 'Baguio', 'Cool Weather', 'IELTS'],
  },
};

// Merge extra school data from separate files (Cebu pt2, Baguio, Clark+Manila)
Object.assign(schoolsData, schoolsCebu2, schoolsBaguio2, schoolsOther);

// ── Normalize timetable format from extra school files ────────────
// Extra files may use {name, items[]} format; CourseTimetable needs {courseId, courseName, courseNameTh, tag, slots[{type}]}
function _inferSlotType(activity: string): string {
  const a = activity.toLowerCase();
  if (a.includes('1:1') || a.includes('ต่อตัว') || a.includes('individual')) return 'one-on-one';
  if (a.includes('กลุ่ม') || a.includes('group')) return 'group';
  if (a.includes('อาหาร') || a.includes('พักกลางวัน') || a.includes('เช้า') || a.includes('เย็น') || a.includes('dinner') || a.includes('lunch') || a.includes('breakfast')) return 'meal';
  if (a.includes('self-study') || a.includes('ติวเอง') || a.includes('ทบทวน') || a.includes('self study')) return 'self-study';
  return 'free';
}
function _normalizeTimetable(t: any): any {
  if (!t?.schedules) return t;
  return {
    ...t,
    schedules: t.schedules.map((sch: any, i: number) => {
      // Already in correct format
      if (sch.slots && sch.courseId) return sch;
      // Legacy format: {name, items[]}
      const id = (sch.courseId ?? sch.id ?? `course-${i}`).toString().toLowerCase().replace(/\s+/g, '-');
      const nameEn = sch.courseName ?? sch.name ?? `Course ${i + 1}`;
      const nameTh = sch.courseNameTh ?? sch.nameTh ?? nameEn;
      const rawItems: any[] = sch.slots ?? sch.items ?? [];
      return {
        courseId: id,
        courseName: nameEn,
        courseNameTh: nameTh,
        tag: sch.tag ?? nameEn,
        slots: rawItems.map((slot: any) => ({
          time: slot.time ?? '',
          activity: slot.activity ?? slot.label ?? '',
          type: slot.type ?? _inferSlotType(slot.activity ?? slot.label ?? ''),
        })),
      };
    }),
  };
}

// ── Auto-populate richRooms + facilityItems for schools without them ──
const _stdFacilities = commonFacilityItems();
Object.values(schoolsData).forEach((s: any) => {
  if (!s.facilityItems) s.facilityItems = _stdFacilities;
  if (!s.richRooms && s.roomTypes?.length > 0) s.richRooms = makeRichRooms(s.roomTypes, s.photos);
  // Normalize timetable format (extra files use legacy {name,items} structure)
  if (s.timetable) s.timetable = _normalizeTimetable(s.timetable);
});

// ── Slug → matching keywords for filtering related posts ──────────
const SCHOOL_KEYWORDS: Record<string, string[]> = {
  'cia':        ['CIA', 'Cebu International Academy'],
  'qq-english': ['QQ English', 'QQ'],
  'philinter':  ['Philinter'],
  'b-cebu':     ["B'Cebu", 'BCebu'],
  'bcebu':      ["B'Cebu", 'BCebu', 'Baguio'],
  'cpils':      ['CPILS'],
  'ev-academy':          ['EV Academy'],
  'smeag':               ['SMEAG'],
  'pines':               ['PINES'],
  'we-academy-iloilo':   ['We Academy', 'We Academy Iloilo'],
  'gitc-iloilo':         ['GITC', 'Green International Technological College', 'Iloilo'],
  'mk-education-iloilo': ['MK Education', 'Iloilo'],
  'pia-iloilo':          ['PIA', 'Polyglot International Academy', 'Iloilo'],
  'columbus-english':    ['Columbus English Academy', 'Columbus'],
  'gitc':                ['GITC', 'Green International Technological College', 'Cebu'],
  // Cebu (extra)
  'english-fella':   ['English Fella'],
  'cpi':             ['CPI', 'Cebu Pelis'],
  'cella':           ['CELLA'],
  'cg-academy':      ['CG Academy'],
  'ims-academy':     ['IMS Academy'],
  'glc-english':     ['GLC English', 'GLC'],
  'ibreeze':         ['I.BREEZE', 'IBREEZE'],
  'winning-english': ['Winning English', 'Winning'],
  'genius-english':  ['Genius English', 'Genius'],
  '3d-academy':      ['3D Academy', '3D'],
  'idea-english':    ['IDEA English', 'IDEA'],
  'btes':            ['BTES'],
  // Baguio (extra)
  'beci':            ['BECI'],
  'monol':           ['MONOL'],
  'help-english':    ['HELP English', 'HELP'],
  'jic-academy':     ['JIC Academy', 'JIC'],
  'aj-academy':      ['A&J Academy', 'AJ Academy'],
  'wales-english':   ['WALES English', 'WALES'],
  'cns-academy':     ['CNS Academy', 'CNS'],
  'cip-english':     ['CIP English', 'CIP'],
  'eg-academy':      ['EG Academy'],
  // Clark
  'hana-academy':    ['HANA Academy', 'HANA'],
  'we-academy':      ['WE Academy Clark', 'WE Academy'],
  'gs-academy':      ['GS Academy', 'NELS'],
  'mk-education':    ['MK Education Clark', 'MK'],
  // Manila
  'e-room':          ['E-Room'],
  'lslc':            ['LSLC'],
  'enderun':         ['Enderun'],
  'wesli':           ['WESLI'],
};

// ─── Component ────────────────────────────────────────────────────
export default function SchoolDetail() {
  const siteSettings = useSettings();
  const LINE_URL = siteSettings.line_url || 'https://lin.ee/zmlkhOn0';
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? '';
  const baseSchool = schoolsData[slug];

  // Fetch live pricingConfig from DB and merge photo URLs + full pricing
  const [livePhotos, setLivePhotos] = useState<Record<string, string[]>>({});
  const [liveBannerPhotos, setLiveBannerPhotos] = useState<string[]>([]);
  const [liveDescription, setLiveDescription] = useState<string>('');
  const [liveFacilities, setLiveFacilities] = useState<{ id: string; labelTh: string; label: string; emoji: string; photoUrl: string; descriptionTh?: string }[]>([]);
  const [livePricingConfig, setLivePricingConfig] = useState<PricingConfig | null>(null);
  const [liveTimetable, setLiveTimetable] = useState<TimetableConfig | null>(null);
  // Videos tracked independently so they always show even when livePricingConfig is null
  const [liveSchoolVideos, setLiveSchoolVideos] = useState<{ id: string; type: 'youtube' | 'upload'; url: string; youtubeId?: string; titleTh?: string; title?: string }[]>([]);
  const [showQuotation, setShowQuotation] = useState(false);
  const [liveSeo, setLiveSeo] = useState<{
    seoTitle?: string; seoDescription?: string; seoKeywords?: string;
    seoH1Override?: string; seoMarketingMeta?: string;
  }>({});

  // Per-school SEO meta — uses live DB values with fallback to school name/tagline
  useSeoMeta(
    liveSeo.seoTitle || (baseSchool ? `${baseSchool.name} — เรียนภาษาอังกฤษที่ฟิลิปปินส์ | Philingo` : 'Philingo'),
    liveSeo.seoDescription || baseSchool?.tagline || 'เรียนภาษาอังกฤษที่ฟิลิปปินส์กับ Philingo ที่ปรึกษาอันดับ 1 ของไทย',
    liveSeo.seoKeywords || undefined,
  );

  useEffect(() => {
    if (!slug) return;
    const BASE = (import.meta.env.BASE_URL ?? '').replace(/\/$/, '');
    fetch(`${BASE}/api/schools/${slug}`, { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then((data: { pricingConfig?: any; timetableConfig?: any; photos?: string[];
        descriptionTh?: string;
        seoTitle?: string; seoDescription?: string; seoKeywords?: string;
        seoH1Override?: string; seoMarketingMeta?: string; } | null) => {
        if (!data) return;
        // Live description from CMS
        if (data.descriptionTh) setLiveDescription(data.descriptionTh);
        // Extract live SEO fields
        if (data.seoTitle || data.seoDescription || data.seoKeywords || data.seoH1Override || data.seoMarketingMeta) {
          setLiveSeo({
            seoTitle: data.seoTitle ?? undefined,
            seoDescription: data.seoDescription ?? undefined,
            seoKeywords: data.seoKeywords ?? undefined,
            seoH1Override: data.seoH1Override ?? undefined,
            seoMarketingMeta: data.seoMarketingMeta ?? undefined,
          });
        }
        // Live banner photos from DB (uploaded via admin → object storage)
        if (Array.isArray(data.photos) && data.photos.length > 0) {
          setLiveBannerPhotos(data.photos);
        }
        // Live timetable from DB
        if (data.timetableConfig?.schedules?.length) {
          setLiveTimetable(data.timetableConfig);
        }
        if (!data?.pricingConfig) return;
        const pc = data.pricingConfig;
        // Always track videos independently of whether calculator data exists
        if (Array.isArray(pc.videos) && pc.videos.length > 0) {
          setLiveSchoolVideos(pc.videos);
        }
        // If the DB config has full calculator data, use it directly
        // Note: rooms may be empty for bundled-package schools (e.g. QQ English)
        if (pc.courses?.length) {
          setLivePricingConfig(pc as PricingConfig);
        }
        // Merge room photos: roomId → photos[]
        const photoMap: Record<string, string[]> = {};
        (pc.rooms ?? []).forEach((r: any) => {
          if (r.photos?.length > 0) photoMap[r.id] = r.photos;
        });
        if (Object.keys(photoMap).length > 0) setLivePhotos(photoMap);
        // Merge facility photos
        if (pc.facilityPhotos?.length > 0) setLiveFacilities(pc.facilityPhotos);
      })
      .catch(() => {});
  }, [slug]);

  // Merge live data into school object
  const school = baseSchool ? {
    ...baseSchool,
    // Use live banner photos from DB when available (overrides hardcoded static images)
    photos: liveBannerPhotos.length > 0 ? liveBannerPhotos : baseSchool.photos,
    // Use live pricingConfig from DB when available (overrides hardcoded)
    pricingConfig: livePricingConfig ?? baseSchool.pricingConfig,
    // Use live timetable from DB when available (overrides hardcoded)
    timetable: liveTimetable ?? baseSchool.timetable,
    richRooms: baseSchool.richRooms?.map(r => ({
      ...r,
      photos: livePhotos[r.id]?.length > 0 ? livePhotos[r.id] : r.photos,
    })),
    facilityItems: liveFacilities.length > 0
      ? liveFacilities.map(f => ({ id: f.id, labelTh: f.labelTh, label: f.label, emoji: f.emoji, photo: f.photoUrl, descriptionTh: f.descriptionTh ?? '' }))
      : baseSchool.facilityItems,
  } : baseSchool;

  // (testimonials removed — only review articles shown per school)

  // ── Related posts fetched from API (replaces static data/posts) ──
  const keywords = SCHOOL_KEYWORDS[slug] ?? [];
  const [relatedPosts, setRelatedPosts] = useState<Array<{
    id: number; slug: string; title: string; titleTh: string | null;
    excerpt: string | null; excerptTh: string | null; category: string;
    author: string; authorTh: string | null; coverImageUrl: string | null;
  }>>([]);
  const schoolArticles  = relatedPosts.filter(p => p.category !== 'review');
  const schoolReviewPosts = relatedPosts.filter(p => p.category === 'review');

  // ── Fetch live courses from DB for this school ──────────────────
  const [liveCourses, setLiveCourses] = useState<Array<{
    id: number; titleTh: string; title: string; descriptionTh?: string | null;
    durationTh?: string | null; suitableForTh?: string | null;
    priceDisplayTh?: string | null; features?: string[]; colorClass?: string | null;
    badge?: string | null; badgeTh?: string | null; iconName?: string | null;
    timetableConfig?: {
      tag?: string;
      slots?: Array<{ time: string; activity: string; type: string }>;
      rules?: string[];
      note?: string;
    } | null;
  }>>([]);
  const [expandedCourse, setExpandedCourse] = useState<number | string | null>(null);

  useEffect(() => {
    if (!slug) return;
    const BASE = (import.meta.env.BASE_URL ?? '').replace(/\/$/, '');
    fetch(`${BASE}/api/courses?schoolSlug=${slug}&isActive=true&limit=200`)
      .then(r => r.ok ? r.json() : null)
      .then((data: any) => { if (data?.data?.length) setLiveCourses(data.data); })
      .catch(() => {});
  }, [slug]);

  // ── Preload all banner photos so slide switching is instant ──
  useEffect(() => {
    const photos = school?.photos;
    if (!photos || photos.length <= 1) return;
    // Delay slightly so first image renders before we fire off parallel preloads
    const timer = setTimeout(() => {
      photos.slice(1).forEach(url => {
        const img = new Image();
        img.src = url;
      });
    }, 800);
    return () => clearTimeout(timer);
  }, [school?.photos]);

  // ── Fetch related articles/reviews from API (replaces static data/posts) ──
  useEffect(() => {
    if (!slug || keywords.length === 0) return;
    const BASE = (import.meta.env.BASE_URL ?? '').replace(/\/$/, '');
    fetch(`${BASE}/api/blog?isPublished=true&limit=100`)
      .then(r => r.ok ? r.json() : null)
      .then((data: any) => {
        if (!data?.data) return;
        const filtered = (data.data as Array<{
          id: number; slug: string; title: string; titleTh: string | null;
          excerpt: string | null; excerptTh: string | null; category: string;
          author: string; authorTh: string | null; coverImageUrl: string | null;
        }>).filter(p => {
          const haystack = `${p.title ?? ''} ${p.titleTh ?? ''}`.toLowerCase();
          return keywords.some(kw => haystack.includes(kw.toLowerCase()));
        });
        setRelatedPosts(filtered);
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const [activePhoto, setActivePhoto] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent, total: number) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 40) return;
    if (dx < 0) setActivePhoto(p => Math.min(total - 1, p + 1));
    else setActivePhoto(p => Math.max(0, p - 1));
  };

  if (!school) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
          <div className="text-6xl">🏫</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ไม่พบข้อมูลโรงเรียน</h1>
          <Link href="/schools" className="text-primary hover:underline flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> กลับไปดูโรงเรียนทั้งหมด
          </Link>
        </div>
      </Layout>
    );
  }

  const formatPrice = (n?: number) => n ? `฿${n.toLocaleString()}` : '–';

  return (
    <Layout>
      {/* ── Hero ── */}
      <section className={`bg-gradient-to-br ${school.accent} text-white py-16 relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/30 pointer-events-none" />
        <div className="container max-w-6xl mx-auto px-4 relative z-10">
          {/* Top row: back link + Philingo brand logo */}
          <div className="flex items-center justify-between mb-6">
            <Link href="/schools" className="inline-flex items-center gap-1.5 text-white/80 hover:text-white text-sm transition-colors">
              <ArrowLeft className="w-4 h-4" /> โรงเรียนทั้งหมด
            </Link>
            <img src={philingoLogo} alt="Philingo" className="h-7 w-auto brightness-0 invert opacity-80" />
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Logo */}
            <div className="bg-white rounded-2xl p-4 shadow-xl flex-shrink-0 w-28 h-28 flex items-center justify-center">
              {school.logo ? (
                <img src={school.logo} alt={school.name} className="h-16 w-auto object-contain" />
              ) : (
                <div className="font-black text-2xl text-gray-800">{school.logoText}</div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-3">
                {school.tags.map((t, i) => (
                  <span key={i} className="bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full font-medium">{t}</span>
                ))}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{liveSeo.seoH1Override || school.name}</h1>
              <p className="text-white/90 text-lg mb-4">{school.tagline}</p>
              <div className="flex flex-wrap items-center gap-5 text-white/90 text-sm">
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{school.city}, {school.country}</span>
                <span className="flex items-center gap-1.5"><Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />{school.rating} / 5.0</span>
                <span className="flex items-center gap-1.5"><Users className="w-4 h-4" />{school.students} นักเรียน</span>
                <span className="flex items-center gap-1.5"><Globe className="w-4 h-4" />{school.nationality}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Photo Gallery ── */}
      <section className="bg-gray-900">
        <div
          className="relative w-full overflow-hidden"
          style={{ maxHeight: 'min(500px, 60vw)' }}
          onTouchStart={handleTouchStart}
          onTouchEnd={(e) => handleTouchEnd(e, school.photos.length)}
        >
          <img
            src={school.photos[activePhoto]}
            alt={`${school.name} ${activePhoto + 1}`}
            className="w-full object-cover transition-all duration-500"
            style={{ maxHeight: 'min(500px, 60vw)', minHeight: '200px' }}
            loading={activePhoto === 0 ? 'eager' : 'lazy'}
            fetchPriority={activePhoto === 0 ? 'high' : 'auto'}
            decoding="async"
          />
          {/* Nav arrows */}
          <button
            onClick={() => setActivePhoto(p => Math.max(0, p - 1))}
            disabled={activePhoto === 0}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-10 h-10 rounded-full flex items-center justify-center transition disabled:opacity-30"
          ><ChevronLeft className="w-5 h-5" /></button>
          <button
            onClick={() => setActivePhoto(p => Math.min(school.photos.length - 1, p + 1))}
            disabled={activePhoto === school.photos.length - 1}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-10 h-10 rounded-full flex items-center justify-center transition disabled:opacity-30"
          ><ChevronRight className="w-5 h-5" /></button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {school.photos.map((_, i) => (
              <button key={i} onClick={() => setActivePhoto(i)}
                className={`w-2 h-2 rounded-full transition-all ${i === activePhoto ? 'bg-white w-6' : 'bg-white/50'}`} />
            ))}
          </div>
        </div>
        {/* Thumbnails */}
        <div className="flex gap-2 p-3 overflow-x-auto hide-scrollbar">
          {school.photos.map((p, i) => (
            <button key={i} onClick={() => setActivePhoto(i)}
              className={`shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ${i === activePhoto ? 'border-yellow-400' : 'border-transparent opacity-60 hover:opacity-100'}`}>
              <img src={p} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
      </section>

      {/* ── Sticky Section Nav ── */}
      <div className="sticky top-0 z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="container max-w-6xl mx-auto px-4">
          <nav className="flex overflow-x-auto hide-scrollbar">
            {[
              { id: 'overview', label: 'ภาพรวม', icon: '🏫' },
              { id: 'courses', label: 'หลักสูตร', icon: '📚' },
              { id: 'rooms', label: 'ห้องพัก', icon: '🛏️' },
              { id: 'price', label: 'ราคา', icon: '💰' },
              { id: 'timetable', label: 'ตาราง', icon: '📅' },
              { id: 'reviews', label: 'รีวิว', icon: '⭐' },
            ].map(item => (
              <button key={item.id}
                onClick={() => {
                  const el = document.getElementById(item.id);
                  if (el) { const y = el.getBoundingClientRect().top + window.scrollY - 56; window.scrollTo({ top: y, behavior: 'smooth' }); }
                }}
                className="flex items-center gap-1.5 px-4 py-3.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary border-b-2 border-transparent hover:border-primary transition-all whitespace-nowrap shrink-0">
                <span>{item.icon}</span> {item.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="container max-w-6xl mx-auto px-4 py-12 grid lg:grid-cols-3 gap-8">
        {/* ── Main Content ── */}
        <div className="lg:col-span-2 space-y-10 pr-14 lg:pr-0 min-w-0">

          {/* About */}
          <div id="overview">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">เกี่ยวกับ {school.name}</h2>
            {liveDescription ? (
              <div className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg space-y-4">
                {liveDescription.split('\n\n').map((para, i) =>
                  para.trim() ? (
                    para.startsWith('**') && para.includes('**') ? (
                      <h3 key={i} className="text-lg font-bold text-gray-800 dark:text-gray-200 mt-6">
                        {para.replace(/\*\*/g, '')}
                      </h3>
                    ) : (
                      <p key={i}>{para.trim()}</p>
                    )
                  ) : null
                )}
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">{school.description}</p>
            )}
          </div>

          {/* Highlights */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">🎯 จุดเด่น</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {school.highlights.map((h, i) => (
                <div key={i} className="flex items-start gap-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-xl p-4">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">{h}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Courses Section ── */}
          {(() => {
            const ICON_MAP: Record<string, string> = {
              BookOpen: '📖', GraduationCap: '🎓', Target: '🎯', Briefcase: '💼',
              Stethoscope: '🏥', Star: '⭐', Zap: '⚡', Award: '🏆', Users: '👥',
              Globe: '🌐', Clock: '⏰', MessageCircle: '💬',
            };
            const courseIcon = (name: string | null | undefined) => ICON_MAP[name ?? ''] ?? '📚';
            // Derive accent color from colorClass like "bg-blue-100 text-blue-700" → blue
            const accentBar = (colorClass: string | null | undefined) => {
              const m = (colorClass ?? '').match(/bg-(\w+)-1/);
              const c = m?.[1] ?? 'primary';
              const map: Record<string, string> = {
                blue: 'bg-blue-500', green: 'bg-green-500', purple: 'bg-purple-500',
                orange: 'bg-orange-500', red: 'bg-red-500', yellow: 'bg-yellow-400',
                indigo: 'bg-indigo-500', primary: 'bg-primary',
              };
              return map[c] ?? 'bg-primary';
            };
            // Fallback courses from pricingConfig (USD) when DB has none
            const rate = school.pricingConfig?.exchangeRateUsdThb ?? 33.5;
            const pricingConfigFallback = liveCourses.length === 0 && school.pricingConfig?.courses?.length
              ? school.pricingConfig.courses.map((c: any, idx: number) => ({
                  id: `pc-${idx}` as string | number,
                  titleTh: c.nameTh || c.name,
                  title: c.name,
                  descriptionTh: null as string | null,
                  durationTh: '4-24 สัปดาห์',
                  suitableForTh: null as string | null,
                  // prices are USD → convert to THB per week
                  priceDisplayTh: `เริ่มต้น ฿${Math.round(c.pricePerFourWeeks * rate / 4).toLocaleString()}/สัปดาห์`,
                  features: [] as string[],
                  colorClass: null as string | null,
                  badge: null as string | null,
                  badgeTh: null as string | null,
                  iconName: null as string | null,
                }))
              : [];

            // Second fallback: derive from programs[] (already-in-THB all-in prices)
            const programsFallback = liveCourses.length === 0 && pricingConfigFallback.length === 0 && school.programs?.length
              ? school.programs.map((p: any, idx: number) => {
                  // Pick the shortest-commitment price (w4 > w8 > w12 > w16 > w24)
                  // "starting from" = minimum commitment, not cheapest per-week
                  const durationKeys: [number | undefined, number][] = [
                    [p.w4, 4], [p.w8, 8], [p.w12, 12], [p.w16, 16], [p.w24, 24],
                  ];
                  const first = durationKeys.find(([v]) => v != null);
                  const pw = first ? (first[0] as number) / first[1] : null;
                  return {
                    id: `prog-${idx}` as string | number,
                    titleTh: p.name,
                    title: p.name,
                    descriptionTh: null as string | null,
                    durationTh: p.duration ?? null,
                    suitableForTh: null as string | null,
                    priceDisplayTh: pw ? `เริ่มต้น ฿${Math.round(pw).toLocaleString()}/สัปดาห์ (all-in)` : null,
                    features: [] as string[],
                    colorClass: null as string | null,
                    badge: null as string | null,
                    badgeTh: null as string | null,
                    iconName: null as string | null,
                  };
                })
              : [];

            const pricingFallback = [...pricingConfigFallback, ...programsFallback];
            const displayCourses = liveCourses.length > 0 ? liveCourses : pricingFallback;
            if (displayCourses.length === 0) return null;
            return (
              <div id="courses">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">📚 หลักสูตรที่เปิดสอน</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  เลือกหลักสูตรที่เหมาะกับเป้าหมายของคุณ · คลิกที่หลักสูตรเพื่อดูรายละเอียด
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  {displayCourses.map(course => {
                    const isExpanded = expandedCourse === course.id;
                    const bar = accentBar(course.colorClass);
                    return (
                      <div key={String(course.id)}
                        className={`bg-white dark:bg-gray-800 rounded-2xl border transition-all overflow-hidden cursor-pointer
                          ${isExpanded
                            ? 'border-primary shadow-lg ring-1 ring-primary/20'
                            : 'border-gray-100 dark:border-gray-700 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-500'}`}
                        onClick={() => setExpandedCourse(isExpanded ? null : course.id)}>
                        {/* Color accent bar */}
                        <div className={`h-1.5 ${bar}`} />
                        <div className="p-5">
                          <div className="flex items-start gap-3 mb-3">
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0
                              ${course.colorClass ? course.colorClass.replace('text-', 'text-') : 'bg-primary/10 text-primary'}`}>
                              {courseIcon(course.iconName)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-bold text-gray-900 dark:text-white text-base leading-tight">{course.titleTh}</h3>
                                {(course.badgeTh || course.badge) && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 shrink-0">
                                    {course.badgeTh || course.badge}
                                  </span>
                                )}
                              </div>
                              {course.durationTh && (
                                <p className="text-xs text-gray-400 mt-0.5">⏱ {course.durationTh}</p>
                              )}
                            </div>
                            <span className={`text-gray-400 text-sm transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
                          </div>

                          {/* Price always visible — skip if value is ฿0 (DB row with no price set) */}
                          {course.priceDisplayTh && !/฿\s*0[^0-9]/.test(course.priceDisplayTh) && (
                            <div className="text-sm font-bold text-primary mb-3">{course.priceDisplayTh}</div>
                          )}

                          {/* Expanded details */}
                          {isExpanded && (
                            <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-gray-700 mt-1 animate-in fade-in duration-200">
                              {course.descriptionTh && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{course.descriptionTh}</p>
                              )}
                              {course.suitableForTh && (
                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl px-4 py-3">
                                  <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1">🎯 เหมาะสำหรับ</p>
                                  <p className="text-sm text-blue-900 dark:text-blue-300">{course.suitableForTh}</p>
                                </div>
                              )}
                              {Array.isArray(course.features) && course.features.length > 0 && (
                                <ul className="space-y-1.5">
                                  {course.features.map((f, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                      {f}
                                    </li>
                                  ))}
                                </ul>
                              )}
                              {Boolean((course as unknown as {slug?: string}).slug) && (
                                <Link
                                  href={`/schools/${params.slug}/courses/${(course as unknown as {slug: string}).slug}`}
                                  onClick={e => e.stopPropagation()}
                                  className="flex items-center justify-center gap-2 w-full bg-primary/10 hover:bg-primary/20 text-primary text-sm font-bold py-2.5 rounded-xl transition-colors">
                                  📄 อ่านรายละเอียดคอร์สฉบับเต็ม →
                                </Link>
                              )}
                              <a href={LINE_URL} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                                className="flex items-center justify-center gap-2 w-full bg-[#00B900] hover:bg-[#009900] text-white text-sm font-bold py-2.5 rounded-xl transition-colors mt-2">
                                <SiLine className="w-4 h-4" /> สอบถามหลักสูตรนี้ผ่าน LINE
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* Facilities — photo gallery if available, icon grid fallback */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">🏫 สิ่งอำนวยความสะดวก</h2>
            {school.facilityItems && school.facilityItems.length > 0 ? (
              <FacilitiesGallery facilities={school.facilityItems} />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {school.facilities.map((f, i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 flex items-center gap-3 hover:border-primary transition-colors">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                      <f.icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{f.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Room Types — tabbed viewer if richRooms exists, card grid fallback */}
          <div id="rooms">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">🛏️ ประเภทห้องพัก</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">เลือกดูแต่ละประเภทห้อง · ราคา/สัปดาห์ รวมอาหาร 3 มื้อ + ซักรีด</p>
            {school.richRooms && school.richRooms.length > 0 ? (
              <RoomTypeTabs rooms={school.richRooms} schoolName={school.name} />
            ) : (
              <>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {school.roomTypes.map((room, i) => (
                    <div key={i} className="bg-white/80 backdrop-blur-sm dark:bg-gray-800 rounded-2xl border border-white/80 dark:border-gray-700 p-5 hover:shadow-md transition-all">
                      <div className="flex items-center gap-2 mb-3">
                        <HomeIcon className="w-5 h-5 text-primary shrink-0" />
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-tight">{room.name}</h3>
                      </div>
                      <div className="text-2xl font-black text-primary mb-1">
                        ฿{room.pricePerWeek.toLocaleString()}
                        <span className="text-sm font-normal text-gray-500 dark:text-gray-400">/สัปดาห์</span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">{room.persons}</div>
                      <div className="flex flex-wrap gap-1.5">
                        {room.amenities.map((a, j) => (
                          <span key={j} className="text-[11px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{a}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">* ราคาห้องพักอาจปรับตามฤดูกาล กรุณาสอบถามราคาล่าสุดกับทีม Philingo</p>
              </>
            )}
          </div>

          {/* Mobile-only: Promo CTA — shown above price calculator on mobile, hidden on desktop (lg+) */}
          <div className="lg:hidden bg-gradient-to-br from-primary to-blue-800 text-white rounded-2xl p-6 shadow-xl">
            <div className="text-3xl mb-3">🎁</div>
            <h3 className="text-xl font-bold mb-2">ขอราคาโปรโมชั่น</h3>
            <p className="text-white/80 text-sm mb-5">รับราคาพิเศษและโปรโมชั่นเฉพาะคุณ ผ่าน LINE โดยตรงจากทีม Philingo</p>
            <a
              href={LINE_URL}
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-[#00B900] hover:bg-[#00A000] text-white font-bold py-3.5 rounded-xl transition-all hover:scale-[1.02] shadow-lg mb-3"
            >
              <SiLine className="w-5 h-5" /> ขอราคาโปรโมชั่นผ่าน LINE
            </a>
            <a
              href={LINE_URL}
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium py-3 rounded-xl transition-all border border-white/20 text-sm"
            >
              💬 ปรึกษาฟรีกับทีม Philingo
            </a>
          </div>

          {/* Price Calculator — shown when pricingConfig is set, otherwise fallback table */}
          {school.pricingConfig ? (
            <div id="price">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">🧮 ระบบประเมินค่าใช้จ่ายอัตโนมัติ</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">เลือกหลักสูตร ห้องพัก และระยะเวลา — ระบบประเมินค่าใช้จ่ายรวม Local Fee และอัตราแลกเปลี่ยนให้อัตโนมัติ</p>
              <PriceCalculator config={school.pricingConfig} schoolName={school.name} lineUrl={LINE_URL} />
            </div>
          ) : (
            <div id="price">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">💰 ราคาคอร์สตามระยะเวลา</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">ราคาโดยประมาณ รวมค่าเรียน ที่พัก อาหาร 3 มื้อ (บาท/ระยะเวลา) · ราคาจริงอาจมีการเปลี่ยนแปลง</p>
              {/* Scroll hint for mobile */}
              <p className="text-xs text-gray-400 text-center mb-2 sm:hidden">← เลื่อนดูราคาทุกช่วงสัปดาห์ →</p>
              <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-700">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-primary text-white">
                      <th className="sticky left-0 z-10 bg-primary text-left p-4 rounded-tl-2xl min-w-[120px]">หลักสูตร</th>
                      <th className="p-4 text-center whitespace-nowrap">4 สัปดาห์</th>
                      <th className="p-4 text-center whitespace-nowrap">8 สัปดาห์</th>
                      <th className="p-4 text-center whitespace-nowrap">12 สัปดาห์</th>
                      <th className="p-4 text-center whitespace-nowrap rounded-tr-2xl">24 สัปดาห์</th>
                    </tr>
                  </thead>
                  <tbody>
                    {school.programs.map((prog, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900/40'}>
                        <td className={`sticky left-0 z-10 p-4 font-medium text-gray-900 dark:text-white min-w-[120px] ${i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900/40'}`}>{prog.name}</td>
                        <td className="p-4 text-center text-gray-600 dark:text-gray-400 whitespace-nowrap">{formatPrice(prog.w4)}</td>
                        <td className="p-4 text-center text-gray-600 dark:text-gray-400 whitespace-nowrap">{formatPrice(prog.w8)}</td>
                        <td className="p-4 text-center text-gray-600 dark:text-gray-400 whitespace-nowrap">{formatPrice(prog.w12)}</td>
                        <td className="p-4 text-center text-gray-600 dark:text-gray-400 whitespace-nowrap">{formatPrice(prog.w24)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">* ราคาอาจเปลี่ยนแปลงตามฤดูกาลและโปรโมชั่น ติดต่อ Philingo เพื่อขอราคาโปรโมชั่นล่าสุด</p>
            </div>
          )}

          {/* Quotation button — directly below PriceCalculator (or fallback table) */}
          {school.pricingConfig && (
            <div className="pb-20 sm:pb-0">
              <button
                onClick={() => setShowQuotation(true)}
                className="w-full flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-bold py-3.5 rounded-xl transition-all shadow-md text-sm"
              >
                📄 สร้างใบเสนอราคา
              </button>
            </div>
          )}

          {/* Timetable — built from DB courses; falls back to static school.timetable */}
          {(() => {
            // Build TimetableConfig from liveCourses that have timetableConfig
            const coursesWithTimetable = liveCourses.filter(
              c => c.timetableConfig?.slots && c.timetableConfig.slots.length > 0
            );
            const dbTimetable: TimetableConfig | null = coursesWithTimetable.length > 0 ? {
              schedules: coursesWithTimetable.map(c => ({
                courseId: String(c.id),
                courseName: c.title || c.titleTh,
                courseNameTh: c.titleTh,
                tag: c.timetableConfig!.tag ?? '',
                slots: (c.timetableConfig!.slots ?? []) as any[],
              })),
              rules: coursesWithTimetable.find(c => c.timetableConfig?.rules?.length)?.timetableConfig?.rules,
              note: coursesWithTimetable.find(c => c.timetableConfig?.note)?.timetableConfig?.note,
            } : null;
            const timetable = dbTimetable ?? school.timetable ?? null;
            return (
              <div id="timetable">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">🗓️ ตารางเรียนรายวัน</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  ตัวอย่างตารางเรียนทั่วไป (วันจันทร์–ศุกร์) · เลือกดูตามประเภทหลักสูตร
                </p>
                {timetable ? (
                  <CourseTimetable config={timetable} />
                ) : (
                  <div className="rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-10 text-center text-gray-400 dark:text-gray-600">
                    <div className="text-4xl mb-3">📅</div>
                    <p className="font-medium text-sm">ตารางเรียนจะแสดงที่นี่เมื่อแอดมินกรอกข้อมูลผ่านหลังบ้าน</p>
                    <p className="text-xs mt-1">ติดต่อ Philingo เพื่อสอบถามตารางเรียนโดยตรง</p>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ─── Video Section ─── */}
          {(() => {
            // liveSchoolVideos: set directly from API (independent of livePricingConfig)
            // Fallback: pricingConfig.videos from whichever config is active
            type VItem = { id: string; type: 'youtube' | 'upload'; url: string; youtubeId?: string; titleTh?: string; title?: string; };
            const dbVideos: VItem[] = liveSchoolVideos.length > 0
              ? liveSchoolVideos
              : ((school.pricingConfig as any)?.videos ?? []);
            // Legacy fallback: youtubeId on school
            // Support full YouTube URLs in legacy youtubeId field (e.g. https://youtu.be/xxx or watch?v=xxx)
            const rawYtId = school.youtubeId ?? '';
            const extractedYtId = rawYtId.match(/(?:v=|youtu\.be\/|embed\/|shorts\/|live\/)([A-Za-z0-9_-]{11})/)?.[1]
              ?? (rawYtId.length === 11 ? rawYtId : null);
            const legacyYtId = extractedYtId && !dbVideos.some(v => v.youtubeId === extractedYtId) ? extractedYtId : null;
            const allVideos: VItem[] = [
              ...dbVideos,
              ...(legacyYtId ? [{ id: 'legacy_yt', type: 'youtube' as const, url: `https://www.youtube.com/watch?v=${legacyYtId}`, youtubeId: legacyYtId }] : []),
            ];

            return (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">🎥 วีดีโอแนะนำ</h2>
                {allVideos.length === 0 ? (
                  <div className="rounded-2xl overflow-hidden aspect-video bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center gap-3 text-gray-400">
                    <Play className="w-12 h-12" />
                    <p className="font-medium">วีดีโอแนะนำโรงเรียน</p>
                    <p className="text-sm">ติดต่อ Philingo เพื่อดูวีดีโอแนะนำโรงเรียน</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {allVideos.map((v, idx) => (
                      <VideoPlayer key={v.id} video={v} index={idx} />
                    ))}
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-5 min-w-0">
          {/* Download / Quotation CTA — hidden on mobile (shown above price calculator instead) */}
          <div className="hidden lg:block bg-gradient-to-br from-primary to-blue-800 text-white rounded-2xl p-6 shadow-xl">
            <div className="text-3xl mb-3">🎁</div>
            <h3 className="text-xl font-bold mb-2">ขอราคาโปรโมชั่น</h3>
            <p className="text-white/80 text-sm mb-5">รับราคาพิเศษและโปรโมชั่นเฉพาะคุณ ผ่าน LINE โดยตรงจากทีม Philingo</p>
            <a
              href={LINE_URL}
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-[#00B900] hover:bg-[#00A000] text-white font-bold py-3.5 rounded-xl transition-all hover:scale-[1.02] shadow-lg mb-3"
            >
              <SiLine className="w-5 h-5" /> ขอราคาโปรโมชั่นผ่าน LINE
            </a>
            <a
              href={LINE_URL}
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium py-3 rounded-xl transition-all border border-white/20 text-sm"
            >
              💬 ปรึกษาฟรีกับทีม Philingo
            </a>
          </div>

          {/* Contact Strip */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 space-y-3">
            <h3 className="font-bold text-gray-900 dark:text-white">ติดต่อ Philingo</h3>
            <a href={`tel:${(siteSettings.phone || '061-6564159').replace(/[^0-9]/g, '')}`} className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Phone className="w-4 h-4 text-primary" />
              </div>
              {siteSettings.phone || '061-656-4159'}
            </a>
            <a href={LINE_URL} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 hover:text-[#00B900] transition-colors">
              <div className="w-8 h-8 bg-[#00B900]/10 rounded-lg flex items-center justify-center">
                <SiLine className="w-4 h-4 text-[#00B900]" />
              </div>
              LINE: {siteSettings.line_id || '@philingo'}
            </a>
          </div>

          {/* School Website */}
          <a
            href={school.website}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-3 rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700 w-full"
          >
            <Globe className="w-4 h-4" /> เว็บไซต์โรงเรียน
          </a>

          {/* Map */}
          <a
            href={school.mapUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-3 rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700 w-full"
          >
            <MapPin className="w-4 h-4 text-red-500" /> ดูบนแผนที่ Google Maps
          </a>

          {/* Stats Card */}
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 grid grid-cols-2 gap-4">
            {[
              { label: 'ก่อตั้งปี', value: school.founded },
              { label: 'นักเรียน', value: school.students },
              { label: 'สัญชาติ', value: school.nationality },
              { label: 'คะแนน', value: `⭐ ${school.rating}` },
            ].map((stat, i) => (
              <div key={i} className="text-center p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                <div className="font-bold text-lg text-gray-900 dark:text-white">{stat.value}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Related Articles (articles only) ── */}
      {schoolArticles.length > 0 && (
        <section className="py-16 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800">
          <div className="container max-w-6xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">📝 บทความแนะนำ</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">ข้อมูลเชิงลึกเกี่ยวกับ {school.name}</p>
            <div className="grid md:grid-cols-3 gap-6">
              {schoolArticles.map(post => {
                const cover = post.coverImageUrl || `https://picsum.photos/seed/${post.slug}/800/450`;
                const title  = post.titleTh || post.title;
                const excerpt = post.excerptTh || post.excerpt || '';
                return (
                  <Link key={post.id} href={`/posts/${post.slug}`}
                    className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md hover:-translate-y-0.5 transition-all group">
                    <div className="h-44 overflow-hidden">
                      <img src={cover} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" decoding="async" />
                    </div>
                    <div className="p-5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">📖 บทความ</span>
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-snug mt-2 mb-2 group-hover:text-primary transition-colors">{title}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{excerpt}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Review Articles ── */}
      {schoolReviewPosts.length > 0 && (
        <section id="reviews" className="py-16 bg-gradient-to-b from-amber-50 to-white dark:from-amber-900/10 dark:to-gray-900 border-t border-amber-100 dark:border-amber-900/20">
          <div className="container max-w-6xl mx-auto px-4">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-xs font-bold mb-4">
                ⭐ รีวิวจากนักเรียนจริง
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                บทความรีวิว {school.name}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                ประสบการณ์จริงจากนักเรียนไทยที่เคยเรียนที่นี่
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {schoolReviewPosts.map(post => {
                const cover  = post.coverImageUrl || `https://picsum.photos/seed/${post.slug}/800/450`;
                const title  = post.titleTh || post.title;
                const excerpt = post.excerptTh || post.excerpt || '';
                const author = post.authorTh || post.author || 'นักเรียน';
                return (
                  <Link key={post.id} href={`/posts/${post.slug}`}
                    className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-amber-100 dark:border-amber-900/20 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                    <div className="h-36 overflow-hidden">
                      <img src={cover} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" decoding="async" />
                    </div>
                    <div className="p-4">
                      <div className="flex gap-0.5 mb-2">
                        {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
                      </div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-snug mb-2 group-hover:text-primary transition-colors">{title}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{excerpt}</p>
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50 dark:border-gray-700">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0">{author[0]}</div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{author}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Other Schools Carousel ── */}
      <SchoolCarousel currentSlug={slug} />

      {/* ── Bottom CTA ── */}
      <section className="py-16 bg-primary text-white">
        <div className="container max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">สนใจเรียนที่ {school.name}?</h2>
          <p className="text-white/80 mb-8">ทีม Philingo พร้อมช่วยวางแผนและแนะนำหลักสูตรที่เหมาะกับคุณโดยไม่มีค่าใช้จ่าย</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href={LINE_URL} target="_blank" rel="noreferrer"
              className="flex items-center justify-center gap-2 bg-[#00B900] hover:bg-[#00A000] text-white font-bold px-8 py-4 rounded-xl transition-all hover:scale-105 shadow-xl">
              <SiLine className="w-5 h-5" /> ปรึกษาฟรีผ่าน LINE
            </a>
            <Link href="/register"
              className="flex items-center justify-center gap-2 bg-secondary text-secondary-foreground font-bold px-8 py-4 rounded-xl transition-all hover:scale-105 shadow-xl">
              สมัครเรียนเลย
            </Link>
          </div>
        </div>
      </section>

      {/* ── Quotation Modal ── */}
      {showQuotation && school.pricingConfig && (
        <QuotationModal
          school={{ name: school.name, city: school.city, pricingConfig: school.pricingConfig as any }}
          contactInfo={{ phone: siteSettings.phone, lineId: siteSettings.line_id, lineUrl: LINE_URL, website: siteSettings.website || 'www.philingo.com' }}
          onClose={() => setShowQuotation(false)}
        />
      )}
    </Layout>
  );
}
