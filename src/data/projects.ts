/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProjectEntry } from '../types';

export const INITIAL_PROJECTS: ProjectEntry[] = [
  {
    id: 'proj-1',
    title: 'Anemometer Core Matrix',
    subtitle: '輕量化風速遙測矩陣傳輸協定',
    description: '基於低能耗封包鏈結的風速與氣溫測候終端傳播架構，實現微瓦級自主通訊氣象島網絡。',
    content: `DEPT. OF TELEMETRY // REPORT NO. WIND-802-A
=============================================
[STATUS: OPERATIONAL] [LEDGER RECORDED: YES]

此專案為探討極化環境下，如何利用微弱大氣物理能或極低頻率（LPWAN）建立的自主氣象觀測節點。
主要解決高鹽分、低溫低電壓下的信號漂移以及高頻噪音過濾。

研發細節：
1. 傳輸層採用自研「信號壓縮編碼」，單次上行封包僅 12 Bytes。
2. 節點待機消耗小於 4.2 微安培，一枚鈕扣電池可運行 72 個月。
3. 採用反向非對稱加密（NTRU），防範高寒荒野節點受物理竄改。

成果檔案：
- /dev/anemo_matrix.c (已部署於東沙島礁觀測站)
- /doc/calibration_standards_v3.pdf`,
    status: 'completed',
    category: 'code',
    date: '2025.04.18',
    archiveNo: 'BOX-802-A',
    tags: ['IoT', 'C-Lang', 'RF-Modulation', 'RF-868MHz'],
    link: 'https://github.com/ramulab/anemo-matrix',
    attachments: ['ANEMO_D.HEX', 'MATRIX_M.C', 'CALIBR.LOG']
  },
  {
    id: 'proj-2',
    title: 'Parchment Adaptive Font Engine',
    subtitle: '古典紙質自適應墨潰渲染字型排版引擎',
    description: '模擬手工羊皮紙與老式鑄模鉛字在吸墨、浸透、與壓力不均狀態下的即時物理渲染演算法。',
    content: `CLASSICAL TYPOGRAPHY DEPT // LAB-114
=============================================
[STATUS: IN PROGRESS] [DRAFT REVISION: V2]

本項目旨在挽救數位排版中失去的「物理印記殘缺美」。
利用 WebGL 著色器即時運算字型邊緣之微觀纖維毛細作用，重現 15 世紀古騰堡排版所帶有之油墨滲透與凹陷質感。

核心邏輯：
1. 壓強模擬：根據字元在單詞中的出現頻率，擾動模擬打字錘力道，使每個英文字母「印記深度與溢墨」各不相同。
2. 紙張纖維噪點：即時生成微尺度隨機二維雜訊，字型外框路徑與雜訊進行毛細擴散方程（Diffusion Equation）卷積。
3. 墨漬動態氧化：隨著頁面讀取停留時間，字體油墨會產生微弱的飽和度與光澤衰退，重現空氣化學反應。

開發進度：
- 已完成 SVG Path 向量變形擾動器
- WebGL 2D 擴散著色器（已達 60 FPS 實時渲染）
- 待集成：中文活字排版「康熙字典體」支持`,
    status: 'in-progress',
    category: 'design',
    date: '2026.02.10',
    archiveNo: 'BOX-114-B',
    tags: ['WebGL', 'CSS-Shader', 'Typography', 'Typography-Art'],
    link: 'https://ramulab.com/ink-dispersion',
    attachments: ['SHAD_INK.GLSL', 'FIBERS.PNG', 'KERNING.DAT']
  },
  {
    id: 'proj-3',
    title: 'Noosphere Mindmap Indexer',
    subtitle: '心智空間網底語意偏角重組檢索儀',
    description: '探索將高維、零散的日常觀察碎紙片，利用流形降維與語境拓撲，拼接成連續脈絡的自動排架系統。',
    content: `MEMEX ARCHIVE EXPERIMENT // NOO-330
=============================================
[STATUS: CONCEPT ONLY] [DECLASSIFICATION: LEVEL-1]

傳統資料庫之樹狀或標籤結構常切斷直覺式思維聯想。本項實驗探索非線性知識卷軸之無縫拓撲。

概念假設：
1. 「微筆記」即高維空間中的重力場點。
2. 引入自適應力導引演算法（Force-directed mapping），使筆記根據閱讀者的「眼球停滯時間」或「滑鼠拖曳軌跡」即時漂移聚合。
3. 紙牌式儲存法：每張筆記皆如同傳統圖書館借閱卡（Index Card），可物理性疊放，而疊放的「先後順序」與「重疊區域」即代表暫時性的邏輯段落（Transient Documents）。

未來方向：
- 構建三維檔案室（3D Card Catalog Shelf）
- 融合本地 LLM 進行全自動牛皮紙卡片建檔。`,
    status: 'concept',
    category: 'research',
    date: '2026.05.01',
    archiveNo: 'BOX-330-C',
    tags: ['Semantics', 'Graph-Theory', 'Memory-Palace', 'Theoretical-Archbiology'],
    attachments: ['HYPER_MAP.JSON', 'TOPOLOGY.DFT']
  },
  {
    id: 'proj-4',
    title: 'Typewriter CSS Haptic Engine',
    subtitle: '機械鍵軸壓痕網頁物理反饋模擬軌跡',
    description: '解構古典機械打字機的連桿阻力與字鎚敲擊軌跡，將此物理特徵完全抽象化為網頁 DOM 的微動態排版回饋。',
    content: `PNEUMATIC HARDWARE RECREATION // L-712-Y
=============================================
[STATUS: COMPLETED] [PERFORMANCE TESTING: PASS]

這是一個前端物理效果庫。將使用者在虛擬或實體鍵盤上的打字行為，變為具有實體質量的「打字錘軌跡連動」。

功能模組：
1. 音錘動能：字體在畫面上出現時，並非瞬間渲染，而是有 0.05 秒的「往返撞擊與二次回彈」搖晃振動，完全模擬金屬色帶打字機原理。
2. 色帶磨損：越常被激發的事件卡，文字邊緣的對比度會越低，模擬老舊色帶（Ribbon）逐漸用乾的發灰效果。
3. 機械摩擦係數：按鍵行程會受到字元複雜度的微秒級阻尼回饋（支援網頁觸覺感應 API）。

當前應用：
- 本專案平台之「字級標籤」以及「卡片邊緣捲曲」皆已調校此物理模擬庫。`,
    status: 'completed',
    category: 'lab',
    date: '2024.11.03',
    archiveNo: 'BOX-712-Y',
    tags: ['Haptics', 'CSS-Physics', 'Aesthetics', 'UI-Feedback'],
    link: 'https://css-ribbon.ramulab.com',
    attachments: ['HAPTIC.TS', 'SPRING_DAMP.C', 'RIBBON.RES']
  },
  {
    id: 'proj-5',
    title: 'Chronos Celestial Ephemeris Clock',
    subtitle: '高精度黃赤經緯時角編碼計時裝置',
    description: '結合實時儒略日天文星曆，運算觀測地當前大氣折射率、地軸章動、極移後之「真太陽時」時序計量器。',
    content: `CELESTIAL CHRONOLOGY BRANCH // CHR-404-E
=============================================
[STATUS: IN PROGRESS] [CALIBRATION DATE: 1999-TODAY]

常規時間是一秒一秒均等流逝的物理抽象。但人類直覺與生長週期是受到日照真角度之制約。
此硬體與韌體研製項目，探討如何從標準格林威治時間中還原出使用者所踩土地上的「本源時間」。

架構特性：
1. 本地星曆表集成：內嵌 1900-2100 年之簡化週日視運動座標。
2. 時鐘不均勻跳動：在「真太陽日」膨脹的夏季月份，時鐘一秒長度會微幅微調（幾微秒），與自然界完全同步。
3. 介面設計：古典天文觀測盤的數位孿生（Digital Twin），表面呈黃銅、牛皮紙、皮革構成的分度盤，帶有精細刻線及咬合齒輪陰影。

主要收錄：
- /src/astro_time.ts
- /3d_printing/enclosure_cad.step`,
    status: 'in-progress',
    category: 'lab',
    date: '2026.06.05',
    archiveNo: 'BOX-404-E',
    tags: ['Astronomy', 'Microcontroller', 'Physical-UI', 'Time-Scale'],
    attachments: ['ASTRO_COORDS.DB', 'GEAR_RATIO.XLS', 'SPI_UART.ASM']
  },
  {
    id: 'proj-6',
    title: 'Archive Paper Grain Synthesizer',
    subtitle: '動態抗鋸齒數位紙質底噪合成器',
    description: '利用 Web Audio 空間化音頻底噪與 SVG 動態流體噪點，即時合成老舊文件翻頁之觸覺、聽覺與視覺綜合質感。',
    content: `ACOUSTIC & SURFACE INTERFACE // APS-909
=============================================
[STATUS: COMPLETED] [PLATFORM INTEGRATION: HIGH]

利用數位濾波與時變頻場重現 19 世紀圖書館檔案室特有的底噪氛圍。

聲學特徵：
1. 灰塵破裂音（Crackles）：隨機產生的低頻細碎爆音，模擬靜電、紙張微小綻裂與周圍環境熱運動。
2. 空氣諧振（Room Resonance）：45dB 微弱背景空氣流動聲（Pink Noise 經過極窄帶通濾波）。
3. 翻頁動態（Page Flip Physics）：依照使用者卡片滑動的速度與力道，即時合成獨一無二的「紙張翻動、摩擦」聲。

成果：
- 已封裝為輕量 Web Audio API 模組
- 本專案平台之「背景微噪與卡片音效」的核心基礎技術。`,
    status: 'completed',
    category: 'lab',
    date: '2025.10.12',
    archiveNo: 'BOX-909-F',
    tags: ['WebAudio', 'Noise-Gen', 'Generative', 'Multi-Sensory'],
    link: 'https://ramulab.com/ambient-paper',
    attachments: ['GRAIN.WAV', 'SYNTH.TS', 'WEB_AUDIO.MD']
  }
];

const LOCAL_STORAGE_KEY = 'ramulab_archive_projects';

export function getStoredProjects(): ProjectEntry[] {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to parse stored projects:', error);
  }
  return INITIAL_PROJECTS;
}

export function saveProjects(projects: ProjectEntry[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(projects));
  } catch (error) {
    console.error('Failed to save projects to localStorage:', error);
  }
}
