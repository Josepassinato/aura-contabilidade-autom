
import { createBrowserRouter } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import ClientAccess from "./pages/ClientAccess";
import ClientPortal from "./pages/ClientPortal";
import Settings from "./pages/Settings";
import GerenciarClientes from "./pages/GerenciarClientes";
import Onboarding from "./pages/Onboarding";
import OnboardingWelcome from "./pages/OnboardingWelcome";
import ObrigacoesFiscais from "./pages/ObrigacoesFiscais";
import RelatoriosFinanceiros from "./pages/RelatoriosFinanceiros"; 
import CalculosFiscais from "./pages/CalculosFiscais";
import AutomacaoBancaria from "./pages/AutomacaoBancaria";
import IntegracoesGov from "./pages/IntegracoesGov";
import IntegracoesEstaduais from "./pages/IntegracoesEstaduais";
import PlansAndPricing from "./pages/PlansAndPricing";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCanceled from "./pages/PaymentCanceled";
import Colaboradores from "./pages/Colaboradores";
import EmailService from "./pages/EmailService";
import GuiasFiscais from "./pages/GuiasFiscais";
import FolhaPagamento from "./pages/FolhaPagamento";
import ClientDocuments from "./pages/ClientDocuments";
import RegimeFiscal from "./pages/RegimeFiscal";
import AnalisesPreditivas from "./pages/AnalisesPreditivas";
import RelatoriosIA from "./pages/RelatoriosIA";
import ApuracaoAutomatica from "./pages/ApuracaoAutomatica";
import Notifications from "./pages/Notifications";
import BusinessAnalytics from "./pages/admin/BusinessAnalytics";
import UsageMetrics from "./pages/admin/UsageMetrics";
import CustomerManagement from "./pages/admin/CustomerManagement";

// Export the AppRoutes component for use in App.tsx
export const AppRoutes = () => null;

const routes = [
  {
    path: "/",
    element: <Index />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/dashboard",
    element: <Index />,
  },
  {
    path: "/settings",
    element: <Settings />,
  },
  {
    path: "/client-access",
    element: <ClientAccess />,
  },
  {
    path: "/client-portal",
    element: <ClientPortal />,
  },
  {
    path: "/client-documents",
    element: <ClientDocuments />,
  },
  {
    path: "/clients",
    element: <GerenciarClientes />,
  },
  {
    path: "/onboarding",
    element: <Onboarding />,
  },
  {
    path: "/welcome",
    element: <OnboardingWelcome />,
  },
  {
    path: "/obrigacoes-fiscais",
    element: <ObrigacoesFiscais />,
  },
  {
    path: "/relatorios",
    element: <RelatoriosFinanceiros />,
  },
  {
    path: "/calculos-fiscais",
    element: <CalculosFiscais />,
  },
  {
    path: "/automacao-bancaria",
    element: <AutomacaoBancaria />,
  },
  {
    path: "/integracoes-gov",
    element: <IntegracoesGov />,
  },
  {
    path: "/integracoes-estaduais",
    element: <IntegracoesEstaduais />,
  },
  {
    path: "/plans",
    element: <PlansAndPricing />,
  },
  {
    path: "/payment/success",
    element: <PaymentSuccess />,
  },
  {
    path: "/payment/canceled",
    element: <PaymentCanceled />,
  },
  {
    path: "/colaboradores",
    element: <Colaboradores />,
  },
  {
    path: "/email",
    element: <EmailService />,
  },
  {
    path: "/guias-fiscais",
    element: <GuiasFiscais />,
  },
  {
    path: "/folha-pagamento",
    element: <FolhaPagamento />,
  },
  {
    path: "/regime-fiscal",
    element: <RegimeFiscal />,
  },
  {
    path: "/analises-preditivas",
    element: <AnalisesPreditivas />,
  },
  {
    path: "/relatorios-ia",
    element: <RelatoriosIA />,
  },
  {
    path: "/apuracao-automatica",
    element: <ApuracaoAutomatica />,
  },
  {
    path: "/notifications",
    element: <Notifications />,
  },
  {
    path: "/admin/business-analytics",
    element: <BusinessAnalytics />,
  },
  {
    path: "/admin/usage-metrics",
    element: <UsageMetrics />,
  },
  {
    path: "/admin/customer-management",
    element: <CustomerManagement />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export const router = createBrowserRouter(routes);
