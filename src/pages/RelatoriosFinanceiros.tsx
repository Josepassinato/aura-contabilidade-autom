
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/contexts/auth';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Navigate } from 'react-router-dom';
import { ClientSelector } from '@/components/layout/ClientSelector';
import { BalancoPatrimonial } from '@/components/relatorios/BalancoPatrimonial';
import { DRE } from '@/components/relatorios/DRE';
import { FluxoCaixa } from '@/components/relatorios/FluxoCaixa';
import { IndexesFinanceiros } from '@/components/relatorios/IndexesFinanceiros';

const RelatoriosFinanceiros = () => {
  const { isAuthenticated, isAccountant } = useAuth();
  const [activeTab, setActiveTab] = useState("balanco");
  const [selectedClient, setSelectedClient] = useState<{ id: string; name: string } | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState(getCurrentPeriod());

  function getCurrentPeriod() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  // Only authenticated accountants can access this page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (!isAccountant) {
    return <Navigate to="/" replace />;
  }

  const handleClientSelect = (client: { id: string; name: string }) => {
    setSelectedClient(client);
  };

  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPeriod(e.target.value);
  };

  const renderPeriodSelector = () => {
    // Generate period options for the last 12 months
    const options = [];
    const currentDate = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = `${date.toLocaleString('pt-BR', { month: 'long' })} ${date.getFullYear()}`;
      
      options.push(
        <option key={period} value={period}>
          {label}
        </option>
      );
    }

    return (
      <div className="w-full">
        <label className="block text-sm font-medium mb-1">Período</label>
        <select
          className="w-full px-3 py-2 border rounded-md"
          value={selectedPeriod}
          onChange={handlePeriodChange}
        >
          {options}
        </select>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Relatórios Financeiros</h2>
          <p className="text-muted-foreground">Visualize e analise os dados financeiros dos seus clientes</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-1/2">
            <label className="block text-sm font-medium mb-1">Cliente</label>
            <ClientSelector onClientSelect={handleClientSelect} />
          </div>
          {renderPeriodSelector()}
        </div>

        {!selectedClient ? (
          <div className="bg-muted/40 p-8 rounded-lg text-center">
            <p className="text-muted-foreground">Selecione um cliente para visualizar os relatórios.</p>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 w-full max-w-2xl">
              <TabsTrigger value="balanco">Balanço Patrimonial</TabsTrigger>
              <TabsTrigger value="dre">DRE</TabsTrigger>
              <TabsTrigger value="fluxo">Fluxo de Caixa</TabsTrigger>
              <TabsTrigger value="indexes">Indicadores</TabsTrigger>
            </TabsList>
            
            <div className="mt-6">
              <TabsContent value="balanco">
                <BalancoPatrimonial 
                  clientId={selectedClient.id} 
                  periodo={selectedPeriod} 
                />
              </TabsContent>
              
              <TabsContent value="dre">
                <DRE 
                  clientId={selectedClient.id} 
                  periodo={selectedPeriod} 
                />
              </TabsContent>
              
              <TabsContent value="fluxo">
                <FluxoCaixa 
                  clientId={selectedClient.id} 
                  periodo={selectedPeriod}
                />
              </TabsContent>
              
              <TabsContent value="indexes">
                <IndexesFinanceiros 
                  client_id={selectedClient.id} 
                  periodo={selectedPeriod}
                />
              </TabsContent>
            </div>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
};

export default RelatoriosFinanceiros;
