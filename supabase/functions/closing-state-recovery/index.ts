import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RecoveryRequest {
  action: 'recover_stuck_closings' | 'retry_failed_operations' | 'cleanup_orphaned_data';
  closing_id?: string;
  max_age_hours?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const request: RecoveryRequest = await req.json();

    switch (request.action) {
      case 'recover_stuck_closings':
        return await recoverStuckClosings(supabase, request.max_age_hours || 2);
      
      case 'retry_failed_operations':
        return await retryFailedOperations(supabase, request.closing_id);
      
      case 'cleanup_orphaned_data':
        return await cleanupOrphanedData(supabase);
      
      default:
        return new Response(
          JSON.stringify({ error: 'Action not supported' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

  } catch (error) {
    console.error('Error in closing-state-recovery:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function recoverStuckClosings(supabase: any, maxAgeHours: number) {
  console.log(`Recovering closings stuck for more than ${maxAgeHours} hours...`);

  const cutoffTime = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000).toISOString();

  // Buscar fechamentos que estão "in_progress" há muito tempo sem atividade
  const { data: stuckClosings } = await supabase
    .from('monthly_closing_status')
    .select(`
      id, client_id, period_month, period_year, status, started_at, last_activity,
      accounting_clients (name)
    `)
    .eq('status', 'in_progress')
    .lt('last_activity', cutoffTime);

  if (!stuckClosings || stuckClosings.length === 0) {
    return new Response(
      JSON.stringify({ 
        message: 'No stuck closings found',
        recovered_count: 0 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const recoveryResults = [];

  for (const closing of stuckClosings) {
    try {
      console.log(`Recovering closing ${closing.id} for client ${closing.accounting_clients?.name}`);

      // Verificar se há checklist items em progresso
      const { data: activeItems } = await supabase
        .from('closing_checklist_items')
        .select('id, item_name, status')
        .eq('closing_id', closing.id)
        .in('status', ['in_progress']);

      let recoveryAction = 'reset_to_pending';
      const recoveryDetails: any = {
        closing_id: closing.id,
        client_name: closing.accounting_clients?.name,
        stuck_since: closing.last_activity,
        active_items_count: activeItems?.length || 0
      };

      // Se há itens ativos, tentar recuperá-los
      if (activeItems && activeItems.length > 0) {
        for (const item of activeItems) {
          // Marcar itens órfãos como failed com mensagem explicativa
          await supabase
            .from('closing_checklist_items')
            .update({
              status: 'failed',
              error_message: `Item recovery: process was stuck for ${maxAgeHours}+ hours`,
              completed_at: new Date().toISOString()
            })
            .eq('id', item.id);
        }
        
        recoveryAction = 'failed_items_reset';
        recoveryDetails.failed_items = activeItems.map(i => i.item_name);
      }

      // Verificar progresso atual
      const { data: completedItems } = await supabase
        .from('closing_checklist_items')
        .select('id')
        .eq('closing_id', closing.id)
        .eq('status', 'completed');

      const { data: totalItems } = await supabase
        .from('closing_checklist_items')
        .select('id')
        .eq('closing_id', closing.id);

      const completedCount = completedItems?.length || 0;
      const totalCount = totalItems?.length || 0;
      const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

      let newStatus = 'pending';
      
      if (progressPercentage >= 80) {
        newStatus = 'review'; // Se quase completo, marcar para revisão manual
        recoveryAction = 'marked_for_review';
      } else if (progressPercentage > 0) {
        newStatus = 'pending'; // Resetar para permitir restart
        recoveryAction = 'reset_with_progress';
      }

      // Atualizar status do fechamento
      await supabase
        .from('monthly_closing_status')
        .update({
          status: newStatus,
          last_activity: new Date().toISOString(),
          blocking_issues: [
            ...(closing.blocking_issues || []),
            {
              type: 'recovery',
              description: `Recovered from stuck state after ${maxAgeHours}+ hours`,
              timestamp: new Date().toISOString(),
              action_taken: recoveryAction
            }
          ]
        })
        .eq('id', closing.id);

      // Criar notificação para o responsável
      await supabase.functions.invoke('smart-notification-manager', {
        body: {
          action: 'create_notification',
          user_id: closing.assigned_to || 'system', // Se não há responsável, enviar para sistema
          title: 'Fechamento Recuperado de Estado Inconsistente',
          message: `O fechamento de ${closing.accounting_clients?.name} (${closing.period_month}/${closing.period_year}) foi recuperado automaticamente após ${maxAgeHours}+ horas sem atividade.`,
          type: 'warning',
          priority: 2,
          category: 'closing',
          source_id: closing.id,
          source_type: 'closing_status',
          metadata: recoveryDetails
        }
      });

      // Log da recovery
      await supabase
        .from('automated_actions_log')
        .insert({
          client_id: closing.client_id,
          action_type: 'closing_state_recovery',
          description: `Recovered stuck closing: ${recoveryAction}`,
          metadata: recoveryDetails,
          success: true
        });

      recoveryResults.push({
        closing_id: closing.id,
        client_name: closing.accounting_clients?.name,
        action: recoveryAction,
        new_status: newStatus,
        progress_percentage: Math.round(progressPercentage)
      });

    } catch (error) {
      console.error(`Failed to recover closing ${closing.id}:`, error);
      
      recoveryResults.push({
        closing_id: closing.id,
        client_name: closing.accounting_clients?.name,
        action: 'failed',
        error: error.message
      });
    }
  }

  console.log(`Recovered ${recoveryResults.filter(r => r.action !== 'failed').length} out of ${stuckClosings.length} stuck closings`);

  return new Response(
    JSON.stringify({ 
      message: `Recovery completed`,
      total_found: stuckClosings.length,
      recovered_count: recoveryResults.filter(r => r.action !== 'failed').length,
      failed_count: recoveryResults.filter(r => r.action === 'failed').length,
      results: recoveryResults
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function retryFailedOperations(supabase: any, closingId?: string) {
  console.log('Retrying failed operations...');

  let query = supabase
    .from('closing_checklist_items')
    .select(`
      id, closing_id, item_name, error_message, metadata,
      monthly_closing_status (
        id, client_id, 
        accounting_clients (name)
      )
    `)
    .eq('status', 'failed');

  if (closingId) {
    query = query.eq('closing_id', closingId);
  }

  const { data: failedItems } = await query;

  if (!failedItems || failedItems.length === 0) {
    return new Response(
      JSON.stringify({ 
        message: 'No failed operations to retry',
        retried_count: 0 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const retryResults = [];

  for (const item of failedItems) {
    try {
      console.log(`Retrying failed item: ${item.item_name}`);

      // Verificar se o erro é "retryable"
      const isRetryable = isErrorRetryable(item.error_message);
      
      if (!isRetryable) {
        retryResults.push({
          item_id: item.id,
          item_name: item.item_name,
          action: 'skipped_non_retryable',
          reason: 'Error not suitable for automatic retry'
        });
        continue;
      }

      // Resetar item para pending com metadata de retry
      const retryMetadata = {
        ...(item.metadata || {}),
        retry_count: ((item.metadata?.retry_count || 0) + 1),
        previous_error: item.error_message,
        retried_at: new Date().toISOString()
      };

      // Não retry se já foi tentado muitas vezes
      if (retryMetadata.retry_count > 3) {
        retryResults.push({
          item_id: item.id,
          item_name: item.item_name,
          action: 'max_retries_exceeded',
          retry_count: retryMetadata.retry_count
        });
        continue;
      }

      await supabase
        .from('closing_checklist_items')
        .update({
          status: 'pending',
          error_message: null,
          started_at: null,
          completed_at: null,
          metadata: retryMetadata
        })
        .eq('id', item.id);

      // Atualizar último activity do fechamento
      await supabase
        .from('monthly_closing_status')
        .update({
          last_activity: new Date().toISOString()
        })
        .eq('id', item.closing_id);

      retryResults.push({
        item_id: item.id,
        item_name: item.item_name,
        action: 'reset_for_retry',
        retry_count: retryMetadata.retry_count
      });

    } catch (error) {
      console.error(`Failed to retry item ${item.id}:`, error);
      
      retryResults.push({
        item_id: item.id,
        item_name: item.item_name,
        action: 'retry_failed',
        error: error.message
      });
    }
  }

  const successCount = retryResults.filter(r => r.action === 'reset_for_retry').length;
  console.log(`Reset ${successCount} failed operations for retry`);

  return new Response(
    JSON.stringify({ 
      message: `Retry operation completed`,
      total_found: failedItems.length,
      retried_count: successCount,
      results: retryResults
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function cleanupOrphanedData(supabase: any) {
  console.log('Cleaning up orphaned data...');

  const cleanupResults = [];

  // 1. Checklist items sem closing parent
  const { data: orphanedItems } = await supabase
    .from('closing_checklist_items')
    .select('id, closing_id')
    .not('closing_id', 'in', 
      supabase
        .from('monthly_closing_status')
        .select('id')
    );

  if (orphanedItems && orphanedItems.length > 0) {
    const { error } = await supabase
      .from('closing_checklist_items')
      .delete()
      .in('id', orphanedItems.map(item => item.id));

    if (!error) {
      cleanupResults.push({
        type: 'orphaned_checklist_items',
        count: orphanedItems.length,
        action: 'deleted'
      });
    }
  }

  // 2. Closings muito antigos em pending sem atividade
  const oldCutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(); // 90 dias
  
  const { data: staleClosings } = await supabase
    .from('monthly_closing_status')
    .select('id')
    .eq('status', 'pending')
    .lt('created_at', oldCutoff)
    .is('started_at', null);

  if (staleClosings && staleClosings.length > 0) {
    // Marcar como expired ao invés de deletar
    const { error } = await supabase
      .from('monthly_closing_status')
      .update({
        status: 'expired',
        last_activity: new Date().toISOString(),
        blocking_issues: [{
          type: 'cleanup',
          description: 'Marked as expired due to 90+ days without activity',
          timestamp: new Date().toISOString()
        }]
      })
      .in('id', staleClosings.map(c => c.id));

    if (!error) {
      cleanupResults.push({
        type: 'stale_closings',
        count: staleClosings.length,
        action: 'marked_expired'
      });
    }
  }

  // 3. Notificações antigas já lidas
  const { data: oldNotifications } = await supabase
    .from('notifications')
    .select('id')
    .eq('is_read', true)
    .lt('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // 30 dias

  if (oldNotifications && oldNotifications.length > 0) {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .in('id', oldNotifications.map(n => n.id));

    if (!error) {
      cleanupResults.push({
        type: 'old_read_notifications',
        count: oldNotifications.length,
        action: 'deleted'
      });
    }
  }

  console.log(`Cleanup completed:`, cleanupResults);

  return new Response(
    JSON.stringify({ 
      message: 'Cleanup completed',
      results: cleanupResults,
      total_cleaned: cleanupResults.reduce((sum, r) => sum + r.count, 0)
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

function isErrorRetryable(errorMessage: string | null): boolean {
  if (!errorMessage) return false;

  const retryablePatterns = [
    'timeout',
    'connection',
    'network',
    'temporary',
    'rate limit',
    'server error',
    '500',
    '502',
    '503',
    '504'
  ];

  const nonRetryablePatterns = [
    'validation',
    'authentication',
    'permission',
    'not found',
    '400',
    '401',
    '403',
    '404',
    'invalid data',
    'missing required'
  ];

  const message = errorMessage.toLowerCase();

  // Se é explicitamente não retryable, não tentar
  if (nonRetryablePatterns.some(pattern => message.includes(pattern))) {
    return false;
  }

  // Se é explicitamente retryable, tentar
  if (retryablePatterns.some(pattern => message.includes(pattern))) {
    return true;
  }

  // Por padrão, não retry para evitar loops infinitos
  return false;
}