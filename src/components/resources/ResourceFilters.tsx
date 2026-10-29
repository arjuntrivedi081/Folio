import React, { useEffect, useState, useMemo } from 'react';
import type { ResourceFiltersState } from '../../types/domain';
import { RESOURCE_TYPES, EXAM_TYPES, SEMESTERS, UNITS } from '../../config/constants';
import {
  fetchDepartments,
  fetchCourses,
  fetchSubjects,
  type Department,
  type Course,
  type Subject,
} from '../../services/categories.service';
import { RotateCcw } from 'lucide-react';
import { Select } from '../ui/select';
import { Combobox, type ComboboxOption } from '../ui/combobox';

interface ResourceFiltersProps {
  filters: ResourceFiltersState;
  onChange: (updated: ResourceFiltersState) => void;
  onReset: () => void;
  isMobileDrawer?: boolean;
}

export const ResourceFilters: React.FC<ResourceFiltersProps> = ({
  filters,
  onChange,
  onReset,
  isMobileDrawer = false,
}) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  useEffect(() => {
    fetchDepartments().then(setDepartments).catch(() => []);
    fetchCourses().then(setCourses).catch(() => []);
    fetchSubjects().then(setSubjects).catch(() => []);
  }, []);

  const hasActiveFilters = Boolean(
    filters.category ||
    filters.semester ||
    filters.subjectId ||
    filters.courseId ||
    filters.departmentId ||
    filters.unit ||
    filters.examType ||
    filters.academicYear ||
    filters.newThisWeek ||
    filters.sortBy !== 'newest'
  );

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

  return (
    <div className={`space-y-5 text-sm ${isMobileDrawer ? 'p-1' : ''}`}>
      <div className="flex items-center justify-between pb-3 border-b border-[#E7E3DA]">
        <span className="font-serif-heading font-medium text-[#141413]">Filter Resources</span>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1 text-xs text-[#183B32] hover:text-[#112A24] cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            Reset all
          </button>
        )}
      </div>

      {/* Resource Type / Category */}
      <div>
        <label className="block text-xs font-medium text-[#5C5955] mb-1.5">
          Resource Type
        </label>
        <Select
          value={filters.category || ''}
          onChange={(e) => onChange({ ...filters, category: e.target.value || undefined, page: 1 })}
        >
          <option value="">All Categories</option>
          {RESOURCE_TYPES.map((type) => (
            <option key={type.id} value={type.id}>
              {type.label}
            </option>
          ))}
        </Select>
      </div>

      {/* Subject Combobox */}
      <div>
        <label className="block text-xs font-medium text-[#5C5955] mb-1.5">
          Subject Module
        </label>
        <Combobox
          value={filters.subjectId}
          onChange={(val) => onChange({ ...filters, subjectId: val || undefined, page: 1 })}
          options={subjectOptions}
          placeholder="Filter by subject..."
          searchPlaceholder="Search real subjects..."
          emptyText="No subjects found in database"
          allowClear
        />
      </div>

      {/* Course Combobox */}
      <div>
        <label className="block text-xs font-medium text-[#5C5955] mb-1.5">
          Course / Degree Program
        </label>
        <Combobox
          value={filters.courseId}
          onChange={(val) => onChange({ ...filters, courseId: val || undefined, page: 1 })}
          options={courseOptions}
          placeholder="Filter by course..."
          searchPlaceholder="Search real courses..."
          emptyText="No courses found in database"
          allowClear
        />
      </div>

      {/* Department Combobox */}
      <div>
        <label className="block text-xs font-medium text-[#5C5955] mb-1.5">
          Academic Department
        </label>
        <Combobox
          value={filters.departmentId}
          onChange={(val) => onChange({ ...filters, departmentId: val || undefined, page: 1 })}
          options={departmentOptions}
          placeholder="Filter by department..."
          searchPlaceholder="Search real departments..."
          emptyText="No departments found in database"
          allowClear
        />
      </div>

      {/* Semester */}
      <div>
        <label className="block text-xs font-medium text-[#5C5955] mb-1.5">
          Semester
        </label>
        <Select
          value={filters.semester || ''}
          onChange={(e) =>
            onChange({
              ...filters,
              semester: e.target.value ? Number(e.target.value) : undefined,
              page: 1,
            })
          }
        >
          <option value="">All Semesters</option>
          {SEMESTERS.map((sem) => (
            <option key={sem} value={sem}>
              Semester {sem}
            </option>
          ))}
        </Select>
      </div>

      {/* Unit */}
      <div>
        <label className="block text-xs font-medium text-[#5C5955] mb-1.5">
          Unit / Coverage
        </label>
        <Select
          value={filters.unit || ''}
          onChange={(e) => onChange({ ...filters, unit: e.target.value || undefined, page: 1 })}
        >
          <option value="">All Units</option>
          {UNITS.map((u) => (
            <option key={u.id} value={u.id}>
              {u.label}
            </option>
          ))}
        </Select>
      </div>

      {/* Exam Type */}
      <div>
        <label className="block text-xs font-medium text-[#5C5955] mb-1.5">
          Examination
        </label>
        <Select
          value={filters.examType || ''}
          onChange={(e) => onChange({ ...filters, examType: e.target.value || undefined, page: 1 })}
        >
          <option value="">All Examinations</option>
          {EXAM_TYPES.map((e) => (
            <option key={e.id} value={e.id}>
              {e.label}
            </option>
          ))}
        </Select>
      </div>

      {/* Academic Year */}
      <div>
        <label className="block text-xs font-medium text-[#5C5955] mb-1.5">
          Academic Year
        </label>
        <Select
          value={filters.academicYear || ''}
          onChange={(e) => onChange({ ...filters, academicYear: e.target.value || undefined, page: 1 })}
        >
          <option value="">All Years</option>
          {['2024-2025', '2023-2024', '2022-2023', '2021-2022'].map((yr) => (
            <option key={yr} value={yr}>
              {yr}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
};
