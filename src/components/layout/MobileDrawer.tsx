import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { brand } from '../../config/brand';
import { ROUTES } from '../../config/routes';
import { Logo } from '../common/Logo';
import { slideDrawerVariants, fadeInVariants } from '../../lib/motion';
import { X, Upload, Bookmark, Calendar, LayoutDashboard, LogOut, FolderTree } from 'lucide-react';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
  onLogout?: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  isAdmin,
  onLogout,
}) => {
  const location = useLocation();

  // Scroll lock and Escape listener
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Close on route change
  useEffect(() => {
    onClose();
  }, [location.pathname]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <motion.div
            variants={fadeInVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
            className="fixed inset-0 bg-[#141413]/40 backdrop-blur-[2px]"
          />

          {/* Drawer content */}
          <motion.div
            variants={slideDrawerVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="relative w-full max-w-xs h-full bg-[#FAF8F4] border-l border-[#E7E3DA] p-6 shadow-2xl flex flex-col justify-between overflow-y-auto"
          >
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#E7E3DA]">
                <Logo variant="full" size="sm" />
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-[var(--radius-sm)] text-[#5C5955] hover:text-[#141413]"
                  aria-label="Close navigation menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links with min 44px touch targets */}
              <nav className="mt-6 flex flex-col space-y-1">
                <Link
                  to={ROUTES.HOME}
                  className="flex items-center min-h-[44px] px-3 text-sm font-medium text-[#141413] rounded-[var(--radius-sm)] hover:bg-[#F4F1EA]"
                >
                  Home Overview
                </Link>
                <Link
                  to={ROUTES.LIBRARY}
                  className="flex items-center min-h-[44px] px-3 text-sm font-medium text-[#141413] rounded-[var(--radius-sm)] hover:bg-[#F4F1EA]"
                >
                  Browse Library
                </Link>
                <Link
                  to={ROUTES.CATEGORY('notes')}
                  className="flex items-center min-h-[44px] px-3 text-sm text-[#5C5955] rounded-[var(--radius-sm)] hover:bg-[#F4F1EA]"
                >
                  Lecture Notes
                </Link>
                <Link
                  to={ROUTES.CATEGORY('mst_papers')}
                  className="flex items-center min-h-[44px] px-3 text-sm text-[#5C5955] rounded-[var(--radius-sm)] hover:bg-[#F4F1EA]"
                >
                  MST Question Papers
                </Link>
                <Link
                  to={ROUTES.CATEGORY('est_papers')}
                  className="flex items-center min-h-[44px] px-3 text-sm text-[#5C5955] rounded-[var(--radius-sm)] hover:bg-[#F4F1EA]"
                >
                  EST Question Papers
                </Link>
                <Link
                  to={ROUTES.CATEGORY('lab_manuals')}
                  className="flex items-center min-h-[44px] px-3 text-sm text-[#5C5955] rounded-[var(--radius-sm)] hover:bg-[#F4F1EA]"
                >
                  Lab Manuals
                </Link>
                <Link
                  to={ROUTES.CATEGORY('viva_questions')}
                  className="flex items-center min-h-[44px] px-3 text-sm text-[#5C5955] rounded-[var(--radius-sm)] hover:bg-[#F4F1EA]"
                >
                  Viva Questions
                </Link>
                <Link
                  to={ROUTES.CATEGORY('assignments')}
                  className="flex items-center min-h-[44px] px-3 text-sm text-[#5C5955] rounded-[var(--radius-sm)] hover:bg-[#F4F1EA]"
                >
                  Assignments
                </Link>

                <div className="pt-3 border-t border-[#E7E3DA]">
                  <Link
                    to={ROUTES.SAVED}
                    className="flex items-center gap-2.5 min-h-[44px] px-3 text-sm font-medium text-[#141413] rounded-[var(--radius-sm)] hover:bg-[#F4F1EA]"
                  >
                    <Bookmark className="w-4 h-4 text-[#183B32]" />
                    <span>Saved Resources</span>
                  </Link>
                  <Link
                    to={ROUTES.EXAM_PREP}
                    className="flex items-center gap-2.5 min-h-[44px] px-3 text-sm font-medium text-[#141413] rounded-[var(--radius-sm)] hover:bg-[#F4F1EA]"
                  >
                    <Calendar className="w-4 h-4 text-[#183B32]" />
                    <span>Exam Preparation</span>
                  </Link>
                  <Link
                    to={ROUTES.ADMIN_UPLOAD}
                    className="flex items-center gap-2.5 min-h-[44px] px-3 text-sm font-medium text-[#183B32] rounded-[var(--radius-sm)] hover:bg-[#F4F1EA]"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Material</span>
                  </Link>
                </div>

                {isAdmin && (
                  <div className="pt-3 border-t border-[#E7E3DA]">
                    <div className="px-3 pb-1 text-[11px] font-semibold text-[#87837B] uppercase tracking-wider">
                      Administration
                    </div>
                    <Link
                      to={ROUTES.ADMIN}
                      className="flex items-center gap-2.5 min-h-[44px] px-3 text-sm font-medium text-[#183B32] rounded-[var(--radius-sm)] hover:bg-[#F4F1EA]"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Admin Dashboard</span>
                    </Link>
                    <Link
                      to={ROUTES.ADMIN_MANAGE}
                      className="flex items-center gap-2.5 min-h-[44px] px-3 text-sm font-medium text-[#183B32] rounded-[var(--radius-sm)] hover:bg-[#F4F1EA]"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Manage Repository</span>
                    </Link>
                    <Link
                      to={ROUTES.ADMIN_TAXONOMY}
                      className="flex items-center gap-2.5 min-h-[44px] px-3 text-sm font-medium text-[#183B32] rounded-[var(--radius-sm)] hover:bg-[#F4F1EA]"
                    >
                      <FolderTree className="w-4 h-4" />
                      <span>Curriculum Taxonomy</span>
                    </Link>
                    {onLogout && (
                      <button
                        type="button"
                        onClick={() => {
                          onLogout();
                          onClose();
                        }}
                        className="flex items-center gap-2.5 min-h-[44px] w-full px-3 text-sm font-medium text-[#9E2B25] rounded-[var(--radius-sm)] hover:bg-[#F4F1EA] text-left cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Log Out</span>
                      </button>
                    )}
                  </div>
                )}
              </nav>
            </div>

            <div className="pt-6 border-t border-[#E7E3DA] text-xs text-[#87837B]">
              <p>{brand.name} · University Archive</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
