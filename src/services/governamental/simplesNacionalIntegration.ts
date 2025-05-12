
/**
 * Integração com o Portal do Simples Nacional
 */

import { toast } from "@/hooks/use-toast";

// Interface para credenciais do Simples Nacional
export interface CredenciaisSimplesNacional {
  cnpj: string;
  codigo_acesso?: string;
  certificado_digital?: string;
  senha_certificado?: string;
}

// Interface para respostas do Portal do Simples Nacional
export interface RespostaSimplesNacional<T> {
  sucesso: boolean;
  dados?: T;
  erro?: string;
  codigoErro?: string;
  timestamp: string;
}

/**
 * Função para obter credenciais do Simples Nacional
 */
export const obterCredenciaisSimplesNacional = (cnpj: string): CredenciaisSimplesNacional => {
  const storagePrefix = `simples-nacional-${cnpj}`;
  
  return {
    cnpj,
    codigo_acesso: localStorage.getItem(`${storagePrefix}-codigo`) || undefined,
    certificado_digital: localStorage.getItem(`${storagePrefix}-certificado`) || undefined,
    senha_certificado: localStorage.getItem(`${storagePrefix}-senha`) || undefined
  };
};

/**
 * Salvar credenciais do Simples Nacional no localStorage
 */
export const salvarCredenciaisSimplesNacional = (credenciais: CredenciaisSimplesNacional): void => {
  const { cnpj, codigo_acesso, certificado_digital, senha_certificado } = credenciais;
  const storagePrefix = `simples-nacional-${cnpj}`;
  
  if (codigo_acesso) localStorage.setItem(`${storagePrefix}-codigo`, codigo_acesso);
  if (certificado_digital) localStorage.setItem(`${storagePrefix}-certificado`, certificado_digital);
  if (senha_certificado) localStorage.setItem(`${storagePrefix}-senha`, senha_certificado);
};

/**
 * Verifica se as credenciais estão configuradas
 */
export const validarCredenciaisSimplesNacional = (credenciais: CredenciaisSimplesNacional): boolean => {
  return Boolean(credenciais.codigo_acesso || credenciais.certificado_digital);
};

/**
 * Função base para realizar requisições ao Portal do Simples Nacional
 */
export const realizarRequisicaoSimplesNacional = async <T>(
  cnpj: string,
  endpoint: string,
  metodo: 'GET' | 'POST' | 'PUT' = 'GET',
  dados?: any
): Promise<RespostaSimplesNacional<T>> => {
  try {
    // Obter credenciais
    const credenciais = obterCredenciaisSimplesNacional(cnpj);
    
    // Verificar se as credenciais existem
    if (!validarCredenciaisSimplesNacional(credenciais)) {
      throw new Error(`Credenciais para o Portal do Simples Nacional não configuradas. Configure em Integrações -> Simples Nacional.`);
    }
    
    // Em uma implementação real, aqui teríamos a lógica de
    // autenticação e requisição para o portal do Simples Nacional
    
    // Simulação de resposta para desenvolvimento
    console.log(`Requisição ${metodo} para Simples Nacional/${endpoint}:`, dados);
    
    // Simular delay de rede (remover em produção)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Resposta simulada para desenvolvimento
    return {
      sucesso: true,
      dados: { mensagem: `Integração com o Portal do Simples Nacional realizada com sucesso` } as unknown as T,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error(`Erro na requisição para Simples Nacional/${endpoint}:`, error);
    
    toast({
      title: `Erro na integração com o Simples Nacional`,
      description: error instanceof Error ? error.message : "Ocorreu um erro na integração",
      variant: "destructive",
    });
    
    return {
      sucesso: false,
      erro: error instanceof Error ? error.message : "Erro desconhecido",
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Funções específicas para Portal do Simples Nacional
 */

// Consulta situação do CNPJ no Simples Nacional
export const consultarSituacaoSimples = async (
  cnpj: string
): Promise<RespostaSimplesNacional<any>> => {
  return await realizarRequisicaoSimplesNacional(cnpj, `situacao/${cnpj}`);
};

// Consulta declarações pendentes
export const consultarDeclaracoesPendentes = async (
  cnpj: string
): Promise<RespostaSimplesNacional<any>> => {
  return await realizarRequisicaoSimplesNacional(cnpj, `declaracoes/pendentes/${cnpj}`);
};

// Envio de declaração (PGDAS-D)
export const enviarDeclaracao = async (
  cnpj: string,
  periodo: string,
  dadosDeclaracao: any
): Promise<RespostaSimplesNacional<any>> => {
  return await realizarRequisicaoSimplesNacional(
    cnpj,
    `declaracao/${periodo}`,
    'POST',
    dadosDeclaracao
  );
};

// Gerar DAS
export const gerarDAS = async (
  cnpj: string,
  periodo: string
): Promise<RespostaSimplesNacional<any>> => {
  return await realizarRequisicaoSimplesNacional(
    cnpj,
    `das/gerar/${periodo}`,
    'POST',
    { cnpj }
  );
};

// Consultar DAS pendentes
export const consultarDASPendentes = async (
  cnpj: string
): Promise<RespostaSimplesNacional<any>> => {
  return await realizarRequisicaoSimplesNacional(cnpj, `das/pendentes/${cnpj}`);
};
