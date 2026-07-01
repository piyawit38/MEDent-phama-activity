/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CheckCircle2, User, Phone, GraduationCap, School, FileCheck, ArrowLeft, HeartHandshake } from 'lucide-react';
import { Activity, Registration } from '../types';
import { DBService } from '../services/db';

interface RegistrationFormProps {
  activity: Activity;
  onSuccess: () => void;
  onBack: () => void;
}

export default function RegistrationForm({ activity, onSuccess, onBack }: RegistrationFormProps) {
  const [studentName, setStudentName] = useState('');
  const [parentName, setParentName] = useState('');
  const [phone, setPhone] = useState('');
  const [school, setSchool] = useState('');
  const [grade, setGrade] = useState('');
  const [intent, setIntent] = useState<'join' | 'cannot_join'>('join');
  const [remarks, setRemarks] = useState('');
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!studentName.trim()) {
      newErrors.studentName = 'กรุณากรอกชื่อ-นามสกุล ของนักเรียน';
    }
    if (!parentName.trim()) {
      newErrors.parentName = 'กรุณากรอกชื่อ-นามสกุล ของผู้ปกครอง';
    }
    
    // Simple Thai phone check (9-10 digits)
    const cleanPhone = phone.replace(/[- ]/g, '');
    if (!cleanPhone) {
      newErrors.phone = 'กรุณากรอกเบอร์โทรศัพท์ติดต่อ';
    } else if (!/^[0-9]{9,10}$/.test(cleanPhone)) {
      newErrors.phone = 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง (ควรมี 9-10 หลัก)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    
    // Simulate minor network/processing delay for Firebase-like feel
    setTimeout(() => {
      try {
        DBService.saveRegistration({
          activityId: activity.id,
          activityTitle: activity.title,
          studentName: studentName.trim(),
          parentName: parentName.trim(),
          phone: phone.trim(),
          school: school.trim() || undefined,
          grade: grade.trim() || undefined,
          intent,
          remarks: remarks.trim() || undefined
        });
        
        setIsSubmitting(false);
        setIsSubmitted(true);
        onSuccess();
      } catch (err) {
        console.error('Registration failed', err);
        setIsSubmitting(false);
      }
    }, 800);
  };

  if (isSubmitted) {
    return (
      <div 
        className="bg-white border-2 border-emerald-400 rounded-3xl p-8 shadow-xl text-center max-w-xl mx-auto space-y-6 transition-all duration-300"
        id="registration-success-card"
      >
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-500 animate-bounce">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl md:text-2xl font-extrabold text-slate-800">ลงทะเบียนเรียบร้อย</h3>
          <p className="text-sm md:text-base text-slate-500 font-medium">
            ขอบคุณสำหรับการตอบรับเข้าร่วมกิจกรรมโครงการ
          </p>
          <div className="bg-slate-50 p-4 rounded-2xl text-xs md:text-sm text-slate-600 border border-slate-100 mt-4 max-w-sm mx-auto text-left space-y-1.5">
            <p><strong>กิจกรรม:</strong> {activity.title}</p>
            <p><strong>นักเรียน:</strong> {studentName}</p>
            <p><strong>ความประสงค์:</strong> <span className={intent === 'join' ? 'text-emerald-600 font-bold' : 'text-rose-500 font-bold'}>
              {intent === 'join' ? 'เข้าร่วมกิจกรรม' : 'ไม่สามารถเข้าร่วมกิจกรรม'}
            </span></p>
          </div>
        </div>
        <button
          onClick={onBack}
          className="px-6 py-2.5 bg-navy-brand text-white font-bold rounded-xl text-sm shadow-md hover:bg-navy-900 transition-colors cursor-pointer"
        >
          กลับสู่หน้าหลัก
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-lg overflow-hidden max-w-2xl mx-auto" id="registration-form-card">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-navy-brand to-purple-brand p-6 text-white relative">
        <button
          onClick={onBack}
          className="absolute left-4 top-4 p-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors flex items-center justify-center text-white"
          title="กลับ"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="text-center pt-2">
          <HeartHandshake className="w-10 h-10 mx-auto text-purple-300 mb-2" />
          <h3 className="text-lg md:text-xl font-bold">แบบฟอร์มลงทะเบียนเข้าร่วมกิจกรรม</h3>
          <p className="text-xs text-slate-200 line-clamp-1 mt-1 max-w-md mx-auto">
            {activity.title}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Student Name */}
          <div className="space-y-1.5">
            <label className="text-xs md:text-sm font-bold text-slate-600 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-navy-brand" />
              ชื่อ-นามสกุล ของนักเรียน <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="เด็กชาย / เด็กหญิง / นาย / นางสาว ..."
              value={studentName}
              onChange={(e) => {
                setStudentName(e.target.value);
                if (errors.studentName) setErrors({ ...errors, studentName: '' });
              }}
              className={`w-full border rounded-xl p-2.5 text-sm outline-none bg-white focus:ring-2 focus:ring-purple-brand transition-all ${
                errors.studentName ? 'border-red-400 bg-red-50/25' : 'border-slate-200'
              }`}
            />
            {errors.studentName && <p className="text-[11px] text-red-500 font-bold">{errors.studentName}</p>}
          </div>

          {/* Parent Name */}
          <div className="space-y-1.5">
            <label className="text-xs md:text-sm font-bold text-slate-600 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-navy-brand" />
              ชื่อ-นามสกุล ของผู้ปกครอง <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="นาย / นาง / นางสาว ..."
              value={parentName}
              onChange={(e) => {
                setParentName(e.target.value);
                if (errors.parentName) setErrors({ ...errors, parentName: '' });
              }}
              className={`w-full border rounded-xl p-2.5 text-sm outline-none bg-white focus:ring-2 focus:ring-purple-brand transition-all ${
                errors.parentName ? 'border-red-400 bg-red-50/25' : 'border-slate-200'
              }`}
            />
            {errors.parentName && <p className="text-[11px] text-red-500 font-bold">{errors.parentName}</p>}
          </div>

          {/* Phone Number */}
          <div className="space-y-1.5">
            <label className="text-xs md:text-sm font-bold text-slate-600 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-navy-brand" />
              เบอร์โทรศัพท์ติดต่อ <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              placeholder="เช่น 0812345678"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (errors.phone) setErrors({ ...errors, phone: '' });
              }}
              className={`w-full border rounded-xl p-2.5 text-sm outline-none bg-white focus:ring-2 focus:ring-purple-brand transition-all ${
                errors.phone ? 'border-red-400 bg-red-50/25' : 'border-slate-200'
              }`}
            />
            {errors.phone && <p className="text-[11px] text-red-500 font-bold">{errors.phone}</p>}
          </div>

          {/* School */}
          <div className="space-y-1.5">
            <label className="text-xs md:text-sm font-bold text-slate-600 flex items-center gap-1.5">
              <School className="w-3.5 h-3.5 text-navy-brand" />
              โรงเรียน (ไม่บังคับ)
            </label>
            <input
              type="text"
              placeholder="ระบุชื่อโรงเรียน"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              className="w-full border border-slate-200 rounded-xl p-2.5 text-sm outline-none bg-white focus:ring-2 focus:ring-purple-brand transition-all"
            />
          </div>

          {/* Grade / Level */}
          <div className="space-y-1.5">
            <label className="text-xs md:text-sm font-bold text-slate-600 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-navy-brand" />
              ระดับชั้น (ไม่บังคับ)
            </label>
            <input
              type="text"
              placeholder="เช่น ม.4 / ประถม 1 / อนุบาล 2"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full border border-slate-200 rounded-xl p-2.5 text-sm outline-none bg-white focus:ring-2 focus:ring-purple-brand transition-all"
            />
          </div>
        </div>

        {/* Intent / Preference Selector */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label className="text-xs md:text-sm font-bold text-slate-600 flex items-center gap-1.5">
            <FileCheck className="w-3.5 h-3.5 text-navy-brand" />
            ความประสงค์เข้าร่วมกิจกรรม <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label
              className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                intent === 'join'
                  ? 'border-emerald-500 bg-emerald-50/40 font-bold text-emerald-950'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="intent"
                checked={intent === 'join'}
                onChange={() => setIntent('join')}
                className="w-4.5 h-4.5 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
              />
              <div className="text-xs md:text-sm">
                <p>เข้าร่วมกิจกรรม</p>
                <p className="text-[10px] font-medium text-slate-400">ขอยืนยันความประสงค์เข้าร่วมตามนัดหมาย</p>
              </div>
            </label>

            <label
              className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                intent === 'cannot_join'
                  ? 'border-rose-500 bg-rose-50/40 font-bold text-rose-950'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="intent"
                checked={intent === 'cannot_join'}
                onChange={() => setIntent('cannot_join')}
                className="w-4.5 h-4.5 text-rose-500 focus:ring-rose-500 cursor-pointer"
              />
              <div className="text-xs md:text-sm">
                <p>ไม่สามารถเข้าร่วมกิจกรรม</p>
                <p className="text-[10px] font-medium text-slate-400">ขอสละสิทธิ์การเข้าร่วมโครงการในครั้งนี้</p>
              </div>
            </label>
          </div>
        </div>

        {/* Remarks (Optional) */}
        <div className="space-y-1.5">
          <label className="text-xs md:text-sm font-bold text-slate-600">
            หมายเหตุเพิ่มเติม (ไม่บังคับ)
          </label>
          <textarea
            rows={2}
            placeholder="เช่น ข้อเสนอแนะ, อาหารที่แพ้, ข้อมูลการอำนวยความสะดวกอื่นๆ ..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="w-full border border-slate-200 rounded-xl p-2.5 text-sm outline-none bg-white focus:ring-2 focus:ring-purple-brand transition-all"
          />
        </div>

        {/* Submit Area */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-4">
          <button
            type="button"
            onClick={onBack}
            className="w-full sm:w-1/3 py-3 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 font-bold transition-all text-sm cursor-pointer text-center"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-2/3 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-extrabold shadow-lg shadow-emerald-100 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <span className="w-4.5 h-4.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                <span>กำลังส่งข้อมูล...</span>
              </>
            ) : (
              <span>ส่งข้อมูลลงทะเบียน</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
