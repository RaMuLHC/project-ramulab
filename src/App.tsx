/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ProjectEntry, ArchiveStats, CustomPreset } from './types';
import { getStoredProjects, saveProjects, INITIAL_PROJECTS } from './data/projects';
import ProjectCard from './components/ProjectCard';
import ProjectDetailDialog from './components/ProjectDetailDialog';
import ArchiveHeader from './components/ArchiveHeader';
import AddProjectDialog from './components/AddProjectDialog';
import GoogleSheetsSync from './components/GoogleSheetsSync';
import { Home, Mail, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Helper function to parse CSV robustly from published Google Sheets
function parseCSV(text: string): string[][] {
  const result: string[][] = [];
  let row: string[] = [];
  let inQuotes = false;
  let currentVal = '';
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentVal += '"';
        i++; // skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(currentVal);
      currentVal = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      row.push(currentVal);
      result.push(row);
      row = [];
      currentVal = '';
    } else {
      currentVal += char;
    }
  }
  
  if (currentVal || row.length > 0) {
    row.push(currentVal);
    result.push(row);
  }
  
  return result.map(r => r.map(c => {
    let cell = c.trim();
    // Strip redundant exterior quotes often wrapping strings with quotes
    if (cell.startsWith('"') && cell.endsWith('"')) {
      cell = cell.slice(1, -1).replace(/""/g, '"');
    }
    return cell.trim();
  }));
}

export default function App() {
  const [projects, setProjects] = useState<ProjectEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | ProjectEntry['category']>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | ProjectEntry['status']>('all');
  const [selectedProject, setSelectedProject] = useState<ProjectEntry | null>(null);

  // 🏷️ Dynamic presets imported from Google Sheet "Tags" tab
  const [customPresets, setCustomPresets] = useState<CustomPreset[]>(() => {
    try {
      const saved = localStorage.getItem('ramulab_custom_presets');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse custom presets from localStorage', e);
    }
    return [];
  });

  // Google Sheets Interlink states initialized from localStorage, falling back to Vite environment defaults for visitors
  const [sheetUrl, setSheetUrl] = useState(() => {
    return localStorage.getItem('ramulab_sheet_url') || 'https://docs.google.com/spreadsheets/d/1jrryb36AD79_L2CLQxs48prPJ-iK2Kthn_tu0fzHVsc/edit?usp=sharing';
  });
  const [sheetName, setSheetName] = useState(() => {
    return localStorage.getItem('ramulab_sheet_name') || 'Projects';
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncSuccess, setSyncSuccess] = useState(false);

  // 🔐 Secure Client-side Owner Mode
  const [isAdminMode, setIsAdminMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('admin') === 'false' || urlParams.get('edit') === 'false') {
        localStorage.removeItem('ramulab_admin_mode');
        return false;
      }
      if (urlParams.has('admin') || urlParams.has('edit')) {
        localStorage.setItem('ramulab_admin_mode', 'true');
        return true;
      }
      return localStorage.getItem('ramulab_admin_mode') === 'true';
    }
    return false;
  });

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSyncDialogOpen, setIsSyncDialogOpen] = useState(false);

  // Save newly created project
  const handleAddProjectSave = (newProject: ProjectEntry) => {
    const updated = [newProject, ...projects];
    setProjects(updated);
    saveProjects(updated);
  };

  // Import projects from sheets
  const handleImportProjects = (imported: ProjectEntry[]) => {
    const merged = [...imported];
    projects.forEach((p) => {
      if (!merged.some((m) => m.id === p.id)) {
        merged.push(p);
      }
    });
    setProjects(merged);
    saveProjects(merged);
  };

  // 🔄 Active sync fetch from Google Sheet URL
  const handleSyncSheet = async (tgtUrl: string, tgtName: string) => {
    if (!tgtUrl.trim()) {
      setSyncError('請輸入有效的 Google 試算表共享網址');
      return;
    }
    
    setIsSyncing(true);
    setSyncError(null);
    setSyncSuccess(false);

    try {
      // Extract spreadsheet ID
      let spreadsheetId = tgtUrl.trim();
      const match = tgtUrl.trim().match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (match) {
        spreadsheetId = match[1];
      }

      // 🏷️ Dynamic presets loading from "Tags" tab
      let fetchedPresets: CustomPreset[] = [];
      try {
        const tagsFetchUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=Tags`;
        const tagsResponse = await fetch(tagsFetchUrl);
        if (tagsResponse.ok) {
          const tagsCsvText = await tagsResponse.text();
          if (!tagsCsvText.includes('google.visualization.Query.setResponse')) {
            const tagsRows = parseCSV(tagsCsvText);
            let tagsStartIdx = 0;
            if (tagsRows.length > 0) {
              const fCell = String(tagsRows[0][0] || '').toLowerCase();
              if (fCell.includes('type') || fCell.includes('類型') || fCell.includes('分類') || fCell.includes('種類') || fCell.includes('序')) {
                tagsStartIdx = 1;
              }
            }
            for (let j = tagsStartIdx; j < tagsRows.length; j++) {
              const tRow = tagsRows[j];
              if (!tRow || tRow.length < 3 || !tRow[1]?.trim()) continue;
              const rawType = tRow[0].trim().toLowerCase();
              let type: 'category' | 'status' = 'category';
              if (rawType.includes('status') || rawType.includes('狀態') || rawType.includes('印章') || rawType.includes('印')) {
                type = 'status';
              }
              const key = tRow[1].trim().toLowerCase().replace(/\s+/g, '-');
              const label = tRow[2].trim();
              const filterLabel = tRow[3]?.trim() || label;
              const color = tRow[4]?.trim() || undefined;
              fetchedPresets.push({ type, key, label, filterLabel, color });
            }
          }
        }
      } catch (errTags) {
        console.warn('Tags tab could not be fetched (fallback standard presets used instead):', errTags);
      }

      // Generate sheets csv endpoint
      const sheetParam = tgtName.trim() ? `&sheet=${encodeURIComponent(tgtName.trim())}` : '';
      const fetchUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv${sheetParam}`;

      const response = await fetch(fetchUrl);
      if (!response.ok) {
        throw new Error(`試算表連線因 HTTP 狀態代碼 ${response.status} 失敗。請檢查網址並確認您的試算表已共享為「知道連結的任何人均可檢視」！`);
      }

      const csvText = await response.text();

      // Check if Google returned an API query error instead of CSV data
      if (csvText.includes('google.visualization.Query.setResponse')) {
        const errorMatch = csvText.match(/"message":"([^"]+)"/);
        const serverError = errorMatch ? errorMatch[1] : 'Google 試算表拒絕讀取或頁籤名稱不存在！';
        throw new Error(`Google 試算表錯誤：${serverError} (請確認您的頁籤名稱「${tgtName || '預設第一張工作表'}」是否與試算表匹配且已開放共享)`);
      }

      const rows = parseCSV(csvText);

      if (rows.length === 0) {
        throw new Error('共享工作表成功連通，但沒有回載任何有效卡片行目。請檢查頁籤名稱！');
      }

      // Detect if there is a header row (we skip if first cell contains Title/專題/名稱 keywords)
      let startIndex = 0;
      const firstCell = String(rows[0][0] || '').toLowerCase();
      if (
        firstCell.includes('名稱') || 
        firstCell.includes('標題') || 
        firstCell.includes('title') || 
        firstCell.includes('專題') ||
        firstCell.includes('subject')
      ) {
        startIndex = 1; // skip header
      }

      const parsedProjects: ProjectEntry[] = [];
      const nowStr = new Date().toISOString().slice(0, 10).replace(/-/g, '.');

      for (let i = startIndex; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length < 1 || !row[0]?.trim()) continue; // skip rows missing title

        const title = (row[0] || '').trim();
        const subtitle = (row[1] || '').trim() || '專題簡錄';
        const description = (row[2] || '').trim() || '暫無描述細節';
        const date = (row[3] || '').trim() || nowStr;

        // Map status explicitly, supporting arbitrary custom presets or fallback
        const rawStatus = (row[4] || '').trim().toLowerCase();
        let status = 'completed'; // default fallback
        
        // Try exact/partial matching against loaded dynamic status keys
        const matchedStatusPreset = fetchedPresets.find(p => p.type === 'status' && (p.key === rawStatus || rawStatus.includes(p.key) || p.key.includes(rawStatus) || p.label.toLowerCase().includes(rawStatus)));
        if (matchedStatusPreset) {
          status = matchedStatusPreset.key;
        } else {
          // Fallbacks for standard keys
          if (rawStatus.includes('開發') || rawStatus.includes('prog') || rawStatus.includes('dev') || rawStatus.includes('active') || rawStatus.includes('展') || rawStatus.includes('進')) {
            status = 'in-progress';
          } else if (rawStatus.includes('構思') || rawStatus.includes('concept') || rawStatus.includes('未') || rawStatus.includes('想')) {
            status = 'concept';
          } else if (rawStatus.includes('存檔') || rawStatus.includes('archived') || rawStatus.includes('密') || rawStatus.includes('封') || rawStatus.includes('舊')) {
            status = 'archived';
          }
        }

        // Map category explicitly, supporting arbitrary custom presets or fallback
        const rawCat = (row[5] || '').trim().toLowerCase();
        let category = 'lab'; // default fallback
        
        // Try exact/partial matching against loaded dynamic category keys
        const matchedCatPreset = fetchedPresets.find(p => p.type === 'category' && (p.key === rawCat || rawCat.includes(p.key) || p.key.includes(rawCat) || p.label.toLowerCase().includes(rawCat)));
        if (matchedCatPreset) {
          category = matchedCatPreset.key;
        } else {
          // Fallbacks for standard keys
          if (rawCat.includes('碼') || rawCat.includes('code') || rawCat.includes('程式') || rawCat.includes('軟') || rawCat.includes('資')) {
            category = 'code';
          } else if (rawCat.includes('設計') || rawCat.includes('design') || rawCat.includes('畫') || rawCat.includes('美學') || rawCat.includes('藝')) {
            category = 'design';
          } else if (rawCat.includes('研究') || rawCat.includes('res') || rawCat.includes('學')) {
            category = 'research';
          } else if (rawCat.includes('工坊') || rawCat.includes('lab') || rawCat.includes('物理') || rawCat.includes('製造')) {
            category = 'lab';
          } else if (rawCat.includes('文') || rawCat.includes('doc') || rawCat.includes('寫') || rawCat.includes('writ') || rawCat.includes('法')) {
            category = 'writing';
          }
        }

        const link = (row[6] || '').trim();

        const id = `sheet-row-${i}`;
        const archiveNo = `BOX-${100 + i}`;

        const content = `RAMULAB LEDGER FILE // REF ${archiveNo}
=============================================
TITLE: ${title}
SUBTITLE: ${subtitle}
DATE: ${date}
STATUS: ${status.toUpperCase()}
CATEGORY: ${category.toUpperCase()}

DESCRIPTION DETAILS:
${description}`;

        parsedProjects.push({
          id,
          title,
          subtitle,
          description,
          content,
          status,
          category,
          date,
          archiveNo,
          tags: [category, status],
          link: link || undefined
        });
      }

      if (parsedProjects.length === 0) {
        throw new Error('未能在試算表內查出任何符合格式的專案列！');
      }

      setProjects(parsedProjects);
      saveProjects(parsedProjects);
      
      if (fetchedPresets.length > 0) {
        setCustomPresets(fetchedPresets);
        localStorage.setItem('ramulab_custom_presets', JSON.stringify(fetchedPresets));
      } else {
        setCustomPresets([]);
        localStorage.removeItem('ramulab_custom_presets');
      }
      setSyncSuccess(true);

      // Persist config locally
      localStorage.setItem('ramulab_sheet_url', tgtUrl);
      localStorage.setItem('ramulab_sheet_name', tgtName);

    } catch (err: any) {
      console.error(err);
      setSyncError(err.message || '無法自 Google Sheet 分析載入資料，請重新點選設定！');
      // On error, fallback to legacy cached files
      const backup = getStoredProjects();
      setProjects(backup);
    } finally {
      setIsSyncing(false);
    }
  };

  // On mount, load spreadsheet entries automatically if configured
  useEffect(() => {
    if (sheetUrl.trim()) {
      handleSyncSheet(sheetUrl, sheetName);
    } else {
      setProjects(getStoredProjects());
    }
  }, []);

  // Filter projects based on Search and Selected filters
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.archiveNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'all' || project.category === selectedCategory;

    const matchesStatus =
      selectedStatus === 'all' || project.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Calculate dynamic stats
  const stats: ArchiveStats = {
    total: projects.length,
    completed: projects.filter((p) => p.status === 'completed').length,
    inProgress: projects.filter((p) => p.status === 'in-progress' || p.status === 'in-development').length,
    concepts: projects.filter((p) => p.status === 'concept').length,
    archived: projects.filter((p) => p.status === 'archived').length
  };

  // Reset all filters to default homepage state
  const handleHomeBtnClick = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedStatus('all');
    setSelectedProject(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Dynamically compile categories currently in the database to drive the directory folder tabs
  const availableCategories = Array.from(new Set(projects.map((p) => p.category))) as ProjectEntry['category'][];

  // Delete project
  const handleDeleteProject = (id: string) => {
    const updated = projects.filter((p) => p.id !== id);
    setProjects(updated);
    saveProjects(updated);
  };

  // Update study status for card inside dossier viewer
  const handleUpdateStatus = (id: string, newStatus: ProjectEntry['status']) => {
    const updated = projects.map((p) => {
      if (p.id === id) {
        return { ...p, status: newStatus };
      }
      return p;
    });
    setProjects(updated);
    saveProjects(updated);
    // Sync current open detail
    if (selectedProject && selectedProject.id === id) {
      setSelectedProject({ ...selectedProject, status: newStatus });
    }
  };

  // Clear search and filter states
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedStatus('all');
  };

  // Reset to static defaults (safety backup)
  const handleResetDefaults = () => {
    if (confirm('確定要清除自訂設定，並重置回您的預設 Google 試算表嗎？')) {
      localStorage.removeItem('ramulab_sheet_url');
      localStorage.removeItem('ramulab_sheet_name');
      localStorage.removeItem('ramulab_custom_presets');
      const defaultUrl = 'https://docs.google.com/spreadsheets/d/1jrryb36AD79_L2CLQxs48prPJ-iK2Kthn_tu0fzHVsc/edit?usp=sharing';
      const defaultName = 'Projects';
      setSheetUrl(defaultUrl);
      setSheetName(defaultName);
      setCustomPresets([]);
      setSyncSuccess(false);
      setSyncError(null);
      handleSyncSheet(defaultUrl, defaultName);
    }
  };

  // Email click tool
  const handleEmailClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = 'mailto:info@ramulab.com';
  };

  return (
    <div className="min-h-screen kraft-texture paper-noise py-10 px-4 md:px-8 relative selection:bg-kraft-300 selection:text-kraft-900 overflow-x-hidden">
      
      {/* Main Layout Centered wrapper */}
      <div className="max-w-4xl mx-auto bg-[#faf4ea]/45 border border-[#dfccb7]/40 p-5 md:p-8 rounded-sm backdrop-blur-3xs mt-6">
        
        {/* Left top Home button tab inside the cabinet container */}
        <div className="flex justify-start mb-2 select-none">
          <button
            onClick={handleHomeBtnClick}
            className="px-2.5 py-1 cursor-pointer bg-amber-50/70 hover:bg-amber-100/90 border border-kraft-300 text-kraft-800 font-mono text-[10px] tracking-wider uppercase flex items-center gap-1 shadow-xs transition-colors rounded-sm"
          >
            <Home className="w-3.5 h-3.5 text-amber-700" />
            <span>首頁目錄 · ARCHIVE HOME</span>
          </button>
        </div>

        {/* Render interactive search and ledger info metrics */}
        <ArchiveHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          onClearFilters={handleClearFilters}
          sheetUrl={sheetUrl}
          setSheetUrl={setSheetUrl}
          sheetName={sheetName}
          setSheetName={setSheetName}
          isSyncing={isSyncing}
          syncError={syncError}
          syncSuccess={syncSuccess}
          onSync={() => handleSyncSheet(sheetUrl, sheetName)}
          stats={stats}
          availableCategories={availableCategories}
          isAdminMode={isAdminMode}
          customPresets={customPresets}
          onOpenAddCard={() => setIsAddDialogOpen(true)}
          onOpenSyncDialog={() => setIsSyncDialogOpen(true)}
        />

        {/* 📋 Visual Tiles Shelf */}
        <div className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8" id="projects-grid">
            
            {/* 🏷️ FIRST TILE: Business Card Design (個人紙質名片) */}
            {/* Show only if filters are not filtering heavily, or always pin at position #1 */}
            {selectedCategory === 'all' && selectedStatus === 'all' && searchQuery === '' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-[#fcf8f2] paper-noise border-2 border-[#ccbda8] shadow-md p-6 rounded-xs flex flex-col justify-between h-[312px] self-end"
                style={{ transform: 'rotate(-0.5deg)', borderStyle: 'double', borderWidth: '4px' }}
                id="ramulab-business-card"
              >
                {/* Light backing ledger grids */}
                <div className="absolute inset-0 ledger-grid opacity-20 pointer-events-none" />

                {/* Card Top Label details */}
                <div className="flex justify-between items-center pb-2 border-b border-[#dfd2be] font-mono text-[9px] text-kraft-700">
                  <span className="font-black tracking-widest uppercase">OFFICIAL NAME CARD</span>
                  <span className="font-serif italic font-semibold">project.ramulab.com</span>
                </div>

                {/* Businesscard identity block */}
                <div className="py-5 text-left flex-grow flex flex-col justify-center">
                  <h2 className="font-serif text-2xl font-black text-kraft-900 tracking-tight flex items-center gap-1.5 leading-none">
                    幸會！我是RaMu
                  </h2>
                  <div className="w-16 h-[2px] bg-red-700/60 my-3 rotate-[-1deg]"></div>
                  
                  <p className="font-serif text-xs leading-relaxed text-stone-800 font-medium pl-2 border-l border-kraft-400">
                    ——歡迎蒞臨此處，探索我的數位檔案與構思。
                  </p>
                </div>

                {/* Stamp label representation */}
                <div className="absolute right-4 bottom-14 pointer-events-none rotate-[6deg] opacity-80">
                  <div className="font-stamp border border-red-700/50 text-red-700 text-[10px] py-0.5 px-2 rounded-sm uppercase tracking-widest bg-red-50/10">
                    RAMULAB CHANCE
                  </div>
                </div>

                {/* Signature/Contact stamp line */}
                <div className="pt-3 border-t border-dashed border-[#dfd2be] flex justify-between items-center font-typewriter text-xs text-kraft-900">
                  <button
                    onClick={handleEmailClick}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-kraft-100 hover:bg-kraft-200 text-kraft-800 border border-kraft-300 font-mono text-[10px] font-bold rounded-sm transition-all cursor-pointer"
                  >
                    <Mail className="w-3 h-3 text-red-700" />
                    <span>聯絡：info@ramulab.com</span>
                  </button>
                </div>

                {/* Red ink corner mark representing fine art stamp seal */}
                <div className="absolute top-2 right-4 w-4 h-4 rounded-full bg-red-800/10 border border-red-800/30 flex items-center justify-center font-stamp text-[8px] text-red-800 select-none">
                  印
                </div>
              </motion.div>
            )}

            {/* Render matched list of active archives */}
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project, idx) => {
                const adjustedIndex = selectedCategory === 'all' && selectedStatus === 'all' && searchQuery === '' ? idx + 1 : idx;
                
                return (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    index={adjustedIndex}
                    onSelect={(p) => setSelectedProject(p)}
                    customPresets={customPresets}
                  />
                );
              })}
            </AnimatePresence>
          </div>

          {/* Fallback empty view */}
          {filteredProjects.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-8 p-12 text-center bg-[#FAF2E5]/50 border border-dashed border-kraft-400 rounded-sm select-none"
            >
              <div className="font-typewriter text-xs text-kraft-700 mb-2">
                {projects.length === 0 ? '⚠️ 尚未讀取到任何專案卡片' : '查無匹配字軌之歸檔文件卡。'}
              </div>
              <p className="text-stone-600 text-xs font-mono max-w-md mx-auto leading-relaxed">
                {projects.length === 0 
                  ? '目前網頁沒有載入任何專案。請點擊上方或頁面底部的「開啟設定面板」，貼上您的 Google 試算表共享網址並點擊同步！'
                  : `未能在存檔室中尋得符合「${searchQuery}」字軌的檔案名錄。請重新調整篩選條件或重新檢查 Google 試算表連結。`
                }
              </p>
              {syncError && (
                <div className="mt-3 p-2 bg-red-50 border border-red-200 text-red-950 font-serif text-[11px] max-w-md mx-auto rounded-xs text-left">
                  <strong>連線錯誤：</strong>{syncError}
                </div>
              )}
              <div className="mt-4 flex gap-2 justify-center">
                {projects.length > 0 && (
                  <button
                    onClick={handleClearFilters}
                    className="font-mono text-xs px-3 py-1 bg-[#FAF2E5] hover:bg-stone-50 border border-kraft-400 text-stone-700 rounded-sm cursor-pointer"
                  >
                    清除所有過濾 (RESET)
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Dynamic footer */}
        <footer className="mt-14 pt-6 border-t border-dashed border-[#c8b7a0] flex flex-col sm:flex-row justify-between items-center gap-4 text-stone-500 font-mono text-[10px] select-none">
          <div className="text-left">
            <span>© 2026 PROJECT.RAMU.LAB</span>
          </div>
          
          <div className="flex gap-4 items-center">
            {isAdminMode && (
              <button
                onClick={handleResetDefaults}
                className="text-stone-500 hover:text-red-700 transition-colors bg-transparent border-none cursor-pointer flex items-center gap-1.5"
                title="Reset configuration to fallback"
              >
                <RotateCcw className="w-3 h-3 text-kraft-400 font-bold" />
                <span>[重置系統預設名錄]</span>
              </button>
            )}
          </div>
        </footer>
      </div>

      {/* Full detail Manila Folder modal overlay */}
      <ProjectDetailDialog
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        onDelete={handleDeleteProject}
        onUpdateStatus={handleUpdateStatus}
        customPresets={customPresets}
      />

      {/* Add Project Dialog */}
      <AddProjectDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSave={handleAddProjectSave}
      />

      {/* Google Sheets advanced sync modal */}
      <GoogleSheetsSync
        isOpen={isSyncDialogOpen}
        onClose={() => setIsSyncDialogOpen(false)}
        projects={projects}
        onImport={handleImportProjects}
      />
    </div>
  );
}
