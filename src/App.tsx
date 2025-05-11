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
import { Toaster } from "@/components/ui/toaster"

// Adicionar a nova rota de análises preditivas
import AnalisesPreditivas from "./pages/AnalisesPreditivas";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/clientes" element={<GerenciarClientes />} />
        <Route path="/obrigacoes" element={<ObrigacoesFiscais />} />
        <Route path="/guias-fiscais" element={<GuiasFiscais />} />
        <Route path="/relatorios-financeiros" element={<RelatoriosFinanceiros />} />
        <Route path="/apuracao-automatica" element={<ApuracaoAutomatica />} />
        <Route path="/folha-pagamento" element={<FolhaPagamento />} />
        <Route path="/calculos-fiscais" element={<CalculosFiscais />} />
        <Route path="/automacao-bancaria" element={<AutomacaoBancaria />} />
        <Route path="/analises-preditivas" element={<AnalisesPreditivas />} />
        <Route path="/access/:token" element={<ClientAccess />} />
        <Route path="/client-portal" element={<ClientPortal />} />
        <Route path="/client-documents" element={<ClientDocuments />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
