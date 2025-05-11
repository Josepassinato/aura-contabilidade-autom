
import React from "react";
import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Settings from "./pages/Settings";
import GerenciarClientes from "./pages/GerenciarClientes";
import ObrigacoesFiscais from "./pages/ObrigacoesFiscais";
import GuiasFiscais from "./pages/GuiasFiscais";
import RelatoriosFinanceiros from "./pages/RelatoriosFinanceiros";
import ApuracaoAutomatica from "./pages/ApuracaoAutomatica";
import FolhaPagamento from "./pages/FolhaPagamento";
import CalculosFiscais from "./pages/CalculosFiscais";
import AutomacaoBancaria from "./pages/AutomacaoBancaria";
import ClientAccess from "./pages/ClientAccess";
import ClientPortal from "./pages/ClientPortal";
import ClientDocuments from "./pages/ClientDocuments";
import NotFound from "./pages/NotFound";
import { Toaster } from "@/components/ui/toaster";

// Adicionar a nova rota de análises preditivas
import AnalisesPreditivas from "./pages/AnalisesPreditivas";

// Adicionar novas rotas para planos e onboarding
import PlansAndPricing from "./pages/PlansAndPricing";
import Onboarding from "./pages/Onboarding";

// Adicionar novas rotas implementadas
import RegimeFiscal from "./pages/RegimeFiscal";
import Colaboradores from "./pages/Colaboradores";
import IntegracoesGov from "./pages/IntegracoesGov";
import RelatoriosIA from "./pages/RelatoriosIA";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/configuracoes" element={<Settings />} />
        <Route path="/clientes" element={<GerenciarClientes />} />
        <Route path="/obrigacoes" element={<ObrigacoesFiscais />} />
        <Route path="/guias-fiscais" element={<GuiasFiscais />} />
        <Route path="/relatorios-financeiros" element={<RelatoriosFinanceiros />} />
        <Route path="/relatorios-ia" element={<RelatoriosIA />} />
        <Route path="/apuracao-automatica" element={<ApuracaoAutomatica />} />
        <Route path="/folha-pagamento" element={<FolhaPagamento />} />
        <Route path="/calculos-fiscais" element={<CalculosFiscais />} />
        <Route path="/automacao-bancaria" element={<AutomacaoBancaria />} />
        <Route path="/analises-preditivas" element={<AnalisesPreditivas />} />
        <Route path="/regime-fiscal" element={<RegimeFiscal />} />
        <Route path="/colaboradores" element={<Colaboradores />} />
        <Route path="/integracoes-gov" element={<IntegracoesGov />} />
        <Route path="/planos" element={<PlansAndPricing />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/acesso/:token" element={<ClientAccess />} />
        <Route path="/cliente-portal" element={<ClientPortal />} />
        <Route path="/cliente-documentos" element={<ClientDocuments />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
