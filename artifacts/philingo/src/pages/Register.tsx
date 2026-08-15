import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useSeoMeta } from '@/hooks/use-seo-meta';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useLocation } from 'wouter';
import { Send, CheckCircle2 } from 'lucide-react';
import { formApi } from '@/lib/api';

const formSchema = z.object({
  fullName: z.string().min(2, 'กรุณาระบุชื่อ-นามสกุล'),
  nickname: z.string().min(1, 'กรุณาระบุชื่อเล่น'),
  phone: z.string().min(9, 'เบอร์โทรศัพท์ไม่ถูกต้อง'),
  lineId: z.string().min(1, 'กรุณาระบุ LINE ID'),
  email: z.string().email('อีเมลไม่ถูกต้อง').optional().or(z.literal('')),
  province: z.string().min(1, 'กรุณาเลือกจังหวัด'),
  age: z.string().min(1, 'กรุณาระบุอายุ'),
  education: z.string().min(1, 'กรุณาเลือกระดับการศึกษา'),
  course: z.string().min(1, 'กรุณาเลือกหลักสูตรที่สนใจ'),
  school: z.string().optional(),
  budget: z.string().min(1, 'กรุณาเลือกงบประมาณ'),
  startDate: z.string().min(1, 'กรุณาระบุเดือนที่ต้องการเริ่มเรียน'),
  questions: z.string().optional(),
  consent: z.boolean().refine(val => val === true, 'กรุณายอมรับเงื่อนไข')
});

export default function Register() {
  const [, setLocation] = useLocation();
  useSeoMeta(
    'ลงทะเบียนปรึกษาเรียนต่อฟิลิปปินส์ฟรี | Philingo',
    'กรอกฟอร์มเพื่อรับคำปรึกษาการเรียนต่อฟิลิปปินส์จากทีม Philingo ฟรี ไม่มีค่าใช้จ่าย ทีมงานติดต่อกลับภายใน 24 ชั่วโมง'
  );
  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { consent: true }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    setSubmitError('');
    try {
      await formApi.submit({
        type: 'apply',
        name: data.fullName,
        email: data.email || '',
        phone: data.phone,
        schoolInterest: data.school,
        programInterest: data.course,
        startDate: data.startDate,
        budget: data.budget,
        message: `ชื่อเล่น: ${data.nickname}\nLINE ID: ${data.lineId}\nจังหวัด: ${data.province}\nอายุ: ${data.age}\nการศึกษา: ${data.education}${data.questions ? '\nคำถาม: ' + data.questions : ''}`,
      });
      setLocation('/thank-you');
    } catch {
      setSubmitError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16">
        <div className="container max-w-3xl mx-auto px-4">
          
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">ฟอร์มลงทะเบียนปรึกษาเรียนต่อ</h1>
            <p className="text-gray-600 dark:text-gray-400">กรอกข้อมูลเพื่อให้เจ้าหน้าที่ประเมินและให้คำแนะนำที่เหมาะสมที่สุดสำหรับคุณ (ไม่มีค่าใช้จ่าย)</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 md:p-10 border border-gray-100 dark:border-gray-700">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              
              {/* ข้อมูลส่วนตัว */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3 mb-5 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">1</div>
                  ข้อมูลส่วนตัว
                </h3>
                
                <div className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">ชื่อ-นามสกุล <span className="text-red-500">*</span></label>
                    <input {...register('fullName')} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="นาย / นางสาว..." />
                    {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message?.toString()}</p>}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">ชื่อเล่น <span className="text-red-500">*</span></label>
                      <input {...register('nickname')} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50" />
                      {errors.nickname && <p className="text-red-500 text-xs mt-1">{errors.nickname.message?.toString()}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">อายุ <span className="text-red-500">*</span></label>
                      <input type="number" {...register('age')} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50" />
                      {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age.message?.toString()}</p>}
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5 mt-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">เบอร์โทรศัพท์ <span className="text-red-500">*</span></label>
                    <input type="tel" {...register('phone')} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50" />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message?.toString()}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">LINE ID <span className="text-red-500">*</span></label>
                    <input {...register('lineId')} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50" />
                    {errors.lineId && <p className="text-red-500 text-xs mt-1">{errors.lineId.message?.toString()}</p>}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5 mt-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">อีเมล</label>
                    <input type="email" {...register('email')} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">จังหวัดที่พักอาศัย <span className="text-red-500">*</span></label>
                    <select {...register('province')} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50">
                      <option value="">เลือกจังหวัด</option>
                      <option value="Bangkok">กรุงเทพมหานคร</option>
                      <option value="ChiangMai">เชียงใหม่</option>
                      <option value="Other">อื่นๆ</option>
                    </select>
                    {errors.province && <p className="text-red-500 text-xs mt-1">{errors.province.message?.toString()}</p>}
                  </div>
                </div>

                <div className="space-y-2 mt-5">
                  <label className="text-sm font-medium">ระดับการศึกษาปัจจุบัน <span className="text-red-500">*</span></label>
                  <select {...register('education')} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50">
                    <option value="">เลือกระดับการศึกษา</option>
                    <option value="HighSchool">มัธยมศึกษา</option>
                    <option value="Bachelor">ปริญญาตรี</option>
                    <option value="Working">วัยทำงาน</option>
                  </select>
                  {errors.education && <p className="text-red-500 text-xs mt-1">{errors.education.message?.toString()}</p>}
                </div>
              </div>

              {/* ข้อมูลการเรียน */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3 mb-5 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">2</div>
                  ความต้องการเรียน
                </h3>

                <div className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">หลักสูตรที่สนใจ <span className="text-red-500">*</span></label>
                    <select {...register('course')} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50">
                      <option value="">เลือกหลักสูตร</option>
                      <option value="ESL">General English (ESL)</option>
                      <option value="IELTS">IELTS Preparation</option>
                      <option value="TOEIC">TOEIC Preparation</option>
                      <option value="Business">Business English</option>
                      <option value="Junior">Junior Camp (สำหรับเด็ก)</option>
                      <option value="Family">Family Program</option>
                      <option value="Other">ยังไม่แน่ใจ ต้องการคำแนะนำ</option>
                    </select>
                    {errors.course && <p className="text-red-500 text-xs mt-1">{errors.course.message?.toString()}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">เดือนที่ต้องการเดินทาง <span className="text-red-500">*</span></label>
                    <input type="month" {...register('startDate')} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50" />
                    {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate.message?.toString()}</p>}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5 mt-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">โรงเรียน/เมืองที่สนใจ (ถ้ามี)</label>
                    <input {...register('school')} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="เช่น Cebu, SMEAG..." />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">งบประมาณต่อเดือน (ค่าเรียน+ที่พัก+อาหาร) <span className="text-red-500">*</span></label>
                    <select {...register('budget')} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50">
                      <option value="">เลือกงบประมาณ</option>
                      <option value="35k-45k">35,000 - 45,000 บาท</option>
                      <option value="45k-55k">45,000 - 55,000 บาท</option>
                      <option value="55k-65k">55,000 - 65,000 บาท</option>
                      <option value="unlimited">ไม่จำกัดงบ ขอคุณภาพดีที่สุด</option>
                    </select>
                    {errors.budget && <p className="text-red-500 text-xs mt-1">{errors.budget.message?.toString()}</p>}
                  </div>
                </div>

                <div className="space-y-2 mt-5">
                  <label className="text-sm font-medium">ข้อความเพิ่มเติม / คำถามที่อยากทราบ</label>
                  <textarea {...register('questions')} rows={3} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" placeholder="รายละเอียดเพิ่มเติม..."></textarea>
                </div>
              </div>

              {/* PDPA */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" {...register('consent')} className="mt-1 w-5 h-5 accent-primary border-gray-300 rounded" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    ข้าพเจ้ายินยอมให้ บริษัท ไทย สตั๊ดดี้ อะบรอด คอนซัลแทนท์ จำกัด จัดเก็บและประมวลผลข้อมูลส่วนบุคคลของข้าพเจ้า เพื่อวัตถุประสงค์ในการติดต่อกลับ ให้คำปรึกษา และนำเสนอข้อมูลหลักสูตรที่เหมาะสม ตามพ.ร.บ.คุ้มครองข้อมูลส่วนบุคคล (PDPA)
                  </span>
                </label>
                {errors.consent && <p className="text-red-500 text-xs mt-2 ml-8">{errors.consent.message?.toString()}</p>}
              </div>

              <button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl text-lg transition-transform hover:-translate-y-1 shadow-xl flex items-center justify-center gap-2">
                <Send className="w-5 h-5" /> ลงทะเบียนรับคำปรึกษาฟรี
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
