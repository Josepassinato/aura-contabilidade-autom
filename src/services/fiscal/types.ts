
/**
 * Definição de tipos para o sistema fiscal
 */

export type TipoImposto = 
  | 'IRPJ'
  | 'CSLL'
  | 'PIS'
  | 'COFINS'
  | 'ISS'
  | 'INSS'
  | 'ICMS'
  | 'DAS'
  | 'Simples';

export type RegimeTributario = 'Simples' | 'LucroPresumido' | 'LucroReal';

export type StatusCalculo = 'ativo' | 'cancelado' | 'revisao' | 'consolidado';

export interface ResultadoCalculo {
  tipoImposto: TipoImposto;
  periodo: string;
  cnpj: string;
  valorBase: number;
  baseCalculo: number;
  aliquotaEfetiva: number;
  aliquota: number;
  valorFinal: number;
  dataVencimento: string;
  calculadoEm: string;
  status: StatusCalculo;
  codigoReceita?: string;
  deducoes?: number;
  detalhes?: Record<string, any>;
  dadosOrigem?: {
    fonte: 'notasFiscais' | 'contabilidade' | 'lancamentos';
    totalRegistros?: number;
  };
}

export interface ParametrosCalculo {
  valor: number;
  periodo: string;
  cnpj: string;
  regimeTributario: RegimeTributario;
  deducoes?: number;
}
