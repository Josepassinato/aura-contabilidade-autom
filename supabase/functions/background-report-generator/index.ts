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

    console.log('🔄 Iniciando worker de background para relatórios');

    const workerId = `bg-report-worker-${Date.now()}`;
    
    // Registrar worker
    await supabase.functions.invoke('queue-processor', {
      body: { action: 'register_worker', workerId }
    });

    let running = true;
    let processedCount = 0;

    // Loop principal do worker
    while (running && processedCount < 10) { // Limite para evitar timeouts
      try {
        // Buscar próxima tarefa
        const { data: taskResponse } = await supabase.functions.invoke('queue-processor', {
          body: { action: 'get_task', workerId }
        });

        if (!taskResponse?.success || !taskResponse?.task) {
          console.log('📋 Nenhuma tarefa na fila, aguardando...');
          await new Promise(resolve => setTimeout(resolve, 5000));
          continue;
        }

        const task = taskResponse.task;
        console.log(`📊 Processando tarefa: ${task.id} (${task.process_type})`);

        let result = null;
        let success = true;
        let error = null;

        try {
          switch (task.process_type) {
            case 'generate_report':
              result = await processReportGeneration(supabase, task);
              break;
            
            case 'send_scheduled_emails':
              result = await processScheduledEmails(supabase, task);
              break;
            
            case 'data_analysis':
              result = await processDataAnalysis(supabase, task);
              break;
            
            case 'cleanup_old_data':
              result = await processDataCleanup(supabase, task);
              break;
            
            default:
              throw new Error(`Tipo de processo não suportado: ${task.process_type}`);
          }
        } catch (processError) {
          console.error(`❌ Erro ao processar tarefa ${task.id}:`, processError);
          success = false;
          error = processError.message;
        }

        // Marcar tarefa como completa
        await supabase.functions.invoke('queue-processor', {
          body: {
            action: success ? 'complete_task' : 'fail_task',
            taskId: task.id,
            workerId,
            result,
            error
          }
        });

        processedCount++;
        
        // Enviar heartbeat
        await supabase.functions.invoke('queue-processor', {
          body: { action: 'heartbeat', workerId }
        });

      } catch (error) {
        console.error('❌ Erro no loop do worker:', error);
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
    }

    console.log(`🎯 Worker finalizado. Tarefas processadas: ${processedCount}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: processedCount,
        workerId 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erro no worker de background:', error);
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

async function processReportGeneration(supabase: any, task: any) {
  const { reportType, clientId, templateId, parameters } = task.parameters;
  
  console.log(`📊 Gerando relatório: ${reportType} para cliente ${clientId}`);
  
  // Invocar função de geração de relatório
  const { data, error } = await supabase.functions.invoke('generate-pdf-report', {
    body: {
      reportType,
      clientId,
      templateId,
      parameters: { ...parameters, automated: true, background: true },
      sendEmail: parameters.sendEmail || false,
      clientEmail: parameters.clientEmail
    }
  });

  if (error) throw new Error(`Erro na geração do relatório: ${error.message}`);

  return {
    reportId: data?.reportId,
    downloadUrl: data?.downloadUrl,
    emailSent: data?.emailSent
  };
}

async function processScheduledEmails(supabase: any, task: any) {
  const { emailType, recipients, templateData } = task.parameters;
  
  console.log(`📧 Enviando emails: ${emailType} para ${recipients.length} destinatários`);
  
  let sentCount = 0;
  let failedCount = 0;

  for (const recipient of recipients) {
    try {
      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          to: recipient.email,
          subject: templateData.subject,
          html: generateEmailContent(emailType, recipient, templateData)
        }
      });

      if (error) throw error;
      sentCount++;
    } catch (error) {
      console.error(`❌ Erro ao enviar email para ${recipient.email}:`, error);
      failedCount++;
    }
  }

  return { sentCount, failedCount, totalRecipients: recipients.length };
}

async function processDataAnalysis(supabase: any, task: any) {
  const { analysisType, clientId, dateRange } = task.parameters;
  
  console.log(`📈 Executando análise: ${analysisType} para cliente ${clientId}`);
  
  // Executar análise baseada no tipo
  switch (analysisType) {
    case 'monthly_summary':
      return await generateMonthlySummary(supabase, clientId, dateRange);
    
    case 'performance_trends':
      return await analyzePerformanceTrends(supabase, clientId, dateRange);
    
    case 'anomaly_detection':
      return await detectAnomalies(supabase, clientId, dateRange);
    
    default:
      throw new Error(`Tipo de análise não suportado: ${analysisType}`);
  }
}

async function processDataCleanup(supabase: any, task: any) {
  const { cleanupType, retentionDays } = task.parameters;
  
  console.log(`🧹 Executando limpeza: ${cleanupType} (retenção: ${retentionDays} dias)`);
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
  
  let deletedCount = 0;
  
  switch (cleanupType) {
    case 'old_logs':
      const { count } = await supabase
        .from('automation_logs')
        .delete()
        .lt('created_at', cutoffDate.toISOString());
      deletedCount = count || 0;
      break;
    
    case 'temp_files':
      // Limpeza de arquivos temporários seria implementada aqui
      deletedCount = 0;
      break;
  }

  return { deletedCount, cleanupType, cutoffDate };
}

function generateEmailContent(emailType: string, recipient: any, templateData: any): string {
  // Template básico para emails
  return `
    <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>${templateData.subject}</h2>
        <p>Olá ${recipient.name || recipient.email},</p>
        <div>${templateData.body}</div>
        <footer style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; color: #666;">
          <p>Esta é uma mensagem automática do sistema.</p>
        </footer>
      </body>
    </html>
  `;
}

async function generateMonthlySummary(supabase: any, clientId: string, dateRange: any) {
  // Implementar análise mensal
  return { analysisType: 'monthly_summary', summary: 'Análise concluída' };
}

async function analyzePerformanceTrends(supabase: any, clientId: string, dateRange: any) {
  // Implementar análise de tendências
  return { analysisType: 'performance_trends', trends: [] };
}

async function detectAnomalies(supabase: any, clientId: string, dateRange: any) {
  // Implementar detecção de anomalias
  return { analysisType: 'anomaly_detection', anomalies: [] };
}