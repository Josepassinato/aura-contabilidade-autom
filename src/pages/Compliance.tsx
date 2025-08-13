import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ComplianceDashboard } from '@/components/compliance/ComplianceDashboard';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { useAuth } from '@/contexts/auth';
import { AccessRestriction } from '@/components/settings/AccessRestriction';

const Compliance = () => {
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
          <h1 className="text-3xl font-bold tracking-tight">Compliance & Governança</h1>
          <p className="text-muted-foreground">
            Gerenciamento de conformidade, retenção de dados e auditoria
          </p>
        </div>
        
        <ErrorBoundary>
          <ComplianceDashboard />
        </ErrorBoundary>
      </div>
    </DashboardLayout>
  );
};

export default Compliance;