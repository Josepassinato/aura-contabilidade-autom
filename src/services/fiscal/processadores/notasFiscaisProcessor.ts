
/**
 * Processador de notas fiscais para cálculo de impostos
 */

import { toast } from "@/hooks/use-toast";
import { buscarNotasFiscais, NotaFiscalMetadata } from "../dataSourcesIntegration";
import { TipoImposto, ResultadoCalculo } from "../types";
import { calcularImposto } from "../calculoFiscal";

/**
 * Realiza a extração de dados de notas fiscais para cálculo de impostos
 * @param notas Lista de notas fiscais
 * @param tipoImposto Tipo de imposto para extração de dados
 * @returns Base de cálculo e valores relevantes para o tipo de imposto
 */
export const extrairDadosNotasFiscais = (
  notas: NotaFiscalMetadata[], 
  tipoImposto: TipoImposto
): { baseCalculo: number, aliquotaMedia?: number, valorTotalImpostos?: number } => {
  // Cálculo base para todos os tipos de impostos
  const valorTotal = notas.reduce((sum, nota) => sum + nota.valorTotal, 0);
  
  switch (tipoImposto) {
    case 'ICMS': {
      // Extração específica para ICMS
      const valoresICMS = notas.map(nota => nota.impostos.ICMS || 0);
      const totalICMS = valoresICMS.reduce((sum, valor) => sum + valor, 0);
      const aliquotaMedia = totalICMS / valorTotal;
      
      return { 
        baseCalculo: valorTotal, 
        aliquotaMedia, 
        valorTotalImpostos: totalICMS 
      };
    }
    case 'PIS':
    case 'COFINS': {
      // Extração específica para tributos federais
      const valoresImposto = notas.map(nota => nota.impostos[tipoImposto] || 0);
      const totalImposto = valoresImposto.reduce((sum, valor) => sum + valor, 0);
      
      return { 
        baseCalculo: valorTotal,
        valorTotalImpostos: totalImposto 
      };
    }
    // Outros casos específicos...
    default:
      // Cálculo padrão para outros tipos
      return { baseCalculo: valorTotal };
  }
};

/**
 * Calcula impostos de uma empresa com base em suas notas fiscais
 * @param cnpj CNPJ da empresa
 * @param periodo Período de apuração (YYYY-MM)
 * @param tipoImposto Tipo de imposto a ser calculado
 * @param regimeTributario Regime tributário da empresa
 * @returns Resultado do cálculo do imposto
 */
export const calcularImpostoPorNotasFiscais = async (
  cnpj: string,
  periodo: string,
  tipoImposto: TipoImposto,
  regimeTributario: 'Simples' | 'LucroPresumido' | 'LucroReal'
): Promise<ResultadoCalculo> => {
  try {
    // Buscar notas fiscais do período
    const notas = await buscarNotasFiscais(cnpj, periodo);
    
    if (notas.length === 0) {
      throw new Error("Nenhuma nota fiscal encontrada para o período selecionado");
    }
    
    // Extrair dados das notas para o tipo de imposto
    const { baseCalculo, aliquotaMedia } = extrairDadosNotasFiscais(notas, tipoImposto);
    
    // Configurar parâmetros para o cálculo
    const params = {
      valor: baseCalculo,
      periodo,
      cnpj,
      regimeTributario,
      // Se houver uma alíquota média extraída das notas, usar ela
      ...(aliquotaMedia ? { aliquota: aliquotaMedia } : {})
    };
    
    // Realizar o cálculo do imposto
    const resultado = await calcularImposto(tipoImposto, params);
    
    // Adicionar informações sobre a origem dos dados
    return {
      ...resultado,
      dadosOrigem: {
        fonte: 'notasFiscais',
        documentos: notas.length,
        consolidado: true
      }
    };
    
  } catch (error) {
    console.error(`Erro ao calcular ${tipoImposto} por notas fiscais:`, error);
    toast({
      title: `Erro no cálculo de ${tipoImposto}`,
      description: error instanceof Error ? error.message : "Ocorreu um erro no processamento das notas fiscais",
      variant: "destructive",
    });
    throw error;
  }
};

/**
 * Calcula impostos de múltiplas empresas com base em suas notas fiscais
 * @param cnpjs Lista de CNPJs das empresas
 * @param periodo Período de apuração (YYYY-MM)
 * @param tipoImposto Tipo de imposto a ser calculado
 * @param regimesTributarios Regimes tributários das empresas
 * @returns Resultado do cálculo do imposto para cada empresa
 */
export const calcularImpostosPorNotasFiscais = async (
  cnpj: string,
  periodo: string,
  regimeTributario: 'Simples' | 'LucroPresumido' | 'LucroReal'
): Promise<Record<TipoImposto, ResultadoCalculo>> => {
  try {
    // Lista de impostos a calcular de acordo com o regime tributário
    let impostos: TipoImposto[] = [];
    
    if (regimeTributario === 'Simples') {
      impostos = ['Simples'];
    } else if (regimeTributario === 'LucroPresumido') {
      impostos = ['IRPJ', 'CSLL', 'PIS', 'COFINS', 'ICMS', 'ISS'];
    } else { // Lucro Real
      impostos = ['IRPJ', 'CSLL', 'PIS', 'COFINS', 'ICMS', 'ISS'];
    }
    
    // Calcular cada imposto
    const resultados: Record<TipoImposto, ResultadoCalculo> = {} as Record<TipoImposto, ResultadoCalculo>;
    
    for (const imposto of impostos) {
      resultados[imposto] = await calcularImpostoPorNotasFiscais(cnpj, periodo, imposto, regimeTributario);
    }
    
    // Adicionar INSS e FGTS se não for Simples Nacional
    if (regimeTributario !== 'Simples') {
      // Simulando valores de folha de pagamento
      const valorFolha = Math.random() * 50000 + 10000;
      
      const params = {
        valor: valorFolha,
        periodo,
        cnpj,
        regimeTributario
      };
      
      resultados['INSS'] = await calcularImposto('INSS', params);
      resultados['FGTS'] = await calcularImposto('FGTS', params);
    }
    
    return resultados;
    
  } catch (error) {
    console.error(`Erro ao calcular múltiplos impostos por notas fiscais:`, error);
    toast({
      title: "Erro no cálculo de impostos",
      description: error instanceof Error ? error.message : "Ocorreu um erro no processamento dos impostos",
      variant: "destructive",
    });
    throw error;
  }
};
