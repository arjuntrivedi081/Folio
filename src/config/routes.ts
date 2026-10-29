export const ROUTES = {
  HOME: '/',
  LIBRARY: '/library',
  CATEGORY: (slug: string) => `/category/${slug}`,
  CATEGORY_ROUTE: '/category/:slug',
  RESOURCE_DETAIL: (id: string) => `/resource/${id}`,
  RESOURCE_DETAIL_ROUTE: '/resource/:id',
  SAVED: '/saved',
  EXAM_PREP: '/exam-prep',
  SETUP: '/setup',

  // Admin routes
  ADMIN: '/admin',
  ADMIN_LOGIN: '/admin/login',
  ADMIN_UPLOAD: '/admin/upload',
  ADMIN_MANAGE: '/admin/manage',
  ADMIN_EDIT: (id: string) => `/admin/edit/${id}`,
  ADMIN_EDIT_ROUTE: '/admin/edit/:id',
  ADMIN_TAXONOMY: '/admin/taxonomy',
} as const;
