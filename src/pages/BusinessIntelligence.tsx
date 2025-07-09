import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { BIDashboard } from '@/components/business-intelligence/BIDashboard';
import { useAuth } from '@/contexts/auth';
import { AccessRestriction } from '@/components/settings/AccessRestriction';

const BusinessIntelligence = () => {
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
          <h1 className="text-3xl font-bold tracking-tight">Business Intelligence</h1>
          <p className="text-muted-foreground">
            Análise estratégica e insights de negócio
          </p>
        </div>
        <BIDashboard />
      </div>
    </DashboardLayout>
  );
};

export default BusinessIntelligence;