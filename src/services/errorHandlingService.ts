
import { toast } from "@/hooks/use-toast";
import { PostgrestError } from "@supabase/supabase-js";

// Tipos de erros comuns
export type APIError = {
  message: string;
  status?: number;
  code?: string;
};

export type ErrorType = 
  | 'auth' 
  | 'database' 
  | 'network' 
  | 'validation' 
  | 'permission' 
  | 'notfound' 
  | 'timeout'
  | 'unknown';

// Função para categorizar erros
export const categorizeError = (error: any): { type: ErrorType; message: string } => {
  if (!error) {
    return { type: 'unknown', message: 'Erro desconhecido' };
  }
  
  // Erro do PostgrestError (Supabase)
  if ('code' in error && typeof error.code === 'string') {
    if (error.code.startsWith('22')) {
      return { type: 'validation', message: error.message || 'Erro de validação' };
    }
    
    if (error.code.startsWith('23')) {
      return { type: 'database', message: 'Erro de integridade dos dados' };
    }
    
    if (error.code.startsWith('28') || error.code.startsWith('42')) {
      return { type: 'permission', message: 'Permissão negada' };
    }
  }
  
  // Verificar por erros de rede
  if (error instanceof TypeError && error.message.includes('network')) {
    return { type: 'network', message: 'Erro de conexão com o servidor' };
  }
  
  // Verificar por erros de timeout
  if (error.message && typeof error.message === 'string' && 
      (error.message.includes('timeout') || error.message.includes('timed out'))) {
    return { type: 'timeout', message: 'Operação expirou. Tente novamente.' };
  }
  
  // Erro de autenticação
  if (error.message && typeof error.message === 'string' && 
      (error.message.includes('auth') || 
       error.message.includes('login') || 
       error.message.includes('password') ||
       error.message.includes('JWT') ||
       error.message.includes('token'))) {
    return { type: 'auth', message: 'Erro de autenticação' };
  }
  
  // Recurso não encontrado
  if (error.message && typeof error.message === 'string' && 
      error.message.includes('not found')) {
    return { type: 'notfound', message: 'Recurso não encontrado' };
  }
  
  return { 
    type: 'unknown', 
    message: error.message || 'Ocorreu um erro inesperado' 
  };
};

// Tratamento padronizado de erros
export const handleError = (
  error: Error | PostgrestError | null | unknown,
  options?: {
    context?: string;
    silent?: boolean;
    fallbackMessage?: string;
    showToast?: boolean;
    logToConsole?: boolean;
  }
) => {
  const { 
    context = '', 
    silent = false, 
    fallbackMessage = 'Ocorreu um erro inesperado', 
    showToast = true,
    logToConsole = true
  } = options || {};
  
  if (!error) return;
  
  const errorObj = error instanceof Error ? error : new Error(String(error));
  const { type, message } = categorizeError(error);
  
  // Construir mensagem para o usuário
  const userMessage = silent ? '' : 
    message || (error instanceof Error ? error.message : fallbackMessage);
  
  // Log para console
  if (logToConsole) {
    console.error(
      `[${type.toUpperCase()}]${context ? ` ${context}:` : ''}`, 
      error
    );
  }
  
  // Toast para feedback ao usuário
  if (showToast && !silent && userMessage) {
    toast({
      title: type === 'unknown' ? 'Erro' : `Erro: ${type}`,
      description: userMessage,
      variant: "destructive",
    });
  }
  
  return {
    error: errorObj,
    type,
    message: userMessage,
  };
};

// Componente de fallback para tratamento de erros em componentes
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  FallbackComponent: React.ComponentType<{ error: Error; resetError: () => void }>
) => {
  return class ErrorBoundary extends React.Component<P, { hasError: boolean; error: Error | null }> {
    constructor(props: P) {
      super(props);
      this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
      return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      handleError(error, { 
        context: `Erro no componente ${Component.displayName || 'Desconhecido'}`,
        fallbackMessage: 'Erro ao renderizar componente' 
      });
      console.error('ErrorInfo:', errorInfo);
    }

    resetError = () => {
      this.setState({ hasError: false, error: null });
    };

    render() {
      if (this.state.hasError && this.state.error) {
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
      }

      return <Component {...this.props} />;
    }
  };
};
