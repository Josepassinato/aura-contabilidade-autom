import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SystemReadinessCheck } from '@/components/admin/SystemReadinessCheck';

export default function SystemStatus() {
  return (
    <DashboardLayout>
      <SystemReadinessCheck />
    </DashboardLayout>
  );
}