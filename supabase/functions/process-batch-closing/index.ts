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

    const { clientIds, month, year } = await req.json();

    console.log(`Starting batch closing for ${clientIds.length} clients - ${month}/${year}`);

    // Atualizar status para em progresso
    await supabase
      .from('monthly_closing_status')
      .update({
        status: 'in_progress',
        started_at: new Date().toISOString(),
        last_activity: new Date().toISOString()
      })
      .in('client_id', clientIds)
      .eq('period_month', month)
      .eq('period_year', year);

    // Simular processamento de cada cliente
    for (const clientId of clientIds) {
      // Buscar checklist items
      const { data: closing } = await supabase
        .from('monthly_closing_status')
        .select('id')
        .eq('client_id', clientId)
        .eq('period_month', month)
        .eq('period_year', year)
        .single();

      if (closing) {
        // Simular progresso das validações
        const { data: checklistItems } = await supabase
          .from('closing_checklist_items')
          .select('id')
          .eq('closing_id', closing.id)
          .eq('status', 'pending');

        // Completar algumas validações automaticamente
        if (checklistItems && checklistItems.length > 0) {
          const itemsToComplete = checklistItems.slice(0, Math.floor(checklistItems.length * 0.6));
          
          for (const item of itemsToComplete) {
            await supabase
              .from('closing_checklist_items')
              .update({
                status: 'completed',
                completed_at: new Date().toISOString(),
                actual_minutes: Math.floor(Math.random() * 20) + 5
              })
              .eq('id', item.id);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Processamento em lote iniciado para ${clientIds.length} cliente(s)` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in process-batch-closing:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});