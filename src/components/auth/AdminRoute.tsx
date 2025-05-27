
import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';

interface AdminRouteProps {
  component: React.ComponentType;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ component: Component }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  
  console.log("AdminRoute - Estado de autenticação:", { 
    isAuthenticated, 
    isAdmin, 
    isLoading 
  });
  
  if (isLoading) {
    console.log("AdminRoute - Carregando autenticação...");
    return null; // Or a loading spinner
  }
  
  if (!isAuthenticated || !isAdmin) {
    console.log("AdminRoute - Acesso negado, redirecionando para login");
    return <Navigate to="/login" replace />;
  }
  
  console.log("AdminRoute - Acesso permitido, renderizando componente");
  return <Component />;
};
