import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { useSeoMeta } from '@/hooks/use-seo-meta';
import { useLanguage } from '@/lib/language-context';
import { Trophy, Target, Heart, Shield, Users, Lightbulb, CheckCircle2, Star, MapPin, HandHeart } from 'lucide-react';
import { motion } from 'framer-motion';
import heroImg from '@assets/ee6abb87-5291-4391-a40c-0b39c0c6777e_1785171375148.png';

export default function About() {
  const { t } = useLanguage();
  useSeoMeta(
    'เกี่ยวกับ Philingo — ที่ปรึกษาเรียนต่อฟิลิปปินส์ อันดับ 1 ของไทย | Philingo',
    'Philingo คือผู้เชี่ยวชาญด้านการเรียนต่อฟิลิปปินส์สำหรับคนไทย บริการครบวงจรตั้งแต่เลือกโรงเรียน ที่พัก จนถึงวันเดินทาง'
  );
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="Philingo Students" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-gray-900/50 to-gray-900/20"></div>
        <div className="container max-w-7xl mx-auto px-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-2xl">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">ผู้เชี่ยวชาญด้านการเรียนต่อฟิลิปปินส์ อันดับ 1 ของไทย</h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              ด้วยประสบการณ์กว่า 20 ปี เรามุ่งมั่นที่จะส่งมอบประสบการณ์การเรียนภาษาอังกฤษที่ดีที่สุด พร้อมการดูแลที่ใส่ใจเหมือนคนในครอบครัว
            </p>
          </motion.div>
        </div>
      </section>

      {/* Why Philingo */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="container max-w-5xl mx-auto px-4">
          {/* heading */}
          <div className="text-center mb-14">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 dark:text-white mb-4">
              เกี่ยวกับเรา
            </h2>
            <p className="text-xl md:text-2xl font-bold text-gray-700 dark:text-gray-300 mb-3">
              ผู้เชี่ยวชาญด้านการเรียนต่อฟิลิปปินส์ อันดับ 1 ของไทย
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-3xl mx-auto leading-relaxed">
              ด้วยประสบการณ์กว่า 20 ปี เรามุ่งมั่นที่จะส่งมอบประสบการณ์การเรียนภาษาอังกฤษที่ดีที่สุด
              พร้อมการดูแลที่ใส่ใจเหมือนคนในครอบครัว ใช้ชีวิตและเรียนรู้ในฟิลิปปินส์
            </p>
          </div>

          {/* Feature cards */}
          <div className="space-y-6">
            {/* Row 1: 2 cards */}
            <div className="grid md:grid-cols-2 gap-6">
              <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:0.05 }}
                className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-700/30 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">⭐</span>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">ประสบการณ์มากกว่า 20 ปี</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  เราไม่ใช่เอเจนซี่เปิดใหม่ แต่เป็นผู้เชี่ยวชาญด้านการศึกษาต่อต่างประเทศที่มีประสบการณ์ยาวนาน
                  ให้คำปรึกษานักเรียนหลายพันคน และมีความสัมพันธ์โดยตรงกับโรงเรียนชั้นนำในฟิลิปปินส์
                </p>
              </motion.div>

              <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:0.1 }}
                className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-700/30 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">✅</span>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">ตรวจสอบได้ มั่นใจทุกขั้นตอน</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  บริษัทจดทะเบียนถูกต้อง และเป็นตัวแทนอย่างเป็นทางการของโรงเรียนหลายแห่งในฟิลิปปินส์และต่างประเทศ
                  ให้บริการด้วยความโปร่งใส ตรวจสอบได้
                </p>
              </motion.div>
            </div>

            {/* Row 2: expert + full-service */}
            <div className="grid md:grid-cols-2 gap-6">
              <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:0.15 }}
                className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-700/30 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-4">
                  <MapPin className="w-8 h-8 text-blue-600 shrink-0" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">เชี่ยวชาญด้านเรียนภาษาอังกฤษที่ฟิลิปปินส์</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  เรารู้จักทุกเมือง ทุกโรงเรียน และทุกหลักสูตร ไม่ว่าจะเป็น Cebu, Baguio, Clark หรือ Iloilo
                  พร้อมแนะนำโรงเรียนที่เหมาะกับเป้าหมายและงบประมาณของคุณ
                </p>
              </motion.div>

              <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:0.2 }}
                className="bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-700/30 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-3xl">🤝</span>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">ดูแลครบวงจร</h3>
                </div>
                <ul className="space-y-2">
                  {[
                    'ให้คำปรึกษาฟรี',
                    'แนะนำโรงเรียนที่เหมาะสม',
                    'สมัครเรียนและประสานงานกับโรงเรียน',
                    'จัดหาที่พัก',
                    'ให้คำแนะนำเรื่องวีซ่าและการเดินทาง',
                    'ดูแลก่อนเดินทางและระหว่างเรียน',
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" />{item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>

            {/* Row 3: parents + more than sending */}
            <div className="grid md:grid-cols-2 gap-6">
              <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:0.25 }}
                className="bg-pink-50 dark:bg-pink-900/10 border border-pink-200 dark:border-pink-700/30 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">❤️</span>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">พ่อแม่ผู้ปกครองอุ่นใจ</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  เราให้ความสำคัญกับความปลอดภัยและการดูแลนักเรียน พร้อมช่วยประสานงานกับโรงเรียนเมื่อเกิดปัญหา
                  เพื่อให้ทั้งนักเรียนและผู้ปกครองมั่นใจตลอดระยะเวลาการเรียน
                </p>
              </motion.div>

              <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:0.3 }}
                className="bg-sky-50 dark:bg-sky-900/10 border border-sky-200 dark:border-sky-700/30 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">💙</span>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">มากกว่าการส่งไปเรียน</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Philingo ไม่ได้เป็นเพียงผู้แนะนำโรงเรียน แต่เป็นที่ปรึกษาที่อยู่เคียงข้างคุณ ตั้งแต่เลือกคอร์ส
                  วางแผนงบประมาณ จนถึงวันที่คุณเดินทางกลับ พร้อมให้คำแนะนำจากประสบการณ์จริง
                  เพื่อให้การเรียนภาษาอังกฤษที่ฟิลิปปินส์คุ้มค่าที่สุด
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission / Vision */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
              <Target className="w-12 h-12 text-primary mb-6" />
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">วิสัยทัศน์ (Vision)</h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                เป็นผู้นำด้านการแนะแนวการศึกษาต่อประเทศฟิลิปปินส์ที่ได้รับความไว้วางใจสูงสุดในภูมิภาคเอเชียตะวันออกเฉียงใต้ โดยสร้างมาตรฐานใหม่ในการบริการและการดูแลนักเรียน
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
              <Heart className="w-12 h-12 text-secondary mb-6" />
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">พันธกิจ (Mission)</h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                มอบโอกาสในการเรียนรู้ภาษาอังกฤษอย่างมีประสิทธิภาพในราคาที่เข้าถึงได้ พร้อมดูแลนักเรียนทุกคนอย่างใกล้ชิดและปลอดภัยตลอดโครงการ
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">ค่านิยมองค์กร (Core Values)</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: 'ความน่าเชื่อถือ', desc: 'ทำงานด้วยความซื่อสัตย์ โปร่งใส และตรงไปตรงมา' },
              { icon: Heart, title: 'ความใส่ใจ', desc: 'ดูแลนักเรียนทุกคนเหมือนคนในครอบครัว' },
              { icon: Trophy, title: 'ความเป็นเลิศ', desc: 'คัดสรรสถาบันและหลักสูตรที่มีคุณภาพสูงสุด' },
              { icon: Users, title: 'พันธมิตร', desc: 'สร้างความสัมพันธ์ที่ดีกับสถาบันการศึกษาและพาร์ทเนอร์' },
              { icon: Lightbulb, title: 'นวัตกรรม', desc: 'พัฒนาระบบการให้บริการที่ทันสมัยและสะดวกสบาย' },
              { icon: CheckCircle2, title: 'ผลลัพธ์', desc: 'มุ่งเน้นให้นักเรียนบรรลุเป้าหมายทางการเรียน' }
            ].map((value, idx) => (
              <div key={idx} className="flex flex-col items-center text-center p-8 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                <value.icon className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{value.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-gradient-to-br from-sky-50 via-white to-indigo-50 overflow-hidden">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block bg-primary/10 text-primary font-bold text-sm px-4 py-1.5 rounded-full mb-4">20+ ปีแห่งประสบการณ์</span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900">เส้นทางความสำเร็จ</h2>
          </div>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[88px] md:left-[108px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-violet-300 via-blue-300 via-emerald-300 via-amber-300 to-rose-400" />

            <div className="space-y-8">
              {[
                { year: '2003', title: 'ก่อตั้งบริษัท',            desc: 'เริ่มต้นให้บริการแนะแนวการศึกษาต่อต่างประเทศ',                     dot: 'bg-violet-500',  badge: 'bg-violet-100 text-violet-700',  card: 'border-violet-200 bg-violet-50/60' },
                { year: '2008', title: 'บุกเบิกตลาดฟิลิปปินส์',    desc: 'เป็นเอเจนซี่แรกๆ ที่นำนักเรียนไทยไปเรียนภาษาที่ฟิลิปปินส์',   dot: 'bg-blue-500',    badge: 'bg-blue-100 text-blue-700',      card: 'border-blue-200 bg-blue-50/60'   },
                { year: '2015', title: 'ขยายความร่วมมือ',           desc: 'เป็นตัวแทนสถาบันภาษากว่า 30 แห่งในฟิลิปปินส์',                  dot: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700', card: 'border-emerald-200 bg-emerald-50/60' },
                { year: '2019', title: 'รางวัลยอดเยี่ยม',           desc: 'ได้รับรางวัล Best Agency จากหลายสถาบันชั้นนำ',                    dot: 'bg-amber-500',   badge: 'bg-amber-100 text-amber-700',    card: 'border-amber-200 bg-amber-50/60' },
                { year: '2024', title: 'Rebranding เป็น Philingo',  desc: 'ปรับภาพลักษณ์เพื่อตอบโจทย์คนรุ่นใหม่และขยายตลาด',              dot: 'bg-rose-500',    badge: 'bg-rose-100 text-rose-700',      card: 'border-rose-200 bg-rose-50/60'  },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-5 md:gap-8">
                  {/* Year badge */}
                  <div className="shrink-0 w-[76px] md:w-[96px] text-right">
                    <span className={`inline-block text-sm font-black px-2.5 py-1 rounded-lg ${item.badge}`}>
                      {item.year}
                    </span>
                  </div>

                  {/* Dot */}
                  <div className="relative shrink-0 flex items-center justify-center mt-1.5">
                    <span className={`w-4 h-4 rounded-full ${item.dot} ring-4 ring-white shadow-md block`} />
                  </div>

                  {/* Content card */}
                  <div className={`flex-1 border rounded-2xl px-5 py-4 shadow-sm mb-2 ${item.card}`}>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
