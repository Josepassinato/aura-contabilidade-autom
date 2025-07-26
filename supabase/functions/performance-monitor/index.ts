import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PerformanceMetric {
  metric_type: string;
  metric_name: string;
  metric_value: number;
  labels: Record<string, any>;
  timestamp: string;
}

interface SystemHealth {
  overall_status: 'healthy' | 'warning' | 'critical';
  components: {
    database: { status: string; response_time: number; };
    queue: { status: string; pending_tasks: number; failed_rate: number; };
    workers: { status: string; active_count: number; avg_response_time: number; };
    automation: { status: string; success_rate: number; error_rate: number; };
  };
  alerts: any[];
}

serve(async (req: Request) => {
  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  // Handle WebSocket connections for real-time monitoring
  if (upgradeHeader.toLowerCase() === "websocket") {
    return handleWebSocketConnection(req);
  }

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'health_check';

    switch (action) {
      case 'health_check':
        return await handleHealthCheck(supabase);
      
      case 'collect_metrics':
        return await handleMetricsCollection(supabase);
      
      case 'performance_report':
        return await handlePerformanceReport(supabase);
      
      case 'system_optimization':
        return await handleSystemOptimization(supabase);
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    console.error('Performance Monitor error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
});

async function handleWebSocketConnection(req: Request): Promise<Response> {
  const { socket, response } = Deno.upgradeWebSocket(req);
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  let monitoringInterval: number;

  socket.onopen = () => {
    console.log('WebSocket connection opened for performance monitoring');
    
    // Send initial health check
    sendHealthUpdate(socket, supabase);
    
    // Start monitoring interval
    monitoringInterval = setInterval(() => {
      sendHealthUpdate(socket, supabase);
    }, 5000); // Update every 5 seconds
  };

  socket.onmessage = async (event) => {
    try {
      const message = JSON.parse(event.data);
      
      switch (message.type) {
        case 'request_metrics':
          await sendMetricsUpdate(socket, supabase);
          break;
        
        case 'request_alerts':
          await sendAlertsUpdate(socket, supabase);
          break;
        
        case 'optimize_system':
          await performSystemOptimization(socket, supabase);
          break;
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
      socket.send(JSON.stringify({ 
        type: 'error', 
        message: error.message 
      }));
    }
  };

  socket.onclose = () => {
    console.log('WebSocket connection closed');
    if (monitoringInterval) {
      clearInterval(monitoringInterval);
    }
  };

  return response;
}

async function sendHealthUpdate(socket: WebSocket, supabase: any) {
  try {
    const healthData = await getSystemHealth(supabase);
    socket.send(JSON.stringify({
      type: 'health_update',
      data: healthData,
      timestamp: new Date().toISOString()
    }));
  } catch (error) {
    console.error('Error sending health update:', error);
  }
}

async function sendMetricsUpdate(socket: WebSocket, supabase: any) {
  try {
    const metrics = await collectPerformanceMetrics(supabase);
    socket.send(JSON.stringify({
      type: 'metrics_update',
      data: metrics,
      timestamp: new Date().toISOString()
    }));
  } catch (error) {
    console.error('Error sending metrics update:', error);
  }
}

async function sendAlertsUpdate(socket: WebSocket, supabase: any) {
  try {
    const alerts = await getActiveAlerts(supabase);
    socket.send(JSON.stringify({
      type: 'alerts_update',
      data: alerts,
      timestamp: new Date().toISOString()
    }));
  } catch (error) {
    console.error('Error sending alerts update:', error);
  }
}

async function handleHealthCheck(supabase: any): Promise<Response> {
  const healthData = await getSystemHealth(supabase);
  
  return new Response(
    JSON.stringify(healthData),
    {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    }
  );
}

async function getSystemHealth(supabase: any): Promise<SystemHealth> {
  const startTime = Date.now();
  
  // Database health check
  const dbStartTime = Date.now();
  const { data: dbTest, error: dbError } = await supabase
    .from('automation_rules')
    .select('count')
    .limit(1)
    .single();
  const dbResponseTime = Date.now() - dbStartTime;

  // Queue health check
  const { data: queueMetrics } = await supabase
    .from('processing_queue')
    .select('status')
    .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString());

  const pendingTasks = queueMetrics?.filter(q => q.status === 'pending').length || 0;
  const failedTasks = queueMetrics?.filter(q => q.status === 'failed').length || 0;
  const totalTasks = queueMetrics?.length || 1;
  const failedRate = (failedTasks / totalTasks) * 100;

  // Workers health check
  const { data: workers } = await supabase
    .from('worker_instances')
    .select('*')
    .gte('last_heartbeat', new Date(Date.now() - 5 * 60 * 1000).toISOString());

  const activeWorkers = workers?.length || 0;

  // Automation health check
  const { data: automationLogs } = await supabase
    .from('automation_logs')
    .select('status')
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  const successfulRuns = automationLogs?.filter(log => log.status === 'completed').length || 0;
  const failedRuns = automationLogs?.filter(log => log.status === 'failed').length || 0;
  const totalRuns = automationLogs?.length || 1;
  const successRate = (successfulRuns / totalRuns) * 100;
  const errorRate = (failedRuns / totalRuns) * 100;

  // Determine overall status
  let overallStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
  const alerts = [];

  if (dbError || dbResponseTime > 1000) {
    overallStatus = 'critical';
    alerts.push({
      level: 'critical',
      message: 'Database performance degraded',
      details: { response_time: dbResponseTime, error: dbError?.message }
    });
  }

  if (failedRate > 20) {
    overallStatus = overallStatus === 'critical' ? 'critical' : 'warning';
    alerts.push({
      level: 'warning',
      message: 'High queue failure rate',
      details: { failed_rate: failedRate, pending_tasks: pendingTasks }
    });
  }

  if (activeWorkers === 0) {
    overallStatus = 'critical';
    alerts.push({
      level: 'critical',
      message: 'No active workers detected',
      details: { active_workers: activeWorkers }
    });
  }

  if (errorRate > 15) {
    overallStatus = overallStatus === 'critical' ? 'critical' : 'warning';
    alerts.push({
      level: 'warning',
      message: 'High automation error rate',
      details: { error_rate: errorRate, success_rate: successRate }
    });
  }

  return {
    overall_status: overallStatus,
    components: {
      database: {
        status: dbError ? 'error' : (dbResponseTime > 500 ? 'warning' : 'healthy'),
        response_time: dbResponseTime
      },
      queue: {
        status: failedRate > 10 ? 'warning' : 'healthy',
        pending_tasks: pendingTasks,
        failed_rate: failedRate
      },
      workers: {
        status: activeWorkers === 0 ? 'error' : 'healthy',
        active_count: activeWorkers,
        avg_response_time: 0 // TODO: Calculate from metrics
      },
      automation: {
        status: errorRate > 10 ? 'warning' : 'healthy',
        success_rate: successRate,
        error_rate: errorRate
      }
    },
    alerts
  };
}

async function handleMetricsCollection(supabase: any): Promise<Response> {
  const metrics = await collectPerformanceMetrics(supabase);
  
  // Store metrics in database
  const metricsToInsert: PerformanceMetric[] = [];
  const timestamp = new Date().toISOString();

  Object.entries(metrics).forEach(([category, categoryMetrics]) => {
    Object.entries(categoryMetrics as Record<string, any>).forEach(([metricName, value]) => {
      if (typeof value === 'number') {
        metricsToInsert.push({
          metric_type: category,
          metric_name: metricName,
          metric_value: value,
          labels: { category },
          timestamp
        });
      }
    });
  });

  if (metricsToInsert.length > 0) {
    const { error } = await supabase
      .from('system_metrics')
      .insert(metricsToInsert);

    if (error) {
      console.error('Error storing metrics:', error);
    }
  }

  return new Response(
    JSON.stringify({ success: true, metrics_collected: metricsToInsert.length }),
    {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    }
  );
}

async function collectPerformanceMetrics(supabase: any): Promise<Record<string, any>> {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Queue metrics
  const { data: queueData } = await supabase
    .from('processing_queue')
    .select('status, created_at, completed_at, started_at')
    .gte('created_at', oneHourAgo.toISOString());

  const queueMetrics = {
    total_tasks: queueData?.length || 0,
    pending_tasks: queueData?.filter(q => q.status === 'pending').length || 0,
    processing_tasks: queueData?.filter(q => q.status === 'processing').length || 0,
    completed_tasks: queueData?.filter(q => q.status === 'completed').length || 0,
    failed_tasks: queueData?.filter(q => q.status === 'failed').length || 0,
    avg_processing_time: calculateAverageProcessingTime(queueData || [])
  };

  // Automation metrics
  const { data: automationData } = await supabase
    .from('automation_logs')
    .select('status, duration_seconds, records_processed, created_at')
    .gte('created_at', oneDayAgo.toISOString());

  const automationMetrics = {
    total_executions: automationData?.length || 0,
    successful_executions: automationData?.filter(a => a.status === 'completed').length || 0,
    failed_executions: automationData?.filter(a => a.status === 'failed').length || 0,
    avg_execution_time: calculateAverageExecutionTime(automationData || []),
    total_records_processed: automationData?.reduce((sum, a) => sum + (a.records_processed || 0), 0) || 0
  };

  // Worker metrics
  const { data: workerData } = await supabase
    .from('worker_instances')
    .select('*');

  const activeWorkers = workerData?.filter(w => {
    const lastHeartbeat = new Date(w.last_heartbeat);
    return (now.getTime() - lastHeartbeat.getTime()) < 5 * 60 * 1000;
  }) || [];

  const workerMetrics = {
    total_workers: workerData?.length || 0,
    active_workers: activeWorkers.length,
    idle_workers: activeWorkers.filter(w => w.status === 'idle').length,
    busy_workers: activeWorkers.filter(w => w.status === 'busy').length,
    total_task_capacity: activeWorkers.reduce((sum, w) => sum + w.max_concurrent_tasks, 0),
    current_task_load: activeWorkers.reduce((sum, w) => sum + w.current_task_count, 0)
  };

  return {
    queue: queueMetrics,
    automation: automationMetrics,
    workers: workerMetrics,
    system: {
      timestamp: now.toISOString(),
      uptime: Date.now() // TODO: Calculate actual uptime
    }
  };
}

function calculateAverageProcessingTime(tasks: any[]): number {
  const completedTasks = tasks.filter(t => t.completed_at && t.started_at);
  if (completedTasks.length === 0) return 0;

  const totalTime = completedTasks.reduce((sum, task) => {
    const start = new Date(task.started_at).getTime();
    const end = new Date(task.completed_at).getTime();
    return sum + (end - start);
  }, 0);

  return Math.round(totalTime / completedTasks.length / 1000); // Return in seconds
}

function calculateAverageExecutionTime(executions: any[]): number {
  const completedExecutions = executions.filter(e => e.duration_seconds);
  if (completedExecutions.length === 0) return 0;

  const totalTime = completedExecutions.reduce((sum, exec) => sum + exec.duration_seconds, 0);
  return Math.round(totalTime / completedExecutions.length);
}

async function getActiveAlerts(supabase: any): Promise<any[]> {
  // Check for system alerts based on recent performance
  const alerts = [];
  const metrics = await collectPerformanceMetrics(supabase);

  // Queue alerts
  if (metrics.queue.pending_tasks > 100) {
    alerts.push({
      id: 'queue-overload',
      level: 'warning',
      title: 'Queue Overload',
      message: `${metrics.queue.pending_tasks} tasks pending in queue`,
      timestamp: new Date().toISOString()
    });
  }

  if (metrics.queue.failed_tasks > metrics.queue.total_tasks * 0.2) {
    alerts.push({
      id: 'high-failure-rate',
      level: 'critical',
      title: 'High Failure Rate',
      message: `${((metrics.queue.failed_tasks / metrics.queue.total_tasks) * 100).toFixed(1)}% task failure rate`,
      timestamp: new Date().toISOString()
    });
  }

  // Worker alerts
  if (metrics.workers.active_workers === 0) {
    alerts.push({
      id: 'no-workers',
      level: 'critical',
      title: 'No Active Workers',
      message: 'All workers are offline, tasks will not be processed',
      timestamp: new Date().toISOString()
    });
  }

  // Automation alerts
  if (metrics.automation.failed_executions > metrics.automation.total_executions * 0.15) {
    alerts.push({
      id: 'automation-errors',
      level: 'warning',
      title: 'High Automation Error Rate',
      message: `${((metrics.automation.failed_executions / metrics.automation.total_executions) * 100).toFixed(1)}% automation failure rate`,
      timestamp: new Date().toISOString()
    });
  }

  return alerts;
}

async function handlePerformanceReport(supabase: any): Promise<Response> {
  const metrics = await collectPerformanceMetrics(supabase);
  const health = await getSystemHealth(supabase);
  const alerts = await getActiveAlerts(supabase);

  const report = {
    generated_at: new Date().toISOString(),
    health_status: health.overall_status,
    performance_metrics: metrics,
    active_alerts: alerts,
    recommendations: generateRecommendations(metrics, health)
  };

  return new Response(
    JSON.stringify(report),
    {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    }
  );
}

function generateRecommendations(metrics: any, health: SystemHealth): string[] {
  const recommendations = [];

  if (metrics.queue.pending_tasks > 50) {
    recommendations.push('Consider scaling up worker instances to handle queue load');
  }

  if (metrics.workers.active_workers < 2) {
    recommendations.push('Deploy additional worker instances for redundancy');
  }

  if (health.components.database.response_time > 500) {
    recommendations.push('Database queries are slow, consider optimizing indexes');
  }

  if (metrics.automation.failed_executions > 5) {
    recommendations.push('Review failed automation rules and fix configuration issues');
  }

  return recommendations;
}

async function handleSystemOptimization(supabase: any): Promise<Response> {
  const optimizations = await performSystemOptimization(null, supabase);
  
  return new Response(
    JSON.stringify(optimizations),
    {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    }
  );
}

async function performSystemOptimization(socket: WebSocket | null, supabase: any): Promise<any> {
  const optimizations = [];

  try {
    // Cleanup old metrics
    const { error: cleanupError } = await supabase
      .from('system_metrics')
      .delete()
      .lt('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    if (!cleanupError) {
      optimizations.push({ 
        action: 'cleanup_old_metrics', 
        status: 'success',
        description: 'Removed metrics older than 7 days'
      });
    }

    // Cleanup old logs
    const { error: logsCleanupError } = await supabase
      .from('automation_logs')
      .delete()
      .lt('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .eq('status', 'completed');

    if (!logsCleanupError) {
      optimizations.push({ 
        action: 'cleanup_old_logs', 
        status: 'success',
        description: 'Removed completed logs older than 30 days'
      });
    }

    // Reset stuck tasks
    const { error: resetError } = await supabase
      .from('processing_queue')
      .update({ 
        status: 'pending',
        worker_id: null,
        started_at: null,
        timeout_at: null
      })
      .eq('status', 'processing')
      .lt('timeout_at', new Date().toISOString());

    if (!resetError) {
      optimizations.push({ 
        action: 'reset_stuck_tasks', 
        status: 'success',
        description: 'Reset timed out tasks to pending'
      });
    }

    // Update worker heartbeats
    await supabase.rpc('cleanup_offline_workers');
    optimizations.push({ 
      action: 'cleanup_workers', 
      status: 'success',
      description: 'Cleaned up offline workers'
    });

    if (socket) {
      socket.send(JSON.stringify({
        type: 'optimization_complete',
        data: optimizations,
        timestamp: new Date().toISOString()
      }));
    }

  } catch (error) {
    console.error('Error during system optimization:', error);
    optimizations.push({ 
      action: 'optimization_error', 
      status: 'error',
      description: error.message
    });
  }

  return { optimizations, timestamp: new Date().toISOString() };
}