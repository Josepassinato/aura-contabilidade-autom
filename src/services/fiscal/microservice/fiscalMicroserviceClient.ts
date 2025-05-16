
/**
 * Cliente para consumo de microserviços fiscais
 * Permite interagir com APIs de cálculo fiscal em outros serviços
 */

import { ParametrosCalculo, ResultadoCalculo } from "../types";

/**
 * Simula um cliente para API de cálculo de IRPJ
 */
export const calculateIRPJ = async (params: ParametrosCalculo): Promise<ResultadoCalculo> => {
  console.log("[Microservice] Calculando IRPJ para:", params);
  
  // Simular latência de rede
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Cálculo simulado
  const valorBase = params.valor;
  const aliquota = 0.15;
  
  // Base de cálculo (com simplificações)
  let baseCalculo;
  if (params.regimeTributario === 'LucroPresumido') {
    baseCalculo = valorBase * 0.32; // 32% de presunção para serviços
  } else {
    baseCalculo = valorBase - (params.deducoes || 0);
  }
  
  const valorFinal = baseCalculo * aliquota;
  
  // Data de vencimento: último dia útil do mês seguinte
  const dataPeriodo = new Date(params.periodo + '-01');
  const dataVencimento = new Date(dataPeriodo.getFullYear(), dataPeriodo.getMonth() + 1, 0);
  
  return {
    tipoImposto: 'IRPJ',
    cnpj: params.cnpj,
    periodo: params.periodo,
    valorBase,
    baseCalculo,
    aliquotaEfetiva: valorFinal / valorBase,
    aliquota,
    valorFinal,
    dataVencimento: dataVencimento.toISOString().split('T')[0],
    calculadoEm: new Date().toISOString(),
    status: 'ativo',
    codigoReceita: '2203',
    deducoes: params.deducoes || 0,
    dadosOrigem: {
      fonte: 'microservice-simulator',
      totalRegistros: 1,
      documentos: [{
        id: `doc-${Date.now()}`,
        tipo: 'balanco',
        valor: valorBase
      }]
    }
  };
};

/**
 * Simula um cliente para API de cálculo do Simples Nacional
 */
export const calculateSimples = async (params: ParametrosCalculo): Promise<ResultadoCalculo> => {
  console.log("[Microservice] Calculando Simples Nacional para:", params);
  
  // Simular latência de rede
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Cálculo simulado
  const valorBase = params.valor;
  
  // No Simples Nacional, a alíquota efetiva depende do faturamento
  // dos últimos 12 meses - aqui simplificamos com uma alíquota fixa
  const aliquota = 0.06; // 6% de exemplo
  
  // No Simples, não há presunção de lucro como no Lucro Presumido
  const baseCalculo = valorBase;
  const valorFinal = baseCalculo * aliquota;
  
  // Data de vencimento (dia 20 do mês seguinte)
  const dataPeriodo = new Date(params.periodo + '-01');
  const dataVencimento = new Date(dataPeriodo.getFullYear(), dataPeriodo.getMonth() + 1, 20);
  
  return {
    tipoImposto: 'Simples',
    cnpj: params.cnpj,
    periodo: params.periodo,
    valorBase,
    baseCalculo,
    aliquotaEfetiva: aliquota,
    aliquota,
    valorFinal,
    dataVencimento: dataVencimento.toISOString().split('T')[0],
    calculadoEm: new Date().toISOString(),
    status: 'ativo',
    codigoReceita: 'DAS',
    dadosOrigem: {
      fonte: 'microservice-simulator',
      totalRegistros: 1,
      documentos: [{
        id: `doc-${Date.now()}`,
        tipo: 'receitas',
        valor: valorBase
      }]
    }
  };
};
