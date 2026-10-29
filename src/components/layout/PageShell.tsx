import React from 'react';
import { cn } from '../../lib/utils';

interface PageShellProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'default' | 'narrow' | 'wide' | 'full';
}

export const PageShell: React.FC<PageShellProps> = ({
  children,
  className,
  maxWidth = 'default',
}) => {
  const widthClasses = {
    narrow: 'max-w-3xl',
    default: 'max-w-6xl',
    wide: 'max-w-7xl',
    full: 'max-w-full',
  };

  return (
    <main
      id="main-content"
      className={cn('mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full', widthClasses[maxWidth], className)}
    >
      {children}
    </main>
  );
};
