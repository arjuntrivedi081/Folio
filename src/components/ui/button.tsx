import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      asChild = false,
      isLoading = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring-focus)] focus-visible:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

    const variants = {
      primary:
        'bg-[#183B32] text-[#FAF8F4] hover:bg-[#112A24] active:bg-[#0B1E19] shadow-sm',
      secondary:
        'bg-[#FAF8F4] text-[#141413] border border-[#E7E3DA] hover:bg-[#F3EFE6] active:bg-[#EBE5D8]',
      outline:
        'border border-[#E7E3DA] text-[#141413] bg-transparent hover:bg-[#F4F1EA] active:bg-[#ECE6DC]',
      ghost:
        'text-[#141413] bg-transparent hover:bg-[#F4F1EA] active:bg-[#ECE6DC]',
      danger:
        'bg-[#9E2B25] text-white hover:bg-[#85231E] active:bg-[#6D1B17]',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs rounded-[var(--radius-sm)] gap-1.5',
      md: 'h-10 px-4 text-sm rounded-[var(--radius-md)] gap-2',
      lg: 'h-12 px-6 text-base rounded-[var(--radius-md)] gap-2.5',
      icon: 'h-9 w-9 p-0 rounded-[var(--radius-sm)]',
    };

    const combinedClassName = cn(baseStyles, variants[variant], sizes[size], className);

    if (asChild) {
      return (
        <Slot ref={ref} className={combinedClassName} {...props}>
          {children}
        </Slot>
      );
    }

    return (
      <button
        ref={ref}
        className={combinedClassName}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
