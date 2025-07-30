
/**
 * Serviço para tratamento centralizado de erros na aplicação
 * Fornece funções para lidar com erros de diferentes fontes e apresentá-los de forma consistente
 */

import { toast } from "@/hooks/use-toast";
import { logAuditEvent, logSecurityEvent } from "./auditService";
import { logger } from "@/utils/logger";

// Tipos de erros que podemos tratar
type ErrorSource = 'api' | 'database' | 'auth' | 'form' | 'unknown';

// Interface para erro padronizado
interface StandardError {
  message: string;
  code?: string;
  source: ErrorSource;
  details?: any;
  timestamp: string;
}

/**
 * Normaliza diferentes tipos de erros em um formato padrão
 */
export function normalizeError(error: any): StandardError {
  // Se já for um erro padronizado, retorna como está
  if (error && error.source && error.message) {
    return {
      ...error,
      timestamp: error.timestamp || new Date().toISOString()
    };
  }

  // Supabase error
  if (error && error.code && (error.message || error.error_description)) {
    return {
      message: error.message || error.error_description,
      code: error.code,
      source: 'api',
      details: error,
      timestamp: new Date().toISOString()
    };
  }

  // Error object
  if (error instanceof Error) {
    return {
      message: error.message,
      source: 'unknown',
      details: { stack: error.stack },
      timestamp: new Date().toISOString()
    };
  }

  // String error
  if (typeof error === 'string') {
    return {
      message: error,
      source: 'unknown',
      timestamp: new Date().toISOString()
    };
  }

  // Object with message
  if (error && error.message) {
    return {
      message: error.message,
      source: 'unknown',
      details: error,
      timestamp: new Date().toISOString()
    };
  }

  // Fallback for unknown error formats
  return {
    message: 'Ocorreu um erro desconhecido',
    source: 'unknown',
    details: error,
    timestamp: new Date().toISOString()
  };
}

/**
 * Registra erro no console e opcionalmente em serviços de monitoramento
 */
export async function logError(error: any, context?: string): Promise<void> {
  const standardError = normalizeError(error);
  
  // Log usando o sistema unificado
  logger.error(
    `${context ? `[${context}] ` : ''}${standardError.message}`,
    standardError.details,
    context || 'ErrorHandler'
  );
  
  // Log crítico na auditoria para erros graves
  if (standardError.source === 'database' || standardError.source === 'api') {
    await logAuditEvent({
      eventType: 'application_error',
      message: standardError.message,
      metadata: {
        context,
        source: standardError.source,
        code: standardError.code,
        details: standardError.details
      },
      severity: 'error'
    });
  }
}

/**
 * Apresenta erro para o usuário através de um toast
 */
export function notifyError(error: any): void {
  const standardError = normalizeError(error);
  
  toast({
    title: "Erro",
    description: standardError.message,
    variant: "destructive",
  });
}

/**
 * Trata erros de forma abrangente - loga e notifica
 */
export async function handleError(error: any, context?: string, shouldNotify = true): Promise<void> {
  await logError(error, context);
  
  if (shouldNotify) {
    notifyError(error);
  }
}

/**
 * Trata erros específicos de autenticação
 */
export function handleAuthError(error: any): void {
  const standardError = normalizeError(error);
  
  console.error('[AUTH ERROR]', standardError);
  
  // Mensagens específicas para erros de autenticação
  let userMessage = standardError.message;
  
  if (standardError.code === 'invalid_credentials') {
    userMessage = 'Email ou senha incorretos. Verifique suas credenciais.';
  } else if (standardError.code === 'email_not_confirmed') {
    userMessage = 'Por favor, confirme seu email antes de fazer login.';
  } else if (standardError.code === 'signup_disabled') {
    userMessage = 'Cadastro temporariamente desabilitado.';
  } else if (standardError.code === 'weak_password') {
    userMessage = 'A senha deve ter pelo menos 6 caracteres.';
  } else if (error?.message?.includes('User already registered')) {
    userMessage = 'Este email já está cadastrado. Tente fazer login.';
  }
  
  toast({
    title: "Erro de Autenticação",
    description: userMessage,
    variant: "destructive",
  });
}

/**
 * Trata erros de validação de formulário
 */
export function handleValidationError(errors: Record<string, string>): void {
  const errorMessages = Object.values(errors).join('\n');
  
  toast({
    title: "Erro de Validação",
    description: errorMessages,
    variant: "destructive",
  });
}
