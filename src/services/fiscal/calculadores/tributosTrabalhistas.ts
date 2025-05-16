
/**
 * Funções para cálculo de tributos trabalhistas
 */

import { ParametrosCalculo, ResultadoCalculo } from "../types";

/**
 * Calcula o FGTS (Fundo de Garantia do Tempo de Serviço)
 */
export const calcularFGTS = (params: ParametrosCalculo): ResultadoCalculo => {
  const { valor, cnpj, periodo } = params;
  
  // Alíquota padrão de 8% para o FGTS
  const aliquota = 0.08;
  
  const baseCalculo = valor;
  const valorFinal = baseCalculo * aliquota;
  
  // Data de vencimento (dia 7 do mês seguinte)
  const dataVencimento = calcularDataVencimentoTrabalhista(periodo);
  
  return {
    tipoImposto: 'FGTS',
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
    codigoReceita: '0115',
    deducoes: 0,
    valorImposto: valorFinal // Mantendo compatibilidade
  };
};

/**
 * Calcula o INSS (Instituto Nacional do Seguro Social) - parte patronal
 */
export const calcularINSS = (params: ParametrosCalculo): ResultadoCalculo => {
  const { valor, cnpj, periodo } = params;
  
  // Alíquota básica de 20% para contribuição patronal
  const aliquota = 0.20;
  
  // Algumas empresas podem ter redução na base de cálculo
  const deducoes = params.deducoes || 0;
  
  const baseCalculo = valor - deducoes;
  const valorFinal = baseCalculo * aliquota;
  
  // RAT/FAP pode variar entre empresas (não implementado neste exemplo)
  
  // Data de vencimento (dia 20 do mês seguinte)
  const dataVencimento = calcularDataVencimentoTrabalhista(periodo, 20);
  
  return {
    tipoImposto: 'INSS',
    periodo,
    cnpj,
    valorBase: valor,
    baseCalculo,
    aliquotaEfetiva: valorFinal / valor,
    aliquota,
    valorFinal,
    dataVencimento,
    calculadoEm: new Date().toISOString(),
    status: 'ativo',
    codigoReceita: '2100',
    deducoes,
    valorImposto: valorFinal // Mantendo compatibilidade
  };
};

/**
 * Calcula a data de vencimento para tributos trabalhistas
 * (varia conforme o tributo)
 */
const calcularDataVencimentoTrabalhista = (periodo: string, dia: number = 7): string => {
  // Formato esperado do período: "YYYY-MM"
  const [ano, mes] = periodo.split('-').map(Number);
  
  // Data do dia especificado do mês seguinte
  let proximoMes = mes + 1;
  let anoVencimento = ano;
  if (proximoMes > 12) {
    proximoMes = 1;
    anoVencimento++;
  }
  
  const dataVencimento = new Date(anoVencimento, proximoMes - 1, dia);
  
  return dataVencimento.toISOString().split('T')[0];
};
