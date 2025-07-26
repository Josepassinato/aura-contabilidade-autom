import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRealTimeMonitoring } from '@/hooks/useRealTimeMonitoring';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Wifi,
  WifiOff,
  Zap,
  TrendingUp,
  Server,
  BarChart3,
  RefreshCw,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';

const RealTimeMonitoringDashboard = () => {
  const {
    isConnected,
    isLoading,
    health,
    metrics,
    alerts,
    requestMetrics,
    requestAlerts,
    optimizeSystem
  } = useRealTimeMonitoring();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error':
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge className="bg-green-100 text-green-800">Saudável</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">Atenção</Badge>;
      case 'error':
      case 'critical':
        return <Badge variant="destructive">Crítico</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const getAlertIcon = (level: string) => {
    switch (level) {
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Activity className="h-4 w-4 text-blue-600" />;
    }
  };

  const formatUptime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m ${seconds % 60}s`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Conectando ao monitoramento em tempo real...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold tracking-tight">Monitoramento em Tempo Real</h2>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                <Wifi className="h-5 w-5 text-green-600" />
                <Badge className="bg-green-100 text-green-800">Conectado</Badge>
              </>
            ) : (
              <>
                <WifiOff className="h-5 w-5 text-red-600" />
                <Badge variant="destructive">Desconectado</Badge>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={requestMetrics}
            disabled={!isConnected}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Atualizar Métricas
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={optimizeSystem}
            disabled={!isConnected}
          >
            <Zap className="h-4 w-4 mr-2" />
            Otimizar Sistema
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      {health && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Status Geral do Sistema
            </CardTitle>
            <CardDescription>
              Monitoramento em tempo real dos componentes críticos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  <div>
                    <div className="font-medium">Banco de Dados</div>
                    <div className="text-sm text-muted-foreground">
                      {health.components.database.response_time}ms
                    </div>
                  </div>
                </div>
                {getStatusIcon(health.components.database.status)}
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  <div>
                    <div className="font-medium">Fila de Tarefas</div>
                    <div className="text-sm text-muted-foreground">
                      {health.components.queue.pending_tasks} pendentes
                    </div>
                  </div>
                </div>
                {getStatusIcon(health.components.queue.status)}
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  <div>
                    <div className="font-medium">Workers</div>
                    <div className="text-sm text-muted-foreground">
                      {health.components.workers.active_count} ativos
                    </div>
                  </div>
                </div>
                {getStatusIcon(health.components.workers.status)}
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  <div>
                    <div className="font-medium">Automação</div>
                    <div className="text-sm text-muted-foreground">
                      {health.components.automation.success_rate.toFixed(1)}% sucesso
                    </div>
                  </div>
                </div>
                {getStatusIcon(health.components.automation.status)}
              </div>
            </div>

            <div className="mt-4 p-3 rounded-lg bg-muted/50">
              <div className="flex items-center justify-between">
                <span className="font-medium">Status Geral:</span>
                {getStatusBadge(health.overall_status)}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Metrics */}
      {metrics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Queue Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Fila de Processamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Total de Tarefas</span>
                <span className="font-bold">{metrics.queue.total_tasks}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Pendentes</span>
                <span className="font-bold text-yellow-600">{metrics.queue.pending_tasks}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Processando</span>
                <span className="font-bold text-blue-600">{metrics.queue.processing_tasks}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Concluídas</span>
                <span className="font-bold text-green-600">{metrics.queue.completed_tasks}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Falharam</span>
                <span className="font-bold text-red-600">{metrics.queue.failed_tasks}</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Tempo Médio</span>
                  <span className="font-bold">{metrics.queue.avg_processing_time}s</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Worker Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Server className="h-4 w-4" />
                Workers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Total</span>
                <span className="font-bold">{metrics.workers.total_workers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Ativos</span>
                <span className="font-bold text-green-600">{metrics.workers.active_workers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Disponíveis</span>
                <span className="font-bold text-blue-600">{metrics.workers.idle_workers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Ocupados</span>
                <span className="font-bold text-orange-600">{metrics.workers.busy_workers}</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Capacidade</span>
                  <span className="font-bold">{metrics.workers.total_task_capacity}</span>
                </div>
                <div className="mt-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Carga Atual</span>
                    <span>{metrics.workers.current_task_load}/{metrics.workers.total_task_capacity}</span>
                  </div>
                  <Progress 
                    value={(metrics.workers.current_task_load / Math.max(metrics.workers.total_task_capacity, 1)) * 100} 
                    className="h-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Automation Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Automação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Total de Execuções</span>
                <span className="font-bold">{metrics.automation.total_executions}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Bem-sucedidas</span>
                <span className="font-bold text-green-600">{metrics.automation.successful_executions}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Falharam</span>
                <span className="font-bold text-red-600">{metrics.automation.failed_executions}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Registros Processados</span>
                <span className="font-bold">{metrics.automation.total_records_processed}</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Tempo Médio</span>
                  <span className="font-bold">{metrics.automation.avg_execution_time}s</span>
                </div>
                <div className="mt-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Taxa de Sucesso</span>
                    <span>{((metrics.automation.successful_executions / Math.max(metrics.automation.total_executions, 1)) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress 
                    value={(metrics.automation.successful_executions / Math.max(metrics.automation.total_executions, 1)) * 100} 
                    className="h-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Active Alerts */}
      {alerts && alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Alertas Ativos ({alerts.length})
            </CardTitle>
            <CardDescription>
              Alertas e notificações do sistema em tempo real
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <Alert key={alert.id}>
                  <div className="flex items-start gap-2">
                    {getAlertIcon(alert.level)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <AlertDescription className="font-medium">
                          {alert.title}
                        </AlertDescription>
                        <span className="text-xs text-muted-foreground">
                          {new Date(alert.timestamp).toLocaleTimeString('pt-BR')}
                        </span>
                      </div>
                      <AlertDescription className="text-sm text-muted-foreground mt-1">
                        {alert.message}
                      </AlertDescription>
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Connection Lost Message */}
      {!isConnected && (
        <Alert>
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            Conexão perdida com o monitoramento em tempo real. Tentando reconectar automaticamente...
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default RealTimeMonitoringDashboard;