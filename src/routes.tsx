
import React from "react";
import { createBrowserRouter } from "react-router-dom";

// Páginas
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import ObrigacoesFiscais from "./pages/ObrigacoesFiscais";
import CalculosFiscais from "./pages/CalculosFiscais";
import GuiasFiscais from "./pages/GuiasFiscais";
import RelatoriosFinanceiros from "./pages/RelatoriosFinanceiros";
import FolhaPagamento from "./pages/FolhaPagamento";
import GerenciarClientes from "./pages/GerenciarClientes";
import ClientPortal from "./pages/ClientPortal";
import ClientDocuments from "./pages/ClientDocuments";
import AnalisesPreditivas from "./pages/AnalisesPreditivas";
import AutomacaoBancaria from "./pages/AutomacaoBancaria";
import ApuracaoAutomatica from "./pages/ApuracaoAutomatica";
import ClientAccess from "./pages/ClientAccess";
import Settings from "./pages/Settings";
import Onboarding from "./pages/Onboarding";
import PlansAndPricing from "./pages/PlansAndPricing";
import Notifications from "./pages/Notifications";

// Configure as rotas aqui
export const routes = [
  {
    path: "/",
    element: <Index />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/obrigacoes-fiscais",
    element: <ObrigacoesFiscais />,
  },
  {
    path: "/calculos-fiscais",
    element: <CalculosFiscais />,
  },
  {
    path: "/guias-fiscais",
    element: <GuiasFiscais />,
  },
  {
    path: "/relatorios-financeiros",
    element: <RelatoriosFinanceiros />,
  },
  {
    path: "/folha-pagamento",
    element: <FolhaPagamento />,
  },
  {
    path: "/gerenciar-clientes",
    element: <GerenciarClientes />,
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
    path: "/analises-preditivas",
    element: <AnalisesPreditivas />,
  },
  {
    path: "/automacao-bancaria",
    element: <AutomacaoBancaria />,
  },
  {
    path: "/apuracao-automatica",
    element: <ApuracaoAutomatica />,
  },
  {
    path: "/client-access",
    element: <ClientAccess />,
  },
  {
    path: "/settings",
    element: <Settings />,
  },
  {
    path: "/onboarding",
    element: <Onboarding />,
  },
  {
    path: "/plans-pricing",
    element: <PlansAndPricing />,
  },
  {
    path: "/notifications",
    element: <Notifications />,
  },
  {
    path: "*",
    element: <NotFound />,
  }
];

export const router = createBrowserRouter(routes);

export default router;
