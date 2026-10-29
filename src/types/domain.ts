export interface FirestoreResource {
  id: string;
  title: string;
  titleLower: string;
  description?: string;
  resourceType: string;
  examType?: string;
  academicYear?: string;
  unit?: string;
  tags?: string[];
  keywords: string[];
  subjectId?: string;
  subjectName?: string;
  courseId?: string;
  courseName?: string;
  departmentId?: string;
  departmentName?: string;
  universityId?: string;
  universityName?: string;
  semester?: number;
  status: 'published' | 'draft';
  storagePath: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  viewsCount?: number;
  downloadsCount?: number;
  uploaderId?: string;
  uploaderName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FirestoreSubject {
  id: string;
  name: string;
  nameLower: string;
  code?: string | null;
  courseId?: string | null;
  semester?: number | null;
  syllabus_description?: string | null;
  createdAt: string;
  createdBy?: string | null;
}

export interface FirestoreCourse {
  id: string;
  name: string;
  nameLower: string;
  code?: string | null;
  degree?: string | null;
  departmentId?: string | null;
  total_semesters?: number | null;
  createdAt: string;
  createdBy?: string | null;
}

export interface FirestoreDepartment {
  id: string;
  name: string;
  nameLower: string;
  code?: string | null;
  description?: string | null;
  createdAt: string;
  createdBy?: string | null;
}

export interface FirestoreUniversity {
  id: string;
  name: string;
  nameLower: string;
  short_code?: string | null;
  country?: string | null;
  createdAt: string;
  createdBy?: string | null;
}

export interface FirestoreCategory {
  id: string;
  name: string;
  nameLower: string;
  slug?: string | null;
  sort_order?: number | null;
  createdAt: string;
  createdBy?: string | null;
}


export interface EnrichedResource extends Partial<FirestoreResource> {
  id: string;
  title: string;
  titleLower?: string;
  resourceType?: string;
  createdAt?: string;
  updatedAt?: string;
  status: 'published' | 'draft';
  // Compatibility aliases for UI consistency
  category_id: string;
  subject_id?: string | null;
  course_id?: string | null;
  department_id?: string | null;
  university_id?: string | null;
  exam_type: string;
  academic_year: string;
  file_path: string;
  original_filename: string;
  mime_type: string;
  file_size_bytes: number;
  views_count: number;
  downloads_count: number;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  subject?: {
    id: string;
    name: string;
    code?: string | null;
    course?: {
      id: string;
      name: string;
      degree?: string | null;
      code?: string | null;
      department?: {
        id: string;
        name: string;
      };
    };
  };
  category?: {
    id: string;
    name: string;
    slug?: string;
  };
  uploader?: {
    id: string;
    email: string;
    display_name?: string | null;
  };
}

export interface ResourceFiltersState {
  search?: string;
  category?: string;
  subjectId?: string;
  courseId?: string;
  departmentId?: string;
  universityId?: string;
  semester?: number;
  unit?: string;
  examType?: string;
  academicYear?: string;
  sortBy?: 'newest' | 'oldest' | 'title' | 'downloads';
  newThisWeek?: boolean;
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AdminStats {
  totalResources: number;
  publishedResources: number;
  draftResources: number;
  totalViews: number;
  totalDownloads: number;
  totalSizeBytes: number;
  byCategory: { categoryId: string; name: string; count: number }[];
  byExamType: { examType: string; count: number }[];
  recentUploads: EnrichedResource[];
}

export interface ExamCountdownItem {
  id: string;
  examName: string;
  courseCode: string;
  targetDate: string; // ISO string
  notes?: string;
  createdAt: string;
}

export interface StudyShortlistItem {
  id: string;
  resourceId: string;
  title: string;
  subjectName: string;
  categoryLabel: string;
  reviewed: boolean;
  notes?: string;
  addedAt: string;
}
