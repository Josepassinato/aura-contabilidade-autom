
/**
 * Funções para cálculo de tributos estaduais
 */

import { ParametrosCalculo, ResultadoCalculo } from "../types";

export const calcularICMS = (params: ParametrosCalculo): ResultadoCalculo => {
  // Implementação simplificada de cálculo de ICMS
  const { valor, aliquota = 0.18, deducoes = 0 } = params;
  
  // Base de cálculo
  let baseCalculo = valor;
  baseCalculo = Math.max(0, baseCalculo - deducoes);
  
  // Cálculo do imposto
  const valorImposto = baseCalculo * aliquota;

  // Data de vencimento (varia por estado, usando o 20 do mês seguinte como exemplo)
  const dataPeriodo = new Date(params.periodo + '-01');
  const dataVencimento = new Date(dataPeriodo.getFullYear(), dataPeriodo.getMonth() + 1, 20);
  
  return {
    valorBase: baseCalculo,
    valorImposto,
    aliquotaEfetiva: valorImposto / valor,
    deducoes,
    valorFinal: valorImposto,
    dataVencimento: dataVencimento.toISOString().split('T')[0]
  };
};

export const calcularISS = (params: ParametrosCalculo): ResultadoCalculo => {
  // Implementação simplificada de cálculo de ISS
  const { valor, aliquota = 0.05, deducoes = 0 } = params;
  
  // Base de cálculo
  let baseCalculo = valor;
  baseCalculo = Math.max(0, baseCalculo - deducoes);
  
  // Cálculo do imposto
  const valorImposto = baseCalculo * aliquota;

  // Data de vencimento (varia por município, usando o 15 do mês seguinte como exemplo)
  const dataPeriodo = new Date(params.periodo + '-01');
  const dataVencimento = new Date(dataPeriodo.getFullYear(), dataPeriodo.getMonth() + 1, 15);
  
  return {
    valorBase: baseCalculo,
    valorImposto,
    aliquotaEfetiva: valorImposto / valor,
    deducoes,
    valorFinal: valorImposto,
    dataVencimento: dataVencimento.toISOString().split('T')[0]
  };
};
