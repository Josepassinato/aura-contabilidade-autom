
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
      case 'Simples':
        resultado = calcularSimples(params);
        break;
      // Implementar outros tipos de impostos conforme necessário
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
