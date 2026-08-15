import React, { useState } from 'react';
import { Clock, ChevronDown } from 'lucide-react';

export interface TimeSlot {
  time: string;
  activity: string;
  activityEn?: string;
  type: 'one-on-one' | 'group' | 'meal' | 'self-study' | 'free';
}

export interface CourseSchedule {
  courseId: string;
  courseName: string;
  courseNameTh: string;
  tag: string;        // e.g. "1:1×4 | กลุ่ม×4"
  slots: TimeSlot[];
}

export interface TimetableConfig {
  schedules: CourseSchedule[];
  rules?: string[];
  note?: string;
}

const TYPE_COLOR: Record<string, string> = {
  'one-on-one': 'bg-blue-500',
  'group':      'bg-emerald-500',
  'meal':       'bg-amber-400',
  'self-study': 'bg-purple-500',
  'free':       'bg-gray-300 dark:bg-gray-600',
};

const TYPE_LABEL: Record<string, string> = {
  'one-on-one': 'เรียน 1:1',
  'group':      'เรียนกลุ่ม',
  'meal':       'อาหาร',
  'self-study': 'ติวเอง',
  'free':       'เวลาว่าง',
};

const TYPE_BG: Record<string, string> = {
  'one-on-one': 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500',
  'group':      'bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-emerald-500',
  'meal':       'bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400',
  'self-study': 'bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500',
  'free':       'bg-gray-50 dark:bg-gray-700/40 border-l-4 border-gray-300 dark:border-gray-600',
};

export function CourseTimetable({ config }: { config: TimetableConfig }) {
  const [active, setActive] = useState(0);
  const [showLegend, setShowLegend] = useState(false);
  const schedule = config.schedules[active];

  return (
    <div>
      {/* Course selector — dropdown on mobile, pill buttons on md+ */}
      <div className="mb-5">
        {/* Mobile: <select> dropdown */}
        <div className="md:hidden relative">
          <select
            value={active}
            onChange={e => setActive(Number(e.target.value))}
            className="w-full appearance-none bg-white dark:bg-gray-800 border-2 border-primary/40 rounded-xl px-4 py-3 pr-10 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary cursor-pointer shadow-sm"
          >
            {config.schedules.map((s, i) => (
              <option key={s.courseId} value={i}>
                {s.courseNameTh}{s.tag ? `  (${s.tag})` : ''}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>

        {/* Desktop: pill buttons */}
        <div className="hidden md:flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
          {config.schedules.map((s, i) => (
            <button
              key={s.courseId}
              onClick={() => setActive(i)}
              className={`shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                i === active
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white/80 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-primary/50'
              }`}
            >
              <span>{s.courseNameTh}</span>
              {s.tag && <span className="ml-2 text-[11px] opacity-70">{s.tag}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Schedule list */}
      <div className="space-y-1.5 mb-4">
        {schedule.slots.map((slot, i) => (
          <div key={i} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm ${TYPE_BG[slot.type]}`}>
            <span className="text-xs font-mono font-bold text-gray-500 dark:text-gray-400 w-[72px] shrink-0">{slot.time}</span>
            <span className="font-semibold text-gray-900 dark:text-white flex-1 min-w-0 text-xs sm:text-sm">{slot.activity}</span>
            <span className={`text-[10px] sm:text-[11px] font-bold text-white px-2 py-0.5 rounded-full shrink-0 ${TYPE_COLOR[slot.type]}`}>
              {TYPE_LABEL[slot.type]}
            </span>
          </div>
        ))}
      </div>

      {/* Legend — collapsible on mobile, always visible on desktop */}
      <div className="md:hidden">
        <button
          onClick={() => setShowLegend(v => !v)}
          className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 font-medium mb-2"
        >
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showLegend ? 'rotate-180' : ''}`} />
          ดูคำอธิบายสี
        </button>
        {showLegend && (
          <div className="bg-white/80 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 mb-4">
            <div className="flex flex-wrap gap-3">
              {Object.entries(TYPE_LABEL).map(([k, v]) => (
                <div key={k} className="flex items-center gap-1.5 text-xs">
                  <span className={`w-2.5 h-2.5 rounded-full ${TYPE_COLOR[k]}`} />
                  <span className="text-gray-600 dark:text-gray-400">{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Legend + rules — horizontal row on sm+, stacked on mobile */}
      <div className="flex flex-col sm:flex-row gap-4 mt-4">
        {/* Table colors */}
        <div className="bg-white/80 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 flex-1">
          <h4 className="font-bold text-gray-700 dark:text-gray-300 text-sm mb-3">สีตาราง</h4>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {Object.entries(TYPE_LABEL).map(([k, v]) => (
              <div key={k} className="flex items-center gap-2 text-sm">
                <span className={`w-3 h-3 rounded-full ${TYPE_COLOR[k]}`} />
                <span className="text-gray-600 dark:text-gray-400">{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* School rules */}
        {config.rules && config.rules.length > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl border border-yellow-200 dark:border-yellow-800 p-4 flex-1">
            <h4 className="font-bold text-yellow-800 dark:text-yellow-300 text-sm mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> กฎของโรงเรียน
            </h4>
            <ul className="space-y-1.5">
              {config.rules.map((r, i) => (
                <li key={i} className="text-xs text-yellow-700 dark:text-yellow-400 flex items-start gap-1.5">
                  <span className="mt-0.5 shrink-0">•</span>{r}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {config.note && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">{config.note}</p>
      )}
    </div>
  );
}
