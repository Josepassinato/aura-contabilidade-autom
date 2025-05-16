
import React, { Suspense } from 'react';
import { createBrowserRouter, Navigate } from "react-router-dom";
import { DashboardLayout } from "./components/layout/DashboardLayout";

import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Onboarding from "@/pages/Onboarding";
import OnboardingWelcome from "@/pages/OnboardingWelcome";
import GerenciarClientes from "@/pages/GerenciarClientes";
import BusinessAnalytics from "@/pages/admin/BusinessAnalytics";
import CustomerManagement from "@/pages/admin/CustomerManagement";
import UsageMetrics from "@/pages/admin/UsageMetrics";
import Settings from "@/pages/Settings";
import RelatoriosIA from "@/pages/RelatoriosIA";
import ClientAccess from "@/pages/ClientAccess";
import ClientPortal from "@/pages/ClientPortal";
import GerenciarParametrosFiscais from "@/pages/GerenciarParametrosFiscais";
import CalculosFiscais from "@/pages/CalculosFiscais";
import AutomacaoBancaria from "@/pages/AutomacaoBancaria";
import FolhaPagamento from "@/pages/FolhaPagamento";
import ObrigacoesFiscais from "@/pages/ObrigacoesFiscais";
import RelatoriosFinanceiros from "@/pages/RelatoriosFinanceiros";
import NotFound from "@/pages/NotFound";
import EmailService from "@/pages/EmailService";
import GuiasFiscais from "@/pages/GuiasFiscais";
import AnalisesPreditivas from "@/pages/AnalisesPreditivas";
import Colaboradores from "@/pages/Colaboradores";
import RegimeFiscal from "@/pages/RegimeFiscal";
import ClientDocuments from "@/pages/ClientDocuments";
import IntegracoesGov from "@/pages/IntegracoesGov";
import IntegracoesEstaduais from "@/pages/IntegracoesEstaduais";
import ApuracaoAutomatica from "@/pages/ApuracaoAutomatica";
import Notifications from "@/pages/Notifications";

const OpenAIManagement = React.lazy(() => import('./pages/admin/OpenAIManagement'));

// Criação do roteador com configuração melhorada
const routes = createBrowserRouter([
  // Rotas públicas (não precisam de autenticação)
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/client-access",
    element: <ClientAccess />
  },
  // Rota específica para o portal do cliente (fora do layout do Dashboard)
  {
    path: "/client-portal",
    element: <ClientPortal />
  },
  {
    path: "/client-portal/:clientId",
    element: <ClientPortal />
  },
  
  // Rotas protegidas dentro do layout do Dashboard
  {
    path: "/",
    element: <DashboardLayout />,
    errorElement: <Navigate to="/login" />,
    children: [
      {
        index: true,
        element: <Index />
      },
      {
        path: "dashboard",
        element: <Index />
      },
      {
        path: "onboarding",
        element: <Onboarding />
      },
      {
        path: "onboarding/welcome",
        element: <OnboardingWelcome />
      },
      {
        path: "gerenciar-clientes",
        element: <GerenciarClientes />
      },
      {
        path: "admin/business-analytics",
        element: <BusinessAnalytics />
      },
      {
        path: "admin/customer-management",
        element: <CustomerManagement />
      },
      {
        path: "admin/usage-metrics",
        element: <UsageMetrics />
      },
      {
        path: "admin/openai-management",
        element: <Suspense fallback={<div>Loading...</div>}><OpenAIManagement /></Suspense>
      },
      {
        path: "settings",
        element: <Settings />
      },
      {
        path: "relatorios-ia",
        element: <RelatoriosIA />
      },
      {
        path: "parametros-fiscais",
        element: <GerenciarParametrosFiscais />
      },
      {
        path: "calculosfiscais",
        element: <CalculosFiscais />
      },
      {
        path: "automacao-bancaria",
        element: <AutomacaoBancaria />
      },
      {
        path: "folha-pagamento",
        element: <FolhaPagamento />
      },
      {
        path: "obrigacoesfiscais",
        element: <ObrigacoesFiscais />
      },
      {
        path: "relatoriosfinanceiros",
        element: <RelatoriosFinanceiros />
      },
      {
        path: "email-service",
        element: <EmailService />
      },
      {
        path: "guias-fiscais",
        element: <GuiasFiscais />
      },
      {
        path: "analises-preditivas",
        element: <AnalisesPreditivas />
      },
      {
        path: "colaboradores",
        element: <Colaboradores />
      },
      {
        path: "obrigacoes-fiscais",
        element: <ObrigacoesFiscais />
      },
      {
        path: "regime-fiscal",
        element: <RegimeFiscal />
      },
      {
        path: "documentos",
        element: <ClientDocuments />
      },
      {
        path: "integracoes-gov",
        element: <IntegracoesGov />
      },
      {
        path: "integracoes-estaduais",
        element: <IntegracoesEstaduais />
      },
      {
        path: "apuracao-automatica",
        element: <ApuracaoAutomatica />
      },
      {
        path: "notifications",
        element: <Notifications />
      }
    ]
  },
  // Rota para capturar qualquer caminho inválido
  {
    path: "*",
    element: <NotFound />
  }
]);

export default routes;
