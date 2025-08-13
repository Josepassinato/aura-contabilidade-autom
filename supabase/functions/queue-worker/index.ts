import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WorkerConfig {
  workerId: string;
  functionName: string;
  maxConcurrentTasks: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { 
      workerId = `worker-${crypto.randomUUID()}`,
      functionName = 'queue-worker',
      maxConcurrentTasks = 3,
      action = 'process'
    } = await req.json();

    console.log(`Worker ${workerId} iniciado - ação: ${action}`);

    if (action === 'register') {
      // REGISTRAR WORKER
      const { error: registerError } = await supabase
        .from('worker_instances')
        .upsert({
          worker_id: workerId,
          function_name: functionName,
          status: 'idle',
          max_concurrent_tasks: maxConcurrentTasks,
          current_task_count: 0,
          last_heartbeat: new Date().toISOString(),
          metadata: {
            started_at: new Date().toISOString(),
            version: '1.0.0'
          }
        });

      if (registerError) {
        console.error('Erro ao registrar worker:', registerError);
        throw registerError;
      }

      return new Response(JSON.stringify({
        success: true,
        workerId,
        message: 'Worker registrado com sucesso'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'heartbeat') {
      // ENVIAR HEARTBEAT
      const { error: heartbeatError } = await supabase
        .from('worker_instances')
        .update({
          last_heartbeat: new Date().toISOString()
        })
        .eq('worker_id', workerId);

      if (heartbeatError) {
        console.error('Erro no heartbeat:', heartbeatError);
        throw heartbeatError;
      }

      return new Response(JSON.stringify({
        success: true,
        message: 'Heartbeat enviado'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'process') {
      // PROCESSAR TAREFAS
      let tasksProcessed = 0;
      const maxIterations = 10; // Evitar loops infinitos

      for (let i = 0; i < maxIterations; i++) {
        // Buscar próxima tarefa
        const taskResult = await supabase.rpc('process_queue_item', {
          p_worker_id: workerId
        });

        if (taskResult.error) {
          console.error('Erro ao buscar tarefa:', taskResult.error);
          break;
        }

        if (!taskResult.data?.success) {
          console.log('Nenhuma tarefa disponível:', taskResult.data?.message || taskResult.data?.error);
          break;
        }

        const task = taskResult.data.task;
        console.log(`Processando tarefa ${task.id} do tipo ${task.task_type}`);

        let success = false;
        let result = {};
        let errorDetails = null;

        try {
          // EXECUTAR TAREFA BASEADO NO TIPO
          switch (task.task_type) {
            case 'bank_ingest':
              result = await executeBankIngest(task.payload, supabaseUrl, supabaseKey);
              success = true;
              break;

            case 'sefaz_scrape':
              result = await executeSefazScrape(task.payload, supabaseUrl, supabaseKey);
              success = true;
              break;

            case 'reconciliation':
              result = await executeReconciliation(task.payload, supabaseUrl, supabaseKey);
              success = true;
              break;

            case 'report_generation':
              result = await executeReportGeneration(task.payload, supabaseUrl, supabaseKey);
              success = true;
              break;

            default:
              throw new Error(`Tipo de tarefa não suportado: ${task.task_type}`);
          }

          console.log(`Tarefa ${task.id} executada com sucesso`);
          tasksProcessed++;

        } catch (error) {
          console.error(`Erro na execução da tarefa ${task.id}:`, error);
          success = false;
          errorDetails = {
            message: error.message,
            stack: error.stack
          };
        }

        // MARCAR TAREFA COMO COMPLETA
        const completeResult = await supabase.rpc('complete_queue_task', {
          p_task_id: task.id,
          p_worker_id: workerId,
          p_success: success,
          p_result: result,
          p_error_details: errorDetails
        });

        if (completeResult.error) {
          console.error('Erro ao completar tarefa:', completeResult.error);
        }

        // ENVIAR HEARTBEAT
        await supabase
          .from('worker_instances')
          .update({
            last_heartbeat: new Date().toISOString()
          })
          .eq('worker_id', workerId);
      }

      return new Response(JSON.stringify({
        success: true,
        tasksProcessed,
        workerId
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error(`Ação não suportada: ${action}`);

  } catch (error) {
    console.error('Erro no queue worker:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// EXECUTORES DE TAREFAS
async function executeBankIngest(payload: any, supabaseUrl: string, supabaseKey: string) {
  const response = await fetch(`${supabaseUrl}/functions/v1/bank-ingest`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return await response.json();
}

async function executeSefazScrape(payload: any, supabaseUrl: string, supabaseKey: string) {
  const response = await fetch(`${supabaseUrl}/functions/v1/scrape-sefaz`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return await response.json();
}

async function executeReconciliation(payload: any, supabaseUrl: string, supabaseKey: string) {
  const response = await fetch(`${supabaseUrl}/functions/v1/automatic-bank-reconciliation`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return await response.json();
}

async function executeReportGeneration(payload: any, supabaseUrl: string, supabaseKey: string) {
  // Simulação - seria integração com geração de relatórios
  return {
    report_id: crypto.randomUUID(),
    status: 'generated',
    url: `/reports/${payload.client_id}/report.pdf`
  };
}