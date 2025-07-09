
import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClientSelector } from "@/components/layout/ClientSelector";
import { useAuth } from '@/contexts/auth';
import { Navigate } from 'react-router-dom';

// Importando os componentes
import { ClassificacaoLancamentos } from "@/components/fiscal/classificacao/ClassificacaoLancamentos";
import { ReconciliacaoBancaria } from "@/components/fiscal/reconciliacao/ReconciliacaoBancaria";
import { MonitorEventos } from "@/components/fiscal/mensageria/MonitorEventos";

const ClassificacaoReconciliacao = () => {
  const { isAuthenticated, isAccountant } = useAuth();
  const [activeTab, setActiveTab] = React.useState("classificacao");
  const [selectedClientId, setSelectedClientId] = React.useState<string>("");

  // Handler para mudança de cliente
  const handleClientChange = (client: any) => {
    if (client && client.id) {
      setSelectedClientId(client.id);
    }
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
          <h1 className="text-2xl font-bold tracking-tight">Classificação e Reconciliação</h1>
          <p className="text-muted-foreground">
            Motor de regras e ML para classificação automática de lançamentos e reconciliação bancária
          </p>
        </div>
        <ClientSelector onClientChange={handleClientChange} />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="mb-4">
          <TabsTrigger value="classificacao">Classificação ML</TabsTrigger>
          <TabsTrigger value="reconciliacao">Reconciliação Bancária</TabsTrigger>
          <TabsTrigger value="eventos">Eventos do Sistema</TabsTrigger>
        </TabsList>

        <TabsContent value="classificacao">
          <ClassificacaoLancamentos />
        </TabsContent>
        
        <TabsContent value="reconciliacao">
          <ReconciliacaoBancaria />
        </TabsContent>
        
        <TabsContent value="eventos">
          <MonitorEventos />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default ClassificacaoReconciliacao;
