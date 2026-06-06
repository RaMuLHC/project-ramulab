/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ProjectEntry, ProjectCategory, ProjectStatus } from '../types';
import { X, Save, FolderPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from '../i18n';

interface AddProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newProject: ProjectEntry) => void;
}

export default function AddProjectDialog({ isOpen, onClose, onSave }: AddProjectDialogProps) {
  const { t } = useTranslation();
  // Generate random vintage archive number for style e.g. "BOX-482-K"
  const generateRetroArchiveNo = () => {
    const boxNum = Math.floor(Math.random() * 899) + 100;
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const randChar = chars[Math.floor(Math.random() * chars.length)];
    return `BOX-${boxNum}-${randChar}`;
  };

  const getTodayFormatted = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}.${mm}.${dd}`;
  };

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState<ProjectCategory>('code');
  const [status, setStatus] = useState<ProjectStatus>('in-progress');
  const [date, setDate] = useState(getTodayFormatted());
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [link, setLink] = useState('');
  const [attachmentsInput, setAttachmentsInput] = useState('');
  const [archiveNo, setArchiveNo] = useState(generateRetroArchiveNo());
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim() || !content.trim()) {
      setErrorMsg(t('add_dialog.error_missing_fields'));
      return;
    }

    // Process tags (comma-separated list)
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    // Process attachments
    const attachments = attachmentsInput
      .split(',')
      .map((a) => a.trim())
      .filter((a) => a.length > 0);

    const newProject: ProjectEntry = {
      id: `proj-${Date.now()}`,
      title: title.trim(),
      subtitle: subtitle.trim() || t('add_dialog.subtitle_default'),
      category,
      status,
      date,
      description: description.trim(),
      content: content.trim(),
      tags: tags.length > 0 ? tags : ['General'],
      link: link.trim() || undefined,
      attachments: attachments.length > 0 ? attachments : undefined,
      archiveNo: archiveNo || generateRetroArchiveNo()
    };

    onSave(newProject);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setTitle('');
    setSubtitle('');
    setCategory('code');
    setStatus('in-progress');
    setDate(getTodayFormatted());
    setDescription('');
    setContent('');
    setTagsInput('');
    setLink('');
    setAttachmentsInput('');
    setArchiveNo(generateRetroArchiveNo());
    setErrorMsg('');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-xs overflow-y-auto">
        {/* Backdrop close */}
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="relative w-full max-w-2xl bg-[#eedec7] border-[3px] border-[#a08b75] rounded-sm shadow-2xl p-1 md:p-2 z-10 overflow-hidden"
          id="add-project-cabinet"
        >
          {/* Catalog title label tab */}
          <div className="absolute top-0 left-8 h-6 bg-[#ecd9c1] border-x border-b border-[#a08b75] px-4 text-[9px] font-mono font-bold text-kraft-800 uppercase flex items-center gap-1">
            <FolderPlus className="w-3.5 h-3.5 text-kraft-600 animate-pulse" />
            {t('add_dialog.new_deposit_title')}
          </div>

          <form onSubmit={handleSubmit} className="bg-[#FAF2E5] paper-noise border border-[#dfccb7] p-6 pt-10 rounded-xs relative">
            <div className="absolute inset-0 ledger-grid opacity-20 pointer-events-none" />

            <h3 className="font-serif text-xl font-bold text-kraft-900 border-b border-dashed border-[#dfccb7] pb-3 mb-4 flex justify-between items-center">
              <span>{t('add_dialog.record_new_folder')}</span>
              <span className="font-mono text-xs text-kraft-600 bg-kraft-100 border border-kraft-300 px-2 py-0.5 rounded-sm">
                CODE: {archiveNo}
              </span>
            </h3>

            {errorMsg && (
              <div className="mb-4 p-2.5 bg-rose-50 border border-rose-300 text-rose-800 text-xs font-mono rounded-sm">
                ⚠️ {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {/* Project Title (Chinese preferred) */}
              <div>
                <label className="block text-[11px] font-mono font-black text-kraft-800 uppercase mb-1">
                  {t('add_dialog.title_label')}
                </label>
                <input
                  type="text"
                  required
                  placeholder={t('add_dialog.title_placeholder')}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#FAF2E5] border border-kraft-400/60 rounded-xs font-typewriter text-xs text-stone-800 placeholder-kraft-600/40 focus:outline-none focus:border-kraft-600"
                />
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-[11px] font-mono font-black text-kraft-800 uppercase mb-1">
                  {t('add_dialog.subtitle_label')}
                </label>
                <input
                  type="text"
                  placeholder={t('add_dialog.subtitle_placeholder')}
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#FAF2E5] border border-kraft-400/60 rounded-xs font-typewriter text-xs text-stone-800 placeholder-kraft-600/40 focus:outline-none focus:border-kraft-600"
                />
              </div>

              {/* Category selector */}
              <div>
                <label className="block text-[11px] font-mono font-black text-kraft-800 uppercase mb-1">
                  {t('add_dialog.category_label')}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ProjectCategory)}
                  className="w-full px-3 py-1.5 bg-[#FAF2E5] border border-kraft-400/60 rounded-xs font-mono text-xs text-stone-800 focus:outline-none focus:border-kraft-600 cursor-pointer"
                >
                  <option value="code">{t('add_dialog.cat_code')}</option>
                  <option value="design">{t('add_dialog.cat_design')}</option>
                  <option value="research">{t('add_dialog.cat_research')}</option>
                  <option value="lab">{t('add_dialog.cat_lab')}</option>
                  <option value="writing">{t('add_dialog.cat_writing')}</option>
                </select>
              </div>

              {/* Status selector */}
              <div>
                <label className="block text-[11px] font-mono font-black text-kraft-800 uppercase mb-1">
                  {t('add_dialog.status_label')}
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                  className="w-full px-3 py-1.5 bg-[#FAF2E5] border border-kraft-400/60 rounded-xs font-mono text-xs text-stone-800 focus:outline-none focus:border-kraft-600 cursor-pointer"
                >
                  <option value="completed">{t('add_dialog.status_completed')}</option>
                  <option value="in-progress">{t('add_dialog.status_inprogress')}</option>
                  <option value="concept">{t('add_dialog.status_concept')}</option>
                  <option value="archived">{t('add_dialog.status_archived')}</option>
                </select>
              </div>

              {/* Log Date (Taiwan Ledger Style) */}
              <div>
                <label className="block text-[11px] font-mono font-black text-kraft-800 uppercase mb-1">
                  {t('add_dialog.record_date_label')}
                </label>
                <input
                  type="text"
                  placeholder="yyyy.mm.dd"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#FAF2E5] border border-kraft-400/60 rounded-xs font-mono text-xs text-stone-800 focus:outline-none focus:border-kraft-600"
                />
              </div>

              {/* Project live link */}
              <div>
                <label className="block text-[11px] font-mono font-black text-kraft-800 uppercase mb-1">
                  {t('add_dialog.demo_link_label')}
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#FAF2E5] border border-kraft-400/60 rounded-xs font-mono text-xs text-stone-800 placeholder-kraft-600/40 focus:outline-none focus:border-kraft-600"
                />
              </div>
            </div>

            {/* Description Short */}
            <div className="mb-4">
              <label className="block text-[11px] font-mono font-black text-kraft-800 uppercase mb-1">
                {t('add_dialog.short_summary_label')}
              </label>
              <input
                type="text"
                required
                placeholder={t('add_dialog.short_summary_placeholder')}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-1.5 bg-[#FAF2E5] border border-kraft-400/60 rounded-xs font-typewriter text-xs text-stone-800 placeholder-kraft-600/40 focus:outline-none focus:border-kraft-600"
              />
            </div>

            {/* Detailed Content */}
            <div className="mb-4">
              <label className="block text-[11px] font-mono font-black text-kraft-800 uppercase mb-1 flex justify-between">
                <span>{t('add_dialog.detailed_report_label')}</span>
                <span className="text-[9px] text-kraft-500 font-normal">{t('add_dialog.formatting_hint')}</span>
              </label>
              <textarea
                required
                rows={5}
                placeholder={t('add_dialog.detailed_report_placeholder')}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF2E5]/70 border border-kraft-400/60 rounded-xs font-typewriter text-xs text-stone-800 placeholder-kraft-600/40 focus:outline-none focus:border-kraft-600 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {/* Tags comma-separated */}
              <div>
                <label className="block text-[11px] font-mono font-black text-kraft-800 uppercase mb-1">
                  {t('add_dialog.tags_label')}
                </label>
                <input
                  type="text"
                  placeholder={t('add_dialog.tags_placeholder')}
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#FAF2E5] border border-kraft-400/60 rounded-xs font-mono text-xs text-stone-800 placeholder-kraft-600/40 focus:outline-none focus:border-kraft-600"
                />
              </div>

              {/* Attachments comma-separated */}
              <div>
                <label className="block text-[11px] font-mono font-black text-kraft-800 uppercase mb-1">
                  {t('add_dialog.attachments_label')}
                </label>
                <input
                  type="text"
                  placeholder={t('add_dialog.attachments_placeholder')}
                  value={attachmentsInput}
                  onChange={(e) => setAttachmentsInput(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#FAF2E5] border border-kraft-400/60 rounded-xs font-mono text-xs text-stone-800 placeholder-kraft-600/40 focus:outline-none focus:border-kraft-600"
                />
              </div>
            </div>

            {/* Form submission button bar */}
            <div className="flex justify-between items-center pt-3 border-t border-dashed border-kraft-400/40">
              <button
                type="button"
                onClick={() => {
                  setArchiveNo(generateRetroArchiveNo());
                }}
                className="px-2.5 py-1 text-kraft-700 hover:text-kraft-950 border border-kraft-300 rounded-sm font-mono text-[10px] transition-all bg-transparent"
                title="Regenerate Catalog Tag"
              >
                {t('add_dialog.change_code')}
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-1.5 bg-stone-200 hover:bg-stone-300 border border-stone-400/50 rounded-xs font-mono text-xs text-stone-800 transition-colors cursor-pointer"
                >
                  {t('add_dialog.cancel')}
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1 px-5 py-1.5 bg-kraft-700 text-[#fbf8f3] hover:bg-kraft-800 font-mono text-xs font-bold rounded-xs shadow-md transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  {t('add_dialog.save_card')}
                </button>
              </div>
            </div>

            {/* Close button cross */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 text-kraft-600 hover:text-[#381f12] rounded-sm transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
