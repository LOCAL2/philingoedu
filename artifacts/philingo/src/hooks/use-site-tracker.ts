import { useEffect } from 'react';

const BASE = (import.meta.env.BASE_URL ?? '').replace(/\/$/, '');

/**
 * Tracks one page-view per session and enforces image-protection if enabled.
 */
export function useSiteTracker() {
  // Page-view: fire once per browser session
  useEffect(() => {
    const SESSION_KEY = 'ph_tracked';
    if (sessionStorage.getItem(SESSION_KEY)) return;
    sessionStorage.setItem(SESSION_KEY, '1');
    fetch(`${BASE}/api/analytics/track`, { method: 'POST' }).catch(() => {});
  }, []);

  // Image protection: fetch setting and apply
  useEffect(() => {
    let cleanup: (() => void) | null = null;

    fetch(`${BASE}/api/settings`, { cache: 'no-store' })
      .then(r => r.ok ? r.json() : {})
      .then((s: Record<string, string>) => {
        if (s.image_protection !== 'on') return;

        const blockCtx = (e: MouseEvent) => {
          if (e.target instanceof HTMLImageElement) e.preventDefault();
        };
        const blockDrag = (e: DragEvent) => {
          if (e.target instanceof HTMLImageElement) e.preventDefault();
        };

        document.addEventListener('contextmenu', blockCtx);
        document.addEventListener('dragstart', blockDrag);

        cleanup = () => {
          document.removeEventListener('contextmenu', blockCtx);
          document.removeEventListener('dragstart', blockDrag);
        };
      })
      .catch(() => {});

    return () => { cleanup?.(); };
  }, []);
}
