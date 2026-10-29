import React, { lazy, Suspense } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { ROUTES } from '../config/routes';
import { AdminRoute } from './AdminRoute';
import { PageTransition } from '../components/layout/PageTransition';
import { Skeleton } from '../components/ui/skeleton';

// Route-level code splitting with React.lazy
const HomePage = lazy(() =>
  import('../features/home/HomePage').then((m) => ({ default: m.HomePage }))
);
const LibraryPage = lazy(() =>
  import('../features/library/LibraryPage').then((m) => ({ default: m.LibraryPage }))
);
const ResourceDetailPage = lazy(() =>
  import('../features/resource-detail/ResourceDetailPage').then((m) => ({
    default: m.ResourceDetailPage,
  }))
);
const SavedPage = lazy(() =>
  import('../features/saved/SavedPage').then((m) => ({ default: m.SavedPage }))
);
const ExamPrepPage = lazy(() =>
  import('../features/exam-prep/ExamPrepPage').then((m) => ({ default: m.ExamPrepPage }))
);
const SetupScreen = lazy(() =>
  import('../components/common/SetupScreen').then((m) => ({ default: m.SetupScreen }))
);
const AdminDashboardPage = lazy(() =>
  import('../features/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage }))
);
const AdminLoginPage = lazy(() =>
  import('../features/admin/AdminLoginPage').then((m) => ({ default: m.AdminLoginPage }))
);
const AdminUploadPage = lazy(() =>
  import('../features/admin/AdminUploadPage').then((m) => ({ default: m.AdminUploadPage }))
);
const AdminManagePage = lazy(() =>
  import('../features/admin/AdminManagePage').then((m) => ({ default: m.AdminManagePage }))
);
const AdminEditPage = lazy(() =>
  import('../features/admin/AdminEditPage').then((m) => ({ default: m.AdminEditPage }))
);
const AdminTaxonomyPage = lazy(() =>
  import('../features/admin/AdminTaxonomyPage').then((m) => ({ default: m.AdminTaxonomyPage }))
);
const NotFoundPage = lazy(() =>
  import('../pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
);

const PageFallback: React.FC = () => (
  <div className="max-w-4xl mx-auto py-12 px-4 space-y-4">
    <Skeleton className="h-8 w-48" />
    <Skeleton className="h-64 w-full" />
  </div>
);

export const AppRoutes: React.FC = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageFallback />}>
        <Routes location={location} key={location.pathname}>
          {/* Public Open Material Portal */}
          <Route
            path={ROUTES.HOME}
            element={
              <PageTransition>
                <HomePage />
              </PageTransition>
            }
          />
          <Route
            path={ROUTES.LIBRARY}
            element={
              <PageTransition>
                <LibraryPage />
              </PageTransition>
            }
          />
          <Route
            path={ROUTES.CATEGORY_ROUTE}
            element={
              <PageTransition>
                <LibraryPage />
              </PageTransition>
            }
          />
          <Route
            path={ROUTES.RESOURCE_DETAIL_ROUTE}
            element={
              <PageTransition>
                <ResourceDetailPage />
              </PageTransition>
            }
          />
          <Route
            path={ROUTES.SAVED}
            element={
              <PageTransition>
                <SavedPage />
              </PageTransition>
            }
          />
          <Route
            path={ROUTES.EXAM_PREP}
            element={
              <PageTransition>
                <ExamPrepPage />
              </PageTransition>
            }
          />

          {/* Admin Login Screen */}
          <Route
            path={ROUTES.ADMIN_LOGIN}
            element={
              <PageTransition>
                <AdminLoginPage />
              </PageTransition>
            }
          />

          {/* Legacy Auth Redirects */}
          <Route path="/auth" element={<Navigate to={ROUTES.ADMIN_LOGIN} replace />} />
          <Route path="/access-denied" element={<Navigate to={ROUTES.ADMIN_LOGIN} replace />} />

          {/* Database Setup Settings */}
          <Route
            path={ROUTES.SETUP}
            element={
              <PageTransition>
                <SetupScreen />
              </PageTransition>
            }
          />

          {/* Admin & Curator Portal (Guarded by AdminRoute session check) */}
          <Route
            path={ROUTES.ADMIN}
            element={
              <AdminRoute>
                <PageTransition>
                  <AdminDashboardPage />
                </PageTransition>
              </AdminRoute>
            }
          />
          <Route
            path={ROUTES.ADMIN_UPLOAD}
            element={
              <AdminRoute>
                <PageTransition>
                  <AdminUploadPage />
                </PageTransition>
              </AdminRoute>
            }
          />
          <Route
            path={ROUTES.ADMIN_MANAGE}
            element={
              <AdminRoute>
                <PageTransition>
                  <AdminManagePage />
                </PageTransition>
              </AdminRoute>
            }
          />
          <Route
            path={ROUTES.ADMIN_EDIT_ROUTE}
            element={
              <AdminRoute>
                <PageTransition>
                  <AdminEditPage />
                </PageTransition>
              </AdminRoute>
            }
          />
          <Route
            path={ROUTES.ADMIN_TAXONOMY}
            element={
              <AdminRoute>
                <PageTransition>
                  <AdminTaxonomyPage />
                </PageTransition>
              </AdminRoute>
            }
          />

          {/* 404 Catch-All */}
          <Route
            path="*"
            element={
              <PageTransition>
                <NotFoundPage />
              </PageTransition>
            }
          />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
};
