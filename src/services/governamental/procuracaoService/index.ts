
export {
  emitirProcuracao,
  fetchProcuracoes,
  validarProcuracao,
  cancelarProcuracao,
  cadastrarProcuracaoExistente,
  atualizarStatusProcuracao
} from './procuracaoService';

export { processarEmissaoProcuracao } from './ecacProcuracaoEmissao';
export { adicionarLogProcuracao } from './procuracaoLogger';

export type {
  ProcuracaoEletronica,
  EmitirProcuracaoParams,
  CadastrarProcuracaoExistenteParams,
  LogProcuracao,
  ValidationResult
} from './types';
