
/**
 * Tipos para cálculos fiscais
 */

export type TipoImposto = "IRPJ" | "CSLL" | "PIS" | "COFINS" | "ICMS" | "ISS" | "DAS" | "INSS" | "FGTS";

export interface ParametrosCalculo {
  valor: number;
  periodo: string;
  cnpj: string;
  regimeTributario: "Simples" | "LucroPresumido" | "LucroReal";
  aliquota?: number;
  deducoes?: number;
}

export interface ResultadoCalculo {
  valorBase: number;
  valorImposto: number;
  aliquotaEfetiva: number;
  deducoes: number;
  valorFinal: number;
  dataVencimento: string;
  codigoReceita?: string;
  dadosOrigem?: any;  // Adicionar propriedade que estava faltando
}

export interface ImpostoConfig {
  nome: string;
  descricao: string;
  aliquotaSimples?: number;
  aliquotaLucroPresumido?: number;
  aliquotaLucroReal?: number;
  vencimentoDia?: number;
}
