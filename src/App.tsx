
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';

import { AuthProvider } from './contexts/auth';
import { Toaster } from './components/ui/toaster';

// Páginas
import Index from './pages/Index';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import ClientPortal from './pages/ClientPortal';
import ClientAccess from './pages/ClientAccess';
import ClientDocuments from './pages/ClientDocuments';
import GerenciarClientes from './pages/GerenciarClientes';
import ObrigacoesFiscais from './pages/ObrigacoesFiscais';
import FolhaPagamento from './pages/FolhaPagamento';
import GuiasFiscais from './pages/GuiasFiscais';
import RelatoriosFinanceiros from './pages/RelatoriosFinanceiros';
import ApuracaoAutomatica from './pages/ApuracaoAutomatica';
import Settings from './pages/Settings';

// Novas páginas implementadas
import CalculosFiscais from './pages/CalculosFiscais';
import AutomacaoBancaria from './pages/AutomacaoBancaria';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          
          {/* Rotas do Portal do Cliente */}
          <Route path="/portal-cliente" element={<ClientPortal />} />
          <Route path="/portal-cliente/documentos" element={<ClientDocuments />} />
          <Route path="/acesso-cliente" element={<ClientAccess />} />
          
          {/* Rotas do Sistema Contábil */}
          <Route path="/clientes" element={<GerenciarClientes />} />
          <Route path="/obrigacoes" element={<ObrigacoesFiscais />} />
          <Route path="/folha-pagamento" element={<FolhaPagamento />} />
          <Route path="/guias-fiscais" element={<GuiasFiscais />} />
          <Route path="/relatorios-financeiros" element={<RelatoriosFinanceiros />} />
          <Route path="/apuracao-automatica" element={<ApuracaoAutomatica />} />
          <Route path="/settings" element={<Settings />} />
          
          {/* Novas rotas */}
          <Route path="/calculos-fiscais" element={<CalculosFiscais />} />
          <Route path="/automacao-bancaria" element={<AutomacaoBancaria />} />
          
          {/* Rota de fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      
      <Toaster />
    </AuthProvider>
  );
}

export default App;
