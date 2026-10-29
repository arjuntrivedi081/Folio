import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  pageSize?: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
}) => {
  if (totalPages <= 1) return null;

  const startItem = totalItems !== undefined && pageSize !== undefined
    ? (currentPage - 1) * pageSize + 1
    : null;
  const endItem = totalItems !== undefined && pageSize !== undefined
    ? Math.min(currentPage * pageSize, totalItems)
    : null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 border-t border-[#E7E3DA] mt-8 text-xs text-[#5C5955]">
      <div>
        {startItem && endItem && totalItems ? (
          <span>
            Showing <span className="tabular-numbers font-medium text-[#141413]">{startItem}</span>–
            <span className="tabular-numbers font-medium text-[#141413]">{endItem}</span> of{' '}
            <span className="tabular-numbers font-medium text-[#141413]">{totalItems}</span> resources
          </span>
        ) : (
          <span>
            Page <span className="tabular-numbers font-medium text-[#141413]">{currentPage}</span> of{' '}
            <span className="tabular-numbers font-medium text-[#141413]">{totalPages}</span>
          </span>
        )}
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="h-8 px-2.5"
        >
          <ChevronLeft className="h-3.5 w-3.5 mr-1" />
          Previous
        </Button>

        <div className="px-3 tabular-numbers text-xs font-medium text-[#141413]">
          {currentPage} / {totalPages}
        </div>

        <Button
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="h-8 px-2.5"
        >
          Next
          <ChevronRight className="h-3.5 w-3.5 ml-1" />
        </Button>
      </div>
    </div>
  );
};
