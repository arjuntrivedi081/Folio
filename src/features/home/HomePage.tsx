import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  ArrowRight,
  BookOpen,
  Sparkles,
  Upload,
  Clock,
  Compass,
} from 'lucide-react';
import { brand } from '../../config/brand';
import { ROUTES } from '../../config/routes';
import { RESOURCE_TYPES } from '../../config/constants';
import {
  getRecentResources,
  getMoreFromSubject,
} from '../../services/resources.service';
import type { EnrichedResource } from '../../types/domain';
import { ResourceCard } from '../../components/resources/ResourceCard';
import { useBookmarks } from '../../hooks/useBookmarks';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { useRealtimeSync } from '../../hooks/useRealtimeSync';

export const HomePage: React.FC = () => {
  useDocumentTitle('Academic Resource Archive & Examination Repository');
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [justAddedResources, setJustAddedResources] = useState<EnrichedResource[]>([]);
  const [recommendedResources, setRecommendedResources] = useState<EnrichedResource[]>([]);
  const [recommendedSubjectName, setRecommendedSubjectName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const { isBookmarked, toggle, bookmarkedIds } = useBookmarks();

  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch newest published resources from real database
      const recent = await getRecentResources(6);
      setJustAddedResources(recent);

      // Check if student has bookmarked or recently viewed a subject
      let targetSubjectId: string | null = null;
      let targetSubjectName: string = '';

      // Check recently viewed subject in localStorage
      const lastSubjectId = localStorage.getItem('folio_last_viewed_subject_id');
      const lastSubjectName = localStorage.getItem('folio_last_viewed_subject_name');

      if (lastSubjectId && lastSubjectName) {
        targetSubjectId = lastSubjectId;
        targetSubjectName = lastSubjectName;
      } else if (recent.length > 0 && recent[0].subject_id) {
        // Fallback to the subject of the newest resource
        targetSubjectId = recent[0].subject_id;
        targetSubjectName = recent[0].subject?.name || '';
      }

      if (targetSubjectId) {
        const more = await getMoreFromSubject(targetSubjectId, undefined, 4);
        setRecommendedResources(more);
        setRecommendedSubjectName(targetSubjectName);
      } else {
        setRecommendedResources([]);
      }
    } catch (e) {
      console.warn('Could not load real home resources:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Realtime subscription: updates when a new resource is published or updated
  useRealtimeSync({
    table: 'resources',
    onEvent: () => {
      loadData();
    },
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`${ROUTES.LIBRARY}?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate(ROUTES.LIBRARY);
    }
  };

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* Search-First Editorial Hero with masked line-by-line entrance */}
      <section className="pt-6 pb-2 text-center max-w-4xl mx-auto px-4">
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 text-xs text-[#5C5955] tracking-wide uppercase font-medium"
          >
            <span>University Syllabus Repository</span>
            <span aria-hidden="true">·</span>
            <span>Accredited Academic Notes</span>
          </motion.div>

          {/* Masked rise headline */}
          <div className="overflow-hidden py-1">
            <motion.h1
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
              className="text-3xl sm:text-5xl lg:text-6xl font-serif-heading font-medium text-[#141413] tracking-tight leading-[1.15]"
            >
              Curated lecture notes and previous examination archives.
            </motion.h1>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="max-w-2xl mx-auto text-sm sm:text-base text-[#5C5955] leading-relaxed"
          >
            Direct access to mid-semester test papers, end-term examinations, lab manuals,
            and unit-wise handwritten summaries for higher education.
          </motion.p>
        </div>

        {/* Global Search Bar */}
        <motion.form
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
          onSubmit={handleSearchSubmit}
          className="mt-8 max-w-2xl mx-auto relative flex items-center"
        >
          <Search className="absolute left-4 w-5 h-5 text-[#87837B] pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by subject name, course code, MST, EST, or unit..."
            className="w-full h-12 pl-12 pr-28 rounded-[var(--radius-md)] border border-[#E7E3DA] bg-white text-sm text-[#141413] placeholder:text-[#87837B] shadow-sm transition-all focus:outline-none focus:ring-1 focus:ring-[#183B32] focus:border-[#183B32]"
          />
          <button
            type="submit"
            className="absolute right-1.5 h-9 px-4 bg-[#183B32] text-white hover:bg-[#112A24] text-xs font-medium rounded-[var(--radius-sm)] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <span>Search</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </motion.form>

        {/* Quick query chips */}
        <div className="mt-4 flex items-center justify-center gap-2 flex-wrap text-xs text-[#5C5955]">
          <span className="text-[#87837B]">Explore:</span>
          {['Lecture Notes', 'MST Papers', 'EST Papers', 'Lab Manuals'].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => {
                navigate(`${ROUTES.LIBRARY}?q=${encodeURIComponent(tag)}`);
              }}
              className="text-[#183B32] hover:underline cursor-pointer"
            >
              {tag}
            </button>
          ))}
        </div>
      </section>

      {/* SECTION 1: "Just Added" (Opens at the very top, below search hero, sorted created_at desc) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-baseline justify-between pb-4 border-b border-[#E7E3DA] mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs text-[#183B32] font-semibold mb-1 uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5" />
              <span>Just Added</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif-heading font-semibold text-[#141413]">
              Latest Academic Releases
            </h2>
            <p className="text-xs text-[#5C5955] mt-0.5">
              Live repository feed sorted by newest additions.
            </p>
          </div>

          <Link
            to={ROUTES.LIBRARY}
            className="text-xs font-medium text-[#183B32] hover:text-[#112A24] inline-flex items-center gap-1 shrink-0"
          >
            <span>View All ({justAddedResources.length})</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 rounded-[var(--radius-md)]" />
            ))}
          </div>
        ) : justAddedResources.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-[#E7E3DA] rounded-[var(--radius-md)] bg-white space-y-4">
            <BookOpen className="w-8 h-8 mx-auto text-[#87837B]" />
            <div className="space-y-1">
              <h3 className="text-base font-serif-heading font-medium text-[#141413]">
                No study materials published yet
              </h3>
              <p className="text-xs text-[#5C5955] max-w-sm mx-auto">
                Be the first to upload lecture slides, mid-semester test papers, or lab manuals.
              </p>
            </div>
            <Button asChild variant="primary" size="sm" className="gap-1.5">
              <Link to={ROUTES.ADMIN_UPLOAD}>
                <Upload className="w-3.5 h-3.5" />
                <span>Upload First Resource</span>
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence mode="popLayout">
              {justAddedResources.map((res) => (
                <motion.div
                  key={res.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <ResourceCard
                    resource={res}
                    isBookmarked={isBookmarked(res.id)}
                    onToggleBookmark={() => toggle(res.id)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* SECTION 2: "More from <Subject>" (Only rendered when real data exists) */}
      {recommendedResources.length > 0 && recommendedSubjectName && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-baseline justify-between pb-4 border-b border-[#E7E3DA] mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs text-[#183B32] font-semibold mb-1 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Subject Spotlight</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif-heading font-semibold text-[#141413]">
                More from {recommendedSubjectName}
              </h2>
              <p className="text-xs text-[#5C5955] mt-0.5">
                Related papers, lab codes, and unit notes from this course module.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recommendedResources.map((res) => (
              <ResourceCard
                key={res.id}
                resource={res}
                isBookmarked={isBookmarked(res.id)}
                onToggleBookmark={() => toggle(res.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* SECTION 3: Categorical Archives Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-baseline justify-between pb-4 border-b border-[#E7E3DA] mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-serif-heading font-semibold text-[#141413]">
              Curriculum Archives
            </h2>
            <p className="text-xs text-[#5C5955] mt-0.5">
              Structured archives indexed by syllabus requirements and examination stages
            </p>
          </div>
          <Link
            to={ROUTES.LIBRARY}
            className="text-xs font-medium text-[#183B32] hover:text-[#112A24] inline-flex items-center gap-1"
          >
            <span>Explore All</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {RESOURCE_TYPES.map((cat) => (
            <Link
              key={cat.id}
              to={ROUTES.CATEGORY(cat.id)}
              className="group p-5 rounded-[var(--radius-md)] border border-[#E7E3DA] bg-white transition-all duration-200 hover:border-[#183B32]/40 hover:-translate-y-0.5 shadow-hairline flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-mono text-[#87837B] block mb-2 uppercase">
                  ARCHIVE /{cat.id}
                </span>
                <h3 className="text-base font-serif-heading font-medium text-[#141413] group-hover:text-[#183B32] transition-colors">
                  {cat.label}
                </h3>
                <p className="mt-1.5 text-xs text-[#5C5955] leading-relaxed line-clamp-2">
                  {cat.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#E7E3DA] flex items-center justify-between text-xs text-[#183B32] font-medium">
                <span>Browse Category</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};
