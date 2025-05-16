
/**
 * Cliente para integração com microserviço fiscal externo (Django/Flask)
 * Este serviço simula a integração com endpoints externos para cálculos fiscais
 */
import { toast } from "@/hooks/use-toast";
import { TipoImposto, ParametrosCalculo, ResultadoCalculo } from "../types";

// URLs base para ambiente de desenvolvimento e produção
const BASE_URL_DEV = "http://localhost:8000";
const BASE_URL_PROD = "https://fiscal-microservice.api.contabilidade.com";

// Determinar URL base com base no ambiente
const BASE_URL = import.meta.env.PROD ? BASE_URL_PROD : BASE_URL_DEV;

/**
 * Interface de configuração para o cliente de microserviço
 */
export interface MicroserviceConfig {
  useRemoteService: boolean;
  apiKey?: string;
  timeout?: number;
}

// Configuração padrão - por padrão, não usa o microserviço remoto para permitir desenvolvimento sem backend
let config: MicroserviceConfig = {
  useRemoteService: false,
  timeout: 5000
};

/**
 * Configura o cliente de microserviço
 * @param newConfig Nova configuração
 */
export const configureMicroservice = (newConfig: Partial<MicroserviceConfig>): void => {
  config = { ...config, ...newConfig };
  
  console.log("Configuração de microserviço fiscal atualizada:", config);
  
  // Validar configuração para microserviço remoto
  if (config.useRemoteService && !config.apiKey) {
    console.warn("Microserviço fiscal configurado para uso remoto, mas sem API key.");
  }
};

/**
 * Função para chamar um endpoint do microserviço fiscal
 * @param endpoint Endpoint a ser chamado
 * @param data Dados para enviar
 * @returns Resultado da chamada
 */
async function callMicroservice<T>(endpoint: string, data: any): Promise<T> {
  // Verificar se está configurado para usar o serviço remoto
  if (!config.useRemoteService) {
    console.log(`[Simulação] Chamada para endpoint ${endpoint} com dados:`, data);
    
    // Simular atraso de rede
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Para simulação, retornamos dados fake
    // Em ambiente real, isso seria substituído por uma chamada real ao microserviço
    throw new Error("Simulação não implementada para este endpoint específico");
  }
  
  try {
    // Construir URL completa
    const url = `${BASE_URL}${endpoint}`;
    
    // Configurar timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout);
    
    // Fazer a requisição
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify(data),
      signal: controller.signal
    });
    
    // Limpar timeout
    clearTimeout(timeoutId);
    
    // Verificar se a resposta é bem-sucedida
    if (!response.ok) {
      throw new Error(`Erro ao chamar microserviço fiscal: ${response.status} - ${response.statusText}`);
    }
    
    // Retornar dados
    return await response.json();
    
  } catch (error) {
    console.error(`Erro na chamada ao microserviço fiscal (${endpoint}):`, error);
    
    // Mostrar notificação de erro
    toast({
      title: "Erro no cálculo fiscal",
      description: error instanceof Error ? error.message : "Falha ao comunicar com o serviço fiscal",
      variant: "destructive"
    });
    
    throw error;
  }
}

/**
 * Calcula IRPJ via microserviço
 */
export async function calculateIRPJ(params: ParametrosCalculo): Promise<ResultadoCalculo> {
  try {
    if (config.useRemoteService) {
      return await callMicroservice<ResultadoCalculo>('/calculate/irpj', params);
    } else {
      // Implementação local para simulação
      console.log("[Simulação] Cálculo de IRPJ:", params);
      
      // Simular processamento
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Lógica simplificada para simular cálculo
      const baseCalculo = params.regimeTributario === "LucroPresumido" 
        ? params.valor * 0.32 
        : params.valor - (params.deducoes || 0);
      
      const aliquota = 0.15;
      const valorImposto = baseCalculo * aliquota;
      
      // Data de vencimento para o último dia útil do mês seguinte
      const dataAtual = new Date();
      const ultimoDiaMesSeguinte = new Date(dataAtual.getFullYear(), dataAtual.getMonth() + 2, 0);
      const dataVencimento = ultimoDiaMesSeguinte.toISOString().split('T')[0];
      
      return {
        valorBase: baseCalculo,
        valorImposto,
        aliquotaEfetiva: aliquota,
        deducoes: params.deducoes || 0,
        valorFinal: valorImposto,
        dataVencimento,
        codigoReceita: "2089",
        dadosOrigem: {
          fonte: "microservice-simulator",
          parametros: params
        }
      };
    }
  } catch (error) {
    console.error("Erro ao calcular IRPJ via microserviço:", error);
    throw error;
  }
}

/**
 * Calcula tributos do Simples Nacional via microserviço
 */
export async function calculateSimples(params: ParametrosCalculo): Promise<ResultadoCalculo> {
  try {
    if (config.useRemoteService) {
      return await callMicroservice<ResultadoCalculo>('/calculate/simples', params);
    } else {
      // Implementação local para simulação
      console.log("[Simulação] Cálculo de Simples Nacional:", params);
      
      // Simular processamento
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Lógica simplificada para simular cálculo do Simples Nacional
      const faixaSimples = determinarFaixaSimples(params.valor);
      const aliquota = faixaSimples.aliquota;
      const valorImposto = params.valor * aliquota;
      
      // Data de vencimento - Simples Nacional vence dia 20 do mês seguinte
      const dataAtual = new Date();
      const dataVencimento = new Date(
        dataAtual.getFullYear(), 
        dataAtual.getMonth() + 1, 
        20
      ).toISOString().split('T')[0];
      
      return {
        valorBase: params.valor,
        valorImposto,
        aliquotaEfetiva: aliquota,
        deducoes: 0,
        valorFinal: valorImposto,
        dataVencimento,
        codigoReceita: "DAS",
        dadosOrigem: {
          fonte: "microservice-simulator",
          parametros: params,
          faixa: faixaSimples.faixa
        }
      };
    }
  } catch (error) {
    console.error("Erro ao calcular Simples Nacional via microserviço:", error);
    throw error;
  }
}

/**
 * Gera DARF via microserviço
 */
export async function generateDARF(
  tipoImposto: TipoImposto,
  resultado: ResultadoCalculo,
  cnpj: string
): Promise<string> {
  try {
    if (config.useRemoteService) {
      const response = await callMicroservice<{ barCode: string }>('/generate/darf', {
        tipoImposto,
        resultado,
        cnpj
      });
      
      return response.barCode;
    } else {
      // Implementação local para simulação
      console.log("[Simulação] Geração de DARF para:", tipoImposto, resultado, cnpj);
      
      // Simular processamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Lógica simplificada para simular geração de código de barras
      const randomCode = Math.floor(10000000000 + Math.random() * 90000000000);
      const barCode = `85810000${randomCode}-5 ${resultado.codigoReceita}0065${randomCode % 1000}-1 ${resultado.dataVencimento.replace(/-/g, "")}2-6 ${cnpj.substring(0,8)}55-9`;
      
      return barCode;
    }
  } catch (error) {
    console.error("Erro ao gerar DARF via microserviço:", error);
    throw error;
  }
}

/**
 * Função auxiliar para determinar a faixa do Simples Nacional
 * Baseado em valores simplificados para simulação
 */
function determinarFaixaSimples(valorMensal: number): { faixa: number; aliquota: number } {
  // Projeção anual (valor mensal * 12)
  const valorAnual = valorMensal * 12;
  
  // Tabela simplificada do Anexo III do Simples Nacional
  if (valorAnual <= 180000) {
    return { faixa: 1, aliquota: 0.06 };
  } else if (valorAnual <= 360000) {
    return { faixa: 2, aliquota: 0.1115 };
  } else if (valorAnual <= 720000) {
    return { faixa: 3, aliquota: 0.1368 };
  } else if (valorAnual <= 1800000) {
    return { faixa: 4, aliquota: 0.1960 };
  } else {
    return { faixa: 5, aliquota: 0.21 };
  }
}
