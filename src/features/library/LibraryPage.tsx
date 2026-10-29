import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';
import { getResources } from '../../services/resources.service';
import type { EnrichedResource, ResourceFiltersState } from '../../types/domain';
import { ResourceCard } from '../../components/resources/ResourceCard';
import { ResourceRow } from '../../components/resources/ResourceRow';
import { ResourceFilters } from '../../components/resources/ResourceFilters';
import { SearchInput } from '../../components/common/SearchInput';
import { Pagination } from '../../components/common/Pagination';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { Skeleton } from '../../components/ui/skeleton';
import { useBookmarks } from '../../hooks/useBookmarks';
import { useDebounce } from '../../hooks/useDebounce';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { formatCategory, formatExamType, formatUnit } from '../../lib/format';
import { LayoutGrid, List, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { useRealtimeSync } from '../../hooks/useRealtimeSync';

export const LibraryPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { slug } = useParams<{ slug?: string }>();
  const navigate = useNavigate();

  // URL-synced initial filter values
  const urlCategory = slug || searchParams.get('category') || undefined;
  const urlSearch = searchParams.get('q') || '';
  const urlSemester = searchParams.get('sem') ? Number(searchParams.get('sem')) : undefined;
  const urlSubject = searchParams.get('subject') || undefined;
  const urlExamType = searchParams.get('exam') || undefined;
  const urlUnit = searchParams.get('unit') || undefined;
  const urlYear = searchParams.get('year') || undefined;
  const urlNewThisWeek = searchParams.get('new') === '1';
  const urlSort = (searchParams.get('sort') as ResourceFiltersState['sortBy']) || 'newest';
  const urlPage = searchParams.get('page') ? Number(searchParams.get('page')) : 1;

  const [searchInput, setSearchInput] = useState(urlSearch);
  const debouncedSearch = useDebounce(searchInput, 300);

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Consolidated filter state
  const [filters, setFilters] = useState<ResourceFiltersState>({
    category: urlCategory,
    search: debouncedSearch,
    semester: urlSemester,
    subjectId: urlSubject,
    examType: urlExamType,
    unit: urlUnit,
    academicYear: urlYear,
    newThisWeek: urlNewThisWeek || undefined,
    sortBy: urlSort,
    page: urlPage,
    pageSize: 12,
  });

  const [resources, setResources] = useState<EnrichedResource[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isBookmarked, toggle } = useBookmarks();

  // Document title
  const pageTitle = slug
    ? `${formatCategory(slug)} Archives`
    : 'Academic Library & Repositories';
  useDocumentTitle(pageTitle);

  // Sync debounced search to filter
  useEffect(() => {
    setFilters((prev) => ({ ...prev, search: debouncedSearch, page: 1 }));
  }, [debouncedSearch]);

  // Sync URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.search) params.set('q', filters.search);
    if (!slug && filters.category) params.set('category', filters.category);
    if (filters.semester) params.set('sem', String(filters.semester));
    if (filters.subjectId) params.set('subject', filters.subjectId);
    if (filters.examType) params.set('exam', filters.examType);
    if (filters.unit) params.set('unit', filters.unit);
    if (filters.academicYear) params.set('year', filters.academicYear);
    if (filters.newThisWeek) params.set('new', '1');
    if (filters.sortBy && filters.sortBy !== 'newest') params.set('sort', filters.sortBy);
    if (filters.page && filters.page > 1) params.set('page', String(filters.page));

    setSearchParams(params, { replace: true });
  }, [filters, slug, setSearchParams]);

  // Load resources from Supabase
  const loadResources = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getResources(filters);
      setResources(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages || 1);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to query resource library.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, [
    filters.category,
    filters.search,
    filters.semester,
    filters.subjectId,
    filters.examType,
    filters.unit,
    filters.academicYear,
    filters.newThisWeek,
    filters.sortBy,
    filters.page,
  ]);

  // Realtime updates for live catalog ingestion / modification
  useRealtimeSync({
    table: 'resources',
    onEvent: () => {
      loadResources();
    },
  });

  const handleResetFilters = () => {
    setSearchInput('');
    setFilters({
      category: slug || undefined,
      search: '',
      semester: undefined,
      subjectId: undefined,
      examType: undefined,
      unit: undefined,
      academicYear: undefined,
      newThisWeek: undefined,
      sortBy: 'newest',
      page: 1,
      pageSize: 12,
    });
  };

  // Active filter chips list for quick deletion
  const activeChips = useMemo(() => {
    const chips: { key: keyof ResourceFiltersState; label: string }[] = [];
    if (!slug && filters.category) {
      chips.push({ key: 'category', label: `Category: ${formatCategory(filters.category)}` });
    }
    if (filters.newThisWeek) {
      chips.push({ key: 'newThisWeek', label: 'Added this week' });
    }
    if (filters.semester) {
      chips.push({ key: 'semester', label: `Semester ${filters.semester}` });
    }
    if (filters.examType) {
      chips.push({ key: 'examType', label: `Exam: ${formatExamType(filters.examType)}` });
    }
    if (filters.unit) {
      chips.push({ key: 'unit', label: formatUnit(filters.unit) });
    }
    if (filters.academicYear) {
      chips.push({ key: 'academicYear', label: `Year: ${filters.academicYear}` });
    }
    return chips;
  }, [filters, slug]);

  const removeChip = (key: keyof ResourceFiltersState) => {
    setFilters((prev) => ({ ...prev, [key]: undefined, page: 1 }));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="pb-6 border-b border-[#E7E3DA]">
        <h1 className="text-2xl sm:text-3xl font-serif-heading font-semibold text-[#141413]">
          {pageTitle}
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-[#5C5955]">
          Search verified syllabus notes, test question papers, and laboratory experiment records.
        </p>

        {/* Global Search and Toolbar */}
        <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex-1 max-w-lg flex items-center gap-2">
            <div className="flex-1">
              <SearchInput
                value={searchInput}
                onChange={setSearchInput}
                placeholder="Search across all resource titles, descriptions, and tags..."
              />
            </div>
            <button
              type="button"
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  newThisWeek: prev.newThisWeek ? undefined : true,
                  page: 1,
                }))
              }
              title="Show materials uploaded in the last 7 days"
              className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-[var(--radius-xs)] border transition-all cursor-pointer ${
                filters.newThisWeek
                  ? 'bg-[#183B32] text-white border-[#183B32] shadow-xs'
                  : 'bg-white text-[#5C5955] border-[#E7E3DA] hover:border-[#87837B] hover:text-[#141413]'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  filters.newThisWeek ? 'bg-emerald-300' : 'bg-emerald-600'
                }`}
              />
              <span>New this week</span>
            </button>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Mobile Filter Sheet Trigger */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden gap-1.5"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters {activeChips.length > 0 && `(${activeChips.length})`}</span>
            </Button>

            {/* View Mode Switcher */}
            <div className="flex items-center border border-[#E7E3DA] rounded-[var(--radius-sm)] bg-white p-0.5">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-[var(--radius-xs)] text-xs transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-[#183B32] text-white'
                    : 'text-[#5C5955] hover:text-[#141413]'
                }`}
                aria-label="Grid layout view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-[var(--radius-xs)] text-xs transition-colors cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-[#183B32] text-white'
                    : 'text-[#5C5955] hover:text-[#141413]'
                }`}
                aria-label="Tabular list view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Active Filter Chips */}
        {activeChips.length > 0 && (
          <div className="mt-3 flex items-center gap-2 flex-wrap text-xs text-[#5C5955]">
            <span className="text-[#87837B]">Active filters:</span>
            {activeChips.map((chip) => (
              <span
                key={chip.key}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[var(--radius-xs)] bg-[#F4F1EA] text-[#141413] border border-[#E7E3DA]"
              >
                <span>{chip.label}</span>
                <button
                  type="button"
                  onClick={() => removeChip(chip.key)}
                  className="hover:text-[#9E2B25] p-0.5"
                  aria-label={`Remove filter ${chip.label}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-[#183B32] hover:underline ml-1"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Main Grid: Sidebar (Desktop) + Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block lg:col-span-1 sticky top-20 p-5 rounded-[var(--radius-md)] border border-[#E7E3DA] bg-white shadow-hairline">
          <ResourceFilters
            filters={filters}
            onChange={(updated) => setFilters(updated)}
            onReset={handleResetFilters}
          />
        </aside>

        {/* Resource List / Grid View */}
        <div className="lg:col-span-3 space-y-5">
          {error ? (
            <ErrorState
              title="Query failure"
              message={error}
              onRetry={loadResources}
            />
          ) : loading ? (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-44 rounded-[var(--radius-md)] border border-[#E7E3DA] bg-white p-5 animate-pulse"
                />
              ))}
            </div>
          ) : resources.length === 0 ? (
            <EmptyState
              title="No resources match criteria"
              description="Try adjusting your semester, subject, or examination filters, or clear search queries to view all entries."
              actionLabel="Reset all filters"
              onAction={handleResetFilters}
            />
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {resources.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  isBookmarked={isBookmarked(resource.id)}
                  onToggleBookmark={() => toggle(resource.id)}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2.5">
              {resources.map((resource) => (
                <ResourceRow
                  key={resource.id}
                  resource={resource}
                  isBookmarked={isBookmarked(resource.id)}
                  onToggleBookmark={() => toggle(resource.id)}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && resources.length > 0 && (
            <Pagination
              currentPage={filters.page || 1}
              totalPages={totalPages}
              totalItems={total}
              pageSize={filters.pageSize}
              onPageChange={(newPage) => {
                setFilters((prev) => ({ ...prev, page: newPage }));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}
        </div>
      </div>

      {/* Mobile Drawer Filter Dialog */}
      <Dialog open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Filter Repository</DialogTitle>
          </DialogHeader>
          <div className="pt-2">
            <ResourceFilters
              filters={filters}
              onChange={(updated) => {
                setFilters(updated);
                setMobileFilterOpen(false);
              }}
              onReset={() => {
                handleResetFilters();
                setMobileFilterOpen(false);
              }}
              isMobileDrawer
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
