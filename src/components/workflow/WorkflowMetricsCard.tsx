import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { WorkflowMetrics } from '@/hooks/useWorkflowMonitoring';

interface WorkflowMetricsCardProps {
  metrics: WorkflowMetrics;
}

export function WorkflowMetricsCard({ metrics }: WorkflowMetricsCardProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Problemas Pendentes</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">{metrics.pendingProblems}</div>
          <p className="text-xs text-muted-foreground">
            de {metrics.totalProblems} total
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Resolvidos Hoje</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-success">{metrics.resolvedToday}</div>
          <p className="text-xs text-muted-foreground">
            problemas solucionados
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Taxa de Automação</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.automationRate.toFixed(1)}%</div>
          <Progress value={metrics.automationRate} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-1">
            últimos 7 dias
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {metrics.averageResolutionTime > 0 
              ? `${Math.round(metrics.averageResolutionTime)}h`
              : '--'
            }
          </div>
          <p className="text-xs text-muted-foreground">
            resolução de problemas
          </p>
        </CardContent>
      </Card>

      {/* Card com distribuição de erros por tipo */}
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle className="text-lg">Distribuição de Problemas por Tipo</CardTitle>
          <CardDescription>
            Análise dos tipos de problemas mais frequentes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Object.entries(metrics.errorsByType).map(([type, count]) => {
              const typeLabels = {
                classification_error: 'Erro de Classificação',
                processing_failure: 'Falha de Processamento',
                low_confidence: 'Baixa Confiança',
                manual_review_needed: 'Revisão Manual'
              };
              
              const percentage = metrics.totalProblems > 0 
                ? (count / metrics.totalProblems) * 100 
                : 0;

              return (
                <div key={type} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      {typeLabels[type as keyof typeof typeLabels] || type}
                    </span>
                    <span className="text-sm text-muted-foreground">{count}</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {percentage.toFixed(1)}% do total
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}