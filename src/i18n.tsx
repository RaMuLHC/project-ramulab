import React, { createContext, useContext, useState } from 'react';

type Language = 'zh' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
  localizeText: (text: string | undefined) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const translations = {
  zh: {
    header: {
      title: 'RAMULAB 專案檔案室',
      subtitle: '此處收納了我個人已完成與正在開發的所有專案。敬請翻閱探尋靈感。',
      sync_live: '雲端同步狀態：聯網讀取中 // LIVE SHEETS MODE',
      sync_local: '同步狀態：本機示範 // LOCAL DEMO MODE',
      recorded_projects: '已收錄的專案（RECORDED PROJECTS）',
      completed: '已完成',
      in_progress: '開發中',
      concept: '構思中',
      archived: '已存檔',
      total: '[Σ] 存檔總計 (TOTAL):',
      total_suffix: '個',
      sync_config_title: 'Google 試算表櫃位連線設定 (GOOGLE SPREADSHEET SYNC)',
      show_config: '[展開設定]',
      hide_config: '[隱藏設定]',
      sync_guidelines: '💡 <strong>設定方式：</strong>建立一個 Google 試算表並填寫專案資料。接著在試算表右上角點選 <strong>「分享」➜ 選擇「知道連結的任何人均可檢視」</strong>，複製網址貼入下方，點擊同步即會自動載入最新專案！',
      sheet_link: 'Google 試算表共享網址 (Spreadsheet Link)',
      sheet_tab: '工作表頁籤名稱 (Sheet Tab)',
      sheet_tab_placeholder: '預設：Sheet1',
      sync_btn: '同步載入',
      syncing_btn: '同步中',
      advanced_sync_btn: '進階雙向同步',
      sync_success: '資料讀取成功！您試算表中的所有專責卡片均已即時載入呈現。',
      column_mapping: '<strong>對應之直列（欄位順序）：</strong>',
      col_title: '1. 專題名稱',
      col_subtitle: '2. 專題小標題',
      col_description: '3. 專題內容描述',
      col_date: '4. 專題日期',
      col_status: '5. 專題狀態',
      col_category: '6. 專題分類',
      col_link: '7. 專題鏈接',
      search_placeholder: '打字檢索專案標題、標籤或編號...',
      reset_filters: '還原過濾 (RESET)',
      category_all: '全部目錄 · ALL',
      status_all: '全部狀態 (ALL)',
      status_completed_stamp: '已完成 (COMPLETED)',
      status_inprogress_stamp: '開發中 (IN PROGRESS)',
      status_concept_stamp: '構思中 (CONCEPT)',
      status_archived_stamp: '已存檔 (ARCHIVED)',
      category_code: '代碼 · CODE',
      category_design: '設計 · DESIGN',
      category_research: '研究 · RES',
      category_lab: '工坊 · LAB',
      category_writing: '文獻 · DOC',
    },
    card: {
      category_code_long: '代碼碼塊 · CODE',
      category_design_long: '設計美學 · DESIGN',
      category_research_long: '學術研究 · RES',
      category_lab_long: '工坊 · LAB',
      category_writing_long: '文獻檔案 · DOC',
      status_completed_stamp_long: '已完成 · COMPLETED',
      status_inprogress_stamp_long: '開發中 · IN PROGRESS',
      status_concept_stamp_long: '構思中 · CONCEPT',
      status_archived_stamp_long: '已存檔 · ARCHIVED',
      subject: 'SUBJECT / 計畫主題',
      date: 'DATE / 封存',
      official_card: 'OFFICIAL NAME CARD',
      greeting: '幸會！我是RaMu',
      welcome_msg: '——歡迎蒞臨此處，探索我的數位檔案與構思。',
      contact: '聯絡：info@ramulab.com',
      seal_yin: '印',
    },
    empty: {
      no_card_read: '⚠️ 尚未讀取到 any 專案卡片',
      no_match: '查無匹配字軌之歸檔文件卡。',
      no_projects_loaded_instruction: '目前網頁沒有載入任何專案。請點擊上方或頁面底部的「開啟設定面板」，貼上您的 Google 試算表共享網址並點擊同步！',
      no_match_instruction: '未能在存檔室中尋得符合「{query}」字軌的檔案名錄。請重新調整篩選條件或重新檢查 Google 試算表連結。',
      connection_error: '連線錯誤：',
    },
    footer: {
      reset_system_default: '[重置系統預設名錄]',
    },
    detail: {
      catalog_card: 'CATALOG CARD',
      deposit_date: 'DEPOSIT DATE:',
      grouping: 'GROUPING:',
      tag_cross_refs: 'TAG CROSS-REFS:',
      attachments_title: '文件附件清單 (METADATA PINNED ATTACHMENTS)',
      demo_link: '訪問專案網址 (DEMO LINK)',
      copied: '已複製',
      copy_link: '複製連結',
      change_status: '變更狀態:',
      shred_card: '銷毀此卡 (SHRED CARD)',
      close_folder: '關閉卷宗',
      shred_confirm: '確定要永久銷毀此專案檔案卡？此動作無法撤銷。',
    },
    add_dialog: {
      new_deposit_title: 'NEW DEPOSIT ACQUISITION // 新建專案歸檔卡',
      record_new_folder: '錄入新的數位檔案',
      error_missing_fields: '請填寫必填欄位：專案名稱、簡短摘要、詳細報告。',
      title_label: '專案名稱 (TITLE) *',
      title_placeholder: '如：古典大氣測候儀',
      subtitle_label: '小標 / 英文副標 (SUBTITLE)',
      subtitle_placeholder: '如：Anemometer Calibration',
      subtitle_default: '未定義副標題',
      category_label: '檔案類別 (CATEGORY)',
      cat_code: '源代碼 (Code)',
      cat_design: '視覺設計 (Design)',
      cat_research: '學術研究 (Research)',
      cat_lab: '實驗工坊 (Lab)',
      cat_writing: '文獻紀錄 (Writing)',
      status_label: '研發階段 (STATUS)',
      status_completed: '已完成 (Completed)',
      status_inprogress: '開發中 (In-Progress)',
      status_concept: '構思中 (Concept)',
      status_archived: '已存檔 (Archived)',
      record_date_label: '定稿日期 (RECORD DATE)',
      demo_link_label: '專案網址 / 鏈結 (DEMO LINK)',
      short_summary_label: '簡短摘要 (SHORT SUMMARY) *',
      short_summary_placeholder: '一行簡短字句，描述該歸檔專案（展示於索引室主磁碟列表上）。',
      detailed_report_label: '詳細建置報告 (DETAILED FOLDER STATEMENT) *',
      formatting_hint: '支援打字機文本與空格排位',
      detailed_report_placeholder: '請輸入關於該專案的學術報告、底層架構、測試報告或代碼日誌等細項...',
      tags_label: '關聯標籤 (TAGS - 逗號隔開)',
      tags_placeholder: '如: Rust, WebGL, IoT',
      attachments_label: '模擬文件編號附件 (ATTACHMENTS - 逗號隔開)',
      attachments_placeholder: '如: INDEX.TS, CONFIG.SYS',
      change_code: '♻️ 更換索引字軌',
      cancel: '取消',
      save_card: '保存檔案 (SAVE CARD)',
    },
    sync: {
      csv_export_success: '試算表 CSV 檔案已成功導出並下載！您可以直接用 Google Sheets 開啟它。',
      csv_export_fail: '導出 CSV 失敗: ',
      paste_error_empty: '請在下方文字方塊中貼上來自 Google Sheets 的儲存格內容！',
      paste_error_header: '資料行數不足，至少需要標頭行與一行資料！',
      paste_no_valid_row: '未能在貼入的文字中找到任何有效的專案行 (請確認是否包含「Title / 標題」欄位)',
      paste_success: '完美完成！成功從試算表貼文中解析並寫入 {count} 份全新的文件歸檔卡！',
      paste_fail: '解析貼入資料失敗: ',
      url_error_empty: '請提供有效的 Google 試算表連結或 ID！',
      api_error_permission: '存取遭拒。原因可能是未提供 API 密鑰/OAuth 憑證，或者該試算表未設置為「知道連結的任何人均可檢視」。詳情: ',
      api_error_empty_sheet: '取得成功，但該工作表中沒有發現足夠的儲存格內容或缺少標頭行。',
      api_error_no_row: '未能在工作表中找到任何有效的專案行。',
      api_success: '雲端同步成功！成功從 Google Sheets 載入並整合了 {count} 筆專案，並已錄入您當前的本機櫃！',
      api_fail: '雲端同步失敗: ',
      export_error_token: '寫入/覆蓋雲端試算表通常需要提供 OAuth Access Token (存取權標)！',
      export_success: '完美覆蓋！已將本機櫃的 {count} 筆專案寫入 Google Sheets 中的工作表「{sheetName}」！',
      export_fail: '同步匯出至 Google Sheets 失敗: ',
      modal_tag: 'GOOGLE 試算表同步單元',
      modal_title: '雲端同步櫃 · GOOGLE SHEETS',
      modal_subtitle: 'ESTABLISH STABLE SPREADSHEET LEDGER EXCHANGE SYSTEMS',
      tab_live_api: '直接 API 同步 (LIVE API)',
      tab_quick_paste: '一秒 Ctrl+C 貼上匯入',
      tab_csv_export: '本地備份 (CSV EXPORT)',
      schema_guide: '💡 <strong>快捷指引 (Sheet Schema Setup):</strong> 您的 Google Sheet 第一行需填寫以下欄位（大小寫不限）：',
      url_label: 'Google 試算表連結 (Spreadsheet URL)',
      url_placeholder: '貼上您的試算表 URL（例: https://docs.google.com/spreadsheets/d/ ...）',
      sheet_name_label: '工作表名稱 (Sheet/Tab Name)',
      sheet_name_placeholder: '工作表名稱，預設為 Sheet1',
      api_key_label: 'API 金鑰（用於讀取公開試算表）',
      api_key_placeholder: '可選貼上 API Key 或省略',
      oauth_label: 'Google OAuth 存取權標 (Access Token - 用於無缝讀寫)',
      oauth_placeholder: '貼上您的 Access Token 以往返讀寫您的私人試算表',
      oauth_note: '備註：Google 設有跨網域安全機制，存取私人試算表、或寫入數據到試算表時，必須使用 OAuth Token。',
      pull_btn: '從 Google 試算表拉取',
      pulling_btn: '加載中...',
      push_btn: '覆蓋至 Google 試算表',
      pushing_btn: '匯出中...',
      zero_setup_title: '📢 極速免認證方案 (Zero-Setup Paste Import):',
      zero_setup_note: '這是不需要申請任何 Google Cloud 憑證的最穩健做法！',
      zero_setup_steps: '<li> 打開您的 Google 試算表。</li><li> 框選所有儲存格，按 <kbd class="px-1 py-0.5 bg-stone-200 border rounded font-mono text-[10px] text-stone-800">Ctrl+C</kbd>（複製）。</li><li> 回到這裡，將內容直接 <kbd class="px-1 py-0.5 bg-stone-200 border rounded font-mono text-[10px] text-stone-800">Ctrl+V</kbd> 貼在下方，點擊下方按鈕即可完美寫入！</li>',
      paste_label: '貼上複製品的工作表矩陣資料 (Paste Sheets Cells)',
      paste_placeholder: '在此貼上您從 Google 試算表複製的矩陣單元格內容...',
      paste_load_btn: '完美載入試算表貼文 (LOAD PASTED)',
      csv_title: '💾 雙向支援 (Google Sheets Compatible CSV):',
      csv_note: '此選項會將您本機檔案室中儲存的所有文件，打包導出為一個帶有完整 **BOM (Byte Order Mark) 萬國編碼** 的高階 CSV 檔案。您可以將該檔案直接置入、或使用匯入功能在 Google Sheets、Excel 中打開，絕不出現亂碼。',
      csv_local_stock: '當前目錄儲備：{count} 個文件卡',
      csv_download_btn: '立即下載 CSV 備份檔案',
      reset_confirm: '確定要清除自訂設定，並重置回您的預設 Google 試算表嗎？',
      sync_error_invalid_url: '請輸入有效的 Google 試算表共享網址',
      sync_error_fetch_fail: '試算表連線因 HTTP 狀態代碼 {status} 失敗。請檢查網址並確認您的試算表已共享為「知道連結的任何人均可檢視」！',
      sync_error_google_api: 'Google 試算表錯誤：{serverError} (請確認您的頁籤名稱「{tgtName}」是否與試算表匹配且已開放共享)',
      sync_error_empty_rows: '共享工作表成功連通，但沒有回載任何有效卡片行目。請檢查頁籤名稱！',
      sync_error_no_formatted_row: '未能在試算表內查出任何符合格式的專案列！',
      close: '關閉',
    },
  },
  en: {
    header: {
      title: 'RAMULAB Project Archive',
      subtitle: 'This archive houses all my completed and ongoing projects. Feel free to browse for inspiration.',
      sync_live: 'Cloud Sync Status: Live Reading // LIVE SHEETS MODE',
      sync_local: 'Sync Status: Local Demo // LOCAL DEMO MODE',
      recorded_projects: 'Recorded Projects',
      completed: 'Completed',
      in_progress: 'In Progress',
      concept: 'Concept',
      archived: 'Archived',
      total: '[Σ] Total Recorded:',
      total_suffix: 'items',
      sync_config_title: 'Google Sheets Connection Settings (GOOGLE SPREADSHEET SYNC)',
      show_config: '[Expand Settings]',
      hide_config: '[Hide Settings]',
      sync_guidelines: '💡 <strong>Setup:</strong> Create a Google Sheet and fill in project details. Then, in the top-right corner of the sheet, click <strong>"Share" ➜ Select "Anyone with the link can view"</strong>, copy the URL and paste it below, then click sync to automatically load your latest projects!',
      sheet_link: 'Google Sheet Shared URL (Spreadsheet Link)',
      sheet_tab: 'Sheet Tab Name (Sheet Tab)',
      sheet_tab_placeholder: 'Default: Sheet1',
      sync_btn: 'Sync & Load',
      syncing_btn: 'Syncing...',
      advanced_sync_btn: 'Advanced Dual Sync',
      sync_success: 'Data sync successful! All project cards from your spreadsheet have been dynamically loaded.',
      column_mapping: '<strong>Column Mapping (Sequence):</strong>',
      col_title: '1. Title',
      col_subtitle: '2. Subtitle',
      col_description: '3. Description',
      col_date: '4. Date',
      col_status: '5. Status',
      col_category: '6. Category',
      col_link: '7. Link',
      search_placeholder: 'Type to search project titles, tags, or box numbers...',
      reset_filters: 'Clear Filters',
      category_all: 'All Categories · ALL',
      status_all: 'All Statuses',
      status_completed_stamp: 'Completed',
      status_inprogress_stamp: 'In Progress',
      status_concept_stamp: 'Concept',
      status_archived_stamp: 'Archived',
      category_code: 'Code',
      category_design: 'Design',
      category_research: 'Research',
      category_lab: 'Lab',
      category_writing: 'Doc',
    },
    card: {
      category_code_long: 'Code Blocks',
      category_design_long: 'Design Aesthetics',
      category_research_long: 'Academic Research',
      category_lab_long: 'Workshop',
      category_writing_long: 'Document Archive',
      status_completed_stamp_long: 'Completed / 已完成 · COMPLETED',
      status_inprogress_stamp_long: 'In Progress / 開發中 · IN PROGRESS',
      status_concept_stamp_long: 'Concept / 構思中 · CONCEPT',
      status_archived_stamp_long: 'Archived / Archived · 已存檔 · ARCHIVED',
      subject: 'SUBJECT / PROJECT TITLE',
      date: 'DATE / ARCHIVED',
      official_card: 'OFFICIAL NAME CARD',
      greeting: 'Greetings! I am RaMu',
      welcome_msg: '— Welcome. Explore my digital dossiers and conceptual drafts.',
      contact: 'Contact: info@ramulab.com',
      seal_yin: '印',
    },
    empty: {
      no_card_read: '⚠️ No project cards loaded yet',
      no_match: 'No matching archived document cards found.',
      no_projects_loaded_instruction: 'No projects are currently loaded on this page. Please click "Open Settings Panel" at the top or bottom, paste your Google Sheet shared URL, and click Sync!',
      no_match_instruction: 'Could not find any records matching "{query}" in the archive. Please adjust filters or inspect your Google Sheets link.',
      connection_error: 'Connection Error: ',
    },
    footer: {
      reset_system_default: '[Reset System Defaults]',
    },
    detail: {
      catalog_card: 'CATALOG CARD',
      deposit_date: 'DEPOSIT DATE:',
      grouping: 'GROUPING:',
      tag_cross_refs: 'TAG CROSS-REFS:',
      attachments_title: 'Attachments List (METADATA PINNED ATTACHMENTS)',
      demo_link: 'Visit Project Site (DEMO LINK)',
      copied: 'Copied',
      copy_link: 'Copy Link',
      change_status: 'Change Status:',
      shred_card: 'Shred Card (SHRED CARD)',
      close_folder: 'Close Dossier',
      shred_confirm: 'Are you sure you want to permanently shred this project card? This action cannot be undone.',
    },
    add_dialog: {
      new_deposit_title: 'NEW DEPOSIT ACQUISITION // NEW ARCHIVE CARD',
      record_new_folder: 'Record New Digital Dossier',
      error_missing_fields: 'Please fill in all required fields: Project Title, Short Summary, and Detailed Report.',
      title_label: 'Project Title (TITLE) *',
      title_placeholder: 'e.g., Classical Anemometer',
      subtitle_label: 'Subtitle / English (SUBTITLE)',
      subtitle_placeholder: 'e.g., Anemometer Calibration',
      subtitle_default: 'Undefined Subtitle',
      category_label: 'File Category (CATEGORY)',
      cat_code: 'Source Code (Code)',
      cat_design: 'Visual Design (Design)',
      cat_research: 'Academic Research (Research)',
      cat_lab: 'Experimental Workshop (Lab)',
      cat_writing: 'Literature Record (Writing)',
      status_label: 'R&D Phase (STATUS)',
      status_completed: 'Completed (Completed)',
      status_inprogress: 'In Progress (In-Progress)',
      status_concept: 'Concept (Concept)',
      status_archived: 'Archived (Archived)',
      record_date_label: 'Record Date (RECORD DATE)',
      demo_link_label: 'Project URL / Link (DEMO LINK)',
      short_summary_label: 'Short Summary (SHORT SUMMARY) *',
      short_summary_placeholder: 'A brief one-line description of the archived project (shown on index shelf list).',
      detailed_report_label: 'Detailed Build Report (DETAILED FOLDER STATEMENT) *',
      formatting_hint: 'Supports typewriter text and space layouts',
      detailed_report_placeholder: 'Enter detailed academic reports, underlying architecture, testing logs, or code journals...',
      tags_label: 'Associated Tags (TAGS - Comma Separated)',
      tags_placeholder: 'e.g., Rust, WebGL, IoT',
      attachments_label: 'Attached File Numbers (ATTACHMENTS - Comma Separated)',
      attachments_placeholder: 'e.g., INDEX.TS, CONFIG.SYS',
      change_code: '♻️ Change Index Tag',
      cancel: 'Cancel',
      save_card: 'Save Card (SAVE CARD)',
    },
    sync: {
      csv_export_success: 'Spreadsheet CSV file successfully exported and downloaded! You can open it directly in Google Sheets.',
      csv_export_fail: 'CSV Export Failed: ',
      paste_error_empty: 'Please paste cell contents from Google Sheets into the textbox below!',
      paste_error_header: 'Insufficient rows. At least a header row and one data row are required!',
      paste_no_valid_row: 'Could not find any valid project rows in pasted text (verify it contains \'Title\' column).',
      paste_success: 'Success! Successfully parsed and wrote {count} new document cards from the spreadsheet paste!',
      paste_fail: 'Failed to parse pasted data: ',
      url_error_empty: 'Please provide a valid Google Sheet link or ID!',
      api_error_permission: 'Access denied. Either API Key/OAuth credentials were not provided, or the spreadsheet is not set to \'Anyone with the link can view\'. Details: ',
      api_error_empty_sheet: 'Fetched successfully, but no cell contents or header row found in the sheet.',
      api_error_no_row: 'Could not find any valid project rows in the sheet.',
      api_success: 'Cloud sync successful! Loaded and integrated {count} projects from Google Sheets into your local cabinet!',
      api_fail: 'Cloud Sync Failed: ',
      export_error_token: 'Writing to the cloud spreadsheet requires a Google OAuth Access Token!',
      export_success: 'Overwrite complete! Wrote {count} projects from your local cabinet to sheet "{sheetName}" in Google Sheets!',
      export_fail: 'Failed to export sync to Google Sheets: ',
      modal_tag: 'GOOGLE SHEETS SYNC UNIT',
      modal_title: 'Cloud Sync Cabinet · GOOGLE SHEETS',
      modal_subtitle: 'ESTABLISH STABLE SPREADSHEET LEDGER EXCHANGE SYSTEMS',
      tab_live_api: 'Direct API Sync (LIVE API)',
      tab_quick_paste: 'One-Sec Ctrl+C Paste Import',
      tab_csv_export: 'Local Backup (CSV EXPORT)',
      schema_guide: '💡 <strong>Schema Setup Guide:</strong> The first row of your Google Sheet must contain the following columns (case-insensitive):',
      url_label: 'Google Sheet Link (Spreadsheet URL)',
      url_placeholder: 'Paste your spreadsheet URL (e.g. https://docs.google.com/spreadsheets/d/... )',
      sheet_name_label: 'Sheet Name (Sheet/Tab Name)',
      sheet_name_placeholder: 'Sheet name, default is Sheet1',
      api_key_label: 'API Key (Used to read public sheets)',
      api_key_placeholder: 'Optional API Key (leave blank if public)',
      oauth_label: 'Google OAuth Access Token (Used for seamless read/write)',
      oauth_placeholder: 'Paste your Access Token to read/write private sheets',
      oauth_note: 'Note: Google cross-origin security requires OAuth Tokens for private spreadsheet access or writing data.',
      pull_btn: 'Pull from Google Sheet',
      pulling_btn: 'Loading...',
      push_btn: 'Push to Google Sheet',
      pushing_btn: 'Pushing...',
      zero_setup_title: '📢 Zero-Setup Paste Import:',
      zero_setup_note: 'This is the most robust way and requires zero credentials!',
      zero_setup_steps: '<li>Open your Google Sheet.</li><li>Select all cells, press <kbd class="px-1 py-0.5 bg-stone-200 border rounded font-mono text-[10px] text-stone-800">Ctrl+C</kbd> (Copy).</li><li>Return here, paste (<kbd class="px-1 py-0.5 bg-stone-200 border rounded font-mono text-[10px] text-stone-800">Ctrl+V</kbd>) into the field below, and click load!</li>',
      paste_label: 'Paste Sheet Matrix Data (Paste Sheets Cells)',
      paste_placeholder: 'Paste your copied Google Sheet cells here...',
      paste_load_btn: 'Load Pasted Sheet Cells (LOAD PASTED)',
      csv_title: '💾 Dual Support (Google Sheets Compatible CSV):',
      csv_note: 'This option packages and exports all documents saved in your local archive into a high-level CSV file with UTF-8 BOM (Byte Order Mark) encoding. You can open or import this file directly into Google Sheets or Excel without encoding errors.',
      csv_local_stock: 'Current local archive count: {count} document cards',
      csv_download_btn: 'Download CSV Backup File',
      reset_confirm: 'Are you sure you want to clear custom settings and reset to your default Google Sheet?',
      sync_error_invalid_url: 'Please enter a valid Google Sheet URL',
      sync_error_fetch_fail: 'Spreadsheet connection failed with HTTP status {status}. Please inspect the link and confirm the spreadsheet is shared as "Anyone with link can view"!',
      sync_error_google_api: 'Google Sheets Error: {serverError} (Confirm tab name "{tgtName}" matches and is shared publicly)',
      sync_error_empty_rows: 'Connection successful, but no valid card entries returned. Please check the tab name!',
      sync_error_no_formatted_row: 'No format-compliant project rows detected in the spreadsheet!',
      close: 'Close',
    },
  },
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('ramulab_lang') as Language) || 'zh';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('ramulab_lang', lang);
  };

  const t = (key: string, replacements?: Record<string, string | number>) => {
    const keys = key.split('.');
    let val: any = translations[language];
    for (const k of keys) {
      if (val && typeof val === 'object' && k in val) {
        val = val[k];
      } else {
        // Fallback to zh
        let fallbackVal: any = translations['zh'];
        for (const fk of keys) {
          if (fallbackVal && typeof fallbackVal === 'object' && fk in fallbackVal) {
            fallbackVal = fallbackVal[fk];
          } else {
            fallbackVal = key;
            break;
          }
        }
        val = fallbackVal;
        break;
      }
    }
    if (typeof val !== 'string') return key;
    if (replacements) {
      let replaced = val;
      Object.entries(replacements).forEach(([k, v]) => {
        replaced = replaced.replace(`{${k}}`, String(v));
      });
      return replaced;
    }
    return val;
  };

  const localizeText = (text: string | undefined): string => {
    if (!text) return '';
    if (text.includes('///')) {
      const parts = text.split('///');
      if (language === 'en') {
        return parts[1]?.trim() || parts[0]?.trim() || '';
      }
      return parts[0]?.trim() || '';
    }
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, localizeText }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
