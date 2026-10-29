import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '../ui/button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Unable to load resources',
  message = 'An unexpected network error occurred while querying the repository.',
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center border border-[#E7E3DA] rounded-[var(--radius-lg)] bg-white my-6">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FDF2F1] text-[#9E2B25] mb-3">
        <AlertCircle className="h-5 w-5" />
      </div>
      <h3 className="text-base font-medium text-[#141413] mb-1">{title}</h3>
      <p className="max-w-md text-sm text-[#5C5955] mb-5">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="gap-2">
          <RotateCcw className="h-3.5 w-3.5" />
          Retry query
        </Button>
      )}
    </div>
  );
};
