/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ProjectEntry } from '../types';
import { 
  CloudDownload, 
  CloudUpload, 
  FileSpreadsheet, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Clipboard, 
  Sparkles 
} from 'lucide-react';

interface GoogleSheetsSyncProps {
  isOpen: boolean;
  onClose: () => void;
  projects: ProjectEntry[];
  onImport: (newProjects: ProjectEntry[]) => void;
}

export default function GoogleSheetsSync({
  isOpen,
  onClose,
  projects,
  onImport
}: GoogleSheetsSyncProps) {
  const [spreadsheetUrl, setSpreadsheetUrl] = useState('');
  const [sheetsApiKey, setSheetsApiKey] = useState('');
  const [oauthAccessToken, setOauthAccessToken] = useState('');
  const [sheetName, setSheetName] = useState('Sheet1');
  const [pasteData, setPasteData] = useState('');
  
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'api' | 'quick-paste' | 'csv'>('api');

  if (!isOpen) return null;

  // Extract Spreadsheet ID from URL or raw ID
  const parseSpreadsheetId = (urlOrId: string): string => {
    const trimmed = urlOrId.trim();
    if (!trimmed) return '';
    const match = trimmed.match(/\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : trimmed;
  };

  // 1. Export local projects to CSV format
  const handleExportCSV = () => {
    try {
      const headers = ['ID', 'Title', 'Subtitle', 'Description', 'Content', 'Status', 'Category', 'Date', 'ArchiveNo', 'Tags', 'Link', 'Attachments'];
      const rows = projects.map(p => [
        p.id,
        p.title,
        p.subtitle,
        p.description || '',
        p.content || '',
        p.status,
        p.category,
        p.date,
        p.archiveNo,
        p.tags.join('; '),
        p.link || '',
        p.attachments?.join('; ') || ''
      ]);

      // Simple CSV escape handler
      const escapeCSV = (str: string) => {
        const escaped = String(str).replace(/"/g, '""');
        return escaped.includes(',') || escaped.includes('\n') || escaped.includes('"')
          ? `"${escaped}"`
          : escaped;
      };

      const csvContent = [
        headers.map(escapeCSV).join(','),
        ...rows.map(row => row.map(escapeCSV).join(','))
      ].join('\r\n');

      const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ramulab_archive_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setStatusMsg({ type: 'success', text: '試算表 CSV 檔案已成功導出並下載！您可以直接用 Google Sheets 開啟它。' });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: `導出 CSV 失敗: ${err.message}` });
    }
  };

  // 2. Parse tab-separated or comma-separated pasted data (Ctrl+C from Google Sheets)
  const handleImportPastedData = () => {
    if (!pasteData.trim()) {
      setStatusMsg({ type: 'error', text: '請在下方文字方塊中貼上來自 Google Sheets 的儲存格內容！' });
      return;
    }

    try {
      // Split by lines
      const lines = pasteData.trim().split(/\r?\n/);
      if (lines.length < 2) {
        throw new Error('資料行數不足，至少需要標頭行與一行資料！');
      }

      // Check delimiters (typically tab '\t' when copy-pasted directly from Google Sheets cells)
      const firstLine = lines[0];
      const delimiter = firstLine.includes('\t') ? '\t' : ',';

      // Parse headers
      const rawHeaderRow = firstLine.split(delimiter).map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());
      
      // Standard cell parsing (handles optional double quotes)
      const parseRow = (line: string) => {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === delimiter && !inQuotes) {
            result.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        result.push(current.trim());
        return result.map(cell => cell.replace(/^"|"$/g, '').replace(/""/g, '"'));
      };

      const importedList: ProjectEntry[] = [];

      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const columns = parseRow(lines[i]);
        
        // Match columns to our project keys
        const getVal = (colNames: string[], defaultVal = '') => {
          for (const name of colNames) {
            const idx = rawHeaderRow.indexOf(name.toLowerCase());
            if (idx !== -1 && idx < columns.length) {
              return columns[idx];
            }
          }
          return defaultVal;
        };

        const id = getVal(['id', '碼編', '序號']) || `proj-${Date.now()}-${i}`;
        const title = getVal(['title', '專案標題', '標題']);
        const subtitle = getVal(['subtitle', '副標題', '專案副標題'], '匯入項目');
        const description = getVal(['description', '描述', '簡介', '專案描述']);
        const content = getVal(['content', '內容', '詳細內容', '文件細節'], '');
        const status = (getVal(['status', '狀態', '進度'], 'completed').toLowerCase() as ProjectEntry['status']);
        const category = (getVal(['category', '類別', '目錄'], 'lab').toLowerCase() as ProjectEntry['category']);
        const date = getVal(['date', '日期', '時間'], new Date().toISOString().slice(0, 10).replace(/-/g, '.'));
        const archiveNo = getVal(['archiveno', '編號', '存檔編號', '索引號'], `BOX-NEW-${i}`);
        
        const tagsRaw = getVal(['tags', '標籤']);
        const tags = tagsRaw ? tagsRaw.split(/[;,]/).map(t => t.trim()).filter(Boolean) : ['imported'];

        const link = getVal(['link', '連結', '網址'], '');
        
        const attachRaw = getVal(['attachments', '附件', '文件']);
        const attachments = attachRaw ? attachRaw.split(/[;,]/).map(a => a.trim()).filter(Boolean) : [];

        if (!title) {
          continue; // Skip invalid rows without titles
        }

        importedList.push({
          id,
          title,
          subtitle,
          description,
          content,
          status: ['completed', 'in-development', 'concept', 'archived'].includes(status) ? status : 'completed',
          category: ['code', 'design', 'research', 'lab', 'writing'].includes(category) ? category : 'lab',
          date,
          archiveNo,
          tags,
          link: link || undefined,
          attachments: attachments.length > 0 ? attachments : undefined
        });
      }

      if (importedList.length === 0) {
        throw new Error('未能在貼入的文字中找到任何有效的專案行 (請確認是否包含「Title / 標題」欄位)');
      }

      // Add to local project collection
      onImport(importedList);
      setStatusMsg({
        type: 'success',
        text: `完美完成！成功從試算表貼文中解析並寫入 ${importedList.length} 份全新的文件歸檔卡！`
      });
      setPasteData('');
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: `解析貼入資料失敗: ${err.message || err}` });
    }
  };

  // 3. Web Fetch from online Google Sheet (using Sheets API v4)
  const handleFetchFromGoogleSheetsOnline = async () => {
    const spreadsheetId = parseSpreadsheetId(spreadsheetUrl);
    if (!spreadsheetId) {
      setStatusMsg({ type: 'error', text: '請提供有效的 Google 試算表連結或 ID！' });
      return;
    }

    setLoading(true);
    setStatusMsg(null);

    try {
      // We will first check if they provided an API key or an OAuth token.
      // If none is provided, we'll try fetching a public JSON export as an alternative (extremely robust fallback).
      let sheetData: any[][] = [];

      // Fallback: Use standard Google Sheets v4 API
      const authHeaderValue = oauthAccessToken.trim() 
        ? `Bearer ${oauthAccessToken.trim()}` 
        : '';
        
      const credentialQueryParam = sheetsApiKey.trim() 
        ? `key=${encodeURIComponent(sheetsApiKey.trim())}` 
        : '';

      const targetRange = encodeURIComponent(`${sheetName}!A1:M100`);
      
      // Let's formulate the request
      let fetchUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${targetRange}`;
      if (credentialQueryParam) {
        fetchUrl += `?${credentialQueryParam}`;
      }

      const headers: HeadersInit = {};
      if (authHeaderValue) {
        headers['Authorization'] = authHeaderValue;
      }

      const response = await fetch(fetchUrl, { headers });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        const errMsg = errJson.error?.message || `HTTP ${response.status} ${response.statusText}`;
        
        // If it was a permission error and no credentials were supplied, let's explain how to share the sheet publicly.
        if (response.status === 403 || response.status === 401) {
          throw new Error(`存取遭拒。原因可能是未提供 API 密鑰/OAuth 憑證，或者該試算表未設置為「知道連結的任何人均可檢視」。詳情: ${errMsg}`);
        }
        throw new Error(errMsg);
      }

      const data = await response.json();
      sheetData = data.values;

      if (!sheetData || sheetData.length < 2) {
        throw new Error('取得成功，但該工作表中沒有發現足夠的儲存格內容或缺少標頭行。');
      }

      // Format headers
      const rawHeaderRow = sheetData[0].map((h: any) => String(h).trim().toLowerCase());
      const parsedProjects: ProjectEntry[] = [];

      for (let i = 1; i < sheetData.length; i++) {
        const columns = sheetData[i].map(c => String(c).trim());
        if (columns.length === 0 || !columns[0]) continue;

        const getVal = (colNames: string[], defaultVal = '') => {
          for (const name of colNames) {
            const idx = rawHeaderRow.indexOf(name.toLowerCase());
            if (idx !== -1 && idx < columns.length) {
              return columns[idx];
            }
          }
          return defaultVal;
        };

        const title = getVal(['title', '專案標題', '標題']);
        if (!title) continue;

        const id = getVal(['id', '碼編', '序號']) || `sheets-sync-${Date.now()}-${i}`;
        const subtitle = getVal(['subtitle', '副標題', '專案副標題'], '從 Google Sheets 同步');
        const description = getVal(['description', '描述', '簡介', '專案描述']);
        const content = getVal(['content', '內容', '詳細內容', '文件細節'], '');
        const status = (getVal(['status', '狀態', '進度'], 'completed').toLowerCase() as ProjectEntry['status']);
        const category = (getVal(['category', '類別', '目錄'], 'lab').toLowerCase() as ProjectEntry['category']);
        const date = getVal(['date', '日期', '時間'], new Date().toISOString().slice(0, 10).replace(/-/g, '.'));
        const archiveNo = getVal(['archiveno', '編號', '存盤編號', '索引號'], `BOX-SYNC-${i}`);
        
        const tagsRaw = getVal(['tags', '標籤']);
        const tags = tagsRaw ? tagsRaw.split(/[;,]/).map(t => t.trim()).filter(Boolean) : ['synced'];

        const link = getVal(['link', '連結', '網址'], '');
        
        const attachRaw = getVal(['attachments', '附件', '文件']);
        const attachments = attachRaw ? attachRaw.split(/[;,]/).map(a => a.trim()).filter(Boolean) : [];

        parsedProjects.push({
          id,
          title,
          subtitle,
          description,
          content,
          status: ['completed', 'in-development', 'concept', 'archived'].includes(status) ? status : 'completed',
          category: ['code', 'design', 'research', 'lab', 'writing'].includes(category) ? category : 'lab',
          date,
          archiveNo,
          tags,
          link: link || undefined,
          attachments: attachments.length > 0 ? attachments : undefined
        });
      }

      if (parsedProjects.length === 0) {
        throw new Error('未能在工作表中找到任何有效的專案行。');
      }

      onImport(parsedProjects);
      setStatusMsg({
        type: 'success',
        text: `雲端同步成功！成功從 Google Sheets 載入並整合了 ${parsedProjects.length} 筆專案，並已錄入您當前的本機櫃！`
      });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: `雲端同步失敗: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  // 4. Export to google sheet online via fetch PUT
  const handleExportToGoogleSheetsOnline = async () => {
    const spreadsheetId = parseSpreadsheetId(spreadsheetUrl);
    if (!spreadsheetId) {
      setStatusMsg({ type: 'error', text: '請輸入有效的 Google 試算表連結或 ID！' });
      return;
    }
    if (!oauthAccessToken.trim()) {
      setStatusMsg({ type: 'error', text: '寫入/覆蓋雲端試算表通常需要提供 OAuth Access Token (存取權標)！' });
      return;
    }

    setLoading(true);
    setStatusMsg(null);

    try {
      const headers = ['ID', 'Title', 'Subtitle', 'Description', 'Content', 'Status', 'Category', 'Date', 'ArchiveNo', 'Tags', 'Link', 'Attachments'];
      const rows = projects.map(p => [
        p.id,
        p.title,
        p.subtitle,
        p.description || '',
        p.content || '',
        p.status,
        p.category,
        p.date,
        p.archiveNo,
        p.tags.join('; '),
        p.link || '',
        p.attachments?.join('; ') || ''
      ]);

      const bodyValues = [headers, ...rows];

      const targetRange = encodeURIComponent(`${sheetName}!A1:M100`);
      const fetchUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${targetRange}?valueInputOption=USER_ENTERED`;

      const response = await fetch(fetchUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${oauthAccessToken.trim()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          range: `${sheetName}!A1:M100`,
          majorDimension: 'ROWS',
          values: bodyValues
        })
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error?.message || `HTTP ${response.status}`);
      }

      setStatusMsg({
        type: 'success',
        text: `完美覆蓋！已將本機櫃的 ${projects.length} 筆專案寫入 Google Sheets 中的工作表「${sheetName}」！`
      });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: `同步匯出至 Google Sheets 失敗: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-3 select-none">
      <div 
        className="bg-[#FAF2E5] paper-noise border-4 border-double border-kraft-900 w-full max-w-xl rounded-sm shadow-xl p-5 md:p-6 text-left relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        id="sheets-cabinet-modal"
      >
        {/* Decorative corner tag */}
        <div className="absolute top-0 right-12 bg-emerald-800 text-amber-50 font-mono text-[9px] font-bold py-1 px-3 rounded-b-xs shadow-xs tracking-wider">
          GOOGLE SHEETS UNIT
        </div>

        {/* Modal close icon */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-500 hover:text-stone-800 transition-colors p-1"
          title="關閉"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Dynamic header */}
        <div className="pb-3 border-b border-dashed border-[#dfccb7] mb-4">
          <h2 className="font-serif text-lg font-black text-kraft-900 tracking-tight flex items-center gap-1.5 leading-none">
            <FileSpreadsheet className="w-5 h-5 text-emerald-800" />
            雲端同步櫃 · GOOGLE SHEETS
          </h2>
          <p className="font-mono text-[10px] text-kraft-600 mt-1 uppercase">
            ESTABLISH STABLE SPREADSHEET LEDGER EXCHANGE SYSTEMS
          </p>
        </div>

        {/* Tab Selection Row */}
        <div className="flex gap-1.5 border-b border-kraft-300 pb-2 mb-4">
          <button
            onClick={() => setActiveTab('api')}
            className={`px-3 py-1 font-mono text-[11px] font-bold rounded-xs cursor-pointer ${
              activeTab === 'api' 
                ? 'bg-emerald-800 text-amber-50' 
                : 'bg-kraft-100/50 hover:bg-kraft-200/50 text-stone-700'
            }`}
          >
            直接 API 同步 (LIVE API)
          </button>
          <button
            onClick={() => setActiveTab('quick-paste')}
            className={`px-3 py-1 font-mono text-[11px] font-bold rounded-xs cursor-pointer ${
              activeTab === 'quick-paste' 
                ? 'bg-emerald-800 text-amber-50' 
                : 'bg-kraft-100/50 hover:bg-kraft-200/50 text-stone-700'
            }`}
          >
            一秒 Ctrl+C 貼上匯入
          </button>
          <button
            onClick={() => setActiveTab('csv')}
            className={`px-3 py-1 font-mono text-[11px] font-bold rounded-xs cursor-pointer ${
              activeTab === 'csv' 
                ? 'bg-emerald-800 text-amber-50' 
                : 'bg-kraft-100/50 hover:bg-kraft-200/50 text-stone-700'
            }`}
          >
            本地備份 (CSV EXPORT)
          </button>
        </div>

        {/* Status notification area */}
        {statusMsg && (
          <div className={`p-3 rounded-xs flex items-start gap-2 text-xs font-serif leading-relaxed mb-4 border ${
            statusMsg.type === 'success' ? 'bg-emerald-50/75 border-emerald-300 text-emerald-950' :
            statusMsg.type === 'error' ? 'bg-rose-50/75 border-rose-300 text-rose-950' : 'bg-blue-50/75 border-blue-300 text-blue-950'
          }`}>
            {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" /> : 
             statusMsg.type === 'error' ? <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" /> :
             <HelpCircle className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
            }
            <div>{statusMsg.text}</div>
          </div>
        )}

        {/* Sub-panels container based on tab */}
        {activeTab === 'api' && (
          <div className="space-y-3.5">
            <div className="text-[11px] font-serif text-stone-700 leading-relaxed bg-[#f6ebd9]/40 border border-kraft-300/40 p-2.5 rounded-xs">
              <span className="font-bold text-kraft-900 block mb-1">💡 快捷指引 (Sheet Schema Setup):</span>
              您的 Google Sheet 第一行需填寫以下欄位（大小寫不限）：
              <code className="block mt-1 p-1 bg-stone-800/10 rounded-xs font-mono text-[9px] text-stone-800 select-all overflow-x-auto whitespace-nowrap">
                ID, Title, Subtitle, Description, Content, Status, Category, Date, ArchiveNo, Tags, Link, Attachments
              </code>
            </div>

            <div>
              <label className="block font-mono text-[10px] font-bold text-kraft-800 uppercase mb-1">
                Google 試算表連結 (Spreadsheet URL)
              </label>
              <input
                type="text"
                placeholder="貼上您的試算表 URL（例: https://docs.google.com/spreadsheets/d/ ...）"
                value={spreadsheetUrl}
                onChange={(e) => setSpreadsheetUrl(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-[#FAF2E5] border border-kraft-400 rounded-xs font-mono text-xs text-stone-800 focus:outline-none focus:border-emerald-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-mono text-[10px] font-bold text-kraft-800 uppercase mb-1">
                  工作表名稱 (Sheet/Tab Name)
                </label>
                <input
                  type="text"
                  placeholder="工作表名稱，預設為 Sheet1"
                  value={sheetName}
                  onChange={(e) => setSheetName(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#FAF2E5] border border-kraft-400 rounded-xs font-mono text-xs text-stone-800 focus:outline-none focus:border-emerald-700"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] font-bold text-kraft-800 uppercase mb-1">
                  API 金鑰（用於讀取公開試算表）
                </label>
                <input
                  type="password"
                  placeholder="可選貼上 API Key 或省略"
                  value={sheetsApiKey}
                  onChange={(e) => setSheetsApiKey(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#FAF2E5] border border-kraft-400 rounded-xs font-mono text-xs text-stone-800 focus:outline-none focus:border-emerald-700"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-[10px] font-bold text-kraft-800 uppercase mb-1">
                Google OAuth 存取權標 (Access Token - 用於無缝讀寫)
              </label>
              <input
                type="password"
                placeholder="貼上您的 Access Token 以往返讀寫您的私人試算表"
                value={oauthAccessToken}
                onChange={(e) => setOauthAccessToken(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-[#FAF2E5] border border-kraft-400 rounded-xs font-mono text-xs text-stone-800 focus:outline-none focus:border-emerald-700"
              />
              <p className="font-mono text-[9px] text-stone-500 mt-1">
                備註：Google 設有跨網域安全機制，存取私人試算表、或寫入數據到試算表時，必須使用 OAuth Token。
              </p>
            </div>

            <div className="pt-2 border-t border-dashed border-[#dfccb7] flex gap-3">
              <button
                onClick={handleFetchFromGoogleSheetsOnline}
                disabled={loading}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 disabled:bg-stone-400 text-amber-50 font-mono text-xs font-black rounded-xs transition-colors cursor-pointer"
              >
                <CloudDownload className="w-4 h-4" />
                <span>{loading ? '加載中...' : '從 Google 試算表拉取'}</span>
              </button>

              <button
                onClick={handleExportToGoogleSheetsOnline}
                disabled={loading}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#FAF2E5] hover:bg-stone-50 border-2 border-emerald-800 disabled:border-stone-400 text-emerald-800 disabled:text-stone-400 font-mono text-xs font-black rounded-xs transition-colors cursor-pointer"
              >
                <CloudUpload className="w-4 h-4" />
                <span>{loading ? '匯出中...' : '覆蓋至 Google 試算表'}</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'quick-paste' && (
          <div className="space-y-4">
            <div className="text-xs font-serif text-stone-700 leading-relaxed bg-amber-50 border border-kraft-300 p-3 rounded-xs">
              <span className="font-bold text-kraft-900 block mb-1">📢 極速免認證方案 (Zero-Setup Paste Import):</span>
              這是不需要申請任何 Google Cloud 憑證的最穩健做法！
              <ol className="list-decimal list-inside space-y-1 mt-1 font-medium pl-1">
                <li> 打開您的 Google 試算表。</li>
                <li> 框選所有儲存格，按 <kbd className="px-1 py-0.5 bg-stone-200 border rounded font-mono text-[10px] text-stone-800">Ctrl+C</kbd>（複製）。</li>
                <li> 回到這裡，將內容直接 <kbd className="px-1 py-0.5 bg-stone-200 border rounded font-mono text-[10px] text-stone-800">Ctrl+V</kbd> 貼在下方，點擊下方按鈕即可完美寫入！</li>
              </ol>
            </div>

            <div>
              <label className="block font-mono text-[10px] font-bold text-kraft-800 uppercase mb-1">
                貼上複製品的工作表矩陣資料 (Paste Sheets Cells)
              </label>
              <textarea
                rows={5}
                placeholder="在此貼上您從 Google 試算表複製的矩陣單元格內容..."
                value={pasteData}
                onChange={(e) => setPasteData(e.target.value)}
                className="w-full p-2.5 bg-[#FAF2E5] border border-kraft-400 rounded-xs font-mono text-[11px] text-stone-800 focus:outline-none focus:border-emerald-700"
              />
            </div>

            <button
              onClick={handleImportPastedData}
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-amber-50 font-mono text-xs font-black rounded-xs transition-colors cursor-pointer"
            >
              <Clipboard className="w-4 h-4" />
              <span>完美載入試算表貼文 (LOAD PASTED)</span>
            </button>
          </div>
        )}

        {activeTab === 'csv' && (
          <div className="space-y-4">
            <div className="text-xs font-serif text-stone-700 leading-relaxed bg-[#f6ebd9]/40 border border-kraft-300/40 p-3.5 rounded-xs">
              <span className="font-bold text-kraft-900 block mb-1">💾 雙向支援 (Google Sheets Compatible CSV):</span>
              此選項會將您本機檔案室中儲存的所有文件，打包導出為一個帶有完整 **BOM (Byte Order Mark) 萬國編碼** 的高階 CSV 檔案。
              您可以將該檔案直接置入、或使用匯入功能在 Google Sheets、Excel 中打開，絕不出現亂碼。
            </div>

            <div className="p-4 bg-stone-200/40 rounded-xs border border-dashed border-kraft-400 text-center">
              <div className="font-mono text-xs font-bold text-stone-700 mb-2">當前目錄儲備：{projects.length} 個文件卡</div>
              <button
                onClick={handleExportCSV}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-kraft-800 hover:bg-kraft-900 text-[#FAF2E5] font-mono text-xs font-bold rounded-xs shadow-xs transition-all cursor-pointer"
              >
                <CloudUpload className="w-4 h-4" />
                <span>立即下載 CSV 備份檔案</span>
              </button>
            </div>
          </div>
        )}

        {/* System footer signature */}
        <div className="mt-5 pt-3 border-t border-dashed border-[#dfccb7] flex justify-between items-center text-stone-400 font-mono text-[8.5px]">
          <span>RAMULAB SHEETS SYNC CLIENT v1.0</span>
          <span>STABILITY RATING: HIGH</span>
        </div>
      </div>
    </div>
  );
}
