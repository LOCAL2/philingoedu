import React, { useState } from 'react';

export interface FacilityItem {
  id: string;
  labelTh: string;
  label: string;
  descriptionTh: string;
  photo: string;
  emoji: string;
}

export function FacilitiesGallery({ facilities }: { facilities: FacilityItem[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = facilities.find(f => f.id === activeId) ?? null;

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
        {facilities.map((f) => (
          <button
            key={f.id}
            onClick={() => setActiveId(activeId === f.id ? null : f.id)}
            className={`relative rounded-2xl overflow-hidden aspect-[4/3] group text-left transition-all ${
              activeId === f.id ? 'ring-2 ring-primary' : ''
            }`}
          >
            <img src={f.photo} alt={f.labelTh} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-2">
              <div className="flex items-center gap-1">
                <span className="text-sm sm:text-base leading-none">{f.emoji}</span>
                <span className="text-white font-bold text-[10px] sm:text-xs leading-tight drop-shadow line-clamp-2">{f.labelTh}</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Expanded panel */}
      {active && (
        <div className="mt-4 bg-white/80 dark:bg-gray-800 rounded-2xl p-5 border border-white/80 dark:border-gray-700 flex flex-col sm:flex-row gap-4 sm:gap-5 items-start">
          <img src={active.photo} alt={active.labelTh} className="w-full sm:w-24 h-40 sm:h-20 object-cover rounded-xl shrink-0" />
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-1">
              {active.emoji} {active.labelTh} <span className="text-gray-400 font-normal text-sm">({active.label})</span>
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{active.descriptionTh}</p>
          </div>
          <button onClick={() => setActiveId(null)} className="text-gray-400 hover:text-gray-600 shrink-0 ml-auto text-xl leading-none">×</button>
        </div>
      )}
    </div>
  );
}
