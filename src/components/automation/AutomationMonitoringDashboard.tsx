import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logger } from "@/utils/logger";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Zap,
  Bot,
  TrendingUp,
  Server,
  Database,
  Timer
} from 'lucide-react';

interface ExecutionLog {
  id: string;
  process_type: string;
  started_at: string;
  completed_at?: string;
  status: string;
  duration_seconds?: number;
  records_processed?: number;
  errors_count?: number;
  metadata?: any;
}

interface WorkerInstance {
  id: string;
  worker_id: string;
  function_name: string;
  status: string;
  current_task_count: number;
  max_concurrent_tasks: number;
  last_heartbeat: string;
  started_at: string;
}

interface QueueMetrics {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  total: number;
}

const AutomationMonitoringDashboard = () => {
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [workers, setWorkers] = useState<WorkerInstance[]>([]);
  const [queueMetrics, setQueueMetrics] = useState<QueueMetrics>({
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
    total: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { toast } = useToast();

  const loadMonitoringData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Load recent execution logs
      const { data: logsData, error: logsError } = await supabase
        .from('automation_logs')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(50);

      if (logsError) throw logsError;
      setLogs(logsData || []);

      // Load worker instances
      const { data: workersData, error: workersError } = await supabase
        .from('worker_instances')
        .select('*')
        .order('last_heartbeat', { ascending: false });

      if (workersError) throw workersError;
      setWorkers(workersData || []);

      // Load queue metrics
      const { data: queueData, error: queueError } = await supabase
        .from('processing_queue')
        .select('status')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (queueError) throw queueError;

      const metrics = (queueData || []).reduce((acc, item) => {
        acc[item.status as keyof QueueMetrics] = (acc[item.status as keyof QueueMetrics] || 0) + 1;
        acc.total += 1;
        return acc;
      }, { pending: 0, processing: 0, completed: 0, failed: 0, total: 0 });

      setQueueMetrics(metrics);

    } catch (error: any) {
      logger.error('Error loading monitoring data:', error, 'AutomationMonitoringDashboard');
      toast({
        title: "Erro",
        description: "Falha ao carregar dados de monitoramento",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const triggerAutomationEngine = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('automation-trigger-engine');
      
      if (error) throw error;

      toast({
        title: "Engine Acionado",
        description: `${data.triggered_rules} regras foram executadas`
      });

      // Reload data after trigger
      await loadMonitoringData();
    } catch (error: any) {
      logger.error('Error triggering automation engine:', error, 'AutomationMonitoringDashboard');
      toast({
        title: "Erro",
        description: "Falha ao acionar o engine de automação",
        variant: "destructive"
      });
    }
  };

  const runWorker = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('automation-worker');
      
      if (error) throw error;

      toast({
        title: "Worker Executado",
        description: `${data.tasks_processed} tarefas foram processadas`
      });

      // Reload data after worker run
      await loadMonitoringData();
    } catch (error: any) {
      logger.error('Error running worker:', error, 'AutomationMonitoringDashboard');
      toast({
        title: "Erro",
        description: "Falha ao executar worker",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Concluído</Badge>;
      case 'running':
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800">Executando</Badge>;
      case 'failed':
        return <Badge variant="destructive">Falhou</Badge>;
      case 'pending':
        return <Badge variant="outline">Pendente</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getWorkerStatusBadge = (status: string, lastHeartbeat: string) => {
    const heartbeatTime = new Date(lastHeartbeat).getTime();
    const now = Date.now();
    const timeDiff = now - heartbeatTime;
    const isOffline = timeDiff > 5 * 60 * 1000; // 5 minutes

    if (isOffline) {
      return <Badge variant="destructive">Offline</Badge>;
    }

    switch (status) {
      case 'busy':
        return <Badge className="bg-blue-100 text-blue-800">Ocupado</Badge>;
      case 'idle':
        return <Badge className="bg-green-100 text-green-800">Disponível</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  useEffect(() => {
    loadMonitoringData();
    
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(loadMonitoringData, 10000); // Refresh every 10 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loadMonitoringData, autoRefresh]);

  const activeWorkers = workers.filter(w => {
    const heartbeatTime = new Date(w.last_heartbeat).getTime();
    const now = Date.now();
    return (now - heartbeatTime) < 5 * 60 * 1000; // Active in last 5 minutes
  });

  const successRate = queueMetrics.total > 0 
    ? ((queueMetrics.completed / queueMetrics.total) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Activity className="h-6 w-6 text-primary" />
          Monitoramento de Automação
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            Auto-refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={loadMonitoringData}
            disabled={isLoading}
          >
            <RotateCcw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button
            size="sm"
            onClick={triggerAutomationEngine}
          >
            <Zap className="h-4 w-4 mr-2" />
            Acionar Engine
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={runWorker}
          >
            <Bot className="h-4 w-4 mr-2" />
            Executar Worker
          </Button>
        </div>
      </div>

      {/* Real-time Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fila de Processamento</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{queueMetrics.pending}</div>
            <p className="text-xs text-muted-foreground">Tarefas pendentes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Execução</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{queueMetrics.processing}</div>
            <p className="text-xs text-muted-foreground">Processando agora</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Workers Ativos</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeWorkers.length}</div>
            <p className="text-xs text-muted-foreground">Instâncias online</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate.toFixed(1)}%</div>
            <Progress value={successRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Última Execução</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold">
              {logs[0] ? new Date(logs[0].started_at).toLocaleTimeString('pt-BR') : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {logs[0] ? getStatusBadge(logs[0].status) : 'Nenhuma execução'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {queueMetrics.failed > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {queueMetrics.failed} tarefas falharam nas últimas 24 horas. Verifique os logs para mais detalhes.
          </AlertDescription>
        </Alert>
      )}

      {activeWorkers.length === 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Nenhum worker ativo detectado. As tarefas automatizadas podem não estar sendo processadas.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Executions */}
        <Card>
          <CardHeader>
            <CardTitle>Execuções Recentes</CardTitle>
            <CardDescription>
              Últimas execuções de tarefas automatizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {logs.slice(0, 10).map((log) => (
                <div key={log.id} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <div className="font-medium">{log.process_type}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(log.started_at).toLocaleString('pt-BR')}
                    </div>
                    {log.records_processed && (
                      <div className="text-xs text-muted-foreground">
                        {log.records_processed} registros processados
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {getStatusBadge(log.status)}
                    {log.duration_seconds && (
                      <div className="text-xs text-muted-foreground">
                        {formatDuration(log.duration_seconds)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Worker Status */}
        <Card>
          <CardHeader>
            <CardTitle>Status dos Workers</CardTitle>
            <CardDescription>
              Instâncias de processamento ativas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {workers.slice(0, 10).map((worker) => (
                <div key={worker.id} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <div className="font-medium">{worker.worker_id}</div>
                    <div className="text-sm text-muted-foreground">
                      {worker.function_name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Iniciado: {new Date(worker.started_at).toLocaleString('pt-BR')}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {getWorkerStatusBadge(worker.status, worker.last_heartbeat)}
                    <div className="text-xs text-muted-foreground">
                      {worker.current_task_count}/{worker.max_concurrent_tasks} tarefas
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Último ping: {new Date(worker.last_heartbeat).toLocaleTimeString('pt-BR')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AutomationMonitoringDashboard;