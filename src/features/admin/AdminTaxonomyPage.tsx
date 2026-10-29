import React, { useState, useEffect } from 'react';
import {
  fetchDepartments,
  fetchCourses,
  fetchSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  createCourse,
  createDepartment,
  type Department,
  type Course,
  type Subject,
} from '../../services/categories.service';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useAdminSession } from '../../lib/adminSession';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Skeleton } from '../../components/ui/skeleton';
import { SEMESTERS } from '../../config/constants';
import { Plus, Trash2, Edit2, AlertCircle, CheckCircle2, BookOpen, LogOut } from 'lucide-react';

export const AdminTaxonomyPage: React.FC = () => {
  useDocumentTitle('Manage Academic Taxonomy');
  const { logout } = useAdminSession();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedDeptId, setSelectedDeptId] = useState<string>('');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<number | undefined>(undefined);

  // Subject Form Modal
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [subName, setSubName] = useState('');
  const [subCode, setSubCode] = useState('');
  const [subCourseId, setSubCourseId] = useState('');
  const [subSemester, setSubSemester] = useState(1);
  const [subDesc, setSubDesc] = useState('');

  // Course Form Modal
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [courseName, setCourseName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [courseDeptId, setCourseDeptId] = useState('');
  const [courseDegree, setCourseDegree] = useState('B.Tech');

  // Deletion state
  const [deleteSubjectTarget, setDeleteSubjectTarget] = useState<Subject | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Feedback banner
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const [depts, crs, subs] = await Promise.all([
        fetchDepartments(),
        fetchCourses(selectedDeptId || undefined),
        fetchSubjects(selectedCourseId || undefined, selectedSemester),
      ]);
      setDepartments(depts);
      setCourses(crs);
      setSubjects(subs);
    } catch (e: unknown) {
      setFeedback({
        type: 'error',
        message: e instanceof Error ? e.message : 'Failed to query curriculum taxonomy.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDeptId, selectedCourseId, selectedSemester]);

  const handleOpenSubjectModal = (sub?: Subject) => {
    if (sub) {
      setEditingSubject(sub);
      setSubName(sub.name || '');
      setSubCode(sub.code || '');
      setSubCourseId(sub.courseId || sub.course_id || '');
      setSubSemester(sub.semester || 1);
      setSubDesc(sub.syllabus_description || '');
    } else {
      setEditingSubject(null);
      setSubName('');
      setSubCode('');
      setSubCourseId(selectedCourseId || (courses[0]?.id ?? ''));
      setSubSemester(selectedSemester || 1);
      setSubDesc('');
    }
    setShowSubjectModal(true);
  };

  const handleSaveSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subName.trim()) {
      setFeedback({ type: 'error', message: 'Subject name is required.' });
      return;
    }

    try {
      const code = subCode.trim().toUpperCase() || `${subName.trim().slice(0, 4).toUpperCase()}${Math.floor(100 + Math.random() * 900)}`;
      const courseId = subCourseId || null;

      if (editingSubject) {
        await updateSubject(editingSubject.id, {
          name: subName.trim(),
          code,
          courseId,
          semester: Number(subSemester || 1),
          syllabus_description: subDesc ? subDesc.trim() : null,
        });
        setFeedback({ type: 'success', message: `Subject "${subName}" updated.` });
      } else {
        await createSubject({
          name: subName.trim(),
          code,
          courseId,
          semester: Number(subSemester || 1),
          syllabus_description: subDesc ? subDesc.trim() : null,
        });
        setFeedback({ type: 'success', message: `Subject "${subName}" created.` });
      }
      setShowSubjectModal(false);
      loadData();
    } catch (err: unknown) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Subject operation failed.',
      });
    }
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseName || !courseCode || !courseDeptId) return;

    try {
      await createCourse({
        name: courseName.trim(),
        code: courseCode.trim().toUpperCase(),
        departmentId: courseDeptId,
        degree: courseDegree.trim(),
        total_semesters: 8,
      });
      setFeedback({ type: 'success', message: `Course "${courseName}" added.` });
      setShowCourseModal(false);
      setCourseName('');
      setCourseCode('');
      loadData();
    } catch (err: unknown) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Course creation failed.',
      });
    }
  };

  const confirmDeleteSubject = async () => {
    if (!deleteSubjectTarget) return;
    try {
      setIsDeleting(true);
      await deleteSubject(deleteSubjectTarget.id);
      setFeedback({
        type: 'success',
        message: `Subject "${deleteSubjectTarget.name}" deleted successfully.`,
      });
      setDeleteSubjectTarget(null);
      loadData();
    } catch (err: unknown) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to delete subject.',
      });
      setDeleteSubjectTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#E7E3DA] gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif-heading font-semibold text-[#141413]">
            Curriculum Taxonomy Management
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#5C5955]">
            Configure departments, degree courses, and subject syllabi with active-use deletion safeguards.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCourseModal(true)}
            className="text-xs gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Course</span>
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleOpenSubjectModal()}
            className="text-xs gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Subject</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="text-xs gap-1.5 text-[#9E2B25] hover:bg-[#FDF2F1]"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </Button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-[var(--radius-sm)] border text-xs flex items-center justify-between ${
            feedback.type === 'success'
              ? 'bg-[#EEF7F1] border-[#1C5436]/20 text-[#1C5436]'
              : 'bg-[#FDF2F1] border-[#9E2B25]/20 text-[#9E2B25]'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs underline hover:no-underline ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter toolbar */}
      <div className="p-4 rounded-[var(--radius-md)] border border-[#E7E3DA] bg-white grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-[#5C5955] mb-1">Department</label>
          <Select
            value={selectedDeptId}
            onChange={(e) => {
              setSelectedDeptId(e.target.value);
              setSelectedCourseId('');
            }}
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.code})
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#5C5955] mb-1">Course</label>
          <Select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
          >
            <option value="">All Courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.code})
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#5C5955] mb-1">Semester</label>
          <Select
            value={selectedSemester || ''}
            onChange={(e) =>
              setSelectedSemester(e.target.value ? Number(e.target.value) : undefined)
            }
          >
            <option value="">All Semesters</option>
            {SEMESTERS.map((s) => (
              <option key={s} value={s}>
                Semester {s}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Subjects Table */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-14 rounded-[var(--radius-sm)]" />
          ))}
        </div>
      ) : subjects.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-[#E7E3DA] rounded-[var(--radius-md)] bg-white text-xs text-[#5C5955]">
          <BookOpen className="w-6 h-6 mx-auto mb-2 text-[#87837B]" />
          <p className="font-medium text-[#141413]">No subjects found for current filters</p>
          <p className="mt-1">Add new subjects or clear department filters to inspect all records.</p>
        </div>
      ) : (
        <div className="border border-[#E7E3DA] rounded-[var(--radius-md)] bg-white overflow-hidden shadow-hairline">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FAF8F4] border-b border-[#E7E3DA] text-[#5C5955] font-semibold">
                <th className="p-3.5 pl-4">Subject Name</th>
                <th className="p-3.5">Code</th>
                <th className="p-3.5">Semester</th>
                <th className="p-3.5 hidden md:table-cell">Syllabus Description</th>
                <th className="p-3.5 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E3DA]">
              {subjects.map((sub) => (
                <tr key={sub.id} className="hover:bg-[#FAF8F4]/50 transition-colors">
                  <td className="p-3.5 pl-4 font-medium text-[#141413]">{sub.name}</td>
                  <td className="p-3.5 font-mono text-[#5C5955]">{sub.code}</td>
                  <td className="p-3.5 text-[#5C5955]">Sem {sub.semester}</td>
                  <td className="p-3.5 hidden md:table-cell text-[#87837B] max-w-xs truncate">
                    {sub.syllabus_description || '—'}
                  </td>
                  <td className="p-3.5 pr-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenSubjectModal(sub)}
                        className="p-1 text-[#5C5955] hover:text-[#183B32]"
                        title="Edit subject"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteSubjectTarget(sub)}
                        className="p-1 text-[#5C5955] hover:text-[#9E2B25]"
                        title="Delete subject"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Subject Modal Form */}
      {showSubjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141413]/40 backdrop-blur-[2px]">
          <div className="w-full max-w-md p-6 rounded-[var(--radius-lg)] border border-[#E7E3DA] bg-white shadow-xl space-y-4">
            <h3 className="text-base font-serif-heading font-semibold text-[#141413]">
              {editingSubject ? 'Edit Subject' : 'Add New Subject'}
            </h3>

            <form onSubmit={handleSaveSubject} className="space-y-3 text-xs">
              <div>
                <label className="block text-xs font-medium text-[#5C5955] mb-1">
                  Course Program <span className="text-[#87837B] font-normal">(Optional)</span>
                </label>
                <Select
                  value={subCourseId}
                  onChange={(e) => setSubCourseId(e.target.value)}
                >
                  <option value="">None (Standalone Subject)</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#5C5955] mb-1">
                  Subject Name *
                </label>
                <Input
                  placeholder="e.g. Distributed Systems"
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#5C5955] mb-1">
                    Subject Code *
                  </label>
                  <Input
                    placeholder="CS602"
                    value={subCode}
                    onChange={(e) => setSubCode(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#5C5955] mb-1">
                    Semester *
                  </label>
                  <Select
                    value={subSemester}
                    onChange={(e) => setSubSemester(Number(e.target.value))}
                  >
                    {SEMESTERS.map((s) => (
                      <option key={s} value={s}>
                        Semester {s}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#5C5955] mb-1">
                  Syllabus Description (Optional)
                </label>
                <textarea
                  rows={2}
                  className="w-full rounded-[var(--radius-sm)] border border-[#E7E3DA] bg-white p-2 text-xs text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#183B32]"
                  placeholder="Consensus protocols, RPCs, Raft, vector clocks..."
                  value={subDesc}
                  onChange={(e) => setSubDesc(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E7E3DA]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSubjectModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  {editingSubject ? 'Update Subject' : 'Save Subject'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Course Modal Form */}
      {showCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141413]/40 backdrop-blur-[2px]">
          <div className="w-full max-w-md p-6 rounded-[var(--radius-lg)] border border-[#E7E3DA] bg-white shadow-xl space-y-4">
            <h3 className="text-base font-serif-heading font-semibold text-[#141413]">
              Add Degree Course
            </h3>

            <form onSubmit={handleSaveCourse} className="space-y-3 text-xs">
              <div>
                <label className="block text-xs font-medium text-[#5C5955] mb-1">
                  Department *
                </label>
                <Select
                  value={courseDeptId}
                  onChange={(e) => setCourseDeptId(e.target.value)}
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#5C5955] mb-1">
                  Course Name *
                </label>
                <Input
                  placeholder="e.g. Master of Computer Applications"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#5C5955] mb-1">
                    Course Code *
                  </label>
                  <Input
                    placeholder="MCA"
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#5C5955] mb-1">
                    Degree Level *
                  </label>
                  <Input
                    placeholder="MCA / B.Tech / M.Sc"
                    value={courseDegree}
                    onChange={(e) => setCourseDegree(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E7E3DA]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCourseModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Create Course
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Subject Confirmation Modal with in-use protection */}
      <ConfirmDialog
        open={Boolean(deleteSubjectTarget)}
        onOpenChange={(open) => !open && setDeleteSubjectTarget(null)}
        title="Delete Subject?"
        description={`Are you sure you want to delete subject "${deleteSubjectTarget?.name}"? The system will automatically reject this operation if there are resources currently attached to it.`}
        confirmLabel="Confirm Deletion"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={confirmDeleteSubject}
      />
    </div>
  );
};
