
// Main entry point for SEFAZ services - re-exports functionality from modules

// Export common functionality
export { 
  triggerSefazScrape,
  getSefazScrapedData
} from './sefaz/common';

// Export Santa Catarina specific functionality
export {
  configurarIntegraContadorSC,
  configurarNfceSC
} from './sefaz/santaCatarina';

// Export procuração integration with SEFAZ
export {
  verificarProcuracaoParaSefaz,
  consultarSefazComProcuracao,
  emitirGuiaSefazComProcuracao
} from './sefaz/procuracaoIntegracao';

// Export autonomous services
export {
  consultarSefazAutomatico,
  emitirGuiaSefazAutomatico,
  verificarDisponibilidadeProcuracaoSefaz,
  buscarProcuracaoValidaAutomatica
} from './sefazAutomaticService';

// Export real API integration services
export {
  consultarSefazPorEstado,
  emitirGuiaPorEstado,
  consultarSefazSC,
  consultarSefazGenerico
} from './sefaz/estadualApiService';

// Export API integration utilities
export {
  autenticarSefazApi,
  consultarDebitosSefazReal,
  emitirGuiaSefazReal
} from './sefaz/apiIntegration';

// Export all type definitions
export type {
  ScrapeResult,
  SefazScrapedData,
  SefazScrapedResult,
  SerproIntegraContadorConfig,
  NfceScConfig
} from './sefaz/types';
