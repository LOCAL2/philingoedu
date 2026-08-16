import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { useSeoMeta } from '@/hooks/use-seo-meta';
import { useLanguage } from '@/lib/language-context';
import { MapPin, Sun, GraduationCap, Plane, Wallet, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

import cebuImg from '@assets/generated_images/cebu-1.jpg';
import baguioImg from '@assets/generated_images/baguio-1.jpg';
import manilaImg from '@assets/generated_images/manila-1.jpg';

export default function WhyPhilippines() {
  const { t } = useLanguage();
  useSeoMeta(
    'ทำไมต้องเรียนภาษาอังกฤษที่ฟิลิปปินส์ | Philingo',
    'ฟิลิปปินส์คือจุดหมายยอดนิยมสำหรับเรียนภาษาอังกฤษ ค่าใช้จ่ายต่ำ คุณภาพสูง สภาพแวดล้อมเป็นภาษาอังกฤษตลอด 24 ชั่วโมง'
  );

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-24 bg-primary text-white overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <img src={cebuImg} alt="Philippines" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-primary/80"></div>
        <div className="container max-w-7xl mx-auto px-4 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">ทำไมต้องไปเรียนฟิลิปปินส์?</h1>
            <p className="text-xl max-w-3xl mx-auto text-primary-foreground/90">
              ประเทศเดียวในเอเชียที่ใช้ภาษาอังกฤษเป็นภาษาราชการ 
              และมีระบบการเรียนแบบตัวต่อตัวที่เห็นผลเร็วที่สุด
            </p>
          </motion.div>
        </div>
      </section>

      {/* 6 Benefits */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: BookOpen, title: 'เรียนแบบตัวต่อตัว (1:1)', desc: 'จุดเด่นที่ไม่มีในประเทศอื่น ให้คุณได้ฝึกพูด ฟัง อ่าน เขียน กับครูโดยตรงวันละ 4-6 ชั่วโมง' },
              { icon: Wallet, title: 'ค่าใช้จ่ายคุ้มค่า', desc: 'ถูกกว่าไปเรียนประเทศตะวันตก 2-3 เท่า โดยค่าเรียนรวมที่พักและอาหารแล้ว' },
              { icon: GraduationCap, title: 'พัฒนาได้เร็ว', desc: 'สภาพแวดล้อมที่บังคับให้ใช้ภาษาอังกฤษตลอดเวลา และตารางเรียนที่เข้มข้น (Sparta)' },
              { icon: Sun, title: 'วัฒนธรรมใกล้เคียง', desc: 'อาหารและสภาพอากาศคล้ายเมืองไทย ปรับตัวง่าย ผู้คนเป็นมิตรและรักคนไทย' },
              { icon: Plane, title: 'เดินทางสะดวก', desc: 'บินตรงจากกรุงเทพฯ ใช้เวลาเพียง 3-4 ชั่วโมง และไม่ต้องขอวีซ่าล่วงหน้า' },
              { icon: MapPin, title: 'ท่องเที่ยวในวันหยุด', desc: 'ฟิลิปปินส์มีทะเลและธรรมชาติที่สวยงามระดับโลก ให้คุณพักผ่อนชาร์จพลังในวันเสาร์-อาทิตย์' }
            ].map((benefit, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all border border-gray-100 dark:border-gray-700">
                <div className="w-14 h-14 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
                  <benefit.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{benefit.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* City Highlights */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16 text-gray-900 dark:text-white">เมืองยอดนิยมสำหรับนักเรียนไทย</h2>
          
          <div className="space-y-16">
            {/* Cebu */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <h3 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Cebu (เซบู)</h3>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
                  <MapPin className="w-4 h-4" /> เมืองแห่งการศึกษาและท่องเที่ยว
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
                  เซบูเป็นเมืองยอดนิยมอันดับ 1 มีสถาบันภาษาให้เลือกมากที่สุด เหมาะสำหรับคนที่ชอบทั้งการเรียนและการท่องเที่ยว 
                  มีห้างสรรพสินค้าใหญ่ ทะเลสวยงาม และมีเที่ยวบินตรงจากไทย
                </p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-500" /> มีหลักสูตรหลากหลายที่สุด (ESL, IELTS, TOEIC)</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-500" /> สะดวกสบาย สิ่งอำนวยความสะดวกครบ</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-500" /> เที่ยวเกาะและดำน้ำได้ง่ายในวันหยุด</li>
                </ul>
              </div>
              <div className="order-1 md:order-2">
                <img src={cebuImg} alt="Cebu City" className="rounded-2xl shadow-xl w-full h-[220px] md:h-[400px] object-cover" />
              </div>
            </div>

            {/* Baguio */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <img src={baguioImg} alt="Baguio City" className="rounded-2xl shadow-xl w-full h-[220px] md:h-[400px] object-cover" />
              </div>
              <div>
                <h3 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Baguio (บาเกียว)</h3>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-4">
                  <MapPin className="w-4 h-4" /> เมืองหนาวบนภูเขา บรรยากาศสงบ
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
                  เมืองการศึกษาบนภูเขา อากาศเย็นสบายตลอดปี (15-25 องศา) บรรยากาศเงียบสงบ 
                  เหมาะกับนักเรียนที่ต้องการสมาธิ และชอบระบบการเรียนแบบเข้มข้น (Sparta)
                </p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-500" /> อากาศเย็นสบาย ไม่ต้องเปิดแอร์</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-500" /> เมืองที่ปลอดภัยที่สุดในฟิลิปปินส์</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-500" /> ต้นตำรับระบบเรียนแบบ Sparta เข้มข้น</li>
                </ul>
              </div>
            </div>

            {/* Manila / Clark */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <h3 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Manila & Clark</h3>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-4">
                  <MapPin className="w-4 h-4" /> เมืองหลวงและเมืองเศรษฐกิจ
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
                  คลาร์กเป็นเขตเศรษฐกิจพิเศษที่มีความปลอดภัยสูงมาก มีชาวต่างชาติและครู Native Speaker อาศัยอยู่เยอะ 
                  ส่วนมะนิลาเป็นเมืองหลวงที่มีความเจริญและทันสมัย
                </p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-500" /> โอกาสเรียนกับครู Native (อเมริกา, อังกฤษ)</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-500" /> สภาพแวดล้อมคล้ายเมืองตะวันตก (Clark)</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-500" /> มีสนามบินนานาชาติ เดินทางสะดวกสุด</li>
                </ul>
              </div>
              <div className="order-1 md:order-2">
                <img src={manilaImg} alt="Manila" className="rounded-2xl shadow-xl w-full h-[220px] md:h-[400px] object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

function CheckCircle2(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
  );
}
