import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  increment,
  type DocumentSnapshot,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { EnrichedResource, ResourceFiltersState, PaginatedResult } from '../types/domain';

export function mapFirestoreDocToResource(
  id: string,
  data: Record<string, unknown>
): EnrichedResource {
  const title = (data.title as string) || '';
  const titleLower = (data.titleLower as string) || title.toLowerCase();
  const description = (data.description as string) || undefined;
  const resourceType = (data.resourceType as string) || (data.category_id as string) || 'notes';
  const examType = (data.examType as string) || (data.exam_type as string) || 'None';
  const academicYear = (data.academicYear as string) || (data.academic_year as string) || '';
  const unit = (data.unit as string) || 'unit_all';
  const tags = Array.isArray(data.tags) ? (data.tags as string[]) : [];
  const keywords = Array.isArray(data.keywords) ? (data.keywords as string[]) : [];

  const subjectId = (data.subjectId as string) || (data.subject_id as string) || undefined;
  const subjectName = (data.subjectName as string) || undefined;
  const courseId = (data.courseId as string) || (data.course_id as string) || undefined;
  const courseName = (data.courseName as string) || undefined;
  const departmentId = (data.departmentId as string) || (data.department_id as string) || undefined;
  const departmentName = (data.departmentName as string) || undefined;
  const universityId = (data.universityId as string) || (data.university_id as string) || undefined;
  const universityName = (data.universityName as string) || undefined;
  const semester = typeof data.semester === 'number' ? data.semester : undefined;

  const status = (data.status as 'published' | 'draft') || 'published';
  const storagePath = (data.storagePath as string) || (data.file_path as string) || '';
  const fileName = (data.fileName as string) || (data.original_filename as string) || 'document.pdf';
  const mimeType = (data.mimeType as string) || (data.mime_type as string) || 'application/pdf';
  const fileSize = typeof data.fileSize === 'number' ? data.fileSize : typeof data.file_size_bytes === 'number' ? data.file_size_bytes : 0;
  const viewsCount = typeof data.viewsCount === 'number' ? data.viewsCount : typeof data.views_count === 'number' ? data.views_count : 0;
  const downloadsCount = typeof data.downloadsCount === 'number' ? data.downloadsCount : typeof data.downloads_count === 'number' ? data.downloads_count : 0;
  const uploaderId = (data.uploaderId as string) || (data.uploader_id as string) || undefined;
  const uploaderName = (data.uploaderName as string) || undefined;
  const createdAt = (data.createdAt as string) || (data.created_at as string) || new Date().toISOString();
  const updatedAt = (data.updatedAt as string) || (data.updated_at as string) || createdAt;

  return {
    id,
    title,
    titleLower,
    description,
    resourceType,
    examType,
    academicYear,
    unit,
    tags,
    keywords,
    subjectId,
    subjectName,
    courseId,
    courseName,
    departmentId,
    departmentName,
    universityId,
    universityName,
    semester,
    status,
    storagePath,
    fileName,
    mimeType,
    fileSize,
    viewsCount,
    downloadsCount,
    uploaderId,
    uploaderName,
    createdAt,
    updatedAt,

    // Aliases for component consistency
    category_id: resourceType,
    subject_id: subjectId || null,
    course_id: courseId || null,
    department_id: departmentId || null,
    university_id: universityId || null,
    exam_type: examType,
    academic_year: academicYear,
    file_path: storagePath,
    original_filename: fileName,
    mime_type: mimeType,
    file_size_bytes: fileSize,
    views_count: viewsCount,
    downloads_count: downloadsCount,
    created_at: createdAt,
    updated_at: updatedAt,

    subject: subjectName
      ? {
          id: subjectId || '',
          name: subjectName,
          code: (data.subjectCode as string) || null,
          course: courseName
            ? {
                id: courseId || '',
                name: courseName,
                degree: (data.courseDegree as string) || null,
                department: departmentName
                  ? {
                      id: departmentId || '',
                      name: departmentName,
                    }
                  : undefined,
              }
            : undefined,
        }
      : undefined,
    category: {
      id: resourceType,
      name: resourceType.replace('_', ' ').toUpperCase(),
      slug: resourceType,
    },
    uploader: uploaderName
      ? {
          id: uploaderId || '',
          email: (data.uploaderEmail as string) || '',
          display_name: uploaderName,
        }
      : undefined,
  };
}

export async function getResources(
  filters: ResourceFiltersState = {},
  includeDrafts: boolean = false
): Promise<PaginatedResult<EnrichedResource>> {
  const page = Math.max(1, filters.page || 1);
  const pageSize = filters.pageSize || 12;

  try {
    const resourcesRef = collection(db, 'resources');

    // Build constraints
    const constraints: ReturnType<typeof where | typeof orderBy | typeof limit>[] = [];

    if (!includeDrafts) {
      constraints.push(where('status', '==', 'published'));
    }

    if (filters.category && filters.category !== 'all') {
      constraints.push(where('resourceType', '==', filters.category));
    }

    if (filters.subjectId) {
      constraints.push(where('subjectId', '==', filters.subjectId));
    }

    if (filters.courseId) {
      constraints.push(where('courseId', '==', filters.courseId));
    }

    if (filters.departmentId) {
      constraints.push(where('departmentId', '==', filters.departmentId));
    }

    // Default order by createdAt desc for optimal index usage
    constraints.push(orderBy('createdAt', 'desc'));

    const q = query(resourcesRef, ...constraints);
    const snapshot = await getDocs(q);

    let all: EnrichedResource[] = snapshot.docs.map((docSnap) =>
      mapFirestoreDocToResource(docSnap.id, docSnap.data())
    );

    // Filter in-memory for multi-attribute combinations
    if (filters.semester) {
      all = all.filter((r) => r.semester === filters.semester);
    }

    if (filters.unit && filters.unit !== 'all') {
      all = all.filter((r) => r.unit === filters.unit);
    }

    if (filters.examType && filters.examType !== 'all') {
      all = all.filter((r) => r.examType === filters.examType || r.exam_type === filters.examType);
    }

    if (filters.academicYear && filters.academicYear !== 'all') {
      all = all.filter((r) => r.academicYear === filters.academicYear || r.academic_year === filters.academicYear);
    }

    if (filters.newThisWeek) {
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      all = all.filter((r) => new Date(r.createdAt || r.created_at).getTime() >= sevenDaysAgo);
    }

    if (filters.search && filters.search.trim()) {
      const term = filters.search.trim().toLowerCase();
      all = all.filter(
        (r) =>
          (r.titleLower || r.title.toLowerCase()).includes(term) ||
          r.description?.toLowerCase().includes(term) ||
          r.subjectName?.toLowerCase().includes(term) ||
          r.courseName?.toLowerCase().includes(term) ||
          r.tags?.some((t) => t.toLowerCase().includes(term)) ||
          r.keywords?.some((k) => k.toLowerCase().includes(term))
      );
    }

    // Secondary sorting if not default newest
    if (filters.sortBy === 'oldest') {
      all.sort(
        (a, b) =>
          new Date(a.createdAt || a.created_at).getTime() -
          new Date(b.createdAt || b.created_at).getTime()
      );
    } else if (filters.sortBy === 'title') {
      all.sort((a, b) => a.title.localeCompare(b.title));
    } else if (filters.sortBy === 'downloads') {
      all.sort((a, b) => (b.downloadsCount || 0) - (a.downloadsCount || 0));
    }

    const total = all.length;
    const from = (page - 1) * pageSize;
    const paginated = all.slice(from, from + pageSize);

    return {
      data: paginated,
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  } catch (err: unknown) {
    console.error('Error fetching resources from Firestore:', err);
    throw new Error(err instanceof Error ? err.message : 'Failed to query resources.');
  }
}

export async function getResourceById(id: string): Promise<EnrichedResource | null> {
  try {
    const docRef = doc(db, 'resources', id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return mapFirestoreDocToResource(snap.id, snap.data());
  } catch (err) {
    console.error('Error fetching resource by id:', err);
    return null;
  }
}

export async function getRecentResources(limitCount: number = 8): Promise<EnrichedResource[]> {
  try {
    const q = query(
      collection(db, 'resources'),
      where('status', '==', 'published'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => mapFirestoreDocToResource(d.id, d.data()));
  } catch (err) {
    console.error('Error fetching recent resources:', err);
    return [];
  }
}

export async function getRelatedResources(
  currentResourceId: string,
  subjectId?: string | null,
  categoryId?: string | null,
  limitCount: number = 4
): Promise<EnrichedResource[]> {
  try {
    const constraints: ReturnType<typeof where | typeof orderBy | typeof limit>[] = [
      where('status', '==', 'published'),
    ];

    if (subjectId) {
      constraints.push(where('subjectId', '==', subjectId));
    } else if (categoryId) {
      constraints.push(where('resourceType', '==', categoryId));
    }

    constraints.push(orderBy('createdAt', 'desc'));
    constraints.push(limit(limitCount + 1));

    const q = query(collection(db, 'resources'), ...constraints);
    const snap = await getDocs(q);
    return snap.docs
      .filter((d) => d.id !== currentResourceId)
      .slice(0, limitCount)
      .map((d) => mapFirestoreDocToResource(d.id, d.data()));
  } catch (err) {
    console.warn('Error fetching related resources:', err);
    return [];
  }
}

export async function getMoreFromSubject(
  subjectId: string,
  excludeResourceId?: string,
  limitCount: number = 4
): Promise<EnrichedResource[]> {
  if (!subjectId) return [];
  try {
    const q = query(
      collection(db, 'resources'),
      where('status', '==', 'published'),
      where('subjectId', '==', subjectId),
      orderBy('createdAt', 'desc'),
      limit(limitCount + 1)
    );
    const snap = await getDocs(q);
    return snap.docs
      .filter((d) => d.id !== excludeResourceId)
      .slice(0, limitCount)
      .map((d) => mapFirestoreDocToResource(d.id, d.data()));
  } catch (err) {
    console.warn('Error fetching more from subject:', err);
    return [];
  }
}

export async function trackResourceView(id: string): Promise<void> {
  if (!id) return;
  try {
    const docRef = doc(db, 'resources', id);
    await updateDoc(docRef, {
      viewsCount: increment(1),
      views_count: increment(1),
    });
  } catch {
    // Non-blocking firestore write
  }
}

export async function trackResourceDownload(id: string): Promise<void> {
  if (!id) return;
  try {
    const docRef = doc(db, 'resources', id);
    await updateDoc(docRef, {
      downloadsCount: increment(1),
      downloads_count: increment(1),
    });
  } catch {
    // Non-blocking firestore write
  }
}
