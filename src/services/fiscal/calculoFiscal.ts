
/**
 * Serviço principal para cálculos fiscais
 * Coordena os diferentes cálculos de impostos e obrigações fiscais
 */

import { toast } from "@/hooks/use-toast";
import { TipoImposto, ParametrosCalculo, ResultadoCalculo } from "./types";

// Importação dos calculadores específicos
import { 
  calcularIRPJ, 
  calcularCSLL, 
  calcularPIS, 
  calcularCOFINS 
} from "./calculadores/tributosBase";
import { calcularICMS, calcularISS } from "./calculadores/tributosEstadual";
import { calcularINSS, calcularFGTS } from "./calculadores/tributosTrabalhistas";
import { calcularSimples } from "./calculadores/simplesNacional";

// Importação do cliente do microserviço fiscal
import { 
  calculateIRPJ as microserviceIRPJ, 
  calculateSimples as microserviceSimples,
  configureMicroservice,
  MicroserviceConfig
} from "./microservice/fiscalMicroserviceClient";

// Reexportação de tipos e funções para compatibilidade com código existente
export type { TipoImposto, ParametrosCalculo, ResultadoCalculo } from "./types";
export { calcularImpostoPorNotasFiscais, calcularImpostosPorNotasFiscais } from "./processadores/notasFiscaisProcessor";
export { calcularImpostoPorDadosContabeis, calcularImpostosPorLancamentos } from "./processadores/lancamentosProcessor";
export { gerarDARF } from "./darfService";

// Reexportar configuração de microserviço
export { configureMicroservice, type MicroserviceConfig } from "./microservice/fiscalMicroserviceClient";

// Reexportar funções de workflow
export { 
  agendarCalculoFiscal,
  agendarCalculosTrimestrais,
  executarWorkflow,
  obterWorkflowsAgendados,
  obterWorkflowPorId
} from "./workflow/fiscalWorkflowService";

// Flag para controlar o uso do microserviço ou implementação local
// Por padrão, usamos a implementação local para facilitar o desenvolvimento
let useMicroservice = false;

/**
 * Configura o modo de cálculo fiscal
 * @param useMicroserviceApi Se verdadeiro, usa a API do microserviço; caso contrário, usa implementação local
 * @param microserviceConfig Configuração do microserviço (opcional)
 */
export const configurarCalculoFiscal = (
  useMicroserviceApi: boolean,
  microserviceConfig?: Partial<MicroserviceConfig>
): void => {
  useMicroservice = useMicroserviceApi;
  
  if (useMicroserviceApi && microserviceConfig) {
    configureMicroservice({
      useRemoteService: true,
      ...microserviceConfig
    });
  }
  
  console.log(`Serviço fiscal configurado para ${useMicroserviceApi ? 'usar microserviço' : 'implementação local'}`);
};

/**
 * Função principal para cálculo de impostos
 * Serve como fachada (facade) para os calculadores específicos
 */
export const calcularImposto = async (
  tipo: TipoImposto, 
  params: ParametrosCalculo
): Promise<ResultadoCalculo> => {
  try {
    let resultado: ResultadoCalculo;
    
    // Se estiver configurado para usar o microserviço
    if (useMicroservice) {
      switch (tipo) {
        case 'IRPJ':
          return await microserviceIRPJ(params);
        case 'Simples':
          return await microserviceSimples(params);
        default:
          console.log(`Microserviço não implementado para ${tipo}, usando implementação local`);
          // Implementações para outros tipos continuam abaixo
      }
    }
    
    // Implementação local (fallback ou padrão)
    switch (tipo) {
      case 'IRPJ':
        resultado = calcularIRPJ(params);
        break;
      case 'CSLL':
        resultado = calcularCSLL(params);
        break;
      case 'PIS':
        resultado = calcularPIS(params);
        break;
      case 'COFINS':
        resultado = calcularCOFINS(params);
        break;
      case 'ICMS':
        resultado = calcularICMS(params);
        break;
      case 'ISS':
        resultado = calcularISS(params);
        break;
      case 'INSS':
        resultado = calcularINSS(params);
        break;
      case 'FGTS':
        resultado = calcularFGTS(params);
        break;
      case 'Simples':
        resultado = calcularSimples(params);
        break;
      default:
        throw new Error(`Cálculo para ${tipo} ainda não implementado`);
    }
    
    console.log(`Cálculo de ${tipo} realizado com sucesso:`, resultado);
    return resultado;
    
  } catch (error) {
    console.error(`Erro ao calcular ${tipo}:`, error);
    toast({
      title: `Erro ao calcular ${tipo}`,
      description: error instanceof Error ? error.message : "Ocorreu um erro no cálculo",
      variant: "destructive",
    });
    throw error;
  }
};
