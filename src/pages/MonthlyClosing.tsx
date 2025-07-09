import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from '@/contexts/auth';
import { Navigate } from 'react-router-dom';
import { MonthlyClosingDashboard } from "@/components/closing/MonthlyClosingDashboard";

const MonthlyClosingPage = () => {
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
      <MonthlyClosingDashboard />
    </DashboardLayout>
  );
};

export default MonthlyClosingPage;