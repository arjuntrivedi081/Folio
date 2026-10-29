import React from 'react';
import { Link } from 'react-router-dom';
import type { EnrichedResource } from '../../types/domain';
import { ROUTES } from '../../config/routes';
import { FileTypeBadge } from './FileTypeBadge';
import { BookmarkButton } from './BookmarkButton';
import { formatCategory, formatExamType, formatUnit } from '../../lib/format';
import { ArrowUpRight } from 'lucide-react';

interface ResourceCardProps {
  resource: EnrichedResource;
  isBookmarked: boolean;
  onToggleBookmark: () => Promise<boolean | void>;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  isBookmarked,
  onToggleBookmark,
}) => {
  const subjectName = resource.subject?.name || 'General';
  const courseCode = resource.subject?.course?.code || '';
  const categoryLabel = formatCategory(resource.category_id);
  const isExam = resource.exam_type && resource.exam_type !== 'None';
  const isNew = Date.now() - new Date(resource.created_at).getTime() < 7 * 24 * 60 * 60 * 1000;

  return (
    <article className="group relative flex flex-col justify-between p-5 rounded-[var(--radius-md)] border border-[#E7E3DA] bg-white transition-all duration-200 hover:border-[#183B32]/50 hover:-translate-y-1 shadow-hairline">
      <div>
        {/* Top Unboxed Metadata Kicker (Zero-Pill discipline) */}
        <div className="flex items-center justify-between text-xs text-[#5C5955] mb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {isNew && (
              <span className="text-[10px] font-semibold text-[#183B32] bg-[#EFF4F2] px-1.5 py-0.5 rounded-[var(--radius-xs)] border border-[#183B32]/30 tracking-wider">
                NEW
              </span>
            )}
            <span className="font-medium text-[#183B32]">{categoryLabel}</span>
            <span aria-hidden="true" className="text-[#87837B]">·</span>
            <span>Sem {resource.semester}</span>
            {isExam && (
              <>
                <span aria-hidden="true" className="text-[#87837B]">·</span>
                <span className="text-[#141413]">{formatExamType(resource.exam_type)}</span>
              </>
            )}
          </div>
          <BookmarkButton
            isBookmarked={isBookmarked}
            onToggle={onToggleBookmark}
            size="sm"
          />
        </div>

        {/* Primary Title */}
        <h3 className="text-base font-serif-heading font-semibold text-[#141413] leading-snug group-hover:text-[#183B32] transition-colors line-clamp-2">
          <Link
            to={ROUTES.RESOURCE_DETAIL(resource.id)}
            className="focus:outline-none focus-visible:underline"
          >
            {resource.title}
          </Link>
        </h3>

        {/* Subject & Department subtitle */}
        <p className="mt-1.5 text-xs text-[#5C5955] line-clamp-1">
          {subjectName} {courseCode ? `(${courseCode})` : ''}
        </p>

        {/* Description snippet if present */}
        {resource.description && (
          <p className="mt-2 text-xs text-[#87837B] line-clamp-2 leading-relaxed">
            {resource.description}
          </p>
        )}
      </div>

      {/* Card Footer: Metadata and Action */}
      <div className="mt-4 pt-3 border-t border-[#E7E3DA] flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <FileTypeBadge
            mimeType={resource.mime_type}
            fileSizeBytes={resource.file_size_bytes}
          />
          <span className="text-[11px] text-[#87837B]">
            {formatUnit(resource.unit)} · {resource.academic_year}
          </span>
        </div>

        <Link
          to={ROUTES.RESOURCE_DETAIL(resource.id)}
          className="inline-flex items-center gap-1 text-xs font-medium text-[#183B32] hover:text-[#112A24] transition-colors p-1"
          aria-label={`Open ${resource.title}`}
        >
          <span>View</span>
          <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>
      </div>
    </article>
  );
};
