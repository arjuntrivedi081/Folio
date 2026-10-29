import { z } from 'zod';

export const resourceFormSchema = z.object({
  title: z
    .string()
    .min(2, 'Title must be at least 2 characters')
    .max(160, 'Title must not exceed 160 characters'),
  categoryId: z.string().min(1, 'Please select a resource type'),
  // Optional taxonomy fields that never block uploading:
  subjectId: z.string().optional().nullable(),
  courseId: z.string().optional().nullable(),
  departmentId: z.string().optional().nullable(),
  universityId: z.string().optional().nullable(),
  semester: z.number().min(1).max(12),
  unit: z.string(),
  examType: z.string(),
  academicYear: z.string(),
  status: z.enum(['draft', 'published']),
  description: z
    .string()
    .max(1000, 'Description cannot exceed 1000 characters')
    .optional()
    .nullable(),
  tags: z.string().optional().nullable(), // Comma-separated in form
});

export type ResourceFormValues = z.infer<typeof resourceFormSchema>;

export const subjectFormSchema = z.object({
  name: z.string().min(2, 'Subject name must be at least 2 characters'),
  code: z.string().min(2, 'Subject code is required (e.g., CS301)'),
  courseId: z.string().optional().nullable(),
  semester: z.coerce.number().min(1).max(12).optional().default(1),
  syllabusDescription: z.string().max(500).optional().nullable(),
});

export type SubjectFormValues = z.infer<typeof subjectFormSchema>;

export const courseFormSchema = z.object({
  name: z.string().min(2, 'Course name is required'),
  code: z.string().min(2, 'Course code is required (e.g., BTECH_CSE)'),
  departmentId: z.string().optional().nullable(),
  degree: z.string().min(2, 'Degree designation is required (e.g., B.Tech)').default('B.Tech'),
  totalSemesters: z.coerce.number().min(1).max(12).default(8),
});

export type CourseFormValues = z.infer<typeof courseFormSchema>;

export const departmentFormSchema = z.object({
  name: z.string().min(2, 'Department name is required'),
  code: z.string().min(2, 'Department code is required (e.g., CSE)'),
  description: z.string().max(500).optional().nullable(),
});

export type DepartmentFormValues = z.infer<typeof departmentFormSchema>;

export const authFormSchema = z.object({
  email: z.string().email('Please enter a valid academic email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type AuthFormValues = z.infer<typeof authFormSchema>;

export const examCountdownSchema = z.object({
  examName: z.string().min(2, 'Exam title is required'),
  courseCode: z.string().min(2, 'Course/Subject code is required'),
  targetDate: z.string().min(1, 'Target examination date is required'),
  notes: z.string().max(300).optional(),
});

export type ExamCountdownFormValues = z.infer<typeof examCountdownSchema>;
