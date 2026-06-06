/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ProjectEntry, CustomPreset } from '../types';
import { ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from '../i18n';

interface ProjectCardProps {
  key?: React.Key;
  project: ProjectEntry;
  index: number;
  onSelect: (project: ProjectEntry) => void;
  customPresets?: CustomPreset[];
}

export default function ProjectCard({ project, index, onSelect, customPresets = [] }: ProjectCardProps) {
  const { t, localizeText } = useTranslation();
  const [isHovered, setIsHovered] = React.useState(false);

  // Deterministic organic stack offsets to create an aesthetic "overlapping" look
  const angle = ((index * 3) % 3) - 1.5; // -1.5 to 1.5 degrees
  const offsetX = ((index * 5) % 6) - 3; // -3px to 3px
  const offsetY = ((index * 7) % 6) - 3; // -3px to 3px

  // Select color highlights based on category
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'code': return 'text-sky-800 bg-sky-100/60 border-sky-300';
      case 'design': return 'text-amber-800 bg-amber-100/60 border-amber-300';
      case 'research': return 'text-emerald-800 bg-emerald-100/60 border-emerald-300';
      case 'lab': return 'text-purple-800 bg-purple-100/60 border-purple-300';
      default: return 'text-stone-800 bg-stone-100/60 border-stone-300';
    }
  };

  const getStatusStamp = (status: string) => {
    const custom = customPresets.find(p => p.type === 'status' && p.key === status);
    if (custom) {
      let colorClass = 'text-stone-700/80 border-stone-600/40 bg-stone-50/10';
      if (custom.color) {
        colorClass = custom.color;
      } else {
        const k = custom.key.toLowerCase();
        if (k.includes('comp') || k.includes('done') || k.includes('完')) {
          colorClass = 'text-emerald-700/80 border-emerald-600/40 bg-emerald-50/10';
        } else if (k.includes('prog') || k.includes('dev') || k.includes('展') || k.includes('進')) {
          colorClass = 'text-amber-700/80 border-amber-600/40 bg-[#FAF2E5]/50';
        } else if (k.includes('con') || k.includes('draft') || k.includes('想') || k.includes('未')) {
          colorClass = 'text-purple-700/80 border-purple-600/40 bg-purple-50/10';
        } else if (k.includes('arch') || k.includes('secre') || k.includes('密') || k.includes('存')) {
          colorClass = 'text-rose-700/80 border-rose-600/40 bg-rose-50/10';
        }
      }
      return {
        text: localizeText(custom.label),
        color: colorClass
      };
    }

    switch (status) {
      case 'completed':
        return {
          text: t('card.status_completed_stamp_long'),
          color: 'text-emerald-700/80 border-emerald-600/40 bg-emerald-50/10'
        };
      case 'in-progress':
      case 'in-development':
        return {
          text: t('card.status_inprogress_stamp_long'),
          color: 'text-amber-700/80 border-amber-600/40 bg-[#FAF2E5]/50'
        };
      case 'concept':
        return {
          text: t('card.status_concept_stamp_long'),
          color: 'text-purple-700/80 border-purple-600/40 bg-purple-50/10'
        };
      case 'archived':
        return {
          text: t('card.status_archived_stamp_long'),
          color: 'text-rose-700/80 border-rose-600/40 bg-rose-50/10'
        };
      default:
        return { text: localizeText(status).toUpperCase(), color: 'text-stone-500 border-stone-400 bg-stone-50/10' };
    }
  };

  const stamp = getStatusStamp(project.status);

  const getCategoryLabel = (cat: string) => {
    const custom = customPresets.find(p => p.type === 'category' && p.key === cat);
    if (custom) return custom.label;

    switch (cat) {
      case 'code': return 'Code';
      case 'design': return 'Design';
      case 'research': return 'Research';
      case 'lab': return 'Lab';
      case 'writing': return 'Doc';
      default: return cat.toUpperCase();
    }
  };

  // Folder tab is unified to the top-right corner for all files
  const tabPositionClass = 'right-8';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.4) }}
      style={{
        transform: `rotate(${angle}deg) translate(${offsetX}px, ${offsetY}px)`,
        perspective: 1000,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full h-[340px] pt-6 cursor-pointer select-none group"
      onClick={(e) => {
        if (project.link && project.link.trim()) {
          window.open(project.link.trim(), '_blank', 'noopener,noreferrer');
        } else {
          onSelect(project);
        }
      }}
      id={`project-card-${project.id}`}
    >
      {/* 📂 FOLDER TAB (Styled like back page tab, integrated with back cover sheet) */}
      <div 
        className={`absolute top-1.5 ${tabPositionClass} h-[24px] px-4 bg-[#dfccb7] border-t border-x border-[#c8b7a0] rounded-t-lg z-0 flex items-center transition-all duration-300 ${
          isHovered ? 'bg-[#ebd8bf] border-[#bcab94]' : ''
        } shadow-[0_-2px_4px_rgba(0,0,0,0.03)]`}
      >
        <span className="font-mono text-[9px] font-bold text-[#6a543b] uppercase tracking-widest">
          {localizeText(getCategoryLabel(project.category)).split('·')[0].trim()}
        </span>
      </div>

      {/* 📂 FOLDER BACK COVER PANEL */}
      <div className="absolute inset-x-0 bottom-0 top-[24px] bg-[#dfccb7] border border-[#c8b7a0] rounded-sm shadow-md z-0 transition-all duration-300 paper-noise h-[calc(100%-24px)]" />

      {/* 📄 INNER PAPER INSERT (Sits behind front cover, slides up on folder hover to reveal technical drafting schematics) */}
      <div 
        style={{
          transform: isHovered ? 'translateY(-24px) rotate(-0.5deg)' : 'translateY(0px) rotate(0deg)',
          boxShadow: isHovered ? '0 10px 20px rgba(0, 0, 0, 0.12)' : '0 1px 3px rgba(0,0,0,0.05)',
          transition: 'transform 0.3s cubic-bezier(0.165, 0.84, 0.44, 1), box-shadow 0.3s cubic-bezier(0.165, 0.84, 0.44, 1)'
        }}
        className="absolute inset-x-2 bottom-3 top-[34px] bg-[#fbfaf7] border border-stone-300 rounded-xs z-10 overflow-hidden"
      >
        {/* Light graph grid on the document */}
        <div className="absolute inset-0 ledger-grid opacity-[0.14] pointer-events-none" />
        
        {/* Blueprint Compass/Technical Schematic in background in blue architect ink */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.14] pointer-events-none p-4">
          <svg viewBox="0 0 100 100" className="w-full h-full text-blue-800">
            <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.4" strokeDasharray="2,2" />
            <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="0.4" />
            <circle cx="50" cy="50" r="12" fill="none" stroke="currentColor" strokeWidth="0.4" />
            <line x1="50" y1="5" x2="50" y2="95" stroke="currentColor" strokeWidth="0.2" />
            <line x1="5" y1="50" x2="95" y2="50" stroke="currentColor" strokeWidth="0.2" />
            <path d="M 22 22 L 78 78 M 22 78 L 78 22" stroke="currentColor" strokeWidth="0.15" strokeDasharray="1,1" />
          </svg>
        </div>
        
        <div className="absolute top-4 left-5 right-5 font-mono text-[7.5px] text-blue-900/40 leading-normal select-none">
          <div className="font-bold border-b border-blue-900/20 pb-0.5 mb-1 text-[8px]">INTERNAL ARCHIVAL SPECIFICATIONS</div>
          <div>DEVICE MODULE REF // {project.archiveNo}</div>
          <div>LATITUDE/LONGITUDE FLIGHT COORDINATE MATRIX</div>
          <div>CLASSIFIED RESEARCH ARCHIVE - RAMULAB LABS</div>
        </div>

        <div className="absolute bottom-3 right-4 font-mono text-[6.5px] text-blue-900/35 select-none text-right">
          [CONFIDENTIAL DOCUMENT SEC_4]
        </div>
      </div>

      {/* 📂 FOLDER FRONT COVER (Contains all printing directly on the cardboard surface) */}
      <div 
        style={{ 
          transformStyle: 'preserve-3d',
          transform: isHovered ? 'rotateX(-14deg) translateY(2px)' : 'rotateX(0deg) translateY(0px)',
          boxShadow: isHovered ? '0 15px 30px rgba(61, 43, 31, 0.22)' : '0 4px 10px rgba(0,0,0,0.08)',
          transition: 'transform 0.3s cubic-bezier(0.165, 0.84, 0.44, 1), box-shadow 0.3s cubic-bezier(0.165, 0.84, 0.44, 1)',
          transformOrigin: 'bottom center',
        }}
        className="absolute inset-x-0 bottom-0 top-[28px] bg-[#f0e1cc] border border-[#c8b7a0] border-t-2 border-t-[#bcab94] rounded-b-sm z-20 paper-noise p-5 flex flex-col justify-between"
      >
        {/* Subtle score lines at the folder bottom for mechanical realism */}
        <div className="absolute inset-x-0 bottom-2.5 h-[1px] border-b border-[#bcab94]/30 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-4 h-[1px] border-b border-[#bcab94]/30 pointer-events-none" />

        {/* Manila folder guide lines and printing */}
        <div>
          {/* Subject and Date block */}
          <div className="border-b border-stone-400/60 pb-1 mb-2.5 relative">
            <div className="flex justify-between items-end">
              <div className="w-[68%]">
                <span className="font-mono text-[8px] font-black text-stone-600/70 block leading-none uppercase tracking-wider">
                  {t('card.subject')}
                </span>
                <h3 className="font-serif text-[17px] font-bold text-stone-900 tracking-tight leading-tight mt-1 truncate">
                  {localizeText(project.title)}
                </h3>
              </div>
              <div className="w-[28%] text-right">
                <span className="font-mono text-[8px] font-black text-stone-600/70 block leading-none uppercase tracking-wider">
                  {t('card.date')}
                </span>
                <span className="font-mono text-[9.5px] font-black text-stone-800 tracking-tight mt-1 inline-block bg-[#e5d2b7]/40 px-1 py-0.5 rounded-xs">
                  {project.date}
                </span>
              </div>
            </div>
          </div>

          {/* Subtitle designations */}
          <div className="font-typewriter text-[11px] text-stone-700 italic font-medium leading-normal mb-3 border-b border-dashed border-[#c8b7a0]/60 pb-1.5 flex justify-between items-center">
            <span>{localizeText(project.subtitle)}</span>
          </div>

          {/* Elegant ruled description lines matching vintage paper guides */}
          <div className="relative mt-2 min-h-[90px] flex flex-col">
            {/* 20px Lined rulings printed on the cardboard */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(130,100,70,0.075)_1px,transparent_1px)] bg-[size:100%_20px] pointer-events-none" />
            <p className="text-stone-800/90 text-xs font-mono leading-[20px] line-clamp-4 pl-1 pt-0.5 z-10 whitespace-pre-line">
              {localizeText(project.description)}
            </p>
          </div>
        </div>

        {/* 🔴 Status Ink Stamp stamped directly on the cover board */}
        <div className="absolute right-6 bottom-[55px] pointer-events-none z-30 select-none opacity-85 rotate-[-6deg]">
          <div className={`ink-stamp text-[12.5px] font-bold border-2 border-double px-3.5 py-1 uppercase tracking-wider font-special shadow-xs ${stamp.color}`}>
            {stamp.text}
          </div>
        </div>

        {/* Bottom bar of front cover containing Index details, Brass Fasteners, and icons */}
        <div className="pt-2 z-20 flex justify-between items-center text-[9.5px] font-mono text-stone-700 border-t border-dashed border-[#c8b7a0]/50 mt-auto">
          <div className="flex items-center gap-1.5 pl-3">
            {/* Brass fastener rivet */}
            <div className="absolute left-4 bottom-5 w-2 h-2 rounded-full brass-fastener opacity-85 pointer-events-none shadow-sm" />
          </div>

          <div className="flex items-center gap-2">
            {project.link && (
              <ExternalLink className="w-3.5 h-3.5 text-stone-500/70" />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
