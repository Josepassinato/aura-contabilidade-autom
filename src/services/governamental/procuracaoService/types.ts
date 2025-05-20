
export interface ProcuracaoEletronica {
  id?: string;
  client_id: string;
  procurador_cpf: string;
  procurador_nome: string;
  data_emissao?: string;
  data_validade: string; // Changed from optional to required
  status: 'pendente' | 'emitida' | 'expirada' | 'cancelada' | 'erro';
  servicos_autorizados: string[];
  certificado_id?: string;
  comprovante_url?: string;
  log_processamento?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface ProcuracaoResponse {
  success: boolean;
  data?: ProcuracaoEletronica | ProcuracaoEletronica[];
  error?: string;
  message?: string;
}

export interface EmissaoProcuracaoParams {
  client_id: string;
  certificado_id: string;
  procurador_cpf: string;
  procurador_nome: string;
  servicos_autorizados: string[];
  validade_dias: number;
}

export interface ValidacaoProcuracaoResponse {
  status: 'valida' | 'invalida' | 'expirada' | 'nao_encontrada';
  data_validade?: string;
  dias_restantes?: number;
  servicos_autorizados?: string[];
  message?: string;
}

export interface LogProcuracao {
  timestamp: string;
  acao: string;
  resultado: string;
  detalhes?: Record<string, any>;
}
