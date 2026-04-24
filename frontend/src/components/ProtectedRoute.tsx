/**
 * Protected Route Component
 * Redirects to login if not authenticated
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useResponsive';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
