
/**
 * Serviço de cálculo fiscal
 * Centraliza as funções de cálculo de impostos
 */

// Importar os calculadores específicos
import { calcularIRPJ, calcularCSLL, calcularPIS, calcularCOFINS } from "./calculadores/tributosBase";
import { calcularISSQN } from "./calculadores/tributosEstadual";
import { calcularFGTS, calcularINSS } from "./calculadores/tributosTrabalhistas";
import { calcularSimples } from "./calculadores/simplesNacional";

// Reexportar os tipos
export type { TipoImposto, ParametrosCalculo, ResultadoCalculo, RegimeTributario } from "./types";

// Função principal para cálculo de impostos
export const calcularImposto = (tipoImposto: string, params: any): any => {
  console.log(`Calculando ${tipoImposto} com parâmetros:`, params);
  
  // Direcionar para o calculador específico
  switch (tipoImposto) {
    case 'IRPJ':
      return calcularIRPJ(params);
    case 'CSLL':
      return calcularCSLL(params);
    case 'PIS':
      return calcularPIS(params);
    case 'COFINS':
      return calcularCOFINS(params);
    case 'ISS':
      return calcularISSQN(params);
    case 'INSS':
      return calcularINSS(params);
    case 'FGTS':
      return calcularFGTS(params);
    case 'Simples':
    case 'DAS':
      return calcularSimples(params);
    default:
      throw new Error(`Tipo de imposto não suportado: ${tipoImposto}`);
  }
};

// Função para cálculo de imposto por dados contábeis
export const calcularImpostoPorDadosContabeis = async (
  tipoImposto: string,
  params: any
): Promise<any> => {
  console.log(`Calculando ${tipoImposto} com dados contábeis:`, params);
  
  // Simulação de processamento assíncrono
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Calcular imposto com os parâmetros fornecidos
  return calcularImposto(tipoImposto, {
    ...params,
    fonte: 'contabilidade'
  });
};

// Função para cálculo de imposto por notas fiscais
export const calcularImpostoPorNotasFiscais = async (
  tipoImposto: string,
  params: any
): Promise<any> => {
  console.log(`Calculando ${tipoImposto} com notas fiscais:`, params);
  
  // Simulação de processamento assíncrono
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Calcular imposto com os parâmetros fornecidos
  return calcularImposto(tipoImposto, {
    ...params,
    fonte: 'notasFiscais'
  });
};

// Função para cálculo conjunto de impostos por notas fiscais
export const calcularImpostosPorNotasFiscais = async (
  tiposImposto: string[],
  params: any
): Promise<any[]> => {
  console.log(`Calculando impostos [${tiposImposto.join(', ')}] por notas fiscais`);
  
  // Calcular cada imposto individualmente
  const resultados = await Promise.all(
    tiposImposto.map(tipo => calcularImpostoPorNotasFiscais(tipo, params))
  );
  
  return resultados;
};

// Função para cálculo conjunto de impostos por lançamentos contábeis
export const calcularImpostosPorLancamentos = async (
  tiposImposto: string[],
  params: any
): Promise<any[]> => {
  console.log(`Calculando impostos [${tiposImposto.join(', ')}] por lançamentos contábeis`);
  
  // Calcular cada imposto individualmente
  const resultados = await Promise.all(
    tiposImposto.map(tipo => calcularImpostoPorDadosContabeis(tipo, params))
  );
  
  return resultados;
};

// Reexportar a função de geração de DARF do serviço específico
export { gerarDARF } from "./darfService";
