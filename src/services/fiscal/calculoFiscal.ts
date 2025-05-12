
/**
 * Serviço para cálculos fiscais
 * Implementa lógica para cálculo de diversos impostos e obrigações fiscais
 */

import { toast } from "@/hooks/use-toast";

// Tipos de impostos suportados
export type TipoImposto = 'IRPJ' | 'CSLL' | 'PIS' | 'COFINS' | 'ICMS' | 'ISS' | 'INSS' | 'FGTS' | 'Simples';

// Interface para parâmetros de cálculo
export interface ParametrosCalculo {
  valor: number;
  aliquota?: number;
  deducoes?: number;
  periodo: string; // formato YYYY-MM
  cnpj: string;
  regimeTributario: 'Simples' | 'LucroPresumido' | 'LucroReal';
  [key: string]: any; // Parâmetros adicionais específicos
}

// Resultado do cálculo
export interface ResultadoCalculo {
  valorBase: number;
  valorImposto: number;
  aliquotaEfetiva: number;
  deducoes: number;
  valorFinal: number;
  dataVencimento: string;
  codigoReceita?: string;
}

// Funções auxiliares para cálculos fiscais
const calcularIRPJ = (params: ParametrosCalculo): ResultadoCalculo => {
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

const calcularCSLL = (params: ParametrosCalculo): ResultadoCalculo => {
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

const calcularPIS = (params: ParametrosCalculo): ResultadoCalculo => {
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

const calcularCOFINS = (params: ParametrosCalculo): ResultadoCalculo => {
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

const calcularICMS = (params: ParametrosCalculo): ResultadoCalculo => {
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

const calcularISS = (params: ParametrosCalculo): ResultadoCalculo => {
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

const calcularINSS = (params: ParametrosCalculo): ResultadoCalculo => {
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

const calcularFGTS = (params: ParametrosCalculo): ResultadoCalculo => {
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

const calcularSimples = (params: ParametrosCalculo): ResultadoCalculo => {
  // Implementação simplificada do cálculo do Simples Nacional
  const { valor, cnpj } = params;
  
  // Em uma implementação real, buscaríamos a faixa e anexo do Simples
  // com base no CNPJ e faturamento acumulado
  const aliquota = 0.06; // Exemplo: 6% (varia conforme anexo e faixa)
  const deducao = 0;     // Valor de dedução conforme faixa
  
  const valorImposto = valor * aliquota - deducao;

  // Data de vencimento (dia 20 do mês seguinte)
  const dataPeriodo = new Date(params.periodo + '-01');
  const dataVencimento = new Date(dataPeriodo.getFullYear(), dataPeriodo.getMonth() + 1, 20);
  
  return {
    valorBase: valor,
    valorImposto,
    aliquotaEfetiva: valorImposto / valor,
    deducoes: deducao,
    valorFinal: valorImposto,
    dataVencimento: dataVencimento.toISOString().split('T')[0],
    codigoReceita: 'DAS'
  };
};

// Função principal para cálculo de impostos
export const calcularImposto = async (
  tipo: TipoImposto, 
  params: ParametrosCalculo
): Promise<ResultadoCalculo> => {
  try {
    let resultado: ResultadoCalculo;
    
    switch (tipo) {
      case 'IRPJ':
        resultado = calcularIRPJ(params);
        break;
      case 'CSLL':
        resultado = calcularCSLL(params);
        break;
      case 'PIS':
        resultado = calcularPIS(params);
        break;
      case 'COFINS':
        resultado = calcularCOFINS(params);
        break;
      case 'ICMS':
        resultado = calcularICMS(params);
        break;
      case 'ISS':
        resultado = calcularISS(params);
        break;
      case 'INSS':
        resultado = calcularINSS(params);
        break;
      case 'FGTS':
        resultado = calcularFGTS(params);
        break;
      case 'Simples':
        resultado = calcularSimples(params);
        break;
      default:
        throw new Error(`Cálculo para ${tipo} ainda não implementado`);
    }
    
    console.log(`Cálculo de ${tipo} realizado com sucesso:`, resultado);
    return resultado;
    
  } catch (error) {
    console.error(`Erro ao calcular ${tipo}:`, error);
    toast({
      title: `Erro ao calcular ${tipo}`,
      description: error instanceof Error ? error.message : "Ocorreu um erro no cálculo",
      variant: "destructive",
    });
    throw error;
  }
};

// Função para gerar DARF a partir do resultado do cálculo
export const gerarDARF = async (
  tipoImposto: TipoImposto,
  resultado: ResultadoCalculo,
  cnpj: string
): Promise<string> => {
  try {
    // Em uma implementação real, aqui teríamos a lógica para:
    // 1. Formatar os dados para geração do DARF
    // 2. Enviar para API da Receita Federal ou gerar localmente
    // 3. Obter código de barras e demais informações
    
    // Simulação de geração de código de barras
    const randomCode = Math.floor(10000000000 + Math.random() * 90000000000);
    const barCode = `85810000${randomCode}-5 ${resultado.codigoReceita}0065${randomCode % 1000}-1 ${resultado.dataVencimento.replace(/-/g, "")}2-6 ${cnpj.substring(0,8)}55-9`;
    
    console.log(`DARF para ${tipoImposto} gerado com código: ${barCode}`);
    
    return barCode;
  } catch (error) {
    console.error(`Erro ao gerar DARF para ${tipoImposto}:`, error);
    toast({
      title: "Erro ao gerar DARF",
      description: error instanceof Error ? error.message : "Ocorreu um erro na geração do DARF",
      variant: "destructive",
    });
    throw error;
  }
};

// Função para integrar com dados de notas fiscais
export const calcularImpostosPorNotasFiscais = async (
  cnpj: string,
  periodo: string,
  regimeTributario: 'Simples' | 'LucroPresumido' | 'LucroReal'
): Promise<Record<TipoImposto, ResultadoCalculo>> => {
  try {
    // Em uma implementação real, aqui buscaríamos as notas fiscais do período
    // e calcularíamos os impostos baseados nos dados reais
    
    // Simulando notas fiscais para demonstração
    const faturamentoTotal = Math.random() * 500000 + 100000;
    const despesasTotal = faturamentoTotal * (Math.random() * 0.6 + 0.2); // 20% a 80% do faturamento
    
    // Parâmetros base para os cálculos
    const parametrosBase: ParametrosCalculo = {
      valor: faturamentoTotal,
      periodo,
      cnpj,
      regimeTributario,
      despesas: despesasTotal
    };
    
    // Calculando todos os impostos aplicáveis conforme regime tributário
    const resultados: Partial<Record<TipoImposto, ResultadoCalculo>> = {};
    
    if (regimeTributario === 'Simples') {
      resultados['Simples'] = await calcularImposto('Simples', parametrosBase);
    } else {
      // Para Lucro Presumido ou Real
      const impostos: TipoImposto[] = ['IRPJ', 'CSLL', 'PIS', 'COFINS'];
      
      for (const imposto of impostos) {
        resultados[imposto] = await calcularImposto(imposto, parametrosBase);
      }
      
      // Adiciona impostos específicos se houver operações com mercadorias ou serviços
      if (Math.random() > 0.5) { // Simulando que tem operações com mercadorias
        resultados['ICMS'] = await calcularImposto('ICMS', { 
          ...parametrosBase, 
          valor: faturamentoTotal * 0.7 // Supondo que 70% do faturamento é com mercadorias
        });
      }
      
      if (Math.random() > 0.3) { // Simulando que tem operações com serviços
        resultados['ISS'] = await calcularImposto('ISS', { 
          ...parametrosBase, 
          valor: faturamentoTotal * 0.3 // Supondo que 30% do faturamento é com serviços
        });
      }
    }
    
    return resultados as Record<TipoImposto, ResultadoCalculo>;
    
  } catch (error) {
    console.error(`Erro ao calcular impostos por notas fiscais:`, error);
    toast({
      title: "Erro no cálculo por notas fiscais",
      description: error instanceof Error ? error.message : "Ocorreu um erro no processamento das notas fiscais",
      variant: "destructive",
    });
    throw error;
  }
};

// Função para integrar com lançamentos contábeis
export const calcularImpostosPorLancamentos = async (
  cnpj: string,
  periodo: string,
  regimeTributario: 'Simples' | 'LucroPresumido' | 'LucroReal'
): Promise<Record<TipoImposto, ResultadoCalculo>> => {
  try {
    // Em uma implementação real, aqui buscaríamos os lançamentos contábeis do período
    // e calcularíamos os impostos baseados nos dados reais
    
    // Simulando lançamentos para demonstração
    const receitasBrutas = Math.random() * 500000 + 100000;
    const custos = receitasBrutas * (Math.random() * 0.4 + 0.1); // 10% a 50% da receita
    const despesasOperacionais = receitasBrutas * (Math.random() * 0.3 + 0.1); // 10% a 40% da receita
    const baseCalculo = regimeTributario === 'LucroReal' ? 
                       receitasBrutas - custos - despesasOperacionais : 
                       receitasBrutas;
    
    // Parâmetros base para os cálculos
    const parametrosBase: ParametrosCalculo = {
      valor: baseCalculo,
      periodo,
      cnpj,
      regimeTributario,
      receitasBrutas,
      custos,
      despesasOperacionais
    };
    
    // Calculando todos os impostos aplicáveis conforme regime tributário
    const resultados: Partial<Record<TipoImposto, ResultadoCalculo>> = {};
    
    if (regimeTributario === 'Simples') {
      resultados['Simples'] = await calcularImposto('Simples', { ...parametrosBase, valor: receitasBrutas });
    } else {
      // Para Lucro Presumido ou Real
      const impostos: TipoImposto[] = ['IRPJ', 'CSLL', 'PIS', 'COFINS'];
      
      for (const imposto of impostos) {
        resultados[imposto] = await calcularImposto(imposto, parametrosBase);
      }
    }
    
    // Se tiver folha de pagamento, calcula INSS e FGTS
    if (Math.random() > 0.3) { // Simulando que tem folha de pagamento
      const valorFolha = receitasBrutas * (Math.random() * 0.2 + 0.05); // 5% a 25% da receita
      
      resultados['INSS'] = await calcularImposto('INSS', { 
        ...parametrosBase, 
        valor: valorFolha
      });
      
      resultados['FGTS'] = await calcularImposto('FGTS', { 
        ...parametrosBase, 
        valor: valorFolha
      });
    }
    
    return resultados as Record<TipoImposto, ResultadoCalculo>;
    
  } catch (error) {
    console.error(`Erro ao calcular impostos por lançamentos:`, error);
    toast({
      title: "Erro no cálculo por lançamentos",
      description: error instanceof Error ? error.message : "Ocorreu um erro no processamento dos lançamentos",
      variant: "destructive",
    });
    throw error;
  }
};
