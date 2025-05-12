
import React, { useState } from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ClientSelector } from "@/components/layout/ClientSelector";
import { UF } from "@/services/governamental/estadualIntegration";
import { IntegracaoStatusGrid } from "@/components/integracoes/IntegracaoStatusGrid";
import { UfTabs } from "@/components/integracoes/UfTabs";
import { EmptyClientState } from "@/components/integracoes/EmptyClientState";
import { 
  ESTADOS,
  getDefaultIntegracoes,
  getClientOneIntegracoes,
  IntegracaoEstadualStatus 
} from "@/components/integracoes/constants";

const IntegracoesEstaduais = () => {
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedClientName, setSelectedClientName] = useState<string>('');
  const [activeTab, setActiveTab] = useState<UF>("SP");
  const [integracoes, setIntegracoes] = useState<IntegracaoEstadualStatus[]>(getDefaultIntegracoes());
  
  const handleClientSelect = (client: { id: string, name: string }) => {
    setSelectedClientId(client.id);
    setSelectedClientName(client.name);
    
    // Simular dados de integrações para esse cliente
    if (client.id === "1") {
      setIntegracoes(getClientOneIntegracoes());
    } else {
      setIntegracoes(getDefaultIntegracoes());
    }
  };
  
  const handleSaveIntegracao = (data: any) => {
    // Atualizar o status da integração
    setIntegracoes(prev => prev.map(integracao => 
      integracao.uf === activeTab ? {
        ...integracao,
        status: 'conectado',
        ultimoAcesso: new Date().toLocaleString('pt-BR'),
        proximaRenovacao: new Date(Date.now() + 30*24*60*60*1000).toLocaleString('pt-BR'),
      } : integracao
    ));
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Integrações Estaduais</h1>
            <p className="text-muted-foreground">
              Configure o acesso aos portais das secretarias estaduais da fazenda
            </p>
          </div>
          <ClientSelector onClientSelect={handleClientSelect} />
        </div>
        
        {!selectedClientId ? (
          <EmptyClientState />
        ) : (
          <>
            <IntegracaoStatusGrid integracoes={integracoes} />
            
            <UfTabs
              estados={ESTADOS}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              clientId={selectedClientId}
              clientName={selectedClientName}
              onSave={handleSaveIntegracao}
            />
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default IntegracoesEstaduais;
