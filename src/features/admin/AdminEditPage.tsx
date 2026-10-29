import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resourceFormSchema, type ResourceFormValues } from '../../lib/validation';
import { getResourceById } from '../../services/resources.service';
import { updateAdminResource } from '../../services/admin.service';
import {
  fetchDepartments,
  fetchCourses,
  fetchSubjects,
  type Department,
  type Course,
  type Subject,
} from '../../services/categories.service';
import type { EnrichedResource } from '../../types/domain';
import {
  RESOURCE_TYPES,
  EXAM_TYPES,
  SEMESTERS,
  UNITS,
  ALLOWED_EXTENSIONS,
  MAX_FILE_SIZE_BYTES,
} from '../../config/constants';
import { ROUTES } from '../../config/routes';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { formatBytes } from '../../lib/format';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { Skeleton } from '../../components/ui/skeleton';
import { ArrowLeft, Save, FileCheck2, AlertCircle, CheckCircle2 } from 'lucide-react';

export const AdminEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [resource, setResource] = useState<EnrichedResource | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<string>('');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');

  useDocumentTitle(resource ? `Edit: ${resource.title}` : 'Edit Resource');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ResourceFormValues>({
    resolver: zodResolver(resourceFormSchema),
  });

  const selectedSemester = watch('semester');

  // Load initial data
  useEffect(() => {
    if (!id) return;
    async function loadInitial() {
      try {
        setLoading(true);
        const data = await getResourceById(id!);
        if (data) {
          setResource(data);
          reset({
            title: data.title,
            description: data.description || '',
            categoryId: data.category_id,
            subjectId: data.subject_id,
            semester: data.semester,
            unit: data.unit,
            examType: data.exam_type,
            academicYear: data.academic_year,
            status: data.status,
            tags: data.tags ? data.tags.join(', ') : '',
          });

          // Preload taxonomy
          const depts = await fetchDepartments();
          setDepartments(depts);

          const course = data.subject?.course;
          if (course) {
            const deptId = course.department?.id || data.departmentId || data.department_id || '';
            setSelectedDeptId(deptId);
            const crs = await fetchCourses(deptId || undefined);
            setCourses(crs);
            setSelectedCourseId(course.id);
            const subs = await fetchSubjects(course.id, data.semester);
            setSubjects(subs);
          }
        }
      } catch (err) {
        console.error('Error loading resource for editing:', err);
      } finally {
        setLoading(false);
      }
    }
    loadInitial();
  }, [id, reset]);

  // Handle course and semester changes
  useEffect(() => {
    if (selectedCourseId && selectedSemester) {
      fetchSubjects(selectedCourseId, Number(selectedSemester)).then(setSubjects);
    }
  }, [selectedCourseId, selectedSemester]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(extension as unknown as (typeof ALLOWED_EXTENSIONS)[number])) {
        setFileError(`File type not allowed. Supported formats: ${ALLOWED_EXTENSIONS.join(', ')}`);
        return;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setFileError(`File size (${formatBytes(file.size)}) exceeds 25 MB.`);
        return;
      }
      setNewFile(file);
    }
  };

  const onFormSubmit = async (values: ResourceFormValues) => {
    if (!id) return;
    try {
      setIsSubmitting(true);
      setFeedback(null);
      const updated = await updateAdminResource(id, values, newFile);
      setResource(updated);
      setFeedback({ type: 'success', message: 'Resource metadata updated successfully.' });
    } catch (e: unknown) {
      setFeedback({
        type: 'error',
        message: e instanceof Error ? e.message : 'Update failed.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="max-w-md mx-auto py-12 text-center text-xs text-[#5C5955]">
        <p>Resource not found.</p>
        <Button asChild variant="outline" size="sm" className="mt-4">
          <Link to={ROUTES.ADMIN_MANAGE}>Back to Catalog</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header & Back */}
      <div className="pb-6 border-b border-[#E7E3DA]">
        <Link
          to={ROUTES.ADMIN_MANAGE}
          className="inline-flex items-center gap-1.5 text-xs text-[#5C5955] hover:text-[#141413] mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Manage Resources</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-serif-heading font-semibold text-[#141413]">
          Edit Resource Metadata
        </h1>
        <p className="mt-1 text-xs text-[#5C5955]">
          Update syllabus mapping, classification attributes, or replace the storage file.
        </p>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-[var(--radius-sm)] border text-xs flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-[#EEF7F1] border-[#1C5436]/20 text-[#1C5436]'
              : 'bg-[#FDF2F1] border-[#9E2B25]/20 text-[#9E2B25]'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {/* Existing File & Replacement */}
        <div className="p-4 rounded-[var(--radius-md)] border border-[#E7E3DA] bg-white space-y-3">
          <span className="text-xs font-semibold text-[#141413] block">Active File</span>
          <div className="flex items-center justify-between text-xs text-[#5C5955]">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-[#183B32]" />
              <span className="font-mono">{resource.original_filename}</span>
              <span>· {formatBytes(resource.file_size_bytes)}</span>
            </div>
            <Link
              to={ROUTES.RESOURCE_DETAIL(resource.id)}
              className="text-[#183B32] hover:underline"
              target="_blank"
            >
              View Document
            </Link>
          </div>

          <div className="pt-2 border-t border-[#E7E3DA]">
            <label className="block text-xs font-medium text-[#5C5955] mb-1">
              Replace File (Optional)
            </label>
            <input
              type="file"
              accept={ALLOWED_EXTENSIONS.join(',')}
              onChange={handleFileChange}
              className="text-xs text-[#5C5955] file:mr-3 file:py-1.5 file:px-3 file:rounded-[var(--radius-xs)] file:border file:border-[#E7E3DA] file:bg-[#FAF8F4] file:text-xs file:font-medium hover:file:bg-[#F4F1EA] cursor-pointer"
            />
            {newFile && (
              <p className="mt-1 text-xs text-[#183B32]">
                New file selected: {newFile.name} ({formatBytes(newFile.size)}). Old file will be replaced in storage.
              </p>
            )}
            {fileError && <p className="mt-1 text-xs text-[#9E2B25]">{fileError}</p>}
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#141413] mb-1">
              Document Title *
            </label>
            <Input {...register('title')} error={errors.title?.message} />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#5C5955] mb-1">
              Description
            </label>
            <textarea
              rows={3}
              className="w-full rounded-[var(--radius-sm)] border border-[#E7E3DA] bg-white p-3 text-xs text-[#141413] placeholder:text-[#87837B] focus:outline-none focus:ring-1 focus:ring-[#183B32]"
              {...register('description')}
            />
          </div>
        </div>

        {/* Taxonomy */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#5C5955] mb-1">
              Department
            </label>
            <Select
              value={selectedDeptId}
              onChange={(e) => {
                setSelectedDeptId(e.target.value);
                fetchCourses(e.target.value).then(setCourses);
              }}
            >
              <option value="">Select Department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#5C5955] mb-1">
              Course / Program
            </label>
            <Select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
            >
              <option value="">Select Course</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#141413] mb-1">
              Subject *
            </label>
            <Select {...register('subjectId')} error={errors.subjectId?.message}>
              <option value="">Select Subject</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </Select>
          </div>
        </div>

        {/* Categories, Sem, Unit, Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#141413] mb-1">
              Category *
            </label>
            <Select {...register('categoryId')} error={errors.categoryId?.message}>
              {RESOURCE_TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#141413] mb-1">
              Semester *
            </label>
            <Select {...register('semester', { valueAsNumber: true })} error={errors.semester?.message}>
              {SEMESTERS.map((s) => (
                <option key={s} value={s}>
                  Semester {s}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#5C5955] mb-1">
              Unit
            </label>
            <Select {...register('unit')}>
              {UNITS.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.label}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#5C5955] mb-1">
              Exam Type
            </label>
            <Select {...register('examType')}>
              {EXAM_TYPES.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.label}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#141413] mb-1">
              Academic Year *
            </label>
            <Input {...register('academicYear')} error={errors.academicYear?.message} />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#5C5955] mb-1">
              Publication Status
            </label>
            <Select {...register('status')}>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </Select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#5C5955] mb-1">
            Tags (Comma-separated)
          </label>
          <Input {...register('tags')} />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E7E3DA]">
          <Button asChild variant="outline" size="sm">
            <Link to={ROUTES.ADMIN_MANAGE}>Cancel</Link>
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting} className="gap-2">
            <Save className="w-3.5 h-3.5" />
            <span>Save Metadata Changes</span>
          </Button>
        </div>
      </form>
    </div>
  );
};
