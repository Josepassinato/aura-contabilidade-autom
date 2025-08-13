import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReportRequest {
  clientId: string;
  reportType: 'financial' | 'compliance' | 'tax' | 'performance';
  format: 'pdf' | 'csv' | 'excel';
  period: {
    start: string;
    end: string;
  };
  filters?: Record<string, any>;
  templateId?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const reportRequest: ReportRequest = await req.json();
    const { clientId, reportType, format, period, filters, templateId } = reportRequest;

    console.log(`Gerando relatório ${reportType} formato ${format} para cliente ${clientId}`);

    // 1. CRIAR REGISTRO DO RELATÓRIO
    const { data: reportRecord, error: reportError } = await supabase
      .from('generated_reports')
      .insert({
        client_id: clientId,
        title: `Relatório ${reportType.charAt(0).toUpperCase() + reportType.slice(1)}`,
        description: `Relatório ${reportType} período ${period.start} a ${period.end}`,
        report_type: reportType,
        file_format: format,
        generation_status: 'generating',
        template_id: templateId,
        created_by: null, // Será preenchido via RLS
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 dias
      })
      .select()
      .single();

    if (reportError) {
      console.error('Erro ao criar registro do relatório:', reportError);
      throw reportError;
    }

    // 2. BUSCAR DADOS BASEADO NO TIPO DE RELATÓRIO
    let reportData: any = {};

    switch (reportType) {
      case 'financial':
        reportData = await generateFinancialReport(supabase, clientId, period);
        break;
      case 'compliance':
        reportData = await generateComplianceReport(supabase, clientId, period);
        break;
      case 'tax':
        reportData = await generateTaxReport(supabase, clientId, period);
        break;
      case 'performance':
        reportData = await generatePerformanceReport(supabase, clientId, period);
        break;
      default:
        throw new Error(`Tipo de relatório não suportado: ${reportType}`);
    }

    // 3. GERAR ARQUIVO NO FORMATO SOLICITADO
    let fileContent: string;
    let fileName: string;
    let contentType: string;

    switch (format) {
      case 'pdf':
        fileContent = await generatePDF(reportData, reportType);
        fileName = `${reportType}_${clientId}_${Date.now()}.pdf`;
        contentType = 'application/pdf';
        break;
      case 'csv':
        fileContent = await generateCSV(reportData);
        fileName = `${reportType}_${clientId}_${Date.now()}.csv`;
        contentType = 'text/csv';
        break;
      case 'excel':
        fileContent = await generateExcel(reportData);
        fileName = `${reportType}_${clientId}_${Date.now()}.xlsx`;
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        break;
      default:
        throw new Error(`Formato não suportado: ${format}`);
    }

    // 4. SIMULAR UPLOAD PARA STORAGE (em produção seria storage real)
    const fileUrl = `https://${supabaseUrl}/storage/v1/object/reports/${fileName}`;
    const filePath = `reports/${fileName}`;
    
    // 5. ATUALIZAR REGISTRO COM ARQUIVO GERADO
    const { error: updateError } = await supabase
      .from('generated_reports')
      .update({
        generation_status: 'completed',
        file_path: filePath,
        file_url: fileUrl,
        file_size: fileContent.length,
        download_count: 0
      })
      .eq('id', reportRecord.id);

    if (updateError) {
      console.error('Erro ao atualizar relatório:', updateError);
      throw updateError;
    }

    // 6. LOG DE AUDITORIA
    await supabase
      .from('audit_logs')
      .insert({
        table_name: 'generated_reports',
        operation: 'REPORT_GENERATED',
        record_id: reportRecord.id,
        new_values: {
          report_type: reportType,
          format: format,
          client_id: clientId,
          file_size: fileContent.length
        },
        metadata: {
          period: period,
          filters: filters,
          generation_time: new Date().toISOString()
        },
        severity: 'info',
        source: 'report_generator'
      });

    return new Response(JSON.stringify({
      success: true,
      data: {
        reportId: reportRecord.id,
        fileName: fileName,
        fileUrl: fileUrl,
        downloadUrl: `${supabaseUrl}/functions/v1/download-report?id=${reportRecord.id}`,
        fileSize: fileContent.length,
        expiresAt: reportRecord.expires_at
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro na geração de relatório:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      details: 'Falha na geração do relatório. Tente novamente.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// FUNÇÕES DE GERAÇÃO DE DADOS
async function generateFinancialReport(supabase: any, clientId: string, period: any) {
  const { data: transactions } = await supabase
    .from('financial_transactions')
    .select('*')
    .eq('client_id', clientId)
    .gte('date', period.start)
    .lte('date', period.end)
    .order('date', { ascending: false });

  const summary = {
    totalReceitas: transactions?.filter(t => t.amount > 0).reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0,
    totalDespesas: transactions?.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(parseFloat(t.amount)), 0) || 0,
    transacoesCount: transactions?.length || 0
  };

  return {
    title: 'Relatório Financeiro',
    period,
    summary,
    transactions: transactions || [],
    generatedAt: new Date().toISOString()
  };
}

async function generateComplianceReport(supabase: any, clientId: string, period: any) {
  const { data: obligations } = await supabase
    .from('declaracoes_simples_nacional')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  return {
    title: 'Relatório de Conformidade',
    period,
    obligations: obligations || [],
    complianceScore: 85, // Simulado
    pendingActions: [],
    generatedAt: new Date().toISOString()
  };
}

async function generateTaxReport(supabase: any, clientId: string, period: any) {
  const { data: guias } = await supabase
    .from('sefaz_sp_scrapes')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  return {
    title: 'Relatório Tributário',
    period,
    guias: guias || [],
    totalTaxes: guias?.reduce((sum, g) => sum + (parseFloat(g.valor) || 0), 0) || 0,
    generatedAt: new Date().toISOString()
  };
}

async function generatePerformanceReport(supabase: any, clientId: string, period: any) {
  const { data: automationLogs } = await supabase
    .from('automation_logs')
    .select('*')
    .eq('client_id', clientId)
    .gte('created_at', period.start)
    .lte('created_at', period.end)
    .order('created_at', { ascending: false });

  return {
    title: 'Relatório de Performance',
    period,
    automationStats: {
      totalProcesses: automationLogs?.length || 0,
      successRate: 92, // Simulado
      avgProcessingTime: '2.3min' // Simulado
    },
    logs: automationLogs || [],
    generatedAt: new Date().toISOString()
  };
}

// FUNÇÕES DE GERAÇÃO DE ARQUIVO
async function generatePDF(data: any, reportType: string): Promise<string> {
  // Simulação de geração PDF - em produção usar biblioteca como jsPDF
  const pdfContent = `
PDF Report: ${data.title}
Generated: ${data.generatedAt}
Period: ${data.period?.start} to ${data.period?.end}

Content Summary:
${JSON.stringify(data, null, 2)}
  `;
  
  return btoa(pdfContent); // Base64 encoded
}

async function generateCSV(data: any): Promise<string> {
  let csvContent = "Data,Tipo,Valor,Descrição\n";
  
  if (data.transactions) {
    data.transactions.forEach((transaction: any) => {
      csvContent += `${transaction.date},${transaction.type},${transaction.amount},"${transaction.description}"\n`;
    });
  }
  
  return csvContent;
}

async function generateExcel(data: any): Promise<string> {
  // Simulação - em produção usar biblioteca como xlsx
  return await generateCSV(data);
}