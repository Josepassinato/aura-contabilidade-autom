import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, AlertTriangle, CheckCircle, Activity } from 'lucide-react';
import { SecurityMetric } from '../types/security';

interface SecurityMetricsGridProps {
  metrics: SecurityMetric[];
}

export function SecurityMetricsGrid({ metrics }: SecurityMetricsGridProps) {
  const metricConfigs = [
    { name: 'failed_auth_attempts_24h', label: 'Tentativas de Login Falhadas (24h)', icon: Shield },
    { name: 'rls_violations_1h', label: 'Violações RLS (1h)', icon: AlertTriangle },
    { name: 'active_admin_users', label: 'Administradores Ativos', icon: CheckCircle },
    { name: 'system_health_status', label: 'Status do Sistema', icon: Activity }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metricConfigs.map(({ name, label, icon: Icon }) => {
        const metric = metrics.find(m => m.metric_name === name);
        const value = metric?.metric_value || 0;
        const isWarning = (name === 'failed_auth_attempts_24h' && value > 5) || 
                         (name === 'rls_violations_1h' && value > 0);
        
        return (
          <Card key={name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{label}</CardTitle>
              <Icon className={`h-4 w-4 ${isWarning ? 'text-yellow-600' : 'text-muted-foreground'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${isWarning ? 'text-yellow-600' : ''}`}>
                {value}
              </div>
              {metric && (
                <p className="text-xs text-muted-foreground">
                  Última atualização: {new Date(metric.timestamp).toLocaleTimeString()}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}