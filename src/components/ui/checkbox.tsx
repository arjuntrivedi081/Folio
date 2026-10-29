import * as React from 'react';
import { cn } from '../../lib/utils';
import { Check } from 'lucide-react';

export interface CheckboxProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: string;
}

export const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ className, checked = false, onCheckedChange, label, disabled, ...props }, ref) => {
    return (
      <label
        className={cn(
          'inline-flex items-center gap-2 cursor-pointer select-none text-xs text-[#141413]',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        <button
          ref={ref}
          type="button"
          role="checkbox"
          aria-checked={checked}
          disabled={disabled}
          onClick={() => !disabled && onCheckedChange?.(!checked)}
          className={cn(
            'flex h-4 w-4 shrink-0 items-center justify-center rounded-[var(--radius-xs)] border border-[#E7E3DA] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#183B32]',
            checked ? 'bg-[#183B32] border-[#183B32] text-white' : 'bg-white hover:bg-[#FAF8F4]',
            className
          )}
          {...props}
        >
          {checked && <Check className="h-3 w-3 stroke-[3]" />}
        </button>
        {label && <span className="font-normal">{label}</span>}
      </label>
    );
  }
);
Checkbox.displayName = 'Checkbox';
