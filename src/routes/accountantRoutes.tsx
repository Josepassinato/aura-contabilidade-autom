
import React from 'react';
import { Route } from 'react-router-dom';
import { AccountantRoute } from './routeComponents';
import GerenciarClientes from '../pages/GerenciarClientes';
import CalculosFiscais from '../pages/CalculosFiscais';
import GerenciarParametrosFiscais from '../pages/GerenciarParametrosFiscais';
import WorkflowDashboard from '../pages/WorkflowDashboard';
import MonthlyClosing from '../pages/MonthlyClosing';

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
];
