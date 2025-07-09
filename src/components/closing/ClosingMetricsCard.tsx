import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Clock, AlertTriangle, BarChart3 } from 'lucide-react';
import { ClosingMetrics } from '@/hooks/useMonthlyClosing';

interface ClosingMetricsCardProps {
  metrics: ClosingMetrics;
}

export function ClosingMetricsCard({ metrics }: ClosingMetricsCardProps) {
  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${Math.round(minutes)}min`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}min`;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-success" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-success">{metrics.completed}</div>
          <p className="text-xs text-muted-foreground">
            de {metrics.totalClients} clientes
          </p>
          <Progress value={metrics.completionRate} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {metrics.completionRate.toFixed(1)}% concluído
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Em Progresso</CardTitle>
          <Clock className="h-4 w-4 text-warning" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-warning">{metrics.inProgress}</div>
          <p className="text-xs text-muted-foreground">
            {metrics.pending} pendentes
          </p>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between text-xs">
              <span>Progresso Médio</span>
              <span>{metrics.averageProgress.toFixed(1)}%</span>
            </div>
            <Progress value={metrics.averageProgress} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Bloqueados</CardTitle>
          <AlertTriangle className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">{metrics.blocked}</div>
          <p className="text-xs text-muted-foreground">
            requerem atenção
          </p>
          {metrics.blocked > 0 && (
            <div className="mt-2 p-2 bg-destructive/10 rounded-md">
              <p className="text-xs text-destructive">
                Resolva problemas bloqueantes para continuar
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tempo Restante</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatTime(metrics.estimatedTimeRemaining)}
          </div>
          <p className="text-xs text-muted-foreground">
            estimativa para conclusão
          </p>
          {metrics.estimatedTimeRemaining > 0 && (
            <div className="mt-2">
              <p className="text-xs text-muted-foreground">
                Baseado no progresso atual
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}