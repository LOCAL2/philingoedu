import React from 'react';
import { Link } from 'wouter';
import { useLanguage } from '../../lib/language-context';
import { SiLine, SiFacebook, SiTiktok, SiInstagram, SiYoutube } from 'react-icons/si';
import { Phone, MapPin, Mail } from 'lucide-react';
import logo from '@assets/phinlingo_1785171349898.png';
import { useSettings } from '../../hooks/use-settings';

export function Footer() {
  const { t } = useLanguage();
  const settings = useSettings();

  const social = {
    line:      settings.line_url || '#',
    facebook:  settings.facebook_url          || '#',
    tiktok:    settings.tiktok_url            || '#',
    instagram: settings.instagram_url         || '#',
    youtube:   settings.youtube_url           || '#',
  };

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pt-16 pb-8">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <img src={logo} alt="Philingo" className="h-12 w-auto" />
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              {t('footer.tagline')}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 whitespace-pre-line leading-relaxed">
              {t('footer.address')}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium tracking-wide">
              Thai Study Abroad Consultant Co., Ltd.
            </p>
            <div className="flex space-x-3 pt-2">
              <a href={social.line} target="_blank" rel="noreferrer"
                 className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-[#00B900] hover:text-white transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5">
                <SiLine className="w-5 h-5" />
              </a>
              <a href={social.facebook} target="_blank" rel="noreferrer"
                 className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-[#1877F2] hover:text-white transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5">
                <SiFacebook className="w-5 h-5" />
              </a>
              <a href={social.tiktok} target="_blank" rel="noreferrer"
                 className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-black hover:text-white transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5">
                <SiTiktok className="w-5 h-5" />
              </a>
              <a href={social.instagram} target="_blank" rel="noreferrer"
                 className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-[#E4405F] hover:text-white transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5">
                <SiInstagram className="w-5 h-5" />
              </a>
              <a href={social.youtube} target="_blank" rel="noreferrer"
                 className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-[#FF0000] hover:text-white transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5">
                <SiYoutube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* เมนูลัด — spans 2 columns */}
          <div className="lg:col-span-2">
            <h3 className="font-bold text-xl mb-6 text-gray-900 dark:text-white">เมนูลัด</h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-gray-600 dark:text-gray-400">
              <Link href="/" className="hover:text-primary transition-colors">หน้าแรก</Link>
              <Link href="/promotions" className="hover:text-primary transition-colors">โปรโมชั่น</Link>
              <Link href="/about" className="hover:text-primary transition-colors">เกี่ยวกับเรา</Link>
              <Link href="/seminars" className="hover:text-primary transition-colors">งานสัมมนา</Link>
              <Link href="/services" className="hover:text-primary transition-colors">บริการ</Link>
              <Link href="/reviews" className="hover:text-primary transition-colors">รีวิวนักเรียน</Link>
              <Link href="/why-philippines" className="hover:text-primary transition-colors">เรียนที่ฟิลิปปินส์</Link>
              <Link href="/blog" className="hover:text-primary transition-colors">บทความ</Link>
              <Link href="/courses" className="hover:text-primary transition-colors">หลักสูตร</Link>
              <Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link>
              <Link href="/schools" className="hover:text-primary transition-colors">โรงเรียน</Link>
              <Link href="/contact" className="hover:text-primary transition-colors">ติดต่อเรา</Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-gray-900 dark:text-white">{t('footer.contact_info')}</h3>
            <ul className="space-y-4 text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span>{settings.phone || '061-656-4159'}</span>
              </li>
              <li className="flex items-start gap-3">
                <SiLine className="w-5 h-5 text-[#00B900] shrink-0 mt-0.5" />
                <span>{settings.line_id || '@philingo'}</span>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <span>{settings.contact_email}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 pt-8 mt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500 dark:text-gray-500">
            {t('footer.copyright')}
          </p>
          <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-500">
            <Link href="/privacy" className="hover:text-primary transition-colors">{t('footer.privacy')}</Link>
            <span>|</span>
            <Link href="/terms" className="hover:text-primary transition-colors">{t('footer.terms')}</Link>
            <span>|</span>
            <Link href="/cookie" className="hover:text-primary transition-colors">{t('footer.cookie')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
