import React, { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import { Layout } from '@/components/layout/Layout';
import { useSeoMeta } from '@/hooks/use-seo-meta';
import { Link } from 'wouter';
import {
  MapPin, Sun, Thermometer, Star, ArrowRight, Globe, Building2,
  Plane, Clock, ChevronRight, Users, BookOpen, Award, ExternalLink,
  ShieldCheck, Home, Coffee, Wifi,
} from 'lucide-react';
import cebuImg    from '@assets/city-photos/cebu.jpg';
import baguioImg  from '@assets/city-photos/baguio.jpg';
import clarkImg   from '@assets/city-photos/clark.jpg';
import manilaImg  from '@assets/city-photos/manila.jpg';
import iloiloImg  from '@assets/city-photos/iloilo.jpg';

// ── City meta ──────────────────────────────────────────────────────
interface CityMeta {
  slug: string; nameTh: string; nameEn: string; tagline: string; description: string;
  climate: string; temp: string; flightTime: string; highlight: string; photo: string;
  accent: string; accentText: string; emoji: string;
  facts: Array<{ icon: React.ReactNode; label: string; value: string }>;
  pros: string[];
}

const CITY_META: Record<string, CityMeta> = {
  cebu: {
    slug: 'cebu', nameTh: 'เซบู', nameEn: 'Cebu City',
    tagline: 'เมืองหลักแห่งการเรียนอังกฤษในฟิลิปปินส์',
    description: 'เซบูคือจุดหมายอันดับ 1 ของนักเรียนไทยที่ต้องการเรียนภาษาอังกฤษในฟิลิปปินส์ ด้วยโรงเรียนภาษาที่มีตัวเลือกมากที่สุด หาดทรายสวยงาม และสภาพแวดล้อมที่คุ้นเคย สภาพอากาศร้อนเขตร้อน เหมาะกับนักเรียนที่ต้องการประสบการณ์เต็มรูปแบบทั้งการเรียนและการใช้ชีวิต',
    climate: 'ร้อนชื้น ☀️', temp: '28–32°C ตลอดปี', flightTime: '~3.5 ชม. จากกรุงเทพฯ', highlight: '19 สถาบัน',
    photo: cebuImg, accent: 'from-blue-600 to-cyan-500', accentText: 'blue', emoji: '🏖️',
    facts: [
      { icon: <Building2 className="w-5 h-5" />, label: 'สถาบัน', value: '19 แห่ง' },
      { icon: <Users className="w-5 h-5" />, label: 'นักเรียนต่อปี', value: '10,000+' },
      { icon: <Thermometer className="w-5 h-5" />, label: 'อุณหภูมิเฉลี่ย', value: '30°C' },
      { icon: <Plane className="w-5 h-5" />, label: 'เวลาบิน', value: '~3.5 ชม.' },
    ],
    pros: [
      'โรงเรียนให้เลือกมากที่สุด ทุกระดับและงบ',
      'ทำเลดี — IT Park, Mactan, ใจกลางเมือง',
      'ชายหาดสวยงาม เที่ยวช่วง Weekend ได้',
      'ค่าครองชีพต่ำ อาหารอร่อย หลากหลาย',
      'เดินทางง่าย บินตรงจากกรุงเทพฯ',
    ],
  },
  baguio: {
    slug: 'baguio', nameTh: 'บาเกียว', nameEn: 'Baguio City',
    tagline: 'เมืองภูเขา อากาศเย็น เรียนสบายตลอดปี',
    description: 'บาเกียว (หรือ "ปาเกียว" ที่คนไทยนิยมเรียก) คือเมืองบนภูเขาที่ความสูง 1,500 เมตร อากาศเย็นสบายตลอดปีเฉลี่ย 18–22°C ทำให้สมาธิในการเรียนดีกว่า ค่าครองชีพต่ำกว่าเซบู เหมาะกับผู้ที่ไม่ชอบอากาศร้อน',
    climate: 'เย็นสบาย ⛰️', temp: '18–22°C ตลอดปี', flightTime: '~3 ชม. จากกรุงเทพฯ (ผ่านมะนิลา)', highlight: '11 สถาบัน',
    photo: baguioImg, accent: 'from-teal-600 to-emerald-500', accentText: 'teal', emoji: '🏔️',
    facts: [
      { icon: <Building2 className="w-5 h-5" />, label: 'สถาบัน', value: '11 แห่ง' },
      { icon: <Thermometer className="w-5 h-5" />, label: 'อุณหภูมิ', value: '18–22°C' },
      { icon: <Plane className="w-5 h-5" />, label: 'เวลาบิน', value: '~3 ชม.' },
      { icon: <Clock className="w-5 h-5" />, label: 'จากมะนิลา', value: '6 ชม. (รถ)' },
    ],
    pros: [
      'อากาศเย็นสบาย เรียนได้สมาธิ ไม่ง่วงเพราะความร้อน',
      'ค่าครองชีพต่ำกว่าเซบู 20–30%',
      'บรรยากาศสงบ เหมาะกับการเรียน Sparta เข้มข้น',
      'ธรรมชาติสวยงาม Burnham Park, Mines View',
      'นักเรียนไทยรีวิวดีที่สุด — รู้สึก "ปลอดภัย"',
    ],
  },
  clark: {
    slug: 'clark', nameTh: 'คลาร์ก', nameEn: 'Clark, Pampanga',
    tagline: 'อดีตฐานทัพอากาศสหรัฐฯ บรรยากาศนานาชาติ',
    description: 'คลาร์ก (Clark Freeport Zone) ตั้งอยู่ใน Angeles City จังหวัด Pampanga อดีตฐานทัพอากาศสหรัฐฯ ที่ปัจจุบันกลายเป็นเขตเศรษฐกิจพิเศษ บรรยากาศนานาชาติ สะอาด ปลอดภัย ค่าครองชีพปานกลาง',
    climate: 'ร้อน แต่ลมดี 🌬️', temp: '25–33°C', flightTime: '~3 ชม. จากกรุงเทพฯ (สนามบิน Clark)', highlight: '4 สถาบัน',
    photo: clarkImg, accent: 'from-orange-500 to-amber-500', accentText: 'orange', emoji: '✈️',
    facts: [
      { icon: <Building2 className="w-5 h-5" />, label: 'สถาบัน', value: '4 แห่ง' },
      { icon: <Globe className="w-5 h-5" />, label: 'บรรยากาศ', value: 'นานาชาติ' },
      { icon: <Plane className="w-5 h-5" />, label: 'บินตรงจาก BKK', value: 'มีเส้นทาง' },
      { icon: <Clock className="w-5 h-5" />, label: 'จากมะนิลา', value: '~2 ชม. (รถ)' },
    ],
    pros: [
      'สนามบินนานาชาติของตัวเอง (Clark International Airport)',
      'บรรยากาศตะวันตก สะอาด ปลอดภัย',
      'ค่าครองชีพต่ำกว่ามะนิลาและเซบู',
      'ใกล้สถานที่ท่องเที่ยว Mount Pinatubo, Subic Bay',
      'เหมาะกับผู้ที่ไม่ต้องการอยู่ในเมืองใหญ่',
    ],
  },
  manila: {
    slug: 'manila', nameTh: 'มะนิลา', nameEn: 'Metro Manila',
    tagline: 'เมืองหลวงฟิลิปปินส์ ศูนย์กลางธุรกิจและวัฒนธรรม',
    description: 'มะนิลา (Metro Manila) คือเมืองหลวงและศูนย์กลางเศรษฐกิจของฟิลิปปินส์ มีโรงเรียนภาษาอังกฤษหลายแห่งที่ผสานการเรียนกับประสบการณ์ใช้ชีวิตในมหานคร เหมาะสำหรับผู้ที่ต้องการ Business English ระดับสากล',
    climate: 'ร้อนชื้น 🌆', temp: '25–35°C', flightTime: '~3 ชม. จากกรุงเทพฯ (บินตรง)', highlight: '4 สถาบัน',
    photo: manilaImg, accent: 'from-purple-600 to-indigo-600', accentText: 'purple', emoji: '🌆',
    facts: [
      { icon: <Building2 className="w-5 h-5" />, label: 'สถาบัน', value: '4 แห่ง' },
      { icon: <Globe className="w-5 h-5" />, label: 'ประชากร', value: '13 ล้านคน' },
      { icon: <Plane className="w-5 h-5" />, label: 'เวลาบิน', value: '~3 ชม.' },
      { icon: <Award className="w-5 h-5" />, label: 'Business Hub', value: 'BGC, Makati' },
    ],
    pros: [
      'Business English ระดับองค์กรข้ามชาติ',
      'ประสบการณ์มหานครเต็มรูปแบบ',
      'เที่ยวได้ทุกวัน — ช้อปปิ้ง, อาหาร, วัฒนธรรม',
      'ใกล้สนามบินนานาชาติ Ninoy Aquino (NAIA)',
      'เครือข่าย Alumni นักเรียนไทยกว้างขวาง',
    ],
  },
  iloilo: {
    slug: 'iloilo', nameTh: 'อิโลอิโล', nameEn: 'Iloilo City',
    tagline: '"Queen City of the South" เมืองปลอดภัย ค่าครองชีพต่ำ นักเรียนไทยยังน้อย',
    description: 'อิโลอิโล (Iloilo City) ตั้งอยู่บนเกาะ Panay ทางตะวันตกของฟิลิปปินส์ ได้รับการยกย่องว่าเป็นเมืองที่น่าอยู่ที่สุดแห่งหนึ่ง กำลังได้รับความสนใจจากนักเรียนต่างชาติเพิ่มขึ้น ด้วยค่าครองชีพที่ประหยัด เมืองสงบปลอดภัย และนักเรียนไทยยังไม่มาก ทำให้มีโอกาสใช้ภาษาอังกฤษในชีวิตประจำวันมากขึ้น มีสถาบันสอนภาษาอังกฤษที่หลากหลายครอบคลุม ESL, IELTS และ Business English',
    climate: 'ร้อนชื้น 🌺', temp: '27–31°C', flightTime: '~1 ชม. จากเซบู / ~1 ชม. จากมะนิลา', highlight: '5 สถาบัน',
    photo: iloiloImg, accent: 'from-rose-500 to-pink-500', accentText: 'rose', emoji: '🌺',
    facts: [
      { icon: <Building2 className="w-5 h-5" />, label: 'สถาบัน', value: '5 แห่ง' },
      { icon: <Thermometer className="w-5 h-5" />, label: 'อุณหภูมิ', value: '27–31°C' },
      { icon: <Plane className="w-5 h-5" />, label: 'จากเซบู', value: '~1 ชม.' },
      { icon: <Clock className="w-5 h-5" />, label: 'จากมะนิลา', value: '~1 ชม.' },
    ],
    pros: [
      'เมืองสะอาด ปลอดภัย น่าอยู่ — ค่าอาชญากรรมต่ำมาก',
      'ค่าครองชีพต่ำกว่าเซบู 20–30% — คุ้มค่ากว่ามาก',
      'นักเรียนไทยยังน้อย — บังคับพูดอังกฤษในชีวิตจริง',
      'อาหารอร่อยขึ้นชื่อ — La Paz Batchoy, Pancit Molo',
      'สถาปัตยกรรมสเปนอาณานิคม สวยงาม เที่ยวสบาย',
      'เติบโตเป็น BPO & IT Hub — บรรยากาศนานาชาติ',
    ],
  },
};

// ── School entry type ──────────────────────────────────────────────
interface SchoolEntry {
  slug: string; name: string; tagline: string; rating: number;
  tags: string[]; courses: string;
  isPartner?: boolean; // Philingo direct partner → has internal detail page
  website?: string;    // external website (non-partners)
}

// ── Schools per city ───────────────────────────────────────────────
const CITY_SCHOOLS: Record<string, SchoolEntry[]> = {
  cebu: [
    // ── Philingo Partners ──────────────────────────────────────────
    { slug: 'cia',        name: 'CIA (Cebu International Academy)', tagline: 'Semi-Sparta | แคมปัสพรีเมียม Mactan Island',        rating: 4.8, tags: ['Semi-Sparta','IELTS','TOEIC','New Campus'],   courses: 'ESL, IELTS, TOEIC, Business', isPartner: true },
    { slug: 'qq-english', name: 'QQ English',                       tagline: 'Callan Method | พูดคล่องเร็ว 4× | IT Park',         rating: 4.7, tags: ['Callan Method','ESL','IELTS','IT Park'],       courses: 'ESL, IELTS, Business', isPartner: true },
    { slug: 'philinter',  name: 'Philinter Academy',                tagline: 'Business & Speaking | Cambridge | Mactan',           rating: 4.7, tags: ['Business','Cambridge','Speaking','ESL'],        courses: 'ESL, Business, Cambridge', isPartner: true },
    { slug: 'b-cebu',     name: "B'Cebu Language School (เซบู)",    tagline: 'แคมปัสใหม่ | Intensive | Banilad Cebu City',         rating: 4.6, tags: ['Intensive','New Campus','IELTS','TOEIC'],      courses: 'ESL, IELTS, TOEIC', isPartner: true },
    { slug: 'cpils',      name: 'CPILS',                            tagline: 'Native Teacher 100% | ก่อตั้ง 1999 | ใจกลาง Cebu',  rating: 4.7, tags: ['Native','IELTS Guarantee','ESL','TOEIC'],      courses: 'ESL, IELTS, TOEIC, Business', isPartner: true },
    { slug: 'ev-academy', name: 'EV Academy',                       tagline: 'Resort Campus | French-Managed | Premium',           rating: 4.7, tags: ['Resort','Premium','IELTS','Semi-Sparta'],       courses: 'ESL, IELTS, Business', isPartner: true },
    { slug: 'smeag',      name: 'SMEAG Global School',              tagline: 'Sparta & Classic | IELTS Guarantee | 1,200+',        rating: 4.8, tags: ['Sparta','IELTS Guarantee','Big Campus'],       courses: 'ESL, IELTS, TOEIC, Business', isPartner: true },
    // ── Other Cebu Schools ─────────────────────────────────────────
    { slug: 'english-fella',    name: 'English Fella',              tagline: 'Semi-Sparta | IT Park | Speaking Focus',             rating: 4.5, tags: ['Semi-Sparta','ESL','Speaking','IT Park'],      courses: 'ESL, IELTS, Speaking', website: 'https://englishfella.com' },
    { slug: 'cpi',              name: 'Cebu Pelis Institute (CPI)', tagline: 'สถาบันเก่าแก่ | ESL | Affordable | Cebu City',      rating: 4.4, tags: ['ESL','Affordable','Cebu City'],               courses: 'ESL, Speaking', website: 'https://www.cebucpi.com' },
    { slug: 'cella',            name: 'CELLA English Academy',      tagline: 'General English | IELTS | Friendly Atmosphere',      rating: 4.5, tags: ['ESL','IELTS','General English'],              courses: 'ESL, IELTS, Business', website: 'https://www.cellaenglish.com' },
    { slug: 'cg-academy',       name: 'CG Academy',                 tagline: 'Callan & General English | ESL | Cebu City',         rating: 4.4, tags: ['Callan','ESL','General English'],             courses: 'ESL, Business', website: 'https://www.cgesl.com' },
    { slug: 'ims-academy',      name: 'IMS Academy',                tagline: 'Intensive ESL | IELTS | Small Class Size',           rating: 4.5, tags: ['Intensive','ESL','IELTS','Small Class'],       courses: 'ESL, IELTS', website: 'https://imsacademy.net' },
    { slug: 'glc-english',      name: 'GLC English Academy',        tagline: 'General English | IELTS | Cebu',                     rating: 4.4, tags: ['ESL','IELTS','General English'],              courses: 'ESL, IELTS, General English', website: 'https://glcenglish.com' },
    { slug: 'ibreeze',          name: 'I.BREEZE',                   tagline: 'ESL | Semi-Sparta | Mactan Island',                  rating: 4.5, tags: ['ESL','Semi-Sparta','Speaking'],               courses: 'ESL, Speaking', website: 'https://cebuibreeze.com' },
    { slug: 'winning-english',  name: 'Winning English Academy',    tagline: 'Winning Method | ESL | IELTS | Cebu',                rating: 4.5, tags: ['ESL','IELTS','Winning Method'],              courses: 'ESL, IELTS', website: 'https://winningenglishschool.com' },
    { slug: 'genius-english',   name: 'Genius English',             tagline: 'Sparta | ESL | IELTS Focus | Mactan',                rating: 4.6, tags: ['Sparta','ESL','IELTS'],                       courses: 'ESL, IELTS', website: 'https://studyenglishgenius.com' },
    { slug: '3d-academy',       name: '3D Academy',                 tagline: '3D Learning System | ESL | วิธีการสอนเอกลักษณ์',    rating: 4.5, tags: ['3D System','ESL','Speaking'],                courses: 'ESL, Business', website: 'https://3d-universal.com' },
    { slug: 'idea-english',     name: 'IDEA English',               tagline: 'IDEA Method | ESL | IELTS | Cebu',                   rating: 4.5, tags: ['IDEA Method','ESL','IELTS'],                 courses: 'ESL, IELTS', website: 'https://ideaenglish.net' },
    { slug: 'btes',             name: 'BTES',                       tagline: 'Sparta | ESL | IELTS | Bridge to English School',    rating: 4.5, tags: ['Sparta','ESL','IELTS','TOEIC'],              courses: 'ESL, IELTS, TOEIC', website: 'https://btes.ph' },
    { slug: 'gitc',             name: 'GITC',                       tagline: 'Green International Technological College | ESL | Cebu City', rating: 4.4, tags: ['ESL','IELTS','TOEIC','General English'],   courses: 'ESL, IELTS, TOEIC', isPartner: true },
  ],
  baguio: [
    // ── Philingo Partners ──────────────────────────────────────────
    { slug: 'pines', name: 'PINES International Academy', tagline: 'Sparta เข้มข้น | ที่นิยมสูงสุดในหมู่คนไทย | IELTS',     rating: 4.9, tags: ['Sparta','IELTS','Cool Weather','Intensive'],    courses: 'ESL, IELTS, TOEIC', isPartner: true },
    { slug: 'bcebu', name: "B'Cebu Language School (บาเกียว)", tagline: "Intensive | B'Sparta | อากาศเย็น 18–22°C",           rating: 4.6, tags: ["B'Sparta",'Intensive','ESL','Baguio'],          courses: 'ESL, IELTS, Business', isPartner: true },
    // ── Other Baguio Schools ───────────────────────────────────────
    { slug: 'beci',         name: 'BECI Academy',           tagline: 'Sparta | ESL | IELTS | บาเกียว',                         rating: 4.6, tags: ['Sparta','ESL','IELTS'],                        courses: 'ESL, IELTS', website: 'https://beciedu.com' },
    { slug: 'monol',        name: 'MONOL International',    tagline: 'Sparta | สถาบันขนาดใหญ่ | IELTS | บาเกียว',            rating: 4.7, tags: ['Sparta','IELTS','Big Campus','Korean Mgmt'],    courses: 'ESL, IELTS, TOEIC', website: 'https://monol.edu.ph' },
    { slug: 'help-english', name: 'HELP English Academy',   tagline: 'Semi-Sparta | ESL | Affordable | บาเกียว',              rating: 4.5, tags: ['Semi-Sparta','ESL','Affordable'],              courses: 'ESL, IELTS', website: 'https://helpenglish.org' },
    { slug: 'jic-academy',  name: 'JIC Academy',            tagline: 'Japanese Management | ESL | Business | บาเกียว',        rating: 4.5, tags: ['Japanese Mgmt','ESL','Business'],              courses: 'ESL, Business', website: 'https://baguiojic.com' },
    { slug: 'aj-academy',   name: 'A&J Academy',            tagline: 'ESL | Speaking Focus | อากาศเย็น | บาเกียว',            rating: 4.4, tags: ['ESL','Speaking','Affordable'],                courses: 'ESL, Speaking', website: 'https://anjacademy.com' },
    { slug: 'wales-english',name: 'WALES English Academy',  tagline: 'Semi-Sparta | ESL | IELTS | บาเกียว',                   rating: 4.5, tags: ['Semi-Sparta','ESL','IELTS'],                   courses: 'ESL, IELTS', website: 'https://walesacademy.com' },
    { slug: 'cns-academy',  name: 'CNS Academy',            tagline: 'Sparta | ESL | TOEIC | บาเกียว',                        rating: 4.5, tags: ['Sparta','ESL','TOEIC'],                        courses: 'ESL, TOEIC', website: 'https://cnsenglish.com' },
    { slug: 'cip-english',  name: 'CIP English Academy',    tagline: 'Comprehensive English | IELTS | Business | บาเกียว',   rating: 4.6, tags: ['Comprehensive','IELTS','Business'],            courses: 'ESL, IELTS, Business', website: 'https://cipenglish.net' },
    { slug: 'eg-academy',   name: 'EG Academy',             tagline: 'ESL | Speaking | Sparta | บาเกียว',                     rating: 4.4, tags: ['ESL','Sparta','Speaking'],                     courses: 'ESL, Speaking', website: 'https://egesl.com' },
  ],
  clark: [
    { slug: 'hana-academy', name: 'HANA Academy',       tagline: 'ESL | Japanese Management | Clark Freeport',               rating: 4.5, tags: ['ESL','Japanese Mgmt','Clark'],              courses: 'ESL, IELTS, Business', website: 'https://clarkhana.com' },
    { slug: 'we-academy',   name: 'WE Academy',         tagline: 'ESL | Speaking Focus | Clark Freeport Zone',               rating: 4.4, tags: ['ESL','Speaking','Clark'],                   courses: 'ESL, IELTS', website: 'https://clarkweacademy.com' },
    { slug: 'gs-academy',   name: 'GS Academy (NELS)',  tagline: 'General English | ESL | Clark, Pampanga',                  rating: 4.4, tags: ['ESL','General English','Clark'],            courses: 'ESL, General English', website: 'https://gsnels.com' },
    { slug: 'mk-education', name: 'MK Education',       tagline: 'ESL | IELTS | Clark, Angeles City',                        rating: 4.4, tags: ['ESL','IELTS','Clark'],                      courses: 'ESL, IELTS, TOEIC', website: 'https://mk-edu.com' },
  ],
  manila: [
    { slug: 'e-room',   name: 'E-Room Language Center', tagline: 'Online + Onsite | ESL | Manila',                            rating: 4.4, tags: ['ESL','Online','Business','Manila'],         courses: 'ESL, Business', website: 'https://e-roominc.com' },
    { slug: 'lslc',     name: 'LSLC Language Skills Institute', tagline: 'Professional ESL | Language Skills | Manila',       rating: 4.4, tags: ['ESL','Professional','Language Skills'],     courses: 'ESL, Business, IELTS', website: 'https://lslc.edu.ph' },
    { slug: 'enderun',  name: 'Enderun Language Center', tagline: 'Premium ESL | BGC Taguig | International Standard',       rating: 4.7, tags: ['Premium','BGC','ESL','Business'],           courses: 'ESL, Business, IELTS', website: 'https://www.enderuncolleges.com' },
    { slug: 'wesli',    name: 'WESLI',                   tagline: 'ESL | Eastwood QC | Business English',                     rating: 4.4, tags: ['ESL','Business','Eastwood','Manila'],       courses: 'ESL, Business', website: 'https://wesli.com.ph' },
  ],
  iloilo: [
    { slug: 'we-academy-iloilo',   name: 'We Academy',                         tagline: 'ศูนย์สอบ IELTS Computer-Based | สระว่ายน้ำ | Jaro, Iloilo',     rating: 4.5, tags: ['IELTS Computer-Based','ESL','Swimming Pool'], courses: 'ESL, IELTS, TOEIC, Business English', isPartner: true },
    { slug: 'gitc-iloilo',         name: 'GITC (Green International Tech)',     tagline: 'นิยมจากนักเรียนญี่ปุ่น–เกาหลี | ESL | La Paz, Iloilo',          rating: 4.5, tags: ['ESL','IELTS','TOEIC','Quiet Atmosphere'],  courses: 'ESL, IELTS, TOEIC',                    isPartner: true },
    { slug: 'mk-education-iloilo', name: 'MK Education',                       tagline: 'Family Program | Business English | Mandurriao, Iloilo',         rating: 4.4, tags: ['Family Program','Business English','IELTS'],  courses: 'ESL, IELTS, Business English',          isPartner: true },
    { slug: 'pia-iloilo',          name: 'PIA (Polyglot International Academy)',tagline: 'โรงเรียนรุ่นใหม่ | ห้องเรียนเล็ก | Mandurriao, Iloilo',         rating: 4.5, tags: ['Modern','Small Class','ESL'],               courses: 'ESL, IELTS, Speaking',                 isPartner: true },
    { slug: 'columbus-english',    name: 'Columbus English Academy',            tagline: 'โรงเรียนขนาดเล็ก | ดูแลแบบครอบครัว | Jaro, Iloilo',             rating: 4.4, tags: ['Small School','ESL','Family Atmosphere'],     courses: 'ESL, Speaking',                        isPartner: true },
  ],
};

// ── Component ──────────────────────────────────────────────────────
const RATING_COLOR = 'fill-amber-400 text-amber-400';

export default function CityPage() {
  const params = useParams<{ city: string }>();
  const citySlug = params.city?.toLowerCase() ?? 'cebu';
  const city = CITY_META[citySlug];
  const allSchools = CITY_SCHOOLS[citySlug] ?? [];
  useSeoMeta(
    city ? `เรียนภาษาอังกฤษที่${city.nameTh} ฟิลิปปินส์ | Philingo` : 'เรียนภาษาอังกฤษที่ฟิลิปปินส์ | Philingo',
    city ? `เปรียบเทียบโรงเรียนสอนภาษาอังกฤษที่${city.nameTh} ฟิลิปปินส์ ดูราคา สิ่งอำนวยความสะดวก และรีวิวจากนักเรียนจริง` : 'ค้นหาโรงเรียนสอนภาษาอังกฤษในฟิลิปปินส์ที่ดีที่สุด'
  );

  const [filter, setFilter] = useState<'all' | 'partner' | 'other'>('all');
  const [siteSettings, setSiteSettings] = useState<Record<string, string>>({});
  useEffect(() => {
    const BASE = (import.meta.env.BASE_URL ?? '').replace(/\/$/, '');
    fetch(`${BASE}/api/settings`).then(r => r.ok ? r.json() : {}).then(setSiteSettings).catch(() => {});
  }, []);
  const schools = filter === 'partner'
    ? allSchools.filter(s => s.isPartner)
    : filter === 'other'
      ? allSchools.filter(s => !s.isPartner)
      : allSchools;

  const partnerCount = allSchools.filter(s => s.isPartner).length;
  const otherCount   = allSchools.filter(s => !s.isPartner).length;

  if (!city) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🗺️</div>
            <h1 className="text-2xl font-bold mb-2">ไม่พบเมืองนี้</h1>
            <Link href="/schools" className="text-primary hover:underline">← กลับไปหน้าโรงเรียน</Link>
          </div>
        </div>
      </Layout>
    );
  }

  const otherCities = Object.values(CITY_META).filter(c => c.slug !== citySlug);

  return (
    <Layout>
      {/* ── Hero ── */}
      <div className="relative h-[260px] md:h-[420px] lg:h-[500px] overflow-hidden">
        <img src={city.photo} alt={city.nameEn} fetchPriority="high" className="w-full h-full object-cover object-center" />
        {/* Subtle color tint — reduced to 35% so the actual photo stays visible */}
        <div className={`absolute inset-0 bg-gradient-to-b ${city.accent} opacity-35`} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        <div className="absolute top-6 left-0 right-0">
          <div className="container max-w-6xl mx-auto px-4">
            <nav className="flex items-center gap-2 text-white/80 text-sm">
              <Link href="/" className="hover:text-white transition-colors">หน้าแรก</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <Link href="/schools" className="hover:text-white transition-colors">โรงเรียน</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-white font-medium">{city.nameTh}</span>
            </nav>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 pb-10 pt-16">
          <div className="container max-w-6xl mx-auto px-4">
            <div className="flex items-end gap-4">
              <div className="text-5xl">{city.emoji}</div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-white/80 uppercase tracking-widest">
                    <MapPin className="w-3 h-3 inline mr-1" />Philippines
                  </span>
                </div>
                <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight drop-shadow-md">
                  เรียนภาษาอังกฤษที่ {city.nameTh}
                </h1>
                <p className="text-white/90 text-base md:text-lg mt-2 drop-shadow">{city.tagline}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick Facts Bar ── */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex overflow-x-auto hide-scrollbar divide-x divide-gray-100 dark:divide-gray-800">
            {city.facts.map((fact, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-4 shrink-0">
                <span className="text-primary">{fact.icon}</span>
                <div>
                  <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">{fact.label}</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{fact.value}</p>
                </div>
              </div>
            ))}
            <div className="flex items-center gap-3 px-5 py-4 shrink-0">
              <Sun className="w-5 h-5 text-amber-500" />
              <div>
                <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">ภูมิอากาศ</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{city.temp}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-5 py-4 shrink-0">
              <Plane className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">เดินทาง</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{city.flightTime}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-6xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-10">

          {/* ── Main ── */}
          <div className="lg:col-span-2 space-y-10">

            {/* About city */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">🌏 เกี่ยวกับ{city.nameTh}</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{city.description}</p>
              <ul className="mt-4 space-y-2">
                {city.pros.map((pro, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <span className="text-green-500 mt-0.5 shrink-0">✓</span>{pro}
                  </li>
                ))}
              </ul>
            </div>

            {/* School list */}
            <div>
              <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    🏫 สถาบันใน{city.nameTh}
                    <span className="ml-2 text-sm font-normal text-gray-400">({allSchools.length} แห่ง)</span>
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    <span className="text-primary font-semibold">{partnerCount} Philingo Partner</span>
                    {otherCount > 0 && ` · ${otherCount} สถาบันอื่น`}
                  </p>
                </div>
                {/* Filter tabs */}
                <div className="flex gap-1.5">
                  {[
                    { key: 'all', label: `ทั้งหมด (${allSchools.length})` },
                    { key: 'partner', label: `⭐ พาร์ทเนอร์ (${partnerCount})` },
                    { key: 'other', label: `อื่นๆ (${otherCount})` },
                  ].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setFilter(tab.key as any)}
                      className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors whitespace-nowrap ${
                        filter === tab.key
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {schools.length === 0 ? (
                <div className="text-center py-10 text-gray-400">ไม่พบสถาบัน</div>
              ) : (
                <div className="space-y-4">
                  {/* Partner schools header */}
                  {filter === 'all' && partnerCount > 0 && (
                    <div className="flex items-center gap-2 mb-1">
                      <ShieldCheck className="w-4 h-4 text-primary" />
                      <span className="text-xs font-bold text-primary uppercase tracking-wide">Philingo Partner Schools — สมัครผ่าน Philingo ได้เลย</span>
                    </div>
                  )}

                  {/* Partner school cards — photo banner grid */}
                  {(filter === 'all' || filter === 'partner') && partnerCount > 0 && (
                    <div className="grid sm:grid-cols-2 gap-4">
                      {schools.filter(s => s.isPartner).map(school => (
                        <div key={school.slug} className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-primary/20 dark:border-primary/30 hover:shadow-lg hover:-translate-y-0.5 transition-all group">
                          {/* Banner photo */}
                          <div className="relative h-40 overflow-hidden bg-gray-200 dark:bg-gray-700">
                            <img src={city.photo} alt={city.nameEn} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            {/* Overlay gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                            {/* Rating badge */}
                            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm">
                              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> {school.rating}
                            </div>
                            {/* Partner badge */}
                            <div className="absolute top-3 right-3 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                              <ShieldCheck className="w-2.5 h-2.5" /> Partner
                            </div>
                            {/* City badge */}
                            <div className="absolute bottom-3 left-3 bg-gray-900/80 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" /> {city.nameTh}
                            </div>
                          </div>

                          {/* Card body */}
                          <div className="p-4">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-snug mb-0.5">{school.name}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{school.courses}</p>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-1 mb-3">
                              {school.tags.slice(0, 3).map(tag => (
                                <span key={tag} className="bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 text-[10px] px-2 py-0.5 rounded font-medium">{tag}</span>
                              ))}
                            </div>

                            {/* Facilities row */}
                            <div className="grid grid-cols-3 gap-1 border-t border-b border-gray-100 dark:border-gray-700 py-2.5 mb-3 text-center text-gray-400 text-[11px]">
                              <div><Home className="w-3.5 h-3.5 mx-auto mb-0.5" />หอพัก</div>
                              <div><Coffee className="w-3.5 h-3.5 mx-auto mb-0.5" />3 มื้อ</div>
                              <div><Wifi className="w-3.5 h-3.5 mx-auto mb-0.5" />Wi-Fi</div>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-2">
                              <Link href={`/schools/${school.slug}`}
                                className="flex-1 border-2 border-primary text-primary hover:bg-primary/5 font-semibold py-2 rounded-xl transition-colors text-center text-xs">
                                ดูรายละเอียด
                              </Link>
                              <Link href="/register"
                                className="flex-1 bg-secondary hover:bg-secondary/90 text-secondary-foreground text-center font-semibold py-2 rounded-xl transition-colors text-xs">
                                สมัครเรียน
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Divider between partner and non-partner */}
                  {filter === 'all' && partnerCount > 0 && otherCount > 0 && (
                    <div className="flex items-center gap-3 py-1">
                      <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                      <span className="text-xs text-gray-400 whitespace-nowrap">สถาบันอื่นใน{city.nameTh}</span>
                      <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                    </div>
                  )}

                  {/* Non-partner school list rows */}
                  {(filter === 'all' || filter === 'other') && schools.filter(s => !s.isPartner).map(school => (
                    <div key={school.slug} className="rounded-2xl border bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all p-4 group">
                      <div className="flex gap-4">
                        {/* Rating */}
                        <div className="shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-700 flex items-center justify-center">
                          <div className="text-center">
                            <Star className={`w-3.5 h-3.5 mx-auto mb-0.5 ${RATING_COLOR}`} />
                            <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300">{school.rating}</span>
                          </div>
                        </div>
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-tight">{school.name}</h3>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{school.tagline}</p>
                            </div>
                            {school.website ? (
                              <a href={school.website} target="_blank" rel="noopener noreferrer"
                                className="shrink-0 text-xs border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 px-3 py-1.5 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-1">
                                เว็บไซต์ <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : null}
                          </div>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {school.tags.slice(0, 4).map(tag => (
                              <span key={tag} className="text-[11px] bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded font-medium">{tag}</span>
                            ))}
                          </div>
                          <p className="text-[11px] text-gray-400 mt-1.5">
                            <BookOpen className="w-3 h-3 inline mr-1" />{school.courses}
                          </p>
                        </div>
                      </div>
                      {/* CTA buttons — same as partner cards */}
                      <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                        <Link href={`/schools/${school.slug}`}
                          className="flex-1 border-2 border-primary/20 text-primary hover:border-primary hover:bg-primary/5 font-bold py-2 rounded-xl transition-all text-center text-xs flex items-center justify-center">
                          ดูรายละเอียด
                        </Link>
                        <Link href="/register"
                          className="flex-1 bg-primary hover:bg-primary/90 text-white shadow-sm shadow-primary/20 text-center font-bold py-2 rounded-xl transition-all text-xs flex items-center justify-center">
                          สมัครเรียน
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* CTA */}
            <div className={`rounded-2xl bg-gradient-to-r ${city.accent} p-7 text-white`}>
              <h3 className="text-xl font-bold mb-1">สนใจเรียนที่{city.nameTh}?</h3>
              <p className="text-white/80 text-sm mb-5">ให้ Philingo ช่วยเลือกสถาบันที่เหมาะกับคุณ — ฟรี! ไม่มีค่าใช้จ่าย</p>
              <div className="flex flex-wrap gap-3">
                <Link href="/register" className="bg-white text-primary font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-white/90 transition-colors">
                  สมัครเรียน / ขอคำปรึกษา
                </Link>
                <Link href="/contact" className="border border-white/40 text-white px-6 py-2.5 rounded-xl text-sm hover:bg-white/10 transition-colors">
                  ติดต่อ Philingo
                </Link>
              </div>
            </div>
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-6">
            {/* Other cities */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wide">🗺️ เมืองอื่นในฟิลิปปินส์</h3>
              <div className="space-y-3">
                {otherCities.map(c => (
                  <Link key={c.slug} href={`/schools/city/${c.slug}`}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-white dark:hover:bg-gray-700/50 transition-colors group">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.accent} flex items-center justify-center text-xl shrink-0`}>
                      {c.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm group-hover:text-primary transition-colors">
                        {c.nameTh}
                        <span className="ml-1.5 text-[10px] text-gray-400 font-normal">
                          {CITY_SCHOOLS[c.slug]?.length ?? 0} แห่ง
                        </span>
                      </p>
                      <p className="text-xs text-gray-400 truncate">{c.tagline}</p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-primary shrink-0" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Compare */}
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/10 dark:to-yellow-900/10 rounded-2xl p-5 border border-amber-100 dark:border-amber-900/20">
              <h3 className="text-sm font-bold text-amber-800 dark:text-amber-400 mb-3">⚡ เปรียบเทียบเมือง</h3>
              <div className="space-y-2 text-xs">
                {[
                  { city: 'เซบู',      citySlug: 'cebu',   weather: '30°C ☀️',  count: CITY_SCHOOLS.cebu.length,   cost: '฿฿฿' },
                  { city: 'บาเกียว',  citySlug: 'baguio', weather: '20°C ⛰️',  count: CITY_SCHOOLS.baguio.length, cost: '฿฿' },
                  { city: 'คลาร์ก',   citySlug: 'clark',  weather: '28°C 🌬️', count: CITY_SCHOOLS.clark.length,  cost: '฿฿' },
                  { city: 'มะนิลา',  citySlug: 'manila', weather: '30°C 🌆',  count: CITY_SCHOOLS.manila.length, cost: '฿฿฿' },
                  { city: 'อิโลอิโล', citySlug: 'iloilo', weather: '29°C 🌺', count: CITY_SCHOOLS.iloilo.length, cost: '฿฿' },
                ].map(row => (
                  <div key={row.city} className={`flex items-center gap-2 px-3 py-2 rounded-lg ${row.citySlug === citySlug ? 'bg-amber-100 dark:bg-amber-900/30 font-semibold' : 'bg-white/60 dark:bg-gray-800/30'}`}>
                    <span className="w-14 text-gray-700 dark:text-gray-300 font-medium">{row.city}</span>
                    <span className="flex-1 text-gray-500">{row.weather}</span>
                    <span className="text-gray-500">{row.count}</span>
                    <span className="text-green-600 font-mono">{row.cost}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-amber-600/60 mt-2">฿ = ค่าใช้จ่ายต่อเดือน (สัมพัทธ์)</p>
            </div>

            {/* Contact */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm text-center">
              <div className="text-3xl mb-2">💬</div>
              <p className="font-bold text-gray-900 dark:text-white text-sm mb-1">ยังไม่แน่ใจว่าจะเลือกเมืองไหน?</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">ปรึกษาทีม Philingo ฟรี</p>
              <a href={siteSettings.line_url || `https://line.me/ti/p/~${siteSettings.line_id || '@philingo'}`} target="_blank" rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-[#06C755] text-white font-bold py-2.5 rounded-xl text-sm hover:bg-[#05b34b] transition-colors">
                <span>💚</span> ขอคำปรึกษาผ่าน LINE
              </a>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}
