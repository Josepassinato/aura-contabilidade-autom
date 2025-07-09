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

    const { action, workerId, taskId, result, error: taskError } = await req.json();

    console.log(`🔄 Queue Processor Action: ${action}`, { workerId, taskId });

    switch (action) {
      case 'register_worker':
        return await registerWorker(supabase, workerId);
      
      case 'get_task':
        return await getNextTask(supabase, workerId);
      
      case 'complete_task':
        return await completeTask(supabase, taskId, workerId, true, result);
      
      case 'fail_task':
        return await completeTask(supabase, taskId, workerId, false, null, taskError);
      
      case 'add_task':
        return await addTask(supabase, req);
      
      case 'heartbeat':
        return await updateHeartbeat(supabase, workerId);
      
      default:
        throw new Error(`Ação não reconhecida: ${action}`);
    }

  } catch (error) {
    console.error('❌ Erro no processador de filas:', error);
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

async function registerWorker(supabase: any, workerId: string) {
  // Registrar ou atualizar worker
  const { data, error } = await supabase
    .from('worker_instances')
    .upsert({
      worker_id: workerId,
      status: 'idle',
      current_task_count: 0,
      last_heartbeat: new Date().toISOString(),
      metadata: {
        started_at: new Date().toISOString(),
        version: '1.0.0'
      }
    }, { onConflict: 'worker_id' })
    .select()
    .single();

  if (error) throw error;

  console.log(`✅ Worker registrado: ${workerId}`);
  
  return new Response(
    JSON.stringify({ success: true, worker: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getNextTask(supabase: any, workerId: string) {
  // Usar função do banco para processar próxima tarefa
  const { data, error } = await supabase.rpc('process_queue_item', {
    p_worker_id: workerId
  });

  if (error) throw error;

  if (!data?.success) {
    return new Response(
      JSON.stringify({ success: false, message: data?.message || 'Nenhuma tarefa disponível' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  console.log(`📋 Tarefa atribuída ao worker ${workerId}:`, data.task?.id);

  return new Response(
    JSON.stringify({ success: true, task: data.task }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function completeTask(supabase: any, taskId: string, workerId: string, success: boolean, result?: any, errorDetails?: any) {
  // Usar função do banco para completar tarefa
  const { data, error } = await supabase.rpc('complete_queue_task', {
    p_task_id: taskId,
    p_worker_id: workerId,
    p_success: success,
    p_result: result || {},
    p_error_details: errorDetails || null
  });

  if (error) throw error;

  console.log(`${success ? '✅' : '❌'} Tarefa ${taskId} ${success ? 'completada' : 'falhada'} pelo worker ${workerId}`);

  // Registrar métricas
  await supabase
    .from('system_metrics')
    .insert({
      metric_name: 'queue_task_completed',
      metric_value: 1,
      metric_type: 'counter',
      labels: {
        worker_id: workerId,
        success: success,
        task_id: taskId
      }
    });

  return new Response(
    JSON.stringify({ success: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function addTask(supabase: any, req: Request) {
  const { 
    processType, 
    clientId, 
    priority = 5, 
    parameters = {}, 
    scheduledAt,
    maxRetries = 3 
  } = await req.json();

  const { data, error } = await supabase
    .from('processing_queue')
    .insert({
      process_type: processType,
      client_id: clientId,
      priority,
      parameters,
      scheduled_at: scheduledAt || new Date().toISOString(),
      max_retries: maxRetries
    })
    .select()
    .single();

  if (error) throw error;

  console.log(`📝 Nova tarefa adicionada à fila: ${data.id} (${processType})`);

  // Registrar métrica
  await supabase
    .from('system_metrics')
    .insert({
      metric_name: 'queue_task_added',
      metric_value: 1,
      metric_type: 'counter',
      labels: {
        process_type: processType,
        priority: priority
      }
    });

  return new Response(
    JSON.stringify({ success: true, task: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function updateHeartbeat(supabase: any, workerId: string) {
  const { error } = await supabase
    .from('worker_instances')
    .update({ 
      last_heartbeat: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('worker_id', workerId);

  if (error) throw error;

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}