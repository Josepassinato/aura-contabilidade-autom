
import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth';

interface RouteProps {
  children: ReactNode;
}

// Protected Route component that wraps routes requiring authentication
export const ProtectedRoute: React.FC<RouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return null; // Or a loading spinner
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Admin Route component that wraps routes requiring admin authentication
export const AdminRoute: React.FC<RouteProps> = ({ children }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  
  if (isLoading) {
    return null; // Or a loading spinner
  }
  
  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Accountant Route component that wraps routes requiring accountant authentication
export const AccountantRoute: React.FC<RouteProps> = ({ children }) => {
  const { isAuthenticated, isAccountant, isLoading } = useAuth();
  
  if (isLoading) {
    return null; // Or a loading spinner
  }
  
  if (!isAuthenticated || !isAccountant) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};
