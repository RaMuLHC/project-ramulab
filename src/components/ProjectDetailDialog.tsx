/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ProjectEntry, CustomPreset } from '../types';
import { X, ExternalLink, Calendar, FolderOpen, Tag, Paperclip, Clipboard, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from '../i18n';

interface ProjectDetailDialogProps {
  project: ProjectEntry | null;
  onClose: () => void;
  onDelete?: (id: string) => void;
  onUpdateStatus?: (id: string, newStatus: ProjectEntry['status']) => void;
  customPresets?: CustomPreset[];
}

export default function ProjectDetailDialog({ project, onClose, onDelete, onUpdateStatus, customPresets = [] }: ProjectDetailDialogProps) {
  const { t, localizeText } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [stampActive, setStampActive] = useState(false);

  if (!project) return null;

  const handleCopyLink = () => {
    if (project.link) {
      navigator.clipboard.writeText(project.link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getStatusColor = (status: string) => {
    const custom = customPresets.find(p => p.type === 'status' && p.key === status);
    if (custom && custom.color) return custom.color;
    switch (status) {
      case 'completed': return 'border-emerald-500 text-emerald-700 bg-emerald-50/40';
      case 'in-progress':
      case 'in-development': 
        return 'border-amber-500 text-amber-700 bg-amber-50/40';
      case 'concept': return 'border-purple-500 text-purple-700 bg-purple-50/40';
      case 'archived': return 'border-rose-500 text-rose-700 bg-rose-50/40';
      default: return 'border-stone-400 text-stone-700 bg-stone-50/40';
    }
  };

  const getCategoryLabel = (cat: string) => {
    const custom = customPresets.find(p => p.type === 'category' && p.key === cat);
    if (custom) return localizeText(custom.label);
    switch (cat) {
      case 'code': return t('card.category_code_long');
      case 'design': return t('card.category_design_long');
      case 'research': return t('card.category_research_long');
      case 'lab': return t('card.category_lab_long');
      case 'writing': return t('card.category_writing_long');
      default: return cat.toUpperCase();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/80 backdrop-blur-xs overflow-y-auto">
        {/* Backdrop cover click to close */}
        <div className="absolute inset-0" onClick={onClose} />

        {/* The Manila Folder Container */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="relative w-full max-w-2xl bg-[#f0e2d0] border-[3px] border-[#c0ab95] rounded-sm shadow-2xl p-1 md:p-2 z-10 overflow-hidden"
          id="project-detail-folder"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Authentic Folder Tab Label on Top */}
          <div className="absolute top-0 left-8 h-6 bg-[#ecd9c1] border-x border-b border-[#c0ab95] px-4 text-[9px] font-mono font-bold text-kraft-700 select-none tracking-wider uppercase flex items-center gap-1 rounded-b-sm">
            <FolderOpen className="w-3 h-3 text-kraft-500" />
            CATALOG CARD // ID: {project.id}
          </div>

          <div className="bg-[#FAF2E5] paper-noise border border-[#dfccb7] p-6 pt-10 rounded-xs relative">
            {/* Watermark grids */}
            <div className="absolute inset-0 ledger-grid opacity-[0.2] pointer-events-none" />

            {/* Brass fasteners on margins mimicking authentic folders */}
            <div className="absolute left-6 top-8 w-2.5 h-2.5 rounded-full copper-fastener select-none" />
            <div className="absolute right-6 top-8 w-2.5 h-2.5 rounded-full copper-fastener select-none" />

            {/* Folder Header Metadata */}
            <div className="flex flex-col md:flex-row md:items-start justify-between border-b-2 border-dashed border-[#d5c3ac] pb-5 mb-5 mt-2">
              <div>
                <span className="inline-block px-2 py-0.5 bg-kraft-100 text-kraft-800 border border-kraft-300 font-mono text-[9px] tracking-widest uppercase mb-1.5 font-bold">
                  BOX // {project.archiveNo}
                </span>
                <h2 className="font-serif text-2xl font-black text-kraft-900 tracking-tight leading-snug">
                  {localizeText(project.title)}
                </h2>
                <p className="font-typewriter text-xs text-kraft-700 italic mt-0.5 font-semibold">
                  {localizeText(project.subtitle)}
                </p>
              </div>

              <div className="mt-4 md:mt-0 text-left md:text-right font-mono text-[10px] text-kraft-700/80 space-y-1">
                <div className="flex items-center gap-1 md:justify-end">
                  <Calendar className="w-3 h-3 text-kraft-500" />
                  <span>{t('detail.deposit_date')} <strong className="font-semibold text-kraft-900">{project.date}</strong></span>
                </div>
                <div className="flex items-center gap-1 md:justify-end">
                  <Tag className="w-3 h-3 text-kraft-500" />
                  <span>{t('detail.grouping')} <strong className="font-semibold uppercase text-kraft-900">{localizeText(getCategoryLabel(project.category))}</strong></span>
                </div>
              </div>
            </div>

            {/* Scrollable Dossier Content written in Typewriter font */}
            <div className="max-h-[350px] overflow-y-auto pr-2 mb-6 font-typewriter text-xs leading-relaxed text-stone-800 border-b border-[#dfccb7] pb-5">
              <pre className="whitespace-pre-wrap font-sans leading-relaxed break-words bg-[#f6ebd9]/50 p-4 border border-kraft-200 rounded-sm">
                {localizeText(project.content)}
              </pre>

              {/* Tags Index line */}
              <div className="mt-5 flex flex-wrap gap-1.5 items-center">
                <span className="font-mono text-[9px] font-bold text-kraft-600 mr-1 uppercase">{t('detail.tag_cross_refs')}</span>
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="font-mono text-[10px] bg-stone-100 text-stone-700 border border-stone-200 px-1.5 py-0.5 rounded-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Section for Attachments */}
            {project.attachments && project.attachments.length > 0 && (
              <div className="mb-6 p-3 bg-kraft-100/50 border border-kraft-300/60 rounded-xs">
                <h4 className="font-mono text-[10px] font-black text-kraft-800 flex items-center gap-1 uppercase mb-2">
                  <Paperclip className="w-3.5 h-3.5 text-kraft-600" />
                  {t('detail.attachments_title')}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {project.attachments.map((file) => (
                    <div
                      key={file}
                      className="flex items-center gap-1.5 px-2 py-1 bg-[#FAF2E5] border border-kraft-300/40 text-[10px] font-mono text-kraft-800 rounded-sm hover:border-kraft-400 select-all"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-kraft-300"></span>
                      <span>{file}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dialog Footer Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
              <div className="flex flex-wrap items-center gap-2">
                {project.link && (
                  <a
                    href={project.link}
                    target="_blank"
                    referrerPolicy="no-referrer"
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-kraft-700 text-[#fbf8f3] hover:bg-kraft-800 font-mono text-xs font-semibold rounded-xs shadow-sm transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    {t('detail.demo_link')}
                  </a>
                )}
                
                {project.link && (
                  <button
                    onClick={handleCopyLink}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-kraft-800 hover:bg-amber-100/80 border border-kraft-300/80 font-mono text-xs rounded-xs transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{t('detail.copied')}</span>
                      </>
                    ) : (
                      <>
                        <Clipboard className="w-3.5 h-3.5" />
                        <span>{t('detail.copy_link')}</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {onUpdateStatus && (
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-[9px] text-kraft-600 font-bold uppercase mr-1">{t('detail.change_status')}</span>
                    <select
                      value={project.status}
                      onChange={(e) => onUpdateStatus(project.id, e.target.value as ProjectEntry['status'])}
                      className="font-mono text-[10px] bg-[#FAF2E5] border border-kraft-300 text-kraft-800 rounded-sm px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-kraft-500"
                    >
                      {customPresets.filter(p => p.type === 'status').length > 0 ? (
                        customPresets.filter(p => p.type === 'status').map(p => (
                          <option key={p.key} value={p.key}>{localizeText(p.label)}</option>
                        ))
                      ) : (
                        <>
                          <option value="completed">{t('card.status_completed_stamp_long')}</option>
                          <option value="in-progress">{t('card.status_inprogress_stamp_long')}</option>
                          <option value="concept">{t('card.status_concept_stamp_long')}</option>
                          <option value="archived">{t('card.status_archived_stamp_long')}</option>
                        </>
                      )}
                    </select>
                  </div>
                )}

                {onDelete && (
                  <button
                    onClick={() => {
                      if (confirm(t('detail.shred_confirm'))) {
                        onDelete(project.id);
                        onClose();
                      }
                    }}
                    className="px-2.5 py-1 text-rose-700 hover:bg-rose-50 border border-rose-300/40 rounded-sm font-mono text-[10px] transition-colors"
                  >
                    {t('detail.shred_card')}
                  </button>
                )}

                <button
                  onClick={onClose}
                  className="px-3 py-1.5 bg-stone-200 hover:bg-stone-300 border border-stone-400/40 rounded-xs font-mono text-xs text-stone-800 transition-colors"
                >
                  {t('detail.close_folder')}
                </button>
              </div>
            </div>

            {/* Absolute close button on the top-right corner */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 text-kraft-600 hover:text-kraft-900 border border-transparent hover:border-kraft-300/50 rounded-sm transition-all bg-transparent"
              title="Close Archive"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
