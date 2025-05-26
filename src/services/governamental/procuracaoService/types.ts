
export interface ProcuracaoEletronica {
  id?: string;
  client_id: string;
  certificado_id?: string;
  procurador_cpf: string;
  procurador_nome: string;
  servicos_autorizados: string[];
  data_validade: string;
  data_emissao?: string;
  status: 'pendente' | 'emitida' | 'expirada' | 'cancelada' | 'erro';
  log_processamento?: string[];
  comprovante_url?: string;
  procuracao_numero?: string;
  created_at?: string;
  updated_at?: string;
}

export interface EmitirProcuracaoParams {
  client_id: string;
  certificado_id: string;
  procurador_cpf: string;
  procurador_nome: string;
  servicos_autorizados: string[];
  validade_dias: number;
}

export interface CadastrarProcuracaoExistenteParams {
  client_id: string;
  procurador_cpf: string;
  procurador_nome: string;
  procuracao_numero: string;
  data_emissao: string;
  data_validade: string;
  servicos_autorizados: string[];
  certificado_id?: string;
  status: ProcuracaoEletronica['status'];
}

export interface LogProcuracao {
  timestamp: string;
  acao: string;
  resultado: string;
  detalhes?: any;
}

export interface ValidationResult {
  status: 'valida' | 'invalida' | 'expirada' | 'erro';
  message: string;
}
