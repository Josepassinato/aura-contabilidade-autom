
/**
 * Processador de notas fiscais para cálculos fiscais
 */

import { ResultadoCalculo, TipoImposto } from "../types";

// Interface para notas fiscais
export interface NotaFiscal {
  id: string;
  numero: string;
  serie: string;
  dataEmissao: string;
  valorTotal: number;
  valorBaseCalculo: number;
  valorImposto: number;
  cfop: string;
  naturezaOperacao: string;
  emitente: {
    cnpj: string;
    razaoSocial: string;
  };
  destinatario: {
    cnpj: string;
    razaoSocial: string;
  };
  itens?: Array<{
    codigo: string;
    descricao: string;
    quantidade: number;
    valorUnitario: number;
    valorTotal: number;
  }>;
}

// Interface para resultado do processamento
export interface ResultadoProcessamentoNF {
  notasProcessadas: number;
  valorTotalNFs: number;
  valorTotalBaseCalculo: number;
  valorTotalImpostos: number;
  notasPorCFOP: Record<string, NotaFiscal[]>;
  resultadosCalculos: Record<string, ResultadoCalculo>;
}

/**
 * Processa notas fiscais para cálculo fiscal
 */
export const processarNotasFiscaisParaCalculo = async (
  notasFiscais: NotaFiscal[],
  periodo: string,
  cnpj: string,
  tiposCalculo: TipoImposto[]
): Promise<ResultadoProcessamentoNF> => {
  console.log(`Processando ${notasFiscais.length} notas fiscais para ${periodo}`);
  
  // Agrupar notas fiscais por CFOP
  const notasPorCFOP: Record<string, NotaFiscal[]> = {};
  let valorTotalNFs = 0;
  let valorTotalBaseCalculo = 0;
  let valorTotalImpostos = 0;
  
  // Processar notas fiscais
  notasFiscais.forEach(nf => {
    // Adicionar ao total geral
    valorTotalNFs += nf.valorTotal;
    valorTotalBaseCalculo += nf.valorBaseCalculo;
    valorTotalImpostos += nf.valorImposto;
    
    // Agrupar por CFOP
    if (!notasPorCFOP[nf.cfop]) {
      notasPorCFOP[nf.cfop] = [];
    }
    notasPorCFOP[nf.cfop].push(nf);
  });
  
  console.log('Valor total das NFs:', valorTotalNFs);
  console.log('Valor total da base de cálculo:', valorTotalBaseCalculo);
  
  // Resultados dos cálculos por tipo de imposto
  const resultadosCalculos: Record<string, ResultadoCalculo> = {};
  
  // Calcular cada imposto solicitado
  for (const tipoImposto of tiposCalculo) {
    // Simulação simplificada de cálculo baseado em notas fiscais
    let resultado: ResultadoCalculo;
    const baseCalculo = valorTotalBaseCalculo > 0 ? valorTotalBaseCalculo : valorTotalNFs;
    
    switch (tipoImposto) {
      case 'IRPJ':
        resultado = simularCalculoIRPJ(baseCalculo, periodo, cnpj);
        break;
      case 'CSLL':
        resultado = simularCalculoCSLL(baseCalculo, periodo, cnpj);
        break;
      case 'PIS':
        resultado = simularCalculoPIS(baseCalculo, periodo, cnpj);
        break;
      case 'COFINS':
        resultado = simularCalculoCOFINS(baseCalculo, periodo, cnpj);
        break;
      case 'FGTS':
        resultado = simularCalculoFGTS(baseCalculo, periodo, cnpj);
        break;
      default:
        resultado = simularCalculoGenerico(baseCalculo, periodo, cnpj, tipoImposto);
    }
    
    // Adicionar informações de origem
    resultado.dadosOrigem = {
      fonte: 'notasFiscais',
      totalRegistros: notasFiscais.length,
      documentos: []
    };
    
    resultadosCalculos[tipoImposto] = resultado;
  }
  
  return {
    notasProcessadas: notasFiscais.length,
    valorTotalNFs,
    valorTotalBaseCalculo,
    valorTotalImpostos,
    notasPorCFOP,
    resultadosCalculos
  };
};

// Funções auxiliares para simulação de cálculos fiscais
// Em uma implementação real, essas funções teriam lógicas completas de cálculo

const simularCalculoIRPJ = (baseCalculo: number, periodo: string, cnpj: string): ResultadoCalculo => {
  const aliquota = 0.15;
  const valorFinal = baseCalculo * aliquota;
  
  return {
    tipoImposto: 'IRPJ',
    periodo,
    cnpj,
    valorBase: baseCalculo,
    baseCalculo: baseCalculo * 0.32, // 32% presunção para serviços
    aliquotaEfetiva: valorFinal / baseCalculo,
    aliquota,
    valorFinal,
    dataVencimento: calcularDataVencimento(periodo),
    calculadoEm: new Date().toISOString(),
    status: 'ativo',
    codigoReceita: '2203'
  };
};

const simularCalculoCSLL = (baseCalculo: number, periodo: string, cnpj: string): ResultadoCalculo => {
  const aliquota = 0.09;
  const valorFinal = baseCalculo * aliquota;
  
  return {
    tipoImposto: 'CSLL',
    periodo,
    cnpj,
    valorBase: baseCalculo,
    baseCalculo: baseCalculo * 0.32, // 32% presunção para serviços
    aliquotaEfetiva: valorFinal / baseCalculo,
    aliquota,
    valorFinal,
    dataVencimento: calcularDataVencimento(periodo),
    calculadoEm: new Date().toISOString(),
    status: 'ativo',
    codigoReceita: '2372'
  };
};

const simularCalculoPIS = (baseCalculo: number, periodo: string, cnpj: string): ResultadoCalculo => {
  const aliquota = 0.0065;
  const valorFinal = baseCalculo * aliquota;
  
  return {
    tipoImposto: 'PIS',
    periodo,
    cnpj,
    valorBase: baseCalculo,
    baseCalculo,
    aliquotaEfetiva: valorFinal / baseCalculo,
    aliquota,
    valorFinal,
    dataVencimento: calcularDataVencimento(periodo),
    calculadoEm: new Date().toISOString(),
    status: 'ativo',
    codigoReceita: '8109'
  };
};

const simularCalculoCOFINS = (baseCalculo: number, periodo: string, cnpj: string): ResultadoCalculo => {
  const aliquota = 0.03;
  const valorFinal = baseCalculo * aliquota;
  
  return {
    tipoImposto: 'COFINS',
    periodo,
    cnpj,
    valorBase: baseCalculo,
    baseCalculo,
    aliquotaEfetiva: valorFinal / baseCalculo,
    aliquota,
    valorFinal,
    dataVencimento: calcularDataVencimento(periodo),
    calculadoEm: new Date().toISOString(),
    status: 'ativo',
    codigoReceita: '2172'
  };
};

const simularCalculoFGTS = (baseCalculo: number, periodo: string, cnpj: string): ResultadoCalculo => {
  const aliquota = 0.08;
  const valorFinal = baseCalculo * aliquota;
  
  return {
    tipoImposto: 'FGTS',
    periodo,
    cnpj,
    valorBase: baseCalculo,
    baseCalculo,
    aliquotaEfetiva: valorFinal / baseCalculo,
    aliquota,
    valorFinal,
    dataVencimento: calcularDataVencimento(periodo),
    calculadoEm: new Date().toISOString(),
    status: 'ativo',
    codigoReceita: '0115'
  };
};

const simularCalculoGenerico = (baseCalculo: number, periodo: string, cnpj: string, tipoImposto: TipoImposto): ResultadoCalculo => {
  const aliquota = 0.05; // Alíquota genérica
  const valorFinal = baseCalculo * aliquota;
  
  return {
    tipoImposto,
    periodo,
    cnpj,
    valorBase: baseCalculo,
    baseCalculo,
    aliquotaEfetiva: valorFinal / baseCalculo,
    aliquota,
    valorFinal,
    dataVencimento: calcularDataVencimento(periodo),
    calculadoEm: new Date().toISOString(),
    status: 'ativo',
    codigoReceita: '0000'
  };
};

const calcularDataVencimento = (periodo: string): string => {
  // Formato esperado do período: "YYYY-MM"
  const [ano, mes] = periodo.split('-').map(Number);
  
  // Data do último dia do mês seguinte
  const dataVencimento = new Date(ano, mes, 0);
  
  return dataVencimento.toISOString().split('T')[0];
};
