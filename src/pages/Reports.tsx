import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ReportsCenter } from '@/components/reports/ReportsCenter';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { useAuth } from '@/contexts/auth';
import { AccessRestriction } from '@/components/settings/AccessRestriction';

const Reports = () => {
  const { isAccountant, isAdmin } = useAuth();

  if (!isAccountant && !isAdmin) {
    return (
      <DashboardLayout>
        <AccessRestriction />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-muted-foreground">
            Gere e gerencie relatórios operacionais e analíticos
          </p>
        </div>
        
        <ErrorBoundary>
          <ReportsCenter />
        </ErrorBoundary>
      </div>
    </DashboardLayout>
  );
};

export default Reports;