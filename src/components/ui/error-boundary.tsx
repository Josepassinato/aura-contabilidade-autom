import React from 'react';
import { AlertCircle, X, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: any;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; onReset: () => void }>;
  onError?: (error: Error) => void;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary capturou um erro:', error, errorInfo);
    this.setState({ errorInfo });
    this.props.onError?.(error);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} onReset={this.handleReset} />;
      }

      return <DefaultErrorFallback error={this.state.error!} onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}

// Componente de fallback padrão
const DefaultErrorFallback = ({ error, onReset }: { error: Error; onReset: () => void }) => (
  <div className="min-h-[400px] flex items-center justify-center p-4">
    <div className="max-w-md w-full space-y-4">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Ops! Algo deu errado</AlertTitle>
        <AlertDescription className="mt-2">
          {error.message || "Ocorreu um erro inesperado"}
        </AlertDescription>
      </Alert>
      
      <div className="flex gap-2">
        <Button onClick={onReset} variant="outline" className="flex-1">
          <RefreshCw className="mr-2 h-4 w-4" />
          Tentar novamente
        </Button>
        <Button onClick={() => window.location.reload()} variant="secondary">
          Recarregar página
        </Button>
      </div>

      {process.env.NODE_ENV === 'development' && (
        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-muted-foreground">
            Detalhes técnicos
          </summary>
          <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
            {error.stack}
          </pre>
        </details>
      )}
    </div>
  </div>
);

// Hook para capturar erros assíncronos
export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return (error: Error) => {
    setError(error);
  };
};

// Componente para exibir erros específicos de contexto
export const ContextualError = ({
  error,
  context,
  onRetry,
  onDismiss
}: {
  error: string | Error;
  context: 'upload' | 'ai' | 'integration' | 'auth' | 'network';
  onRetry?: () => void;
  onDismiss?: () => void;
}) => {
  const getContextMessage = (context: string) => {
    switch (context) {
      case 'upload':
        return 'Erro no upload do arquivo';
      case 'ai':
        return 'Erro na integração com IA';
      case 'integration':
        return 'Erro na integração externa';
      case 'auth':
        return 'Erro de autenticação';
      case 'network':
        return 'Erro de conexão';
      default:
        return 'Erro no sistema';
    }
  };

  const getContextAdvice = (context: string) => {
    switch (context) {
      case 'upload':
        return 'Verifique se o arquivo não está corrompido e tente novamente.';
      case 'ai':
        return 'O serviço de IA pode estar temporariamente indisponível.';
      case 'integration':
        return 'Verifique as configurações de integração e credenciais.';
      case 'auth':
        return 'Sua sessão pode ter expirado. Faça login novamente.';
      case 'network':
        return 'Verifique sua conexão com a internet.';
      default:
        return 'Tente novamente ou contate o suporte.';
    }
  };

  const errorMessage = typeof error === 'string' ? error : error.message;

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <div className="flex-1">
        <AlertTitle className="flex items-center justify-between">
          {getContextMessage(context)}
          {onDismiss && (
            <Button variant="ghost" size="sm" onClick={onDismiss}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </AlertTitle>
        <AlertDescription className="mt-2">
          <p className="mb-2">{errorMessage}</p>
          <p className="text-sm text-muted-foreground">{getContextAdvice(context)}</p>
        </AlertDescription>
      </div>
      
      {onRetry && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRetry}
          className="ml-2 mt-2"
        >
          <RefreshCw className="mr-1 h-3 w-3" />
          Tentar novamente
        </Button>
      )}
    </Alert>
  );
};