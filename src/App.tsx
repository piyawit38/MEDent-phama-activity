/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  ChevronLeft, 
  Sparkles, 
  ShieldAlert, 
  AlertCircle,
  QrCode,
  Users
} from 'lucide-react';
import Header from './components/Header';
import ActivityCard from './components/ActivityCard';
import ActivityDetail from './components/ActivityDetail';
import RegistrationForm from './components/RegistrationForm';
import AdminDashboard from './components/AdminDashboard';
import AdminActivityForm from './components/AdminActivityForm';
import { DBService } from './services/db';
import { Activity, Registration } from './types';

export default function App() {
  // DB States
  const [activities, setActivities] = useState<Activity[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  
  // App navigation states
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  // Admin passcode verification states
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState('');
  const [passcodeError, setPasscodeError] = useState('');

  // Admin section states
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [adminEditActivity, setAdminEditActivity] = useState<Activity | null>(null);

  // QR Code generator/show overlay (optional mock fun feature)
  const [showQrModal, setShowQrModal] = useState(false);

  // Load activities & registrations initially
  const loadData = () => {
    const list = DBService.getActivities();
    const regs = DBService.getRegistrations();
    setActivities(list);
    setRegistrations(regs);

    // Default to the first open activity on desktop if none selected
    if (list.length > 0 && !selectedActivityId && typeof window !== 'undefined' && window.innerWidth >= 768) {
      setSelectedActivityId(list[0].id);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter activities based on search query
  const filteredActivities = activities.filter((act) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    return (
      act.title.toLowerCase().includes(query) ||
      act.location.toLowerCase().includes(query) ||
      act.description.toLowerCase().includes(query) ||
      (act.thingsToPrepare && act.thingsToPrepare.toLowerCase().includes(query))
    );
  });

  // Get current active activity
  const activeActivity = activities.find(a => a.id === selectedActivityId) || null;

  // Handle Logo click
  const handleLogoClick = () => {
    setIsAdmin(false);
    setShowAdminForm(false);
    setIsRegistering(false);
    setSearchQuery('');
    if (activities.length > 0) {
      setSelectedActivityId(activities[0].id);
    } else {
      setSelectedActivityId(null);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800 font-sans" id="app-root-container">
      {/* Top Banner Header */}
      <Header
        isAdmin={isAdmin}
        setIsAdmin={(admin) => {
          if (admin) {
            setShowPasscodeModal(true);
            setPasscodeInput('');
            setPasscodeError('');
          } else {
            setIsAdmin(false);
            setShowAdminForm(false);
            setIsRegistering(false);
            loadData();
          }
        }}
        searchQuery={searchQuery}
        setSearchQuery={(q) => {
          setSearchQuery(q);
          // Set selection to first searched result on desktop
          if (q.trim() && filteredActivities.length > 0 && typeof window !== 'undefined' && window.innerWidth >= 768) {
            setSelectedActivityId(filteredActivities[0].id);
          }
        }}
        onLogoClick={handleLogoClick}
      />

      {/* Main Content Area */}
      {isAdmin ? (
        /* ================= ADMIN VIEW ================= */
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8" id="admin-main-section">
          {showAdminForm ? (
            <AdminActivityForm
              activity={adminEditActivity}
              onBack={() => {
                setShowAdminForm(false);
                setAdminEditActivity(null);
                loadData();
              }}
            />
          ) : (
            <AdminDashboard
              activities={activities}
              registrations={registrations}
              onAddActivity={() => {
                setAdminEditActivity(null);
                setShowAdminForm(true);
              }}
              onEditActivity={(act) => {
                setAdminEditActivity(act);
                setShowAdminForm(true);
              }}
              onRefresh={loadData}
            />
          )}
        </main>
      ) : (
        /* ================= PARENT / USER VIEW ================= */
        <main className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto overflow-hidden bg-white md:shadow-md md:rounded-3xl my-0 md:my-6 border border-slate-100" id="user-main-section">
          
          {/* LEFT SIDEBAR: Activity List */}
          {/* Responsive behavior: Hidden on mobile when viewing details or registering */}
          <aside 
            className={`w-full md:w-[360px] lg:w-[400px] border-r border-slate-200/80 bg-slate-50/50 flex flex-col flex-shrink-0 ${
              selectedActivityId !== null && (typeof window !== 'undefined' && window.innerWidth < 768)
                ? 'hidden md:flex'
                : 'flex'
            }`}
            id="activities-sidebar"
          >
            {/* Header / Filter status indicator */}
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
              <h2 className="font-extrabold text-slate-700 text-sm md:text-base flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-brand" />
                รายการกิจกรรมโครงการ
              </h2>
              <span className="text-xs bg-purple-brand text-white px-2.5 py-0.5 rounded-full font-bold">
                {filteredActivities.length} กิจกรรม
              </span>
            </div>

            {/* Activities Cards scroll wrapper */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[calc(100vh-210px)] md:max-h-[700px]">
              {filteredActivities.length === 0 ? (
                <div className="text-center py-12 px-4 space-y-3">
                  <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
                  <p className="text-sm font-bold text-slate-500">ไม่พบกิจกรรมที่ค้นหา</p>
                  <p className="text-xs text-slate-400">ลองล้างค่าค้นหาเพื่อลองใหม่อีกครั้ง</p>
                </div>
              ) : (
                filteredActivities.map((act) => (
                  <ActivityCard
                    key={act.id}
                    activity={act}
                    isSelected={selectedActivityId === act.id}
                    onClick={() => {
                      setSelectedActivityId(act.id);
                      setIsRegistering(false); // Reset registering on swap
                    }}
                  />
                ))
              )}
            </div>

            {/* Line Group / QR Code Prompt Area */}
            <div className="p-4 border-t border-slate-100 bg-white/60 flex items-center justify-between text-xs gap-2">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-purple-brand" />
                <div>
                  <p className="font-bold text-slate-700 leading-none">แชร์กลุ่มไลน์ Line QR</p>
                  <p className="text-[10px] text-slate-400 mt-1">สแกนส่งในกลุ่มแชร์โครงการ</p>
                </div>
              </div>
              <button
                onClick={() => setShowQrModal(true)}
                className="px-2.5 py-1.5 bg-navy-brand text-white hover:bg-navy-900 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
              >
                แสดง QR Code
              </button>
            </div>
          </aside>

          {/* RIGHT VIEW PANEL: Activity Detail OR Registration Form */}
          <section 
            className={`flex-1 flex flex-col bg-white overflow-hidden ${
              selectedActivityId === null && (typeof window !== 'undefined' && window.innerWidth < 768)
                ? 'hidden md:flex'
                : 'flex'
            }`}
            id="detail-main-panel"
          >
            {activeActivity ? (
              <div className="flex-1 overflow-y-auto p-4 md:p-8 max-h-[calc(100vh-140px)] md:max-h-[760px] space-y-6">
                
                {/* Mobile Back navigation button */}
                <button
                  onClick={() => {
                    if (isRegistering) {
                      setIsRegistering(false);
                    } else {
                      setSelectedActivityId(null);
                    }
                  }}
                  className="md:hidden flex items-center gap-1 text-xs font-bold text-navy-brand py-1 px-3 border border-slate-200 bg-slate-50 rounded-lg self-start cursor-pointer"
                  id="mobile-back-btn"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>{isRegistering ? 'กลับสู่รายละเอียด' : 'กลับสู่รายการทั้งหมด'}</span>
                </button>

                {isRegistering ? (
                  /* Form view */
                  <RegistrationForm
                    activity={activeActivity}
                    onSuccess={() => {
                      loadData(); // Reload registrations count
                    }}
                    onBack={() => setIsRegistering(false)}
                  />
                ) : (
                  /* Detail view */
                  <ActivityDetail
                    activity={activeActivity}
                    onRegisterClick={() => setIsRegistering(true)}
                  />
                )}
              </div>
            ) : (
              /* Landing/Empty State on Desktop */
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[400px]">
                <div className="w-20 h-20 bg-blue-50 text-navy-brand rounded-3xl flex items-center justify-center mb-4">
                  <Sparkles className="w-10 h-10 text-purple-brand" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">ยินดีต้อนรับสู่โครงการ MEDent phama</h3>
                <p className="text-sm text-slate-400 mt-2 max-w-sm">
                  กรุณาเลือกรายการกิจกรรมที่สนใจจากแถบรายการด้านซ้ายมือ เพื่อดูพิกัดตารางงาน เอกสารแนบ หรือลงทะเบียนตอบรับเข้าร่วมงานได้ทันที
                </p>
              </div>
            )}
          </section>

        </main>
      )}

      {/* Global Interactive QR Overlay Modal */}
      {showQrModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 text-center max-w-sm w-full space-y-5 shadow-2xl relative">
            <h3 className="font-extrabold text-navy-brand text-base md:text-lg">สแกนคิวอาร์โค้ดลงกลุ่ม Line</h3>
            <div className="w-48 h-48 bg-slate-100 border border-slate-200 rounded-2xl mx-auto flex items-center justify-center relative p-3">
              {/* Realistic Thai line QR code template */}
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-brand/5 to-navy-brand/5 rounded-2xl pointer-events-none" />
              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https://line.me/R/ti/g/abcdefg"
                alt="LINE QR Code"
                className="w-full h-full object-contain"
                onError={(e) => {
                  // Fallback if network is slow
                  (e.target as HTMLImageElement).src = 'https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg';
                }}
              />
            </div>
            <p className="text-xs text-slate-500 font-medium">
              ผู้ปกครองสามารถสแกนคิวอาร์โค้ดนี้เพื่อแชร์ลิงก์หรือเข้ากลุ่ม Line ประชาสัมพันธ์ข่าวสารกิจกรรมสุขภาพได้อย่างรวดเร็ว
            </p>
            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2 bg-purple-brand hover:bg-purple-700 text-white font-bold rounded-xl text-xs md:text-sm shadow-md transition-all cursor-pointer"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      )}

      {/* Admin Passcode Modal */}
      {showPasscodeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="admin-passcode-modal">
          <div className="bg-white rounded-3xl p-6 text-center max-w-sm w-full space-y-4 shadow-2xl relative border border-slate-200">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto text-purple-brand animate-bounce">
              <ShieldAlert className="w-6 h-6" />
            </div>
            
            <div className="space-y-1">
              <h3 className="font-extrabold text-navy-brand text-base md:text-lg">เข้าสู่ระบบผู้ดูแลโครงการ</h3>
              <p className="text-xs text-slate-500 font-medium">กรุณากรอกรหัสผ่าน 10 หลัก เพื่อสลับเป็นมุมมองแอดมิน</p>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (passcodeInput === '1234567890') {
                setIsAdmin(true);
                setShowPasscodeModal(false);
                setShowAdminForm(false);
                setIsRegistering(false);
                loadData();
              } else {
                setPasscodeError('รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
              }
            }} className="space-y-3.5">
              <div className="relative">
                <input
                  type="password"
                  placeholder="กรอกรหัสผ่านผู้ดูแล..."
                  value={passcodeInput}
                  onChange={(e) => {
                    setPasscodeInput(e.target.value);
                    if (passcodeError) setPasscodeError('');
                  }}
                  maxLength={20}
                  autoFocus
                  className={`w-full border rounded-xl px-4 py-2.5 text-center text-sm tracking-widest font-black focus:ring-2 focus:ring-purple-brand outline-none transition-all ${
                    passcodeError ? 'border-red-400 bg-red-50/25' : 'border-slate-200 bg-slate-50/50 focus:bg-white'
                  }`}
                  id="admin-passcode-input"
                />
              </div>

              {passcodeError && (
                <p className="text-[11px] text-red-500 font-bold bg-red-50/50 py-1 px-2 rounded-lg border border-red-100/50">
                  {passcodeError}
                </p>
              )}

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowPasscodeModal(false)}
                  className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-xs md:text-sm transition-all cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="py-2.5 bg-purple-brand hover:bg-purple-700 text-white font-bold rounded-xl text-xs md:text-sm shadow-md transition-all cursor-pointer"
                  id="admin-passcode-submit-btn"
                >
                  ยืนยันรหัส
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer bar */}
      <footer className="bg-white border-t border-slate-100 py-4.5 px-4 text-center text-[11px] md:text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl w-full mx-auto flex-shrink-0">
        <p className="font-medium text-slate-500">© 2026 MEDent phama Health Innovation Activity Project. All Rights Reserved.</p>
        <div className="flex items-center gap-1.5 font-bold text-navy-brand">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>เซิร์ฟเวอร์ระบบพร้อมใช้งาน</span>
        </div>
      </footer>
    </div>
  );
}
