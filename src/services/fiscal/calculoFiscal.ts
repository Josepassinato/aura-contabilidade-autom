
/**
 * Serviço de cálculos fiscais
 * Implementa cálculos para vários tipos de obrigações fiscais
 */

// Importar services e utilitários
import { toast } from "@/hooks/use-toast";
import { publicarEvento } from "./mensageria/eventoProcessor";
import { gerarDocumentoArrecadacao } from "./darfService";
import { TipoImposto, ResultadoCalculo, ParametrosCalculo, RegimeTributario } from "./types";

// Re-export types so components can import them from this file
export { TipoImposto, ResultadoCalculo, ParametrosCalculo, RegimeTributario } from "./types";

/**
 * Função para calcular obrigações fiscais
 */
export const calcularObrigacaoFiscal = async (
  tipo: TipoImposto,
  dados: {
    cnpj: string;
    periodo: string;
    receita?: number;
    despesas?: number;
    folhaPagamento?: number;
    aliquota?: number;
    baseCalculo?: number;
    receitaBruta12Meses?: number;
    anexoSimples?: number;
    fator?: number;
    deducoes?: number;  // Added to match the expected type
    informacoesAdicionais?: Record<string, any>;
  }
): Promise<ResultadoCalculo> => {
  try {
    console.log(`Calculando ${tipo} para o período ${dados.periodo}`);
    
    let resultado: ResultadoCalculo = {
      tipoImposto: tipo,
      periodo: dados.periodo,
      cnpj: dados.cnpj,
      valorBase: dados.receita || 0,
      baseCalculo: dados.baseCalculo || 0,
      aliquotaEfetiva: dados.aliquota || 0,
      aliquota: dados.aliquota || 0,
      valorFinal: 0,
      dataVencimento: calcularVencimento(tipo, dados.periodo),
      calculadoEm: new Date().toISOString(),
      status: 'ativo',
    };
    
    switch (tipo) {
      case 'IRPJ':
        resultado.codigoReceita = '2089';
        resultado.baseCalculo = dados.receita ? dados.receita * 0.32 : (dados.baseCalculo || 0);
        resultado.aliquota = 0.15;
        resultado.valorFinal = resultado.baseCalculo * resultado.aliquota;
        break;
        
      case 'CSLL':
        resultado.codigoReceita = '2372';
        resultado.baseCalculo = dados.receita ? dados.receita * 0.32 : (dados.baseCalculo || 0);
        resultado.aliquota = 0.09;
        resultado.valorFinal = resultado.baseCalculo * resultado.aliquota;
        break;
        
      case 'COFINS':
        resultado.codigoReceita = '2172';
        resultado.baseCalculo = dados.receita || (dados.baseCalculo || 0);
        resultado.aliquota = 0.03;
        resultado.valorFinal = resultado.baseCalculo * resultado.aliquota;
        break;
        
      case 'PIS':
        resultado.codigoReceita = '8109';
        resultado.baseCalculo = dados.receita || (dados.baseCalculo || 0);
        resultado.aliquota = 0.0065;
        resultado.valorFinal = resultado.baseCalculo * resultado.aliquota;
        break;
        
      case 'ISS':
        resultado.codigoReceita = 'ISS';
        resultado.baseCalculo = dados.receita || (dados.baseCalculo || 0);
        resultado.aliquota = 0.05;
        resultado.valorFinal = resultado.baseCalculo * resultado.aliquota;
        break;
        
      case 'INSS':
        resultado.codigoReceita = '1007';
        resultado.baseCalculo = dados.folhaPagamento || (dados.baseCalculo || 0);
        resultado.aliquota = 0.20;
        resultado.valorFinal = resultado.baseCalculo * resultado.aliquota;
        break;
        
      case 'DAS':
        // Simples Nacional
        resultado.codigoReceita = 'DAS';
        resultado.baseCalculo = dados.receita || (dados.baseCalculo || 0);
        resultado.aliquota = calcularAliquotaSimples(dados.receitaBruta12Meses || 0, dados.anexoSimples || 3);
        resultado.valorFinal = resultado.baseCalculo * resultado.aliquota;
        
        // Aplicar fator R para serviços se disponível
        if (dados.fator && dados.fator > 0.28 && [3, 4, 5].includes(dados.anexoSimples || 0)) {
          resultado.aliquota *= 0.8; // Redução de 20% com base no fator R
          resultado.valorFinal = resultado.baseCalculo * resultado.aliquota;
          resultado.detalhes = { fatorR: dados.fator };
        }
        break;
        
      case 'ICMS':
        resultado.codigoReceita = 'ICMS';
        resultado.baseCalculo = dados.receita || (dados.baseCalculo || 0);
        resultado.aliquota = 0.18;
        resultado.valorFinal = resultado.baseCalculo * resultado.aliquota;
        break;
        
      default:
        throw new Error(`Tipo de imposto não suportado: ${tipo}`);
    }
    
    // Para compatibilidade com código existente
    resultado.valorImposto = resultado.valorFinal;
    
    // Arredondar valores
    resultado.valorFinal = Number(resultado.valorFinal.toFixed(2));
    resultado.baseCalculo = Number(resultado.baseCalculo.toFixed(2));
    
    // Emitir evento de cálculo
    publicarEvento('fiscal.calculated', {
      tipoImposto: tipo,
      cnpj: dados.cnpj,
      periodo: dados.periodo,
      valorCalculado: resultado.valorFinal,
      baseCalculo: resultado.baseCalculo,
      aliquota: resultado.aliquota
    });
    
    // Gerar documento de arrecadação
    if (['IRPJ', 'CSLL', 'PIS', 'COFINS', 'DAS', 'INSS'].includes(tipo)) {
      await gerarDocumentoArrecadacao(
        tipo === 'DAS' ? 'DAS' : tipo === 'INSS' ? 'GPS' : 'DARF',
        {
          cnpj: dados.cnpj,
          periodo: dados.periodo,
          codigoReceita: resultado.codigoReceita || '',
          valorPrincipal: resultado.valorFinal,
          valorTotal: resultado.valorFinal,
          dataVencimento: resultado.dataVencimento,
          referencia: `${tipo} ${dados.periodo}`
        }
      );
    }
    
    return resultado;
  } catch (error) {
    console.error(`Erro ao calcular ${tipo}:`, error);
    
    toast({
      title: `Erro no cálculo de ${tipo}`,
      description: error instanceof Error ? error.message : "Ocorreu um erro ao calcular este imposto",
      variant: "destructive"
    });
    
    throw error;
  }
};

// Adaptar para compatibilidade com componentes existentes
export const calcularImposto = async (tipo: TipoImposto, params: ParametrosCalculo): Promise<ResultadoCalculo> => {
  return calcularObrigacaoFiscal(tipo, {
    cnpj: params.cnpj,
    periodo: params.periodo,
    baseCalculo: params.valor,
    receita: params.valor,
    deducoes: params.deducoes,
    aliquota: params.aliquota
  });
};

// Implementar funções adicionais para calcular por dados contábeis e notas fiscais
export const calcularImpostoPorDadosContabeis = async (
  cnpj: string, 
  periodo: string, 
  tipoImposto: TipoImposto, 
  regimeTributario: RegimeTributario
): Promise<ResultadoCalculo> => {
  // Implementação simulada
  return calcularObrigacaoFiscal(tipoImposto, {
    cnpj,
    periodo,
    receita: 10000 + Math.random() * 5000,
    despesas: 4000 + Math.random() * 2000,
    receitaBruta12Meses: 120000 + Math.random() * 80000
  });
};

export const calcularImpostoPorNotasFiscais = async (
  cnpj: string, 
  periodo: string, 
  tipoImposto: TipoImposto, 
  regimeTributario: RegimeTributario
): Promise<ResultadoCalculo> => {
  // Implementação simulada
  const resultado = await calcularObrigacaoFiscal(tipoImposto, {
    cnpj,
    periodo,
    receita: 15000 + Math.random() * 5000,
    despesas: 6000 + Math.random() * 2000
  });
  
  resultado.dadosOrigem = {
    fonte: 'notasFiscais',
    totalRegistros: Math.floor(5 + Math.random() * 20)
  };
  
  return resultado;
};

// Implementações para cálculos baseados em lançamentos
export const calcularImpostosPorLancamentos = async (
  cnpj: string,
  periodo: string,
  tiposImposto: TipoImposto[] | RegimeTributario
): Promise<Record<TipoImposto, ResultadoCalculo>> => {
  const resultado: Partial<Record<TipoImposto, ResultadoCalculo>> = {};
  
  // Convert regimeTributario to array of TipoImposto if needed
  const impostos: TipoImposto[] = Array.isArray(tiposImposto) ? 
    tiposImposto : 
    ['IRPJ', 'CSLL', 'PIS', 'COFINS'];
  
  for (const tipo of impostos) {
    resultado[tipo] = await calcularObrigacaoFiscal(tipo, {
      cnpj,
      periodo,
      receita: 20000 + Math.random() * 8000,
      despesas: 7000 + Math.random() * 3000
    });
    
    if (resultado[tipo]) {
      resultado[tipo]!.dadosOrigem = {
        fonte: 'lancamentos',
        totalRegistros: Math.floor(10 + Math.random() * 30)
      };
    }
  }
  
  return resultado as Record<TipoImposto, ResultadoCalculo>;
};

export const calcularImpostosPorNotasFiscais = async (
  cnpj: string,
  periodo: string,
  tiposImposto: TipoImposto[] | RegimeTributario
): Promise<Record<TipoImposto, ResultadoCalculo>> => {
  const resultado: Partial<Record<TipoImposto, ResultadoCalculo>> = {};
  
  // Convert regimeTributario to array of TipoImposto if needed
  const impostos: TipoImposto[] = Array.isArray(tiposImposto) ? 
    tiposImposto : 
    ['IRPJ', 'CSLL', 'PIS', 'COFINS'];
  
  for (const tipo of impostos) {
    resultado[tipo] = await calcularImpostoPorNotasFiscais(cnpj, periodo, tipo, 'LucroPresumido');
  }
  
  return resultado as Record<TipoImposto, ResultadoCalculo>;
};

/**
 * Gera DARF para um resultado de cálculo
 */
export const gerarDARF = async (tipo: TipoImposto, resultado: ResultadoCalculo, cnpj: string): Promise<string> => {
  try {
    const doc = await gerarDocumentoArrecadacao(
      tipo === 'DAS' ? 'DAS' : tipo === 'INSS' ? 'GPS' : 'DARF',
      {
        cnpj,
        periodo: resultado.periodo,
        codigoReceita: resultado.codigoReceita || '',
        valorPrincipal: resultado.valorFinal,
        valorTotal: resultado.valorFinal,
        dataVencimento: resultado.dataVencimento,
        referencia: `${tipo} ${resultado.periodo}`
      }
    );
    
    return doc.codigoBarras || '';
  } catch (error) {
    console.error('Erro ao gerar DARF:', error);
    throw error;
  }
};

/**
 * Calcula a data de vencimento para um imposto
 */
const calcularVencimento = (tipo: TipoImposto, periodo: string): string => {
  // Extrai mês e ano do período
  const [ano, mes] = periodo.split('-').map(Number);
  
  // Data base para o vencimento (sempre no próximo mês)
  const dataVencimento = new Date(ano, mes, 0); // Último dia do mês
  
  switch (tipo) {
    case 'IRPJ':
    case 'CSLL':
      // Último dia útil do mês seguinte
      dataVencimento.setMonth(dataVencimento.getMonth() + 1);
      return dataVencimento.toISOString().split('T')[0];
    
    case 'PIS':
    case 'COFINS':
      // Dia 25 do mês seguinte
      dataVencimento.setMonth(dataVencimento.getMonth() + 1);
      dataVencimento.setDate(25);
      return dataVencimento.toISOString().split('T')[0];
      
    case 'INSS':
      // Dia 20 do mês seguinte
      dataVencimento.setMonth(dataVencimento.getMonth() + 1);
      dataVencimento.setDate(20);
      return dataVencimento.toISOString().split('T')[0];
      
    case 'ISS':
      // Dia 10 do mês seguinte
      dataVencimento.setMonth(dataVencimento.getMonth() + 1);
      dataVencimento.setDate(10);
      return dataVencimento.toISOString().split('T')[0];
      
    case 'ICMS':
      // Dia 15 do mês seguinte
      dataVencimento.setMonth(dataVencimento.getMonth() + 1);
      dataVencimento.setDate(15);
      return dataVencimento.toISOString().split('T')[0];
      
    case 'DAS':
      // Dia 20 do mês seguinte
      dataVencimento.setMonth(dataVencimento.getMonth() + 1);
      dataVencimento.setDate(20);
      return dataVencimento.toISOString().split('T')[0];
      
    default:
      // Padrão: último dia do mês seguinte
      dataVencimento.setMonth(dataVencimento.getMonth() + 1);
      return dataVencimento.toISOString().split('T')[0];
  }
};

/**
 * Calcula alíquota do Simples Nacional com base na receita bruta acumulada
 */
const calcularAliquotaSimples = (receitaBruta12Meses: number, anexo: number): number => {
  // Implementação muito simplificada das faixas do Simples Nacional
  if (receitaBruta12Meses <= 180000) {
    return anexo === 1 ? 0.04 : anexo === 2 ? 0.045 : anexo === 3 ? 0.06 : anexo === 4 ? 0.045 : 0.155;
  } else if (receitaBruta12Meses <= 360000) {
    return anexo === 1 ? 0.073 : anexo === 2 ? 0.078 : anexo === 3 ? 0.112 : anexo === 4 ? 0.09 : 0.18;
  } else if (receitaBruta12Meses <= 720000) {
    return anexo === 1 ? 0.095 : anexo === 2 ? 0.10 : anexo === 3 ? 0.135 : anexo === 4 ? 0.102 : 0.195;
  } else if (receitaBruta12Meses <= 1800000) {
    return anexo === 1 ? 0.107 : anexo === 2 ? 0.112 : anexo === 3 ? 0.16 : anexo === 4 ? 0.14 : 0.205;
  } else if (receitaBruta12Meses <= 3600000) {
    return anexo === 1 ? 0.143 : anexo === 2 ? 0.147 : anexo === 3 ? 0.21 : anexo === 4 ? 0.22 : 0.23;
  } else {
    return anexo === 1 ? 0.19 : anexo === 2 ? 0.30 : anexo === 3 ? 0.33 : anexo === 4 ? 0.33 : 0.305;
  }
};
