import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SecurityDashboard } from '@/components/admin/SecurityDashboard';

export default function SecurityManagement() {
  return (
    <DashboardLayout>
      <SecurityDashboard />
    </DashboardLayout>
  );
}