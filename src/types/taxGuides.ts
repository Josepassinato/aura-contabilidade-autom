
export type TaxGuideType = 'DARF' | 'GPS' | 'DAS' | 'ISS' | 'ICMS' | 'Outro';
export type TaxGuideStatus = 'pendente' | 'pago' | 'vencido';

export interface TaxGuide {
  id: string;
  clientId: string;
  clientName: string;
  type: TaxGuideType;
  reference: string;
  dueDate: string;
  amount: number;
  status: TaxGuideStatus;
  generatedAt: string;
  barCode?: string;
}
