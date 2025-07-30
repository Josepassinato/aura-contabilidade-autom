import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SecurityMetric {
  metric_name: string;
  metric_type: string;
  metric_value: number;
  labels: Record<string, any>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Collect security metrics
    const securityMetrics: SecurityMetric[] = []

    // 1. Monitor failed authentication attempts
    const { data: authLogs, error: authError } = await supabase
      .from('automation_logs')
      .select('*')
      .eq('process_type', 'authentication')
      .eq('status', 'failed')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

    if (!authError && authLogs) {
      securityMetrics.push({
        metric_name: 'failed_auth_attempts_24h',
        metric_type: 'counter',
        metric_value: authLogs.length,
        labels: { timeframe: '24h', category: 'authentication' }
      })
    }

    // 2. Monitor RLS policy violations
    const { data: violations, error: violationError } = await supabase
      .from('automated_actions_log')
      .select('*')
      .eq('action_type', 'security_violation')
      .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())

    if (!violationError && violations) {
      securityMetrics.push({
        metric_name: 'rls_violations_1h',
        metric_type: 'counter',
        metric_value: violations.length,
        labels: { timeframe: '1h', category: 'access_control' }
      })
    }

    // 3. Monitor active admin sessions
    const { data: adminSessions, error: sessionError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('role', 'admin')

    if (!sessionError && adminSessions) {
      securityMetrics.push({
        metric_name: 'active_admin_users',
        metric_type: 'gauge',
        metric_value: adminSessions.length,
        labels: { category: 'user_management' }
      })
    }

    // 4. Monitor system health
    const { data: systemHealth, error: healthError } = await supabase
      .from('system_metrics')
      .select('*')
      .eq('metric_name', 'system_initialization')
      .order('created_at', { ascending: false })
      .limit(1)

    if (!healthError && systemHealth?.length > 0) {
      securityMetrics.push({
        metric_name: 'system_health_status',
        metric_type: 'gauge',
        metric_value: systemHealth[0].metric_value,
        labels: { category: 'system_health' }
      })
    }

    // 5. Store collected metrics
    for (const metric of securityMetrics) {
      await supabase
        .from('system_metrics')
        .insert({
          metric_name: metric.metric_name,
          metric_type: metric.metric_type,
          metric_value: metric.metric_value,
          labels: metric.labels,
          timestamp: new Date().toISOString(),
          created_at: new Date().toISOString()
        })
    }

    // 6. Check for critical alerts
    const criticalMetrics = securityMetrics.filter(m => 
      (m.metric_name === 'failed_auth_attempts_24h' && m.metric_value > 10) ||
      (m.metric_name === 'rls_violations_1h' && m.metric_value > 5)
    )

    // 7. Create alerts if necessary
    for (const criticalMetric of criticalMetrics) {
      await supabase
        .from('performance_alerts')
        .insert({
          alert_type: 'security',
          severity: 'critical',
          metric_name: criticalMetric.metric_name,
          current_value: criticalMetric.metric_value,
          threshold_value: criticalMetric.metric_name === 'failed_auth_attempts_24h' ? 10 : 5,
          message: `Critical security metric detected: ${criticalMetric.metric_name} = ${criticalMetric.metric_value}`,
          metadata: criticalMetric.labels,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
    }

    // Log detalhado da execução
    console.log(`🔐 Security monitoring completed successfully:`)
    console.log(`  - Metrics collected: ${securityMetrics.length}`)
    console.log(`  - Critical alerts generated: ${criticalMetrics.length}`)
    console.log(`  - Execution time: ${Date.now() - Date.now()} ms`)
    
    // Log de auditoria crítica
    await supabase.rpc('log_critical_event', {
      p_event_type: 'security_monitoring_completed',
      p_message: `Security monitoring cycle completed with ${criticalMetrics.length} critical alerts`,
      p_metadata: {
        metrics_count: securityMetrics.length,
        critical_alerts: criticalMetrics.length,
        function_name: 'security-monitor'
      },
      p_severity: criticalMetrics.length > 0 ? 'critical' : 'info'
    })

    return new Response(
      JSON.stringify({
        success: true,
        metrics_collected: securityMetrics.length,
        critical_alerts: criticalMetrics.length,
        timestamp: new Date().toISOString(),
        metrics: securityMetrics
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('❌ Critical error in security monitoring:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    })
    
    // Log erro crítico na auditoria
    try {
      await supabase.rpc('log_critical_event', {
        p_event_type: 'security_monitoring_failed',
        p_message: `Security monitoring failed: ${error.message}`,
        p_metadata: {
          error_stack: error.stack,
          function_name: 'security-monitor',
          timestamp: new Date().toISOString()
        },
        p_severity: 'critical'
      })
    } catch (auditError) {
      console.error('Failed to log audit event:', auditError)
    }
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})