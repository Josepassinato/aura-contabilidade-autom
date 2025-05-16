import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';

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
import { useAuth } from './contexts/auth';

// Protected Route component that wraps routes requiring authentication
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return null; // Or a loading spinner
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Admin Route component that wraps routes requiring admin authentication
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  
  if (isLoading) {
    return null; // Or a loading spinner
  }
  
  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Accountant Route component that wraps routes requiring accountant authentication
const AccountantRoute = ({ children }) => {
  const { isAuthenticated, isAccountant, isLoading } = useAuth();
  
  if (isLoading) {
    return null; // Or a loading spinner
  }
  
  if (!isAuthenticated || !isAccountant) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Observe que este arquivo agora exporta um componente funcional React
const AppRoutes = () => {
  console.log("AppRoutes - Rendering routes");
  
  return (
    <Routes>
      {/* Rotas públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/plans" element={<PlansAndPricing />} />
      <Route path="/payment/success" element={<PaymentSuccess />} />
      <Route path="/payment/canceled" element={<PaymentCanceled />} />
      <Route path="/onboarding-welcome" element={<OnboardingWelcome />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/client-access" element={<ClientAccess />} />
      
      {/* Rotas do portal do cliente */}
      <Route path="/client-portal/*" element={<ClientPortal />} />
      
      {/* Rotas protegidas para contadores */}
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
      
      {/* Rotas protegidas para contadores */}
      <Route path="/clientes" element={
        <AccountantRoute>
          <GerenciarClientes />
        </AccountantRoute>
      } />
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
      <Route path="/calculos-fiscais" element={
        <AccountantRoute>
          <CalculosFiscais />
        </AccountantRoute>
      } />
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
      
      <Route path="/parametros-fiscais" element={
        <ProtectedRoute>
          <GerenciarParametrosFiscais />
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
      
      {/* Rotas de administração */}
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
      
      {/* Rota 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
