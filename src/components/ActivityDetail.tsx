/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Map, 
  Phone, 
  User, 
  FileText, 
  Briefcase, 
  ChevronRight,
  Download,
  ExternalLink
} from 'lucide-react';
import { Activity, Attachment } from '../types';
import ActivityQABoard from './ActivityQABoard';

interface ActivityDetailProps {
  activity: Activity;
  onRegisterClick: () => void;
  isAdmin?: boolean;
}

export default function ActivityDetail({ activity, onRegisterClick, isAdmin = false }: ActivityDetailProps) {
  const [selectedImage, setSelectedImage] = useState<string>(activity.coverImage);

  // Sync state if activity changes
  React.useEffect(() => {
    setSelectedImage(activity.coverImage);
  }, [activity]);

  // Thai Date formatting helper
  const formatThaiFullDateRange = (startDateString: string, endDateString?: string) => {
    try {
      const months = [
        'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
      ];
      const start = new Date(startDateString);
      if (isNaN(start.getTime())) return startDateString;

      const startDay = start.getDate();
      const startMonthIndex = start.getMonth();
      const startMonth = months[startMonthIndex];
      const startYear = start.getFullYear() + 543;

      if (!endDateString || endDateString === startDateString) {
        return `${startDay} ${startMonth} พ.ศ. ${startYear}`;
      }

      const end = new Date(endDateString);
      if (isNaN(end.getTime())) return `${startDay} ${startMonth} พ.ศ. ${startYear}`;

      const endDay = end.getDate();
      const endMonthIndex = end.getMonth();
      const endMonth = months[endMonthIndex];
      const endYear = end.getFullYear() + 543;

      if (startYear === endYear) {
        if (startMonthIndex === endMonthIndex) {
          // Same month and year: "15 - 17 ตุลาคม พ.ศ. 2569"
          return `${startDay} - ${endDay} ${startMonth} พ.ศ. ${startYear}`;
        } else {
          // Different month, same year: "15 ตุลาคม - 17 พฤศจิกายน พ.ศ. 2569"
          return `${startDay} ${startMonth} - ${endDay} ${endMonth} พ.ศ. ${startYear}`;
        }
      } else {
        // Different year: "15 ตุลาคม พ.ศ. 2569 - 17 มกราคม พ.ศ. 2570"
        return `${startDay} ${startMonth} พ.ศ. ${startYear} - ${endDay} ${endMonth} พ.ศ. ${endYear}`;
      }
    } catch {
      return startDateString;
    }
  };

  // Safe file downloader for Base64 or standard mock data
  const handleDownload = (attachment: Attachment) => {
    try {
      const link = document.createElement('a');
      link.href = attachment.dataUrl || '#';
      link.setAttribute('download', attachment.name);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error('Download failed, using mock alert fallback', e);
    }
  };

  const isOpen = activity.status === 'open';

  // Helper to determine icon based on file type
  const getAttachmentStyles = (type: Attachment['type']) => {
    switch (type) {
      case 'pdf':
        return {
          bg: 'bg-rose-50 border-rose-100',
          text: 'text-rose-600',
          badge: 'bg-rose-600 text-white',
          label: 'PDF'
        };
      case 'word':
        return {
          bg: 'bg-blue-50 border-blue-100',
          text: 'text-blue-600',
          badge: 'bg-blue-600 text-white',
          label: 'DOCX'
        };
      case 'powerpoint':
        return {
          bg: 'bg-amber-50 border-amber-100',
          text: 'text-amber-600',
          badge: 'bg-amber-600 text-white',
          label: 'PPTX'
        };
      default:
        return {
          bg: 'bg-slate-50 border-slate-100',
          text: 'text-slate-600',
          badge: 'bg-slate-600 text-white',
          label: 'FILE'
        };
    }
  };

  return (
    <div className="space-y-6" id={`activity-detail-${activity.id}`}>
      {/* Activity Name */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span
            className={`px-3 py-0.5 rounded-full text-xs font-bold ${
              isOpen 
                ? 'bg-emerald-100 text-emerald-800' 
                : 'bg-red-100 text-red-800'
            }`}
          >
            {isOpen ? '● กำลังเปิดรับสมัคร' : '● ปิดรับสมัครแล้ว'}
          </span>
        </div>
        <h2 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-navy-brand leading-tight">
          {activity.title}
        </h2>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Gallery Panel (5 cols on large screens) */}
        <div className="lg:col-span-5 space-y-3">
          {/* Main Selected Image */}
          <div className="w-full aspect-video md:aspect-[4/3] bg-slate-100 rounded-2xl overflow-hidden shadow-inner border border-slate-200 relative group">
            <img
              src={selectedImage}
              alt="กิจกรรม"
              className="w-full h-full object-cover transition-all duration-300"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80';
              }}
            />
          </div>

          {/* Gallery Thumbnails */}
          {activity.gallery && activity.gallery.length > 0 && (
            <div className="grid grid-cols-4 gap-2 overflow-x-auto pb-1">
              {/* Cover image always first in thumbnails */}
              <button
                onClick={() => setSelectedImage(activity.coverImage)}
                className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                  selectedImage === activity.coverImage ? 'border-purple-brand scale-95 shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img src={activity.coverImage} className="w-full h-full object-cover" alt="หน้าปก" />
              </button>

              {/* Other Gallery Images */}
              {activity.gallery.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(imgUrl)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImage === imgUrl ? 'border-purple-brand scale-95 shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={imgUrl} className="w-full h-full object-cover" alt={`รูปที่ ${idx + 1}`} />
                </button>
              ))}
            </div>
          )}

          {/* Google Maps Button */}
          {activity.googleMaps && (
            <a
              href={activity.googleMaps}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 bg-navy-brand text-white hover:bg-navy-900 rounded-xl text-sm font-semibold shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              id="google-maps-btn"
            >
              <Map className="w-4 h-4 text-purple-300" />
              <span>ดูตำแหน่งทางระบบ Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-60" />
            </a>
          )}
        </div>

        {/* Content Info (7 cols on large screens) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Logistics Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
            <div className="flex items-start gap-2.5">
              <Calendar className="w-5 h-5 text-purple-brand mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">วันที่จัดกิจกรรม</p>
                <p className="text-xs md:text-sm font-semibold text-slate-700">{formatThaiFullDateRange(activity.date, activity.endDate)}</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Clock className="w-5 h-5 text-purple-brand mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">เวลาจัดงาน</p>
                <p className="text-xs md:text-sm font-semibold text-slate-700">{activity.time}</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5 col-span-1 sm:col-span-1">
              <MapPin className="w-5 h-5 text-purple-brand mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">สถานที่จัดงาน</p>
                <p className="text-xs md:text-sm font-semibold text-slate-700 line-clamp-2">{activity.location}</p>
              </div>
            </div>
          </div>

          {/* Long Description Text Block */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
            <h4 className="font-bold text-slate-700 mb-2 text-sm border-b pb-1.5 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-purple-brand" />
              รายละเอียดกิจกรรม
            </h4>
            <div className="text-xs md:text-sm text-slate-600 leading-relaxed whitespace-pre-line space-y-2">
              {activity.description}
            </div>
          </div>

          {/* Things to Prepare Block */}
          {activity.thingsToPrepare && activity.thingsToPrepare !== 'ไม่มี' && (
            <div className="bg-purple-light border border-purple-100 rounded-2xl p-4">
              <h4 className="font-bold text-purple-900 mb-1.5 text-sm flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-purple-brand" />
                สิ่งที่ต้องจัดเตรียม
              </h4>
              <p className="text-xs md:text-sm text-purple-800 leading-relaxed">
                {activity.thingsToPrepare}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Attachments & Files Download Panel */}
      {activity.attachments && activity.attachments.length > 0 && (
        <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-5">
          <h4 className="font-bold text-slate-700 mb-3 text-sm flex items-center gap-2">
            <Download className="w-4 h-4 text-navy-brand animate-bounce" />
            เอกสารแนบและไฟล์ดาวน์โหลด
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {activity.attachments.map((file) => {
              const style = getAttachmentStyles(file.type);
              return (
                <div
                  key={file.id}
                  onClick={() => handleDownload(file)}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all bg-white ${style.bg}`}
                  id={`attachment-card-${file.id}`}
                >
                  <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${style.badge}`}>
                    {style.label}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-700 truncate">{file.name}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{file.size}</p>
                  </div>
                  <Download className={`w-4 h-4 opacity-75 ${style.text}`} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Coordinator Contacts Block */}
      <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col md:flex-row md:items-center md:justify-between text-xs text-slate-500 gap-3">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5">
          {activity.coordinator && (
            <span className="flex items-center gap-1.5 font-medium">
              <User className="w-3.5 h-3.5 text-navy-brand" />
              ผู้ประสานงาน: <strong className="text-slate-700">{activity.coordinator}</strong>
            </span>
          )}
          {activity.phone && (
            <span className="flex items-center gap-1.5 font-medium">
              <Phone className="w-3.5 h-3.5 text-navy-brand" />
              เบอร์ติดต่อ: <a href={`tel:${activity.phone}`} className="text-purple-brand font-bold hover:underline">{activity.phone}</a>
            </span>
          )}
        </div>
        <div className="text-[10px] text-slate-400 font-medium">
          * มีคำถามเพิ่มเติมติดต่อผู้ประสานงานได้ทันที
        </div>
      </div>

      {/* Discussion & Q&A Board */}
      <ActivityQABoard activityId={activity.id} isAdmin={isAdmin} />

      {/* Sticky Bottom Active Form Trigger */}
      <div className="pt-2">
        {isOpen ? (
          <button
            onClick={onRegisterClick}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.99] text-white rounded-2xl text-base md:text-lg font-bold shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 cursor-pointer"
            id="register-active-form-trigger"
          >
            <span>ลงทะเบียนเข้าร่วมกิจกรรม</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <div className="w-full py-4 bg-slate-200 text-slate-400 rounded-2xl text-center text-sm md:text-base font-bold border border-slate-300">
            ขออภัย! กิจกรรมนี้ปิดรับลงทะเบียนชั่วคราวหรือมีผู้สมัครเต็มจำนวนแล้ว
          </div>
        )}
      </div>
    </div>
  );
}
