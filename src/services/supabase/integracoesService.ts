
/**
 * This file serves as a central export point for all integration services
 */

// Re-export all functions from the estadual service
export {
  fetchIntegracoesEstaduais,
  saveIntegracaoEstadual
} from './integracoesEstadualService';

// Re-export all functions from the Simples Nacional service
export {
  fetchIntegracaoSimplesNacional,
  saveIntegracaoSimplesNacional
} from './integracoesSimplesNacionalService';
