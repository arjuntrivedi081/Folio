import React from 'react';
import { Download, Maximize2 } from 'lucide-react';
import { Button } from '../ui/button';

interface ImagePreviewProps {
  url: string;
  title: string;
  onDownload: () => void;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  url,
  title,
  onDownload,
}) => {
  return (
    <div className="flex flex-col border border-[#E7E3DA] rounded-[var(--radius-md)] bg-white overflow-hidden shadow-hairline">
      <div className="flex items-center justify-between px-3.5 py-2 bg-[#FAF8F4] border-b border-[#E7E3DA] text-xs text-[#5C5955]">
        <span className="font-medium text-[#141413] truncate max-w-xs">{title}</span>
        <div className="flex items-center gap-2">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 rounded text-[#5C5955] hover:text-[#141413]"
            title="Open Full Image"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </a>
          <Button variant="primary" size="sm" onClick={onDownload} className="h-7 px-2.5 text-xs gap-1">
            <Download className="w-3 h-3" />
            <span>Download</span>
          </Button>
        </div>
      </div>
      <div className="p-4 bg-[#F4F1EA] flex items-center justify-center min-h-[380px] max-h-[600px] overflow-auto">
        <img
          src={url}
          alt={title}
          referrerPolicy="no-referrer"
          className="max-h-[550px] object-contain rounded-[var(--radius-sm)] shadow-sm"
        />
      </div>
    </div>
  );
};
