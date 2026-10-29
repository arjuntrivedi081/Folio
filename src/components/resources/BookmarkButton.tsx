import React, { useState } from 'react';
import { Bookmark } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { softScaleVariants } from '../../lib/motion';

interface BookmarkButtonProps {
  isBookmarked: boolean;
  onToggle: () => Promise<boolean | void>;
  size?: 'sm' | 'md';
  className?: string;
  showLabel?: boolean;
}

export const BookmarkButton: React.FC<BookmarkButtonProps> = ({
  isBookmarked,
  onToggle,
  size = 'md',
  className,
  showLabel = false,
}) => {
  const [loading, setLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    try {
      setLoading(true);
      await onToggle();
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.button
      type="button"
      variants={softScaleVariants}
      initial="initial"
      whileTap="tap"
      onClick={handleClick}
      disabled={loading}
      aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark this resource'}
      className={cn(
        'inline-flex items-center justify-center rounded-[var(--radius-sm)] border transition-colors cursor-pointer',
        isBookmarked
          ? 'bg-[#183B32] border-[#183B32] text-white hover:bg-[#112A24]'
          : 'bg-white border-[#E7E3DA] text-[#5C5955] hover:bg-[#F4F1EA] hover:text-[#141413]',
        size === 'sm' ? 'h-7 px-2 text-xs gap-1' : 'h-8 px-2.5 text-xs gap-1.5',
        className
      )}
    >
      <Bookmark
        className={cn(
          size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4',
          isBookmarked ? 'fill-current' : 'fill-none'
        )}
      />
      {showLabel && (
        <span className="font-medium">
          {isBookmarked ? 'Saved' : 'Save'}
        </span>
      )}
    </motion.button>
  );
};
