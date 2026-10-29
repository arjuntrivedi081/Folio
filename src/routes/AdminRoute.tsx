import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isSessionActive } from '../lib/adminSession';
import { ROUTES } from '../config/routes';

export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  if (!isSessionActive()) {
    return <Navigate to={ROUTES.ADMIN_LOGIN} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
