
/**
 * Tipos e interfaces para cálculos fiscais
 */

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
  dadosOrigem?: {
    fonte: 'manual' | 'notasFiscais' | 'contabilidade';
    documentos?: number;
    consolidado?: boolean;
  };
}

// Interface para relatório de cálculo
export interface RelatorioCálculo {
  parametros: ParametrosCalculo;
  resultado: ResultadoCalculo;
  dataCálculo: string;
  fontesDados: string[];
  validadeCalculoEmDias?: number;
  notasFiscaisProcessadas?: number;
  historicoAliquotas?: Array<{periodo: string, aliquota: number}>;
}
