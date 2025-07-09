import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { processId } = await req.json();

    if (!processId) {
      return new Response(
        JSON.stringify({ error: 'Process ID is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`Retrying automation process: ${processId}`);

    // Buscar informações do processo original
    const { data: originalProcess, error: fetchError } = await supabase
      .from('automation_logs')
      .select('*')
      .eq('id', processId)
      .single();

    if (fetchError || !originalProcess) {
      console.error('Error fetching original process:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Process not found' }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Criar novo log de automação para o retry
    const { data: newProcess, error: insertError } = await supabase
      .from('automation_logs')
      .insert({
        client_id: originalProcess.client_id,
        process_type: originalProcess.process_type,
        status: 'running',
        metadata: {
          ...originalProcess.metadata,
          retry_of: processId,
          retry_attempt: (originalProcess.metadata?.retry_attempt || 0) + 1
        }
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating retry process:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to create retry process' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Simular reinício do processo baseado no tipo
    let success = false;
    let errorMessage = '';

    try {
      switch (originalProcess.process_type) {
        case 'document_classification':
          // Simular reclassificação de documento
          await new Promise(resolve => setTimeout(resolve, 2000));
          success = Math.random() > 0.3; // 70% de chance de sucesso
          if (!success) {
            errorMessage = 'Falha na reclassificação do documento';
          }
          break;

        case 'data_ingestion':
          // Simular nova ingestão de dados
          await new Promise(resolve => setTimeout(resolve, 1500));
          success = Math.random() > 0.2; // 80% de chance de sucesso
          if (!success) {
            errorMessage = 'Falha na ingestão de dados';
          }
          break;

        case 'bank_reconciliation':
          // Simular nova tentativa de reconciliação
          await new Promise(resolve => setTimeout(resolve, 3000));
          success = Math.random() > 0.25; // 75% de chance de sucesso
          if (!success) {
            errorMessage = 'Falha na reconciliação bancária';
          }
          break;

        default:
          // Processo genérico
          await new Promise(resolve => setTimeout(resolve, 1000));
          success = Math.random() > 0.4; // 60% de chance de sucesso
          if (!success) {
            errorMessage = 'Falha no processo automatizado';
          }
      }

      // Atualizar status do processo
      const { error: updateError } = await supabase
        .from('automation_logs')
        .update({
          status: success ? 'completed' : 'failed',
          completed_at: new Date().toISOString(),
          error_details: success ? null : { message: errorMessage },
          records_processed: success ? Math.floor(Math.random() * 100) + 1 : 0
        })
        .eq('id', newProcess.id);

      if (updateError) {
        console.error('Error updating process status:', updateError);
      }

      // Se bem-sucedido, marcar o processo original como resolvido
      if (success) {
        await supabase
          .from('automation_logs')
          .update({
            metadata: {
              ...originalProcess.metadata,
              resolved_by_retry: newProcess.id,
              resolved_at: new Date().toISOString()
            }
          })
          .eq('id', processId);

        // Log da ação
        await supabase
          .from('automated_actions_log')
          .insert({
            client_id: originalProcess.client_id,
            action_type: 'process_retry_success',
            description: `Processo ${originalProcess.process_type} foi reiniciado com sucesso`,
            metadata: {
              original_process_id: processId,
              retry_process_id: newProcess.id,
              process_type: originalProcess.process_type
            },
            success: true
          });
      } else {
        // Log da falha no retry
        await supabase
          .from('automated_actions_log')
          .insert({
            client_id: originalProcess.client_id,
            action_type: 'process_retry_failed',
            description: `Falha ao reiniciar processo ${originalProcess.process_type}`,
            metadata: {
              original_process_id: processId,
              retry_process_id: newProcess.id,
              process_type: originalProcess.process_type,
              error: errorMessage
            },
            success: false,
            error_message: errorMessage
          });
      }

    } catch (error) {
      console.error('Error during process retry:', error);
      
      // Marcar como falho
      await supabase
        .from('automation_logs')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          error_details: { message: 'Erro interno durante retry' }
        })
        .eq('id', newProcess.id);

      success = false;
      errorMessage = 'Erro interno durante retry';
    }

    return new Response(
      JSON.stringify({
        success,
        processId: newProcess.id,
        message: success 
          ? 'Processo reiniciado com sucesso'
          : `Falha no retry: ${errorMessage}`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: success ? 200 : 500
      }
    );

  } catch (error) {
    console.error('Error in retry-automation-process function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});