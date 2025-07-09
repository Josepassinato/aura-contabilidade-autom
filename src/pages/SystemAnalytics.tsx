import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';
import { useAuth } from '@/contexts/auth';
import { AccessRestriction } from '@/components/settings/AccessRestriction';

const SystemAnalytics = () => {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
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
          <h1 className="text-3xl font-bold tracking-tight">Analytics do Sistema</h1>
          <p className="text-muted-foreground">
            Monitoramento de performance e métricas detalhadas
          </p>
        </div>
        <AnalyticsDashboard />
      </div>
    </DashboardLayout>
  );
};

export default SystemAnalytics;