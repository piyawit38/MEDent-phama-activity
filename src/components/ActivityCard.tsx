/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Calendar, MapPin, Clock, ChevronRight } from 'lucide-react';
import { Activity } from '../types';

interface ActivityCardProps {
  key?: string;
  activity: Activity;
  isSelected: boolean;
  onClick: () => void;
}

export default function ActivityCard({ activity, isSelected, onClick }: ActivityCardProps) {
  // Format Thai Date Range
  const formatThaiDateRange = (startDateString: string, endDateString?: string) => {
    try {
      const months = [
        'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
        'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
      ];
      const start = new Date(startDateString);
      if (isNaN(start.getTime())) return startDateString;

      const startDay = start.getDate();
      const startMonthIndex = start.getMonth();
      const startMonth = months[startMonthIndex];
      const startYear = start.getFullYear() + 543; // Buddhist Era

      if (!endDateString || endDateString === startDateString) {
        return `${startDay} ${startMonth} ${startYear}`;
      }

      const end = new Date(endDateString);
      if (isNaN(end.getTime())) return `${startDay} ${startMonth} ${startYear}`;

      const endDay = end.getDate();
      const endMonthIndex = end.getMonth();
      const endMonth = months[endMonthIndex];
      const endYear = end.getFullYear() + 543;

      if (startYear === endYear) {
        if (startMonthIndex === endMonthIndex) {
          return `${startDay} - ${endDay} ${startMonth} ${startYear}`;
        } else {
          return `${startDay} ${startMonth} - ${endDay} ${endMonth} ${startYear}`;
        }
      } else {
        return `${startDay} ${startMonth} ${startYear} - ${endDay} ${endMonth} ${endYear}`;
      }
    } catch {
      return startDateString;
    }
  };

  const isOpen = activity.status === 'open';

  return (
    <div
      onClick={onClick}
      className={`border-2 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md flex flex-col h-full bg-white group ${
        isSelected
          ? 'border-navy-brand bg-blue-50/50 scale-[1.01]'
          : 'border-slate-100 hover:border-purple-200'
      }`}
      id={`activity-card-${activity.id}`}
    >
      {/* Cover Image */}
      <div className="relative w-full h-40 bg-slate-100 overflow-hidden flex-shrink-0">
        <img
          src={activity.coverImage}
          alt={activity.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            // Placeholder fallback if image fails to load
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80';
          }}
        />
        {/* Status Badge */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span
            className={`px-3 py-1 rounded-full text-[11px] font-bold text-white shadow-sm flex items-center gap-1 ${
              isOpen ? 'bg-emerald-500' : 'bg-red-500'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full bg-white ${isOpen ? 'animate-pulse' : ''}`} />
            {isOpen ? 'เปิดรับลงทะเบียน' : 'ปิดรับลงทะเบียน'}
          </span>
        </div>
      </div>

      {/* Details Container */}
      <div className="p-4 flex flex-col flex-1">
        <h3
          className={`font-bold text-sm md:text-base leading-snug line-clamp-2 mb-3 group-hover:text-purple-brand transition-colors ${
            isSelected ? 'text-navy-brand' : 'text-slate-800'
          }`}
        >
          {activity.title}
        </h3>

        {/* Info Rows */}
        <div className="space-y-2 text-xs text-slate-600 flex-1">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-purple-brand flex-shrink-0" />
            <span>{formatThaiDateRange(activity.date, activity.endDate)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-purple-brand flex-shrink-0" />
            <span className="line-clamp-1">{activity.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-purple-brand flex-shrink-0" />
            <span className="line-clamp-1">{activity.location}</span>
          </div>
        </div>

        {/* Bottom Button Action */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">คลิกเพื่อดูข้อมูล</span>
          <span className="text-xs font-bold text-navy-brand group-hover:text-purple-brand flex items-center gap-0.5 transition-colors">
            ดูรายละเอียด
            <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </div>
  );
}
