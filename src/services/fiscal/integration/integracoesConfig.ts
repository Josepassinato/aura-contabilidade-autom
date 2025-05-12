
import { toast } from "@/hooks/use-toast";
import { IntegracaoEstadualStatus } from "@/components/integracoes/IntegracaoStatus";
import { getDefaultIntegracoes } from "@/components/integracoes/constants";
import { FonteDadosConfig } from "./types";
import { supabase } from "@/integrations/supabase/client";

/**
 * Verifica se há integrações estaduais configuradas
 * @param cnpj CNPJ da empresa
 * @returns Lista de integrações estaduais configuradas
 */
export const obterIntegracoesConfiguradasPorCNPJ = async (cnpj: string): Promise<IntegracaoEstadualStatus[]> => {
  try {
    console.log(`Buscando integrações para CNPJ: ${cnpj}`);
    
    // Buscar cliente pelo CNPJ
    const { data: cliente, error: clienteError } = await supabase
      .from('accounting_clients')
      .select('id')
      .eq('cnpj', cnpj)
      .single();
      
    if (clienteError || !cliente) {
      console.log('Cliente não encontrado para o CNPJ:', cnpj);
      return getDefaultIntegracoes();
    }
    
    // Buscar integrações para o cliente encontrado
    const { data: integracoes, error: integracoesError } = await supabase
      .from('integracoes_estaduais')
      .select('*')
      .eq('client_id', cliente.id);
      
    if (integracoesError || !integracoes || integracoes.length === 0) {
      console.log('Nenhuma integração encontrada para o cliente:', cliente.id);
      return getDefaultIntegracoes();
    }
    
    // Mapear para o formato esperado pela aplicação
    return integracoes.map(integ => ({
      id: integ.id,
      nome: integ.nome,
      uf: integ.uf as UF,
      status: integ.status as 'conectado' | 'desconectado' | 'erro' | 'pendente',
      ultimoAcesso: integ.ultimo_acesso ? new Date(integ.ultimo_acesso).toLocaleString('pt-BR') : undefined,
      proximaRenovacao: integ.proxima_renovacao ? new Date(integ.proxima_renovacao).toLocaleString('pt-BR') : undefined,
    }));
    
  } catch (error) {
    console.error('Erro ao obter integrações configuradas:', error);
    toast({
      title: "Erro na verificação de integrações",
      description: "Não foi possível verificar as integrações estaduais configuradas",
      variant: "destructive",
    });
    return getDefaultIntegracoes();
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
    
    // Validações básicas
    if (config.tipo === 'erp' && !config.endpointUrl) {
      throw new Error("URL do endpoint é obrigatória para integração com ERP");
    }
    
    if ((config.tipo === 'erp' || config.tipo === 'nfe') && !config.credenciais) {
      throw new Error(`Credenciais são obrigatórias para integração com ${config.tipo.toUpperCase()}`);
    }
    
    // Salvando configuração no localStorage temporariamente
    // Em produção, isso seria salvo no banco de dados
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
