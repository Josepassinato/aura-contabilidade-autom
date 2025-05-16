
import React from 'react';
import { Route } from 'react-router-dom';
import { AccountantRoute } from './routeComponents';
import GerenciarClientes from '../pages/GerenciarClientes';
import CalculosFiscais from '../pages/CalculosFiscais';
import GerenciarParametrosFiscais from '../pages/GerenciarParametrosFiscais';

export const AccountantRoutes = () => (
  <>
    {/* Routes requiring accountant privileges */}
    <Route path="/clientes" element={
      <AccountantRoute>
        <GerenciarClientes />
      </AccountantRoute>
    } />
    <Route path="/calculos-fiscais" element={
      <AccountantRoute>
        <CalculosFiscais />
      </AccountantRoute>
    } />
    <Route path="/parametros-fiscais" element={
      <AccountantRoute>
        <GerenciarParametrosFiscais />
      </AccountantRoute>
    } />
  </>
);
