import { useEffect } from 'react';

// Mutable module-level defaults — updated once site_settings loads via setSeoGlobalDefaults()
const _defaults = {
  title: 'Philingo — Study English, Live Philippines',
  desc: 'Philingo — ที่ปรึกษาเรียนต่อฟิลิปปินส์อันดับ 1 ของไทย บริการครบวงจร ตั้งแต่เลือกโรงเรียน จองที่พัก รับโปรโมชั่น และดูแลตลอดการเรียน',
};

/**
 * Call once from App when site_settings loads (seo_title / seo_description).
 * Keeps the restore-on-unmount value in sync with the admin-configured global SEO.
 */
export function setSeoGlobalDefaults(title: string, desc: string) {
  if (title) _defaults.title = title;
  if (desc)  _defaults.desc  = desc;
}

/**
 * Sets per-page <title>, <meta description>, <meta keywords> (+ OG equivalents).
 * Restores to the site-wide defaults (from site_settings) on unmount.
 */
export function useSeoMeta(title: string, description: string, keywords?: string) {
  useEffect(() => {
    // <title>
    document.title = title;

    // <meta name="description">
    const metaDesc = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (metaDesc) metaDesc.content = description;

    // <meta name="keywords">
    let metaKeywords = document.querySelector<HTMLMetaElement>('meta[name="keywords"]');
    if (keywords) {
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.name = 'keywords';
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.content = keywords;
    }

    // OG title / description
    const ogTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]');
    if (ogTitle) ogTitle.content = title;

    const ogDesc = document.querySelector<HTMLMetaElement>('meta[property="og:description"]');
    if (ogDesc) ogDesc.content = description;

    return () => {
      // Restore to site-wide defaults (pulled from admin site_settings via setSeoGlobalDefaults)
      document.title = _defaults.title;
      if (metaDesc) metaDesc.content = _defaults.desc;
      if (metaKeywords) metaKeywords.content = '';
      if (ogTitle)  ogTitle.content  = _defaults.title;
      if (ogDesc)   ogDesc.content   = _defaults.desc;
    };
  }, [title, description, keywords]);
}
