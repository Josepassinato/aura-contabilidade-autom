import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  Database, 
  Server, 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  TrendingDown,
  Clock,
  Users,
  BarChart3,
  Settings,
  RefreshCw,
  Archive,
  Trash2
} from 'lucide-react';
import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function PerformanceDashboard() {
  const {
    metrics,
    workers,
    queue,
    stats,
    alerts,
    loading,
    collectMetrics,
    analyzePerformance,
    checkAlerts,
    optimizeDatabase,
    cleanupOfflineWorkers,
    archiveOldData,
    getFunctionHealthScore,
    refetch
  } = usePerformanceMonitoring();

  const [analyzing, setAnalyzing] = useState(false);
  const [optimizing, setOptimizing] = useState(false);

  const handleAnalyzePerformance = async () => {
    setAnalyzing(true);
    try {
      const result = await analyzePerformance('24h');
      if (result) {
        console.log('Performance analysis:', result);
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const handleOptimizeDatabase = async () => {
    setOptimizing(true);
    try {
      const result = await optimizeDatabase();
      if (result) {
        console.log('Database optimization:', result);
      }
    } finally {
      setOptimizing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Carregando métricas de performance...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com ações */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard de Performance</h1>
          <p className="text-muted-foreground">
            Monitoramento em tempo real da arquitetura e escalabilidade
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={refetch}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          
          <Button variant="outline" onClick={checkAlerts}>
            <AlertTriangle className="h-4 w-4 mr-2" />
            Verificar Alertas
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleAnalyzePerformance}
            disabled={analyzing}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            {analyzing ? 'Analisando...' : 'Analisar Performance'}
          </Button>
        </div>
      </div>

      {/* Alertas Críticos */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.filter(a => a.severity === 'critical').map((alert, index) => (
            <Alert key={index} variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>{alert.function_name}</strong>: {alert.description}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Métricas Principais */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tempo Resposta Médio</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.average_response_time > 1000 
                  ? `${(stats.average_response_time / 1000).toFixed(1)}s`
                  : `${Math.round(stats.average_response_time)}ms`
                }
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.average_response_time > 5000 ? (
                  <span className="text-destructive flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Acima do esperado
                  </span>
                ) : (
                  <span className="text-success flex items-center gap-1">
                    <TrendingDown className="h-3 w-3" />
                    Performance normal
                  </span>
                )}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{stats.success_rate}%</div>
              <Progress value={stats.success_rate} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {stats.total_errors} erros detectados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Workers Ativos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active_workers}</div>
              <p className="text-xs text-muted-foreground">
                {workers.filter(w => w.status === 'busy').length} processando
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fila de Processamento</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.queue_length}</div>
              <p className="text-xs text-muted-foreground">
                tarefas aguardando
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs de Detalhamento */}
      <Tabs defaultValue="functions" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="functions">Edge Functions</TabsTrigger>
          <TabsTrigger value="workers">Workers</TabsTrigger>
          <TabsTrigger value="queue">Fila</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="optimization">Otimização</TabsTrigger>
        </TabsList>

        {/* Edge Functions */}
        <TabsContent value="functions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance das Edge Functions</CardTitle>
              <CardDescription>
                Monitoramento em tempo real das funções serverless
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from(new Set(metrics.map(m => m.function_name))).map(functionName => {
                  const functionMetrics = metrics.filter(m => m.function_name === functionName);
                  const latestMetric = functionMetrics[0];
                  const healthScore = getFunctionHealthScore(functionName);
                  
                  return (
                    <div key={functionName} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          healthScore > 80 ? 'bg-success' :
                          healthScore > 60 ? 'bg-warning' : 'bg-destructive'
                        }`} />
                        <div>
                          <h4 className="font-medium">{functionName}</h4>
                          <p className="text-sm text-muted-foreground">
                            {latestMetric ? `${latestMetric.execution_time_ms}ms` : 'Sem dados'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-medium">Score: {healthScore}/100</div>
                          <div className="text-xs text-muted-foreground">
                            {latestMetric ? `${(latestMetric.error_rate * 100).toFixed(1)}% erro` : '--'}
                          </div>
                        </div>
                        
                        <Badge variant={healthScore > 80 ? 'default' : healthScore > 60 ? 'secondary' : 'destructive'}>
                          {healthScore > 80 ? 'Saudável' : healthScore > 60 ? 'Atenção' : 'Crítico'}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Workers */}
        <TabsContent value="workers" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Instâncias de Workers</h3>
            <Button variant="outline" size="sm" onClick={cleanupOfflineWorkers}>
              <Trash2 className="h-4 w-4 mr-2" />
              Limpar Offline
            </Button>
          </div>
          
          <div className="grid gap-4">
            {workers.map(worker => (
              <Card key={worker.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        worker.status === 'idle' ? 'bg-success' :
                        worker.status === 'busy' ? 'bg-warning' : 'bg-muted'
                      }`} />
                      <div>
                        <h4 className="font-medium">{worker.worker_id}</h4>
                        <p className="text-sm text-muted-foreground">
                          {worker.function_name}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm">
                          {worker.current_task_count}/{worker.max_concurrent_tasks} tarefas
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(worker.last_heartbeat), {
                            addSuffix: true,
                            locale: ptBR
                          })}
                        </div>
                      </div>
                      
                      <Badge variant={
                        worker.status === 'idle' ? 'default' :
                        worker.status === 'busy' ? 'secondary' : 'outline'
                      }>
                        {worker.status === 'idle' ? 'Disponível' :
                         worker.status === 'busy' ? 'Ocupado' : 'Offline'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Fila de Processamento */}
        <TabsContent value="queue" className="space-y-4">
          <h3 className="text-lg font-semibold">Fila de Processamento</h3>
          
          <div className="space-y-2">
            {queue.map(task => (
              <Card key={task.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        task.status === 'pending' ? 'bg-info' :
                        task.status === 'processing' ? 'bg-warning' :
                        task.status === 'completed' ? 'bg-success' : 'bg-destructive'
                      }`} />
                      <div>
                        <h4 className="font-medium">{task.process_type}</h4>
                        <p className="text-sm text-muted-foreground">
                          Cliente: {task.client_id}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm">Prioridade: {task.priority}</div>
                        <div className="text-xs text-muted-foreground">
                          {task.retry_count > 0 && `${task.retry_count} tentativas`}
                        </div>
                      </div>
                      
                      <Badge variant={
                        task.status === 'pending' ? 'secondary' :
                        task.status === 'processing' ? 'outline' :
                        task.status === 'completed' ? 'default' : 'destructive'
                      }>
                        {task.status === 'pending' ? 'Aguardando' :
                         task.status === 'processing' ? 'Processando' :
                         task.status === 'completed' ? 'Concluído' : 'Falhou'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Database Performance */}
        <TabsContent value="database" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Performance do Banco de Dados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-2">Uso de CPU</h4>
                  <Progress value={stats?.cpu_usage_avg || 0} className="mb-1" />
                  <p className="text-xs text-muted-foreground">
                    {(stats?.cpu_usage_avg || 0).toFixed(1)}% média
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Uso de Memória</h4>
                  <Progress value={(stats?.memory_usage_avg || 0) / 10} className="mb-1" />
                  <p className="text-xs text-muted-foreground">
                    {(stats?.memory_usage_avg || 0).toFixed(1)}MB média
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Otimização */}
        <TabsContent value="optimization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Ferramentas de Otimização
              </CardTitle>
              <CardDescription>
                Otimizações automáticas para melhorar a performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Otimizar Banco de Dados</h4>
                  <p className="text-sm text-muted-foreground">
                    Criar índices, limpar dados e atualizar estatísticas
                  </p>
                </div>
                <Button 
                  onClick={handleOptimizeDatabase}
                  disabled={optimizing}
                >
                  {optimizing ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Zap className="h-4 w-4 mr-2" />
                  )}
                  {optimizing ? 'Otimizando...' : 'Otimizar'}
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Arquivar Dados Antigos</h4>
                  <p className="text-sm text-muted-foreground">
                    Mover dados históricos para melhorar performance
                  </p>
                </div>
                <Button variant="outline" onClick={archiveOldData}>
                  <Archive className="h-4 w-4 mr-2" />
                  Arquivar
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Coletar Métricas</h4>
                  <p className="text-sm text-muted-foreground">
                    Atualizar métricas de performance em tempo real
                  </p>
                </div>
                <Button variant="outline" onClick={collectMetrics}>
                  <Activity className="h-4 w-4 mr-2" />
                  Coletar
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}