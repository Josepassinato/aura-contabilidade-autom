
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import Index from './pages/Index';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Settings from './pages/Settings';
import FolhaPagamento from './pages/FolhaPagamento';
import ClientAccess from './pages/ClientAccess';
import ClientPortal from './pages/ClientPortal';
import ClientDocuments from './pages/ClientDocuments';
import ObrigacoesFiscais from './pages/ObrigacoesFiscais';
import GuiasFiscais from './pages/GuiasFiscais';
import GerenciarClientes from './pages/GerenciarClientes';
import Colaboradores from './pages/Colaboradores';
import AnalisesPreditivas from './pages/AnalisesPreditivas';
import ApuracaoAutomatica from './pages/ApuracaoAutomatica';
import RelatoriosFinanceiros from './pages/RelatoriosFinanceiros';
import RelatoriosIA from './pages/RelatoriosIA';
import CalculosFiscais from './pages/CalculosFiscais';
import AutomacaoBancaria from './pages/AutomacaoBancaria';
import Onboarding from './pages/Onboarding';
import OnboardingWelcome from './pages/OnboardingWelcome';
import PlansAndPricing from './pages/PlansAndPricing';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCanceled from './pages/PaymentCanceled';
import RegimeFiscal from './pages/RegimeFiscal';
import Notifications from './pages/Notifications';
import IntegracoesGov from './pages/IntegracoesGov';
import IntegracoesEstaduais from './pages/IntegracoesEstaduais';
import DashboardLayout from './components/layout/DashboardLayout';

// Routes that should have the sidebar
const routesWithSidebar = [
  {
    path: '/dashboard',
    element: <Index />
  },
  {
    path: '/settings',
    element: <Settings />
  },
  {
    path: '/folha-pagamento',
    element: <FolhaPagamento />
  },
  {
    path: '/client-access',
    element: <ClientAccess />
  },
  {
    path: '/obrigacoes-fiscais',
    element: <ObrigacoesFiscais />
  },
  {
    path: '/guias-fiscais',
    element: <GuiasFiscais />
  },
  {
    path: '/gerenciar-clientes',
    element: <GerenciarClientes />
  },
  {
    path: '/colaboradores',
    element: <Colaboradores />
  },
  {
    path: '/analises-preditivas',
    element: <AnalisesPreditivas />
  },
  {
    path: '/apuracao-automatica',
    element: <ApuracaoAutomatica />
  },
  {
    path: '/relatorios-financeiros',
    element: <RelatoriosFinanceiros />
  },
  {
    path: '/relatorios-ia',
    element: <RelatoriosIA />
  },
  {
    path: '/calculos-fiscais',
    element: <CalculosFiscais />
  },
  {
    path: '/automacao-bancaria',
    element: <AutomacaoBancaria />
  },
  {
    path: '/regime-fiscal',
    element: <RegimeFiscal />
  },
  {
    path: '/notifications',
    element: <Notifications />
  },
  {
    path: '/integracoes-gov',
    element: <IntegracoesGov />
  },
  {
    path: '/integracoes-estaduais',
    element: <IntegracoesEstaduais />
  },
  {
    path: '/plans',
    element: <PlansAndPricing />
  },
  {
    path: '/documentos',
    element: <ClientDocuments />
  }
];

// Routes that should NOT have the sidebar
const routesWithoutSidebar = [
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/onboarding',
    element: <Onboarding />
  },
  {
    path: '/onboarding-welcome',
    element: <OnboardingWelcome />
  },
  {
    path: '/payment-success',
    element: <PaymentSuccess />
  },
  {
    path: '/payment-canceled',
    element: <PaymentCanceled />
  },
  {
    path: '/client-portal/:clientId?',
    element: <ClientPortal />
  },
  {
    path: '/client-portal',
    element: <ClientPortal />
  },
  {
    path: '/client-documents/:clientId',
    element: <ClientDocuments />
  }
];

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/dashboard',
    element: <DashboardLayout />,
    errorElement: <NotFound />,
    children: routesWithSidebar
  },
  ...routesWithoutSidebar
]);

export function AppRoutes() {
  return <RouterProvider router={router} />;
}

export default router;
