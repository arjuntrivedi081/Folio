export const RESOURCE_TYPES = [
  { id: 'notes', label: 'Lecture Notes', shortLabel: 'Notes', description: 'Curated unit-by-unit syllabus notes' },
  { id: 'mst_papers', label: 'MST Question Papers', shortLabel: 'MST Papers', description: 'Mid-semester tests & internal papers' },
  { id: 'est_papers', label: 'EST Question Papers', shortLabel: 'EST Papers', description: 'End-semester university exam papers' },
  { id: 'practical_papers', label: 'Practical Papers', shortLabel: 'Practical Papers', description: 'Lab practical test papers and evaluation sheets' },
  { id: 'assignments', label: 'Assignments', shortLabel: 'Assignments', description: 'Graded problem sets and analytical tasks' },
  { id: 'lab_manuals', label: 'Lab Manuals', shortLabel: 'Lab Manuals', description: 'Experimental procedures and observation guides' },
  { id: 'viva_questions', label: 'Viva Questions', shortLabel: 'Viva Questions', description: 'Oral examination oral questions and concise answers' },
  { id: 'previous_year_papers', label: 'Previous-Year Papers', shortLabel: 'PYQ Papers', description: 'Multi-year archive of question papers' },
] as const;

export type ResourceTypeId = (typeof RESOURCE_TYPES)[number]['id'];

export const EXAM_TYPES = [
  { id: 'MST-1', label: 'MST-1 (First Mid-Term)' },
  { id: 'MST-2', label: 'MST-2 (Second Mid-Term)' },
  { id: 'EST', label: 'EST (End-Semester Exam)' },
  { id: 'Practical', label: 'Practical / Lab Exam' },
  { id: 'Internal', label: 'Internal Assessment' },
  { id: 'None', label: 'Not Applicable' },
] as const;

export type ExamTypeId = (typeof EXAM_TYPES)[number]['id'];

export const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8] as const;

export const UNITS = [
  { id: 'unit_all', label: 'All Units (Full Syllabus)' },
  { id: 'unit_1', label: 'Unit 1' },
  { id: 'unit_2', label: 'Unit 2' },
  { id: 'unit_3', label: 'Unit 3' },
  { id: 'unit_4', label: 'Unit 4' },
  { id: 'unit_5', label: 'Unit 5' },
] as const;

export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.webp'] as const;

export const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

export const FIREBASE_STORAGE_FOLDER = 'resources';
