
/**
 * Processador de lançamentos contábeis para cálculos fiscais
 */

import { ResultadoCalculo, TipoImposto } from "../types";

// Interface para lançamentos
export interface Lancamento {
  id: string;
  data: string;
  valor: number;
  tipo: 'debito' | 'credito';
  contaDebito: string;
  contaCredito: string;
  descricao: string;
  centroCusto?: string;
  documentoRef?: string;
}

// Interface para resultado do processamento
export interface ResultadoProcessamentoLancamentos {
  lancamentosProcessados: number;
  receitaTotal: number;
  despesaTotal: number;
  lancamentosPorCategoria: Record<string, Lancamento[]>;
  resultadosCalculos: Record<string, ResultadoCalculo>;
}

/**
 * Processa lançamentos contábeis para cálculo fiscal
 */
export const processarLancamentosParaCalculo = async (
  lancamentos: Lancamento[],
  periodo: string,
  cnpj: string,
  tiposCalculo: TipoImposto[]
): Promise<ResultadoProcessamentoLancamentos> => {
  console.log(`Processando ${lancamentos.length} lançamentos para ${periodo}`);
  
  // Agrupar lançamentos por categoria contábil
  const lancamentosPorCategoria: Record<string, Lancamento[]> = {};
  let receitaTotal = 0;
  let despesaTotal = 0;
  
  // Categorizar lançamentos
  lancamentos.forEach(lancamento => {
    // Simplificação: identificar categoria pelo início da conta contábil
    let categoria = 'outros';
    
    if (lancamento.contaCredito.startsWith('3') || lancamento.contaCredito.startsWith('4')) {
      categoria = 'receitas';
      receitaTotal += lancamento.valor;
    } else if (lancamento.contaDebito.startsWith('5') || lancamento.contaDebito.startsWith('6')) {
      categoria = 'despesas';
      despesaTotal += lancamento.valor;
    } else if (lancamento.contaDebito.startsWith('1') && lancamento.contaCredito.startsWith('2')) {
      categoria = 'patrimonial';
    } else if (lancamento.descricao.toLowerCase().includes('folha') || 
               lancamento.descricao.toLowerCase().includes('salário')) {
      categoria = 'folha';
      despesaTotal += lancamento.valor;
    }
    
    // Adicionar à categoria apropriada
    if (!lancamentosPorCategoria[categoria]) {
      lancamentosPorCategoria[categoria] = [];
    }
    lancamentosPorCategoria[categoria].push(lancamento);
  });
  
  console.log('Receita total identificada:', receitaTotal);
  console.log('Despesa total identificada:', despesaTotal);
  
  // Resultados dos cálculos por tipo de imposto
  const resultadosCalculos: Record<string, ResultadoCalculo> = {};
  
  // Calcular cada imposto solicitado
  for (const tipoImposto of tiposCalculo) {
    // Simulação simplificada de cálculo baseado em lançamentos
    let resultado: ResultadoCalculo;
    const baseCalculo = tipoImposto === 'FGTS' ? 
      (lancamentosPorCategoria['folha'] ? 
        lancamentosPorCategoria['folha'].reduce((sum, l) => sum + l.valor, 0) : 0
      ) : receitaTotal;
    
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
      fonte: 'lancamentos',
      totalRegistros: lancamentos.length,
      documentos: []
    };
    
    resultadosCalculos[tipoImposto] = resultado;
  }
  
  return {
    lancamentosProcessados: lancamentos.length,
    receitaTotal,
    despesaTotal,
    lancamentosPorCategoria,
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
