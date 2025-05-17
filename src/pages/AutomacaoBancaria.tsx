
import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClientSelector } from "@/components/layout/ClientSelector";
import { useAuth } from '@/contexts/auth';
import { Navigate } from 'react-router-dom';

// Import our new components
import { BancoHeader } from "@/components/bancario/BancoHeader";
import { PagamentosPix } from "@/components/bancario/PagamentosPix";
import { PagamentosTributos } from "@/components/bancario/PagamentosTributos";
import { AgendarPagamentosTributos } from "@/components/bancario/AgendarPagamentosTributos";
import { FolhaPagamento } from "@/components/bancario/FolhaPagamento";
import { ExtratosESaldos } from "@/components/bancario/ExtratosESaldos";
import { PagamentosAutomaticos } from "@/components/bancario/PagamentosAutomaticos";

// Import sistema de eventos
import { inicializarSistemaEventos, subscribe } from "@/services/fiscal/mensageria/eventoProcessor";
import { processarEventoFiscal } from "@/services/bancario/pagamentoAutomatico";

const AutomacaoBancaria = () => {
  const { isAuthenticated, isAccountant } = useAuth();
  const [activeTab, setActiveTab] = useState("pagamentos");
  const [bancoSelecionado, setBancoSelecionado] = useState(
    localStorage.getItem("banco-selecionado") || ""
  );
  const [selectedClientId, setSelectedClientId] = useState("");

  // Inicializar sistema de eventos quando o componente é montado
  useEffect(() => {
    inicializarSistemaEventos();
    
    // Registrar handlers para eventos fiscais
    const unsubscribe = subscribe('fiscal.generated', async (evento) => {
      console.log("Evento fiscal.generated recebido:", evento);
      await processarEventoFiscal(evento);
    });
    
    const unsubscribe2 = subscribe('guia.generated', async (evento) => {
      console.log("Evento guia.generated recebido:", evento);
      await processarEventoFiscal(evento);
    });
    
    return () => {
      unsubscribe();
      unsubscribe2();
    };
  }, []);

  // Handle client selection
  const handleClientSelect = (client: { id: string; name: string }) => {
    setSelectedClientId(client.id);
  };

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Only accountants should access this page
  if (!isAccountant) {
    return <Navigate to="/" replace />;
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Automação Bancária</h1>
          <p className="text-muted-foreground">
            Realize pagamentos e consultas bancárias automáticas via Open Banking
          </p>
        </div>
        <ClientSelector onClientSelect={handleClientSelect} />
      </div>

      <BancoHeader bancoSelecionado={bancoSelecionado} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="mb-4">
          <TabsTrigger value="pagamentos">Pagamentos</TabsTrigger>
          <TabsTrigger value="tributos">Pagamento de Tributos</TabsTrigger>
          <TabsTrigger value="lote">Pagamentos em Lote</TabsTrigger>
          <TabsTrigger value="automaticos">Pagamentos Automáticos</TabsTrigger>
          <TabsTrigger value="folha">Folha de Pagamento</TabsTrigger>
          <TabsTrigger value="extratos">Extratos e Saldos</TabsTrigger>
        </TabsList>

        <TabsContent value="pagamentos">
          <PagamentosPix bancoSelecionado={bancoSelecionado} clientId={selectedClientId} />
        </TabsContent>

        <TabsContent value="tributos">
          <PagamentosTributos bancoSelecionado={bancoSelecionado} />
        </TabsContent>
        
        <TabsContent value="lote">
          <AgendarPagamentosTributos bancoSelecionado={bancoSelecionado} />
        </TabsContent>

        <TabsContent value="automaticos">
          <PagamentosAutomaticos />
        </TabsContent>

        <TabsContent value="folha">
          <FolhaPagamento />
        </TabsContent>

        <TabsContent value="extratos">
          <ExtratosESaldos />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default AutomacaoBancaria;
