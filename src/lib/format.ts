import { RESOURCE_TYPES, EXAM_TYPES } from '../config/constants';

export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return formatDate(dateString);
  } catch {
    return dateString;
  }
}

export function formatCategory(categoryId: string): string {
  const match = RESOURCE_TYPES.find((r) => r.id === categoryId);
  return match ? match.label : categoryId;
}

export function formatCategoryShort(categoryId: string): string {
  const match = RESOURCE_TYPES.find((r) => r.id === categoryId);
  return match ? match.shortLabel : categoryId;
}

export function formatExamType(typeId: string): string {
  const match = EXAM_TYPES.find((e) => e.id === typeId);
  return match ? match.label : typeId;
}

export function formatSemester(sem?: number | null): string {
  if (!sem) return 'General Curriculum';
  const ordinal = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'][sem - 1] || `${sem}th`;
  return `Semester ${sem} (${ordinal})`;
}

export function formatUnit(unit?: string | null): string {
  if (!unit) return 'Curriculum';
  if (unit === 'unit_all') return 'Full Syllabus';
  const num = unit.replace('unit_', '');
  return `Unit ${num}`;
}
