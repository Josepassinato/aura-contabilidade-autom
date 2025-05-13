import React from 'react';
import { createBrowserRouter } from "react-router-dom";

import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Onboarding from "@/pages/Onboarding";
import OnboardingWelcome from "@/pages/Onboarding/Welcome";
import GerenciarClientes from "@/pages/GerenciarClientes";
import BusinessAnalytics from "@/pages/admin/BusinessAnalytics";
import CustomerManagement from "@/pages/admin/CustomerManagement";
import UsageMetrics from "@/pages/admin/UsageMetrics";
import Settings from "@/pages/Settings";
import RelatoriosIA from "@/pages/RelatoriosIA";

const routes = createBrowserRouter([
  {
    path: "/",
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
    element: React.lazy(() => import('./pages/admin/OpenAIManagement')),
  },
  {
    path: "/settings",
    element: <Settings />
  },
  {
    path: "/relatorios-ia",
    element: <RelatoriosIA />
  }
]);

export default routes;
