import React from 'react';
import { Link } from 'react-router-dom';
import type { EnrichedResource } from '../../types/domain';
import { ROUTES } from '../../config/routes';
import { FileTypeBadge } from './FileTypeBadge';
import { BookmarkButton } from './BookmarkButton';
import { formatCategory, formatDate } from '../../lib/format';
import { ArrowUpRight } from 'lucide-react';

interface ResourceRowProps {
  resource: EnrichedResource;
  isBookmarked: boolean;
  onToggleBookmark: () => Promise<boolean | void>;
}

export const ResourceRow: React.FC<ResourceRowProps> = ({
  resource,
  isBookmarked,
  onToggleBookmark,
}) => {
  const subjectName = resource.subject?.name || 'General';
  const categoryLabel = formatCategory(resource.category_id);

  return (
    <div className="group flex flex-col md:flex-row md:items-center justify-between p-4 bg-white border border-[#E7E3DA] rounded-[var(--radius-sm)] transition-colors hover:border-[#183B32]/40 gap-3">
      {/* Title & Subject */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-xs text-[#5C5955] mb-1">
          <span className="font-medium text-[#183B32]">{categoryLabel}</span>
          <span aria-hidden="true">·</span>
          <span>Sem {resource.semester}</span>
          <span aria-hidden="true">·</span>
          <span>{resource.academic_year}</span>
        </div>
        <Link
          to={ROUTES.RESOURCE_DETAIL(resource.id)}
          className="text-sm font-semibold text-[#141413] hover:text-[#183B32] transition-colors block truncate"
        >
          {resource.title}
        </Link>
        <p className="text-xs text-[#5C5955] truncate mt-0.5">
          {subjectName}
        </p>
      </div>

      {/* File type, size and date */}
      <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 text-xs text-[#5C5955] border-t md:border-t-0 pt-2 md:pt-0 border-[#E7E3DA]">
        <div className="flex flex-col md:items-end">
          <FileTypeBadge
            mimeType={resource.mime_type}
            fileSizeBytes={resource.file_size_bytes}
          />
          <span className="text-[11px] text-[#87837B] tabular-numbers">
            {formatDate(resource.created_at)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <BookmarkButton
            isBookmarked={isBookmarked}
            onToggle={onToggleBookmark}
            size="sm"
          />
          <Link
            to={ROUTES.RESOURCE_DETAIL(resource.id)}
            className="p-1.5 rounded-[var(--radius-xs)] border border-[#E7E3DA] text-[#183B32] hover:bg-[#FAF8F4] transition-colors"
            aria-label={`Open ${resource.title}`}
          >
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
