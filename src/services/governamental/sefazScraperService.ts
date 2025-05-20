
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

// Export all type definitions
export type {
  ScrapeResult,
  SefazScrapedData,
  SefazScrapedResult,
  SerproIntegraContadorConfig,
  NfceScConfig
} from './sefaz/types';
