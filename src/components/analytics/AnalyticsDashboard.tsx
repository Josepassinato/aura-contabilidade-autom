import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { logger } from '@/utils/logger';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useLoadingState } from '@/hooks/useLoadingState';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useCleanupTimer } from '@/hooks/useCleanupTimer';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Users, 
  FileText, 
  Server,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react';

interface MetricSummary {
  name: string;
  current: number;
  previous: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: any;
  color: string;
}

interface ChartData {
  date: string;
  value?: number;
  label?: string;
  [key: string]: any; // Permite propriedades adicionais
}

export function AnalyticsDashboard() {
  const [metrics, setMetrics] = useState<MetricSummary[]>([]);
  const [performanceData, setPerformanceData] = useState<ChartData[]>([]);
  const [usageData, setUsageData] = useState<ChartData[]>([]);
  const [queueData, setQueueData] = useState<ChartData[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  
  const { setLoading, isLoading } = useLoadingState();
  const { toast } = useToast();
  const { safeSetInterval, clearAllTimers } = useCleanupTimer();

  useEffect(() => {
    loadAnalyticsData();
    safeSetInterval(loadAnalyticsData, 60000); // Atualizar a cada minuto
    return () => clearAllTimers();
  }, []);

  const loadAnalyticsData = async () => {
    setLoading('analytics', true);
    try {
      await Promise.all([
        loadMetricsSummary(),
        loadPerformanceCharts(),
        loadUsageCharts(),
        loadQueueCharts(),
        loadAlerts()
      ]);
    } catch (error) {
      logger.error('Erro ao carregar dados de analytics', error, 'AnalyticsDashboard');
      toast({
        title: "Erro",
        description: "Falha ao carregar dados de analytics",
        variant: "destructive"
      });
    } finally {
      setLoading('analytics', false);
    }
  };

  const loadMetricsSummary = async () => {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const previous24h = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    // Carregar métricas principais das últimas 24h e 24h anteriores
    const [currentMetrics, previousMetrics] = await Promise.all([
      supabase
        .from('system_metrics')
        .select('metric_name, metric_value')
        .gte('timestamp', last24h.toISOString())
        .lt('timestamp', now.toISOString()),
      supabase
        .from('system_metrics')
        .select('metric_name, metric_value')
        .gte('timestamp', previous24h.toISOString())
        .lt('timestamp', last24h.toISOString())
    ]);

    const current = aggregateMetrics(currentMetrics.data || []);
    const previous = aggregateMetrics(previousMetrics.data || []);

    const summaryMetrics: MetricSummary[] = [
      {
        name: 'Tarefas Processadas',
        current: current.queue_completed_tasks || 0,
        previous: previous.queue_completed_tasks || 0,
        change: 0,
        trend: 'stable',
        icon: CheckCircle,
        color: 'text-green-600'
      },
      {
        name: 'Workers Ativos',
        current: current.workers_active || 0,
        previous: previous.workers_active || 0,
        change: 0,
        trend: 'stable',
        icon: Server,
        color: 'text-blue-600'
      },
      {
        name: 'Utilização Sistema',
        current: current.workers_utilization || 0,
        previous: previous.workers_utilization || 0,
        change: 0,
        trend: 'stable',
        icon: Activity,
        color: 'text-orange-600'
      },
      {
        name: 'Usuários Ativos',
        current: current.active_users || 0,
        previous: previous.active_users || 0,
        change: 0,
        trend: 'stable',
        icon: Users,
        color: 'text-purple-600'
      }
    ];

    // Calcular mudanças e tendências
    summaryMetrics.forEach(metric => {
      if (metric.previous > 0) {
        metric.change = ((metric.current - metric.previous) / metric.previous) * 100;
        metric.trend = metric.change > 5 ? 'up' : metric.change < -5 ? 'down' : 'stable';
      }
    });

    setMetrics(summaryMetrics);
  };

  const loadPerformanceCharts = async () => {
    const { data } = await supabase
      .from('system_metrics')
      .select('timestamp, metric_value, metric_name')
      .in('metric_name', ['automation_avg_duration', 'automation_success_rate'])
      .gte('timestamp', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('timestamp', { ascending: true });

    if (data) {
      // Agrupar por hora e calcular médias
      const hourlyData = data.reduce((acc: any, item) => {
        const hour = new Date(item.timestamp).toISOString().slice(0, 13);
        if (!acc[hour]) {
          acc[hour] = { timestamp: hour, duration: [], success: [] };
        }
        
        if (item.metric_name === 'automation_avg_duration') {
          acc[hour].duration.push(item.metric_value);
        } else if (item.metric_name === 'automation_success_rate') {
          acc[hour].success.push(item.metric_value);
        }
        
        return acc;
      }, {});

    const chartData = Object.values(hourlyData).map((hour: any) => ({
        date: new Date(hour.timestamp).toLocaleDateString('pt-BR', { 
          month: 'short', 
          day: 'numeric', 
          hour: '2-digit' 
        }),
        duration: hour.duration.length > 0 
          ? hour.duration.reduce((sum: number, val: number) => sum + val, 0) / hour.duration.length 
          : 0,
        success: hour.success.length > 0 
          ? hour.success.reduce((sum: number, val: number) => sum + val, 0) / hour.success.length 
          : 0
      }));

      setPerformanceData(chartData);
    }
  };

  const loadUsageCharts = async () => {
    // Simular dados de uso baseado em métricas reais
    const { data } = await supabase
      .from('system_metrics')
      .select('timestamp, metric_value, metric_name')
      .in('metric_name', ['active_users', 'reports_generated_24h'])
      .gte('timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('timestamp', { ascending: true });

    if (data) {
      // Agrupar por dia
      const dailyData = data.reduce((acc: any, item) => {
        const day = new Date(item.timestamp).toISOString().slice(0, 10);
        if (!acc[day]) {
          acc[day] = { timestamp: day, users: [], reports: [] };
        }
        
        if (item.metric_name === 'active_users') {
          acc[day].users.push(item.metric_value);
        } else if (item.metric_name === 'reports_generated_24h') {
          acc[day].reports.push(item.metric_value);
        }
        
        return acc;
      }, {});

      const chartData = Object.values(dailyData).map((day: any) => ({
        date: new Date(day.timestamp).toLocaleDateString('pt-BR', { 
          month: 'short', 
          day: 'numeric' 
        }),
        users: day.users.length > 0 
          ? Math.max(...day.users) 
          : 0,
        reports: day.reports.length > 0 
          ? day.reports.reduce((sum: number, val: number) => sum + val, 0) 
          : 0
      }));

      setUsageData(chartData);
    }
  };

  const loadQueueCharts = async () => {
    const { data } = await supabase
      .from('system_metrics')
      .select('timestamp, metric_value, metric_name')
      .in('metric_name', ['queue_pending_tasks', 'queue_processing_tasks', 'queue_completed_tasks'])
      .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('timestamp', { ascending: true });

    if (data) {
      // Agrupar por hora
      const hourlyData = data.reduce((acc: any, item) => {
        const hour = new Date(item.timestamp).toISOString().slice(0, 13);
        if (!acc[hour]) {
          acc[hour] = { timestamp: hour, pending: 0, processing: 0, completed: 0 };
        }
        
        if (item.metric_name === 'queue_pending_tasks') {
          acc[hour].pending = Math.max(acc[hour].pending, item.metric_value);
        } else if (item.metric_name === 'queue_processing_tasks') {
          acc[hour].processing = Math.max(acc[hour].processing, item.metric_value);
        } else if (item.metric_name === 'queue_completed_tasks') {
          acc[hour].completed += item.metric_value;
        }
        
        return acc;
      }, {});

      const chartData = Object.values(hourlyData).map((hour: any) => ({
        date: new Date(hour.timestamp).toLocaleTimeString('pt-BR', { 
          hour: '2-digit',
          minute: '2-digit'
        }),
        pending: hour.pending,
        processing: hour.processing,
        completed: hour.completed
      }));

      setQueueData(chartData);
    }
  };

  const loadAlerts = async () => {
    const { data } = await supabase
      .from('performance_alerts')
      .select('*')
      .eq('is_resolved', false)
      .order('created_at', { ascending: false })
      .limit(10);

    setAlerts(data || []);
  };

  const collectMetrics = async () => {
    setLoading('collect', true);
    try {
      const { data, error } = await supabase.functions.invoke('metrics-collector');
      
      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Métricas coletadas com sucesso"
      });

      await loadAnalyticsData();
    } catch (error) {
      logger.error('Erro ao coletar métricas do sistema', error, 'AnalyticsDashboard');
      toast({
        title: "Erro",
        description: "Falha ao coletar métricas",
        variant: "destructive"
      });
    } finally {
      setLoading('collect', false);
    }
  };

  const aggregateMetrics = (metricsData: any[]) => {
    return metricsData.reduce((acc: any, metric) => {
      if (!acc[metric.metric_name]) {
        acc[metric.metric_name] = 0;
      }
      
      // Para counters, somar; para gauges, usar o último valor
      if (metric.metric_name.includes('total') || metric.metric_name.includes('count')) {
        acc[metric.metric_name] += metric.metric_value;
      } else {
        acc[metric.metric_name] = metric.metric_value;
      }
      
      return acc;
    }, {});
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-50';
      case 'high':
        return 'text-orange-600 bg-orange-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-blue-600 bg-blue-50';
    }
  };

  if (isLoading('analytics')) {
    return <LoadingSpinner size="lg" text="Carregando analytics..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header com ações */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Monitoramento de performance e métricas do sistema
          </p>
        </div>
        <Button 
          onClick={collectMetrics}
          disabled={isLoading('collect')}
          variant="outline"
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          Coletar Métricas
        </Button>
      </div>

      {/* Métricas principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.name}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                <Icon className={`h-4 w-4 ${metric.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.current.toLocaleString()}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  {getTrendIcon(metric.trend)}
                  <span className="ml-1">
                    {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}% vs anterior
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Alertas ativos */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
              Alertas Ativos ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.slice(0, 5).map((alert) => (
                <div 
                  key={alert.id}
                  className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{alert.message}</p>
                      <p className="text-sm opacity-75">
                        {alert.metric_name} - {new Date(alert.created_at).toLocaleString()}
                      </p>
                    </div>
                    <span className="text-xs font-medium uppercase">
                      {alert.severity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="usage">Uso do Sistema</TabsTrigger>
          <TabsTrigger value="queue">Fila de Processamento</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Duração Média de Automação</CardTitle>
                <CardDescription>Tempo médio de execução em segundos</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="duration" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Taxa de Sucesso</CardTitle>
                <CardDescription>Percentual de automações bem-sucedidas</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="success" 
                      stroke="hsl(var(--chart-2))" 
                      fill="hsl(var(--chart-2))"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Usuários Ativos</CardTitle>
                <CardDescription>Número de usuários ativos por dia</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={usageData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="users" fill="hsl(var(--chart-1))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Relatórios Gerados</CardTitle>
                <CardDescription>Número de relatórios gerados por dia</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={usageData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="reports" 
                      stroke="hsl(var(--chart-3))" 
                      fill="hsl(var(--chart-3))"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="queue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Status da Fila de Processamento</CardTitle>
              <CardDescription>Estado das tarefas ao longo do tempo</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={queueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="pending" 
                    stackId="1"
                    stroke="hsl(var(--chart-1))" 
                    fill="hsl(var(--chart-1))"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="processing" 
                    stackId="1"
                    stroke="hsl(var(--chart-2))" 
                    fill="hsl(var(--chart-2))"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="completed" 
                    stackId="1"
                    stroke="hsl(var(--chart-3))" 
                    fill="hsl(var(--chart-3))"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}