
import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Importação das páginas
import Index from './pages/Index';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Settings from './pages/Settings';
import GerenciarClientes from './pages/GerenciarClientes';
import RelatoriosFinanceiros from './pages/RelatoriosFinanceiros';
import RelatoriosIA from './pages/RelatoriosIA';
import CalculosFiscais from './pages/CalculosFiscais';
import ObrigacoesFiscais from './pages/ObrigacoesFiscais';
import GuiasFiscais from './pages/GuiasFiscais';
import IntegracoesGov from './pages/IntegracoesGov';
import IntegracoesEstaduais from './pages/IntegracoesEstaduais';
import EmailService from './pages/EmailService';
import ClientDocuments from './pages/ClientDocuments';
import ClientAccess from './pages/ClientAccess';
import ClientPortal from './pages/ClientPortal';
import FolhaPagamento from './pages/FolhaPagamento';
import RegimeFiscal from './pages/RegimeFiscal';
import ApuracaoAutomatica from './pages/ApuracaoAutomatica';
import GerenciarParametrosFiscais from './pages/GerenciarParametrosFiscais';
import AnalisesPreditivas from './pages/AnalisesPreditivas';
import Colaboradores from './pages/Colaboradores';
import PlansAndPricing from './pages/PlansAndPricing';
import Onboarding from './pages/Onboarding';
import OnboardingWelcome from './pages/OnboardingWelcome';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCanceled from './pages/PaymentCanceled';
import AutomacaoBancaria from './pages/AutomacaoBancaria';
import Notifications from './pages/Notifications';

// Admin pages
import BusinessAnalytics from './pages/admin/BusinessAnalytics';
import CustomerManagement from './pages/admin/CustomerManagement';
import UsageMetrics from './pages/admin/UsageMetrics';
import OpenAIManagement from './pages/admin/OpenAIManagement';

// Nova página de Classificação e Reconciliação
import ClassificacaoReconciliacao from './pages/ClassificacaoReconciliacao';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Rotas públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/plans" element={<PlansAndPricing />} />
      <Route path="/payment/success" element={<PaymentSuccess />} />
      <Route path="/payment/canceled" element={<PaymentCanceled />} />
      <Route path="/onboarding-welcome" element={<OnboardingWelcome />} />
      <Route path="/onboarding" element={<Onboarding />} />
      
      {/* Rotas do portal do cliente */}
      <Route path="/client-portal/*" element={<ClientPortal />} />
      
      {/* Rotas protegidas */}
      <Route path="/" element={<Index />} />
      <Route path="/clientes" element={<GerenciarClientes />} />
      <Route path="/relatorios" element={<RelatoriosFinanceiros />} />
      <Route path="/relatorios-ia" element={<RelatoriosIA />} />
      <Route path="/calculos-fiscais" element={<CalculosFiscais />} />
      <Route path="/obrigacoes-fiscais" element={<ObrigacoesFiscais />} />
      <Route path="/guias-fiscais" element={<GuiasFiscais />} />
      <Route path="/integracoes-gov" element={<IntegracoesGov />} />
      <Route path="/integracoes-estaduais" element={<IntegracoesEstaduais />} />
      <Route path="/email-service" element={<EmailService />} />
      <Route path="/documentos" element={<ClientDocuments />} />
      <Route path="/client-access" element={<ClientAccess />} />
      <Route path="/folha-pagamento" element={<FolhaPagamento />} />
      <Route path="/regime-fiscal" element={<RegimeFiscal />} />
      <Route path="/apuracao-automatica" element={<ApuracaoAutomatica />} />
      <Route path="/parametros-fiscais" element={<GerenciarParametrosFiscais />} />
      <Route path="/analises-preditivas" element={<AnalisesPreditivas />} />
      <Route path="/colaboradores" element={<Colaboradores />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/automacao-bancaria" element={<AutomacaoBancaria />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/classificacao-reconciliacao" element={<ClassificacaoReconciliacao />} />
      
      {/* Rotas de administração */}
      <Route path="/admin/analytics" element={<BusinessAnalytics />} />
      <Route path="/admin/customers" element={<CustomerManagement />} />
      <Route path="/admin/usage" element={<UsageMetrics />} />
      <Route path="/admin/openai" element={<OpenAIManagement />} />
      
      {/* Rota 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
