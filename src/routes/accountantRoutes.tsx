
import React from 'react';
import { Route } from 'react-router-dom';
import { AccountantRoute } from './routeComponents';
import GerenciarClientes from '../pages/GerenciarClientes';
import CalculosFiscais from '../pages/CalculosFiscais';
import GerenciarParametrosFiscais from '../pages/GerenciarParametrosFiscais';

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
];
