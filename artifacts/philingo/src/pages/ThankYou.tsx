import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { motion } from 'framer-motion';
import { CheckCircle2, Home } from 'lucide-react';
import { Link } from 'wouter';
import { SiLine } from 'react-icons/si';
import { settingsApi } from '@/lib/api';

// Simple confetti component
const Confetti = () => {
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    const colors = ['#1B4FD8', '#F5B800', '#38BDF8', '#10B981', '#EF4444'];
    const newParticles = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 2,
      duration: Math.random() * 2 + 1,
      size: Math.random() * 10 + 5
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute top-[-10%]"
          initial={{ y: 0, x: `${p.x}vw`, opacity: 1, rotate: 0 }}
          animate={{ 
            y: '110vh', 
            x: `${p.x + (Math.random() * 20 - 10)}vw`,
            rotate: 360 * p.duration,
            opacity: [1, 1, 0]
          }}
          transition={{ 
            duration: p.duration, 
            delay: p.delay, 
            repeat: Infinity,
            ease: "linear"
          }}
          style={{ 
            width: p.size, 
            height: p.size, 
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px'
          }}
        />
      ))}
    </div>
  );
};

export default function ThankYou() {
  const [lineUrl, setLineUrl] = useState('https://lin.ee/nBR4rsN');

  useEffect(() => {
    settingsApi.getAll().then(s => {
      if (s.line_url) setLineUrl(s.line_url);
      else if (s.line_id) setLineUrl(`https://line.me/R/ti/p/${s.line_id.startsWith('@') ? encodeURIComponent(s.line_id) : s.line_id}`);
    }).catch(() => {});
  }, []);

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 dark:bg-gray-900 relative">
        <Confetti />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="container max-w-2xl mx-auto px-4 text-center relative z-10"
        >
          <div className="bg-white dark:bg-gray-800 p-10 md:p-16 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              className="w-24 h-24 bg-green-100 dark:bg-green-900/30 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8"
            >
              <CheckCircle2 className="w-12 h-12" />
            </motion.div>

            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">ขอบคุณที่สนใจ Philingo!</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              เราได้รับข้อมูลของคุณเรียบร้อยแล้ว<br/>
              เจ้าหน้าที่ผู้เชี่ยวชาญของเราจะติดต่อกลับภายใน 24 ชั่วโมง
            </p>

            {/* LINE add-friend CTA */}
            <div className="bg-[#00B900]/10 border-2 border-[#00B900] rounded-2xl p-8 mb-8 relative overflow-hidden shadow-lg shadow-[#00B900]/10">
              <div className="absolute top-0 left-0 w-full h-2 bg-[#00B900]"></div>
              
              <div className="inline-flex items-center justify-center bg-[#00B900] text-white px-4 py-1 rounded-full text-sm font-bold mb-4 animate-pulse">
                ⚠️ ขั้นตอนสุดท้าย
              </div>

              <div className="flex flex-col items-center justify-center gap-3 mb-4">
                <SiLine className="w-12 h-12 text-[#00B900]" />
                <h2 className="font-extrabold text-gray-900 dark:text-white text-2xl">
                  กรุณาเพิ่มเพื่อน LINE Official
                </h2>
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg max-w-md mx-auto leading-relaxed">
                เพื่อให้เจ้าหน้าที่ยืนยันการสมัครและส่งข้อมูลรายละเอียดให้คุณได้อย่างรวดเร็ว <b>กรุณากดเพิ่มเพื่อนและทักแชทหาเราทันทีครับ</b>
              </p>
              
              <a
                href={lineUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-3 bg-[#00B900] hover:bg-[#00A000] text-white px-10 py-4 rounded-full font-bold text-xl transition-all hover:scale-105 shadow-xl hover:shadow-[#00B900]/40 w-full sm:w-auto"
              >
                <SiLine className="w-6 h-6" />
                คลิกเพื่อเพิ่มเพื่อน LINE
              </a>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-2xl mb-8 text-left border border-blue-100 dark:border-blue-800/50">
              <h3 className="font-bold text-blue-900 dark:text-blue-400 mb-2">ระหว่างรอการติดต่อกลับ:</h3>
              <ul className="space-y-1.5 text-sm text-blue-800 dark:text-blue-300">
                <li>• เพิ่มเพื่อน LINE เพื่อให้เจ้าหน้าที่ติดต่อได้เร็วที่สุด</li>
                <li>• ติดตามข่าวสารและโปรโมชั่นผ่านช่องทาง Social Media</li>
                <li>• เตรียมคำถามหรือข้อสงสัยไว้พูดคุยกับเจ้าหน้าที่ได้เลย</li>
              </ul>
            </div>

            <Link href="/" className="inline-flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-6 py-3 rounded-xl font-bold transition-transform hover:scale-105">
              <Home className="w-5 h-5" /> กลับสู่หน้าแรก
            </Link>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
