/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ProjectStatus = 'completed' | 'in-progress' | 'concept' | 'archived' | string;

export type ProjectCategory = 'code' | 'design' | 'research' | 'lab' | 'writing' | string;

export interface ProjectEntry {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  content: string; // The inside "full document sheet" text
  status: ProjectStatus;
  category: ProjectCategory;
  date: string; // Ledger-style date e.g. "1998.05.12"
  archiveNo: string; // Vintage index card designation e.g. "BOX-901-C"
  tags: string[];
  link?: string; // Optional URL for domain/demo
  attachments?: string[]; // Files attached e.g. ["INDEX.SQR", "CONFIG.SYS"]
}

export interface ArchiveStats {
  total: number;
  completed: number;
  inProgress: number;
  concepts: number;
  archived: number;
}

export interface CustomPreset {
  type: 'category' | 'status';
  key: string;
  label: string;
  filterLabel?: string;
  color?: string;
}
