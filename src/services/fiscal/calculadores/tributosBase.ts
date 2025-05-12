
/**
 * Funções básicas para cálculo de tributos
 */

import { toast } from "@/hooks/use-toast";
import { TipoImposto, ParametrosCalculo, ResultadoCalculo } from "../types";

// Funções auxiliares para cálculos fiscais
export const calcularIRPJ = (params: ParametrosCalculo): ResultadoCalculo => {
  // Implementação simplificada de cálculo de IRPJ
  const { valor, deducoes = 0, regimeTributario } = params;
  
  // Determinando alíquota baseada no regime tributário
  let aliquota = 0.15; // Padrão para Lucro Real e Presumido
  let adicional = 0;
  
  // Base de cálculo
  let baseCalculo = regimeTributario === 'LucroPresumido' ? valor * 0.32 : valor;
  baseCalculo = Math.max(0, baseCalculo - deducoes);
  
  // Cálculo do imposto
  let valorImposto = baseCalculo * aliquota;
  
  // Adicional de 10% sobre o valor que exceder R$ 20.000,00 mensais
  if (baseCalculo > 20000) {
    adicional = (baseCalculo - 20000) * 0.1;
    valorImposto += adicional;
  }

  // Data de vencimento (último dia útil do mês seguinte)
  const dataPeriodo = new Date(params.periodo + '-01');
  const dataVencimento = new Date(dataPeriodo.getFullYear(), dataPeriodo.getMonth() + 2, 0);
  
  return {
    valorBase: baseCalculo,
    valorImposto,
    aliquotaEfetiva: valorImposto / valor,
    deducoes,
    valorFinal: valorImposto,
    dataVencimento: dataVencimento.toISOString().split('T')[0],
    codigoReceita: '2203'
  };
};

export const calcularCSLL = (params: ParametrosCalculo): ResultadoCalculo => {
  // Implementação simplificada de cálculo de CSLL
  const { valor, deducoes = 0, regimeTributario } = params;
  
  // Alíquota CSLL (9% para Lucro Real/Presumido)
  const aliquota = 0.09;
  
  // Base de cálculo
  let baseCalculo = regimeTributario === 'LucroPresumido' ? valor * 0.32 : valor;
  baseCalculo = Math.max(0, baseCalculo - deducoes);
  
  // Cálculo do imposto
  const valorImposto = baseCalculo * aliquota;

  // Data de vencimento (último dia útil do mês seguinte)
  const dataPeriodo = new Date(params.periodo + '-01');
  const dataVencimento = new Date(dataPeriodo.getFullYear(), dataPeriodo.getMonth() + 2, 0);
  
  return {
    valorBase: baseCalculo,
    valorImposto,
    aliquotaEfetiva: valorImposto / valor,
    deducoes,
    valorFinal: valorImposto,
    dataVencimento: dataVencimento.toISOString().split('T')[0],
    codigoReceita: '2372'
  };
};

export const calcularPIS = (params: ParametrosCalculo): ResultadoCalculo => {
  // Implementação simplificada de cálculo de PIS
  const { valor, deducoes = 0, regimeTributario } = params;
  
  // Alíquota PIS (0.65% para Lucro Presumido, 1.65% para Lucro Real)
  const aliquota = regimeTributario === 'LucroPresumido' ? 0.0065 : 0.0165;
  
  // Base de cálculo
  let baseCalculo = valor;
  baseCalculo = Math.max(0, baseCalculo - deducoes);
  
  // Cálculo do imposto
  const valorImposto = baseCalculo * aliquota;

  // Data de vencimento (25 do mês seguinte)
  const dataPeriodo = new Date(params.periodo + '-01');
  const dataVencimento = new Date(dataPeriodo.getFullYear(), dataPeriodo.getMonth() + 1, 25);
  
  return {
    valorBase: baseCalculo,
    valorImposto,
    aliquotaEfetiva: valorImposto / valor,
    deducoes,
    valorFinal: valorImposto,
    dataVencimento: dataVencimento.toISOString().split('T')[0],
    codigoReceita: regimeTributario === 'LucroPresumido' ? '8109' : '6912'
  };
};

export const calcularCOFINS = (params: ParametrosCalculo): ResultadoCalculo => {
  // Implementação simplificada de cálculo de COFINS
  const { valor, deducoes = 0, regimeTributario } = params;
  
  // Alíquota COFINS (3% para Lucro Presumido, 7.6% para Lucro Real)
  const aliquota = regimeTributario === 'LucroPresumido' ? 0.03 : 0.076;
  
  // Base de cálculo
  let baseCalculo = valor;
  baseCalculo = Math.max(0, baseCalculo - deducoes);
  
  // Cálculo do imposto
  const valorImposto = baseCalculo * aliquota;

  // Data de vencimento (25 do mês seguinte)
  const dataPeriodo = new Date(params.periodo + '-01');
  const dataVencimento = new Date(dataPeriodo.getFullYear(), dataPeriodo.getMonth() + 1, 25);
  
  return {
    valorBase: baseCalculo,
    valorImposto,
    aliquotaEfetiva: valorImposto / valor,
    deducoes,
    valorFinal: valorImposto,
    dataVencimento: dataVencimento.toISOString().split('T')[0],
    codigoReceita: regimeTributario === 'LucroPresumido' ? '2172' : '5856'
  };
};
