
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
import AccountantDocuments from '../pages/AccountantDocuments';
import FolhaPagamento from '../pages/FolhaPagamento';
import RegimeFiscal from '../pages/RegimeFiscal';
import ApuracaoAutomatica from '../pages/ApuracaoAutomatica';
import AnalisesPreditivas from '../pages/AnalisesPreditivas';
import Colaboradores from '../pages/Colaboradores';
import AutomacaoBancaria from '../pages/AutomacaoBancaria';
import Notifications from '../pages/Notifications';
import ClassificacaoReconciliacao from '../pages/ClassificacaoReconciliacao';
import DadosTeste from '../pages/DadosTeste';

import AlertasPagamento from '../pages/AlertasPagamento';
import AuditoriaInteligente from '../pages/AuditoriaInteligente';
import GestaoRiscos from '../pages/GestaoRiscos';

// Export an array of Route elements
export const protectedRoutes = [
  <Route key="home" path="/" element={
    <ProtectedRoute>
      <Index />
    </ProtectedRoute>
  } />,
  <Route key="dashboard" path="/dashboard" element={
    <ProtectedRoute>
      <Index />
    </ProtectedRoute>
  } />,
  <Route key="relatorios" path="/relatorios" element={
    <ProtectedRoute>
      <RelatoriosFinanceiros />
    </ProtectedRoute>
  } />,
  <Route key="relatorios-ia" path="/relatorios-ia" element={
    <ProtectedRoute>
      <RelatoriosIA />
    </ProtectedRoute>
  } />,
  <Route key="obrigacoes-fiscais" path="/obrigacoes-fiscais" element={
    <ProtectedRoute>
      <ObrigacoesFiscais />
    </ProtectedRoute>
  } />,
  <Route key="guias-fiscais" path="/guias-fiscais" element={
    <ProtectedRoute>
      <GuiasFiscais />
    </ProtectedRoute>
  } />,
  <Route key="integracoes-gov" path="/integracoes-gov" element={
    <ProtectedRoute>
      <IntegracoesGov />
    </ProtectedRoute>
  } />,
  <Route key="integracoes-estaduais" path="/integracoes-estaduais" element={
    <ProtectedRoute>
      <IntegracoesEstaduais />
    </ProtectedRoute>
  } />,
  <Route key="email-service" path="/email-service" element={
    <ProtectedRoute>
      <EmailService />
    </ProtectedRoute>
  } />,
  <Route key="documentos" path="/documentos" element={
    <ProtectedRoute>
      <AccountantDocuments />
    </ProtectedRoute>
  } />,
  <Route key="folha-pagamento" path="/folha-pagamento" element={
    <ProtectedRoute>
      <FolhaPagamento />
    </ProtectedRoute>
  } />,
  <Route key="regime-fiscal" path="/regime-fiscal" element={
    <ProtectedRoute>
      <RegimeFiscal />
    </ProtectedRoute>
  } />,
  <Route key="apuracao-automatica" path="/apuracao-automatica" element={
    <ProtectedRoute>
      <ApuracaoAutomatica />
    </ProtectedRoute>
  } />,
  <Route key="analises-preditivas" path="/analises-preditivas" element={
    <ProtectedRoute>
      <AnalisesPreditivas />
    </ProtectedRoute>
  } />,
  <Route key="colaboradores" path="/colaboradores" element={
    <ProtectedRoute>
      <Colaboradores />
    </ProtectedRoute>
  } />,
  <Route key="automacao-bancaria" path="/automacao-bancaria" element={
    <ProtectedRoute>
      <AutomacaoBancaria />
    </ProtectedRoute>
  } />,
  <Route key="notifications" path="/notifications" element={
    <ProtectedRoute>
      <Notifications />
    </ProtectedRoute>
  } />,
  <Route key="classificacao-reconciliacao" path="/classificacao-reconciliacao" element={
    <ProtectedRoute>
      <ClassificacaoReconciliacao />
    </ProtectedRoute>
  } />,
  <Route key="dados-teste" path="/dados-teste" element={
    <ProtectedRoute>
      <DadosTeste />
    </ProtectedRoute>
  } />,
  <Route key="alertas-pagamento" path="/alertas-pagamento" element={
    <ProtectedRoute>
      <AlertasPagamento />
    </ProtectedRoute>
  } />,
  <Route key="auditoria-inteligente" path="/auditoria-inteligente" element={
    <ProtectedRoute>
      <AuditoriaInteligente />
    </ProtectedRoute>
  } />,
  <Route key="gestao-riscos" path="/gestao-riscos" element={
    <ProtectedRoute>
      <GestaoRiscos />
    </ProtectedRoute>
  } />,
];
