
import { UF } from "../estadualIntegration";

/**
 * Common interface for scraper results
 */
export interface ScrapeResult {
  success: boolean;
  data?: any;
  error?: string;
  count?: number;
}

/**
 * Interface for the SEFAZ scraped data structure
 */
export interface SefazScrapedData {
  id: string;
  client_id: string;
  competencia: string;
  numero_guia: string;
  valor: string;
  data_vencimento: string;
  status: string;
  scraped_at: string;
  uf?: string;
}

/**
 * Interface for the result returned by getSefazScrapedData function
 */
export interface SefazScrapedResult {
  success: boolean;
  data?: SefazScrapedData[];
  error?: string;
  count?: number;
}

/**
 * Integração específica para o SEFAZ de Santa Catarina (SC)
 * Integra com o serviço Integra Contador do Serpro
 */
export interface SerproIntegraContadorConfig {
  certificadoDigital: string;
  senhaCertificado: string;
  procuracaoEletronica: boolean;
}

/**
 * Configuração para emissão de NFC-e em Santa Catarina
 */
export interface NfceScConfig {
  dtecUsuario: string;
  dtecSenha: string;
  tipoTTD: '706' | '707'; // Tipo de TTD (Tratamento Tributário Diferenciado)
  cscCodigo?: string;     // Código de Segurança do Contribuinte
  cscToken?: string;      // Token do CSC
}
