import React, { useState, useEffect } from 'react';
import { useBookmarks } from '../../hooks/useBookmarks';
import { fetchBookmarkedResources } from '../../services/bookmarks.service';
import type { EnrichedResource } from '../../types/domain';
import { ResourceCard } from '../../components/resources/ResourceCard';
import { SearchInput } from '../../components/common/SearchInput';
import { EmptyState } from '../../components/common/EmptyState';
import { ROUTES } from '../../config/routes';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useRealtimeSync } from '../../hooks/useRealtimeSync';
import { Bookmark, ShieldCheck } from 'lucide-react';

export const SavedPage: React.FC = () => {
  useDocumentTitle('Saved Academic Resources');
  const { bookmarkedIds, toggle, isBookmarked, loading: bookmarksLoading } = useBookmarks();

  const [resources, setResources] = useState<EnrichedResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    if (bookmarksLoading) return;
    try {
      setLoading(true);
      const data = await fetchBookmarkedResources(bookmarkedIds);
      setResources(data);
    } catch {
      // Non-blocking
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [bookmarkedIds, bookmarksLoading]);

  useRealtimeSync({
    table: 'resources',
    onEvent: () => {
      loadData();
    },
  });

  const filtered = resources.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.title.toLowerCase().includes(q) ||
      (r.description && r.description.toLowerCase().includes(q)) ||
      (r.subject?.name && r.subject.name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-6 border-b border-[#E7E3DA]">
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs text-[#183B32] font-medium mb-1">
              <Bookmark className="w-3.5 h-3.5" />
              <span>Personal Study Shelf</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif-heading font-semibold text-[#141413]">
              Saved Academic Resources
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#5C5955]">
              Quickly revisit bookmarked lecture slides, previous year papers, and lab manuals.
            </p>
            <p className="mt-1.5 text-[11px] text-[#87837B] flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-[#183B32]" />
              <span>Saved on this browser only · Private and accessible without an account</span>
            </p>
          </div>
          <div className="text-xs font-medium text-[#5C5955] px-2.5 py-1 rounded-[var(--radius-xs)] bg-[#F4F1EA] border border-[#E7E3DA] self-start sm:self-auto">
            {bookmarkedIds.length} item{bookmarkedIds.length === 1 ? '' : 's'} preserved
          </div>
        </div>

        {/* Search bar inside Saved */}
        {bookmarkedIds.length > 0 && (
          <div className="mt-5 max-w-md">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search your saved documents..."
            />
          </div>
        )}
      </div>

      {/* Grid or Empty */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-44 rounded-[var(--radius-md)] border border-[#E7E3DA] bg-white p-5 animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={searchQuery ? 'No matching bookmarks' : 'Your saved shelf is empty'}
          description={
            searchQuery
              ? 'No saved resources match your query.'
              : 'Click the bookmark icon on any lecture notes, MST questions, or syllabus papers while browsing to save them here for instant access.'
          }
          actionLabel="Explore Academic Catalog"
          onAction={() => (window.location.href = ROUTES.LIBRARY)}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              isBookmarked={isBookmarked(resource.id)}
              onToggleBookmark={() => toggle(resource.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
