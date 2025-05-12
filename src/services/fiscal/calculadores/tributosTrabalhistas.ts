
/**
 * Funções para cálculo de tributos trabalhistas
 */

import { ParametrosCalculo, ResultadoCalculo } from "../types";

export const calcularINSS = (params: ParametrosCalculo): ResultadoCalculo => {
  // Implementação simplificada de cálculo de INSS para pessoa jurídica (patronal)
  const { valor, deducoes = 0 } = params;
  
  // Alíquota INSS patronal básica (20%)
  const aliquota = 0.2;
  
  // Base de cálculo
  let baseCalculo = valor;
  baseCalculo = Math.max(0, baseCalculo - deducoes);
  
  // Cálculo do imposto
  const valorImposto = baseCalculo * aliquota;

  // Data de vencimento (dia 20 do mês seguinte)
  const dataPeriodo = new Date(params.periodo + '-01');
  const dataVencimento = new Date(dataPeriodo.getFullYear(), dataPeriodo.getMonth() + 1, 20);
  
  return {
    valorBase: baseCalculo,
    valorImposto,
    aliquotaEfetiva: valorImposto / valor,
    deducoes,
    valorFinal: valorImposto,
    dataVencimento: dataVencimento.toISOString().split('T')[0],
    codigoReceita: '2100'
  };
};

export const calcularFGTS = (params: ParametrosCalculo): ResultadoCalculo => {
  // Implementação simplificada de cálculo de FGTS
  const { valor, deducoes = 0 } = params;
  
  // Alíquota FGTS (8%)
  const aliquota = 0.08;
  
  // Base de cálculo
  let baseCalculo = valor;
  baseCalculo = Math.max(0, baseCalculo - deducoes);
  
  // Cálculo do imposto
  const valorImposto = baseCalculo * aliquota;

  // Data de vencimento (dia 7 do mês seguinte)
  const dataPeriodo = new Date(params.periodo + '-01');
  const dataVencimento = new Date(dataPeriodo.getFullYear(), dataPeriodo.getMonth() + 1, 7);
  
  return {
    valorBase: baseCalculo,
    valorImposto,
    aliquotaEfetiva: valorImposto / valor,
    deducoes,
    valorFinal: valorImposto,
    dataVencimento: dataVencimento.toISOString().split('T')[0],
    codigoReceita: 'FGTS'
  };
};
