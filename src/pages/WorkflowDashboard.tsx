import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from '@/contexts/auth';
import { Navigate } from 'react-router-dom';
import { ProblemsDashboard } from "@/components/workflow/ProblemsDashboard";

const WorkflowDashboardPage = () => {
  const { isAuthenticated, isAccountant, isLoading } = useAuth();

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAccountant) {
    return <Navigate to="/" replace />;
  }

  return (
    <DashboardLayout>
      <ProblemsDashboard />
    </DashboardLayout>
  );
};

export default WorkflowDashboardPage;