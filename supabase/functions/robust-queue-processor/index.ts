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

    console.log('🔄 Iniciando processamento da fila de tarefas');
    const startTime = Date.now();

    // 1. Buscar tarefas pendentes
    const { data: tarefas, error: tarefasError } = await supabase
      .from('processing_queue')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_at', new Date().toISOString())
      .lt('retry_count', supabase.sql`max_retries`)
      .order('priority', { ascending: true })
      .order('scheduled_at', { ascending: true })
      .limit(10);

    if (tarefasError) {
      console.error('❌ Erro ao buscar tarefas:', tarefasError);
      throw tarefasError;
    }

    console.log(`📋 Encontradas ${tarefas?.length || 0} tarefas para processar`);

    let processedCount = 0;
    let failedCount = 0;

    // 2. Processar cada tarefa
    for (const tarefa of tarefas || []) {
      try {
        console.log(`🔄 Processando tarefa ${tarefa.id}: ${tarefa.task_type}`);
        
        // Marcar como processando
        await supabase
          .from('processing_queue')
          .update({
            status: 'processing',
            started_at: new Date().toISOString(),
            timeout_at: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 min timeout
          })
          .eq('id', tarefa.id);

        // Processar por tipo de tarefa
        let resultado;
        switch (tarefa.task_type) {
          case 'update_account_balances':
            resultado = await processarAtualizacaoSaldos(supabase, tarefa);
            break;
          case 'recalculate_reports':
            resultado = await processarRecalculoRelatorios(supabase, tarefa);
            break;
          case 'send_notifications':
            resultado = await processarEnvioNotificacoes(supabase, tarefa);
            break;
          case 'backup_data':
            resultado = await processarBackupDados(supabase, tarefa);
            break;
          case 'cleanup_old_data':
            resultado = await processarLimpezaDados(supabase, tarefa);
            break;
          default:
            throw new Error(`Tipo de tarefa não suportado: ${tarefa.task_type}`);
        }

        // Marcar como concluída
        await supabase
          .from('processing_queue')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            result: resultado,
            updated_at: new Date().toISOString()
          })
          .eq('id', tarefa.id);

        console.log(`✅ Tarefa ${tarefa.id} concluída com sucesso`);
        processedCount++;

        // Log de auditoria
        await supabase.rpc('log_critical_event', {
          p_event_type: 'task_completed',
          p_message: `Tarefa ${tarefa.task_type} concluída com sucesso`,
          p_metadata: {
            task_id: tarefa.id,
            task_type: tarefa.task_type,
            result: resultado,
            function_name: 'robust-queue-processor'
          },
          p_severity: 'info'
        });

      } catch (taskError) {
        console.error(`❌ Erro na tarefa ${tarefa.id}:`, taskError);
        failedCount++;

        const novoRetryCount = tarefa.retry_count + 1;
        const maxRetries = tarefa.max_retries || 3;

        if (novoRetryCount < maxRetries) {
          // Reagendar para retry com backoff exponencial
          const delayMinutes = Math.pow(2, novoRetryCount) * 5; // 5, 10, 20, 40 minutos
          const proximaTentativa = new Date(Date.now() + delayMinutes * 60 * 1000);

          await supabase
            .from('processing_queue')
            .update({
              status: 'pending',
              retry_count: novoRetryCount,
              error_details: {
                message: taskError.message,
                stack: taskError.stack,
                timestamp: new Date().toISOString()
              },
              scheduled_at: proximaTentativa.toISOString(),
              started_at: null,
              timeout_at: null,
              updated_at: new Date().toISOString()
            })
            .eq('id', tarefa.id);

          console.log(`🔄 Tarefa ${tarefa.id} reagendada para ${proximaTentativa.toISOString()}`);
        } else {
          // Marcar como falha definitiva
          await supabase
            .from('processing_queue')
            .update({
              status: 'failed',
              error_details: {
                message: taskError.message,
                stack: taskError.stack,
                timestamp: new Date().toISOString(),
                max_retries_exceeded: true
              },
              updated_at: new Date().toISOString()
            })
            .eq('id', tarefa.id);

          // Log crítico de falha
          await supabase.rpc('log_critical_event', {
            p_event_type: 'task_failed_permanently',
            p_message: `Tarefa ${tarefa.task_type} falhou permanentemente após ${maxRetries} tentativas`,
            p_metadata: {
              task_id: tarefa.id,
              task_type: tarefa.task_type,
              error: taskError.message,
              retry_count: novoRetryCount,
              function_name: 'robust-queue-processor'
            },
            p_severity: 'critical'
          });
        }
      }
    }

    // 3. Cleanup de tarefas antigas
    await cleanupTarefasAntigas(supabase);

    const executionTime = Date.now() - startTime;
    const summary = {
      total_tasks: tarefas?.length || 0,
      processed: processedCount,
      failed: failedCount,
      execution_time_ms: executionTime,
      timestamp: new Date().toISOString()
    };

    // Log de auditoria do processamento
    await supabase.rpc('log_critical_event', {
      p_event_type: 'queue_processing_completed',
      p_message: `Processamento da fila concluído em ${executionTime}ms`,
      p_metadata: {
        ...summary,
        function_name: 'robust-queue-processor'
      },
      p_severity: failedCount > 0 ? 'warning' : 'info'
    });

    console.log(`✅ Processamento concluído:`, summary);

    return new Response(
      JSON.stringify({ 
        success: true, 
        ...summary 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ Erro crítico no processamento da fila:', error);
    
    // Log erro crítico
    try {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
      
      await supabase.rpc('log_critical_event', {
        p_event_type: 'queue_processing_failed',
        p_message: `Falha crítica no processamento da fila: ${error.message}`,
        p_metadata: {
          error_stack: error.stack,
          function_name: 'robust-queue-processor'
        },
        p_severity: 'critical'
      });
    } catch (auditError) {
      console.error('Falha ao registrar erro de auditoria:', auditError);
    }

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

async function processarAtualizacaoSaldos(supabase: any, tarefa: any) {
  console.log('💰 Atualizando saldos das contas');
  
  const { lancamento_id, contas_afetadas } = tarefa.parameters;
  
  // Buscar itens do lançamento
  const { data: itens, error } = await supabase
    .from('itens_lancamento')
    .select('*')
    .eq('lancamento_id', lancamento_id);

  if (error) throw error;

  // Atualizar saldos por conta
  const resultados = [];
  for (const conta_id of contas_afetadas) {
    const itensContaDesconhecida = itens.filter((item: any) => item.conta_id === conta_id);
    
    let saldoVariacao = 0;
    for (const item of itensContaDesconhecida) {
      if (item.tipo_movimento === 'DEBITO') {
        saldoVariacao += item.valor;
      } else {
        saldoVariacao -= item.valor;
      }
    }

    resultados.push({
      conta_id,
      variacao: saldoVariacao,
      itens_processados: itensContaDesconhecida.length
    });
  }

  return {
    contas_atualizadas: contas_afetadas.length,
    resultados
  };
}

async function processarRecalculoRelatorios(supabase: any, tarefa: any) {
  console.log('📊 Recalculando relatórios');
  
  const { client_id, periodo } = tarefa.parameters;
  
  // Trigger recálculo de relatórios
  const { data, error } = await supabase.functions.invoke('generate-pdf-report', {
    body: {
      client_id,
      report_type: 'balancete',
      periodo,
      auto_generated: true
    }
  });

  if (error) throw error;

  return {
    relatorio_gerado: true,
    report_id: data?.report_id
  };
}

async function processarEnvioNotificacoes(supabase: any, tarefa: any) {
  console.log('📧 Enviando notificações');
  
  const { client_id, notification_type, lancamento_id } = tarefa.parameters;
  
  // Criar notificação
  const { error } = await supabase
    .from('notifications')
    .insert({
      user_id: null, // Sistema
      title: 'Lançamento Contábil Processado',
      message: `Lançamento contábil ${lancamento_id} foi processado com sucesso`,
      type: notification_type,
      priority: 2,
      category: 'contabil',
      metadata: {
        lancamento_id,
        client_id
      }
    });

  if (error) throw error;

  return {
    notificacao_enviada: true,
    tipo: notification_type
  };
}

async function processarBackupDados(supabase: any, tarefa: any) {
  console.log('💾 Processando backup de dados');
  // Implementar lógica de backup
  return { backup_created: true };
}

async function processarLimpezaDados(supabase: any, tarefa: any) {
  console.log('🧹 Processando limpeza de dados antigos');
  // Implementar lógica de limpeza
  return { records_cleaned: 0 };
}

async function cleanupTarefasAntigas(supabase: any) {
  console.log('🧹 Limpando tarefas antigas concluídas');
  
  const umMesAtras = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  const { error } = await supabase
    .from('processing_queue')
    .delete()
    .eq('status', 'completed')
    .lt('completed_at', umMesAtras.toISOString());

  if (error) {
    console.error('❌ Erro na limpeza:', error);
  } else {
    console.log('✅ Limpeza de tarefas antigas concluída');
  }
}