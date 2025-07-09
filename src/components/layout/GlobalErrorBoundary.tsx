import React from 'react';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { useToast } from '@/hooks/use-toast';

interface GlobalErrorBoundaryProps {
  children: React.ReactNode;
}

export function GlobalErrorBoundary({ children }: GlobalErrorBoundaryProps) {
  const { toast } = useToast();

  const handleError = (error: Error) => {
    // Log do erro para monitoramento
    console.error('Global error caught:', error);
    
    // Notificar o usuário
    toast({
      title: "Erro Inesperado",
      description: "Algo deu errado. Nossa equipe foi notificada.",
      variant: "destructive",
    });

    // Aqui você pode enviar o erro para um serviço de monitoramento
    // como Sentry, LogRocket, etc.
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      // Enviar para serviço de monitoramento em produção
      // sendErrorToMonitoring(error);
    }
  };

  return (
    <ErrorBoundary onError={handleError}>
      {children}
    </ErrorBoundary>
  );
}