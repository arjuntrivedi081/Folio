import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  getCountFromServer,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { uploadResourceFile, deleteResourceFile } from './storage.service';
import { mapFirestoreDocToResource } from './resources.service';
import type { AdminStats, EnrichedResource } from '../types/domain';
import type { ResourceFormValues } from '../lib/validation';

function formatFirebaseError(err: unknown): string {
  if (err instanceof Error) {
    const msg = err.message;
    if (msg.includes('permission-denied') || msg.includes('PERMISSION_DENIED')) {
      return 'Operation rejected by database rules.';
    }
    if (msg.includes('not-found') || msg.includes('NOT_FOUND')) {
      return 'Requested resource document was not found in Firestore.';
    }
    return msg;
  }
  return String(err);
}

function buildKeywords(title: string, tags: string[], subjectName?: string): string[] {
  const set = new Set<string>();
  const add = (text?: string) => {
    if (!text) return;
    text
      .toLowerCase()
      .split(/[\s,._\-/]+/)
      .forEach((token) => {
        const clean = token.replace(/[^a-z0-9]/g, '');
        if (clean.length >= 2) set.add(clean);
      });
  };
  add(title);
  tags.forEach(add);
  add(subjectName);
  return Array.from(set);
}

export async function fetchAdminStats(): Promise<AdminStats> {
  try {
    const resourcesCol = collection(db, 'resources');

    // Aggregate counts strictly via getCountFromServer
    const [totalSnap, pubSnap, draftSnap, recentSnap] = await Promise.all([
      getCountFromServer(resourcesCol),
      getCountFromServer(query(resourcesCol, where('status', '==', 'published'))),
      getCountFromServer(query(resourcesCol, where('status', '==', 'draft'))),
      getDocs(query(resourcesCol, orderBy('createdAt', 'desc'), limit(6))),
    ]);

    const totalResources = totalSnap.data().count;
    const publishedResources = pubSnap.data().count;
    const draftResources = draftSnap.data().count;

    const recentUploads: EnrichedResource[] = recentSnap.docs.map((d) =>
      mapFirestoreDocToResource(d.id, d.data())
    );

    const totalViews = recentUploads.reduce((acc, r) => acc + (r.viewsCount || 0), 0);
    const totalDownloads = recentUploads.reduce((acc, r) => acc + (r.downloadsCount || 0), 0);
    const totalSizeBytes = recentUploads.reduce((acc, r) => acc + (r.fileSize || 0), 0);

    const catMap: Record<string, number> = {};
    recentUploads.forEach((r) => {
      const catKey = r.resourceType || r.category_id || 'notes';
      catMap[catKey] = (catMap[catKey] || 0) + 1;
    });

    const byCategory = Object.entries(catMap).map(([categoryId, count]) => ({
      categoryId,
      name: categoryId.replace('_', ' ').toUpperCase(),
      count,
    }));

    const examMap: Record<string, number> = {};
    recentUploads.forEach((r) => {
      if (r.examType && r.examType !== 'None') {
        examMap[r.examType] = (examMap[r.examType] || 0) + 1;
      }
    });

    const byExamType = Object.entries(examMap).map(([examType, count]) => ({
      examType,
      count,
    }));

    return {
      totalResources,
      publishedResources,
      draftResources,
      totalViews,
      totalDownloads,
      totalSizeBytes,
      byCategory,
      byExamType,
      recentUploads,
    };
  } catch (err) {
    throw new Error(formatFirebaseError(err));
  }
}

export async function createAdminResource(
  formValues: ResourceFormValues,
  file: File,
  _userId?: string | null,
  onProgress?: (p: number) => void,
  cancelRef?: { current: (() => void) | null }
): Promise<EnrichedResource> {
  // Step 1: Upload file to Firebase Storage
  const uploadResult = await uploadResourceFile(file, onProgress, cancelRef);

  try {
    const tagsArray = formValues.tags
      ? formValues.tags
          .split(',')
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean)
      : [];

    let subjectName: string | undefined;
    let courseName: string | undefined;
    let departmentName: string | undefined;
    let universityName: string | undefined;

    // Fetch taxonomy names for denormalization if IDs are provided
    if (formValues.subjectId) {
      try {
        const subSnap = await getDoc(doc(db, 'subjects', formValues.subjectId));
        if (subSnap.exists()) {
          const subData = subSnap.data();
          subjectName = subData.name;
        }
      } catch {
        // Non-blocking
      }
    }
    if (formValues.courseId) {
      try {
        const cSnap = await getDoc(doc(db, 'courses', formValues.courseId));
        if (cSnap.exists()) courseName = cSnap.data().name;
      } catch {
        // Non-blocking
      }
    }
    if (formValues.departmentId) {
      try {
        const dSnap = await getDoc(doc(db, 'departments', formValues.departmentId));
        if (dSnap.exists()) departmentName = dSnap.data().name;
      } catch {
        // Non-blocking
      }
    }
    if (formValues.universityId) {
      try {
        const uSnap = await getDoc(doc(db, 'universities', formValues.universityId));
        if (uSnap.exists()) universityName = uSnap.data().name;
      } catch {
        // Non-blocking
      }
    }

    const title = formValues.title.trim();
    const titleLower = title.toLowerCase();
    const keywords = buildKeywords(title, tagsArray, subjectName);
    const now = new Date().toISOString();

    const resourceData: Record<string, unknown> = {
      title,
      titleLower,
      description: formValues.description ? formValues.description.trim() : null,
      resourceType: formValues.categoryId,
      examType: formValues.examType || 'None',
      academicYear: formValues.academicYear || '',
      unit: formValues.unit || 'unit_all',
      tags: tagsArray,
      keywords,
      subjectId: formValues.subjectId || null,
      subjectName: subjectName || null,
      courseId: formValues.courseId || null,
      courseName: courseName || null,
      departmentId: formValues.departmentId || null,
      departmentName: departmentName || null,
      universityId: formValues.universityId || null,
      universityName: universityName || null,
      semester: formValues.semester ? Number(formValues.semester) : null,
      status: formValues.status || 'published',
      storagePath: uploadResult.filePath,
      fileName: uploadResult.originalFilename,
      mimeType: uploadResult.mimeType,
      fileSize: uploadResult.fileSizeBytes,
      viewsCount: 0,
      downloadsCount: 0,
      uploaderId: null,
      uploaderName: 'Administrator',
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(collection(db, 'resources'), resourceData);
    return mapFirestoreDocToResource(docRef.id, resourceData);
  } catch (err: unknown) {
    // Graceful rollback: delete orphaned storage object if firestore document write fails
    try {
      await deleteResourceFile(uploadResult.filePath);
    } catch {
      // Non-blocking
    }
    throw new Error(formatFirebaseError(err));
  }
}

export async function updateAdminResource(
  resourceId: string,
  formValues: ResourceFormValues,
  newFile?: File | null
): Promise<EnrichedResource> {
  let oldFilePathToClean: string | null = null;
  let newStoragePath: string | undefined;
  let newOriginalFilename: string | undefined;
  let newMimeType: string | undefined;
  let newFileSize: number | undefined;

  if (newFile) {
    const existingSnap = await getDoc(doc(db, 'resources', resourceId));
    if (existingSnap.exists()) {
      const data = existingSnap.data();
      oldFilePathToClean = (data.storagePath as string) || (data.file_path as string) || null;
    }

    const uploadResult = await uploadResourceFile(newFile);
    newStoragePath = uploadResult.filePath;
    newOriginalFilename = uploadResult.originalFilename;
    newMimeType = uploadResult.mimeType;
    newFileSize = uploadResult.fileSizeBytes;
  }

  const tagsArray = formValues.tags
    ? formValues.tags
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean)
    : [];

  const title = formValues.title.trim();
  const titleLower = title.toLowerCase();
  const keywords = buildKeywords(title, tagsArray);
  const now = new Date().toISOString();

  const updateData: Record<string, unknown> = {
    title,
    titleLower,
    description: formValues.description ? formValues.description.trim() : null,
    resourceType: formValues.categoryId,
    subjectId: formValues.subjectId || null,
    courseId: formValues.courseId || null,
    departmentId: formValues.departmentId || null,
    universityId: formValues.universityId || null,
    semester: formValues.semester ? Number(formValues.semester) : null,
    unit: formValues.unit || 'unit_all',
    examType: formValues.examType || 'None',
    academicYear: formValues.academicYear || '',
    status: formValues.status,
    tags: tagsArray,
    keywords,
    updatedAt: now,
  };

  if (newStoragePath) {
    updateData.storagePath = newStoragePath;
    updateData.fileName = newOriginalFilename;
    updateData.mimeType = newMimeType;
    updateData.fileSize = newFileSize;
  }

  try {
    const docRef = doc(db, 'resources', resourceId);
    await updateDoc(docRef, updateData);

    if (oldFilePathToClean) {
      try {
        await deleteResourceFile(oldFilePathToClean);
      } catch {
        // Non-blocking
      }
    }

    const finalSnap = await getDoc(docRef);
    return mapFirestoreDocToResource(resourceId, finalSnap.data() || updateData);
  } catch (err) {
    if (newStoragePath) {
      try {
        await deleteResourceFile(newStoragePath);
      } catch {
        // Non-blocking
      }
    }
    throw new Error(formatFirebaseError(err));
  }
}

export async function toggleResourcePublish(
  resourceId: string,
  newStatus: 'draft' | 'published'
): Promise<void> {
  try {
    const docRef = doc(db, 'resources', resourceId);
    await updateDoc(docRef, {
      status: newStatus,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    throw new Error(formatFirebaseError(err));
  }
}

export async function deleteAdminResource(
  resourceId: string,
  filePath: string
): Promise<void> {
  try {
    // 1. Delete document from Firestore
    await deleteDoc(doc(db, 'resources', resourceId));

    // 2. Delete file from Storage
    if (filePath) {
      await deleteResourceFile(filePath);
    }
  } catch (err) {
    throw new Error(formatFirebaseError(err));
  }
}
