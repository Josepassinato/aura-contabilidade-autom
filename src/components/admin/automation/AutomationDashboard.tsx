import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  BarChart3,
  Settings,
  PlayCircle,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SystemHealthChecker } from "./SystemHealthChecker";

interface AutomationLog {
  id: string;
  process_type: string;
  status: string;
  client_id?: string;
  started_at: string;
  completed_at?: string;
  duration_seconds?: number;
  records_processed: number;
  errors_count: number;
  error_details?: any;
  metadata: any;
}

export function AutomationDashboard() {
  const [logs, setLogs] = useState<AutomationLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [triggeringProcess, setTriggeringProcess] = useState<string | null>(null);
  const { toast } = useToast();

  // Carregar logs de automação
  const loadAutomationLogs = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('automation_logs')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setLogs(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar logs:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os logs de automação.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger de testes de estresse
  const triggerStressTest = async (testType: string) => {
    setTriggeringProcess('stress_test');
    
    try {
      const { data, error } = await supabase.functions.invoke('stress-test-automation', {
        body: { 
          testType,
          duration: testType === 'load' ? 30 : undefined,
          concurrency: testType === 'concurrent' ? 10 : undefined,
          dataVolume: testType === 'volume' ? 500 : undefined
        }
      });

      if (error) throw error;

      toast({
        title: "Teste de estresse iniciado",
        description: `Teste ${testType} foi executado com sucesso.`
      });

      // Recarregar logs após um breve delay
      setTimeout(() => {
        loadAutomationLogs();
      }, 2000);

    } catch (error: any) {
      console.error('Erro ao executar teste de estresse:', error);
      toast({
        title: "Erro no teste de estresse",
        description: error.message || "Não foi possível executar o teste.",
        variant: "destructive"
      });
    } finally {
      setTriggeringProcess(null);
    }
  };

  // Trigger manual de processo
  const triggerProcess = async (processType: string) => {
    setTriggeringProcess(processType);
    
    try {
      let endpoint = '';
      switch (processType) {
        case 'daily_processing':
          endpoint = '/functions/v1/process-daily-accounting';
          break;
        case 'data_ingestion':
          endpoint = '/functions/v1/process-data-ingestion';
          break;
        case 'payment_automation':
          endpoint = '/functions/v1/process-scheduled-payments';
          break;
      }

      const { data, error } = await supabase.functions.invoke(endpoint.replace('/functions/v1/', ''), {
        body: { trigger: 'manual' }
      });

      if (error) throw error;

      toast({
        title: "Processo iniciado",
        description: `${getProcessName(processType)} foi iniciado com sucesso.`
      });

      // Recarregar logs após um breve delay
      setTimeout(() => {
        loadAutomationLogs();
      }, 2000);

    } catch (error: any) {
      console.error('Erro ao disparar processo:', error);
      toast({
        title: "Erro ao iniciar processo",
        description: error.message || "Não foi possível iniciar o processo.",
        variant: "destructive"
      });
    } finally {
      setTriggeringProcess(null);
    }
  };

  useEffect(() => {
    loadAutomationLogs();
    
    // Recarregar logs a cada 30 segundos
    const interval = setInterval(loadAutomationLogs, 30000);
    return () => clearInterval(interval);
  }, []);

  // Calcular estatísticas
  const stats = React.useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayLogs = logs.filter(log => log.started_at.startsWith(today));
    
    return {
      total: logs.length,
      todayTotal: todayLogs.length,
      completed: logs.filter(log => log.status === 'completed').length,
      failed: logs.filter(log => log.status === 'failed').length,
      running: logs.filter(log => log.status === 'running').length,
      avgDuration: logs
        .filter(log => log.duration_seconds)
        .reduce((sum, log) => sum + (log.duration_seconds || 0), 0) / 
        Math.max(logs.filter(log => log.duration_seconds).length, 1)
    };
  }, [logs]);

  // Obter nome amigável do processo
  const getProcessName = (type: string): string => {
    switch (type) {
      case 'daily_processing': return 'Processamento Diário';
      case 'data_ingestion': return 'Ingestão de Dados';
      case 'payment_automation': return 'Automação de Pagamentos';
      default: return type.replace('_', ' ').toUpperCase();
    }
  };

  // Obter cor do status
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      case 'running': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard de Automação</h1>
          <p className="text-muted-foreground">
            Monitore e controle todos os processos automatizados do sistema
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={loadAutomationLogs}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Processos Hoje</p>
                <p className="text-2xl font-bold">{stats.todayTotal}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Concluídos</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Com Falhas</p>
                <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Em Execução</p>
                <p className="text-2xl font-bold text-blue-600">{stats.running}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="controls">Controles Manuais</TabsTrigger>
          <TabsTrigger value="health">Verificação de Saúde</TabsTrigger>
          <TabsTrigger value="logs">Logs Detalhados</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Últimos processos */}
            <Card>
              <CardHeader>
                <CardTitle>Últimos Processos</CardTitle>
                <CardDescription>
                  Execuções mais recentes dos processos automatizados
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {logs.slice(0, 5).map((log) => (
                  <div key={log.id} className="flex items-center space-x-4">
                    <Badge className={getStatusColor(log.status)} variant="outline">
                      {getProcessName(log.process_type)}
                    </Badge>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {log.records_processed} registros processados
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(log.started_at).toLocaleString('pt-BR')}
                        {log.duration_seconds && ` • ${log.duration_seconds}s`}
                      </p>
                    </div>
                    {log.status === 'running' && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Resumo de performance */}
            <Card>
              <CardHeader>
                <CardTitle>Performance do Sistema</CardTitle>
                <CardDescription>
                  Métricas de eficiência dos processos automatizados
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Taxa de Sucesso</span>
                    <span>{((stats.completed / Math.max(stats.total, 1)) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress 
                    value={(stats.completed / Math.max(stats.total, 1)) * 100} 
                    className="h-2 mt-2" 
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm">
                    <span>Tempo Médio de Execução</span>
                    <span>{Math.round(stats.avgDuration)}s</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                    <p className="text-xs text-muted-foreground">Sucessos</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
                    <p className="text-xs text-muted-foreground">Falhas</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{stats.running}</p>
                    <p className="text-xs text-muted-foreground">Executando</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="controls">
          {/* Seção de Testes de Estresse */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Testes de Estresse do Sistema
              </CardTitle>
              <CardDescription>
                Execute testes simulados para verificar a robustez do sistema antes do deploy em produção
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Button 
                  variant="outline"
                  onClick={() => triggerStressTest('load')}
                  disabled={triggeringProcess === 'stress_test'}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Teste de Carga
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => triggerStressTest('concurrent')}
                  disabled={triggeringProcess === 'stress_test'}
                >
                  <Activity className="h-4 w-4 mr-2" />
                  Teste de Concorrência
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => triggerStressTest('volume')}
                  disabled={triggeringProcess === 'stress_test'}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Teste de Volume
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => triggerStressTest('full')}
                  disabled={triggeringProcess === 'stress_test'}
                >
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Teste Completo
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Processamento Diário */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Processamento Diário
                </CardTitle>
                <CardDescription>
                  Processa dados contábeis de todos os clientes ativos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm space-y-2">
                    <p><strong>Frequência:</strong> Diário às 02:00</p>
                    <p><strong>Última execução:</strong> {
                      logs.find(l => l.process_type === 'daily_processing')?.started_at
                        ? new Date(logs.find(l => l.process_type === 'daily_processing')!.started_at).toLocaleDateString('pt-BR')
                        : 'Nunca executado'
                    }</p>
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={() => triggerProcess('daily_processing')}
                    disabled={triggeringProcess === 'daily_processing'}
                  >
                    {triggeringProcess === 'daily_processing' ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Executando...
                      </>
                    ) : (
                      <>
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Executar Agora
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Ingestão de Dados */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Ingestão de Dados
                </CardTitle>
                <CardDescription>
                  Coleta dados de todas as fontes configuradas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm space-y-2">
                    <p><strong>Frequência:</strong> A cada 6 horas</p>
                    <p><strong>Última execução:</strong> {
                      logs.find(l => l.process_type === 'data_ingestion')?.started_at
                        ? new Date(logs.find(l => l.process_type === 'data_ingestion')!.started_at).toLocaleDateString('pt-BR')
                        : 'Nunca executado'
                    }</p>
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={() => triggerProcess('data_ingestion')}
                    disabled={triggeringProcess === 'data_ingestion'}
                  >
                    {triggeringProcess === 'data_ingestion' ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Executando...
                      </>
                    ) : (
                      <>
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Executar Agora
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Automação de Pagamentos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Automação de Pagamentos
                </CardTitle>
                <CardDescription>
                  Verifica e processa pagamentos agendados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm space-y-2">
                    <p><strong>Frequência:</strong> A cada hora</p>
                    <p><strong>Última execução:</strong> {
                      logs.find(l => l.process_type === 'payment_automation')?.started_at
                        ? new Date(logs.find(l => l.process_type === 'payment_automation')!.started_at).toLocaleDateString('pt-BR')
                        : 'Nunca executado'
                    }</p>
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={() => triggerProcess('payment_automation')}
                    disabled={triggeringProcess === 'payment_automation'}
                  >
                    {triggeringProcess === 'payment_automation' ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Executando...
                      </>
                    ) : (
                      <>
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Executar Agora
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="health">
          <SystemHealthChecker />
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Logs de Execução</CardTitle>
              <CardDescription>
                Histórico detalhado de todas as execuções dos processos automatizados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  <div className="flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : logs.length === 0 ? (
                  <div className="text-center text-muted-foreground p-8">
                    Nenhum log de automação encontrado
                  </div>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(log.status)} variant="outline">
                            {getProcessName(log.process_type)}
                          </Badge>
                          <span className="text-sm font-medium">
                            Status: {log.status}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(log.started_at).toLocaleString('pt-BR')}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Registros:</span> {log.records_processed}
                        </div>
                        <div>
                          <span className="font-medium">Erros:</span> {log.errors_count}
                        </div>
                        <div>
                          <span className="font-medium">Duração:</span> {
                            log.duration_seconds ? `${log.duration_seconds}s` : 'N/A'
                          }
                        </div>
                        <div>
                          <span className="font-medium">Trigger:</span> {
                            log.metadata?.trigger || 'N/A'
                          }
                        </div>
                      </div>

                      {log.error_details && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-sm text-red-600 font-medium">
                            Ver detalhes dos erros
                          </summary>
                          <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                            {JSON.stringify(log.error_details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}