
// Adicionar ao arquivo existente ou criar se não existir

export interface ScrapeResult {
  success: boolean;
  data?: Record<string, any>;
  error?: string;
  count?: number;
}

export interface SerproIntegraContadorConfig {
  certificadoDigital: string;
  senhaCertificado: string;
  procuracaoEletronica: boolean;
  procuracaoNumero?: string;
  procuracaoValidade?: string;
  procuracaoArquivo?: File | null;
}

export interface NfceScConfig {
  dtecUsuario: string;
  dtecSenha: string;
  tipoTTD: string;
  cscCodigo?: string;
  cscId?: string;
}

export interface SefazScrapedData {
  id: string;
  client_id: string;
  competencia: string;
  numero_guia: string;
  valor: string;
  data_vencimento: string;
  status: string;
  scraped_at: string;
  uf: string;
}

export interface SefazScrapedResult {
  success: boolean;
  data?: SefazScrapedData[];
  error?: string;
}
