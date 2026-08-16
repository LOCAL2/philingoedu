import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Table } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Modal } from '@/components/ui/Modal';
import { SearchBar } from '@/components/ui/SearchBar';
import { Toggle } from '@/components/ui/toggle';
import { StatusBadge } from '@/components/ui/badge';
import { useCrud } from '@/hooks/useCrud';
import { coursesApi, Course } from '@/lib/api';
import { Plus, Pencil, Trash2, CalendarDays, ChevronDown, ChevronUp, GripVertical, X } from 'lucide-react';

const BASE = (import.meta.env.BASE_URL ?? '').replace(/\/$/, '');

const SCHOOL_OPTIONS = [
  { value: '', label: '🌐 ทุกโรงเรียน (Global)' },
  { value: 'cia',        label: 'CIA (Cebu International Academy)' },
  { value: 'qq-english', label: 'QQ English' },
  { value: 'philinter',  label: 'Philinter Academy' },
  { value: 'b-cebu',     label: "B'Cebu (Cebu)" },
  { value: 'bcebu',      label: "B'Cebu (Baguio City)" },
  { value: 'cpils',      label: 'CPILS' },
  { value: 'ev-academy', label: 'EV Academy' },
  { value: 'smeag',      label: 'SMEAG Global School' },
  { value: 'pines',      label: 'PINES International Academy' },
];

const SLOT_TYPES = [
  { value: 'one-on-one', label: '🔵 เรียน 1:1', color: 'bg-blue-100 text-blue-700' },
  { value: 'group',      label: '🟢 เรียนกลุ่ม', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'meal',       label: '🟡 อาหาร', color: 'bg-amber-100 text-amber-700' },
  { value: 'self-study', label: '🟣 ติวเอง', color: 'bg-purple-100 text-purple-700' },
  { value: 'free',       label: '⚪ เวลาว่าง', color: 'bg-gray-100 text-gray-600' },
];

// Default daily schedule template
const DEFAULT_SLOTS = [
  { time: '07:00 – 08:00', activity: 'อาหารเช้า (Breakfast)', type: 'meal' },
  { time: '08:00 – 08:50', activity: 'เรียน 1 ต่อ 1 ชั่วโมงที่ 1', type: 'one-on-one' },
  { time: '09:00 – 09:50', activity: 'เรียน 1 ต่อ 1 ชั่วโมงที่ 2', type: 'one-on-one' },
  { time: '10:00 – 10:50', activity: 'เรียน 1 ต่อ 1 ชั่วโมงที่ 3', type: 'one-on-one' },
  { time: '11:00 – 11:50', activity: 'เรียน 1 ต่อ 1 ชั่วโมงที่ 4', type: 'one-on-one' },
  { time: '12:00 – 13:00', activity: 'อาหารกลางวัน (Lunch)', type: 'meal' },
  { time: '13:00 – 13:50', activity: 'เรียนกลุ่ม ชั่วโมงที่ 1', type: 'group' },
  { time: '14:00 – 14:50', activity: 'เรียนกลุ่ม ชั่วโมงที่ 2', type: 'group' },
  { time: '15:00 – 15:50', activity: 'เรียนกลุ่ม ชั่วโมงที่ 3', type: 'group' },
  { time: '16:00 – 16:50', activity: 'เรียนกลุ่ม ชั่วโมงที่ 4', type: 'group' },
  { time: '17:00 – 18:00', activity: 'เวลาอิสระ / กิจกรรม', type: 'free' },
  { time: '18:00 – 19:00', activity: 'อาหารเย็น (Dinner)', type: 'meal' },
  { time: '19:00 – 22:00', activity: 'ติวเอง (Self-Study)', type: 'self-study' },
  { time: '22:00', activity: 'เคอร์ฟิว (Curfew)', type: 'free' },
];

const DEFAULT_RULES = [
  'ห้ามใช้ภาษาไทยในบริเวณโรงเรียน (English Only Zone)',
  'ห้ามออกนอกแคมปัสหลัง 22:00 น.',
  'ช่วง Self-Study ต้องอยู่ในห้องสมุดหรือห้องพัก',
  'ห้ามดื่มแอลกอฮอล์ในบริเวณแคมปัส',
  'ต้องเข้าชั้นเรียนครบ 100% ยกเว้นมีใบรับรองแพทย์',
];

type SlotRow = { time: string; activity: string; type: string };

interface TimetableEditorProps {
  value: { tag: string; slots: SlotRow[]; rules: string[]; note: string } | null;
  onChange: (v: { tag: string; slots: SlotRow[]; rules: string[]; note: string } | null) => void;
}

function TimetableEditor({ value, onChange }: TimetableEditorProps) {
  const [open, setOpen] = useState(!!value?.slots?.length);
  const [tag, setTag] = useState(value?.tag ?? '');
  const [slots, setSlots] = useState<SlotRow[]>(value?.slots ?? []);
  const [rules, setRules] = useState((value?.rules ?? []).join('\n'));
  const [note, setNote] = useState(value?.note ?? '');

  // sync up to parent on any change
  useEffect(() => {
    if (!open) { onChange(null); return; }
    onChange({
      tag,
      slots,
      rules: rules.split('\n').map(s => s.trim()).filter(Boolean),
      note,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tag, slots, rules, note, open]);

  const addSlot = () => setSlots(s => [...s, { time: '', activity: '', type: 'one-on-one' }]);
  const removeSlot = (i: number) => setSlots(s => s.filter((_, idx) => idx !== i));
  const updateSlot = (i: number, field: keyof SlotRow, val: string) =>
    setSlots(s => s.map((row, idx) => idx === i ? { ...row, [field]: val } : row));

  const loadTemplate = () => {
    setSlots([...DEFAULT_SLOTS]);
    if (!rules) setRules(DEFAULT_RULES.join('\n'));
  };

  const typeColor = (type: string) => SLOT_TYPES.find(t => t.value === type)?.color ?? 'bg-gray-100';

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Header toggle */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-blue-50 hover:bg-blue-100 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-semibold text-blue-800">
            📅 ตารางเรียนรายวัน
            {slots.length > 0 && <span className="ml-2 text-xs bg-blue-600 text-white rounded-full px-2 py-0.5">{slots.length} slots</span>}
          </span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-blue-600" /> : <ChevronDown className="w-4 h-4 text-blue-600" />}
      </button>

      {open && (
        <div className="p-4 space-y-4">
          {/* Tag / metadata */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Tag สรุป (แสดงบน tab ชื่อหลักสูตร)
            </label>
            <Input
              placeholder="เช่น 1:1×4 | กลุ่ม×4"
              value={tag}
              onChange={e => setTag(e.target.value)}
            />
            <p className="text-xs text-gray-400 mt-1">ตัวเลขสรุปชั่วโมงเรียน 1:1 และกลุ่มต่อวัน</p>
          </div>

          {/* Slots builder */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-600">ช่วงเวลาเรียน</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={loadTemplate}
                  className="text-xs text-blue-600 hover:text-blue-800 border border-blue-200 rounded px-2 py-1 hover:bg-blue-50 transition-colors"
                >
                  📋 โหลด Template มาตรฐาน
                </button>
                <button
                  type="button"
                  onClick={addSlot}
                  className="text-xs text-green-700 hover:text-green-800 border border-green-200 rounded px-2 py-1 hover:bg-green-50 transition-colors"
                >
                  + เพิ่ม slot
                </button>
              </div>
            </div>

            {slots.length === 0 ? (
              <div className="text-center py-6 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
                <CalendarDays className="w-8 h-8 mx-auto mb-2 opacity-40" />
                กดปุ่ม "โหลด Template มาตรฐาน" เพื่อเริ่มต้น หรือ "+ เพิ่ม slot" เพื่อสร้างเอง
              </div>
            ) : (
              <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
                {slots.map((slot, i) => (
                  <div key={i} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg ${typeColor(slot.type)}`}>
                    <GripVertical className="w-3 h-3 text-gray-400 shrink-0" />
                    <input
                      type="text"
                      value={slot.time}
                      onChange={e => updateSlot(i, 'time', e.target.value)}
                      placeholder="07:00 – 08:00"
                      className="w-28 text-xs bg-white/70 border border-white/50 rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-primary/40 font-mono"
                    />
                    <input
                      type="text"
                      value={slot.activity}
                      onChange={e => updateSlot(i, 'activity', e.target.value)}
                      placeholder="กิจกรรม / ชื่อคลาส"
                      className="flex-1 text-xs bg-white/70 border border-white/50 rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-primary/40"
                    />
                    <select
                      value={slot.type}
                      onChange={e => updateSlot(i, 'type', e.target.value)}
                      className="text-xs bg-white/70 border border-white/50 rounded px-1 py-1 focus:outline-none"
                    >
                      {SLOT_TYPES.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                    <button type="button" onClick={() => removeSlot(i)} className="text-gray-400 hover:text-red-500 transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Rules */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              กฎของโรงเรียน (แต่ละบรรทัด = 1 ข้อ)
            </label>
            <textarea
              value={rules}
              onChange={e => setRules(e.target.value)}
              rows={4}
              placeholder={'ห้ามใช้ภาษาไทย\nห้ามออกนอกแคมปัสหลัง 22:00'}
              className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              หมายเหตุ (แสดงใต้ตาราง)
            </label>
            <Input
              placeholder="เช่น ตารางอาจปรับเปลี่ยนตามปฏิทินโรงเรียน"
              value={note}
              onChange={e => setNote(e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
const schema = z.object({
  titleTh: z.string().min(1, 'กรุณากรอกชื่อภาษาไทย'),
  titleEn: z.string().min(1, 'กรุณากรอกชื่อภาษาอังกฤษ'),
  schoolSlug: z.string().optional(),
  duration: z.string().optional(),
  durationTh: z.string().optional(),
  suitableForTh: z.string().optional(),
  priceDisplayTh: z.string().optional(),
  price: z.coerce.number().optional(),
  descriptionTh: z.string().optional(),
  descriptionEn: z.string().optional(),
  badge: z.string().optional(),
  badgeTh: z.string().optional(),
  features: z.string().optional(),
  colorClass: z.string().optional(),
  isActive: z.boolean(),
});

type FormData = z.infer<typeof schema>;

const COLOR_OPTIONS = [
  { value: 'bg-blue-100 text-blue-700',     label: '🔵 น้ำเงิน' },
  { value: 'bg-green-100 text-green-700',   label: '🟢 เขียว' },
  { value: 'bg-purple-100 text-purple-700', label: '🟣 ม่วง' },
  { value: 'bg-orange-100 text-orange-700', label: '🟠 ส้ม' },
  { value: 'bg-red-100 text-red-700',       label: '🔴 แดง' },
  { value: 'bg-yellow-100 text-yellow-700', label: '🟡 เหลือง' },
  { value: 'bg-indigo-100 text-indigo-700', label: '🔷 คราม' },
];

function CourseForm({ defaultValues, onSave, onCancel, isLoading }: {
  defaultValues?: Partial<FormData> & { features?: any; timetableConfig?: any };
  onSave: (d: FormData & { timetableConfig?: any }) => void;
  onCancel: () => void;
  isLoading?: boolean;
}) {
  const processedDefaults = {
    isActive: true,
    ...defaultValues,
    features: Array.isArray(defaultValues?.features)
      ? defaultValues.features.join(', ')
      : defaultValues?.features ?? '',
  };

  const { register, handleSubmit, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: processedDefaults,
  });

  // Timetable state — managed outside react-hook-form
  const [timetableConfig, setTimetableConfig] = useState<{
    tag: string; slots: SlotRow[]; rules: string[]; note: string;
  } | null>(() => {
    const cfg = defaultValues?.timetableConfig;
    if (cfg?.slots?.length) return cfg;
    return null;
  });

  const handleSave = (data: FormData) => {
    const processed: any = {
      ...data,
      title: data.titleEn,
      titleTh: data.titleTh,
      schoolSlug: data.schoolSlug || null,
      features: data.features
        ? data.features.split(',').map((s: string) => s.trim()).filter(Boolean)
        : [],
      timetableConfig: timetableConfig?.slots?.length ? timetableConfig : null,
    };
    onSave(processed);
  };

  return (
    <form onSubmit={handleSubmit(handleSave)} className="space-y-4">
      {/* School assignment */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <label className="block text-sm font-semibold text-blue-800 mb-2">🏫 สังกัดโรงเรียน</label>
        <select
          className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
          {...register('schoolSlug')}
        >
          {SCHOOL_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <p className="text-xs text-blue-600 mt-1">เลือก "ทุกโรงเรียน" เพื่อแสดงหลักสูตรนี้ในหน้าหลักสูตรทั่วไป</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input label="ชื่อหลักสูตร (TH)" error={errors.titleTh?.message} {...register('titleTh')} />
        <Input label="ชื่อหลักสูตร (EN)" error={errors.titleEn?.message} {...register('titleEn')} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="ระยะเวลา TH (เช่น 4-12 สัปดาห์)" {...register('durationTh')} />
        <Input label="ระยะเวลา EN" {...register('duration')} />
      </div>

      {/* Price display */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <label className="block text-sm font-semibold text-amber-800 mb-1">💰 ราคา (ข้อความที่แสดงบนเว็บ)</label>
        <Input
          placeholder="เช่น เริ่มต้น 35,000 บาท/เดือน"
          {...register('priceDisplayTh')}
        />
        <p className="text-xs text-amber-600 mt-1">ข้อความนี้จะแสดงบนหน้าหลักสูตรโดยตรง แก้ไขได้อิสระ</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">🎨 สีธีม</label>
          <select
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
            {...register('colorClass')}
          >
            <option value="">เลือกสี...</option>
            {COLOR_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <Input label="Badge (TH)" placeholder="เช่น แนะนำ, การันตีผล" {...register('badgeTh')} />
      </div>

      <Input label="เหมาะสำหรับ (ภาษาไทย)" placeholder="เช่น นักเรียน นักศึกษา ที่ต้องการสอบ IELTS" {...register('suitableForTh')} />
      <div>
        <Input label="จุดเด่น / Features (คั่นด้วย comma)" placeholder="เช่น เรียน 1:1 กับครู, มีการันตีผล, ตาราง Sparta" {...register('features')} />
        <p className="text-xs text-gray-400 mt-1">แยกแต่ละ feature ด้วย comma</p>
      </div>
      <Textarea label="รายละเอียด (TH)" rows={4} {...register('descriptionTh')} />
      <Textarea label="รายละเอียด (EN)" rows={3} {...register('descriptionEn')} />

      {/* ── Timetable editor ── */}
      <TimetableEditor value={timetableConfig} onChange={setTimetableConfig} />

      <Controller control={control} name="isActive" render={({ field }) => (
        <Toggle checked={field.value} onChange={field.onChange} label="เปิดใช้งาน" />
      )} />
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" type="button" onClick={onCancel}>ยกเลิก</Button>
        <Button type="submit" loading={isLoading}>บันทึก</Button>
      </div>
    </form>
  );
}

// ────────────────────────────────────────────────────────────────────
const SCHOOL_NAME: Record<string, string> = {
  'cia': 'CIA', 'qq-english': 'QQ English', 'philinter': 'Philinter',
  'b-cebu': "B'Cebu (Cebu)", 'bcebu': "B'Cebu (Baguio)", 'cpils': 'CPILS',
  'ev-academy': 'EV Academy', 'smeag': 'SMEAG', 'pines': 'PINES',
};

export function CoursesPage() {
  const crud = useCrud<Course>({ api: coursesApi, queryKey: 'courses' });
  const [schoolFilter, setSchoolFilter] = useState('');

  const columns = [
    { key: 'titleTh', header: 'ชื่อหลักสูตร', cell: (r: Course) => (
      <div>
        <span className="font-medium text-sm block">{r.titleTh}</span>
        <span className="text-xs text-gray-400">{(r as any).titleEn ?? r.title}</span>
      </div>
    )},
    { key: 'school', header: 'โรงเรียน', cell: (r: Course) => (
      r.schoolSlug
        ? <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">{SCHOOL_NAME[r.schoolSlug] ?? r.schoolSlug}</span>
        : <span className="text-xs text-gray-400">ทุกโรงเรียน</span>
    )},
    { key: 'duration', header: 'ระยะเวลา', cell: (r: Course) => <span className="text-sm">{r.durationTh ?? r.duration ?? '-'}</span> },
    { key: 'price', header: 'ราคา (แสดงบนเว็บ)', cell: (r: Course) => (
      <span className="text-sm font-medium text-primary">{r.priceDisplayTh ?? (r.price != null ? `฿${r.price.toLocaleString()}` : '-')}</span>
    )},
    { key: 'timetable', header: 'ตาราง', cell: (r: Course) => (
      r.timetableConfig?.slots?.length
        ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1 w-fit">
            <CalendarDays className="w-3 h-3" />{(r.timetableConfig.slots as any[]).length} slots
          </span>
        : <span className="text-xs text-gray-300">—</span>
    )},
    {
      key: 'actions', header: '',
      cell: (r: Course) => (
        <div className="flex gap-1 justify-end">
          <Button size="sm" variant="ghost" icon={<Pencil className="h-3.5 w-3.5" />} onClick={() => crud.openEdit(r)}>แก้ไข</Button>
          <Button size="sm" variant="ghost" icon={<Trash2 className="h-3.5 w-3.5" />} onClick={() => crud.handleDelete(r.id)} className="text-red-500 hover:text-red-700">ลบ</Button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout title="หลักสูตร" actions={
      <Button icon={<Plus className="h-4 w-4" />} onClick={crud.openCreate}>เพิ่มหลักสูตร</Button>
    }>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-200 flex flex-wrap gap-3 items-center">
          <SearchBar value={crud.search} onChange={crud.setSearch} placeholder="ค้นหาหลักสูตร..." className="w-64" />
          <select
            value={schoolFilter}
            onChange={e => setSchoolFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            {SCHOOL_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <span className="text-xs text-gray-400 ml-auto">
            💡 แก้ไขหลักสูตรเพื่อเพิ่ม/แก้ไข ตารางเรียน
          </span>
        </div>
        <div className="p-4">
          <Table
            data={crud.data.filter(c => !schoolFilter || c.schoolSlug === schoolFilter)}
            columns={columns}
            isLoading={crud.isLoading}
            page={crud.page}
            total={crud.total}
            pageSize={20}
            onPageChange={crud.setPage}
          />
        </div>
      </div>

      <Modal
        open={crud.showModal}
        onClose={crud.closeModal}
        title={crud.editItem ? 'แก้ไขหลักสูตร' : 'เพิ่มหลักสูตรใหม่'}
        size="lg"
      >
        <CourseForm
          defaultValues={crud.editItem ?? undefined}
          onSave={crud.handleSave}
          onCancel={crud.closeModal}
          isLoading={crud.isSaving}
        />
      </Modal>
    </AdminLayout>
  );
}
