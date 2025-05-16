
/**
 * Funções para cálculo de tributos estaduais e municipais
 */

import { ParametrosCalculo, ResultadoCalculo } from "../types";

/**
 * Calcula o ICMS (Imposto sobre Circulação de Mercadorias e Serviços)
 */
export const calcularICMS = (params: ParametrosCalculo): ResultadoCalculo => {
  const { valor, cnpj, periodo } = params;
  
  // Alíquota padrão (varia por estado)
  const aliquota = params.aliquota || 0.18; // 18% como exemplo
  
  const baseCalculo = valor;
  const valorFinal = baseCalculo * aliquota;
  
  // Data de vencimento (geralmente 10º dia do mês seguinte)
  const dataVencimento = calcularDataVencimentoEstadual(periodo);
  
  return {
    tipoImposto: 'ICMS',
    periodo,
    cnpj,
    valorBase: valor,
    baseCalculo,
    aliquotaEfetiva: aliquota,
    aliquota,
    valorFinal,
    dataVencimento,
    calculadoEm: new Date().toISOString(),
    status: 'ativo',
    deducoes: 0,
    valorImposto: valorFinal // Mantendo compatibilidade
  };
};

/**
 * Calcula o ISSQN (Imposto sobre Serviços de Qualquer Natureza)
 */
export const calcularISSQN = (params: ParametrosCalculo): ResultadoCalculo => {
  const { valor, cnpj, periodo } = params;
  
  // Alíquota varia por município e atividade
  const aliquota = params.aliquota || 0.05; // 5% como exemplo
  
  const baseCalculo = valor;
  const valorFinal = baseCalculo * aliquota;
  
  // Data de vencimento (geralmente 10º dia do mês seguinte)
  const dataVencimento = calcularDataVencimentoEstadual(periodo);
  
  return {
    tipoImposto: 'ISS',
    periodo,
    cnpj,
    valorBase: valor,
    baseCalculo,
    aliquotaEfetiva: aliquota,
    aliquota,
    valorFinal,
    dataVencimento,
    calculadoEm: new Date().toISOString(),
    status: 'ativo',
    deducoes: 0,
    valorImposto: valorFinal // Mantendo compatibilidade
  };
};

/**
 * Calcula a data de vencimento para tributos estaduais e municipais
 * (geralmente dia 10 do mês seguinte ao período)
 */
const calcularDataVencimentoEstadual = (periodo: string): string => {
  // Formato esperado do período: "YYYY-MM"
  const [ano, mes] = periodo.split('-').map(Number);
  
  // Data do 10º dia do mês seguinte
  let proximoMes = mes + 1;
  let anoVencimento = ano;
  if (proximoMes > 12) {
    proximoMes = 1;
    anoVencimento++;
  }
  
  const dataVencimento = new Date(anoVencimento, proximoMes - 1, 10);
  
  return dataVencimento.toISOString().split('T')[0];
};
