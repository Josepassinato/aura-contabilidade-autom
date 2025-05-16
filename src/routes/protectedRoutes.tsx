import React from 'react';
import { Route } from 'react-router-dom';
import { ProtectedRoute } from './routeComponents';
import Index from '../pages/Index';
import Settings from '../pages/Settings';
import RelatoriosFinanceiros from '../pages/RelatoriosFinanceiros';
import RelatoriosIA from '../pages/RelatoriosIA';
import ObrigacoesFiscais from '../pages/ObrigacoesFiscais';
import GuiasFiscais from '../pages/GuiasFiscais';
import IntegracoesGov from '../pages/IntegracoesGov';
import IntegracoesEstaduais from '../pages/IntegracoesEstaduais';
import EmailService from '../pages/EmailService';
import ClientDocuments from '../pages/ClientDocuments';
import FolhaPagamento from '../pages/FolhaPagamento';
import RegimeFiscal from '../pages/RegimeFiscal';
import ApuracaoAutomatica from '../pages/ApuracaoAutomatica';
import AnalisesPreditivas from '../pages/AnalisesPreditivas';
import Colaboradores from '../pages/Colaboradores';
import AutomacaoBancaria from '../pages/AutomacaoBancaria';
import Notifications from '../pages/Notifications';
import ClassificacaoReconciliacao from '../pages/ClassificacaoReconciliacao';

export const ProtectedRoutes = () => {
  return (
    <>
      {/* Dashboard routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <Index />
        </ProtectedRoute>
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Index />
        </ProtectedRoute>
      } />
      
      {/* Reports routes */}
      <Route path="/relatorios" element={
        <ProtectedRoute>
          <RelatoriosFinanceiros />
        </ProtectedRoute>
      } />
      <Route path="/relatorios-ia" element={
        <ProtectedRoute>
          <RelatoriosIA />
        </ProtectedRoute>
      } />
      
      {/* Other protected routes */}
      <Route path="/obrigacoes-fiscais" element={
        <ProtectedRoute>
          <ObrigacoesFiscais />
        </ProtectedRoute>
      } />
      <Route path="/guias-fiscais" element={
        <ProtectedRoute>
          <GuiasFiscais />
        </ProtectedRoute>
      } />
      <Route path="/integracoes-gov" element={
        <ProtectedRoute>
          <IntegracoesGov />
        </ProtectedRoute>
      } />
      <Route path="/integracoes-estaduais" element={
        <ProtectedRoute>
          <IntegracoesEstaduais />
        </ProtectedRoute>
      } />
      <Route path="/email-service" element={
        <ProtectedRoute>
          <EmailService />
        </ProtectedRoute>
      } />
      <Route path="/documentos" element={
        <ProtectedRoute>
          <ClientDocuments />
        </ProtectedRoute>
      } />
      <Route path="/folha-pagamento" element={
        <ProtectedRoute>
          <FolhaPagamento />
        </ProtectedRoute>
      } />
      <Route path="/regime-fiscal" element={
        <ProtectedRoute>
          <RegimeFiscal />
        </ProtectedRoute>
      } />
      <Route path="/apuracao-automatica" element={
        <ProtectedRoute>
          <ApuracaoAutomatica />
        </ProtectedRoute>
      } />
      <Route path="/analises-preditivas" element={
        <ProtectedRoute>
          <AnalisesPreditivas />
        </ProtectedRoute>
      } />
      <Route path="/colaboradores" element={
        <ProtectedRoute>
          <Colaboradores />
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      } />
      <Route path="/automacao-bancaria" element={
        <ProtectedRoute>
          <AutomacaoBancaria />
        </ProtectedRoute>
      } />
      <Route path="/notifications" element={
        <ProtectedRoute>
          <Notifications />
        </ProtectedRoute>
      } />
      <Route path="/classificacao-reconciliacao" element={
        <ProtectedRoute>
          <ClassificacaoReconciliacao />
        </ProtectedRoute>
      } />
    </>
  );
};
