import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { QueueDashboard } from '@/components/queue/QueueDashboard';
import { useAuth } from '@/contexts/auth';
import { AccessRestriction } from '@/components/settings/AccessRestriction';

const QueueManagement = () => {
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
          <h1 className="text-3xl font-bold tracking-tight">Gerenciamento de Filas</h1>
          <p className="text-muted-foreground">
            Sistema de filas e processamento de background jobs
          </p>
        </div>
        <QueueDashboard />
      </div>
    </DashboardLayout>
  );
};

export default QueueManagement;