import React from 'react';
import { Link } from 'wouter';
import { Phone, ArrowUp } from 'lucide-react';
import { SiLine, SiTiktok, SiMessenger, SiFacebook } from 'react-icons/si';
import { useSettings } from '../../hooks/use-settings';

const LINE_URL_DEFAULT = 'https://lin.ee/nBR4rsN';
const MESSENGER_URL_DEFAULT = 'https://m.me/philingo.th';
const TIKTOK_URL = 'https://www.tiktok.com/@philingo?is_from_webapp=1&sender_device=pc';

/* ── Mobile FAB (extracted as proper component so hooks work correctly) ── */
function MobileFab({
  lineUrl,
  messengerUrl,
  facebookUrl,
  phone,
  phoneClean,
  showTop,
  scrollToTop,
}: {
  lineUrl: string;
  messengerUrl: string;
  facebookUrl: string;
  phone: string;
  phoneClean: string;
  showTop: boolean;
  scrollToTop: () => void;
}) {
  const [fabOpen, setFabOpen] = React.useState(false);

  // Option C: "ติดต่อ >" label — fade in 4s, show once per session
  const [showLabel, setShowLabel] = React.useState(false);
  const [labelVisible, setLabelVisible] = React.useState(false);
  React.useEffect(() => {
    // Already shown this session — no timers needed, no cleanup to return
    if (sessionStorage.getItem('fabLabelShown')) return;
    setShowLabel(true);
    // Slight delay so CSS transition runs on mount
    const fadeIn = setTimeout(() => setLabelVisible(true), 50);
    // Start fade-out at 3s
    const fadeOut = setTimeout(() => setLabelVisible(false), 3000);
    // Remove from DOM + mark shown at 4s
    const hide = setTimeout(() => {
      setShowLabel(false);
      sessionStorage.setItem('fabLabelShown', '1');
    }, 4000);
    return () => { clearTimeout(fadeIn); clearTimeout(fadeOut); clearTimeout(hide); };
  }, []);

  return (
    <div className="md:hidden fixed bottom-24 right-3 z-[51] flex flex-col items-end gap-2">
      {/* Expanded options — slide in from below when open */}
      {fabOpen && (
        <div className="flex flex-col items-end gap-2 mb-1">
          {/* LINE */}
          <a
            href={lineUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="ติดต่อผ่าน LINE"
            className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-full shadow-lg pr-4 pl-2 py-2 text-xs font-semibold text-gray-800 dark:text-white border border-gray-100 dark:border-gray-700 active:scale-95 transition-all"
          >
            <span className="w-7 h-7 bg-[#00B900] rounded-full flex items-center justify-center shrink-0">
              <SiLine className="w-3.5 h-3.5 text-white" />
            </span>
            LINE OA
          </a>

          {/* Phone */}
          <a
            href={`tel:${phoneClean}`}
            aria-label={`โทร ${phone}`}
            className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-full shadow-lg pr-4 pl-2 py-2 text-xs font-semibold text-gray-800 dark:text-white border border-gray-100 dark:border-gray-700 active:scale-95 transition-all"
          >
            <span className="w-7 h-7 bg-primary rounded-full flex items-center justify-center shrink-0">
              <Phone className="w-3.5 h-3.5 text-white" />
            </span>
            {phone}
          </a>

          {/* Messenger — only if admin has set messenger_url */}
          {messengerUrl && (
            <a
              href={messengerUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook Messenger"
              className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-full shadow-lg pr-4 pl-2 py-2 text-xs font-semibold text-gray-800 dark:text-white border border-gray-100 dark:border-gray-700 active:scale-95 transition-all"
            >
              <span className="w-7 h-7 bg-gradient-to-tr from-[#00C6FF] to-[#0072FF] rounded-full flex items-center justify-center shrink-0">
                <SiMessenger className="w-3.5 h-3.5 text-white" />
              </span>
              Messenger
            </a>
          )}

          {/* Facebook — only if admin has set facebook_url */}
          {facebookUrl && (
            <a
              href={facebookUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-full shadow-lg pr-4 pl-2 py-2 text-xs font-semibold text-gray-800 dark:text-white border border-gray-100 dark:border-gray-700 active:scale-95 transition-all"
            >
              <span className="w-7 h-7 bg-[#1877F2] rounded-full flex items-center justify-center shrink-0">
                <SiFacebook className="w-3.5 h-3.5 text-white" />
              </span>
              Facebook
            </a>
          )}

          {/* TikTok */}
          <a
            href={TIKTOK_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="TikTok @philingo"
            className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-full shadow-lg pr-4 pl-2 py-2 text-xs font-semibold text-gray-800 dark:text-white border border-gray-100 dark:border-gray-700 active:scale-95 transition-all"
          >
            <span className="w-7 h-7 bg-black rounded-full flex items-center justify-center shrink-0">
              <SiTiktok className="w-3.5 h-3.5 text-white" />
            </span>
            TikTok
          </a>

          {/* Back to top — only when user has scrolled down */}
          {showTop && (
            <button
              onClick={() => { scrollToTop(); setFabOpen(false); }}
              aria-label="กลับขึ้นด้านบน"
              className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-full shadow-lg pr-4 pl-2 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-700 active:scale-95 transition-all"
            >
              <span className="w-7 h-7 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center shrink-0">
                <ArrowUp className="w-3.5 h-3.5" />
              </span>
              ด้านบน
            </button>
          )}
        </div>
      )}

      {/* Main FAB toggle — row: label (left) + button (right) */}
      <div className="flex items-center gap-2">
        {/* "ติดต่อ >" label — fades in on first visit, pointer-events-none so it never blocks taps */}
        {showLabel && (
          <div
            aria-hidden="true"
            className={`pointer-events-none bg-white/95 dark:bg-gray-800/95 shadow-lg rounded-full px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-200 whitespace-nowrap select-none
              transition-all duration-700 ease-in-out
              ${labelVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'}`}
          >
            ติดต่อ &gt;
          </div>
        )}
        <button
          onClick={() => setFabOpen(v => !v)}
          aria-label={fabOpen ? 'ปิดเมนู' : 'ติดต่อเรา'}
          className={`w-12 h-12 flex items-center justify-center rounded-full shadow-xl transition-all active:scale-95 ${
            fabOpen
              ? 'bg-gray-700 text-white'
              : 'bg-primary text-white'
          }`}
        >
          {fabOpen ? (
            <span className="text-2xl font-bold leading-none">×</span>
          ) : (
            <SiLine className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
}

/* ── Main export ── */
export function FloatingButtons() {
  const [showTop, setShowTop] = React.useState(false);
  const [showPhone, setShowPhone] = React.useState(false);

  const settings = useSettings();

  const messengerUrl = settings.messenger_url ?? '';
  const facebookUrl = settings.facebook_url ?? '';
  const lineUrl = settings.line_url || LINE_URL_DEFAULT;
  const phone = settings.phone || '061-656-4159';
  const phoneClean = phone.replace(/[^0-9]/g, '');

  React.useEffect(() => {
    const handleScroll = () => setShowTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <>
      {/* ── Desktop: full stack (right-6) ── */}
      <div className="hidden md:flex fixed bottom-6 right-6 z-40 flex-col items-end gap-3">
        {/* สมัครเรียน – desktop only */}
        <Link
          href="/register"
          className="flex items-center justify-center bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold px-5 py-3 rounded-full shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
        >
          สมัครเรียน
        </Link>

        {/* LINE */}
        <a href={lineUrl} target="_blank" rel="noreferrer" title="LINE Official" aria-label="ติดต่อผ่าน LINE"
          className="w-12 h-12 flex items-center justify-center bg-[#00B900] text-white rounded-full shadow-lg hover:scale-110 hover:shadow-xl transition-all">
          <SiLine className="w-6 h-6" />
        </a>

        {/* Facebook Messenger — only if admin has set messenger_url */}
        {messengerUrl && (
          <a href={messengerUrl} target="_blank" rel="noreferrer" title="Facebook Messenger" aria-label="ติดต่อผ่าน Facebook Messenger"
            className="w-12 h-12 flex items-center justify-center bg-gradient-to-tr from-[#00C6FF] to-[#0072FF] text-white rounded-full shadow-lg hover:scale-110 hover:shadow-xl transition-all">
            <SiMessenger className="w-6 h-6" />
          </a>
        )}

        {/* Facebook — only if admin has set facebook_url */}
        {facebookUrl && (
          <a href={facebookUrl} target="_blank" rel="noreferrer" title="Facebook" aria-label="ติดตามผ่าน Facebook"
            className="w-12 h-12 flex items-center justify-center bg-[#1877F2] text-white rounded-full shadow-lg hover:scale-110 hover:shadow-xl transition-all">
            <SiFacebook className="w-6 h-6" />
          </a>
        )}

        {/* TikTok */}
        <a href={TIKTOK_URL} target="_blank" rel="noreferrer" title="TikTok @philingo" aria-label="ติดตามผ่าน TikTok"
          className="w-12 h-12 flex items-center justify-center bg-black text-white rounded-full shadow-lg hover:scale-110 hover:shadow-xl transition-all">
          <SiTiktok className="w-5 h-5" />
        </a>

        {/* Phone */}
        <div className="relative flex items-center gap-2">
          {showPhone && (
            <a href={`tel:${phoneClean}`}
              className="bg-white dark:bg-gray-800 text-primary font-bold text-sm px-4 py-2.5 rounded-full shadow-lg border border-gray-100 dark:border-gray-700 whitespace-nowrap hover:bg-primary hover:text-white transition-colors">
              {phone}
            </a>
          )}
          <button onClick={() => setShowPhone(v => !v)} title={`โทร ${phone}`} aria-label={`โทร ${phone}`}
            className="w-12 h-12 flex items-center justify-center bg-primary text-white rounded-full shadow-lg hover:scale-110 hover:shadow-xl transition-all">
            <Phone className="w-5 h-5" />
          </button>
        </div>

        {/* Back to top */}
        <button onClick={scrollToTop} aria-label="กลับขึ้นด้านบน"
          className={`w-12 h-12 flex items-center justify-center bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all ${
            showTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
          }`}>
          <ArrowUp className="w-5 h-5" />
        </button>
      </div>

      {/* ── Mobile: collapsible FAB ── */}
      <MobileFab
        lineUrl={lineUrl}
        messengerUrl={messengerUrl}
        facebookUrl={facebookUrl}
        phone={phone}
        phoneClean={phoneClean}
        showTop={showTop}
        scrollToTop={scrollToTop}
      />
    </>
  );
}
