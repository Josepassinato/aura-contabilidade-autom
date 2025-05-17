
// Tipos para o serviço de Pix

export interface PixPayment {
  id: string;
  client_id: string;
  end_to_end_id: string;
  transaction_id: string | null;
  amount: string;
  description: string;
  status: string;
  initiated_at: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  error_message: string | null;
}

export type PixStatus = 
  | 'initiated'   // Iniciado
  | 'processing'  // Processando
  | 'completed'   // Concluído
  | 'failed'      // Falhou
  | 'cancelled';  // Cancelado

// Interface para informações de chave Pix
export interface PixKeyInfo {
  type: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';
  key: string;
  owner?: string;
}

// Interface para configuração de Pix no banco
export interface PixConfig {
  enabled: boolean;
  merchant_name?: string;
  merchant_document?: string;
  available_key_types?: Array<'cpf' | 'cnpj' | 'email' | 'phone' | 'random'>;
}

// Interface de resposta de validação de chave Pix
export interface PixKeyValidationResponse {
  valid: boolean;
  owner_name?: string;
  owner_type?: 'person' | 'company';
  bank_name?: string;
  error?: string;
}
