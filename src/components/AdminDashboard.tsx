/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Users, 
  Calendar, 
  Plus, 
  Edit, 
  Trash2, 
  FileSpreadsheet, 
  Search, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Clock,
  Briefcase,
  ChevronRight,
  Download,
  MessageSquare
} from 'lucide-react';
import { Activity, Registration } from '../types';
import { DBService } from '../services/db';
import * as XLSX from 'xlsx';
import ActivityQABoard from './ActivityQABoard';

interface AdminDashboardProps {
  activities: Activity[];
  registrations: Registration[];
  onAddActivity: () => void;
  onEditActivity: (activity: Activity) => void;
  onRefresh: () => void;
}

export default function AdminDashboard({
  activities,
  registrations,
  onAddActivity,
  onEditActivity,
  onRefresh,
}: AdminDashboardProps) {
  const [selectedActivityFilter, setSelectedActivityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [adminActiveTab, setAdminActiveTab] = useState<'registrations' | 'qa'>('registrations');
  const [selectedQaActivityId, setSelectedQaActivityId] = useState<string>('');

  // Custom confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'delete_activity' | 'delete_registration';
    id: string;
    title: string;
  }>({
    isOpen: false,
    type: 'delete_activity',
    id: '',
    title: '',
  });
  
  // Format Thai Date
  const formatThaiDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear() + 543;
      // Pad single digits
      const pad = (num: number) => num.toString().padStart(2, '0');
      const hours = pad(date.getHours());
      const minutes = pad(date.getMinutes());
      return `${day}/${month}/${year} ${hours}:${minutes} น.`;
    } catch {
      return dateString;
    }
  };

  // Delete activity handler
  const handleDeleteActivity = (id: string, title: string) => {
    setConfirmDialog({
      isOpen: true,
      type: 'delete_activity',
      id,
      title,
    });
  };

  // Delete single registration handler
  const handleDeleteRegistration = (id: string, studentName: string) => {
    setConfirmDialog({
      isOpen: true,
      type: 'delete_registration',
      id,
      title: studentName,
    });
  };

  // Execute actual deletion on confirm
  const handleConfirmAction = () => {
    if (confirmDialog.type === 'delete_activity') {
      DBService.deleteActivity(confirmDialog.id);
    } else if (confirmDialog.type === 'delete_registration') {
      DBService.deleteRegistration(confirmDialog.id);
    }
    
    setConfirmDialog({ isOpen: false, type: 'delete_activity', id: '', title: '' });
    onRefresh();
  };

  // Toggle activity status
  const handleToggleStatus = (activity: Activity) => {
    const updated: Activity = {
      ...activity,
      status: activity.status === 'open' ? 'closed' : 'open'
    };
    DBService.saveActivity(updated);
    onRefresh();
  };

  // Filter registrations
  const filteredRegistrations = registrations.filter((reg) => {
    const matchesActivity = selectedActivityFilter === 'all' || reg.activityId === selectedActivityFilter;
    
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = !query || 
      reg.studentName.toLowerCase().includes(query) ||
      reg.parentName.toLowerCase().includes(query) ||
      reg.phone.includes(query) ||
      (reg.school && reg.school.toLowerCase().includes(query)) ||
      (reg.grade && reg.grade.toLowerCase().includes(query)) ||
      reg.activityTitle.toLowerCase().includes(query);

    return matchesActivity && matchesSearch;
  });

  // Export to Excel using XLSX
  const handleExportToExcel = () => {
    try {
      // Structure data for Excel sheet
      const excelData = filteredRegistrations.map((reg, idx) => ({
        'ลำดับที่': idx + 1,
        'ชื่อนักเรียน': reg.studentName,
        'ชื่อผู้ปกครอง': reg.parentName,
        'เบอร์โทรศัพท์': reg.phone,
        'โรงเรียน': reg.school || '-',
        'ระดับชั้น': reg.grade || '-',
        'ความประสงค์': reg.intent === 'join' ? 'เข้าร่วมกิจกรรม' : 'ไม่สะดวกเข้าร่วม',
        'หมายเหตุเพิ่มเติม': reg.remarks || '-',
        'ชื่อกิจกรรมที่ลงทะเบียน': reg.activityTitle,
        'วันที่และเวลาลงทะเบียน': formatThaiDate(reg.registeredAt)
      }));

      // Create Worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);
      
      // Create Workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'ผู้ลงทะเบียน');
      
      // Auto-size columns slightly
      const colWidths = [
        { wch: 8 },  // ลำดับที่
        { wch: 25 }, // ชื่อนักเรียน
        { wch: 25 }, // ชื่อผู้ปกครอง
        { wch: 15 }, // เบอร์โทรศัพท์
        { wch: 25 }, // โรงเรียน
        { wch: 15 }, // ระดับชั้น
        { wch: 18 }, // ความประสงค์
        { wch: 30 }, // หมายเหตุเพิ่มเติม
        { wch: 45 }, // ชื่อกิจกรรม
        { wch: 22 }  // วันที่ลงทะเบียน
      ];
      ws['!cols'] = colWidths;

      // Write and trigger download
      const fileName = `MEDent_phama_Registrations_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (e) {
      console.error('Excel Export failed', e);
      alert('ไม่สามารถส่งออกเป็นไฟล์ Excel ได้ในขณะนี้');
    }
  };

  // Count Stats
  const totalRegs = filteredRegistrations.length;
  const joinCount = filteredRegistrations.filter((r) => r.intent === 'join').length;
  const cannotJoinCount = filteredRegistrations.filter((r) => r.intent === 'cannot_join').length;

  return (
    <div className="space-y-8" id="admin-dashboard-container">
      {/* Title & Action Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-navy-brand">ระบบบริหารจัดการโครงการ (Admin Suite)</h2>
          <p className="text-xs text-slate-500 mt-1">ผู้ดูแลระบบสามารถเพิ่ม แก้ไข ลบกิจกรรม และจัดทำรายงานรายชื่อผู้เข้าชมโครงการ</p>
        </div>
        <button
          onClick={onAddActivity}
          className="flex items-center justify-center gap-1.5 px-4.5 py-2.5 bg-purple-brand hover:bg-purple-700 active:scale-[0.98] text-white rounded-xl text-sm font-bold shadow-md transition-all self-start md:self-auto cursor-pointer"
          id="admin-add-activity-btn"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>สร้างกิจกรรมใหม่</span>
        </button>
      </div>

      {/* Aggregate Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Activities */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-navy-brand rounded-xl flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">กิจกรรมทั้งหมด</p>
            <p className="text-xl font-extrabold text-slate-800">{activities.length} รายการ</p>
          </div>
        </div>

        {/* Total Registrations in current filter */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-50 text-purple-brand rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">ยอดผู้ตอบรับรวม</p>
            <p className="text-xl font-extrabold text-slate-800">{totalRegs} คน</p>
          </div>
        </div>

        {/* Total Join */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">ประสงค์เข้าร่วม</p>
            <p className="text-xl font-extrabold text-emerald-600">{joinCount} คน</p>
          </div>
        </div>

        {/* Total Cannot Join */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">สละสิทธิ์</p>
            <p className="text-xl font-extrabold text-rose-500">{cannotJoinCount} คน</p>
          </div>
        </div>
      </div>

      {/* Grid: 1. Activities list, 2. Registrations list */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Left Side: Activities List Management (5 cols) */}
        <div className="xl:col-span-5 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <h3 className="font-extrabold text-slate-800 text-sm md:text-base">จัดการรายการกิจกรรม</h3>
            <span className="text-[10px] md:text-xs bg-navy-light text-navy-brand px-2.5 py-0.5 rounded-full font-bold">
              {activities.length} กิจกรรม
            </span>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {activities.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">ไม่มีกิจกรรมในระบบ กรุณากดปุ่มสร้างกิจกรรมใหม่</p>
            ) : (
              activities.map((act) => (
                <div 
                  key={act.id}
                  className="p-3 bg-slate-50 hover:bg-slate-100/60 rounded-xl border border-slate-100 flex gap-3 transition-colors group"
                >
                  {/* Miniature Cover */}
                  <img
                    src={act.coverImage}
                    alt=""
                    className="w-16 h-16 object-cover rounded-lg border border-slate-200 bg-white flex-shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=400&q=80';
                    }}
                  />
                  
                  {/* Brief Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-700 truncate">{act.title}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                        {act.date}{act.endDate && act.endDate !== act.date ? ` ถึง ${act.endDate}` : ''} • {act.location}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-1 mt-1.5 pt-1.5 border-t border-slate-200/50">
                      {/* Open/Closed toggle clicker */}
                      <button
                        onClick={() => handleToggleStatus(act)}
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold text-white transition-all cursor-pointer ${
                          act.status === 'open' 
                            ? 'bg-emerald-500 hover:bg-emerald-600' 
                            : 'bg-red-500 hover:bg-red-600'
                        }`}
                        title="คลิกเพื่อสลับสถานะเปิด/ปิด"
                      >
                        {act.status === 'open' ? 'เปิดรับลงทะเบียน' : 'ปิดรับลงทะเบียน'}
                      </button>

                      {/* Edit/Delete Actions */}
                      <div className="flex items-center gap-1 text-slate-400">
                        <button
                          onClick={() => onEditActivity(act)}
                          className="p-1 hover:text-navy-brand hover:bg-white rounded transition-colors cursor-pointer"
                          title="แก้ไขกิจกรรม"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteActivity(act.id, act.title)}
                          className="p-1 hover:text-rose-500 hover:bg-white rounded transition-colors cursor-pointer"
                          title="ลบกิจกรรม"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Registrations Viewer Table / Q&A Management (7 cols) */}
        <div className="xl:col-span-7 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 flex flex-col min-w-0">
          {/* Tab Selection */}
          <div className="flex border-b border-slate-150">
            <button
              onClick={() => setAdminActiveTab('registrations')}
              className={`flex-1 py-2.5 text-xs md:text-sm font-bold border-b-2 transition-all flex items-center justify-center gap-2 ${
                adminActiveTab === 'registrations'
                  ? 'border-purple-brand text-purple-brand bg-purple-50/10'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50/50'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>รายชื่อผู้ลงทะเบียน ({filteredRegistrations.length})</span>
            </button>
            <button
              onClick={() => {
                setAdminActiveTab('qa');
                if (!selectedQaActivityId && activities.length > 0) {
                  setSelectedQaActivityId(activities[0].id);
                }
              }}
              className={`flex-1 py-2.5 text-xs md:text-sm font-bold border-b-2 transition-all flex items-center justify-center gap-2 ${
                adminActiveTab === 'qa'
                  ? 'border-purple-brand text-purple-brand bg-purple-50/10'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50/50'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>จัดการข้อสงสัยกิจกรรม (Q&A)</span>
            </button>
          </div>

          {adminActiveTab === 'registrations' ? (
            <>
              {/* Header Controls */}
              <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm md:text-base">รายชื่อผู้ลงทะเบียนตอบรับ</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">คัดกรอง ค้นหา และนำเข้าข้อมูลออกเป็น Excel</p>
                </div>
                
                {/* Excel download button */}
                <button
                  onClick={handleExportToExcel}
                  disabled={filteredRegistrations.length === 0}
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer self-start sm:self-auto"
                  id="admin-export-excel-btn"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>ส่งออกไฟล์ Excel (.xlsx)</span>
                </button>
              </div>

              {/* Filtering row */}
              <div className="flex flex-col sm:flex-row gap-2">
                {/* Filter by Activity */}
                <select
                  value={selectedActivityFilter}
                  onChange={(e) => setSelectedActivityFilter(e.target.value)}
                  className="border border-slate-200 rounded-xl px-3 py-2 text-xs md:text-sm bg-white outline-none focus:ring-1 focus:ring-purple-brand text-slate-600 sm:w-1/2"
                  id="admin-filter-activity-select"
                >
                  <option value="all">แสดงทุกกิจกรรมในระบบ</option>
                  {activities.map((act) => (
                    <option key={act.id} value={act.id}>{act.title}</option>
                  ))}
                </select>

                {/* Keyword Search inside table */}
                <div className="relative flex items-center sm:w-1/2">
                  <input
                    type="text"
                    placeholder="ค้นชื่อนักเรียน, ผู้ปกครอง, โรงเรียน..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs md:text-sm w-full outline-none focus:ring-1 focus:ring-purple-brand text-slate-600"
                    id="admin-search-registrations-input"
                  />
                  <Search className="w-4 h-4 absolute left-2.5 opacity-45 text-slate-500" />
                </div>
              </div>

              {/* Table Container */}
              <div className="flex-1 overflow-x-auto border border-slate-100 rounded-xl max-h-[400px]">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 border-b border-slate-100">
                      <th className="p-3.5 font-bold">นักเรียน / ผู้ปกครอง</th>
                      <th className="p-3.5 font-bold">ติดต่อ</th>
                      <th className="p-3.5 font-bold">โรงเรียน / ชั้น</th>
                      <th className="p-3.5 font-bold text-center">สถานะ</th>
                      <th className="p-3.5 font-bold">หมายเหตุ / กิจกรรม</th>
                      <th className="p-3.5 font-bold text-center">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredRegistrations.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400 italic">
                          ไม่พบข้อมูลผู้ลงทะเบียนตามเงื่อนไขที่เลือก
                        </td>
                      </tr>
                    ) : (
                      filteredRegistrations.map((reg) => (
                        <tr key={reg.id} className="hover:bg-slate-50/50">
                          {/* Student & Parent names */}
                          <td className="p-3.5">
                            <p className="font-bold text-slate-800">{reg.studentName}</p>
                            <p className="text-[10px] text-slate-400 font-medium">ผปค: {reg.parentName}</p>
                          </td>
                          
                          {/* Phone & registered Date */}
                          <td className="p-3.5 whitespace-nowrap">
                            <a href={`tel:${reg.phone}`} className="text-purple-brand font-semibold hover:underline">
                              {reg.phone}
                            </a>
                            <p className="text-[9px] text-slate-400 mt-0.5">{formatThaiDate(reg.registeredAt)}</p>
                          </td>

                          {/* School & Grade */}
                          <td className="p-3.5 max-w-[150px] truncate">
                            <p className="font-medium">{reg.school || '-'}</p>
                            <p className="text-[10px] text-slate-400">{reg.grade || '-'}</p>
                          </td>

                          {/* Intent Status Badge */}
                          <td className="p-3.5 text-center whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                reg.intent === 'join'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {reg.intent === 'join' ? 'เข้าร่วม' : 'ไม่เข้าร่วม'}
                            </span>
                          </td>

                          {/* Activity Title / Remarks */}
                          <td className="p-3.5 max-w-[180px]">
                            <p className="text-[10px] text-slate-400 truncate font-semibold" title={reg.activityTitle}>
                              {reg.activityTitle}
                            </p>
                            {reg.remarks && (
                              <p className="text-[10px] text-amber-600 italic bg-amber-50/50 px-1 py-0.5 rounded border border-amber-100/50 mt-0.5 leading-snug line-clamp-1" title={reg.remarks}>
                                {reg.remarks}
                              </p>
                            )}
                          </td>

                          {/* Individual Registration Delete Action */}
                          <td className="p-3.5 text-center">
                            <button
                              onClick={() => handleDeleteRegistration(reg.id, reg.studentName)}
                              className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="ลบรายชื่อผู้ลงทะเบียน"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            /* Q&A Board Management Tab */
            <div className="space-y-4 flex flex-col min-w-0">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-800 text-sm md:text-base">ตอบคำถาม & จัดการข้อสงสัยของแต่ละกิจกรรม</h3>
                <p className="text-[10px] text-slate-400 mt-0.5 font-medium">เลือกกิจกรรมจากตัวเลือกด้านล่าง เพื่อเรียกดู ตอบกลับ หรือลบกระทู้คำถามที่ผู้ปกครองส่งเข้ามา</p>
              </div>

              {/* Activity selector for QA */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">เลือกกิจกรรมที่ต้องการตอบคำถาม:</label>
                <select
                  value={selectedQaActivityId}
                  onChange={(e) => setSelectedQaActivityId(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs md:text-sm bg-white outline-none focus:ring-1 focus:ring-purple-brand text-slate-600 font-semibold"
                  id="admin-qa-activity-select"
                >
                  <option value="" disabled>--- กรุณาเลือกกิจกรรม ---</option>
                  {activities.map((act) => (
                    <option key={act.id} value={act.id}>{act.title}</option>
                  ))}
                </select>
              </div>

              {selectedQaActivityId ? (
                <div className="flex-1 overflow-y-auto max-h-[500px]">
                  <ActivityQABoard
                    activityId={selectedQaActivityId}
                    isAdmin={true}
                    onRefresh={onRefresh}
                  />
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400 italic text-xs border border-dashed border-slate-150 rounded-2xl bg-slate-50/50">
                  กรุณาเลือกกิจกรรมก่อนเพื่อเข้าจัดการ Q&A
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Custom Confirmation Modal */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="admin-confirm-modal">
          <div className="bg-white rounded-3xl p-6 text-center max-w-sm w-full space-y-4 shadow-2xl relative border border-slate-200">
            <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6 animate-pulse" />
            </div>

            <div className="space-y-1.5">
              <h3 className="font-extrabold text-slate-800 text-sm md:text-base">
                {confirmDialog.type === 'delete_activity' ? 'ยืนยันการลบกิจกรรม?' : 'ยืนยันการลบผู้ลงทะเบียน?'}
              </h3>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                {confirmDialog.type === 'delete_activity' ? (
                  <>
                    คุณแน่ใจหรือไม่ที่จะลบกิจกรรม <span className="text-rose-600 font-bold">"{confirmDialog.title}"</span>?
                    <br />
                    <span className="text-rose-500 text-[10px] font-extrabold">*ข้อมูลการลงทะเบียนทั้งหมดของกิจกรรมนี้จะถูกลบออกถาวร*</span>
                  </>
                ) : (
                  <>
                    คุณแน่ใจหรือไม่ที่จะลบรายชื่อผู้ลงทะเบียน <span className="text-rose-600 font-bold">"{confirmDialog.title}"</span>?
                    <br />
                    <span className="text-rose-500 text-[10px] font-extrabold">*การกระทำนี้ไม่สามารถย้อนกลับได้*</span>
                  </>
                )}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1.5">
              <button
                onClick={() => setConfirmDialog({ isOpen: false, type: 'delete_activity', id: '', title: '' })}
                className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-xs md:text-sm transition-all cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirmAction}
                className="py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-xs md:text-sm shadow-md transition-all cursor-pointer"
                id="admin-confirm-delete-btn"
              >
                ยืนยันการลบ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
