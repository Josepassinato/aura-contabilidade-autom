
/**
 * Serviço para tratamento centralizado de erros na aplicação
 * Fornece funções para lidar com erros de diferentes fontes e apresentá-los de forma consistente
 */

import { toast } from "@/hooks/use-toast";
import { 
  StandardError, 
  ErrorSource, 
  SupabaseError, 
  AuthError, 
  NetworkError, 
  FormValidationError,
  ErrorHandlerOptions,
  ErrorDetails,
  ErrorContext
} from "@/types/errorHandling";

/**
 * Normaliza diferentes tipos de erros em um formato padrão
 */
export function normalizeError(error: unknown): StandardError {
  // Se já for um erro padronizado, retorna como está
  if (isStandardError(error)) {
    return {
      ...error,
      timestamp: error.timestamp || new Date().toISOString()
    };
  }

  // Supabase error
  if (isSupabaseError(error)) {
    return {
      message: error.message || error.error_description || 'Erro do Supabase',
      code: error.code,
      source: 'api' as ErrorSource,
      details: createErrorDetails(error),
      timestamp: new Date().toISOString()
    };
  }

  // Error object
  if (error instanceof Error) {
    return {
      message: error.message,
      source: 'unknown' as ErrorSource,
      details: createErrorDetails({ stack: error.stack }),
      timestamp: new Date().toISOString()
    };
  }

  // Network error
  if (isNetworkError(error)) {
    return {
      message: `Erro de rede: ${error.statusText || error.message}`,
      code: error.status?.toString(),
      source: 'api' as ErrorSource,
      details: createErrorDetails({
        status: error.status,
        statusText: error.statusText,
        url: error.url
      }),
      timestamp: new Date().toISOString()
    };
  }

  // String error
  if (typeof error === 'string') {
    return {
      message: error,
      source: 'unknown' as ErrorSource,
      timestamp: new Date().toISOString()
    };
  }

  // Object with message
  if (isErrorLike(error)) {
    return {
      message: error.message,
      source: 'unknown' as ErrorSource,
      details: createErrorDetails(error),
      timestamp: new Date().toISOString()
    };
  }

  // Fallback for unknown error formats
  return {
    message: 'Ocorreu um erro desconhecido',
    source: 'unknown' as ErrorSource,
    details: createErrorDetails(error),
    timestamp: new Date().toISOString()
  };
}

// Type guards para verificação de tipos
function isStandardError(error: unknown): error is StandardError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'source' in error &&
    'message' in error &&
    typeof (error as any).message === 'string'
  );
}

function isSupabaseError(error: unknown): error is SupabaseError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    ('message' in error || 'error_description' in error)
  );
}

function isNetworkError(error: unknown): error is NetworkError {
  return (
    error instanceof Error &&
    ('status' in error || 'statusText' in error || 'response' in error)
  );
}

function isErrorLike(error: unknown): error is { message: string; [key: string]: unknown } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as any).message === 'string'
  );
}

function createErrorDetails(data: unknown): ErrorDetails {
  if (typeof data === 'object' && data !== null) {
    return data as ErrorDetails;
  }
  return { originalError: data };
}

/**
 * Registra erro no console e opcionalmente em serviços de monitoramento
 */
export function logError(error: unknown, context?: string): void {
  const standardError = normalizeError(error);
  console.error(
    `[${standardError.timestamp}] ${context ? `[${context}] ` : ''}Error: ${standardError.message}`,
    standardError.details || ''
  );
  
  // Aqui você pode adicionar integrações com serviços como Sentry, LogRocket, etc.
}

/**
 * Apresenta erro para o usuário através de um toast
 */
export function notifyError(error: unknown): void {
  const standardError = normalizeError(error);
  
  toast({
    title: "Erro",
    description: standardError.message,
    variant: "destructive",
  });
}

/**
 * Trata erros de forma abrangente - loga e notifica
 * Sobrecarga para manter compatibilidade com código existente
 */
export function handleError(error: unknown, context?: string, shouldNotify?: boolean): void;
export function handleError(error: unknown, options?: ErrorHandlerOptions): void;
export function handleError(
  error: unknown, 
  contextOrOptions?: string | ErrorHandlerOptions, 
  shouldNotify = true
): void {
  let context: string | undefined;
  let shouldLog = true;
  let notify = shouldNotify;

  // Verificar se o segundo parâmetro é string (compatibilidade) ou objeto (nova API)
  if (typeof contextOrOptions === 'string') {
    context = contextOrOptions;
  } else if (typeof contextOrOptions === 'object' && contextOrOptions !== null) {
    const options = contextOrOptions as ErrorHandlerOptions;
    context = options.context;
    shouldLog = options.shouldLog ?? true;
    notify = options.shouldNotify ?? true;
  }

  if (shouldLog) {
    logError(error, context);
  }
  
  if (notify) {
    notifyError(error);
  }
}

/**
 * Trata erros específicos de autenticação
 */
export function handleAuthError(error: unknown): void {
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
  } else if (isErrorLike(error) && error.message.includes('User already registered')) {
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
export function handleValidationError(errors: FormValidationError): void {
  const errorMessages = Object.values(errors)
    .flat()
    .join('\n');
  
  toast({
    title: "Erro de Validação",
    description: errorMessages,
    variant: "destructive",
  });
}
