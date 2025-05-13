
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';

// Options for error handling
interface ErrorHandlingOptions {
  context?: string;
  fallbackMessage?: string;
  showToast?: boolean;
  logToConsole?: boolean;
  captureToSentry?: boolean;
}

// Centralized error handling service
export function handleError(
  error: unknown,
  options: ErrorHandlingOptions = {}
): void {
  const {
    context = 'Operação',
    fallbackMessage = 'Ocorreu um erro inesperado',
    showToast = true,
    logToConsole = true,
    captureToSentry = false
  } = options;

  // Get error message
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  // Log to console
  if (logToConsole) {
    console.error(`Erro em ${context}:`, error);
  }
  
  // Show toast notification
  if (showToast) {
    toast({
      title: `Erro em ${context}`,
      description: errorMessage || fallbackMessage,
      variant: "destructive",
    });
  }
  
  // Send to error tracking service (e.g. Sentry)
  if (captureToSentry) {
    // This is where you would send the error to Sentry or other error tracking service
    // Sentry.captureException(error);
    console.log('Error would be sent to error tracking service:', error);
  }
}

// Error boundary component for React components
export class ErrorBoundary extends Component<
  { children: ReactNode; fallback?: React.ReactNode }, 
  { hasError: boolean }
> {
  state = { hasError: false };
  
  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    handleError(error, {
      context: 'Renderização de componente',
      logToConsole: true,
      showToast: true,
      captureToSentry: true
    });
    console.error('Component error details:', errorInfo);
  }
  
  render(): React.ReactNode {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 border border-red-500 rounded bg-red-50 text-red-700">
          <h3 className="font-bold mb-2">Algo deu errado</h3>
          <p>Ocorreu um problema ao renderizar este componente. Por favor, tente novamente mais tarde.</p>
        </div>
      );
    }
    
    return this.props.children;
  }
}
