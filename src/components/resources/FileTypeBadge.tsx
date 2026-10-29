import React from 'react';
import { formatBytes } from '../../lib/format';
import { FileText, Image as ImageIcon } from 'lucide-react';

interface FileTypeBadgeProps {
  mimeType: string;
  fileSizeBytes: number;
}

export const FileTypeBadge: React.FC<FileTypeBadgeProps> = ({
  mimeType,
  fileSizeBytes,
}) => {
  const isPdf = mimeType.includes('pdf');
  const typeLabel = isPdf ? 'PDF' : mimeType.split('/')[1]?.toUpperCase() || 'FILE';

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-[#5C5955] font-mono tabular-numbers">
      {isPdf ? (
        <FileText className="w-3.5 h-3.5 text-[#183B32] shrink-0" />
      ) : (
        <ImageIcon className="w-3.5 h-3.5 text-[#183B32] shrink-0" />
      )}
      <span>{typeLabel}</span>
      <span aria-hidden="true" className="text-[#87837B]">·</span>
      <span>{formatBytes(fileSizeBytes)}</span>
    </span>
  );
};
