import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resourceFormSchema, type ResourceFormValues } from '../../lib/validation';
import { createAdminResource } from '../../services/admin.service';
import {
  fetchDepartments,
  fetchCourses,
  fetchSubjects,
  createSubjectQuick,
  createCourseQuick,
  createDepartmentQuick,
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
import { Combobox, type ComboboxOption } from '../../components/ui/combobox';
import {
  UploadCloud,
  FileCheck2,
  X,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Eye,
  RefreshCw,
  FileText,
} from 'lucide-react';

const RECENT_SUBJECTS_KEY = 'folio_recent_subjects_v1';

export const AdminUploadPage: React.FC = () => {
  useDocumentTitle('Upload Curriculum Material');

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdResource, setCreatedResource] = useState<EnrichedResource | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Taxonomy states (loaded independently from Supabase)
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loadingTaxonomy, setLoadingTaxonomy] = useState(true);

  // Recent subjects for quick-pick chips
  const [recentSubjectIds, setRecentSubjectIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(RECENT_SUBJECTS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm<ResourceFormValues>({
    resolver: zodResolver(resourceFormSchema),
    defaultValues: {
      title: '',
      description: '',
      categoryId: 'notes',
      subjectId: null,
      courseId: null,
      departmentId: null,
      universityId: null,
      semester: 1,
      unit: 'unit_all',
      examType: 'None',
      academicYear: '2024-2025',
      status: 'published',
      tags: '',
    },
  });

  const currentStatus = watch('status');

  // Load all taxonomy directly on mount without cascaded blocking
  const loadTaxonomy = async () => {
    try {
      setLoadingTaxonomy(true);
      const [depts, crs, subs] = await Promise.all([
        fetchDepartments().catch(() => []),
        fetchCourses().catch(() => []),
        fetchSubjects().catch(() => []),
      ]);
      setDepartments(depts);
      setCourses(crs);
      setSubjects(subs);
    } catch (e) {
      console.warn('Taxonomy load note:', e);
    } finally {
      setLoadingTaxonomy(false);
    }
  };

  useEffect(() => {
    loadTaxonomy();
  }, []);

  // Listen to global taxonomy creation events from other tabs or actions
  useEffect(() => {
    const handleTaxonomyChange = () => {
      loadTaxonomy();
    };
    window.addEventListener('folio:realtime:subjects', handleTaxonomyChange);
    window.addEventListener('folio:realtime:courses', handleTaxonomyChange);
    window.addEventListener('folio:realtime:departments', handleTaxonomyChange);
    return () => {
      window.removeEventListener('folio:realtime:subjects', handleTaxonomyChange);
      window.removeEventListener('folio:realtime:courses', handleTaxonomyChange);
      window.removeEventListener('folio:realtime:departments', handleTaxonomyChange);
    };
  }, []);

  // Combobox options
  const subjectOptions: ComboboxOption[] = useMemo(() => {
    return subjects.map((s) => ({
      value: s.id,
      label: s.name,
      sublabel: s.code ? `Code: ${s.code} · Sem ${s.semester}` : undefined,
    }));
  }, [subjects]);

  const courseOptions: ComboboxOption[] = useMemo(() => {
    return courses.map((c) => ({
      value: c.id,
      label: c.name,
      sublabel: `${c.code} (${c.degree})`,
    }));
  }, [courses]);

  const departmentOptions: ComboboxOption[] = useMemo(() => {
    return departments.map((d) => ({
      value: d.id,
      label: d.name,
      sublabel: `Dept: ${d.code}`,
    }));
  }, [departments]);

  // Quick-pick chips for recently selected subjects
  const quickPickSubjects = useMemo(() => {
    return recentSubjectIds
      .map((id) => {
        const sub = subjects.find((s) => s.id === id);
        return sub ? { value: sub.id, label: sub.name } : null;
      })
      .filter(Boolean) as ComboboxOption[];
  }, [recentSubjectIds, subjects]);

  const recordRecentSubject = (id: string | null) => {
    if (!id) return;
    setRecentSubjectIds((prev) => {
      const updated = [id, ...prev.filter((i) => i !== id)].slice(0, 4);
      try {
        localStorage.setItem(RECENT_SUBJECTS_KEY, JSON.stringify(updated));
      } catch {
        // non-blocking
      }
      return updated;
    });
  };

  // Quick creation handlers for comboboxes
  const handleCreateSubject = async (typedName: string): Promise<string> => {
    const created = await createSubjectQuick(typedName, watch('courseId'));
    setSubjects((prev) => [created, ...prev]);
    recordRecentSubject(created.id);
    return created.id;
  };

  const handleCreateCourse = async (typedName: string): Promise<string> => {
    const created = await createCourseQuick(typedName, watch('departmentId'));
    setCourses((prev) => [created, ...prev]);
    return created.id;
  };

  const handleCreateDepartment = async (typedName: string): Promise<string> => {
    const created = await createDepartmentQuick(typedName);
    setDepartments((prev) => [created, ...prev]);
    return created.id;
  };

  // File validation
  const validateAndSetFile = (file: File) => {
    setFileError(null);
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();

    if (!ALLOWED_EXTENSIONS.includes(extension as unknown as (typeof ALLOWED_EXTENSIONS)[number])) {
      setFileError(`File type not supported. Allowed formats: ${ALLOWED_EXTENSIONS.join(', ')}`);
      return false;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setFileError(`File size (${formatBytes(file.size)}) exceeds the 25 MB limit.`);
      return false;
    }

    setSelectedFile(file);

    // Auto-fill title from filename if title is currently empty
    const currentTitle = watch('title');
    if (!currentTitle) {
      const cleanName = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[_-]+/g, ' ')
        .trim();
      setValue('title', cleanName);
    }

    return true;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const cancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsSubmitting(false);
    setUploadProgress(0);
    setSubmissionError('Upload cancelled by user.');
  };

  const onFormSubmit = async (values: ResourceFormValues) => {
    if (!selectedFile) {
      setFileError('Please select a PDF or image file to upload.');
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmissionError(null);
      setUploadProgress(15);

      if (values.subjectId) {
        recordRecentSubject(values.subjectId);
      }

      // Upload file to storage + insert metadata record
      const resource = await createAdminResource(
        values,
        selectedFile,
        null,
        (progress) => setUploadProgress(progress)
      );

      setUploadProgress(100);
      setCreatedResource(resource);
    } catch (err: unknown) {
      setSubmissionError(
        err instanceof Error
          ? err.message
          : 'Upload failed. The storage object was safely cleaned up.'
      );
      setUploadProgress(0);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForAnother = () => {
    setCreatedResource(null);
    setSelectedFile(null);
    setFileError(null);
    setSubmissionError(null);
    setUploadProgress(0);
    reset({
      title: '',
      description: '',
      categoryId: 'notes',
      subjectId: null,
      courseId: null,
      departmentId: null,
      universityId: null,
      semester: 1,
      unit: 'unit_all',
      examType: 'None',
      academicYear: '2024-2025',
      status: 'published',
      tags: '',
    });
  };

  // Success view
  if (createdResource) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="rounded-[var(--radius-md)] border border-[#E7E3DA] bg-white p-8 text-center shadow-hairline space-y-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#EFF4F2] text-[#183B32] mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-xs uppercase tracking-wider text-[#183B32] font-semibold">
              {createdResource.status === 'published' ? 'Published to Repository' : 'Draft Saved'}
            </span>
            <h1 className="text-2xl font-serif-heading font-semibold text-[#141413]">
              Curriculum Material Posted Successfully
            </h1>
            <p className="text-sm text-[#5C5955] max-w-md mx-auto">
              &quot;{createdResource.title}&quot; is now live and accessible in the academic portal.
            </p>
          </div>

          <div className="p-4 rounded-[var(--radius-sm)] bg-[#FAF8F4] border border-[#E7E3DA] text-left text-xs space-y-1.5 font-mono">
            <div><span className="text-[#87837B]">File:</span> {createdResource.original_filename}</div>
            <div><span className="text-[#87837B]">Size:</span> {formatBytes(createdResource.file_size_bytes)}</div>
            <div><span className="text-[#87837B]">Category:</span> {createdResource.category_id}</div>
            <div><span className="text-[#87837B]">Status:</span> {createdResource.status}</div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button asChild variant="primary" size="md" className="gap-2 w-full sm:w-auto">
              <Link to={ROUTES.RESOURCE_DETAIL(createdResource.id)}>
                <Eye className="w-4 h-4" />
                <span>View Published Resource</span>
              </Link>
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={handleResetForAnother}
              className="gap-2 w-full sm:w-auto"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Another Resource</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      {/* Editorial Header */}
      <div className="pb-6 border-b border-[#E7E3DA] flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-[#183B32] mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curator Publishing Station</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif-heading font-semibold text-[#141413]">
            Upload Curriculum Material
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#5C5955]">
            Upload past examination papers, syllabus slides, and lab handbooks directly to the repository.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to={ROUTES.ADMIN_MANAGE}>Manage All Material</Link>
        </Button>
      </div>

      {/* Submission Error Banner */}
      {submissionError && (
        <div className="p-4 rounded-[var(--radius-sm)] bg-[#FDF2F1] border border-[#9E2B25]/20 text-xs text-[#9E2B25] flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block mb-0.5">Upload Error</span>
              <span className="leading-relaxed">{submissionError}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSubmissionError(null)}
            className="text-[#9E2B25] hover:opacity-80 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
        {/* Step 1: File Dropzone (Required) */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#141413]">
            Document File <span className="text-[#9E2B25]">*</span>
          </label>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-[var(--radius-md)] p-8 text-center cursor-pointer transition-all duration-200 ${
              isDragging
                ? 'border-[#183B32] bg-[#EFF4F2]'
                : selectedFile
                ? 'border-[#183B32]/40 bg-white'
                : 'border-[#DFD9CE] bg-white hover:border-[#183B32]/40 hover:bg-[#FAF8F4]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.webp"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  validateAndSetFile(e.target.files[0]);
                }
              }}
              className="hidden"
            />

            {selectedFile ? (
              <div className="flex items-center justify-between gap-4 max-w-md mx-auto text-left">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[#EFF4F2] text-[#183B32]">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-[#141413] truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-[11px] text-[#87837B]">
                      {formatBytes(selectedFile.size)} · {selectedFile.type || 'Document'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                  }}
                  className="p-1 rounded text-[#87837B] hover:text-[#9E2B25] hover:bg-[#FAF8F4]"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <UploadCloud className="w-8 h-8 mx-auto text-[#183B32]" />
                <p className="text-xs font-medium text-[#141413]">
                  Drag and drop your academic PDF or document here, or <span className="text-[#183B32] underline">browse</span>
                </p>
                <p className="text-[11px] text-[#87837B]">
                  PDF, PNG, JPG, or WEBP up to 25 MB
                </p>
              </div>
            )}
          </div>

          {fileError && <p className="text-xs text-[#9E2B25]">{fileError}</p>}
        </div>

        {/* Step 2: Essential Details */}
        <div className="space-y-5 rounded-[var(--radius-md)] border border-[#E7E3DA] bg-white p-6 shadow-hairline">
          <h2 className="text-sm font-serif-heading font-medium text-[#141413] pb-2 border-b border-[#E7E3DA]">
            Resource Information
          </h2>

          {/* Title (Required) */}
          <div className="space-y-1.5">
            <label htmlFor="title" className="block text-xs font-medium text-[#141413]">
              Document Title <span className="text-[#9E2B25]">*</span>
            </label>
            <Input
              id="title"
              {...register('title')}
              placeholder="e.g. Data Structures: Unit 2 Binary Trees & AVL Rotations"
              className="text-xs"
            />
            {errors.title && <p className="text-xs text-[#9E2B25]">{errors.title.message}</p>}
          </div>

          {/* Resource Type Category (Required) */}
          <div className="space-y-1.5">
            <label htmlFor="categoryId" className="block text-xs font-medium text-[#141413]">
              Resource Classification <span className="text-[#9E2B25]">*</span>
            </label>
            <select
              id="categoryId"
              {...register('categoryId')}
              className="w-full h-9 rounded-[var(--radius-sm)] border border-[#E7E3DA] bg-white px-3 text-xs text-[#141413] outline-none focus-visible:ring-1 focus-visible:ring-[#183B32]"
            >
              {RESOURCE_TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label} ({t.shortLabel}) — {t.description}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="text-xs text-[#9E2B25]">{errors.categoryId.message}</p>
            )}
          </div>

          {/* Description (Optional) */}
          <div className="space-y-1.5">
            <label htmlFor="description" className="block text-xs font-medium text-[#141413]">
              Summary / Scope <span className="text-[#87837B] font-normal">(Optional)</span>
            </label>
            <textarea
              id="description"
              {...register('description')}
              rows={3}
              placeholder="Brief summary of topics, algorithms covered, or marking scheme notes..."
              className="w-full rounded-[var(--radius-sm)] border border-[#E7E3DA] bg-white p-3 text-xs text-[#141413] outline-none focus-visible:ring-1 focus-visible:ring-[#183B32]"
            />
          </div>
        </div>

        {/* Step 3: Curricular Taxonomy (Never blocks uploading) */}
        <div className="space-y-5 rounded-[var(--radius-md)] border border-[#E7E3DA] bg-white p-6 shadow-hairline">
          <div className="flex items-center justify-between pb-2 border-b border-[#E7E3DA]">
            <h2 className="text-sm font-serif-heading font-medium text-[#141413]">
              Academic Context
            </h2>
            <span className="text-[11px] text-[#87837B]">All fields below are optional</span>
          </div>

          {/* Subject Combobox (Searchable + Inline Quick Create) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[#141413]">
              Subject / Course Module
            </label>
            <Controller
              control={control}
              name="subjectId"
              render={({ field }) => (
                <Combobox
                  value={field.value}
                  onChange={field.onChange}
                  options={subjectOptions}
                  placeholder="Select a subject, or type to create one..."
                  searchPlaceholder="Search or type subject name..."
                  emptyText="No subjects yet, type a name to add one"
                  onCreate={handleCreateSubject}
                  quickPicks={quickPickSubjects}
                  allowClear
                />
              )}
            />
            <p className="text-[11px] text-[#87837B]">
              Type any subject name to filter or instantly create it without leaving this page.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Course Combobox */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#141413]">
                Course / Program
              </label>
              <Controller
                control={control}
                name="courseId"
                render={({ field }) => (
                  <Combobox
                    value={field.value}
                    onChange={field.onChange}
                    options={courseOptions}
                    placeholder="Select course (e.g. B.Tech CSE)..."
                    searchPlaceholder="Search or type course..."
                    emptyText="No courses yet, type to add one"
                    onCreate={handleCreateCourse}
                    allowClear
                  />
                )}
              />
            </div>

            {/* Department Combobox */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#141413]">
                Department
              </label>
              <Controller
                control={control}
                name="departmentId"
                render={({ field }) => (
                  <Combobox
                    value={field.value}
                    onChange={field.onChange}
                    options={departmentOptions}
                    placeholder="Select department (e.g. CSE)..."
                    searchPlaceholder="Search or type department..."
                    emptyText="No departments yet, type to add one"
                    onCreate={handleCreateDepartment}
                    allowClear
                  />
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {/* Semester */}
            <div className="space-y-1.5">
              <label htmlFor="semester" className="block text-xs font-medium text-[#141413]">
                Semester
              </label>
              <select
                id="semester"
                {...register('semester')}
                className="w-full h-9 rounded-[var(--radius-sm)] border border-[#E7E3DA] bg-white px-3 text-xs text-[#141413] outline-none focus-visible:ring-1 focus-visible:ring-[#183B32]"
              >
                {SEMESTERS.map((sem) => (
                  <option key={sem} value={sem}>
                    Semester {sem}
                  </option>
                ))}
              </select>
            </div>

            {/* Unit */}
            <div className="space-y-1.5">
              <label htmlFor="unit" className="block text-xs font-medium text-[#141413]">
                Syllabus Unit
              </label>
              <select
                id="unit"
                {...register('unit')}
                className="w-full h-9 rounded-[var(--radius-sm)] border border-[#E7E3DA] bg-white px-3 text-xs text-[#141413] outline-none focus-visible:ring-1 focus-visible:ring-[#183B32]"
              >
                {UNITS.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Exam Type */}
            <div className="space-y-1.5">
              <label htmlFor="examType" className="block text-xs font-medium text-[#141413]">
                Exam Type
              </label>
              <select
                id="examType"
                {...register('examType')}
                className="w-full h-9 rounded-[var(--radius-sm)] border border-[#E7E3DA] bg-white px-3 text-xs text-[#141413] outline-none focus-visible:ring-1 focus-visible:ring-[#183B32]"
              >
                {EXAM_TYPES.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Academic Year */}
            <div className="space-y-1.5">
              <label htmlFor="academicYear" className="block text-xs font-medium text-[#141413]">
                Academic Year
              </label>
              <Input
                id="academicYear"
                {...register('academicYear')}
                placeholder="2024-2025"
                className="text-xs"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <label htmlFor="tags" className="block text-xs font-medium text-[#141413]">
              Keywords / Search Tags <span className="text-[#87837B] font-normal">(Comma-separated)</span>
            </label>
            <Input
              id="tags"
              {...register('tags')}
              placeholder="e.g. algorithms, trees, pyq, solved, viva"
              className="text-xs"
            />
          </div>
        </div>

        {/* Step 4: Publication Status (One-click 'Publish now' default) */}
        <div className="p-4 rounded-[var(--radius-md)] border border-[#E7E3DA] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-hairline">
          <div>
            <span className="text-xs font-medium text-[#141413] block">
              Publication Visibility
            </span>
            <span className="text-[11px] text-[#5C5955]">
              {currentStatus === 'published'
                ? 'Immediately accessible to all students and visitors on the homepage and catalog.'
                : 'Stored privately as a draft for administrator preview before releasing.'}
            </span>
          </div>

          <div className="flex items-center gap-2 bg-[#FAF8F4] p-1 rounded-[var(--radius-sm)] border border-[#E7E3DA] shrink-0">
            <button
              type="button"
              onClick={() => setValue('status', 'published')}
              className={`px-3 py-1 text-xs font-medium rounded-[var(--radius-xs)] transition-colors ${
                currentStatus === 'published'
                  ? 'bg-[#183B32] text-white'
                  : 'text-[#5C5955] hover:text-[#141413]'
              }`}
            >
              Publish Now
            </button>
            <button
              type="button"
              onClick={() => setValue('status', 'draft')}
              className={`px-3 py-1 text-xs font-medium rounded-[var(--radius-xs)] transition-colors ${
                currentStatus === 'draft'
                  ? 'bg-[#141413] text-white'
                  : 'text-[#5C5955] hover:text-[#141413]'
              }`}
            >
              Save as Draft
            </button>
          </div>
        </div>

        {/* Progress & Actions */}
        {isSubmitting && (
          <div className="space-y-2 p-4 rounded-[var(--radius-sm)] bg-[#FAF8F4] border border-[#E7E3DA]">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-[#183B32]">
                Uploading document & registering metadata...
              </span>
              <span className="font-mono text-[#87837B]">{uploadProgress}%</span>
            </div>
            <div className="h-1.5 w-full bg-[#E7E3DA] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#183B32] transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <div className="text-right pt-1">
              <button
                type="button"
                onClick={cancelUpload}
                className="text-xs text-[#9E2B25] hover:underline"
              >
                Cancel Upload
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button asChild variant="outline" size="md">
            <Link to={ROUTES.ADMIN}>Cancel</Link>
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSubmitting}
            disabled={isSubmitting || !selectedFile}
            className="gap-2 min-w-[150px]"
          >
            <UploadCloud className="w-4 h-4" />
            <span>{currentStatus === 'published' ? 'Publish Material' : 'Save Draft'}</span>
          </Button>
        </div>
      </form>
    </div>
  );
};
