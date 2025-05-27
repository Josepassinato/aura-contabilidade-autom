
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PaymentAlertsManager } from '@/components/admin/payment-alerts/PaymentAlertsManager';

const PaymentAlerts = () => {
  return (
    <DashboardLayout>
      <PaymentAlertsManager />
    </DashboardLayout>
  );
};

export default PaymentAlerts;
