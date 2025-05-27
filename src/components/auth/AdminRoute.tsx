
import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';

interface AdminRouteProps {
  component: React.ComponentType;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ component: Component }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  
  if (isLoading) {
    return null; // Or a loading spinner
  }
  
  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/login" replace />;
  }
  
  return <Component />;
};
