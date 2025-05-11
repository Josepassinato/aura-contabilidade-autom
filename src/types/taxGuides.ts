
export type TaxGuideStatus = "pendente" | "pago" | "vencido";
export type TaxGuideType = "DARF" | "GPS" | "DAS" | "ISS" | "ICMS" | "Outro";

export interface TaxGuide {
  id: string;
  clientId: string;
  clientName: string;
  type: TaxGuideType;
  reference: string;
  dueDate: string;
  amount: number;
  status: TaxGuideStatus;
  barCode?: string;
  generatedAt: string;
}
