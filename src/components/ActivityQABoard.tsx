/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  CornerDownRight, 
  User, 
  Shield, 
  Trash2, 
  CheckCircle2, 
  HelpCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { DBService } from '../services/db';
import { ActivityQA } from '../types';

interface ActivityQABoardProps {
  activityId: string;
  isAdmin?: boolean;
  onRefresh?: () => void;
}

export default function ActivityQABoard({ activityId, isAdmin = false, onRefresh }: ActivityQABoardProps) {
  const [qas, setQas] = useState<ActivityQA[]>([]);
  
  // Ask field states
  const [askerName, setAskerName] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [askError, setAskError] = useState('');
  const [askSuccess, setAskSuccess] = useState(false);

  // Reply field states
  const [replyQAId, setReplyQAId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyError, setReplyError] = useState('');

  // Delete Q&A state
  const [qaToDeleteId, setQaToDeleteId] = useState<string | null>(null);

  const loadQAs = () => {
    const list = DBService.getQAsByActivity(activityId);
    setQas(list);
  };

  useEffect(() => {
    loadQAs();
    // Reset states on activity swap
    setAskerName('');
    setQuestionText('');
    setAskError('');
    setAskSuccess(false);
    setReplyQAId(null);
    setReplyText('');
    setReplyError('');

    const handleDbUpdate = () => {
      loadQAs();
    };
    window.addEventListener('db-update', handleDbUpdate);
    return () => {
      window.removeEventListener('db-update', handleDbUpdate);
    };
  }, [activityId]);

  const handleAskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAskError('');
    setAskSuccess(false);

    if (!questionText.trim()) {
      setAskError('กรุณากรอกคำถามหรือข้อสงสัย');
      return;
    }

    const finalAskerName = askerName.trim() || 'ผู้ปกครองผู้ไม่ประสงค์ออกนาม';
    DBService.addQuestion(activityId, finalAskerName, questionText.trim());
    
    // Reset and success feedback
    setQuestionText('');
    setAskSuccess(true);
    loadQAs();
    
    if (onRefresh) {
      onRefresh();
    }

    // Auto clear success text after 3 seconds
    setTimeout(() => {
      setAskSuccess(false);
    }, 3000);
  };

  const handleAnswerSubmit = (qaId: string) => {
    setReplyError('');
    if (!replyText.trim()) {
      setReplyError('กรุณากรอกข้อความตอบกลับ');
      return;
    }

    DBService.answerQuestion(qaId, replyText.trim());
    setReplyQAId(null);
    setReplyText('');
    loadQAs();

    if (onRefresh) {
      onRefresh();
    }
  };

  const handleDeleteQA = (qaId: string) => {
    setQaToDeleteId(qaId);
  };

  const confirmDeleteQA = () => {
    if (qaToDeleteId) {
      DBService.deleteQA(qaToDeleteId);
      loadQAs();
      if (onRefresh) {
        onRefresh();
      }
      setQaToDeleteId(null);
    }
  };

  // Helper to format date relative or clean
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return isoString;
      
      const day = date.getDate();
      const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
      const month = months[date.getMonth()];
      const year = date.getFullYear() + 543;
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');

      return `${day} ${month} ${year} • ${hours}:${minutes} น.`;
    } catch {
      return isoString;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-150 shadow-sm overflow-hidden" id={`qa-board-${activityId}`}>
      {/* Header Banner */}
      <div className="p-4 bg-slate-50 border-b border-slate-150/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-purple-brand" />
          <div>
            <h3 className="font-extrabold text-slate-800 text-sm md:text-base">กระดานถามตอบข้อสงสัย</h3>
            <p className="text-[10px] md:text-xs text-slate-500 font-medium">มีข้อสงสัยเกี่ยวกับพิกัด ตารางเวลา หรือการแต่งกาย ถาม-ตอบได้ที่นี่</p>
          </div>
        </div>
        <span className="text-xs bg-purple-light text-purple-brand px-2.5 py-1 rounded-full font-bold">
          {qas.length} กระทู้
        </span>
      </div>

      <div className="p-4 md:p-6 space-y-6">
        {/* Discussion / Q&A thread list */}
        <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
          {qas.length === 0 ? (
            <div className="text-center py-8 px-4 border-2 border-dashed border-slate-100 rounded-xl space-y-2">
              <HelpCircle className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-400">ยังไม่มีข้อสงสัยในกิจกรรมนี้</p>
              <p className="text-[10px] text-slate-400">คุณสามารถเป็นคนแรกที่โพสต์ถามข้อสงสัยได้ที่กล่องข้อความด้านล่าง</p>
            </div>
          ) : (
            qas.map((qa) => {
              const isAnswered = !!qa.answer;
              return (
                <div 
                  key={qa.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isAnswered 
                      ? 'border-emerald-100 bg-emerald-50/10 hover:bg-emerald-50/20' 
                      : 'border-amber-100 bg-amber-50/10 hover:bg-amber-50/20'
                  }`}
                  id={`qa-item-${qa.id}`}
                >
                  {/* Top line of post */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs">
                      <div className={`p-1 rounded-lg ${qa.authorRole === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="font-extrabold text-slate-700">{qa.authorName}</span>
                        <span className="text-[9px] text-slate-400 ml-2 flex items-center gap-0.5 inline-flex">
                          <Clock className="w-2.5 h-2.5" />
                          {formatTime(qa.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Status pill */}
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${
                        isAnswered 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {isAnswered ? 'ตอบแล้ว' : 'รอคำตอบ'}
                      </span>

                      {/* Admin action: delete */}
                      {isAdmin && (
                        <button
                          onClick={() => handleDeleteQA(qa.id)}
                          className="p-1 text-slate-400 hover:text-red-500 rounded hover:bg-slate-100 transition-colors"
                          title="ลบคำถาม"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Question content */}
                  <div className="mt-2 pl-1.5 text-xs md:text-sm text-slate-700 font-semibold whitespace-pre-line leading-relaxed">
                    {qa.question}
                  </div>

                  {/* Answer section if exists */}
                  {isAnswered ? (
                    <div className="mt-3.5 pt-3.5 border-t border-slate-100 pl-4 md:pl-6 relative">
                      <CornerDownRight className="w-4 h-4 text-emerald-500 absolute left-0 top-3.5" />
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
                          <Shield className="w-3.5 h-3.5 text-emerald-600" />
                          <span>ฝ่ายประสานงานผู้ดูแลโครงการ</span>
                          {qa.answeredAt && (
                            <span className="text-[9px] text-slate-400 font-normal">
                              • {formatTime(qa.answeredAt)}
                            </span>
                          )}
                        </div>
                        <p className="text-xs md:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                          {qa.answer}
                        </p>
                      </div>
                    </div>
                  ) : (
                    /* Admin action: reply inline */
                    isAdmin && (
                      <div className="mt-3 pt-3 border-t border-dashed border-slate-200">
                        {replyQAId === qa.id ? (
                          <div className="space-y-2">
                            <textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="พิมพ์คำตอบกลับที่นี่..."
                              className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-purple-brand bg-white outline-none"
                              rows={2}
                            />
                            {replyError && <p className="text-[10px] text-red-500 font-bold">{replyError}</p>}
                            <div className="flex items-center justify-end gap-2 text-xs">
                              <button
                                onClick={() => {
                                  setReplyQAId(null);
                                  setReplyText('');
                                  setReplyError('');
                                }}
                                className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200"
                              >
                                ยกเลิก
                              </button>
                              <button
                                onClick={() => handleAnswerSubmit(qa.id)}
                                className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-bold"
                              >
                                บันทึกคำตอบ
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setReplyQAId(qa.id);
                              setReplyText('');
                              setReplyError('');
                            }}
                            className="text-[11px] text-purple-brand font-black hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <CornerDownRight className="w-3.5 h-3.5" />
                            <span>เขียนข้อความตอบกลับข้อสงสัยนี้</span>
                          </button>
                        )}
                      </div>
                    )
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Post a new question box */}
        <form onSubmit={handleAskSubmit} className="pt-4 border-t border-slate-150/60 space-y-3.5" id="ask-question-form">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <Sparkles className="w-3.5 h-3.5 text-purple-brand animate-pulse" />
            <span>มีคำถามหรือข้อสงสัยที่ต้องการสอบถาม? โพสต์คำถามของคุณที่นี่</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="sm:col-span-1">
              <input
                type="text"
                placeholder="ชื่อของคุณ (เช่น คุณแม่น้องแก้ว)"
                value={askerName}
                onChange={(e) => setAskerName(e.target.value)}
                className="w-full border border-slate-200 rounded-xl p-2 text-xs outline-none bg-slate-50 focus:bg-white focus:ring-1 focus:ring-purple-brand transition-all"
              />
            </div>
            <div className="sm:col-span-2 flex gap-2">
              <input
                type="text"
                placeholder="พิมพ์ข้อคำถามหรือเรื่องที่ต้องการสอบถาม..."
                value={questionText}
                onChange={(e) => {
                  setQuestionText(e.target.value);
                  if (askError) setAskError('');
                }}
                className={`flex-1 border rounded-xl p-2 text-xs outline-none bg-slate-50 focus:bg-white focus:ring-1 focus:ring-purple-brand transition-all ${
                  askError ? 'border-red-400' : 'border-slate-200'
                }`}
              />
              <button
                type="submit"
                className="px-4 bg-purple-brand hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-1 flex-shrink-0 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">ส่ง</span>
              </button>
            </div>
          </div>

          {askError && <p className="text-[11px] text-red-500 font-bold">{askError}</p>}
          {askSuccess && (
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-bold animate-fade-in bg-emerald-50 p-2 rounded-lg">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>ส่งคำถามของคุณเรียบร้อยแล้ว ทีมผู้ประสานงานจะรีบเข้ามาตอบกลับโดยเร็วที่สุด</span>
            </div>
          )}
        </form>
      </div>

      {/* Custom Delete QA Modal */}
      {qaToDeleteId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="delete-qa-modal">
          <div className="bg-white rounded-3xl p-6 text-center max-w-sm w-full space-y-4 shadow-2xl relative border border-slate-200">
            <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6 animate-pulse" />
            </div>

            <div className="space-y-1.5">
              <h3 className="font-extrabold text-slate-800 text-sm md:text-base">ยืนยันการลบคำถาม?</h3>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                คุณแน่ใจหรือไม่ที่จะลบข้อสงสัยนี้ออกจากกระดานถามตอบ?
                <br />
                <span className="text-rose-500 text-[10px] font-extrabold">*การกระทำนี้จะลบคำถามและคำตอบทั้งหมดออกจากระบบถาวร*</span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1.5">
              <button
                type="button"
                onClick={() => setQaToDeleteId(null)}
                className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-xs md:text-sm transition-all cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={confirmDeleteQA}
                className="py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-xs md:text-sm shadow-md transition-all cursor-pointer"
                id="qa-confirm-delete-btn"
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
