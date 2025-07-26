import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pattern_id } = await req.json();
    
    // Inicializar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let result = { success: false, message: '', actions_taken: [] };

    // Aplicar correções baseadas no padrão identificado
    switch (pattern_id) {
      case 'pattern_1':
        // Correção para erros de validação
        result = await fixValidationErrors(supabase);
        break;
        
      case 'pattern_2':
        // Correção para timeouts
        result = await fixTimeoutIssues(supabase);
        break;
        
      default:
        result = {
          success: false,
          message: 'Padrão de erro não reconhecido',
          actions_taken: []
        };
    }

    // Registrar ação de correção
    if (result.success) {
      await supabase
        .from('automated_actions_log')
        .insert({
          action_type: 'auto_fix_applied',
          description: `Correção automática aplicada para padrão ${pattern_id}`,
          metadata: {
            pattern_id,
            actions_taken: result.actions_taken,
            timestamp: new Date().toISOString()
          }
        });
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in apply-auto-fix function:', error);
    
    return new Response(JSON.stringify({
      success: false,
      message: 'Erro interno ao aplicar correção',
      actions_taken: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function fixValidationErrors(supabase: any) {
  try {
    // Buscar registros com falhas de validação recentes
    const { data: failedValidations, error } = await supabase
      .from('automation_logs')
      .select('*')
      .eq('status', 'failed')
      .contains('metadata', { error_type: 'validation' })
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .limit(10);

    if (error) throw error;

    const actions_taken = [];

    // Tentar reprocessar validações que falharam
    for (const log of failedValidations || []) {
      try {
        // Atualizar status para retry
        await supabase
          .from('automation_logs')
          .update({ 
            status: 'retry_scheduled',
            metadata: {
              ...log.metadata,
              auto_fix_applied: true,
              retry_reason: 'Auto-fix validation errors'
            }
          })
          .eq('id', log.id);

        actions_taken.push(`Reagendado processamento para log ${log.id}`);
      } catch (retryError) {
        console.error('Error scheduling retry:', retryError);
      }
    }

    return {
      success: true,
      message: `${actions_taken.length} validações reagendadas para reprocessamento`,
      actions_taken
    };
  } catch (error) {
    console.error('Error fixing validation errors:', error);
    return {
      success: false,
      message: 'Erro ao corrigir falhas de validação',
      actions_taken: []
    };
  }
}

async function fixTimeoutIssues(supabase: any) {
  try {
    // Buscar tarefas que falharam por timeout
    const { data: timeoutTasks, error } = await supabase
      .from('processing_queue')
      .select('*')
      .eq('status', 'failed')
      .contains('error_details', { error_type: 'timeout' })
      .lt('retry_count', 3)
      .limit(5);

    if (error) throw error;

    const actions_taken = [];

    // Reagendar tarefas com timeout estendido
    for (const task of timeoutTasks || []) {
      try {
        await supabase
          .from('processing_queue')
          .update({
            status: 'pending',
            retry_count: task.retry_count + 1,
            scheduled_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutos
            timeout_at: null,
            worker_id: null,
            started_at: null,
            error_details: {
              ...task.error_details,
              auto_fix_applied: true,
              extended_timeout: true
            }
          })
          .eq('id', task.id);

        actions_taken.push(`Reagendado task ${task.id} com timeout estendido`);
      } catch (retryError) {
        console.error('Error rescheduling timeout task:', retryError);
      }
    }

    return {
      success: true,
      message: `${actions_taken.length} tarefas reagendadas com timeout estendido`,
      actions_taken
    };
  } catch (error) {
    console.error('Error fixing timeout issues:', error);
    return {
      success: false,
      message: 'Erro ao corrigir problemas de timeout',
      actions_taken: []
    };
  }
}