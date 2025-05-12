
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

// Reexportação de tipos e funções para compatibilidade com código existente
export type { TipoImposto, ParametrosCalculo, ResultadoCalculo } from "./types";
export { calcularImpostoPorNotasFiscais, calcularImpostosPorNotasFiscais } from "./processadores/notasFiscaisProcessor";
export { calcularImpostoPorDadosContabeis, calcularImpostosPorLancamentos } from "./processadores/lancamentosProcessor";
export { gerarDARF } from "./darfService";

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
