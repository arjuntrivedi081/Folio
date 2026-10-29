import React from 'react';
import { motion } from 'motion/react';
import { brand } from '../../config/brand';
import { cn } from '../../lib/utils';

export interface LogoProps {
  variant?: 'full' | 'mark';
  theme?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg' | number;
  className?: string;
  animate?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'full',
  theme = 'light',
  size = 'md',
  className,
  animate = true,
}) => {
  const isDark = theme === 'dark';
  const strokeColor = isDark ? '#FAF8F4' : '#141413';
  const foldColor = '#183B32';

  // Size resolution
  let markSize = 28;
  let textSize = 'text-lg';
  if (typeof size === 'number') {
    markSize = size;
  } else if (size === 'sm') {
    markSize = 22;
    textSize = 'text-base';
  } else if (size === 'lg') {
    markSize = 36;
    textSize = 'text-2xl';
  }

  return (
    <div
      className={cn('inline-flex items-center gap-2.5 select-none group', className)}
      aria-label={`${brand.name} logo`}
    >
      {/* Editorial Monogram Mark: Hairline Page with Folded Dog-Ear & "F" Letterform */}
      <motion.svg
        width={markSize}
        height={markSize}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-200"
        whileHover={animate ? { scale: 1.04 } : undefined}
      >
        {/* Page boundary with cut top-right corner */}
        <path
          d="M6 3H21L27 9V29H6V3Z"
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeLinejoin="round"
          className="transition-colors"
        />

        {/* Folded Dog-Ear Flap with gentle entrance & hover lift */}
        <motion.path
          d="M21 3V9H27L21 3Z"
          fill={foldColor}
          stroke={strokeColor}
          strokeWidth="1.25"
          strokeLinejoin="round"
          initial={animate ? { opacity: 0, scale: 0.8, x: 2, y: -2 } : false}
          animate={animate ? { opacity: 1, scale: 1, x: 0, y: 0 } : false}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          whileHover={animate ? { x: 0.75, y: -0.75 } : undefined}
        />

        {/* Monogram "F" inside page */}
        {/* Vertical Stem */}
        <line
          x1="11.5"
          y1="10"
          x2="11.5"
          y2="23"
          stroke={strokeColor}
          strokeWidth="1.75"
          strokeLinecap="round"
        />
        {/* Top Horizontal Bar */}
        <line
          x1="11.5"
          y1="10"
          x2="18.5"
          y2="10"
          stroke={strokeColor}
          strokeWidth="1.75"
          strokeLinecap="round"
        />
        {/* Middle Horizontal Bar */}
        <line
          x1="11.5"
          y1="15"
          x2="16.5"
          y2="15"
          stroke={strokeColor}
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </motion.svg>

      {/* Editorial Wordmark */}
      {variant === 'full' && (
        <span
          className={cn(
            'font-serif-heading font-semibold tracking-tight leading-none',
            textSize,
            isDark ? 'text-[#FAF8F4]' : 'text-[#141413]'
          )}
        >
          {brand.name}
        </span>
      )}
    </div>
  );
};
