
import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

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
import RegimeFiscal from "./pages/RegimeFiscal";
import Colaboradores from "./pages/Colaboradores";
import IntegracoesGov from "./pages/IntegracoesGov";
import RelatoriosIA from "./pages/RelatoriosIA";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCanceled from "./pages/PaymentCanceled";
import OnboardingWelcome from "./pages/OnboardingWelcome";

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
    path: "/relatorios-ia",
    element: <RelatoriosIA />,
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
    path: "/cliente-portal",
    element: <ClientPortal />,
  },
  {
    path: "/cliente-documentos",
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
    path: "/cliente-acesso/:token",
    element: <ClientAccess />,
  },
  {
    path: "/configuracoes",
    element: <Settings />,
  },
  {
    path: "/onboarding",
    element: <Onboarding />,
  },
  {
    path: "/onboarding-welcome",
    element: <OnboardingWelcome />,
  },
  {
    path: "/planos",
    element: <PlansAndPricing />,
  },
  {
    path: "/notificacoes",
    element: <Notifications />,
  },
  {
    path: "/regime-fiscal",
    element: <RegimeFiscal />,
  },
  {
    path: "/colaboradores",
    element: <Colaboradores />,
  },
  {
    path: "/integracoes-gov",
    element: <IntegracoesGov />,
  },
  {
    path: "/payment-success",
    element: <PaymentSuccess />,
  },
  {
    path: "/payment-canceled",
    element: <PaymentCanceled />,
  },
  {
    path: "*",
    element: <NotFound />,
  }
];

export const router = createBrowserRouter(routes);

export default router;
