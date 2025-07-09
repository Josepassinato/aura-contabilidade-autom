import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { handleError } from '@/services/errorHandlingService';

export interface PerformanceMetric {
  id: string;
  function_name: string;
  execution_time_ms: number;
  memory_usage_mb: number;
  cpu_usage_percent: number;
  error_rate: number;
  throughput_per_second: number;
  timestamp: string;
  metadata: any;
}

export interface WorkerInstance {
  id: string;
  worker_id: string;
  function_name: string;
  status: string;
  current_task_id?: string;
  max_concurrent_tasks: number;
  current_task_count: number;
  last_heartbeat: string;
  metadata: any;
}

export interface ProcessingQueue {
  id: string;
  client_id: string;
  process_type: string;
  priority: number;
  status: string;
  retry_count: number;
  max_retries: number;
  worker_id?: string;
  scheduled_at: string;
  started_at?: string;
  completed_at?: string;
  parameters: any;
  result?: any;
  error_details?: any;
}

export interface PerformanceStats {
  total_functions: number;
  average_response_time: number;
  total_errors: number;
  total_throughput: number;
  active_workers: number;
  queue_length: number;
  success_rate: number;
  cpu_usage_avg: number;
  memory_usage_avg: number;
}

export function usePerformanceMonitoring() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [workers, setWorkers] = useState<WorkerInstance[]>([]);
  const [queue, setQueue] = useState<ProcessingQueue[]>([]);
  const [stats, setStats] = useState<PerformanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<any[]>([]);

  // Buscar métricas de performance
  const fetchMetrics = async (timeframe: string = '24h') => {
    try {
      const { data, error } = await supabase
        .from('performance_metrics')
        .select('*')
        .gte('timestamp', getTimeframeDate(timeframe))
        .order('timestamp', { ascending: false })
        .limit(500);

      if (error) throw error;
      setMetrics((data || []) as PerformanceMetric[]);
    } catch (error) {
      handleError(error, 'usePerformanceMonitoring.fetchMetrics');
    }
  };

  // Buscar workers ativos
  const fetchWorkers = async () => {
    try {
      const { data, error } = await supabase
        .from('worker_instances')
        .select('*')
        .order('last_heartbeat', { ascending: false });

      if (error) throw error;
      setWorkers((data || []) as WorkerInstance[]);
    } catch (error) {
      handleError(error, 'usePerformanceMonitoring.fetchWorkers');
    }
  };

  // Buscar fila de processamento
  const fetchQueue = async () => {
    try {
      const { data, error } = await supabase
        .from('processing_queue')
        .select(`
          *,
          accounting_clients (name)
        `)
        .in('status', ['pending', 'processing'])
        .order('priority', { ascending: true })
        .order('scheduled_at', { ascending: true })
        .limit(100);

      if (error) throw error;
      setQueue((data || []) as ProcessingQueue[]);
    } catch (error) {
      handleError(error, 'usePerformanceMonitoring.fetchQueue');
    }
  };

  // Calcular estatísticas
  const calculateStats = (
    metricsData: PerformanceMetric[],
    workersData: WorkerInstance[],
    queueData: ProcessingQueue[]
  ): PerformanceStats => {
    if (metricsData.length === 0) {
      return {
        total_functions: 0,
        average_response_time: 0,
        total_errors: 0,
        total_throughput: 0,
        active_workers: workersData.filter(w => w.status !== 'offline').length,
        queue_length: queueData.length,
        success_rate: 0,
        cpu_usage_avg: 0,
        memory_usage_avg: 0
      };
    }

    const functionNames = new Set(metricsData.map(m => m.function_name));
    const avgResponseTime = metricsData.reduce((sum, m) => sum + m.execution_time_ms, 0) / metricsData.length;
    const totalErrors = metricsData.reduce((sum, m) => sum + (m.error_rate * 100), 0);
    const totalThroughput = metricsData.reduce((sum, m) => sum + m.throughput_per_second, 0);
    const avgErrorRate = metricsData.reduce((sum, m) => sum + m.error_rate, 0) / metricsData.length;
    const avgCpuUsage = metricsData.reduce((sum, m) => sum + m.cpu_usage_percent, 0) / metricsData.length;
    const avgMemoryUsage = metricsData.reduce((sum, m) => sum + m.memory_usage_mb, 0) / metricsData.length;

    return {
      total_functions: functionNames.size,
      average_response_time: avgResponseTime,
      total_errors: Math.round(totalErrors),
      total_throughput: totalThroughput,
      active_workers: workersData.filter(w => w.status !== 'offline').length,
      queue_length: queueData.length,
      success_rate: Math.round((1 - avgErrorRate) * 100),
      cpu_usage_avg: avgCpuUsage,
      memory_usage_avg: avgMemoryUsage
    };
  };

  // Coletar métricas via edge function
  const collectMetrics = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('performance-monitor', {
        body: { action: 'collect_metrics' }
      });

      if (error) throw error;
      
      // Atualizar dados após coleta
      await Promise.all([fetchMetrics(), fetchWorkers(), fetchQueue()]);
      
      return data;
    } catch (error) {
      handleError(error, 'usePerformanceMonitoring.collectMetrics');
      return null;
    }
  };

  // Analisar performance
  const analyzePerformance = async (timeframe: string = '24h') => {
    try {
      const { data, error } = await supabase.functions.invoke('performance-monitor', {
        body: { action: 'analyze_performance', timeframe }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error, 'usePerformanceMonitoring.analyzePerformance');
      return null;
    }
  };

  // Verificar alertas
  const checkAlerts = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('performance-monitor', {
        body: { action: 'check_alerts' }
      });

      if (error) throw error;
      setAlerts(data?.alerts || []);
      return data;
    } catch (error) {
      handleError(error, 'usePerformanceMonitoring.checkAlerts');
      return null;
    }
  };

  // Otimizar banco de dados
  const optimizeDatabase = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('performance-monitor', {
        body: { action: 'optimize_database' }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error, 'usePerformanceMonitoring.optimizeDatabase');
      return null;
    }
  };

  // Processar em lote otimizado
  const processBatchOptimized = async (clientIds: string[], month: number, year: number, maxConcurrency: number = 5) => {
    try {
      const { data, error } = await supabase.functions.invoke('process-batch-closing-optimized', {
        body: { clientIds, month, year, maxConcurrency }
      });

      if (error) throw error;
      
      // Atualizar dados após processamento
      await Promise.all([fetchMetrics(), fetchWorkers(), fetchQueue()]);
      
      return data;
    } catch (error) {
      handleError(error, 'usePerformanceMonitoring.processBatchOptimized');
      return null;
    }
  };

  // Cleanup de workers offline
  const cleanupOfflineWorkers = async () => {
    try {
      const { data, error } = await supabase.rpc('cleanup_offline_workers');
      if (error) throw error;
      
      await fetchWorkers();
      return data;
    } catch (error) {
      handleError(error, 'usePerformanceMonitoring.cleanupOfflineWorkers');
      return 0;
    }
  };

  // Arquivar dados antigos
  const archiveOldData = async () => {
    try {
      const { data, error } = await supabase.rpc('archive_old_data');
      if (error) throw error;
      
      return data;
    } catch (error) {
      handleError(error, 'usePerformanceMonitoring.archiveOldData');
      return null;
    }
  };

  // Funções auxiliares
  const getTimeframeDate = (timeframe: string): string => {
    const now = new Date();
    switch (timeframe) {
      case '1h': return new Date(now.getTime() - 60 * 60 * 1000).toISOString();
      case '24h': return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      case '7d': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      case '30d': return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      default: return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    }
  };

  const getMetricsByFunction = (functionName: string): PerformanceMetric[] => {
    return metrics.filter(m => m.function_name === functionName);
  };

  const getFunctionHealthScore = (functionName: string): number => {
    const functionMetrics = getMetricsByFunction(functionName);
    if (functionMetrics.length === 0) return 0;

    const avgLatency = functionMetrics.reduce((sum, m) => sum + m.execution_time_ms, 0) / functionMetrics.length;
    const avgErrorRate = functionMetrics.reduce((sum, m) => sum + m.error_rate, 0) / functionMetrics.length;
    
    // Score de 0-100 baseado em latência e taxa de erro
    const latencyScore = Math.max(0, 100 - (avgLatency / 1000)); // Penalizar latência alta
    const errorScore = Math.max(0, 100 - (avgErrorRate * 100)); // Penalizar taxa de erro alta
    
    return Math.round((latencyScore + errorScore) / 2);
  };

  // Setup realtime subscription
  useEffect(() => {
    const subscription = supabase
      .channel('performance_monitoring')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'performance_metrics'
        },
        () => {
          fetchMetrics();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'worker_instances'
        },
        () => {
          fetchWorkers();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'processing_queue'
        },
        () => {
          fetchQueue();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  // Carregar dados iniciais
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchMetrics(),
        fetchWorkers(),
        fetchQueue()
      ]);
      setLoading(false);
    };

    loadData();

    // Auto-refresh a cada 30 segundos
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Calcular stats quando dados mudam
  useEffect(() => {
    const newStats = calculateStats(metrics, workers, queue);
    setStats(newStats);
  }, [metrics, workers, queue]);

  return {
    metrics,
    workers,
    queue,
    stats,
    alerts,
    loading,
    
    // Actions
    collectMetrics,
    analyzePerformance,
    checkAlerts,
    optimizeDatabase,
    processBatchOptimized,
    cleanupOfflineWorkers,
    archiveOldData,
    
    // Utils
    getMetricsByFunction,
    getFunctionHealthScore,
    refetch: () => Promise.all([fetchMetrics(), fetchWorkers(), fetchQueue()])
  };
}