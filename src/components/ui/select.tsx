import * as React from 'react';
import { cn } from '../../lib/utils';
import { ChevronDown } from 'lucide-react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <select
          ref={ref}
          className={cn(
            'flex h-10 w-full appearance-none rounded-[var(--radius-sm)] border border-[#E7E3DA] bg-white px-3 py-2 pr-8 text-sm text-[#141413] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#183B32] focus-visible:border-[#183B32] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer',
            error && 'border-[#9E2B25] focus-visible:ring-[#9E2B25] focus-visible:border-[#9E2B25]',
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-3 h-4 w-4 text-[#87837B]" />
        {error && <p className="mt-1 text-xs text-[#9E2B25]">{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';
