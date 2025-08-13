
import React from 'react';
import { Route } from 'react-router-dom';
import { AccountantRoute } from './routeComponents';
import GerenciarClientes from '../pages/GerenciarClientes';
import CalculosFiscais from '../pages/CalculosFiscais';
import GerenciarParametrosFiscais from '../pages/GerenciarParametrosFiscais';
import WorkflowDashboard from '../pages/WorkflowDashboard';
import MonthlyClosing from '../pages/MonthlyClosing';
import Settings from '../pages/Settings';
import QRCodeManager from '../components/QRCodeManager';
import QueueManagement from "@/pages/QueueManagement";
import Reports from "@/pages/Reports";

// Export an array of Route elements
export const accountantRoutes = [
  <Route key="clientes" path="/clientes" element={
    <AccountantRoute>
      <GerenciarClientes />
    </AccountantRoute>
  } />,
  <Route key="calculos-fiscais" path="/calculos-fiscais" element={
    <AccountantRoute>
      <CalculosFiscais />
    </AccountantRoute>
  } />,
  <Route key="parametros-fiscais" path="/parametros-fiscais" element={
    <AccountantRoute>
      <GerenciarParametrosFiscais />
    </AccountantRoute>
  } />,
  <Route key="workflow-dashboard" path="/workflow-dashboard" element={
    <AccountantRoute>
      <WorkflowDashboard />
    </AccountantRoute>
  } />,
  <Route key="fechamento-mensal" path="/fechamento-mensal" element={
    <AccountantRoute>
      <MonthlyClosing />
    </AccountantRoute>
  } />,
  <Route key="agente-voz" path="/agente-voz" element={
    <AccountantRoute>
      <QRCodeManager />
    </AccountantRoute>
  } />,
  <Route key="settings" path="/settings" element={
    <AccountantRoute>
      <Settings />
    </AccountantRoute>
  } />,
  <Route key="queue-management" path="/queue-management" element={
    <AccountantRoute>
      <QueueManagement />
    </AccountantRoute>
  } />,
  <Route key="reports" path="/reports" element={
    <AccountantRoute>
      <Reports />
    </AccountantRoute>
  } />,
];
