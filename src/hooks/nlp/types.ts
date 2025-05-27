
export type NLPIntent = 
  | 'fiscal_query' 
  | 'financial_report' 
  | 'anomaly_detection'
  | 'tax_calculation'
  | 'payment'
  | 'document_request'
  | 'cash_flow_prediction'
  | 'greeting'
  | 'help'
  | 'unknown';

export interface NLPResult {
  intent: NLPIntent;
  confidence: number;
  entities: Record<string, any>;
  originalText: string;
}

export interface ClientSpecificContext {
  clientId: string;
  clientName: string;
  clientCNPJ?: string;
  clientData?: any;
}
