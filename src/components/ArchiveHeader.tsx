/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, RotateCcw, AlertCircle, BookOpen, Layers, FileSpreadsheet, Check, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { ProjectCategory, ProjectStatus, ArchiveStats, CustomPreset } from '../types';
import { useTranslation } from '../i18n';

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
  onOpenAddCard?: () => void;
  onOpenSyncDialog?: () => void;
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
  customPresets = [],
  onOpenAddCard,
  onOpenSyncDialog
}: ArchiveHeaderProps) {
  const { t, localizeText } = useTranslation();
  const [showConfig, setShowConfig] = useState(true);

  const getCategoryLabel = (cat: ProjectCategory) => {
    const custom = customPresets.find(p => p.type === 'category' && p.key === cat);
    if (custom) {
      return custom.filterLabel || custom.label;
    }
    switch (cat) {
      case 'code': return t('header.category_code');
      case 'design': return t('header.category_design');
      case 'research': return t('header.category_research');
      case 'lab': return t('header.category_lab');
      case 'writing': return t('header.category_writing');
      default: return String(cat).toUpperCase();
    }
  };

  const categories: { value: ProjectCategory | 'all'; label: string }[] = [
    { value: 'all', label: t('header.category_all') },
    ...availableCategories.map((cat) => ({
      value: cat,
      label: getCategoryLabel(cat)
    }))
  ];

  const customStatusPresets = customPresets.filter(p => p.type === 'status');
  const statuses: { value: ProjectStatus | 'all'; label: string }[] = [
    { value: 'all', label: t('header.status_all') },
    ...(customStatusPresets.length > 0
      ? customStatusPresets.map((p) => ({
          value: p.key,
          label: p.filterLabel || p.label
        }))
      : [
          { value: 'completed', label: t('header.status_completed_stamp') },
          { value: 'in-progress', label: t('header.status_inprogress_stamp') },
          { value: 'concept', label: t('header.status_concept_stamp') },
          { value: 'archived', label: t('header.status_archived_stamp') }
        ])
  ];

  const getStatusFilterLabel = (statusKey: string, fallback: string) => {
    const custom = customPresets.find(p => p.type === 'status' && p.key === statusKey);
    if (custom) {
      return localizeText(custom.label).split('·')[0].trim();
    }
    return localizeText(fallback);
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
            {t('header.title')}
          </h1>
          <p className="font-typewriter text-xs text-kraft-700 font-medium leading-relaxed max-w-lg mb-2">
            {t('header.subtitle')}
          </p>
          
          <div className="flex items-center gap-2 mt-2 select-none">
            {sheetUrl ? (
              <span className="font-mono text-[9px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300/60 px-1.5 py-0.5 rounded-xs flex items-center gap-1">
                <Wifi className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>{t('header.sync_live')}</span>
              </span>
            ) : (
              <span className="font-mono text-[9px] font-bold text-amber-800 bg-amber-50 border border-amber-300/60 px-1.5 py-0.5 rounded-xs flex items-center gap-1">
                <WifiOff className="w-3 h-3 text-amber-600 shrink-0" />
                <span>{t('header.sync_local')}</span>
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
              {t('header.recorded_projects')}
            </h4>

            <div className="grid grid-cols-2 gap-y-2 gap-x-4 font-mono text-[11px] text-kraft-800">
              <div className="flex justify-between border-b border-dotted border-kraft-300">
                <span>{getStatusFilterLabel('completed', t('header.completed'))}:</span>
                <span className="font-bold text-emerald-800">{stats.completed}</span>
              </div>
              <div className="flex justify-between border-b border-dotted border-kraft-300">
                <span>{getStatusFilterLabel('in-progress', t('header.in_progress'))}:</span>
                <span className="font-bold text-amber-800">{stats.inProgress}</span>
              </div>
              <div className="flex justify-between border-b border-dotted border-kraft-300">
                <span>{getStatusFilterLabel('concept', t('header.concept'))}:</span>
                <span className="font-bold text-purple-800">{stats.concepts}</span>
              </div>
              <div className="flex justify-between border-b border-dotted border-kraft-300 pointer-events-none">
                <span>{getStatusFilterLabel('archived', t('header.archived'))}:</span>
                <span className="font-bold text-stone-800">{stats.archived}</span>
              </div>
            </div>
          </div>

          <div className="pt-2 mt-2 border-t border-dashed border-kraft-300 flex justify-between items-center font-mono text-[11px] font-bold text-kraft-900">
            <span>{t('header.total')}</span>
            <span className="bg-kraft-700 text-[#FAF2E5] px-1.5 py-0.5 text-[10px] rounded-sm font-black">
              {t('header.total_suffix', { total: stats.total })}
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
              {t('header.sync_config_title')}
            </span>
            <button 
              type="button" 
              onClick={() => setShowConfig(!showConfig)}
              className="text-stone-500 hover:text-stone-900 font-mono text-[9px] underline cursor-pointer"
            >
              {showConfig ? t('header.hide_config') : t('header.show_config')}
            </button>
          </div>

          {showConfig && (
            <div className="space-y-3 font-serif text-stone-800 text-xs relative z-10">
              <p className="text-[11px] text-stone-600 leading-normal" dangerouslySetInnerHTML={{ __html: t('header.sync_guidelines') }} />

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                <div className="md:col-span-5">
                  <label className="block font-mono text-[9px] font-bold text-kraft-800 uppercase mb-1">
                    {t('header.sheet_link')}
                  </label>
                  <input
                    type="text"
                    placeholder="https://docs.google.com/spreadsheets/d/.../edit"
                    value={sheetUrl}
                    onChange={(e) => setSheetUrl(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#FAF2E5] border border-kraft-400 rounded-xs font-mono text-xs focus:outline-none focus:border-emerald-700"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block font-mono text-[9px] font-bold text-kraft-800 uppercase mb-1">
                    {t('header.sheet_tab')}
                  </label>
                  <input
                    type="text"
                    placeholder={t('header.sheet_tab_placeholder')}
                    value={sheetName}
                    onChange={(e) => setSheetName(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#FAF2E5] border border-kraft-400 rounded-xs font-mono text-xs focus:outline-none focus:border-emerald-700"
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
                    <span>{isSyncing ? t('header.syncing_btn') : t('header.sync_btn')}</span>
                  </button>
                </div>

                <div className="md:col-span-2">
                  <button
                    type="button"
                    onClick={onOpenSyncDialog}
                    className="w-full inline-flex items-center justify-center gap-1 px-3 py-2 bg-transparent hover:bg-emerald-50 border border-emerald-800 text-emerald-800 font-mono text-xs font-black rounded-xs transition-colors cursor-pointer"
                  >
                    <span>{t('header.advanced_sync_btn')}</span>
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
                  <span>{t('header.sync_success')}</span>
                </div>
              )}

              <div className="pt-2 border-t border-dashed border-[#dfd2be] text-[10px] text-stone-500 leading-normal flex flex-wrap gap-x-4 gap-y-1">
                <span dangerouslySetInnerHTML={{ __html: t('header.column_mapping') }} />
                <span>{t('header.col_title')}</span>
                <span>{t('header.col_subtitle')}</span>
                <span>{t('header.col_description')}</span>
                <span>{t('header.col_date')}</span>
                <span>{t('header.col_status')}</span>
                <span>{t('header.col_category')}</span>
                <span>{t('header.col_link')}</span>
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
            placeholder={t('header.search_placeholder')}
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
              <span>{t('header.reset_filters')}</span>
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
