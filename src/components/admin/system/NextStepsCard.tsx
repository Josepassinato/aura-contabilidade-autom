import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SystemStatus } from './SystemStatusGrid';

type OverallStatus = 'ready' | 'partial' | 'not_ready';

interface NextStepsCardProps {
  status: OverallStatus;
  systemStatus: SystemStatus[];
}

export function NextStepsCard({ status, systemStatus }: NextStepsCardProps) {
  if (status === 'ready') {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-800">Próximos Passos para Uso Real</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-green-700">
            <li>Fazer login como administrador usando os botões de acesso rápido</li>
            <li>Acessar o Dashboard de Segurança em /admin/security</li>
            <li>Configurar clientes reais no sistema</li>
            <li>Executar validações iniciais</li>
            <li>Monitorar métricas de segurança regularmente</li>
          </ol>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="text-yellow-800">Ações Recomendadas</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="list-disc list-inside space-y-1 text-yellow-700">
          {systemStatus.filter(s => s.status === 'error').map((check, i) => (
            <li key={i}>Resolver erro em: {check.component}</li>
          ))}
          {systemStatus.filter(s => s.status === 'warning').map((check, i) => (
            <li key={i}>Melhorar: {check.component}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}