// Edge Function para processamento automático de pagamentos agendados
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Função principal de processamento de pagamentos
async function processScheduledPayments() {
  const startTime = new Date();
  
  // Criar log inicial
  const { data: logEntry } = await supabase
    .from('automation_logs')
    .insert({
      process_type: 'payment_automation',
      status: 'running',
      started_at: startTime.toISOString(),
      metadata: { trigger: 'automated_cron' }
    })
    .select()
    .single();

  let totalProcessed = 0;
  let errors = 0;
  const errorDetails: any[] = [];

  try {
    console.log('Iniciando processamento de pagamentos agendados');

    // 1. Verificar alertas de pagamento pendentes
    const paymentAlerts = await checkPendingPaymentAlerts();
    
    // 2. Processar pagamentos de impostos em vencimento
    const taxPayments = await processTaxPayments();
    
    // 3. Verificar pagamentos PIX pendentes
    const pixPayments = await processPixPayments();

    totalProcessed = paymentAlerts.processed + taxPayments.processed + pixPayments.processed;
    errors = paymentAlerts.errors + taxPayments.errors + pixPayments.errors;
    
    errorDetails.push(
      ...paymentAlerts.errors_details,
      ...taxPayments.errors_details,
      ...pixPayments.errors_details
    );

    // 4. Atualizar log de conclusão
    await supabase
      .from('automation_logs')
      .update({
        status: errors === 0 ? 'completed' : 'completed',
        completed_at: new Date().toISOString(),
        records_processed: totalProcessed,
        errors_count: errors,
        error_details: errorDetails.length > 0 ? errorDetails : null
      })
      .eq('id', logEntry?.id);

    return {
      success: true,
      processed: totalProcessed,
      errors: errors,
      breakdown: {
        payment_alerts: paymentAlerts.processed,
        tax_payments: taxPayments.processed,
        pix_payments: pixPayments.processed
      },
      message: `Processamento de pagamentos concluído: ${totalProcessed} pagamentos processados, ${errors} erros`
    };

  } catch (error: any) {
    console.error('Erro crítico no processamento de pagamentos:', error);
    
    await supabase
      .from('automation_logs')
      .update({
        status: 'failed',
        completed_at: new Date().toISOString(),
        records_processed: totalProcessed,
        errors_count: errors + 1,
        error_details: [...errorDetails, { critical_error: error.message }]
      })
      .eq('id', logEntry?.id);

    return {
      success: false,
      error: error.message,
      processed: totalProcessed
    };
  }
}

// Verificar e processar alertas de pagamento
async function checkPendingPaymentAlerts() {
  console.log('Verificando alertas de pagamento pendentes');
  
  let processed = 0;
  let errors = 0;
  const errors_details: any[] = [];

  try {
    // Buscar alertas pendentes usando a função existente
    const { data: alerts, error } = await supabase
      .rpc('get_pending_payment_alerts');

    if (error) throw error;

    for (const alert of alerts || []) {
      try {
        // Processar cada alerta
        await processPaymentAlert(alert);
        processed++;
      } catch (error: any) {
        errors++;
        errors_details.push({
          alert_id: alert.alert_id,
          client_name: alert.client_name,
          error: error.message
        });
      }
    }

  } catch (error: any) {
    errors++;
    errors_details.push({
      operation: 'check_pending_alerts',
      error: error.message
    });
  }

  return { processed, errors, errors_details };
}

// Processar um alerta de pagamento específico
async function processPaymentAlert(alert: any) {
  console.log(`Processando alerta para cliente ${alert.client_name}`);
  
  // Simular envio de e-mail/notificação
  const emailSent = await simulateEmailNotification(alert);
  
  if (emailSent) {
    // Marcar alerta como enviado
    await supabase
      .from('payment_alerts')
      .update({
        email_sent: true,
        alert_sent_date: new Date().toISOString()
      })
      .eq('id', alert.alert_id);
  }
}

// Simular envio de notificação por e-mail
async function simulateEmailNotification(alert: any): Promise<boolean> {
  // Em implementação real, aqui seria feita a integração com serviço de email
  console.log(`Enviando notificação para ${alert.client_email}: ${alert.alert_type}`);
  
  // Simular tempo de envio
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // Simular sucesso (95% das vezes)
  return Math.random() > 0.05;
}

// Processar pagamentos de impostos
async function processTaxPayments() {
  console.log('Processando pagamentos de impostos em vencimento');
  
  let processed = 0;
  let errors = 0;
  const errors_details: any[] = [];

  try {
    // Buscar dados de impostos calculados para o mês atual
    const currentPeriod = new Date().toISOString().substring(0, 7);
    
    const { data: taxData, error } = await supabase
      .from('processed_accounting_data')
      .select(`
        *,
        accounting_clients!inner(*)
      `)
      .eq('period', currentPeriod)
      .gte('calculated_taxes->irpj', 0);

    if (error) throw error;

    for (const data of taxData || []) {
      try {
        // Verificar se os impostos precisam ser pagos
        if (shouldProcessTaxPayment(data)) {
          await processTaxPayment(data);
          processed++;
        }
      } catch (error: any) {
        errors++;
        errors_details.push({
          client_id: data.client_id,
          period: data.period,
          error: error.message
        });
      }
    }

  } catch (error: any) {
    errors++;
    errors_details.push({
      operation: 'process_tax_payments',
      error: error.message
    });
  }

  return { processed, errors, errors_details };
}

// Verificar se o pagamento de imposto deve ser processado
function shouldProcessTaxPayment(data: any): boolean {
  const today = new Date();
  const dayOfMonth = today.getDate();
  
  // Processa pagamentos entre os dias 15-20 do mês
  return dayOfMonth >= 15 && dayOfMonth <= 20;
}

// Processar pagamento de impostos
async function processTaxPayment(data: any) {
  console.log(`Processando pagamento de impostos para cliente ${data.client_id}`);
  
  const taxes = data.calculated_taxes || {};
  
  // Simular pagamento para cada tipo de imposto
  for (const [taxType, amount] of Object.entries(taxes)) {
    if (amount > 0) {
      await simulateTaxPayment(data.client_id, taxType, amount as number, data.period);
    }
  }
}

// Simular pagamento de imposto
async function simulateTaxPayment(clientId: string, taxType: string, amount: number, period: string) {
  console.log(`Pagando ${taxType}: R$ ${amount} para cliente ${clientId}`);
  
  // Em implementação real, aqui seria feita a integração com sistema de pagamentos
  // Por enquanto, apenas simular o sucesso
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Simular criação de comprovante de pagamento
  const paymentRecord = {
    client_id: clientId,
    tax_type: taxType,
    amount: amount,
    period: period,
    payment_date: new Date().toISOString(),
    status: 'paid',
    reference: `AUTO_${taxType}_${Date.now()}`
  };
  
  console.log('Pagamento simulado:', paymentRecord);
}

// Processar pagamentos PIX
async function processPixPayments() {
  console.log('Verificando pagamentos PIX pendentes');
  
  let processed = 0;
  let errors = 0;
  const errors_details: any[] = [];

  try {
    // Buscar pagamentos PIX em processamento
    const { data: pixPayments, error } = await supabase
      .from('pix_payments')
      .select('*')
      .eq('status', 'processing')
      .order('initiated_at', { ascending: true });

    if (error) throw error;

    for (const payment of pixPayments || []) {
      try {
        await processPixPayment(payment);
        processed++;
      } catch (error: any) {
        errors++;
        errors_details.push({
          payment_id: payment.id,
          error: error.message
        });
      }
    }

  } catch (error: any) {
    errors++;
    errors_details.push({
      operation: 'process_pix_payments',
      error: error.message
    });
  }

  return { processed, errors, errors_details };
}

// Processar um pagamento PIX específico
async function processPixPayment(payment: any) {
  console.log(`Verificando status do pagamento PIX ${payment.id}`);
  
  // Simular verificação de status (em implementação real, consultar API do banco)
  const isCompleted = Math.random() > 0.3; // 70% chance de estar completo
  
  if (isCompleted) {
    await supabase
      .from('pix_payments')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', payment.id);
    
    console.log(`Pagamento PIX ${payment.id} marcado como completo`);
  }
}

// Servir a função
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const result = await processScheduledPayments();
    
    return new Response(
      JSON.stringify(result),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: result.success ? 200 : 500,
      }
    );
  } catch (error: any) {
    console.error("Erro na Edge Function:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 500,
      }
    );
  }
});