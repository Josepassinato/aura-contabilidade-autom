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

    console.log('🔄 Iniciando processamento de relatórios agendados');

    // Buscar agendamentos que devem ser executados
    const now = new Date();
    const { data: scheduledReports, error: scheduleError } = await supabase
      .from('scheduled_reports')
      .select(`
        *,
        accounting_clients (id, name, email),
        report_templates (id, name, template_type)
      `)
      .eq('is_active', true)
      .lte('next_run', now.toISOString());

    if (scheduleError) {
      throw new Error(`Erro ao buscar agendamentos: ${scheduleError.message}`);
    }

    if (!scheduledReports || scheduledReports.length === 0) {
      console.log('📋 Nenhum relatório agendado para processamento');
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Nenhum relatório agendado para processamento',
          processed: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let processedCount = 0;
    const results = [];

    for (const schedule of scheduledReports) {
      try {
        console.log(`📊 Processando relatório para cliente: ${schedule.accounting_clients?.name}`);

        // Gerar o relatório
        const { data: reportData, error: reportError } = await supabase.functions.invoke('generate-pdf-report', {
          body: {
            reportType: schedule.report_templates?.template_type,
            clientId: schedule.client_id,
            templateId: schedule.template_id,
            parameters: {
              automated: true,
              scheduled_id: schedule.id
            },
            clientEmail: schedule.email_recipients[0] || schedule.accounting_clients?.email,
            sendEmail: schedule.email_recipients.length > 0
          }
        });

        if (reportError) {
          throw new Error(`Erro ao gerar relatório: ${reportError.message}`);
        }

        // Calcular próxima execução baseado no cron
        const nextRun = calculateNextRun(schedule.schedule_cron);

        // Atualizar agendamento
        const { error: updateError } = await supabase
          .from('scheduled_reports')
          .update({
            last_run: now.toISOString(),
            next_run: nextRun.toISOString(),
            updated_at: now.toISOString()
          })
          .eq('id', schedule.id);

        if (updateError) {
          console.error(`Erro ao atualizar agendamento ${schedule.id}:`, updateError);
        }

        // Log da ação
        await supabase
          .from('automated_actions_log')
          .insert({
            action_type: 'scheduled_report_generated',
            client_id: schedule.client_id,
            description: `Relatório agendado gerado automaticamente: ${schedule.report_templates?.name}`,
            success: true,
            metadata: {
              schedule_id: schedule.id,
              template_type: schedule.report_templates?.template_type,
              report_id: reportData?.reportId,
              emails_sent: schedule.email_recipients.length
            }
          });

        processedCount++;
        results.push({
          scheduleId: schedule.id,
          clientName: schedule.accounting_clients?.name,
          reportType: schedule.report_templates?.template_type,
          success: true
        });

        console.log(`✅ Relatório processado com sucesso para ${schedule.accounting_clients?.name}`);

      } catch (error) {
        console.error(`❌ Erro ao processar agendamento ${schedule.id}:`, error);

        // Log do erro
        await supabase
          .from('automated_actions_log')
          .insert({
            action_type: 'scheduled_report_failed',
            client_id: schedule.client_id,
            description: `Falha na geração de relatório agendado: ${schedule.report_templates?.name}`,
            success: false,
            error_message: error.message,
            metadata: {
              schedule_id: schedule.id,
              template_type: schedule.report_templates?.template_type
            }
          });

        results.push({
          scheduleId: schedule.id,
          clientName: schedule.accounting_clients?.name,
          reportType: schedule.report_templates?.template_type,
          success: false,
          error: error.message
        });
      }
    }

    console.log(`🎯 Processamento concluído: ${processedCount}/${scheduledReports.length} relatórios processados`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processamento concluído: ${processedCount} relatórios gerados`,
        processed: processedCount,
        total: scheduledReports.length,
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erro no processamento de relatórios agendados:', error);
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

function calculateNextRun(cronExpression: string): Date {
  const now = new Date();
  
  // Parser simplificado de cron (formato: minuto hora dia mês dia-semana)
  const parts = cronExpression.split(' ');
  if (parts.length !== 5) {
    // Default: próximo mês, dia 1, 9h
    return new Date(now.getFullYear(), now.getMonth() + 1, 1, 9, 0, 0);
  }

  const [minute, hour, day, month, dayOfWeek] = parts;
  
  // Casos específicos mais comuns
  if (cronExpression === '0 9 1 * *') {
    // Mensal: dia 1 às 9h
    const nextMonth = now.getMonth() + 1;
    const year = nextMonth > 11 ? now.getFullYear() + 1 : now.getFullYear();
    return new Date(year, nextMonth % 12, 1, 9, 0, 0);
  }
  
  if (cronExpression === '0 9 * * 1') {
    // Semanal: segunda-feira às 9h
    const daysUntilMonday = (1 + 7 - now.getDay()) % 7;
    const nextMonday = new Date(now);
    nextMonday.setDate(now.getDate() + (daysUntilMonday || 7));
    nextMonday.setHours(9, 0, 0, 0);
    return nextMonday;
  }
  
  if (cronExpression === '0 9 * * *') {
    // Diário às 9h
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    return tomorrow;
  }
  
  if (cronExpression === '0 18 * * 5') {
    // Semanal: sexta-feira às 18h
    const daysUntilFriday = (5 + 7 - now.getDay()) % 7;
    const nextFriday = new Date(now);
    nextFriday.setDate(now.getDate() + (daysUntilFriday || 7));
    nextFriday.setHours(18, 0, 0, 0);
    return nextFriday;
  }

  // Default: próxima semana
  const nextWeek = new Date(now);
  nextWeek.setDate(now.getDate() + 7);
  nextWeek.setHours(9, 0, 0, 0);
  return nextWeek;
}