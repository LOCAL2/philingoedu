import { useEffect } from 'react';
import { useSettings } from '@/hooks/use-settings';

export function TrackingScripts() {
  const { facebook_pixel_id, google_tag_id } = useSettings();

  useEffect(() => {
    // ── Facebook Pixel ──
    if (facebook_pixel_id && !document.getElementById('fb-pixel-script')) {
      const fbScript = document.createElement('script');
      fbScript.id = 'fb-pixel-script';
      fbScript.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${facebook_pixel_id}');
        fbq('track', 'PageView');
      `;
      document.head.appendChild(fbScript);

      const fbNoscript = document.createElement('noscript');
      fbNoscript.id = 'fb-pixel-noscript';
      fbNoscript.innerHTML = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${facebook_pixel_id}&ev=PageView&noscript=1" />`;
      document.head.appendChild(fbNoscript);
    }

    // ── Google Tag (gtag.js) ──
    if (google_tag_id && !document.getElementById('google-tag-script')) {
      const gScript = document.createElement('script');
      gScript.id = 'google-tag-script';
      gScript.async = true;
      gScript.src = `https://www.googletagmanager.com/gtag/js?id=${google_tag_id}`;
      document.head.appendChild(gScript);

      const gInitScript = document.createElement('script');
      gInitScript.id = 'google-tag-init';
      gInitScript.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${google_tag_id}');
      `;
      document.head.appendChild(gInitScript);
    }
  }, [facebook_pixel_id, google_tag_id]);

  return null;
}
