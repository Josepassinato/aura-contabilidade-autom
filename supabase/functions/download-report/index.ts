import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const reportId = url.searchParams.get('id');
    
    if (!reportId) {
      throw new Error('ID do relatório não fornecido');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. BUSCAR RELATÓRIO
    const { data: report, error: reportError } = await supabase
      .from('generated_reports')
      .select('*')
      .eq('id', reportId)
      .single();

    if (reportError || !report) {
      throw new Error('Relatório não encontrado');
    }

    // 2. VERIFICAR EXPIRAÇÃO
    if (report.expires_at && new Date(report.expires_at) < new Date()) {
      throw new Error('Relatório expirado');
    }

    // 3. INCREMENTAR CONTADOR DE DOWNLOAD
    await supabase
      .from('generated_reports')
      .update({ 
        download_count: (report.download_count || 0) + 1 
      })
      .eq('id', reportId);

    // 4. LOG DE AUDITORIA
    await supabase
      .from('audit_logs')
      .insert({
        table_name: 'generated_reports',
        operation: 'REPORT_DOWNLOADED',
        record_id: reportId,
        metadata: {
          download_count: (report.download_count || 0) + 1,
          user_agent: req.headers.get('user-agent'),
          timestamp: new Date().toISOString()
        },
        severity: 'info',
        source: 'download_service'
      });

    // 5. SIMULAR CONTEÚDO DO ARQUIVO (em produção seria do storage)
    let fileContent: string;
    let contentType: string;

    switch (report.file_format) {
      case 'pdf':
        fileContent = `Relatório PDF simulado para ${report.title}`;
        contentType = 'application/pdf';
        break;
      case 'csv':
        fileContent = `Data,Tipo,Valor\n2024-01-01,Receita,1000.00\n2024-01-02,Despesa,-500.00`;
        contentType = 'text/csv';
        break;
      case 'excel':
        fileContent = `Dados Excel simulados`;
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        break;
      default:
        contentType = 'application/octet-stream';
        fileContent = 'Conteúdo do arquivo';
    }

    // 6. RETORNAR ARQUIVO
    const fileName = report.file_path?.split('/').pop() || `report.${report.file_format}`;
    
    return new Response(fileContent, {
      headers: {
        ...corsHeaders,
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': fileContent.length.toString()
      },
    });

  } catch (error) {
    console.error('Erro no download:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});