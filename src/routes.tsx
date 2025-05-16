
import React, { Suspense } from 'react';
import { createBrowserRouter, Navigate } from "react-router-dom";

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

const OpenAIManagement = React.lazy(() => import('./pages/admin/OpenAIManagement'));

const routes = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />
  },
  {
    path: "/dashboard",
    element: <Index />
  },
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/onboarding",
    element: <Onboarding />
  },
  {
    path: "/onboarding/welcome",
    element: <OnboardingWelcome />
  },
  {
    path: "/gerenciar-clientes",
    element: <GerenciarClientes />
  },
  {
    path: "/admin/business-analytics",
    element: <BusinessAnalytics />
  },
  {
    path: "/admin/customer-management",
    element: <CustomerManagement />
  },
  {
    path: "/admin/usage-metrics",
    element: <UsageMetrics />
  },
  {
    path: "/admin/openai-management",
    element: <Suspense fallback={<div>Loading...</div>}><OpenAIManagement /></Suspense>
  },
  {
    path: "/settings",
    element: <Settings />
  },
  {
    path: "/relatorios-ia",
    element: <RelatoriosIA />
  },
  {
    path: "/client-access",
    element: <ClientAccess />
  },
  {
    path: "/client-portal",
    element: <ClientPortal />
  },
  {
    path: "/client-portal/:clientId",
    element: <ClientPortal />
  },
  {
    path: "/parametros-fiscais",
    element: <GerenciarParametrosFiscais />
  },
  {
    path: "/calculosfiscais",
    element: <CalculosFiscais />
  },
  {
    path: "/automacao-bancaria",
    element: <AutomacaoBancaria />
  },
  {
    path: "/folha-pagamento",
    element: <FolhaPagamento />
  },
  {
    path: "/obrigacoesfiscais",
    element: <ObrigacoesFiscais />
  },
  {
    path: "/relatoriosfinanceiros",
    element: <RelatoriosFinanceiros />
  },
  {
    path: "/email-service",
    element: <EmailService />
  },
  // Rota de fallback para página não encontrada
  {
    path: "*",
    element: <NotFound />
  }
]);

export default routes;
