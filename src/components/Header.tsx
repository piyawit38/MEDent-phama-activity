/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Shield, BookOpen, Search, Sparkles } from 'lucide-react';

interface HeaderProps {
  isAdmin: boolean;
  setIsAdmin: (admin: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onLogoClick: () => void;
}

export default function Header({
  isAdmin,
  setIsAdmin,
  searchQuery,
  setSearchQuery,
  onLogoClick,
}: HeaderProps) {
  return (
    <nav className="h-16 bg-navy-brand flex items-center justify-between px-4 md:px-8 text-white flex-shrink-0 shadow-lg z-20 sticky top-0">
      {/* Brand Logo & Info */}
      <div 
        className="flex items-center gap-3 cursor-pointer select-none group transition-all"
        onClick={onLogoClick}
        id="nav-logo-container"
      >
        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center transform group-hover:scale-105 transition-transform">
          <div className="w-6 h-6 bg-navy-brand rounded-sm flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
        </div>
        <div>
          <h1 className="text-lg md:text-xl font-bold leading-none uppercase tracking-tight text-white flex items-center gap-1">
            MEDent <span className="text-purple-300 font-medium lowercase">phama</span>
          </h1>
          <p className="text-[10px] md:text-[11px] opacity-80 uppercase tracking-widest text-slate-200">
            Health Innovation Activity
          </p>
        </div>
      </div>

      {/* Action Area */}
      <div className="flex items-center gap-3 md:gap-6">
        {/* Search Bar - hidden on very small screens, visible elsewhere */}
        <div className="relative flex items-center max-w-44 md:max-w-64">
          <input
            type="text"
            placeholder="ค้นหากิจกรรม..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-full py-1.5 pl-4 pr-10 text-xs md:text-sm w-full focus:outline-none focus:bg-white/20 focus:border-white/40 transition-all placeholder-white/60 text-white"
            id="nav-search-input"
          />
          <Search className="w-4 h-4 absolute right-3 opacity-60 text-white pointer-events-none" />
        </div>

        {/* Mode Toggle Button */}
        <button
          onClick={() => setIsAdmin(!isAdmin)}
          className={`flex items-center gap-1.5 px-3 md:px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold transition-all shadow-md ${
            isAdmin
              ? 'bg-purple-brand text-white hover:bg-purple-700'
              : 'bg-white text-navy-brand hover:bg-slate-100'
          }`}
          id="nav-toggle-admin-btn"
        >
          {isAdmin ? (
            <>
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">หน้าแรกกิจกรรม</span>
              <span className="inline sm:hidden">กิจกรรม</span>
            </>
          ) : (
            <>
              <Shield className="w-3.5 h-3.5" />
              <span>สำหรับผู้ดูแล</span>
            </>
          )}
        </button>
      </div>
    </nav>
  );
}
