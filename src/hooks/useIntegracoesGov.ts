
import { useState } from 'react';
import { UF } from "@/services/governamental/estadualIntegration";
import { 
  saveIntegracaoEstadual, 
  saveIntegracaoSimplesNacional, 
  fetchIntegracoesEstaduais 
} from "@/services/supabase/integracoesService";
import { fetchClientById } from "@/services/supabase/clientsService";

export interface IntegracaoStatus {
  id: string;
  nome: string;
  status: 'conectado' | 'desconectado' | 'erro' | 'pendente';
  ultimoAcesso?: string;
  proximaRenovacao?: string;
  mensagem?: string;
}

export function useIntegracoesGov() {
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedClientName, setSelectedClientName] = useState<string>('');
  const [selectedClientCnpj, setSelectedClientCnpj] = useState<string>('');
  const [activeTab, setActiveTab] = useState("ecac");
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [selectedState, setSelectedState] = useState<UF | null>(null);
  
  // Estado para as integrações
  const [integracoes, setIntegracoes] = useState<IntegracaoStatus[]>([
    {
      id: "ecac",
      nome: "e-CAC (Receita Federal)",
      status: 'desconectado',
    },
    {
      id: "sefaz_sp",
      nome: "SEFAZ-SP",
      status: 'desconectado',
    },
    {
      id: "sefaz_rj",
      nome: "SEFAZ-RJ",
      status: 'desconectado',
    },
    {
      id: "sefaz_sc",
      nome: "SEFAZ-SC",
      status: 'desconectado',
    },
    {
      id: "simples_nacional",
      nome: "Portal Simples Nacional",
      status: 'desconectado',
    },
  ]);
  
  const handleClientSelect = async (client: { id: string, name: string, cnpj?: string }) => {
    setSelectedClientId(client.id);
    setSelectedClientName(client.name);
    setSelectedClientCnpj(client.cnpj || '');
    
    if (!client.id) {
      // Resetar integrações para o estado inicial
      setIntegracoes([
        {
          id: "ecac",
          nome: "e-CAC (Receita Federal)",
          status: 'desconectado',
        },
        {
          id: "sefaz_sp",
          nome: "SEFAZ-SP",
          status: 'desconectado',
        },
        {
          id: "sefaz_rj",
          nome: "SEFAZ-RJ",
          status: 'desconectado',
        },
        {
          id: "sefaz_sc",
          nome: "SEFAZ-SC",
          status: 'desconectado',
        },
        {
          id: "simples_nacional",
          nome: "Portal Simples Nacional",
          status: 'desconectado',
        },
      ]);
      return;
    }
    
    // Se não tiver CNPJ, tenta buscar do Supabase
    if (!client.cnpj) {
      const clientData = await fetchClientById(client.id);
      if (clientData?.cnpj) {
        setSelectedClientCnpj(clientData.cnpj);
      }
    }
    
    // Buscar integrações estaduais do cliente
    try {
      const integracoesEstadual = await fetchIntegracoesEstaduais(client.id);
      
      // Atualizar status das integrações com SEFAZ
      const updatedIntegracoes = [...integracoes];
      
      // Atualizar SEFAZ-SP
      const spIntegracao = integracoesEstadual.find(i => i.uf === "SP");
      if (spIntegracao) {
        const index = updatedIntegracoes.findIndex(i => i.id === "sefaz_sp");
        if (index >= 0) {
          updatedIntegracoes[index] = {
            ...updatedIntegracoes[index],
            status: spIntegracao.status,
            ultimoAcesso: spIntegracao.ultimoAcesso,
            proximaRenovacao: spIntegracao.proximaRenovacao,
            mensagem: spIntegracao.mensagemErro
          };
        }
      }
      
      // Atualizar SEFAZ-RJ
      const rjIntegracao = integracoesEstadual.find(i => i.uf === "RJ");
      if (rjIntegracao) {
        const index = updatedIntegracoes.findIndex(i => i.id === "sefaz_rj");
        if (index >= 0) {
          updatedIntegracoes[index] = {
            ...updatedIntegracoes[index],
            status: rjIntegracao.status,
            ultimoAcesso: rjIntegracao.ultimoAcesso,
            proximaRenovacao: rjIntegracao.proximaRenovacao,
            mensagem: rjIntegracao.mensagemErro
          };
        }
      }
      
      // Atualizar SEFAZ-SC
      const scIntegracao = integracoesEstadual.find(i => i.uf === "SC");
      if (scIntegracao) {
        const index = updatedIntegracoes.findIndex(i => i.id === "sefaz_sc");
        if (index >= 0) {
          updatedIntegracoes[index] = {
            ...updatedIntegracoes[index],
            status: scIntegracao.status,
            ultimoAcesso: scIntegracao.ultimoAcesso,
            proximaRenovacao: scIntegracao.proximaRenovacao,
            mensagem: scIntegracao.mensagemErro
          };
        }
      }
      
      setIntegracoes(updatedIntegracoes);
      
    } catch (error) {
      console.error("Erro ao buscar integrações:", error);
    }
  };
  
  const handleSaveIntegracao = async (data: any) => {
    // Atualizar o status da integração baseado na aba ativa
    let saved = false;
    
    try {
      switch (activeTab) {
        case "ecac":
          // TODO: Implementar integração com e-CAC no Supabase
          saved = true;
          break;
          
        case "sefaz":
          if (selectedState) {
            saved = await saveIntegracaoEstadual(selectedClientId, selectedState, data);
          }
          break;
          
        case "simples_nacional":
          saved = await saveIntegracaoSimplesNacional(selectedClientId, selectedClientCnpj, data);
          break;
      }
      
      if (!saved) {
        throw new Error("Falha ao salvar configuração");
      }
      
      // Atualizar o estado local
      setIntegracoes(prev => prev.map(integracao => 
        integracao.id === activeTab || (activeTab === "sefaz" && integracao.id === `sefaz_${selectedState?.toLowerCase()}`) ? {
          ...integracao,
          status: 'conectado',
          ultimoAcesso: new Date().toLocaleString('pt-BR'),
          proximaRenovacao: new Date(Date.now() + 30*24*60*60*1000).toLocaleString('pt-BR'),
        } : integracao
      ));
    } catch (error) {
      console.error("Erro ao salvar integração:", error);
    }
  };
  
  const handleStateSelect = (uf: UF) => {
    setSelectedState(uf);
    setActiveTab("sefaz");
    setShowStateDropdown(false);
  };

  return {
    selectedClientId,
    selectedClientName,
    selectedClientCnpj,
    activeTab,
    setActiveTab,
    showStateDropdown,
    setShowStateDropdown,
    selectedState,
    setSelectedState,
    integracoes,
    handleClientSelect,
    handleSaveIntegracao,
    handleStateSelect
  };
}
