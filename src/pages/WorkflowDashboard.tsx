import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from '@/contexts/auth';
import { Navigate } from 'react-router-dom';
import { WorkflowDashboard } from "@/components/workflow";

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
      <div className="container mx-auto p-6 max-w-7xl">
        <WorkflowDashboard />
      </div>
    </DashboardLayout>
  );
};

export default WorkflowDashboardPage;