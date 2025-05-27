import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { AdminRoute } from '@/components/auth/AdminRoute';
import CustomerManagement from '@/pages/admin/CustomerManagement';
import BusinessAnalytics from '@/pages/admin/BusinessAnalytics';
import UsageMetrics from '@/pages/admin/UsageMetrics';
import UserManagement from '@/pages/admin/UserManagement';
import OpenAIKeys from '@/pages/admin/OpenAIKeys';
import PaymentAlerts from '@/pages/admin/PaymentAlerts';

const AdminRoutes = () => (
  <Routes>
    <Route path="/admin/customer-management" element={<AdminRoute component={CustomerManagement} />} />
    <Route path="/admin/business-analytics" element={<AdminRoute component={BusinessAnalytics} />} />
    <Route path="/admin/usage-metrics" element={<AdminRoute component={UsageMetrics} />} />
    <Route path="/user-management" element={<AdminRoute component={UserManagement} />} />
    <Route path="/admin/openai-management" element={<AdminRoute component={OpenAIKeys} />} />
    <Route path="/admin/payment-alerts" element={<AdminRoute component={PaymentAlerts} />} />
  </Routes>
);

export default AdminRoutes;
