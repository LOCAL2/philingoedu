/**
 * PhotoGallery — Uniform 4:3 grid gallery with lightbox
 * Spec: object-fit cover, overflow hidden, 4:3 aspect ratio, hover effects, lightbox
 */
import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

export interface GalleryItem {
  id?: number;
  imageUrl: string;
  titleTh?: string | null;
  title?: string | null;
  captionTh?: string | null;
  caption?: string | null;
}

interface PhotoGalleryProps {
  items: GalleryItem[];
  columns?: { mobile?: number; tablet?: number; desktop?: number };
}

export function PhotoGallery({ items, columns = { mobile: 1, tablet: 2, desktop: 3 } }: PhotoGalleryProps) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const openLightbox = (idx: number) => setLightboxIdx(idx);
  const closeLightbox = () => setLightboxIdx(null);

  const goNext = useCallback(() => {
    setLightboxIdx(prev => (prev !== null ? (prev + 1) % items.length : null));
  }, [items.length]);

  const goPrev = useCallback(() => {
    setLightboxIdx(prev => (prev !== null ? (prev - 1 + items.length) % items.length : null));
  }, [items.length]);

  // Keyboard navigation
  useEffect(() => {
    if (lightboxIdx === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightboxIdx, goNext, goPrev]);

  // Lock body scroll when lightbox open
  useEffect(() => {
    document.body.style.overflow = lightboxIdx !== null ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [lightboxIdx]);

  if (items.length === 0) return null;

  const colClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  } as Record<number, string>;

  const gridCols = [
    colClass[columns.mobile ?? 1],
    `sm:${colClass[columns.tablet ?? 2]}`,
    `lg:${colClass[columns.desktop ?? 3]}`,
  ].join(' ');

  const currentItem = lightboxIdx !== null ? items[lightboxIdx] : null;

  return (
    <>
      {/* ── Grid ── */}
      <div className={`grid ${gridCols} gap-4 md:gap-5`}>
        {items.map((item, idx) => {
          const label = item.titleTh ?? item.title ?? item.captionTh ?? item.caption ?? '';
          return (
            <div
              key={item.id ?? idx}
              className="group relative overflow-hidden rounded-2xl shadow-md cursor-zoom-in"
              style={{ aspectRatio: '4 / 3' }}
              onClick={() => openLightbox(idx)}
            >
              {/* Image */}
              <img
                src={item.imageUrl}
                alt={label || 'Philingo gallery'}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                onError={e => { (e.currentTarget as HTMLImageElement).closest('div')?.remove(); }}
              />

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex flex-col items-center justify-end p-3">
                {/* Zoom icon */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 mb-auto mt-3">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                    <ZoomIn className="w-5 h-5 text-white" />
                  </div>
                </div>
                {/* Caption */}
                {label && (
                  <p className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-xs font-medium text-center line-clamp-2 drop-shadow-lg">
                    {label}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Lightbox ── */}
      {lightboxIdx !== null && currentItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={closeLightbox}
        >
          {/* Close */}
          <button
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/25 text-white rounded-full p-2 transition-colors z-10"
            onClick={closeLightbox}
            aria-label="ปิด"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Prev */}
          {items.length > 1 && (
            <button
              className="absolute left-3 md:left-6 bg-white/10 hover:bg-white/25 text-white rounded-full p-3 transition-colors z-10"
              onClick={e => { e.stopPropagation(); goPrev(); }}
              aria-label="รูปก่อนหน้า"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Image */}
          <div
            className="relative max-w-[90vw] max-h-[85vh] flex flex-col items-center gap-3"
            onClick={e => e.stopPropagation()}
          >
            <img
              src={currentItem.imageUrl}
              alt={currentItem.titleTh ?? currentItem.title ?? 'Philingo gallery'}
              className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl"
            />
            {/* Caption in lightbox */}
            {(currentItem.titleTh ?? currentItem.title ?? currentItem.captionTh ?? currentItem.caption) && (
              <p className="text-white/80 text-sm text-center px-4">
                {currentItem.titleTh ?? currentItem.title ?? currentItem.captionTh ?? currentItem.caption}
              </p>
            )}
            {/* Counter */}
            <p className="text-white/50 text-xs">{lightboxIdx + 1} / {items.length}</p>
          </div>

          {/* Next */}
          {items.length > 1 && (
            <button
              className="absolute right-3 md:right-6 bg-white/10 hover:bg-white/25 text-white rounded-full p-3 transition-colors z-10"
              onClick={e => { e.stopPropagation(); goNext(); }}
              aria-label="รูปถัดไป"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>
      )}
    </>
  );
}
