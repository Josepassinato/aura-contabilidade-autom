import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from '@/contexts/auth';
import { Navigate } from 'react-router-dom';
import { EnhancedWorkflowInterface } from "@/components/workflow/EnhancedWorkflowInterface";

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
      <div className="h-[calc(100vh-4rem)]">
        <EnhancedWorkflowInterface />
      </div>
    </DashboardLayout>
  );
};

export default WorkflowDashboardPage;