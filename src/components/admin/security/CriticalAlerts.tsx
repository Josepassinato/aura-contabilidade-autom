import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { SecurityMetric } from '../types/security';

interface CriticalAlertsProps {
  metrics: SecurityMetric[];
}

export function CriticalAlerts({ metrics }: CriticalAlertsProps) {
  const criticalMetrics = metrics.filter(m => 
    (m.metric_name === 'failed_auth_attempts_24h' && m.metric_value > 10) ||
    (m.metric_name === 'rls_violations_1h' && m.metric_value > 5)
  );

  if (criticalMetrics.length === 0) {
    return null;
  }

  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Alertas Críticos de Segurança</AlertTitle>
      <AlertDescription>
        {criticalMetrics.map(metric => (
          <div key={metric.metric_name} className="mt-2">
            <strong>{metric.metric_name}:</strong> {metric.metric_value}
          </div>
        ))}
      </AlertDescription>
    </Alert>
  );
}