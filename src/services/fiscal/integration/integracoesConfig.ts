
import { toast } from "@/hooks/use-toast";
import { IntegracaoEstadualStatus } from "@/components/integracoes/IntegracaoStatus";
import { getDefaultIntegracoes } from "@/components/integracoes/constants";
import { FonteDadosConfig } from "./types";

/**
 * Verifica se há integrações estaduais configuradas
 * @param cnpj CNPJ da empresa
 * @returns Lista de integrações estaduais configuradas
 */
export const obterIntegracoesConfiguradasPorCNPJ = async (cnpj: string): Promise<IntegracaoEstadualStatus[]> => {
  try {
    // Em uma implementação real, aqui buscaríamos as integrações configuradas
    // para o CNPJ específico em uma base de dados
    
    // Simulação para desenvolvimento
    console.log(`Buscando integrações para CNPJ: ${cnpj}`);
    
    // Para fins de demonstração, se o CNPJ terminar com 0001, consideramos que há integrações
    if (cnpj.endsWith('0001')) {
      // Cliente com integrações simuladas
      return Promise.resolve([
        {
          id: "sefaz_sp",
          nome: "SEFAZ-SP",
          uf: "SP",
          status: 'conectado',
          ultimoAcesso: "10/05/2025 15:30",
          proximaRenovacao: "10/06/2025",
        },
        {
          id: "sefaz_rj",
          nome: "SEFAZ-RJ",
          uf: "RJ",
          status: 'conectado',
          ultimoAcesso: "11/05/2025 16:45",
          proximaRenovacao: "11/06/2025",
        }
      ]);
    }
    
    // Caso contrário, retorna integrações padrão desconectadas
    return Promise.resolve(getDefaultIntegracoes());
    
  } catch (error) {
    console.error('Erro ao obter integrações configuradas:', error);
    toast({
      title: "Erro na verificação de integrações",
      description: "Não foi possível verificar as integrações estaduais configuradas",
      variant: "destructive",
    });
    return [];
  }
};

/**
 * Configura fonte de dados para integração
 * @param config Configuração da fonte de dados
 * @returns Sucesso ou falha na configuração
 */
export const configurarFonteDados = async (config: FonteDadosConfig): Promise<boolean> => {
  try {
    console.log('Configurando fonte de dados:', config);
    
    // Em uma implementação real, aqui salvaríamos as configurações de integração
    // e testaríamos a conexão com a fonte de dados
    
    // Simulação para desenvolvimento
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulando delay de rede
    
    // Validações simuladas
    if (config.tipo === 'erp' && !config.endpointUrl) {
      throw new Error("URL do endpoint é obrigatória para integração com ERP");
    }
    
    if ((config.tipo === 'erp' || config.tipo === 'nfe') && !config.credenciais) {
      throw new Error(`Credenciais são obrigatórias para integração com ${config.tipo.toUpperCase()}`);
    }
    
    // Salvando configuração no localStorage para simulação
    localStorage.setItem(`fonte-dados-${config.tipo}`, JSON.stringify(config));
    
    toast({
      title: "Configuração salva",
      description: `Fonte de dados do tipo ${config.tipo} configurada com sucesso`
    });
    
    return true;
    
  } catch (error) {
    console.error('Erro ao configurar fonte de dados:', error);
    toast({
      title: "Erro na configuração da fonte de dados",
      description: error instanceof Error ? error.message : "Não foi possível configurar a fonte de dados",
      variant: "destructive",
    });
    return false;
  }
};
