import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { useSeoMeta } from '@/hooks/use-seo-meta';
import { Link } from 'wouter';
import { useSettings } from '@/hooks/use-settings';
import { motion } from 'framer-motion';
import {
  GraduationCap, FileText, Plane, Home, Shield, HeadphonesIcon,
  CheckCircle2, Star, Users, Clock, Award, ArrowRight, Phone
} from 'lucide-react';
import { SiLine } from 'react-icons/si';

const services = [
  {
    icon: GraduationCap,
    title: 'แนะนำและเลือกโรงเรียน',
    desc: 'ทีมผู้เชี่ยวชาญช่วยวิเคราะห์เป้าหมาย งบประมาณ และแนะนำโรงเรียนที่เหมาะสมที่สุดสำหรับคุณโดยเฉพาะ',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: FileText,
    title: 'ดูแลวีซ่าและเอกสาร',
    desc: 'จัดเตรียมเอกสารทั้งหมด ดูแล Visa Extension ที่ฟิลิปปินส์ ให้คุณไม่ต้องกังวลเรื่องเอกสารเลย',
    color: 'bg-green-100 text-green-600',
  },
  {
    icon: Plane,
    title: 'วางแผนการเดินทาง',
    desc: 'ช่วยจองตั๋วเครื่องบิน แนะนำเส้นทาง และประสานงาน Airport Transfer ไปถึงโรงเรียนอย่างปลอดภัย',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    icon: Home,
    title: 'จองที่พักและหลักสูตร',
    desc: 'จัดการจองห้องพักและหลักสูตรที่โรงเรียนล่วงหน้า พร้อมเอกสารยืนยันการจองทุกอย่าง',
    color: 'bg-yellow-100 text-yellow-600',
  },
  {
    icon: Shield,
    title: 'ดูแลระหว่างเรียน',
    desc: 'มีทีมงานคอยดูแลตลอดการเรียน ช่วยแก้ปัญหาต่างๆ ระหว่างอยู่ที่ฟิลิปปินส์ ตลอด 24 ชั่วโมง',
    color: 'bg-red-100 text-red-600',
  },
  {
    icon: HeadphonesIcon,
    title: 'ให้คำปรึกษาฟรี',
    desc: 'ปรึกษาผู้เชี่ยวชาญที่มีประสบการณ์จริงฟรี ไม่มีค่าบริการแอบแฝง ตั้งแต่ขั้นตอนแรกจนถึงสุดท้าย',
    color: 'bg-teal-100 text-teal-600',
  },
];

const whyUs = [
  { icon: Award, title: 'ประสบการณ์ 20+ ปี', desc: 'ดูแลนักเรียนไทยไปเรียนที่ฟิลิปปินส์มาแล้วกว่า 5,000 คน' },
  { icon: Shield, title: 'สมาชิก TIECA', desc: 'บริษัทจดทะเบียนถูกต้อง สมาชิกสมาคมนักเรียนต่างชาติ มาตรฐานระดับสากล' },
  { icon: Users, title: 'ไม่มีค่าบริการเพิ่ม', desc: 'ราคาที่คุณได้รับตรงจาก Philingo เท่ากับราคาโรงเรียน พร้อมรับโปรพิเศษเฉพาะนักเรียนของเรา' },
  { icon: Clock, title: 'ดูแล 24/7', desc: 'ทีมงานพร้อมช่วยเหลือตลอด 24 ชั่วโมง ตั้งแต่ก่อนออกเดินทางจนกลับถึงบ้าน' },
  { icon: Star, title: 'โรงเรียนพาร์ทเนอร์ 50+', desc: 'คัดสรรโรงเรียนชั้นนำที่ผ่านการตรวจสอบคุณภาพจากทีม Philingo แล้ว' },
  { icon: CheckCircle2, title: 'Visa Approval Rate สูง', desc: 'ประวัติดูแลวีซ่าสำเร็จ 99%+ ไม่เคยมีปัญหาเรื่องวีซ่ากับนักเรียนในความดูแล' },
];

const steps = [
  { step: '01', title: 'ปรึกษาฟรี', desc: 'แจ้งเป้าหมาย งบประมาณ และระยะเวลาที่ต้องการเรียน ทีมงานจะวิเคราะห์และแนะนำโปรแกรมที่เหมาะสม' },
  { step: '02', title: 'เลือกโรงเรียนและจอง', desc: 'เปรียบเทียบโรงเรียนและหลักสูตร ยืนยันการจองพร้อมชำระค่ามัดจำ รับเอกสารยืนยันการจองทันที' },
  { step: '03', title: 'เตรียมเอกสารและเดินทาง', desc: 'ทีมงานดูแลเอกสารทั้งหมด วางแผนการเดินทาง และส่งต่อข้อมูลที่จำเป็นครบถ้วน' },
  { step: '04', title: 'เรียนและพัฒนา', desc: 'เรียนที่โรงเรียนพาร์ทเนอร์ มีทีม Philingo คอยสนับสนุนตลอด หากมีปัญหาติดต่อได้ตลอด 24 ชั่วโมง' },
];

export default function Services() {
  const settings = useSettings();
  const lineUrl = settings.line_url || 'https://lin.ee/nBR4rsN';
  useSeoMeta(
    'บริการเรียนต่อฟิลิปปินส์ครบวงจร | Philingo',
    'Philingo ให้บริการครบวงจรสำหรับการเรียนต่อฟิลิปปินส์ ทั้งการเลือกโรงเรียน จองที่พัก ขอวีซ่า และดูแลตลอดการเรียน ฟรีไม่มีค่าใช้จ่าย'
  );
  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary via-[#2980D6] to-[#5BB6F0] py-24 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10 pointer-events-none" />
        <div className="container max-w-5xl mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full text-sm font-medium mb-6 backdrop-blur-md">
            <Award className="w-4 h-4" /> บริษัทจดทะเบียนถูกต้อง · สมาชิก TIECA
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            บริการของเรา<br />
            <span className="text-secondary">ครบจบในที่เดียว</span>
          </h1>
          <p className="text-white/85 text-xl max-w-2xl mx-auto leading-relaxed">
            Philingo ดูแลนักเรียนตั้งแต่ขั้นตอนแรกจนกลับถึงบ้าน ไม่มีค่าบริการเพิ่มเติม
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10">
            <Link href="/contact" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold px-8 py-4 rounded-xl text-lg transition-transform hover:scale-105 shadow-xl">
              ขอราคาโปรโมชั่น <ArrowRight className="inline w-5 h-5 ml-1" />
            </Link>
            <a href={lineUrl} target="_blank" rel="noreferrer"
              className="bg-[#00B900] hover:bg-[#00A000] text-white font-bold px-8 py-4 rounded-xl text-lg transition-transform hover:scale-105 shadow-xl flex items-center justify-center gap-2">
              <SiLine className="w-5 h-5" /> ปรึกษาฟรีผ่าน LINE
            </a>
          </div>
        </div>
      </section>

      {/* Services grid */}
      <section className="py-24 bg-background">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">บริการเราทำอะไรบ้าง?</h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">ให้บริการครบวงจรตั้งแต่ต้นจนจบ ไม่มีค่าใช้จ่ายแอบแฝง</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-white/80 backdrop-blur-sm dark:bg-gray-800 rounded-2xl p-7 border border-white/80 dark:border-gray-700 hover:shadow-xl transition-all"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${s.color}`}>
                  <s.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{s.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-24 bg-[hsl(178_55%_83%)] dark:bg-gray-900">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">กระบวนการของเรา</h2>
            <p className="text-gray-600 dark:text-gray-400">4 ขั้นตอนง่ายๆ จากการปรึกษาจนถึงวันเดินทาง</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/80 dark:bg-gray-800 rounded-2xl p-6 border border-white/80 dark:border-gray-700 text-center"
              >
                <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-xl font-black">
                  {step.step}
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-lg">{step.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="py-24 bg-background">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">ทำไมต้องเลือก Philingo?</h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">มากกว่าแค่ตัวแทน เราคือพาร์ทเนอร์ที่ดูแลคุณจริงๆ</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyUs.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex items-start gap-4 bg-white/80 backdrop-blur-sm dark:bg-gray-800 rounded-2xl p-6 border border-white/80 dark:border-gray-700"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial strip */}
      <section className="py-16 bg-[hsl(178_60%_82%)] dark:bg-gray-800">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <div className="flex justify-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-6 h-6 fill-yellow-500 text-yellow-500" />
            ))}
          </div>
          <blockquote className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            "Philingo ดูแลเราทุกอย่าง ตั้งแต่เลือกโรงเรียน ทำวีซ่า จนถึงวันกลับ ไม่ต้องเป็นห่วงอะไรเลย"
          </blockquote>
          <p className="text-gray-600 dark:text-gray-400">— น้องปูน อายุ 24 ปี เรียน IELTS ที่ CIA Cebu 3 เดือน</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-white">
        <div className="container max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">พร้อมเริ่มเส้นทางภาษาอังกฤษแล้วหรือยัง?</h2>
          <p className="text-white/80 text-lg mb-10">ปรึกษาทีมงาน Philingo ฟรี ไม่มีค่าใช้จ่าย รับข้อเสนอที่ดีที่สุดเฉพาะคุณ</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/contact"
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold px-8 py-4 rounded-xl text-lg transition-transform hover:scale-105 shadow-xl">
              ขอราคาโปรโมชั่น
            </Link>
            <a href={lineUrl} target="_blank" rel="noreferrer"
              className="bg-[#00B900] hover:bg-[#00A000] text-white font-bold px-8 py-4 rounded-xl text-lg transition-transform hover:scale-105 shadow-xl flex items-center justify-center gap-2">
              <SiLine className="w-5 h-5" /> คุยผ่าน LINE ฟรี
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
}
