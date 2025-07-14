
import React from 'react';
import { Route } from 'react-router-dom';
import { AdminRoute } from '@/components/auth/AdminRoute';
import { VoiceAgentConfig } from '@/components/admin/voice-agent/VoiceAgentConfig';
import CustomerManagement from '@/pages/admin/CustomerManagement';
import BusinessAnalytics from '@/pages/admin/BusinessAnalytics';
import UsageMetrics from '@/pages/admin/UsageMetrics';
import UserManagement from '@/pages/admin/UserManagement';
import OpenAIKeys from '@/pages/admin/OpenAIKeys';
import PaymentAlerts from '@/pages/admin/PaymentAlerts';
import AutomationDashboard from '@/pages/AutomationDashboard';
import TaskAutomationEngine from '@/pages/TaskAutomationEngine';
import ReportTemplates from '@/pages/admin/ReportTemplates';
import ReportScheduler from '@/pages/admin/ReportScheduler';
import SecurityManagement from '@/pages/admin/SecurityManagement';
import SystemStatus from '@/pages/admin/SystemStatus';

const adminRoutes = [
  <Route key="customer-management" path="/admin/customer-management" element={<AdminRoute component={CustomerManagement} />} />,
  <Route key="business-analytics" path="/admin/business-analytics" element={<AdminRoute component={BusinessAnalytics} />} />,
  <Route key="usage-metrics" path="/admin/usage-metrics" element={<AdminRoute component={UsageMetrics} />} />,
  <Route key="user-management" path="/user-management" element={<AdminRoute component={UserManagement} />} />,
  <Route key="openai-management" path="/admin/openai-management" element={<AdminRoute component={OpenAIKeys} />} />,
  <Route key="payment-alerts" path="/admin/payment-alerts" element={<AdminRoute component={PaymentAlerts} />} />,
  <Route key="automation-dashboard" path="/admin/automation" element={<AdminRoute component={AutomationDashboard} />} />,
  <Route key="task-automation-engine" path="/admin/task-automation" element={<AdminRoute component={TaskAutomationEngine} />} />,
  <Route key="voice-agent-config" path="/admin/voice-agent" element={<AdminRoute component={() => <VoiceAgentConfig />} />} />,
  <Route key="report-templates" path="/admin/report-templates" element={<AdminRoute component={ReportTemplates} />} />,
  <Route key="report-scheduler" path="/admin/report-scheduler" element={<AdminRoute component={ReportScheduler} />} />,
  <Route key="security-management" path="/admin/security" element={<AdminRoute component={SecurityManagement} />} />,
  <Route key="system-status" path="/admin/system-status" element={<AdminRoute component={SystemStatus} />} />,
];

export { adminRoutes };
