import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

export class EnhancedErrorBoundary extends Component<Props, State> {
  private retryCount = 0;
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorDetails = {
      error: error.toString(),
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorBoundary: this.constructor.name,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
      errorId: this.state.errorId
    };

    // Log detalhado para debugging
    console.group('🚨 Error Boundary - Erro Capturado');
    console.error('Erro:', error);
    console.error('Stack do erro:', error.stack);
    console.error('Component Stack:', errorInfo.componentStack);
    console.error('Detalhes completos:', errorDetails);
    console.groupEnd();

    // Salvar no localStorage para debugging
    if (typeof window !== 'undefined') {
      try {
        const errorHistory = JSON.parse(localStorage.getItem('error_history') || '[]');
        errorHistory.push(errorDetails);
        // Manter apenas os últimos 10 erros
        if (errorHistory.length > 10) {
          errorHistory.splice(0, errorHistory.length - 10);
        }
        localStorage.setItem('error_history', JSON.stringify(errorHistory));
      } catch (e) {
        console.warn('Não foi possível salvar erro no localStorage:', e);
      }
    }

    this.setState({
      error,
      errorInfo
    });

    // Callback personalizado
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Em produção, enviar para serviço de monitoramento
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      this.reportErrorToService(errorDetails);
    }
  }

  private async reportErrorToService(errorDetails: Record<string, unknown>) {
    try {
      // Aqui você pode integrar com Sentry, LogRocket, ou outro serviço
      console.log('Enviando erro para serviço de monitoramento:', errorDetails);
      
      // Exemplo de integração futura:
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorDetails)
      // });
    } catch (e) {
      console.warn('Falha ao enviar erro para serviço de monitoramento:', e);
    }
  }

  private handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: ''
      });
    }
  };

  private handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  private handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      // Fallback personalizado
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const canRetry = this.retryCount < this.maxRetries;
      const isDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <CardTitle className="text-2xl">Ops! Algo deu errado</CardTitle>
              <CardDescription>
                Ocorreu um erro inesperado na aplicação. Nossa equipe foi notificada automaticamente.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <Alert>
                <AlertDescription>
                  <strong>ID do Erro:</strong> {this.state.errorId}
                  <br />
                  <small className="text-muted-foreground">
                    Use este ID ao entrar em contato com o suporte.
                  </small>
                </AlertDescription>
              </Alert>

              {this.props.showDetails && isDev && this.state.error && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium mb-2">
                    Detalhes técnicos (apenas em desenvolvimento)
                  </summary>
                  <div className="bg-muted p-4 rounded-md text-sm font-mono">
                    <div className="mb-2">
                      <strong>Erro:</strong> {this.state.error.message}
                    </div>
                    {this.state.error.stack && (
                      <div className="mb-2">
                        <strong>Stack:</strong>
                        <pre className="mt-1 overflow-auto max-h-40 text-xs">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}
                    {this.state.errorInfo?.componentStack && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="mt-1 overflow-auto max-h-40 text-xs">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
            </CardContent>

            <CardFooter className="flex flex-col sm:flex-row gap-2">
              {canRetry && (
                <Button onClick={this.handleRetry} className="w-full sm:w-auto">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Tentar Novamente ({this.maxRetries - this.retryCount} tentativas restantes)
                </Button>
              )}
              
              <Button 
                variant="outline" 
                onClick={this.handleGoHome}
                className="w-full sm:w-auto"
              >
                <Home className="w-4 h-4 mr-2" />
                Ir para Início
              </Button>

              <Button 
                variant="outline" 
                onClick={this.handleReload}
                className="w-full sm:w-auto"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Recarregar Página
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}