import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useSeoMeta } from '@/hooks/use-seo-meta';
import { Plus, Minus } from 'lucide-react';
import { SiLine } from 'react-icons/si';
import { useSettings } from '@/hooks/use-settings';

const faqs = [
  { q: "Philingo เปิดให้บริการมานานแค่ไหน?", a: "Philingo เป็นแบรนด์ในเครือ Thai Study Abroad Consultant Co., Ltd. ซึ่งให้บริการด้านการเรียนต่างประเทศมากว่า 20 ปี เราเป็นสมาชิก TIECA (สมาคมนักเรียนต่างชาติ) และจดทะเบียนถูกต้องตามกฎหมาย" },
  { q: "ทำไมต้องไปเรียนภาษาอังกฤษที่ฟิลิปปินส์?", a: "ฟิลิปปินส์ใช้ภาษาอังกฤษเป็นภาษาราชการ มีระบบการสอนแบบตัวต่อตัว (1:1) ซึ่งให้ผลลัพธ์เร็วกว่าการเรียนแบบกลุ่ม ค่าใช้จ่ายถูกกว่าประเทศ ESL อื่นถึง 2-3 เท่า รวมค่าเรียน ที่พัก อาหาร ครบจบในที่เดียว" },
  { q: "ครูผู้สอนในฟิลิปปินส์มีคุณสมบัติอะไรบ้าง?", a: "ครูส่วนใหญ่เป็นชาวฟิลิปปินส์ที่จบปริญญาตรีและมีใบรับรองการสอนภาษาอังกฤษ (TESOL/TEFL) สำเนียงแบบอเมริกัน ฟังง่าย ชัดเจน บางสถาบันมีครู Native Speaker (อเมริกา อังกฤษ ออสเตรเลีย) ด้วย" },
  { q: "คนไม่เก่งภาษาอังกฤษเลย ไปเรียนได้ไหม?", a: "ได้แน่นอน สถาบันจะมีการทดสอบวัดระดับก่อนเริ่มเรียน และจัดตารางเรียนให้เหมาะสมกับระดับผู้เรียนแต่ละคน คลาส 1:1 ช่วยให้กล้าพูดและพัฒนาได้เร็วมาก ไม่ต้องกังวล" },
  { q: "ค่าใช้จ่ายในการไปเรียนภาษาอังกฤษที่ฟิลิปปินส์เท่าไหร่?", a: "ค่าเรียนรวมที่พัก อาหาร และซักรีด จะตกอยู่ประมาณ 35,000 - 55,000 บาท/เดือน ขึ้นอยู่กับหลักสูตรและประเภทห้องพัก ไม่รวมค่าตั๋วเครื่องบินและค่าใช้จ่ายส่วนตัว" },
  { q: "ต้องขอวีซ่าก่อนเดินทางไหม?", a: "สำหรับคนไทยไม่ต้องขอวีซ่าล่วงหน้า หากไปเรียนไม่เกิน 30 วัน หากเรียนนานกว่านั้น ทางโรงเรียนจะดำเนินการต่ออายุวีซ่า (Visa Extension) ให้ที่ฟิลิปปินส์เลย" },
  { q: "Philingo มีบริการอะไรบ้าง?", a: "เราให้บริการแบบครบวงจร ได้แก่ แนะนำและเลือกโรงเรียนที่เหมาะสม วางแผนค่าใช้จ่าย ดูแลเรื่องวีซ่าและเอกสาร จองที่พักและหลักสูตร ดูแลระหว่างเรียนตลอด 24/7 และให้คำปรึกษาฟรี ไม่มีค่าบริการเพิ่มเติม" },
  { q: "ระบบ Sparta และ Semi-Sparta คืออะไร?", a: "Sparta คือระบบที่เข้มงวด ไม่อนุญาตให้ออกนอกโรงเรียนในวันธรรมดา มีการสอบคำศัพท์ทุกวัน เหมาะกับคนที่ต้องการผลลัพธ์เร็ว ส่วน Semi-Sparta ยืดหยุ่นกว่า อนุญาตให้ออกนอกโรงเรียนได้หลังเลิกเรียน" },
  { q: "ที่พักในโรงเรียนเป็นแบบไหน?", a: "ที่พักเป็นหอพักภายในโรงเรียน มีห้องเดี่ยว (Single) ห้องคู่ (Double) ไปจนถึงห้องนอนรวม (3-4 คน) ทุกห้องมีแอร์ Wi-Fi และห้องน้ำในตัวหรือรวม พร้อมบริการอาหาร 3 มื้อ/วัน และซักรีดฟรี" },
  { q: "สนใจใช้บริการ ต้องทำอย่างไร?", a: "ง่ายมาก! เพียงแค่ติดต่อทีม Philingo ผ่าน LINE @philingo หรือกรอกฟอร์มสมัครบนเว็บ ทีมงานจะติดต่อกลับภายใน 24 ชั่วโมง ให้คำปรึกษาฟรี ไม่มีค่าใช้จ่าย" },
];

export default function FAQ() {
  const [openItems, setOpenItems] = useState<Record<number, boolean>>({});
  useSeoMeta(
    'คำถามที่พบบ่อย เรียนต่อฟิลิปปินส์ | Philingo',
    'รวมคำถาม-คำตอบเกี่ยวกับการเรียนภาษาอังกฤษที่ฟิลิปปินส์ ค่าใช้จ่าย วีซ่า และการเตรียมตัวก่อนเดินทาง'
  );
  const settings = useSettings();
  const lineUrl = settings.line_url || 'https://lin.ee/nBR4rsN';

  const toggleItem = (i: number) => {
    setOpenItems(prev => ({ ...prev, [i]: !prev[i] }));
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-primary pt-24 pb-16">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-white mb-6">คำถามที่พบบ่อย (FAQ)</h1>
          <p className="text-primary-foreground/80 text-xl">
            รวบรวมทุกข้อสงสัยเกี่ยวกับการเรียนภาษาที่ฟิลิปปินส์
          </p>
        </div>
      </section>

      {/* Accordion */}
      <section className="py-16 bg-background">
        <div className="container max-w-3xl mx-auto px-4">
          <div className="border border-border rounded-2xl overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
            {faqs.map((item, idx) => {
              const isOpen = openItems[idx];
              return (
                <div key={idx} className={`border-b border-gray-200 dark:border-gray-700 last:border-b-0`}>
                  <button
                    onClick={() => toggleItem(idx)}
                    className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors focus:outline-none"
                  >
                    <span className={`text-base font-bold leading-snug ${isOpen ? 'text-primary' : 'text-primary'}`}>
                      {item.q}
                    </span>
                    <span className={`shrink-0 w-8 h-8 rounded-full border-2 ${isOpen ? 'border-primary bg-primary text-white' : 'border-primary text-primary'} flex items-center justify-center transition-all`}>
                      {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </span>
                  </button>

                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
                    <p className="px-6 pb-5 text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
                      {item.a}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA */}
          <div className="mt-12 text-center bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-border">
            <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">ไม่พบคำตอบที่คุณตามหา?</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">ทีมงานผู้เชี่ยวชาญของเราพร้อมตอบทุกข้อสงสัยของคุณ ฟรี ไม่มีค่าใช้จ่าย</p>
            <a
              href={lineUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-[#00B900] hover:bg-[#00A000] text-white px-8 py-3 rounded-xl font-bold transition-transform hover:scale-105"
            >
              สอบถามผ่าน LINE {settings.line_id || '@philingo'}
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
}
