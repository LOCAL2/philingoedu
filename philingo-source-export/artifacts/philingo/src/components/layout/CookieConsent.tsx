import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/language-context';

export function CookieConsent() {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('philingo_cookie_consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem('philingo_cookie_consent', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
      <div className="container max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-gray-600 dark:text-gray-300 flex-1">
          เว็บไซต์นี้ใช้คุกกี้เพื่อมอบประสบการณ์การใช้งานที่ดีที่สุดของคุณ หากคุณใช้งานเว็บไซต์ต่อ เราถือว่าคุณยอมรับ <a href="#" className="text-primary hover:underline">นโยบายความเป็นส่วนตัว</a> และ <a href="#" className="text-primary hover:underline">นโยบายคุกกี้</a> ของเรา
        </div>
        <div className="flex gap-3 shrink-0">
          <button onClick={() => setIsVisible(false)} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors">
            ตั้งค่าคุกกี้
          </button>
          <button onClick={acceptAll} className="px-5 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md transition-colors">
            ยอมรับทั้งหมด
          </button>
        </div>
      </div>
    </div>
  );
}
