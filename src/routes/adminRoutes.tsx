
import React from 'react';
import { Route } from 'react-router-dom';
import { AdminRoute } from '@/components/auth/AdminRoute';
import CustomerManagement from '@/pages/admin/CustomerManagement';
import BusinessAnalytics from '@/pages/admin/BusinessAnalytics';
import UsageMetrics from '@/pages/admin/UsageMetrics';
import UserManagement from '@/pages/admin/UserManagement';
import OpenAIKeys from '@/pages/admin/OpenAIKeys';
import PaymentAlerts from '@/pages/admin/PaymentAlerts';

const adminRoutes = [
  <Route key="customer-management" path="/admin/customer-management" element={<AdminRoute component={CustomerManagement} />} />,
  <Route key="business-analytics" path="/admin/business-analytics" element={<AdminRoute component={BusinessAnalytics} />} />,
  <Route key="usage-metrics" path="/admin/usage-metrics" element={<AdminRoute component={UsageMetrics} />} />,
  <Route key="user-management" path="/user-management" element={<AdminRoute component={UserManagement} />} />,
  <Route key="openai-management" path="/admin/openai-management" element={<AdminRoute component={OpenAIKeys} />} />,
  <Route key="payment-alerts" path="/admin/payment-alerts" element={<AdminRoute component={PaymentAlerts} />} />,
];

export { adminRoutes };
