
// Types related to Natural Language Processing

export type NLPIntent = 'fiscal_query' | 'financial_report' | 'anomaly_detection' | 'tax_calculation' | 'payment' | 'unknown';

export interface NLPResult {
  intent: NLPIntent;
  confidence: number;
  entities: Record<string, any>;
  originalText: string;
}

export interface NLPProcessorOptions {
  apiKey?: string;
}
