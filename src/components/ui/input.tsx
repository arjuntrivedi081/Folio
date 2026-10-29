import * as React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          type={type}
          className={cn(
            'flex h-10 w-full rounded-[var(--radius-sm)] border border-[#E7E3DA] bg-white px-3 py-2 text-sm text-[#141413] placeholder:text-[#87837B] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#183B32] focus-visible:border-[#183B32] disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-[#9E2B25] focus-visible:ring-[#9E2B25] focus-visible:border-[#9E2B25]',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs text-[#9E2B25]">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
