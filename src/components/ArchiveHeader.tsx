/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, RotateCcw, AlertCircle, BookOpen, Layers, FileSpreadsheet, Check, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { ProjectCategory, ProjectStatus, ArchiveStats, CustomPreset } from '../types';

interface ArchiveHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: ProjectCategory | 'all';
  setSelectedCategory: (category: ProjectCategory | 'all') => void;
  selectedStatus: ProjectStatus | 'all';
  setSelectedStatus: (status: ProjectStatus | 'all') => void;
  onClearFilters: () => void;
  sheetUrl: string;
  setSheetUrl: (url: string) => void;
  sheetName: string;
  setSheetName: (name: string) => void;
  isSyncing: boolean;
  syncError: string | null;
  syncSuccess: boolean;
  onSync: () => void;
  stats: ArchiveStats;
  availableCategories: ProjectCategory[];
  isAdminMode: boolean;
  customPresets?: CustomPreset[];
}

export default function ArchiveHeader({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedStatus,
  setSelectedStatus,
  onClearFilters,
  sheetUrl,
  setSheetUrl,
  sheetName,
  setSheetName,
  isSyncing,
  syncError,
  syncSuccess,
  onSync,
  stats,
  availableCategories,
  isAdminMode,
  customPresets = []
}: ArchiveHeaderProps) {
  const [showConfig, setShowConfig] = useState(true);

  const getCategoryLabel = (cat: ProjectCategory) => {
    const custom = customPresets.find(p => p.type === 'category' && p.key === cat);
    if (custom) {
      return custom.filterLabel || custom.label;
    }
    switch (cat) {
      case 'code': return '代碼 · CODE';
      case 'design': return '設計 · DESIGN';
      case 'research': return '研究 · RES';
      case 'lab': return '工坊 · LAB';
      case 'writing': return '文獻 · DOC';
      default: return String(cat).toUpperCase();
    }
  };

  const categories: { value: ProjectCategory | 'all'; label: string }[] = [
    { value: 'all', label: '全部目錄 · ALL' },
    ...availableCategories.map((cat) => ({
      value: cat,
      label: getCategoryLabel(cat)
    }))
  ];

  const customStatusPresets = customPresets.filter(p => p.type === 'status');
  const statuses: { value: ProjectStatus | 'all'; label: string }[] = [
    { value: 'all', label: '全部狀態 (ALL)' },
    ...(customStatusPresets.length > 0
      ? customStatusPresets.map((p) => ({
          value: p.key,
          label: p.filterLabel || p.label
        }))
      : [
          { value: 'completed', label: '已完成 (COMPLETED)' },
          { value: 'in-progress', label: '開發中 (IN PROGRESS)' },
          { value: 'concept', label: '構思中 (CONCEPT)' },
          { value: 'archived', label: '已存檔 (ARCHIVED)' }
        ])
  ];

  const getStatusFilterLabel = (statusKey: string, fallback: string) => {
    const custom = customPresets.find(p => p.type === 'status' && p.key === statusKey);
    if (custom) {
      return custom.label.split('·')[0].trim();
    }
    return fallback;
  };

  return (
    <header className="mb-8 relative text-left" id="archive-cabinets-header">

      <div className="flex flex-col lg:flex-row justify-between gap-6 border-b border-[#c8b7a0] pb-6 mt-14">
        {/* Left column: Typewriter banner info */}
        <div className="max-w-xl text-left select-none">
          <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-kraft-100 border border-kraft-300 text-kraft-800 font-mono text-[9px] tracking-widest uppercase mb-2 font-bold">
            <BookOpen className="w-3 h-3 text-kraft-600" />
            domain: project.ramu.lab
          </div>
          <h1 className="font-serif text-3xl font-black text-kraft-900 tracking-tight leading-tight mb-2">
            RAMULAB 專案檔案室
          </h1>
          <p className="font-typewriter text-xs text-kraft-700 font-medium leading-relaxed max-w-lg mb-2">
            此處收納了我個人已完成與正在開發的所有專案。敬請翻閱探尋靈感。
          </p>
          
          <div className="flex items-center gap-2 mt-2 select-none">
            {sheetUrl ? (
              <span className="font-mono text-[9px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300/60 px-1.5 py-0.5 rounded-xs flex items-center gap-1">
                <Wifi className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>雲端同步狀態：聯網讀取中 // LIVE SHEETS MODE</span>
              </span>
            ) : (
              <span className="font-mono text-[9px] font-bold text-amber-800 bg-amber-50 border border-amber-300/60 px-1.5 py-0.5 rounded-xs flex items-center gap-1">
                <WifiOff className="w-3 h-3 text-amber-600 shrink-0" />
                <span>同步狀態：本機示範 // LOCAL DEMO MODE</span>
              </span>
            )}
          </div>
        </div>

        {/* Right column: Ledger Balance Sheet styled state counts */}
        <div className="bg-[#FAF2E5]/80 paper-noise border border-[#dfccb7] rounded-sm p-4 w-full lg:max-w-xs relative flex flex-col justify-between min-h-[140px] shadow-xs select-none">
          {/* Light Grid background */}
          <div className="absolute inset-0 ledger-grid opacity-[0.15] pointer-events-none" />

          <div>
            <h4 className="font-mono text-[10px] font-black text-kraft-800 tracking-wider uppercase border-b border-dashed border-[#dfccb7] pb-1.5 mb-2.5 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-kraft-600" />
              已收錄的專案（RECORDED PROJECTS）
            </h4>

            <div className="grid grid-cols-2 gap-y-2 gap-x-4 font-mono text-[11px] text-kraft-800">
              <div className="flex justify-between border-b border-dotted border-kraft-300">
                <span>{getStatusFilterLabel('completed', '已完成')}:</span>
                <span className="font-bold text-emerald-800">{stats.completed}</span>
              </div>
              <div className="flex justify-between border-b border-dotted border-kraft-300">
                <span>{getStatusFilterLabel('in-progress', '開發中')}:</span>
                <span className="font-bold text-amber-800">{stats.inProgress}</span>
              </div>
              <div className="flex justify-between border-b border-dotted border-kraft-300">
                <span>{getStatusFilterLabel('concept', '構思中')}:</span>
                <span className="font-bold text-purple-800">{stats.concepts}</span>
              </div>
              <div className="flex justify-between border-b border-dotted border-kraft-300 pointer-events-none">
                <span>{getStatusFilterLabel('archived', '已存檔')}:</span>
                <span className="font-bold text-stone-800">{stats.archived}</span>
              </div>
            </div>
          </div>

          <div className="pt-2 mt-2 border-t border-dashed border-kraft-300 flex justify-between items-center font-mono text-[11px] font-bold text-kraft-900">
            <span>[Σ] 存檔總計 (TOTAL):</span>
            <span className="bg-kraft-700 text-[#FAF2E5] px-1.5 py-0.5 text-[10px] rounded-sm font-black">
              {stats.total} 個
            </span>
          </div>
        </div>
      </div>

      {/* 🟢 NEW: Google Sheet Interlink Configuration Section */}
      {isAdminMode && (
        <div className="mt-5 p-4 bg-[#fcf8f2] paper-noise border-2 border-[#ccbda8] rounded-xs relative">
          <div className="absolute inset-0 ledger-grid opacity-10 pointer-events-none" />
          
          <div className="flex justify-between items-center pb-2 border-b border-[#dfd2be] mb-3 relative">
            <span className="font-mono text-[10px] font-black text-emerald-800 flex items-center gap-1 uppercase tracking-wider">
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
              Google 試算表櫃位連線設定 (GOOGLE SPREADSHEET SYNC)
            </span>
            <button 
              type="button" 
              onClick={() => setShowConfig(!showConfig)}
              className="text-stone-500 hover:text-stone-900 font-mono text-[9px] underline cursor-pointer"
            >
              {showConfig ? '[隱藏設定]' : '[展開設定]'}
            </button>
          </div>

          {showConfig && (
            <div className="space-y-3 font-serif text-stone-800 text-xs relative z-10">
              <p className="text-[11px] text-stone-600 leading-normal">
                💡 <strong>設定方式：</strong>建立一個 Google 試算表並填寫專案資料。接著在試算表右上角點選 <strong>「分享」➜ 選擇「知道連結的任何人均可檢視」</strong>，複製網址貼入下方，點擊同步即會自動載入最新專案！
              </p>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                <div className="md:col-span-7">
                  <label className="block font-mono text-[9px] font-bold text-kraft-800 uppercase mb-1">
                    Google 試算表共享網址 (Spreadsheet Link)
                  </label>
                  <input
                    type="text"
                    placeholder="https://docs.google.com/spreadsheets/d/.../edit"
                    value={sheetUrl}
                    onChange={(e) => setSheetUrl(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#FAF2E5] border border-kraft-400 rounded-xs font-mono text-xs focus:outline-none focus:border-emerald-705"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block font-mono text-[9px] font-bold text-kraft-800 uppercase mb-1">
                    工作表頁籤名稱 (Sheet Tab)
                  </label>
                  <input
                    type="text"
                    placeholder="預設：Sheet1"
                    value={sheetName}
                    onChange={(e) => setSheetName(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#FAF2E5] border border-kraft-400 rounded-xs font-mono text-xs focus:outline-none focus:border-emerald-705"
                  />
                </div>

                <div className="md:col-span-2">
                  <button
                    type="button"
                    onClick={onSync}
                    disabled={isSyncing || !sheetUrl.trim()}
                    className="w-full inline-flex items-center justify-center gap-1 px-3 py-2 bg-emerald-800 hover:bg-emerald-900 disabled:bg-stone-400 text-amber-50 font-mono text-xs font-black rounded-xs transition-colors cursor-pointer border border-emerald-950"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? '同步中' : '同步載入'}</span>
                  </button>
                </div>
              </div>

              {/* Error or Success notification row */}
              {syncError && (
                <div className="p-2 border border-red-300 bg-red-50 text-red-950 font-serif text-[11px] rounded-xs flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                  <span>{syncError}</span>
                </div>
              )}
              
              {syncSuccess && (
                <div className="p-2 border border-emerald-300 bg-emerald-50 text-emerald-950 font-serif text-[11px] rounded-xs flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 animate-bounce" />
                  <span>資料讀取成功！您試算表中的所有專責卡片均已即時載入呈現。</span>
                </div>
              )}

              <div className="pt-2 border-t border-dashed border-[#dfd2be] text-[10px] text-stone-500 leading-normal flex flex-wrap gap-x-4 gap-y-1">
                <span><strong>對應之直列（欄位順序）：</strong></span>
                <span>1. 專題名稱</span>
                <span>2. 專題小標題</span>
                <span>3. 專題內容描述</span>
                <span>4. 專題日期</span>
                <span>5. 專題狀態</span>
                <span>6. 專題分類</span>
                <span>7. 專題鏈接</span>
              </div>
            </div>
          )}
        </div>
      )}


      {/* Filter and control panel */}
      <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between gap-4 select-none">
        {/* Search Input styled as typewriter form item */}
        <div className="relative flex-grow max-w-md">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-kraft-600">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="打字檢索專案標題、標籤或編號..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#FAF2E5] hover:bg-[#FFF] border border-kraft-400/60 rounded-xs font-typewriter text-xs text-stone-800 placeholder-kraft-600/40 focus:outline-none focus:border-kraft-600 transition-colors"
          />
        </div>

        {/* Buttons for dynamic controls */}
        <div className="flex items-center gap-2">
          {(searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all') && (
            <button
              onClick={onClearFilters}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-kraft-700 bg-amber-50 hover:bg-amber-100 border border-kraft-300 rounded-xs font-mono text-xs transition-colors cursor-pointer"
              title="Reset Filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>還原過濾 (RESET)</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Folders - Styled as Physical Folder Label Tabs */}
      <div className="mt-5 flex flex-wrap gap-1.5 border-b border-[#dfccb7] pb-3" id="category-index-tabs">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={`px-3 py-1.5 font-mono text-xs font-semibold rounded-t-sm transition-all border-t border-x cursor-pointer ${
              selectedCategory === cat.value
                ? 'bg-[#FAF2E5] border-[#dfccb7] text-kraft-900 border-b-transparent translate-y-[4px] font-black scale-102 z-10'
                : 'bg-kraft-100 hover:bg-[#f6ebd9]/80 border-transparent text-kraft-700 hover:text-kraft-900'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Status Filter pill dockets */}
      <div className="mt-3.5 flex flex-wrap gap-2 items-center text-xs font-mono">
        <span className="text-kraft-500 font-bold text-[10px] uppercase tracking-wider mr-1">PROJECT ARCHIVE:</span>
        {statuses.map((stat) => (
          <button
            key={stat.value}
            onClick={() => setSelectedStatus(stat.value)}
            className={`px-2.5 py-0.5 text-[11px] rounded-full border transition-all cursor-pointer ${
              selectedStatus === stat.value
                ? 'bg-kraft-800 border-kraft-800 text-[#FAF2E5] font-black'
                : 'bg-transparent border-kraft-400/40 text-kraft-700 hover:border-kraft-500 hover:text-kraft-900'
            }`}
          >
            {stat.label}
          </button>
        ))}
      </div>
    </header>
  );
}
