import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle } from 'lucide-react';

type OverallStatus = 'ready' | 'partial' | 'not_ready';

interface OverallStatusAlertProps {
  status: OverallStatus;
}

export function OverallStatusAlert({ status }: OverallStatusAlertProps) {
  const getAlertConfig = (status: OverallStatus) => {
    switch (status) {
      case 'ready':
        return {
          className: 'border-green-200 bg-green-50',
          icon: <CheckCircle className="h-4 w-4 text-green-600" />,
          titleClass: 'text-green-800',
          descClass: 'text-green-700',
          title: 'Sistema Pronto para Uso',
          description: 'Todos os componentes críticos estão funcionando. O sistema está pronto para uso em produção.'
        };
      case 'partial':
        return {
          className: 'border-yellow-200 bg-yellow-50',
          icon: <AlertTriangle className="h-4 w-4 text-yellow-600" />,
          titleClass: 'text-yellow-800',
          descClass: 'text-yellow-700',
          title: 'Sistema Parcialmente Pronto',
          description: 'A maioria dos componentes está funcionando. Algumas funcionalidades podem ter limitações.'
        };
      case 'not_ready':
        return {
          className: 'border-red-200 bg-red-50',
          icon: <AlertTriangle className="h-4 w-4 text-red-600" />,
          titleClass: 'text-red-800',
          descClass: 'text-red-700',
          title: 'Sistema Não Pronto',
          description: 'Componentes críticos apresentam problemas. Resolva os erros antes do uso em produção.'
        };
    }
  };

  const config = getAlertConfig(status);

  return (
    <Alert className={config.className}>
      {config.icon}
      <AlertTitle className={config.titleClass}>
        {config.title}
      </AlertTitle>
      <AlertDescription className={config.descClass}>
        {config.description}
      </AlertDescription>
    </Alert>
  );
}