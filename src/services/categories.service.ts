import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type {
  FirestoreCategory,
  FirestoreDepartment,
  FirestoreCourse,
  FirestoreSubject,
  FirestoreUniversity,
} from '../types/domain';

export type Category = FirestoreCategory & {
  sort_order?: number;
  slug?: string;
};
export type Department = FirestoreDepartment & {
  code?: string;
  description?: string | null;
  short_code?: string;
};
export type Course = FirestoreCourse & {
  code?: string;
  department_id?: string | null;
  total_semesters?: number;
};
export type Subject = FirestoreSubject & {
  course_id?: string | null;
  semester?: number | null;
  syllabus_description?: string | null;
};
export type University = FirestoreUniversity & {
  short_code?: string;
  country?: string;
};

// Default seed categories if empty
const DEFAULT_CATEGORIES: { id: string; name: string; slug: string; sort_order: number }[] = [
  { id: 'notes', name: 'Lecture Notes', slug: 'notes', sort_order: 1 },
  { id: 'past_papers', name: 'Past Question Papers', slug: 'past_papers', sort_order: 2 },
  { id: 'syllabus', name: 'Syllabus & Curriculum', slug: 'syllabus', sort_order: 3 },
  { id: 'lab_manuals', name: 'Lab Manuals & Reports', slug: 'lab_manuals', sort_order: 4 },
  { id: 'assignments', name: 'Assignments & Tutorials', slug: 'assignments', sort_order: 5 },
];

export async function fetchCategories(): Promise<Category[]> {
  try {
    const q = query(collection(db, 'categories'), orderBy('name', 'asc'));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return DEFAULT_CATEGORIES.map((c) => ({
        id: c.id,
        name: c.name,
        nameLower: c.name.toLowerCase(),
        slug: c.slug,
        sort_order: c.sort_order,
        createdAt: new Date().toISOString(),
      }));
    }
    return snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.name || '',
        nameLower: data.nameLower || (data.name ? data.name.toLowerCase() : ''),
        slug: data.slug || docSnap.id,
        sort_order: data.sort_order || 0,
        createdAt: data.createdAt || new Date().toISOString(),
        createdBy: data.createdBy,
      };
    });
  } catch (err) {
    console.error('Error fetching categories from Firestore:', err);
    // Return default categories so UI functions even before custom categories are added
    return DEFAULT_CATEGORIES.map((c) => ({
      id: c.id,
      name: c.name,
      nameLower: c.name.toLowerCase(),
      slug: c.slug,
      sort_order: c.sort_order,
      createdAt: new Date().toISOString(),
    }));
  }
}

export async function fetchUniversities(): Promise<University[]> {
  try {
    const q = query(collection(db, 'universities'), orderBy('name', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        name: data.name || '',
        nameLower: data.nameLower || '',
        short_code: data.short_code || '',
        country: data.country || '',
        createdAt: data.createdAt || new Date().toISOString(),
        createdBy: data.createdBy,
      };
    });
  } catch (err) {
    console.error('Error fetching universities:', err);
    return [];
  }
}

export async function fetchDepartments(): Promise<Department[]> {
  try {
    const q = query(collection(db, 'departments'), orderBy('name', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        name: data.name || '',
        nameLower: data.nameLower || '',
        code: data.code || '',
        description: data.description || null,
        createdAt: data.createdAt || new Date().toISOString(),
        createdBy: data.createdBy,
      };
    });
  } catch (err) {
    console.error('Error fetching departments:', err);
    return [];
  }
}

export async function fetchCourses(departmentId?: string): Promise<Course[]> {
  try {
    let q = query(collection(db, 'courses'), orderBy('name', 'asc'));
    if (departmentId) {
      q = query(collection(db, 'courses'), where('departmentId', '==', departmentId));
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        name: data.name || '',
        nameLower: data.nameLower || '',
        code: data.code || '',
        degree: data.degree || 'Degree',
        departmentId: data.departmentId || data.department_id || null,
        department_id: data.departmentId || data.department_id || null,
        total_semesters: data.total_semesters || 8,
        createdAt: data.createdAt || new Date().toISOString(),
        createdBy: data.createdBy,
      };
    });
  } catch (err) {
    console.error('Error fetching courses:', err);
    return [];
  }
}

export async function fetchSubjects(courseId?: string, semester?: number): Promise<Subject[]> {
  try {
    let q = query(collection(db, 'subjects'), orderBy('name', 'asc'));
    if (courseId) {
      q = query(collection(db, 'subjects'), where('courseId', '==', courseId));
    }
    const snapshot = await getDocs(q);
    let list: Subject[] = snapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        name: data.name || '',
        nameLower: data.nameLower || '',
        code: data.code || '',
        courseId: data.courseId || data.course_id || null,
        course_id: data.courseId || data.course_id || null,
        semester: data.semester || null,
        syllabus_description: data.syllabus_description || null,
        createdAt: data.createdAt || new Date().toISOString(),
        createdBy: data.createdBy,
      };
    });
    if (semester) {
      list = list.filter((s) => s.semester === semester);
    }
    return list;
  } catch (err) {
    console.error('Error fetching subjects:', err);
    return [];
  }
}

function generateCodeFromName(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length > 1) {
    const acronym = words
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 5);
    return `${acronym}${Math.floor(100 + Math.random() * 900)}`;
  }
  return `${name.trim().slice(0, 4).toUpperCase()}${Math.floor(100 + Math.random() * 900)}`;
}

export async function createSubjectQuick(
  name: string,
  courseId?: string | null
): Promise<Subject> {
  const trimmed = name.trim();
  const nameLower = trimmed.toLowerCase();

  // Check for existing duplicate by nameLower
  const existingQ = query(
    collection(db, 'subjects'),
    where('nameLower', '==', nameLower)
  );
  const existingSnap = await getDocs(existingQ);
  if (!existingSnap.empty) {
    const docSnap = existingSnap.docs[0];
    const data = docSnap.data();
    return {
      id: docSnap.id,
      name: data.name,
      nameLower: data.nameLower,
      code: data.code,
      courseId: data.courseId,
      course_id: data.courseId,
      semester: data.semester,
      createdAt: data.createdAt,
    };
  }

  const code = generateCodeFromName(trimmed);
  const now = new Date().toISOString();
  const payload = {
    name: trimmed,
    nameLower,
    code,
    courseId: courseId || null,
    course_id: courseId || null,
    semester: 1,
    createdAt: now,
    createdBy: null,
  };

  const docRef = await addDoc(collection(db, 'subjects'), payload);
  return {
    id: docRef.id,
    ...payload,
  };
}

export async function createCourseQuick(
  name: string,
  departmentId?: string | null
): Promise<Course> {
  const trimmed = name.trim();
  const nameLower = trimmed.toLowerCase();

  const existingQ = query(
    collection(db, 'courses'),
    where('nameLower', '==', nameLower)
  );
  const existingSnap = await getDocs(existingQ);
  if (!existingSnap.empty) {
    const docSnap = existingSnap.docs[0];
    const data = docSnap.data();
    return {
      id: docSnap.id,
      name: data.name,
      nameLower: data.nameLower,
      degree: data.degree || 'B.Tech',
      departmentId: data.departmentId,
      department_id: data.departmentId,
      createdAt: data.createdAt,
    };
  }

  const code = generateCodeFromName(trimmed);
  const now = new Date().toISOString();
  const payload = {
    name: trimmed,
    nameLower,
    code,
    departmentId: departmentId || null,
    department_id: departmentId || null,
    degree: 'B.Tech',
    total_semesters: 8,
    createdAt: now,
    createdBy: null,
  };

  const docRef = await addDoc(collection(db, 'courses'), payload);
  return {
    id: docRef.id,
    ...payload,
  };
}

export async function createDepartmentQuick(name: string): Promise<Department> {
  const trimmed = name.trim();
  const nameLower = trimmed.toLowerCase();

  const existingQ = query(
    collection(db, 'departments'),
    where('nameLower', '==', nameLower)
  );
  const existingSnap = await getDocs(existingQ);
  if (!existingSnap.empty) {
    const docSnap = existingSnap.docs[0];
    const data = docSnap.data();
    return {
      id: docSnap.id,
      name: data.name,
      nameLower: data.nameLower,
      code: data.code,
      createdAt: data.createdAt,
    };
  }

  const code =
    trimmed
      .split(/\s+/)
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 6) || 'DEPT';
  const now = new Date().toISOString();
  const payload = {
    name: trimmed,
    nameLower,
    code: `${code}_${Math.floor(100 + Math.random() * 900)}`,
    description: null,
    createdAt: now,
    createdBy: null,
  };

  const docRef = await addDoc(collection(db, 'departments'), payload);
  return {
    id: docRef.id,
    ...payload,
  };
}

export async function createUniversityQuick(name: string): Promise<University> {
  const trimmed = name.trim();
  const nameLower = trimmed.toLowerCase();

  const existingQ = query(
    collection(db, 'universities'),
    where('nameLower', '==', nameLower)
  );
  const existingSnap = await getDocs(existingQ);
  if (!existingSnap.empty) {
    const docSnap = existingSnap.docs[0];
    const data = docSnap.data();
    return {
      id: docSnap.id,
      name: data.name,
      nameLower: data.nameLower,
      short_code: data.short_code,
      country: data.country,
      createdAt: data.createdAt,
    };
  }

  const code =
    trimmed
      .split(/\s+/)
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 6) || 'UNI';
  const now = new Date().toISOString();
  const payload = {
    name: trimmed,
    nameLower,
    short_code: `${code}_${Math.floor(100 + Math.random() * 900)}`,
    country: 'India',
    createdAt: now,
    createdBy: null,
  };

  const docRef = await addDoc(collection(db, 'universities'), payload);
  return {
    id: docRef.id,
    ...payload,
  };
}

export async function createSubject(input: Partial<FirestoreSubject>): Promise<Subject> {
  const trimmed = (input.name || '').trim();
  const nameLower = trimmed.toLowerCase();
  const now = new Date().toISOString();
  const payload = {
    name: trimmed,
    nameLower,
    code: input.code || generateCodeFromName(trimmed),
    courseId: input.courseId || null,
    course_id: input.courseId || null,
    createdAt: now,
    createdBy: null,
  };
  const docRef = await addDoc(collection(db, 'subjects'), payload);
  return { id: docRef.id, ...payload };
}

export async function updateSubject(
  id: string,
  input: Partial<FirestoreSubject>
): Promise<Subject> {
  const ref = doc(db, 'subjects', id);
  const updateData: Record<string, unknown> = { ...input };
  if (input.name) {
    updateData.nameLower = input.name.trim().toLowerCase();
  }
  await updateDoc(ref, updateData);
  return { id, name: input.name || '', nameLower: (input.name || '').toLowerCase(), createdAt: new Date().toISOString(), ...input };
}

export async function deleteSubject(id: string): Promise<void> {
  await deleteDoc(doc(db, 'subjects', id));
}

export async function createDepartment(input: Partial<FirestoreDepartment>): Promise<Department> {
  const trimmed = (input.name || '').trim();
  const nameLower = trimmed.toLowerCase();
  const now = new Date().toISOString();
  const payload = {
    name: trimmed,
    nameLower,
    code: generateCodeFromName(trimmed),
    createdAt: now,
    createdBy: null,
  };
  const docRef = await addDoc(collection(db, 'departments'), payload);
  return { id: docRef.id, ...payload };
}

export async function createCourse(input: Partial<FirestoreCourse>): Promise<Course> {
  const trimmed = (input.name || '').trim();
  const nameLower = trimmed.toLowerCase();
  const now = new Date().toISOString();
  const payload = {
    name: trimmed,
    nameLower,
    code: generateCodeFromName(trimmed),
    degree: input.degree || 'B.Tech',
    departmentId: input.departmentId || null,
    department_id: input.departmentId || null,
    total_semesters: 8,
    createdAt: now,
    createdBy: null,
  };
  const docRef = await addDoc(collection(db, 'courses'), payload);
  return { id: docRef.id, ...payload };
}
