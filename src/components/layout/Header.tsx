import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { brand } from '../../config/brand';
import { ROUTES } from '../../config/routes';
import { useBookmarks } from '../../hooks/useBookmarks';
import { useAdminSession } from '../../lib/adminSession';
import { Logo } from '../common/Logo';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '../ui/dropdown';
import {
  Upload,
  Menu,
  ChevronDown,
  LayoutDashboard,
  Bookmark,
  Calendar,
  Compass,
  LogOut,
  FolderTree,
} from 'lucide-react';
import { MobileDrawer } from './MobileDrawer';

export const Header: React.FC = () => {
  const { bookmarkedIds } = useBookmarks();
  const { isAdmin, logout } = useAdminSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Browse All', path: ROUTES.LIBRARY, icon: Compass },
    { label: 'Lecture Notes', path: ROUTES.CATEGORY('notes') },
    { label: 'MST Papers', path: ROUTES.CATEGORY('mst_papers') },
    { label: 'EST Papers', path: ROUTES.CATEGORY('est_papers') },
  ];

  return (
    <>
      <a href="#main-content" className="skip-to-content sr-only focus:not-sr-only">
        Skip to main content
      </a>

      <header
        className={`sticky top-0 z-40 w-full transition-colors duration-200 ${
          isScrolled
            ? 'bg-[#FAF8F4]/95 border-b border-[#E7E3DA] backdrop-blur-sm'
            : 'bg-[#FAF8F4] border-b border-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
          {/* Zone 1: Brand Wordmark using Logo component */}
          <Link
            to={ROUTES.HOME}
            className="flex items-center text-[#141413] hover:opacity-90 transition-opacity whitespace-nowrap shrink-0 group focus:outline-none focus-visible:ring-1 focus-visible:ring-[#183B32]"
            aria-label={`${brand.name} home`}
          >
            <Logo variant="full" size="md" />
          </Link>

          {/* Zone 2: Navigation Links with sliding underline */}
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-5 text-xs font-medium text-[#5C5955]"
          >
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative py-1 hover:text-[#141413] transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                    isActive ? 'text-[#183B32] font-semibold' : ''
                  }`}
                >
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeNavUnderline"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#183B32] rounded-full"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}

            {/* Overflow Archives menu */}
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center gap-1 hover:text-[#141413] transition-colors whitespace-nowrap shrink-0 outline-none cursor-pointer">
                <span>Archives</span>
                <ChevronDown className="w-3 h-3 text-[#87837B]" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem asChild>
                  <Link to={ROUTES.CATEGORY('lab_manuals')} className="w-full">
                    Lab Manuals
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={ROUTES.CATEGORY('practical_papers')} className="w-full">
                    Practical Papers
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={ROUTES.CATEGORY('viva_questions')} className="w-full">
                    Viva Questions
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={ROUTES.CATEGORY('assignments')} className="w-full">
                    Assignments
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={ROUTES.CATEGORY('previous_year_papers')} className="w-full">
                    Previous-Year Papers
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to={ROUTES.EXAM_PREP} className="w-full flex items-center justify-between">
                    <span>Exam Prep Countdown</span>
                    <Calendar className="w-3 h-3 text-[#87837B]" />
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link
              to={ROUTES.SAVED}
              className={`relative py-1 hover:text-[#141413] transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                location.pathname === ROUTES.SAVED ? 'text-[#183B32] font-semibold' : ''
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Saved</span>
              {bookmarkedIds.length > 0 && (
                <span className="flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-[#183B32] text-[10px] font-medium text-white">
                  {bookmarkedIds.length}
                </span>
              )}
              {location.pathname === ROUTES.SAVED && (
                <motion.div
                  layoutId="activeNavUnderline"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#183B32] rounded-full"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          </nav>

          {/* Zone 3: Direct Actions & Curator Tools */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Upload Material entry stays visible to everyone */}
            <Button asChild variant="primary" size="sm" className="hidden sm:inline-flex gap-1.5">
              <Link to={ROUTES.ADMIN_UPLOAD}>
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Material</span>
              </Link>
            </Button>

            {/* Admin menu: Visible only when the admin session is active */}
            {isAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-1.5 h-8 px-2.5 rounded-[var(--radius-sm)] border border-[#E7E3DA] bg-white text-xs font-medium text-[#141413] hover:bg-[#F4F1EA] transition-colors outline-none cursor-pointer"
                    aria-label="Manage portal"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-[#183B32]" />
                    <span className="hidden sm:inline">Admin</span>
                    <ChevronDown className="w-3 h-3 text-[#87837B]" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to={ROUTES.ADMIN} className="w-full flex items-center gap-2">
                      <LayoutDashboard className="w-3.5 h-3.5 text-[#183B32]" />
                      <span>Admin Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={ROUTES.ADMIN_UPLOAD} className="w-full flex items-center gap-2">
                      <Upload className="w-3.5 h-3.5 text-[#183B32]" />
                      <span>Upload Material</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={ROUTES.ADMIN_MANAGE} className="w-full flex items-center gap-2">
                      <span>Manage Repository</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={ROUTES.ADMIN_TAXONOMY} className="w-full flex items-center gap-2">
                      <FolderTree className="w-3.5 h-3.5 text-[#183B32]" />
                      <span>Curriculum Taxonomy</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    className="w-full flex items-center gap-2 text-[#9E2B25] hover:text-[#9E2B25] cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] border border-[#E7E3DA] bg-white text-[#141413] hover:bg-[#F4F1EA] transition-colors"
              aria-label="Open mobile navigation menu"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Accessible Mobile Drawer */}
      <MobileDrawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        isAdmin={isAdmin}
        onLogout={logout}
      />
    </>
  );
};
