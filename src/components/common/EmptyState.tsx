import React from 'react';
import { BookOpen } from 'lucide-react';
import { Button } from '../ui/button';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No resources found',
  description = 'There are no academic resources matching the current filters or query.',
  actionLabel,
  onAction,
  icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-[#E7E3DA] rounded-[var(--radius-lg)] bg-white/40 my-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FAF8F4] border border-[#E7E3DA] text-[#87837B] mb-4">
        {icon || <BookOpen className="h-5 w-5" />}
      </div>
      <h3 className="text-base font-serif-heading font-medium text-[#141413] mb-1">
        {title}
      </h3>
      <p className="max-w-md text-sm text-[#5C5955] leading-relaxed mb-5">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
