import { useState } from 'react';
import { UF } from "@/services/governamental/estadualIntegration";
import { 
  saveIntegracaoEstadual, 
  saveIntegracaoSimplesNacional, 
  fetchIntegracoesEstaduais 
} from "@/services/supabase/integracoesService";
import { fetchClientById } from "@/services/supabase/clientsService";
import { verificarDisponibilidadeProcuracaoSefaz } from "@/services/governamental/sefazAutomaticService";

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
  
  // Estado para as integrações - INICIA SEMPRE COMO DESCONECTADO
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
    console.log('Cliente selecionado:', client);
    
    // Validar se o ID do cliente é um UUID válido
    if (client.id) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(client.id)) {
        console.error('ID do cliente não é um UUID válido:', client.id);
        return;
      }
    }
    
    setSelectedClientId(client.id);
    setSelectedClientName(client.name);
    setSelectedClientCnpj(client.cnpj || '');
    
    if (!client.id) {
      // Resetar integrações para DESCONECTADO
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
      try {
        const clientData = await fetchClientById(client.id);
        if (clientData?.cnpj) {
          setSelectedClientCnpj(clientData.cnpj);
        }
      } catch (error) {
        console.error('Erro ao buscar dados do cliente:', error);
      }
    }
    
    // Verificar status REAL das integrações SEFAZ
    try {
      const updatedIntegracoes = [...integracoes];
      
      // Verificar SEFAZ-SP
      const statusSP = await verificarDisponibilidadeProcuracaoSefaz(client.id, "SP");
      const indexSP = updatedIntegracoes.findIndex(i => i.id === "sefaz_sp");
      if (indexSP >= 0) {
        updatedIntegracoes[indexSP] = {
          ...updatedIntegracoes[indexSP],
          status: statusSP.possui ? 'conectado' : 'desconectado',
          mensagem: statusSP.mensagem
        };
      }
      
      // Verificar SEFAZ-RJ
      const statusRJ = await verificarDisponibilidadeProcuracaoSefaz(client.id, "RJ");
      const indexRJ = updatedIntegracoes.findIndex(i => i.id === "sefaz_rj");
      if (indexRJ >= 0) {
        updatedIntegracoes[indexRJ] = {
          ...updatedIntegracoes[indexRJ],
          status: statusRJ.possui ? 'conectado' : 'desconectado',
          mensagem: statusRJ.mensagem
        };
      }
      
      // Verificar SEFAZ-SC
      const statusSC = await verificarDisponibilidadeProcuracaoSefaz(client.id, "SC");
      const indexSC = updatedIntegracoes.findIndex(i => i.id === "sefaz_sc");
      if (indexSC >= 0) {
        updatedIntegracoes[indexSC] = {
          ...updatedIntegracoes[indexSC],
          status: statusSC.possui ? 'conectado' : 'desconectado',
          mensagem: statusSC.mensagem
        };
      }
      
      setIntegracoes(updatedIntegracoes);
      
    } catch (error) {
      console.error("Erro ao verificar integrações:", error);
      // Manter todas como desconectado em caso de erro
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
      
      // Atualizar o estado local APENAS se salvou com sucesso
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
