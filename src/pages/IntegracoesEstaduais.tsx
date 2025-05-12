
import React, { useState, useEffect } from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ClientSelector } from "@/components/layout/ClientSelector";
import { UF } from "@/services/governamental/estadualIntegration";
import { IntegracaoStatusGrid } from "@/components/integracoes/IntegracaoStatusGrid";
import { UfTabs } from "@/components/integracoes/UfTabs";
import { EmptyClientState } from "@/components/integracoes/EmptyClientState";
import { 
  ESTADOS,
  IntegracaoEstadualStatus 
} from "@/components/integracoes/constants";
import { useToast } from '@/hooks/use-toast';

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
      // We'll use mock data since the integracoes_estaduais table doesn't exist yet
      // When the table is created in the database, we can use the Supabase query
      /*
      const { data, error } = await supabase
        .from('integracoes_estaduais')
        .select('*')
        .eq('client_id', client.id);
      
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        // Mapear os dados do banco para o formato esperado
        const integracoesData = data.map(item => ({
          id: item.id,
          nome: item.nome,
          uf: item.uf as UF,
          status: item.status,
          ultimoAcesso: item.ultimo_acesso,
          proximaRenovacao: item.proxima_renovacao,
          mensagem: item.mensagem_erro
        }));
        
        setIntegracoes(integracoesData);
      } else {
        // Se não encontrar, criar integrações padrão
        const integracoesDefault = ESTADOS.map(estado => ({
          id: `sefaz_${estado.uf.toLowerCase()}`,
          nome: `SEFAZ-${estado.uf}`,
          uf: estado.uf,
          status: 'desconectado' as const
        }));
        
        setIntegracoes(integracoesDefault);
      }
      */
      
      // Use default integrations for now
      const integracoesDefault = ESTADOS.map(estado => ({
        id: `sefaz_${estado.uf.toLowerCase()}`,
        nome: `SEFAZ-${estado.uf}`,
        uf: estado.uf,
        status: 'desconectado' as 'conectado' | 'desconectado' | 'erro' | 'pendente'
      }));
      
      setIntegracoes(integracoesDefault);
    } catch (error) {
      console.error('Erro ao buscar integrações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as integrações estaduais.",
        variant: "destructive"
      });
      
      // Usar integrações padrão em caso de erro
      const integracoesDefault = ESTADOS.map(estado => ({
        id: `sefaz_${estado.uf.toLowerCase()}`,
        nome: `SEFAZ-${estado.uf}`,
        uf: estado.uf,
        status: 'desconectado' as 'conectado' | 'desconectado' | 'erro' | 'pendente'
      }));
      
      setIntegracoes(integracoesDefault);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSaveIntegracao = async (data: any) => {
    if (!selectedClientId) return;
    
    try {
      // Mock saving integration for now
      // When the table is created, this would actually save to Supabase
      /*
      // Atualizar o status da integração no banco
      const integracaoAtualizada = {
        client_id: selectedClientId,
        uf: activeTab,
        nome: `SEFAZ-${activeTab}`,
        status: 'conectado',
        ultimo_acesso: new Date().toLocaleString('pt-BR'),
        proxima_renovacao: new Date(Date.now() + 30*24*60*60*1000).toLocaleString('pt-BR'),
        certificado_info: JSON.stringify({
          nome: data.certificadoDigital,
          renovar_automaticamente: data.renovarAutomaticamente || false
        })
      };
      
      // Verificar se já existe uma integração para este cliente/UF
      const { data: existingData } = await supabase
        .from('integracoes_estaduais')
        .select('id')
        .eq('client_id', selectedClientId)
        .eq('uf', activeTab)
        .single();
      
      let result;
      
      if (existingData?.id) {
        // Atualizar
        result = await supabase
          .from('integracoes_estaduais')
          .update(integracaoAtualizada)
          .eq('id', existingData.id);
      } else {
        // Inserir
        result = await supabase
          .from('integracoes_estaduais')
          .insert([integracaoAtualizada]);
      }
      
      if (result.error) {
        throw result.error;
      }
      */
      
      // Update the local state to simulate saving
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
