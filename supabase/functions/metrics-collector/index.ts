import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('📊 Iniciando coleta de métricas do sistema');

    const metrics = await collectSystemMetrics(supabase);
    const performanceMetrics = await collectPerformanceMetrics(supabase);
    const businessMetrics = await collectBusinessMetrics(supabase);
    
    await storeMetrics(supabase, metrics);
    await checkAlerts(supabase, metrics);

    const summary = {
      system: metrics,
      performance: performanceMetrics,
      business: businessMetrics,
      timestamp: new Date().toISOString()
    };

    console.log('✅ Coleta de métricas concluída');

    return new Response(
      JSON.stringify({ 
        success: true, 
        summary,
        metricsCount: metrics.length + performanceMetrics.length + businessMetrics.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erro na coleta de métricas:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function collectSystemMetrics(supabase: any) {
  const metrics = [];
  const now = new Date();

  // Métricas da fila de processamento
  const { data: queueStats } = await supabase
    .from('processing_queue')
    .select('status')
    .gte('created_at', new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString());

  const queueCounts = queueStats?.reduce((acc: any, item: any) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {}) || {};

  metrics.push(
    { name: 'queue_pending_tasks', value: queueCounts.pending || 0, type: 'gauge' },
    { name: 'queue_processing_tasks', value: queueCounts.processing || 0, type: 'gauge' },
    { name: 'queue_completed_tasks', value: queueCounts.completed || 0, type: 'counter' },
    { name: 'queue_failed_tasks', value: queueCounts.failed || 0, type: 'counter' }
  );

  // Métricas de workers
  const { data: workers } = await supabase
    .from('worker_instances')
    .select('status, current_task_count, max_concurrent_tasks');

  const workerStats = workers?.reduce((acc: any, worker: any) => {
    acc.total++;
    acc[worker.status] = (acc[worker.status] || 0) + 1;
    acc.totalTasks += worker.current_task_count;
    acc.totalCapacity += worker.max_concurrent_tasks;
    return acc;
  }, { total: 0, totalTasks: 0, totalCapacity: 0 }) || { total: 0, totalTasks: 0, totalCapacity: 0 };

  metrics.push(
    { name: 'workers_total', value: workerStats.total, type: 'gauge' },
    { name: 'workers_active', value: workerStats.busy || 0, type: 'gauge' },
    { name: 'workers_idle', value: workerStats.idle || 0, type: 'gauge' },
    { name: 'workers_utilization', value: workerStats.totalCapacity > 0 ? (workerStats.totalTasks / workerStats.totalCapacity) * 100 : 0, type: 'gauge' }
  );

  // Métricas de usuários ativos
  const { data: userStats } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('role', 'client');

  metrics.push(
    { name: 'active_users', value: userStats?.length || 0, type: 'gauge' }
  );

  return metrics;
}

async function collectPerformanceMetrics(supabase: any) {
  const metrics = [];
  const now = new Date();
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Métricas de automação
  const { data: automationStats } = await supabase
    .from('automation_logs')
    .select('status, duration_seconds, records_processed')
    .gte('created_at', last24h.toISOString());

  if (automationStats && automationStats.length > 0) {
    const avgDuration = automationStats.reduce((sum: number, log: any) => 
      sum + (log.duration_seconds || 0), 0) / automationStats.length;
    
    const successRate = (automationStats.filter((log: any) => log.status === 'completed').length / automationStats.length) * 100;

    metrics.push(
      { name: 'automation_avg_duration', value: avgDuration, type: 'gauge' },
      { name: 'automation_success_rate', value: successRate, type: 'gauge' },
      { name: 'automation_total_runs', value: automationStats.length, type: 'counter' }
    );
  }

  // Métricas de relatórios gerados
  const { data: reportStats } = await supabase
    .from('generated_reports')
    .select('generation_status, file_size')
    .gte('created_at', last24h.toISOString());

  if (reportStats && reportStats.length > 0) {
    const completedReports = reportStats.filter((r: any) => r.generation_status === 'completed');
    const avgFileSize = completedReports.reduce((sum: number, r: any) => 
      sum + (r.file_size || 0), 0) / completedReports.length;

    metrics.push(
      { name: 'reports_generated_24h', value: completedReports.length, type: 'counter' },
      { name: 'reports_avg_file_size', value: avgFileSize, type: 'gauge' }
    );
  }

  return metrics;
}

async function collectBusinessMetrics(supabase: any) {
  const metrics = [];
  const now = new Date();
  const last30days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Métricas de clientes
  const { data: clientStats } = await supabase
    .from('accounting_clients')
    .select('status, regime, created_at');

  const activeClients = clientStats?.filter((c: any) => c.status === 'active').length || 0;
  const newClients = clientStats?.filter((c: any) => 
    new Date(c.created_at) >= last30days).length || 0;

  metrics.push(
    { name: 'clients_active', value: activeClients, type: 'gauge' },
    { name: 'clients_new_30d', value: newClients, type: 'counter' }
  );

  // Métricas de documentos
  const { data: docStats } = await supabase
    .from('client_documents')
    .select('status, created_at')
    .gte('created_at', last30days.toISOString());

  const processedDocs = docStats?.filter((d: any) => d.status === 'processado').length || 0;

  metrics.push(
    { name: 'documents_processed_30d', value: processedDocs, type: 'counter' },
    { name: 'documents_total_30d', value: docStats?.length || 0, type: 'counter' }
  );

  return metrics;
}

async function storeMetrics(supabase: any, allMetrics: any[]) {
  const metricsData = allMetrics.map(metric => ({
    metric_name: metric.name,
    metric_value: metric.value,
    metric_type: metric.type,
    labels: metric.labels || {}
  }));

  const { error } = await supabase
    .from('system_metrics')
    .insert(metricsData);

  if (error) {
    console.error('❌ Erro ao armazenar métricas:', error);
  } else {
    console.log(`✅ ${metricsData.length} métricas armazenadas`);
  }
}

async function checkAlerts(supabase: any, metrics: any[]) {
  const alertThresholds = {
    'queue_pending_tasks': { threshold: 100, severity: 'high' },
    'workers_utilization': { threshold: 90, severity: 'medium' },
    'automation_success_rate': { threshold: 95, severity: 'high', invert: true }
  };

  for (const metric of metrics) {
    const threshold = alertThresholds[metric.name as keyof typeof alertThresholds];
    if (!threshold) continue;

    const shouldAlert = threshold.invert 
      ? metric.value < threshold.threshold
      : metric.value > threshold.threshold;

    if (shouldAlert) {
      // Verificar se já existe alerta não resolvido
      const { data: existingAlert } = await supabase
        .from('performance_alerts')
        .select('id')
        .eq('metric_name', metric.name)
        .eq('is_resolved', false)
        .single();

      if (!existingAlert) {
        // Criar novo alerta
        await supabase
          .from('performance_alerts')
          .insert({
            alert_type: 'threshold_exceeded',
            severity: threshold.severity,
            metric_name: metric.name,
            threshold_value: threshold.threshold,
            current_value: metric.value,
            message: `Métrica ${metric.name} ${threshold.invert ? 'abaixo' : 'acima'} do limite: ${metric.value} ${threshold.invert ? '<' : '>'} ${threshold.threshold}`
          });

        console.log(`🚨 Alerta criado para ${metric.name}: ${metric.value}`);
      }
    }
  }
}