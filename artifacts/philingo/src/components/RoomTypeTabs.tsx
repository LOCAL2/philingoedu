import React, { useState } from 'react';
import { Users, Bath, Wifi, Wind, Tv, Shirt, ChevronLeft, ChevronRight, CheckCircle2, ChevronDown } from 'lucide-react';
import { SiLine } from 'react-icons/si';
import { useSettings } from '@/hooks/use-settings';

export interface RoomTypeDetail {
  id: string;
  name: string;       // EN
  nameTh: string;
  capacity: number;
  bedConfig: string;  // e.g. "เตียงเดี่ยว 3 หลัง"
  size?: string;      // e.g. "18 ตร.ม."
  bathroom: 'private' | 'shared';
  pricePerWeek: number;
  priceNote?: string;
  amenities: string[];
  photos: string[];   // at least 1 photo
  description?: string;
}

const AMENITY_ICON: Record<string, React.ComponentType<any>> = {
  'Wi-Fi': Wifi,
  'แอร์': Wind,
  'ห้องน้ำในตัว': Bath,
  'ห้องน้ำรวม': Bath,
  'TV': Tv,
  'ซักรีดฟรี': Shirt,
};


export function RoomTypeTabs({ rooms, schoolName }: { rooms: RoomTypeDetail[]; schoolName: string }) {
  const settings = useSettings();
  const LINE_URL = settings.line_url || 'https://lin.ee/zmlkhOn0';
  const [active, setActive] = useState(0);
  const [photo, setPhoto] = useState(0);
  const room = rooms[active];

  const handleTabChange = (i: number) => { setActive(i); setPhoto(0); };

  return (
    <div>
      {/* Mobile: native dropdown selector */}
      <div className="sm:hidden mb-4">
        <div className="relative">
          <select
            value={active}
            onChange={e => handleTabChange(Number(e.target.value))}
            className="w-full appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 pr-10 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            {rooms.map((r, i) => (
              <option key={r.id} value={i}>{r.nameTh} — {r.capacity} คน/ห้อง</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
        <p className="text-xs text-gray-400 mt-1">{rooms.length} ประเภทห้องพัก — เลือกเพื่อดูรายละเอียดและราคา</p>
      </div>

      {/* Desktop: Tab strip */}
      <div className="hidden sm:flex gap-2 overflow-x-auto pb-2 hide-scrollbar mb-6">
        {rooms.map((r, i) => (
          <button
            key={r.id}
            onClick={() => handleTabChange(i)}
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-semibold border transition-all shrink-0 ${
              i === active
                ? 'bg-primary text-white border-primary shadow-md'
                : 'bg-white/80 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-primary/50'
            }`}
          >
            {r.nameTh}
          </button>
        ))}
      </div>

      {/* Room panel */}
      <div className="grid md:grid-cols-5 gap-6 bg-white/80 dark:bg-gray-800 rounded-2xl border border-white/80 dark:border-gray-700 overflow-hidden shadow-sm">
        {/* Photos */}
        <div className="md:col-span-3 relative">
          <div className="aspect-[16/10] relative overflow-hidden bg-gray-100 dark:bg-gray-700">
            <img
              key={`${active}-${photo}`}
              src={room.photos[photo]}
              alt={room.nameTh}
              className="w-full h-full object-cover"
              loading={photo === 0 && active === 0 ? 'eager' : 'lazy'}
              fetchPriority={photo === 0 && active === 0 ? 'high' : 'auto'}
              decoding="async"
            />
            {room.photos.length > 1 && (
              <>
                <button
                  onClick={() => setPhoto(p => Math.max(0, p - 1))}
                  disabled={photo === 0}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-9 h-9 rounded-full flex items-center justify-center transition disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPhoto(p => Math.min(room.photos.length - 1, p + 1))}
                  disabled={photo === room.photos.length - 1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-9 h-9 rounded-full flex items-center justify-center transition disabled:opacity-30"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                {/* Dots */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {room.photos.map((_, i) => (
                    <button key={i} onClick={() => setPhoto(i)}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${i === photo ? 'bg-white w-4' : 'bg-white/50'}`} />
                  ))}
                </div>
              </>
            )}
            {/* Capacity badge */}
            <div className="absolute top-3 left-3 bg-black/60 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              {room.capacity} คน/ห้อง
            </div>
          </div>

          {/* Thumbnail strip */}
          {room.photos.length > 1 && (
            <div className="flex gap-2 p-3 overflow-x-auto hide-scrollbar">
              {room.photos.map((p, i) => (
                <button key={i} onClick={() => setPhoto(i)}
                  className={`shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${i === photo ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                  <img src={p} alt={`รูป${room.nameTh} ${i + 1}`} loading="lazy" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="md:col-span-2 p-6 flex flex-col">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{room.nameTh}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{room.name}</p>

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3 text-center">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">ที่นอน</div>
              <div className="font-bold text-gray-900 dark:text-white text-sm">{room.bedConfig}</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3 text-center">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">ห้องน้ำ</div>
              <div className="font-bold text-gray-900 dark:text-white text-sm">
                {room.bathroom === 'private' ? '🚿 ในตัว' : '🚪 รวม'}
              </div>
            </div>
            {room.size && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3 text-center">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">ขนาด</div>
                <div className="font-bold text-gray-900 dark:text-white text-sm">{room.size}</div>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="text-3xl font-black text-primary mb-1">
            ฿{room.pricePerWeek.toLocaleString()}
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400">/สัปดาห์</span>
          </div>
          {room.priceNote && <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">{room.priceNote}</p>}

          {/* Amenities */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            {room.amenities.map((a, i) => (
              <span key={i} className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">
                <CheckCircle2 className="w-3 h-3" /> {a}
              </span>
            ))}
          </div>

          {room.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">{room.description}</p>
          )}

          <div className="mt-auto">
            <a href={LINE_URL} target="_blank" rel="noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-[#00B900] hover:bg-[#009900] text-white font-bold py-3 rounded-xl transition-all text-sm">
              <SiLine className="w-4 h-4" /> สอบถามห้องว่าง
            </a>
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
        * รวมอาหาร 3 มื้อ + ซักรีด · ราคาอาจปรับตามฤดูกาล ยืนยันราคาจริงกับทีม Philingo ก่อนจอง
      </p>
    </div>
  );
}
