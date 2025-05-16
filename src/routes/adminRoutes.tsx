
import React from 'react';
import { Route } from 'react-router-dom';
import { AdminRoute } from './routeComponents';
import BusinessAnalytics from '../pages/admin/BusinessAnalytics';
import CustomerManagement from '../pages/admin/CustomerManagement';
import UsageMetrics from '../pages/admin/UsageMetrics';
import OpenAIManagement from '../pages/admin/OpenAIManagement';

export const AdminRoutes = () => (
  <>
    {/* Admin routes */}
    <Route path="/admin/analytics" element={
      <AdminRoute>
        <BusinessAnalytics />
      </AdminRoute>
    } />
    <Route path="/admin/business-analytics" element={
      <AdminRoute>
        <BusinessAnalytics />
      </AdminRoute>
    } />
    <Route path="/admin/customer-management" element={
      <AdminRoute>
        <CustomerManagement />
      </AdminRoute>
    } />
    <Route path="/admin/usage-metrics" element={
      <AdminRoute>
        <UsageMetrics />
      </AdminRoute>
    } />
    <Route path="/admin/openai-management" element={
      <AdminRoute>
        <OpenAIManagement />
      </AdminRoute>
    } />
  </>
);
