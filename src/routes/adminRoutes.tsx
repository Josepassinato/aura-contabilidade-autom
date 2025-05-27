
import React from 'react';
import { Route } from 'react-router-dom';
import { AdminRoute } from './routeComponents';
import BusinessAnalytics from '../pages/admin/BusinessAnalytics';
import CustomerManagement from '../pages/admin/CustomerManagement';
import UsageMetrics from '../pages/admin/UsageMetrics';
import OpenAIManagement from '../pages/admin/OpenAIManagement';
import UserManagement from '../pages/UserManagement';

// Export an array of Route elements
export const adminRoutes = [
  <Route key="admin-analytics" path="/admin/analytics" element={
    <AdminRoute>
      <BusinessAnalytics />
    </AdminRoute>
  } />,
  <Route key="admin-business-analytics" path="/admin/business-analytics" element={
    <AdminRoute>
      <BusinessAnalytics />
    </AdminRoute>
  } />,
  <Route key="admin-customer-management" path="/admin/customer-management" element={
    <AdminRoute>
      <CustomerManagement />
    </AdminRoute>
  } />,
  <Route key="admin-usage-metrics" path="/admin/usage-metrics" element={
    <AdminRoute>
      <UsageMetrics />
    </AdminRoute>
  } />,
  <Route key="admin-openai-management" path="/admin/openai-management" element={
    <AdminRoute>
      <OpenAIManagement />
    </AdminRoute>
  } />,
  <Route key="admin-user-management" path="/admin/user-management" element={
    <AdminRoute>
      <UserManagement />
    </AdminRoute>
  } />,
];
