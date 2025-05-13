
import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

// Import pages
import Index from '@/pages/Index';
import Settings from '@/pages/Settings';
import FolhaPagamento from '@/pages/FolhaPagamento';
import ObrigacoesFiscais from '@/pages/ObrigacoesFiscais';
import GuiasFiscais from '@/pages/GuiasFiscais';
import GerenciarClientes from '@/pages/GerenciarClientes';
import Colaboradores from '@/pages/Colaboradores';
import AnalisesPreditivas from '@/pages/AnalisesPreditivas';
import ApuracaoAutomatica from '@/pages/ApuracaoAutomatica';
import RelatoriosFinanceiros from '@/pages/RelatoriosFinanceiros';
import RelatoriosIA from '@/pages/RelatoriosIA';
import CalculosFiscais from '@/pages/CalculosFiscais';
import AutomacaoBancaria from '@/pages/AutomacaoBancaria';
import RegimeFiscal from '@/pages/RegimeFiscal';
import Notifications from '@/pages/Notifications';
import Login from '@/pages/Login';
import NotFound from '@/pages/NotFound';
import IntegracoesGov from '@/pages/IntegracoesGov';
import IntegracoesEstaduais from '@/pages/IntegracoesEstaduais';
import ClientAccess from '@/pages/ClientAccess';
import ClientPortal from '@/pages/ClientPortal';
import PlansAndPricing from '@/pages/PlansAndPricing';
import PaymentSuccess from '@/pages/PaymentSuccess';
import PaymentCanceled from '@/pages/PaymentCanceled';
import ClientDocuments from '@/pages/ClientDocuments';
import EmailService from '@/pages/EmailService';
import Onboarding from '@/pages/Onboarding';
import OnboardingWelcome from '@/pages/OnboardingWelcome';
import BusinessAnalytics from '@/pages/admin/BusinessAnalytics';

// Routes that should have the sidebar
const routesWithSidebar = [
  {
    path: '', // No leading slash here - this becomes relative to parent
    element: <Index />
  },
  {
    path: 'settings',  // No leading slash - relative path
    element: <Settings />
  },
  {
    path: 'folha-pagamento',
    element: <FolhaPagamento />
  },
  {
    path: 'client-access',
    element: <ClientAccess />
  },
  {
    path: 'obrigacoes-fiscais',
    element: <ObrigacoesFiscais />
  },
  {
    path: 'guias-fiscais',
    element: <GuiasFiscais />
  },
  {
    path: 'gerenciar-clientes',
    element: <GerenciarClientes />
  },
  {
    path: 'colaboradores',
    element: <Colaboradores />
  },
  {
    path: 'analises-preditivas',
    element: <AnalisesPreditivas />
  },
  {
    path: 'apuracao-automatica',
    element: <ApuracaoAutomatica />
  },
  {
    path: 'relatorios-financeiros',
    element: <RelatoriosFinanceiros />
  },
  {
    path: 'relatorios-ia',
    element: <RelatoriosIA />
  },
  {
    path: 'calculos-fiscais',
    element: <CalculosFiscais />
  },
  {
    path: 'automacao-bancaria',
    element: <AutomacaoBancaria />
  },
  {
    path: 'regime-fiscal',
    element: <RegimeFiscal />
  },
  {
    path: 'notifications',
    element: <Notifications />
  },
  {
    path: 'integracoes-gov',
    element: <IntegracoesGov />
  },
  {
    path: 'integracoes-estaduais',
    element: <IntegracoesEstaduais />
  },
  {
    path: 'plans',
    element: <PlansAndPricing />
  },
  {
    path: 'documentos',
    element: <ClientDocuments />
  },
  {
    path: 'email-service',
    element: <EmailService />
  },
  // Add new admin routes
  {
    path: 'admin/business-analytics',
    element: <BusinessAnalytics />
  }
];

// Routes for non-authenticated users or special pages
const routes = [
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/dashboard/*',
    children: routesWithSidebar
  },
  {
    path: '/client-portal',
    element: <ClientPortal />
  },
  {
    path: '/payment/success',
    element: <PaymentSuccess />
  },
  {
    path: '/payment/canceled',
    element: <PaymentCanceled />
  },
  {
    path: '/onboarding',
    element: <Onboarding />
  },
  {
    path: '/welcome',
    element: <OnboardingWelcome />
  },
  {
    path: '*',
    element: <NotFound />
  },
];

const router = createBrowserRouter(routes);

export default router;
