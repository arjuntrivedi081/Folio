import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getResources } from '../../services/resources.service';
import { toggleResourcePublish, deleteAdminResource } from '../../services/admin.service';
import type { EnrichedResource } from '../../types/domain';
import { ROUTES } from '../../config/routes';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useDebounce } from '../../hooks/useDebounce';
import { formatBytes, formatDate, formatCategory } from '../../lib/format';
import { Button } from '../../components/ui/button';
import { useAdminSession } from '../../lib/adminSession';
import { SearchInput } from '../../components/common/SearchInput';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Pagination } from '../../components/common/Pagination';
import { EmptyState } from '../../components/common/EmptyState';
import { Skeleton } from '../../components/ui/skeleton';
import {
  Edit3,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  Upload,
  ArrowUpRight,
  Filter,
  LogOut,
} from 'lucide-react';
import { useRealtimeSync } from '../../hooks/useRealtimeSync';

export const AdminManagePage: React.FC = () => {
  useDocumentTitle('Manage Academic Resources');
  const { logout } = useAdminSession();

  const [resources, setResources] = useState<EnrichedResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  // Deletion modal state
  const [deleteTarget, setDeleteTarget] = useState<EnrichedResource | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadResources = async () => {
    try {
      setLoading(true);
      const res = await getResources(
        {
          search: debouncedSearch,
          page,
          pageSize,
          sortBy: 'newest',
        },
        true // includeDrafts = true for admin
      );

      let filtered = res.data;
      if (statusFilter !== 'all') {
        filtered = filtered.filter((r) => r.status === statusFilter);
      }

      setResources(filtered);
      setTotal(res.total);
    } catch (e) {
      console.error('Error loading resources for management:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, [debouncedSearch, page, statusFilter]);

  // Realtime subscription: updates list immediately when resources change
  useRealtimeSync({
    table: 'resources',
    onEvent: () => {
      loadResources();
    },
  });

  const handleTogglePublish = async (resource: EnrichedResource) => {
    const nextStatus = resource.status === 'published' ? 'draft' : 'published';
    try {
      await toggleResourcePublish(resource.id, nextStatus);
      setResources((prev) =>
        prev.map((r) => (r.id === resource.id ? { ...r, status: nextStatus } : r))
      );
    } catch (e) {
      alert(`Could not toggle status: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await deleteAdminResource(deleteTarget.id, deleteTarget.file_path);
      setResources((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (e) {
      alert(`Delete failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
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
            Curated Document Management
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#5C5955]">
            Review publishing status, replace files, edit metadata, and execute deletions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="primary" size="sm" className="gap-1.5 text-xs">
            <Link to={ROUTES.ADMIN_UPLOAD}>
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Material</span>
            </Link>
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

      {/* Toolbar: Search & Status Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="max-w-md w-full">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by title, subject, or academic year..."
          />
        </div>

        {/* Segmented status filter tabs (functional buttons) */}
        <div className="flex items-center gap-1 p-1 bg-[#F4F1EA] rounded-[var(--radius-sm)] self-end sm:self-auto text-xs">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-[var(--radius-xs)] font-medium transition-colors cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-white text-[#141413] shadow-sm'
                : 'text-[#5C5955] hover:text-[#141413]'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('published')}
            className={`px-3 py-1.5 rounded-[var(--radius-xs)] font-medium transition-colors cursor-pointer ${
              statusFilter === 'published'
                ? 'bg-white text-[#141413] shadow-sm'
                : 'text-[#5C5955] hover:text-[#141413]'
            }`}
          >
            Published
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('draft')}
            className={`px-3 py-1.5 rounded-[var(--radius-xs)] font-medium transition-colors cursor-pointer ${
              statusFilter === 'draft'
                ? 'bg-white text-[#141413] shadow-sm'
                : 'text-[#5C5955] hover:text-[#141413]'
            }`}
          >
            Drafts
          </button>
        </div>
      </div>

      {/* Management Table */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 rounded-[var(--radius-sm)]" />
          ))}
        </div>
      ) : resources.length === 0 ? (
        <EmptyState
          title="No documents matching query"
          description="Try broadening your search term or change the status filter."
          actionLabel="Upload new material"
          onAction={() => (window.location.href = ROUTES.ADMIN_UPLOAD)}
        />
      ) : (
        <div className="border border-[#E7E3DA] rounded-[var(--radius-md)] bg-white overflow-hidden shadow-hairline">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF8F4] border-b border-[#E7E3DA] text-[#5C5955] font-semibold">
                  <th className="p-3.5 pl-4">Title & Subject</th>
                  <th className="p-3.5 hidden sm:table-cell">Category</th>
                  <th className="p-3.5 hidden md:table-cell">File & Size</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 hidden lg:table-cell">Uploaded</th>
                  <th className="p-3.5 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E3DA]">
                {resources.map((item) => (
                  <tr key={item.id} className="hover:bg-[#FAF8F4]/50 transition-colors">
                    <td className="p-3.5 pl-4 max-w-xs">
                      <Link
                        to={ROUTES.ADMIN_EDIT(item.id)}
                        className="font-medium text-[#141413] hover:text-[#183B32] block truncate"
                      >
                        {item.title}
                      </Link>
                      <span className="text-[11px] text-[#87837B] block truncate mt-0.5">
                        {item.subject?.name || 'General'} · Sem {item.semester} · {item.academic_year}
                      </span>
                    </td>

                    <td className="p-3.5 hidden sm:table-cell text-[#5C5955]">
                      {formatCategory(item.category_id)}
                    </td>

                    <td className="p-3.5 hidden md:table-cell text-[#5C5955] font-mono tabular-numbers">
                      {formatBytes(item.file_size_bytes)}
                    </td>

                    <td className="p-3.5">
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(item)}
                        className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-[var(--radius-xs)] cursor-pointer transition-colors ${
                          item.status === 'published'
                            ? 'bg-[#EEF7F1] text-[#1C5436] hover:bg-[#D5EFE0]'
                            : 'bg-[#FFF9ED] text-[#946300] hover:bg-[#FCEAC5]'
                        }`}
                        title="Click to toggle status"
                      >
                        {item.status === 'published' ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        <span>{item.status}</span>
                      </button>
                    </td>

                    <td className="p-3.5 hidden lg:table-cell text-[#87837B] tabular-numbers">
                      {formatDate(item.created_at)}
                    </td>

                    <td className="p-3.5 pr-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={ROUTES.RESOURCE_DETAIL(item.id)}
                          className="p-1 rounded text-[#5C5955] hover:text-[#141413]"
                          title="View live resource"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          to={ROUTES.ADMIN_EDIT(item.id)}
                          className="p-1 rounded text-[#5C5955] hover:text-[#183B32]"
                          title="Edit metadata & file"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(item)}
                          className="p-1 rounded text-[#5C5955] hover:text-[#9E2B25] cursor-pointer"
                          title="Delete resource"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-[#FAF8F4] border-t border-[#E7E3DA]">
            <Pagination
              currentPage={page}
              totalPages={Math.ceil(total / pageSize)}
              totalItems={total}
              pageSize={pageSize}
              onPageChange={setPage}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Permanently Delete Resource?"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This will permanently remove the database entry and delete the associated file from Supabase storage.`}
        confirmLabel="Delete Material"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </div>
  );
};
