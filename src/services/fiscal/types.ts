
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
  | 'Simples'
  | 'FGTS'; // Added FGTS as a valid type

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
    fonte: 'notasFiscais' | 'contabilidade' | 'lancamentos' | 'microservice-simulator';
    totalRegistros?: number;
    documentos?: any[];
  };
  valorImposto?: number; // Added for legacy support
}

export interface ParametrosCalculo {
  valor: number;
  periodo: string;
  cnpj: string;
  regimeTributario: RegimeTributario;
  deducoes?: number;
  aliquota?: number; // Added for certain calculators that need it
}

// Define the event types needed for the MonitorEventos component
export type TipoEvento = 
  | 'fiscal.calculated'
  | 'fiscal.generated'
  | 'guia.generated'
  | 'pagamento.scheduled'
  | 'pagamento.executed'
  | 'bank.transaction'    // Added to support banking events
  | 'entry.created'       // Added to support accounting entries
  | 'entry.classified'    // Added for classification events
  | 'entry.reconciled';   // Added for reconciliation events

export interface EventoFiscal {
  id: string;
  tipo: TipoEvento;
  timestamp: string;
  origem: string;
  dados: Record<string, any>;
}

export type EventoSubscriber = (evento: EventoFiscal) => void | Promise<void>;
