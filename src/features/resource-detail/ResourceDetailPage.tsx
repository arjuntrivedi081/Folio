import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  getResourceById,
  getRelatedResources,
  trackResourceView,
  trackResourceDownload,
} from '../../services/resources.service';
import { getResourceSignedUrl } from '../../services/storage.service';
import type { EnrichedResource } from '../../types/domain';
import { ROUTES } from '../../config/routes';
import { FileTypeBadge } from '../../components/resources/FileTypeBadge';
import { BookmarkButton } from '../../components/resources/BookmarkButton';
import { PdfPreview } from '../../components/resources/PdfPreview';
import { ImagePreview } from '../../components/resources/ImagePreview';
import { ResourceCard } from '../../components/resources/ResourceCard';
import { EmptyState } from '../../components/common/EmptyState';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { useBookmarks } from '../../hooks/useBookmarks';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import {
  formatCategory,
  formatDate,
  formatExamType,
  formatUnit,
  formatSemester,
} from '../../lib/format';
import {
  Download,
  Share2,
  Calendar,
  BookOpen,
  GraduationCap,
  ArrowLeft,
  Check,
  Building2,
  FileCheck2,
} from 'lucide-react';

export const ResourceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [resource, setResource] = useState<EnrichedResource | null>(null);
  const [related, setRelated] = useState<EnrichedResource[]>([]);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [urlLoading, setUrlLoading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const { isBookmarked, toggle } = useBookmarks();
  useDocumentTitle(resource ? resource.title : 'Resource Detail');

  useEffect(() => {
    if (!id) return;
    let isMounted = true;

    async function loadResource() {
      try {
        setLoading(true);
        const data = await getResourceById(id!);
        if (isMounted && data) {
          setResource(data);
          trackResourceView(data.id);

          // Save last viewed subject for personalized home recommendations
          if (data.subject_id) {
            try {
              localStorage.setItem('folio_last_viewed_subject_id', data.subject_id);
              if (data.subject?.name) {
                localStorage.setItem('folio_last_viewed_subject_name', data.subject.name);
              }
            } catch {
              // Ignore local storage error in sandboxed environment
            }
          }

          // Fetch related resources
          const rel = await getRelatedResources(data.id, data.subject_id, data.category_id, 3);
          if (isMounted) setRelated(rel);

          // Request signed URL for preview/download
          try {
            setUrlLoading(true);
            const url = await getResourceSignedUrl(data.file_path, false, data.original_filename);
            if (isMounted) setSignedUrl(url);
          } catch (storageErr) {
            console.warn('Could not generate signed preview URL:', storageErr);
          } finally {
            if (isMounted) setUrlLoading(false);
          }
        }
      } catch (err) {
        console.error('Error fetching resource detail:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadResource();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleDownload = async () => {
    if (!resource) return;
    try {
      setDownloading(true);
      trackResourceDownload(resource.id);
      const downloadUrl = await getResourceSignedUrl(
        resource.file_path,
        true,
        resource.original_filename
      );
      // Trigger download
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = resource.original_filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.error('Download error:', e);
      // Fallback: open signedUrl directly if available
      if (signedUrl) {
        window.open(signedUrl, '_blank');
      }
    } finally {
      setDownloading(false);
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-3/4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="md:col-span-2 h-[450px]" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="max-w-xl mx-auto py-12">
        <EmptyState
          title="Document not found"
          description="The requested academic resource does not exist or has been removed from the repository."
          actionLabel="Back to library"
          onAction={() => (window.location.href = ROUTES.LIBRARY)}
        />
      </div>
    );
  }

  const isPdf = resource.mime_type.includes('pdf');
  const isImage = resource.mime_type.startsWith('image/');
  const subject = resource.subject;
  const course = subject?.course;
  const department = course?.department;

  return (
    <div className="space-y-10">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link
          to={ROUTES.LIBRARY}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#5C5955] hover:text-[#141413] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Library</span>
        </Link>

        <div className="flex items-center gap-2">
          <BookmarkButton
            isBookmarked={isBookmarked(resource.id)}
            onToggle={() => toggle(resource.id)}
            showLabel
          />
          <Button
            variant="outline"
            size="sm"
            onClick={copyShareLink}
            className="h-8 gap-1.5 text-xs"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Copied' : 'Share'}</span>
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleDownload}
            isLoading={downloading}
            className="h-8 gap-1.5 text-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </Button>
        </div>
      </div>

      {/* Main Header / Title (Editorial Serif) */}
      <div className="space-y-3 pb-6 border-b border-[#E7E3DA]">
        <div className="flex items-center gap-2 text-xs text-[#5C5955] flex-wrap">
          <Link
            to={ROUTES.CATEGORY(resource.category_id)}
            className="font-medium text-[#183B32] hover:underline"
          >
            {formatCategory(resource.category_id)}
          </Link>
          <span aria-hidden="true" className="text-[#87837B]">·</span>
          <span>{formatSemester(resource.semester)}</span>
          <span aria-hidden="true" className="text-[#87837B]">·</span>
          <span>{formatUnit(resource.unit)}</span>
          {resource.exam_type !== 'None' && (
            <>
              <span aria-hidden="true" className="text-[#87837B]">·</span>
              <span className="text-[#141413] font-medium">{formatExamType(resource.exam_type)}</span>
            </>
          )}
          {resource.academic_year && (
            <>
              <span aria-hidden="true" className="text-[#87837B]">·</span>
              <span>Academic Year {resource.academic_year}</span>
            </>
          )}
        </div>

        <h1 className="text-2xl sm:text-4xl font-serif-heading font-semibold text-[#141413] tracking-tight leading-tight">
          {resource.title}
        </h1>

        {resource.description && (
          <p className="text-sm text-[#5C5955] leading-relaxed max-w-3xl pt-1">
            {resource.description}
          </p>
        )}
      </div>

      {/* Grid: Document Preview Viewport + Metadata sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 cols: Inline viewer / preview */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xs font-semibold text-[#87837B] uppercase tracking-wider">
            Document Viewport
          </h2>

          {urlLoading ? (
            <Skeleton className="h-[500px] w-full" />
          ) : signedUrl ? (
            isPdf ? (
              <PdfPreview
                url={signedUrl}
                title={resource.title}
                originalFilename={resource.original_filename}
                onDownload={handleDownload}
              />
            ) : isImage ? (
              <ImagePreview
                url={signedUrl}
                title={resource.title}
                onDownload={handleDownload}
              />
            ) : (
              <div className="p-8 text-center border border-[#E7E3DA] rounded-[var(--radius-md)] bg-white">
                <FileCheck2 className="w-8 h-8 mx-auto text-[#183B32] mb-3" />
                <p className="text-sm font-medium text-[#141413] mb-1">Binary Document File</p>
                <p className="text-xs text-[#5C5955] mb-4">Click download to inspect this file locally.</p>
                <Button variant="primary" size="sm" onClick={handleDownload} className="gap-2">
                  <Download className="w-3.5 h-3.5" />
                  Download File
                </Button>
              </div>
            )
          ) : (
            <div className="p-8 text-center border border-[#E7E3DA] rounded-[var(--radius-md)] bg-white text-xs text-[#5C5955]">
              <p>Secure signed URL unavailable. Please check that Supabase storage policies are configured.</p>
            </div>
          )}
        </div>

        {/* Right col: Structural Metadata Card */}
        <aside className="p-6 rounded-[var(--radius-md)] border border-[#E7E3DA] bg-white space-y-5 shadow-hairline">
          <h3 className="text-sm font-serif-heading font-medium text-[#141413] pb-3 border-b border-[#E7E3DA]">
            Curricular Context
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <span className="text-[#87837B] block mb-0.5">Subject</span>
              <span className="font-medium text-[#141413] text-sm">
                {subject?.name || 'General Subject'}
              </span>
              {subject?.code && (
                <span className="block text-[#5C5955] font-mono mt-0.5">
                  Code: {subject.code}
                </span>
              )}
            </div>

            {course && (
              <div className="pt-3 border-t border-[#E7E3DA]">
                <span className="text-[#87837B] block mb-0.5">Course / Degree</span>
                <span className="font-medium text-[#141413]">
                  {course.name} ({course.degree})
                </span>
              </div>
            )}

            {department && (
              <div className="pt-3 border-t border-[#E7E3DA]">
                <span className="text-[#87837B] block mb-0.5">Department</span>
                <span className="text-[#141413]">{department.name}</span>
              </div>
            )}

            <div className="pt-3 border-t border-[#E7E3DA]">
              <span className="text-[#87837B] block mb-1">File Attributes</span>
              <FileTypeBadge
                mimeType={resource.mime_type}
                fileSizeBytes={resource.file_size_bytes}
              />
              <span className="block text-[#87837B] mt-1 font-mono text-[11px] truncate">
                {resource.original_filename}
              </span>
            </div>

            <div className="pt-3 border-t border-[#E7E3DA]">
              <span className="text-[#87837B] block mb-0.5">Archived On</span>
              <span className="text-[#141413] tabular-numbers">
                {formatDate(resource.created_at)}
              </span>
            </div>

            {/* Tags (Zero-Pill: unboxed inline text) */}
            {resource.tags && resource.tags.length > 0 && (
              <div className="pt-3 border-t border-[#E7E3DA]">
                <span className="text-[#87837B] block mb-1">Indexed Keywords</span>
                <div className="flex flex-wrap gap-1 text-[#5C5955]">
                  {resource.tags.map((tag, idx) => (
                    <span key={tag}>
                      #{tag}
                      {idx < (resource.tags?.length || 0) - 1 ? ' · ' : ''}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#E7E3DA]">
            <Button
              variant="primary"
              size="md"
              onClick={handleDownload}
              isLoading={downloading}
              className="w-full gap-2 text-xs"
            >
              <Download className="w-4 h-4" />
              Download Full Material
            </Button>
          </div>
        </aside>
      </div>

      {/* Related Resources Section */}
      {related.length > 0 && (
        <section className="pt-10 border-t border-[#E7E3DA]">
          <h2 className="text-xl font-serif-heading font-semibold text-[#141413] mb-4">
            Related Curriculum Documents
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {related.map((rel) => (
              <ResourceCard
                key={rel.id}
                resource={rel}
                isBookmarked={isBookmarked(rel.id)}
                onToggleBookmark={() => toggle(rel.id)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
