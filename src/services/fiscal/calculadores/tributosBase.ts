
/**
 * Funções comuns para cálculo de tributos federais
 */

import { ParametrosCalculo, ResultadoCalculo } from "../types";

/**
 * Calcula o IRPJ (Imposto de Renda Pessoa Jurídica)
 */
export const calcularIRPJ = (params: ParametrosCalculo): ResultadoCalculo => {
  const { valor, regimeTributario, cnpj, periodo } = params;
  
  // Alíquota depende do regime tributário
  let aliquota = 0;
  let baseCalculo = valor;
  
  if (regimeTributario === 'LucroPresumido') {
    aliquota = 0.15;
    baseCalculo = valor * 0.32; // Presunção de 32% para serviços em geral
  } else if (regimeTributario === 'LucroReal') {
    aliquota = 0.15;
    // No Lucro Real, a base de cálculo seria o lucro contábil ajustado
    baseCalculo = valor - (params.deducoes || 0);
  }
  
  const valorFinal = baseCalculo * aliquota;
  const dataVencimento = calcularDataVencimento(periodo);
  
  return {
    tipoImposto: 'IRPJ',
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
    codigoReceita: '2203',
    deducoes: params.deducoes || 0,
    valorImposto: valorFinal // Mantendo compatibilidade
  };
};

/**
 * Calcula a CSLL (Contribuição Social sobre o Lucro Líquido)
 */
export const calcularCSLL = (params: ParametrosCalculo): ResultadoCalculo => {
  const { valor, regimeTributario, cnpj, periodo } = params;
  
  // Alíquota depende do regime tributário
  let aliquota = 0;
  let baseCalculo = valor;
  
  if (regimeTributario === 'LucroPresumido') {
    aliquota = 0.09;
    baseCalculo = valor * 0.32; // Presunção de 32% para serviços em geral
  } else if (regimeTributario === 'LucroReal') {
    aliquota = 0.09;
    // No Lucro Real, a base de cálculo seria o lucro contábil ajustado
    baseCalculo = valor - (params.deducoes || 0);
  }
  
  const valorFinal = baseCalculo * aliquota;
  const dataVencimento = calcularDataVencimento(periodo);
  
  return {
    tipoImposto: 'CSLL',
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
    codigoReceita: '2372',
    deducoes: params.deducoes || 0,
    valorImposto: valorFinal // Mantendo compatibilidade
  };
};

/**
 * Calcula o PIS (Programa de Integração Social)
 */
export const calcularPIS = (params: ParametrosCalculo): ResultadoCalculo => {
  const { valor, regimeTributario, cnpj, periodo } = params;
  
  // Alíquota depende do regime tributário
  let aliquota = 0;
  let baseCalculo = valor;
  
  if (regimeTributario === 'LucroPresumido' || regimeTributario === 'LucroReal') {
    aliquota = 0.0165; // 1,65% na modalidade não-cumulativa
    // Deduções permitidas no regime não-cumulativo
    baseCalculo = valor - (params.deducoes || 0);
  }
  
  const valorFinal = baseCalculo * aliquota;
  const dataVencimento = calcularDataVencimento(periodo);
  
  return {
    tipoImposto: 'PIS',
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
    codigoReceita: '8109',
    deducoes: params.deducoes || 0,
    valorImposto: valorFinal // Mantendo compatibilidade
  };
};

/**
 * Calcula o COFINS (Contribuição para o Financiamento da Seguridade Social)
 */
export const calcularCOFINS = (params: ParametrosCalculo): ResultadoCalculo => {
  const { valor, regimeTributario, cnpj, periodo } = params;
  
  // Alíquota depende do regime tributário
  let aliquota = 0;
  let baseCalculo = valor;
  
  if (regimeTributario === 'LucroPresumido' || regimeTributario === 'LucroReal') {
    aliquota = 0.076; // 7,6% na modalidade não-cumulativa
    // Deduções permitidas no regime não-cumulativo
    baseCalculo = valor - (params.deducoes || 0);
  }
  
  const valorFinal = baseCalculo * aliquota;
  const dataVencimento = calcularDataVencimento(periodo);
  
  return {
    tipoImposto: 'COFINS',
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
    codigoReceita: '2172',
    deducoes: params.deducoes || 0,
    valorImposto: valorFinal // Mantendo compatibilidade
  };
};

/**
 * Calcula a data de vencimento para tributos federais
 * (geralmente dia 20 do mês seguinte ao período)
 */
const calcularDataVencimento = (periodo: string): string => {
  // Formato esperado do período: "YYYY-MM"
  const [ano, mes] = periodo.split('-').map(Number);
  
  // Data do último dia do mês seguinte
  const dataVencimento = new Date(ano, mes, 20);
  
  return dataVencimento.toISOString().split('T')[0];
};
