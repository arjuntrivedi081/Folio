import React, { useState } from 'react';
import { ExternalLink, Download, FileText, AlertCircle, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { Button } from '../ui/button';

interface PdfPreviewProps {
  url: string;
  title: string;
  originalFilename: string;
  onDownload: () => void;
}

export const PdfPreview: React.FC<PdfPreviewProps> = ({
  url,
  title,
  originalFilename,
  onDownload,
}) => {
  const [hasError, setHasError] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  const zoomIn = () => setZoomLevel((prev) => Math.min(prev + 25, 200));
  const zoomOut = () => setZoomLevel((prev) => Math.max(prev - 25, 75));

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-[#FAF8F4] border border-[#E7E3DA] rounded-[var(--radius-md)] text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FDF2F1] text-[#9E2B25] mb-3">
          <AlertCircle className="w-5 h-5" />
        </div>
        <h4 className="text-sm font-medium text-[#141413] mb-1">
          Inline preview unavailable in this browser
        </h4>
        <p className="text-xs text-[#5C5955] max-w-sm mb-4">
          Your browser's PDF viewer could not render this document inline, or third-party iframe blocking is enabled.
        </p>
        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm" onClick={onDownload} className="gap-1.5">
            <Download className="w-3.5 h-3.5" />
            Download PDF
          </Button>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-[var(--radius-sm)] border border-[#E7E3DA] bg-white text-[#141413] hover:bg-[#FAF8F4]"
          >
            Open in New Window <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col border border-[#E7E3DA] rounded-[var(--radius-md)] bg-white overflow-hidden shadow-hairline">
      {/* Viewer Toolbar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#FAF8F4] border-b border-[#E7E3DA] text-xs text-[#5C5955]">
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="w-4 h-4 text-[#183B32] shrink-0" />
          <span className="font-medium text-[#141413] truncate max-w-[200px] sm:max-w-xs">
            {originalFilename || title}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center border border-[#E7E3DA] rounded-[var(--radius-xs)] bg-white overflow-hidden">
            <button
              onClick={zoomOut}
              className="p-1 hover:bg-[#FAF8F4] text-[#5C5955] transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-[11px] tabular-numbers border-x border-[#E7E3DA]">
              {zoomLevel}%
            </span>
            <button
              onClick={zoomIn}
              className="p-1 hover:bg-[#FAF8F4] text-[#5C5955] transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 p-1 sm:px-2 sm:py-1 rounded-[var(--radius-xs)] border border-[#E7E3DA] bg-white text-[#141413] hover:bg-[#FAF8F4] text-xs transition-colors"
            title="Open Full File in new tab"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Fullscreen</span>
          </a>

          <Button variant="primary" size="sm" onClick={onDownload} className="h-7 px-2.5 text-xs gap-1">
            <Download className="w-3 h-3" />
            <span>Download</span>
          </Button>
        </div>
      </div>

      {/* PDF Viewport */}
      <div className="relative w-full h-[540px] sm:h-[650px] bg-[#2E3130] flex items-center justify-center overflow-auto">
        <iframe
          src={`${url}#view=FitH&zoom=${zoomLevel}`}
          title={`Document Preview: ${title}`}
          className="w-full h-full border-none"
          onError={() => setHasError(true)}
        />
      </div>
    </div>
  );
};
