import React, { useState, useEffect } from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ClientSelector } from "@/components/layout/ClientSelector";
import { UF } from "@/services/governamental/estadualIntegration";
import { IntegracaoStatusGrid } from "@/components/integracoes/IntegracaoStatusGrid";
import { UfTabs } from "@/components/integracoes/UfTabs";
import { EmptyClientState } from "@/components/integracoes/EmptyClientState";
import { 
  ESTADOS,
  getDefaultIntegracoes
} from "@/components/integracoes/constants";
import { IntegracaoEstadualStatus } from "@/components/integracoes/IntegracaoStatus";
import { useToast } from '@/hooks/use-toast';
import { fetchIntegracoesEstaduais, saveIntegracaoEstadual } from "@/services/supabase/integracoesService";

const IntegracoesEstaduais = () => {
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedClientName, setSelectedClientName] = useState<string>('');
  const [activeTab, setActiveTab] = useState<UF>("SP");
  const [integracoes, setIntegracoes] = useState<IntegracaoEstadualStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const handleClientSelect = async (client: { id: string, name: string }) => {
    setSelectedClientId(client.id);
    setSelectedClientName(client.name);
    
    if (!client.id) {
      // Visão geral - limpar integrações
      setIntegracoes([]);
      return;
    }
    
    // Buscar integrações para o cliente
    setIsLoading(true);
    
    try {
      // Buscar do Supabase
      const integracoesData = await fetchIntegracoesEstaduais(client.id);
      
      if (integracoesData && integracoesData.length > 0) {
        setIntegracoes(integracoesData);
      } else {
        // Se não encontrar, criar integrações padrão
        setIntegracoes(getDefaultIntegracoes());
      }
    } catch (error) {
      console.error('Erro ao buscar integrações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as integrações estaduais.",
        variant: "destructive"
      });
      
      // Usar integrações padrão em caso de erro
      setIntegracoes(getDefaultIntegracoes());
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSaveIntegracao = async (data: any) => {
    if (!selectedClientId) return;
    
    try {
      // Salvar no Supabase
      const saved = await saveIntegracaoEstadual(selectedClientId, activeTab, data);
      
      if (!saved) {
        throw new Error("Não foi possível salvar os dados");
      }
      
      // Atualizar o estado local
      setIntegracoes(prev => prev.map(integracao => 
        integracao.uf === activeTab ? {
          ...integracao,
          status: 'conectado',
          ultimoAcesso: new Date().toLocaleString('pt-BR'),
          proximaRenovacao: new Date(Date.now() + 30*24*60*60*1000).toLocaleString('pt-BR'),
        } : integracao
      ));
      
      toast({
        title: "Sucesso",
        description: `Integração com SEFAZ-${activeTab} configurada com sucesso.`,
        variant: "default"
      });
    } catch (error) {
      console.error('Erro ao salvar integração:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a configuração da integração.",
        variant: "destructive"
      });
    }
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
            {isLoading ? (
              <div className="text-center py-12">
                <p>Carregando integrações...</p>
              </div>
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
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default IntegracoesEstaduais;
