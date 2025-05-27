
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentAlert {
  alert_id: string;
  client_id: string;
  client_name: string;
  client_email: string;
  alert_type: string;
  payment_due_date: string;
  days_until_due: number;
  alert_sent_date: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== Iniciando processamento de alertas de pagamento ===');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Primeiro, executar a verificação de pagamentos em atraso
    console.log('Executando verificação de pagamentos em atraso...');
    const { error: checkError } = await supabase.rpc('check_overdue_payments');
    
    if (checkError) {
      console.error('Erro ao verificar pagamentos:', checkError);
      throw checkError;
    }

    // Obter alertas pendentes
    console.log('Obtendo alertas pendentes...');
    const { data: pendingAlerts, error: alertsError } = await supabase.rpc('get_pending_payment_alerts');
    
    if (alertsError) {
      console.error('Erro ao obter alertas:', alertsError);
      throw alertsError;
    }

    const alerts = pendingAlerts as PaymentAlert[];
    console.log(`Encontrados ${alerts.length} alertas pendentes`);

    let emailsSent = 0;
    let emailsErrored = 0;

    // Processar cada alerta
    for (const alert of alerts) {
      try {
        console.log(`Processando alerta para ${alert.client_name} (${alert.alert_type})`);
        
        const emailContent = getEmailContentForAlert(alert);
        
        // Chamar função de envio de email
        const { error: emailError } = await supabase.functions.invoke('send-email', {
          body: {
            to: alert.client_email,
            subject: emailContent.subject,
            html: emailContent.html,
          },
        });
        
        if (emailError) {
          console.error(`Erro ao enviar email para ${alert.client_email}:`, emailError);
          emailsErrored++;
          continue;
        }
        
        // Marcar alerta como enviado
        const { error: updateError } = await supabase
          .from('payment_alerts')
          .update({ email_sent: true })
          .eq('id', alert.alert_id);
        
        if (updateError) {
          console.error(`Erro ao atualizar alerta ${alert.alert_id}:`, updateError);
        } else {
          console.log(`Email enviado com sucesso para ${alert.client_email}`);
          emailsSent++;
        }
        
      } catch (error) {
        console.error(`Erro ao processar alerta para ${alert.client_name}:`, error);
        emailsErrored++;
      }
    }

    console.log(`=== Processamento concluído ===`);
    console.log(`Emails enviados: ${emailsSent}`);
    console.log(`Emails com erro: ${emailsErrored}`);

    return new Response(
      JSON.stringify({
        success: true,
        alertsProcessed: alerts.length,
        emailsSent,
        emailsErrored,
        message: `Processamento concluído. ${emailsSent} emails enviados.`
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error: any) {
    console.error('Erro no processamento de alertas:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || "Erro interno do servidor" 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});

function getEmailContentForAlert(alert: PaymentAlert) {
  const alertTypeLabels = {
    'warning_10_days': {
      subject: `Lembrete: Pagamento vence em ${alert.days_until_due} dias`,
      title: 'Pagamento Próximo do Vencimento',
      urgency: 'informativo',
    },
    'warning_5_days': {
      subject: `Urgente: Pagamento vence em ${alert.days_until_due} dias`,
      title: 'Pagamento Vence em Breve',
      urgency: 'atenção',
    },
    'final_notice': {
      subject: `FINAL: Pagamento vence amanhã - Acesso será bloqueado`,
      title: 'Aviso Final - Pagamento Urgente',
      urgency: 'crítico',
    },
  };

  const config = alertTypeLabels[alert.alert_type as keyof typeof alertTypeLabels];
  const dueDate = new Date(alert.payment_due_date).toLocaleDateString('pt-BR');

  return {
    subject: config.subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
        <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0; font-size: 24px;">ContaFlix</h1>
            <p style="color: #64748b; margin: 5px 0 0 0;">Sistema de Gestão Contábil</p>
          </div>
          
          <h2 style="color: #333; text-align: center; margin-bottom: 25px;">${config.title}</h2>
          
          <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 15px 0;"><strong>Prezado(a) ${alert.client_name},</strong></p>
            
            <p style="margin: 0 0 15px 0;">Este é um lembrete sobre o vencimento da sua mensalidade do ContaFlix.</p>
            
            <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #2563eb;">
              <p style="margin: 0 0 10px 0;"><strong>📅 Data de Vencimento:</strong> ${dueDate}</p>
              <p style="margin: 0;"><strong>⏰ Dias restantes:</strong> ${alert.days_until_due} dia(s)</p>
            </div>
            
            ${alert.alert_type === 'final_notice' ? `
              <div style="background-color: #fef2f2; border: 2px solid #fca5a5; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <p style="color: #dc2626; margin: 0; font-weight: bold;">⚠️ ATENÇÃO URGENTE:</p>
                <p style="color: #dc2626; margin: 5px 0 0 0;">Caso o pagamento não seja efetuado até amanhã, seu acesso ao sistema será temporariamente bloqueado automaticamente.</p>
              </div>
            ` : ''}
            
            <p style="margin: 15px 0;">Para manter seu acesso ativo e evitar interrupções no serviço, por favor efetue o pagamento até a data de vencimento.</p>
            
            <div style="background-color: #eff6ff; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <p style="margin: 0; color: #1d4ed8;"><strong>💡 Dica:</strong> Configure lembretes automáticos em seu sistema bancário para não perder prazos importantes!</p>
            </div>
            
            <p style="margin: 15px 0 5px 0;">Em caso de dúvidas ou problemas com o pagamento, entre em contato conosco.</p>
            
            <p style="margin: 20px 0 0 0;">Atenciosamente,<br><strong>Equipe ContaFlix</strong></p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
            <p style="color: #64748b; font-size: 12px; margin: 0;">ContaFlix - Sistema de Gestão Contábil Automatizada</p>
          </div>
        </div>
      </div>
    `,
  };
}
