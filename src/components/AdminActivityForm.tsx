/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Save, 
  Image as ImageIcon, 
  Upload, 
  FileText, 
  Trash2, 
  Plus, 
  MapPin, 
  Phone, 
  User, 
  Briefcase,
  AlertCircle
} from 'lucide-react';
import { Activity, Attachment } from '../types';
import { DBService } from '../services/db';

interface AdminActivityFormProps {
  activity: Activity | null; // Null means create mode
  onBack: () => void;
}

export default function AdminActivityForm({ activity, onBack }: AdminActivityFormProps) {
  // Fields state
  const [title, setTitle] = useState(activity?.title || '');
  const [date, setDate] = useState(activity?.date || '');
  const [endDate, setEndDate] = useState(activity?.endDate || '');
  const [time, setTime] = useState(activity?.time || '09:00 - 16:30 น.');
  const [location, setLocation] = useState(activity?.location || '');
  const [status, setStatus] = useState<'open' | 'closed'>(activity?.status || 'open');
  const [googleMaps, setGoogleMaps] = useState(activity?.googleMaps || '');
  const [thingsToPrepare, setThingsToPrepare] = useState(activity?.thingsToPrepare || '');
  const [coordinator, setCoordinator] = useState(activity?.coordinator || '');
  const [phone, setPhone] = useState(activity?.phone || '');
  const [description, setDescription] = useState(activity?.description || '');

  // File states (Base64 dataUrls)
  const [coverImage, setCoverImage] = useState(
    activity?.coverImage || 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80'
  );
  const [gallery, setGallery] = useState<string[]>(activity?.gallery || []);
  const [attachments, setAttachments] = useState<Attachment[]>(activity?.attachments || []);
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Helper to format bytes
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Convert File to Base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Handle Cover Image upload
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        setCoverImage(base64);
      } catch (err) {
        console.error('Error uploading cover', err);
      }
    }
  };

  // Handle Gallery Upload (multi)
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length > 0) {
      try {
        const promises = files.map(f => fileToBase64(f));
        const base64s = await Promise.all(promises);
        setGallery([...gallery, ...base64s]);
      } catch (err) {
        console.error('Error uploading gallery', err);
      }
    }
  };

  // Handle Attachment Upload (PDF, Word, PPT)
  const handleAttachmentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    const newAttachments: Attachment[] = [];

    for (const file of files) {
      try {
        let type: Attachment['type'] = 'pdf';
        const ext = file.name.split('.').pop()?.toLowerCase();
        
        if (ext === 'pdf') type = 'pdf';
        else if (ext === 'doc' || ext === 'docx') type = 'word';
        else if (ext === 'ppt' || ext === 'pptx') type = 'powerpoint';
        else if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) type = 'image';

        const dataUrl = await fileToBase64(file);
        
        newAttachments.push({
          id: 'att_' + Math.random().toString(36).substring(2, 11),
          name: file.name,
          size: formatBytes(file.size),
          type,
          dataUrl
        });
      } catch (err) {
        console.error('Attachment failed to process', err);
      }
    }

    setAttachments([...attachments, ...newAttachments]);
  };

  // Remove elements
  const removeGalleryImage = (index: number) => {
    setGallery(gallery.filter((_, idx) => idx !== index));
  };

  const removeAttachment = (id: string) => {
    setAttachments(attachments.filter(att => att.id !== id));
  };

  // Validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'กรุณาระบุชื่อกิจกรรม';
    if (!date) newErrors.date = 'กรุณาระบุวันที่จัดกิจกรรม';
    if (date && endDate && new Date(endDate) < new Date(date)) {
      newErrors.endDate = 'วันที่สิ้นสุดกิจกรรมต้องไม่เป็นวันก่อนหน้าวันที่เริ่มต้น';
    }
    if (!time.trim()) newErrors.time = 'กรุณาระบุเวลาจัดกิจกรรม';
    if (!location.trim()) newErrors.location = 'กรุณาระบุสถานที่จัดงาน';
    if (!description.trim()) newErrors.description = 'กรุณาระบุรายละเอียดกิจกรรม';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save/Submit Form
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    
    setTimeout(() => {
      try {
        const item: Activity = {
          id: activity?.id || 'act_' + Math.random().toString(36).substring(2, 11),
          title: title.trim(),
          date,
          endDate: endDate ? endDate : undefined,
          time: time.trim(),
          location: location.trim(),
          status,
          coverImage,
          gallery,
          description: description.trim(),
          googleMaps: googleMaps.trim() || undefined,
          thingsToPrepare: thingsToPrepare.trim() || undefined,
          coordinator: coordinator.trim() || undefined,
          phone: phone.trim() || undefined,
          attachments,
          createdAt: activity?.createdAt || new Date().toISOString()
        };

        DBService.saveActivity(item);
        setIsSaving(false);
        onBack();
      } catch (err) {
        console.error('Save failed', err);
        setIsSaving(false);
      }
    }, 600);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 max-w-3xl mx-auto space-y-6" id="admin-form-container">
      {/* Title Bar */}
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <button
          onClick={onBack}
          className="p-1.5 hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4.5 h-4.5" />
        </button>
        <div>
          <h3 className="text-lg md:text-xl font-bold text-slate-800">
            {activity ? 'แก้ไขข้อมูลกิจกรรม' : 'สร้างข้อมูลกิจกรรมใหม่'}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">ระบุรายละเอียด แฟ้มเอกสาร และรูปภาพสำหรับแสดงผลบนหน้าเว็บ</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Cover Photo Upload */}
          <div className="md:col-span-2 space-y-2">
            <label className="text-xs md:text-sm font-bold text-slate-600 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-purple-brand" />
              ภาพหน้าปกหลัก (Cover Image)
            </label>
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="w-full sm:w-48 aspect-video bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                <img src={coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
              </div>
              <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors w-full sm:flex-1 h-28">
                <Upload className="w-6 h-6 text-slate-400 animate-pulse" />
                <span className="text-xs font-bold text-navy-brand mt-1.5">เลือกอัปโหลดรูปภาพใหม่</span>
                <span className="text-[10px] text-slate-400 mt-0.5">ไฟล์ PNG, JPG ขนาดไม่เกิน 5MB</span>
                <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
              </label>
            </div>
          </div>

          {/* Title */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs md:text-sm font-bold text-slate-600">
              ชื่อกิจกรรม <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="ระบุชื่อกิจกรรมของโครงการ..."
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors({ ...errors, title: '' });
              }}
              className={`w-full border rounded-xl p-2.5 text-sm outline-none bg-white focus:ring-2 focus:ring-purple-brand transition-all ${
                errors.title ? 'border-red-400 bg-red-50/25' : 'border-slate-200'
              }`}
            />
            {errors.title && <p className="text-[11px] text-red-500 font-bold">{errors.title}</p>}
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <label className="text-xs md:text-sm font-bold text-slate-600">
              วันที่เริ่มต้นจัดงาน <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                if (errors.date) setErrors({ ...errors, date: '' });
              }}
              className={`w-full border rounded-xl p-2.5 text-sm outline-none bg-white focus:ring-2 focus:ring-purple-brand transition-all ${
                errors.date ? 'border-red-400 bg-red-50/25' : 'border-slate-200'
              }`}
            />
            {errors.date && <p className="text-[11px] text-red-500 font-bold">{errors.date}</p>}
          </div>

          {/* End Date */}
          <div className="space-y-1.5">
            <label className="text-xs md:text-sm font-bold text-slate-600">
              วันที่สิ้นสุดจัดงาน (เลือกได้ หากจัดหลายวัน)
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                if (errors.endDate) setErrors({ ...errors, endDate: '' });
              }}
              className={`w-full border rounded-xl p-2.5 text-sm outline-none bg-white focus:ring-2 focus:ring-purple-brand transition-all ${
                errors.endDate ? 'border-red-400 bg-red-50/25' : 'border-slate-200'
              }`}
            />
            {errors.endDate && <p className="text-[11px] text-red-500 font-bold">{errors.endDate}</p>}
          </div>

          {/* Time */}
          <div className="space-y-1.5">
            <label className="text-xs md:text-sm font-bold text-slate-600">
              เวลาจัดงาน <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="เช่น 09:00 - 16:30 น."
              value={time}
              onChange={(e) => {
                setTime(e.target.value);
                if (errors.time) setErrors({ ...errors, time: '' });
              }}
              className={`w-full border rounded-xl p-2.5 text-sm outline-none bg-white focus:ring-2 focus:ring-purple-brand transition-all ${
                errors.time ? 'border-red-400 bg-red-50/25' : 'border-slate-200'
              }`}
            />
            {errors.time && <p className="text-[11px] text-red-500 font-bold">{errors.time}</p>}
          </div>

          {/* Location */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs md:text-sm font-bold text-slate-600 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-navy-brand" />
              สถานที่จัดงาน <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="ระบุตึก คณะ มหาวิทยาลัย หรือห้องประชุม..."
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                if (errors.location) setErrors({ ...errors, location: '' });
              }}
              className={`w-full border rounded-xl p-2.5 text-sm outline-none bg-white focus:ring-2 focus:ring-purple-brand transition-all ${
                errors.location ? 'border-red-400 bg-red-50/25' : 'border-slate-200'
              }`}
            />
            {errors.location && <p className="text-[11px] text-red-500 font-bold">{errors.location}</p>}
          </div>

          {/* Google Maps Link */}
          <div className="space-y-1.5">
            <label className="text-xs md:text-sm font-bold text-slate-600">
              ลิงก์พิกัด Google Maps (ไม่บังคับ)
            </label>
            <input
              type="url"
              placeholder="https://maps.app.goo.gl/..."
              value={googleMaps}
              onChange={(e) => setGoogleMaps(e.target.value)}
              className="w-full border border-slate-200 rounded-xl p-2.5 text-sm outline-none bg-white focus:ring-2 focus:ring-purple-brand transition-all"
            />
          </div>

          {/* Status Select */}
          <div className="space-y-1.5">
            <label className="text-xs md:text-sm font-bold text-slate-600">
              สถานะการลงทะเบียน <span className="text-red-500">*</span>
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'open' | 'closed')}
              className="w-full border border-slate-200 rounded-xl p-2.5 text-sm outline-none bg-white focus:ring-2 focus:ring-purple-brand transition-all text-slate-700"
            >
              <option value="open">เปิดรับลงทะเบียน</option>
              <option value="closed">ปิดรับลงทะเบียน / เต็ม</option>
            </select>
          </div>

          {/* Coordinator */}
          <div className="space-y-1.5">
            <label className="text-xs md:text-sm font-bold text-slate-600 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-navy-brand" />
              ชื่อผู้ประสานงาน (ไม่บังคับ)
            </label>
            <input
              type="text"
              placeholder="เช่น ดร.พิมลพรรณ วงศ์วรรณ"
              value={coordinator}
              onChange={(e) => setCoordinator(e.target.value)}
              className="w-full border border-slate-200 rounded-xl p-2.5 text-sm outline-none bg-white focus:ring-2 focus:ring-purple-brand transition-all"
            />
          </div>

          {/* Coordinator Phone */}
          <div className="space-y-1.5">
            <label className="text-xs md:text-sm font-bold text-slate-600 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-navy-brand" />
              เบอร์ติดต่อผู้ประสานงาน (ไม่บังคับ)
            </label>
            <input
              type="tel"
              placeholder="เช่น 081-234-5678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-slate-200 rounded-xl p-2.5 text-sm outline-none bg-white focus:ring-2 focus:ring-purple-brand transition-all"
            />
          </div>

          {/* Things to Prepare */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs md:text-sm font-bold text-slate-600 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-navy-brand" />
              สิ่งที่ต้องเตรียมเข้าร่วม (ไม่บังคับ)
            </label>
            <input
              type="text"
              placeholder="เช่น สมุดบันทึก, โทรศัพท์สมาร์ทโฟนสำหรับสแกน AR..."
              value={thingsToPrepare}
              onChange={(e) => setThingsToPrepare(e.target.value)}
              className="w-full border border-slate-200 rounded-xl p-2.5 text-sm outline-none bg-white focus:ring-2 focus:ring-purple-brand transition-all"
            />
          </div>

          {/* Description Block */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs md:text-sm font-bold text-slate-600 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-navy-brand" />
              รายละเอียดกิจกรรมเต็มรูปแบบ <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={5}
              placeholder="พิมพ์คำอธิบายรายละเอียดกิจกรรม เช่น ตารางเวลา หัวข้อปฏิบัติการ และหัวข้อเรียนรู้อื่นๆ..."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) setErrors({ ...errors, description: '' });
              }}
              className={`w-full border rounded-xl p-2.5 text-sm outline-none bg-white focus:ring-2 focus:ring-purple-brand transition-all ${
                errors.description ? 'border-red-400 bg-red-50/25' : 'border-slate-200'
              }`}
            />
            {errors.description && <p className="text-[11px] text-red-500 font-bold">{errors.description}</p>}
          </div>
        </div>

        {/* Gallery Multi-upload */}
        <div className="space-y-2 pt-4 border-t border-slate-100">
          <label className="text-xs md:text-sm font-bold text-slate-600 flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-purple-brand" />
            รูปภาพแกลเลอรีเพิ่มเติม (Gallery - หลายรูป)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
            {/* Gallery Previews with delete controls */}
            {gallery.map((img, idx) => (
              <div key={idx} className="aspect-square relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50 group">
                <img src={img} className="w-full h-full object-cover" alt="" />
                <button
                  type="button"
                  onClick={() => removeGalleryImage(idx)}
                  className="absolute top-1.5 right-1.5 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                  title="ลบรูปภาพ"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
            {/* Upload card button */}
            <label className="aspect-square border-2 border-dashed border-slate-200 hover:border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors">
              <Plus className="w-5 h-5 text-slate-400" />
              <span className="text-[10px] text-slate-500 font-bold mt-1">เพิ่มรูปภาพ</span>
              <input type="file" accept="image/*" multiple onChange={handleGalleryUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Attachments Document Upload */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <label className="text-xs md:text-sm font-bold text-slate-600 flex items-center gap-1.5">
            <Upload className="w-4 h-4 text-navy-brand" />
            เอกสารแนบ (PDF, Word, PowerPoint)
          </label>
          
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            {/* Attachment item cards */}
            <div className="w-full sm:flex-1 space-y-2">
              {attachments.length === 0 ? (
                <p className="text-xs text-slate-400 italic">ยังไม่ได้แนบเอกสารใดๆ สำหรับกิจกรรมนี้</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {attachments.map((att) => (
                    <div key={att.id} className="p-2.5 border border-slate-100 bg-slate-50 rounded-xl flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <span className="font-extrabold text-[9px] px-1.5 py-0.5 bg-navy-brand text-white rounded uppercase">
                          {att.type}
                        </span>
                        <p className="font-bold text-slate-700 truncate" title={att.name}>{att.name}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(att.id)}
                        className="p-1 hover:bg-white text-slate-400 hover:text-red-500 rounded transition-colors cursor-pointer"
                        title="ลบเอกสารแนบ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Document upload label picker */}
            <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors w-full sm:w-56 h-24">
              <Upload className="w-5 h-5 text-slate-400 animate-bounce" />
              <span className="text-[10px] font-bold text-navy-brand mt-1.5">คลิกอัปโหลดเอกสารแนบ</span>
              <span className="text-[9px] text-slate-400 mt-0.5">ไฟล์ .pdf, .docx, .pptx</span>
              <input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx" multiple onChange={handleAttachmentUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 pt-5 border-t border-slate-100 justify-end">
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl font-bold transition-all text-xs md:text-sm cursor-pointer"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-1.5 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl text-xs md:text-sm font-extrabold shadow-md transition-all cursor-pointer"
          >
            {isSaving ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                <span>กำลังบันทึกข้อมูล...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>บันทึกข้อมูลกิจกรรม</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
