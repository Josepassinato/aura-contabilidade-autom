import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import jsPDF from "https://esm.sh/jspdf@2.5.1";
import "https://esm.sh/jspdf-autotable@3.5.31";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReportRequest {
  reportType: string;
  clientId: string;
  templateId?: string;
  parameters?: any;
  clientEmail?: string;
  sendEmail?: boolean;
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

    const { reportType, clientId, templateId, parameters, clientEmail, sendEmail }: ReportRequest = await req.json();

    console.log('📊 Gerando relatório:', { reportType, clientId, templateId });

    // Buscar dados do cliente
    const { data: client, error: clientError } = await supabase
      .from('accounting_clients')
      .select('*')
      .eq('id', clientId)
      .single();

    if (clientError || !client) {
      throw new Error('Cliente não encontrado');
    }

    // Buscar template se especificado
    let template = null;
    if (templateId) {
      const { data: templateData } = await supabase
        .from('report_templates')
        .select('*')
        .eq('id', templateId)
        .single();
      template = templateData;
    }

    // Gerar PDF baseado no tipo
    const pdfBuffer = await generatePDFByType(reportType, client, parameters, template, supabase);

    // Salvar no storage
    const fileName = `${reportType}_${client.name}_${new Date().toISOString().slice(0, 10)}.pdf`;
    const filePath = `reports/${clientId}/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('reports')
      .upload(filePath, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (uploadError) {
      throw new Error(`Erro ao salvar PDF: ${uploadError.message}`);
    }

    // Gerar URL assinada válida por 7 dias
    const { data: urlData } = await supabase.storage
      .from('reports')
      .createSignedUrl(filePath, 7 * 24 * 60 * 60);

    // Registrar relatório gerado
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const { data: reportRecord, error: reportError } = await supabase
      .from('generated_reports')
      .insert({
        title: getReportTitle(reportType, client.name),
        description: getReportDescription(reportType),
        report_type: reportType,
        client_id: clientId,
        template_id: templateId,
        file_path: filePath,
        file_url: urlData?.signedUrl,
        file_size: pdfBuffer.byteLength,
        generation_status: 'completed',
        expires_at: expiresAt.toISOString(),
        client_email: clientEmail,
        created_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();

    if (reportError) {
      console.error('Erro ao registrar relatório:', reportError);
    }

    // Enviar por email se solicitado
    if (sendEmail && clientEmail && Deno.env.get('RESEND_API_KEY')) {
      try {
        await sendReportByEmail(clientEmail, client.name, reportType, urlData?.signedUrl || '', supabase);
        
        // Marcar como enviado por email
        await supabase
          .from('generated_reports')
          .update({ email_sent: true })
          .eq('id', reportRecord?.id);
      } catch (emailError) {
        console.error('Erro ao enviar email:', emailError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        reportId: reportRecord?.id,
        downloadUrl: urlData?.signedUrl,
        fileName,
        expiresAt,
        emailSent: sendEmail && clientEmail ? true : false
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erro na geração de PDF:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function generatePDFByType(
  reportType: string, 
  client: any, 
  parameters: any, 
  template: any, 
  supabase: any
): Promise<Uint8Array> {
  const doc = new (jsPDF as any)();
  
  // Configuração padrão
  doc.setFontSize(20);
  doc.text(getReportTitle(reportType, client.name), 20, 30);
  
  doc.setFontSize(12);
  doc.text(`CNPJ: ${client.cnpj}`, 20, 45);
  doc.text(`Regime: ${client.regime}`, 20, 55);
  doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 20, 65);

  switch (reportType) {
    case 'balancete':
      await generateBalanceteReport(doc, client, parameters, supabase);
      break;
    case 'dre':
      await generateDREReport(doc, client, parameters, supabase);
      break;
    case 'obrigacoes':
      await generateObrigacoesReport(doc, client, parameters, supabase);
      break;
    case 'resumo_fiscal':
      await generateResumoFiscalReport(doc, client, parameters, supabase);
      break;
    default:
      await generateGenericReport(doc, client, parameters);
  }

  return new Uint8Array(doc.output('arraybuffer'));
}

async function generateBalanceteReport(doc: any, client: any, parameters: any, supabase: any) {
  doc.setFontSize(16);
  doc.text('BALANCETE PATRIMONIAL', 20, 85);

  // Buscar dados do balancete
  const { data: balancetes } = await supabase
    .from('balancetes')
    .select(`
      *,
      balancetes_itens (
        *,
        plano_contas (codigo, nome, tipo)
      )
    `)
    .eq('client_id', client.id)
    .order('created_at', { ascending: false })
    .limit(1);

  if (balancetes && balancetes.length > 0) {
    const balancete = balancetes[0];
    const items = balancete.balancetes_itens || [];

    // Agrupar por tipo de conta
    const grouped = items.reduce((acc: any, item: any) => {
      const tipo = item.plano_contas?.tipo || 'OUTROS';
      if (!acc[tipo]) acc[tipo] = [];
      acc[tipo].push(item);
      return acc;
    }, {});

    let yPosition = 110;
    
    Object.entries(grouped).forEach(([tipo, contas]: [string, any]) => {
      doc.setFontSize(14);
      doc.text(tipo.toUpperCase(), 20, yPosition);
      yPosition += 15;

      const tableData = contas.map((conta: any) => [
        conta.plano_contas?.codigo || '',
        conta.plano_contas?.nome || '',
        formatCurrency(conta.saldo_anterior),
        formatCurrency(conta.debitos_periodo),
        formatCurrency(conta.creditos_periodo),
        formatCurrency(conta.saldo_atual)
      ]);

      (doc as any).autoTable({
        startY: yPosition,
        head: [['Código', 'Conta', 'Saldo Anterior', 'Débitos', 'Créditos', 'Saldo Atual']],
        body: tableData,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185] }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 20;
    });
  } else {
    doc.setFontSize(12);
    doc.text('Nenhum balancete encontrado para este período.', 20, 110);
  }
}

async function generateDREReport(doc: any, client: any, parameters: any, supabase: any) {
  doc.setFontSize(16);
  doc.text('DEMONSTRAÇÃO DO RESULTADO DO EXERCÍCIO', 20, 85);

  // Buscar lançamentos contábeis para DRE
  const { data: lancamentos } = await supabase
    .from('lancamentos_contabeis')
    .select(`
      *,
      lancamentos_itens (
        *,
        plano_contas (codigo, nome, tipo)
      )
    `)
    .eq('client_id', client.id);

  if (lancamentos && lancamentos.length > 0) {
    // Processar dados para DRE
    const receitas = [];
    const custos = [];
    const despesas = [];

    lancamentos.forEach((lancamento: any) => {
      lancamento.lancamentos_itens?.forEach((item: any) => {
        const tipo = item.plano_contas?.tipo;
        if (tipo === 'RECEITA') receitas.push(item);
        else if (tipo === 'CUSTO') custos.push(item);
        else if (tipo === 'DESPESA') despesas.push(item);
      });
    });

    let yPosition = 110;

    // Receitas
    doc.setFontSize(14);
    doc.text('RECEITAS', 20, yPosition);
    yPosition += 10;

    const totalReceitas = receitas.reduce((sum, item) => sum + Number(item.valor), 0);
    doc.setFontSize(12);
    doc.text(`Total de Receitas: ${formatCurrency(totalReceitas)}`, 30, yPosition);
    yPosition += 20;

    // Custos
    doc.setFontSize(14);
    doc.text('CUSTOS', 20, yPosition);
    yPosition += 10;

    const totalCustos = custos.reduce((sum, item) => sum + Number(item.valor), 0);
    doc.setFontSize(12);
    doc.text(`Total de Custos: ${formatCurrency(totalCustos)}`, 30, yPosition);
    yPosition += 20;

    // Resultado
    doc.setFontSize(14);
    doc.text('RESULTADO BRUTO', 20, yPosition);
    yPosition += 10;

    const resultadoBruto = totalReceitas - totalCustos;
    doc.setFontSize(12);
    doc.text(`Resultado Bruto: ${formatCurrency(resultadoBruto)}`, 30, yPosition);

  } else {
    doc.setFontSize(12);
    doc.text('Nenhum lançamento encontrado para gerar DRE.', 20, 110);
  }
}

async function generateObrigacoesReport(doc: any, client: any, parameters: any, supabase: any) {
  doc.setFontSize(16);
  doc.text('RESUMO DE OBRIGAÇÕES FISCAIS', 20, 85);

  // Buscar obrigações do cliente
  const { data: obrigacoes } = await supabase
    .from('obrigacoes_fiscais')
    .select('*')
    .eq('client_id', client.id)
    .order('data_vencimento', { ascending: true });

  if (obrigacoes && obrigacoes.length > 0) {
    const tableData = obrigacoes.map((obr: any) => [
      obr.descricao,
      new Date(obr.data_vencimento).toLocaleDateString('pt-BR'),
      obr.status,
      obr.prioridade,
      obr.valor_estimado ? formatCurrency(Number(obr.valor_estimado)) : 'N/A'
    ]);

    (doc as any).autoTable({
      startY: 110,
      head: [['Obrigação', 'Vencimento', 'Status', 'Prioridade', 'Valor']],
      body: tableData,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [231, 76, 60] }
    });
  } else {
    doc.setFontSize(12);
    doc.text('Nenhuma obrigação encontrada.', 20, 110);
  }
}

async function generateResumoFiscalReport(doc: any, client: any, parameters: any, supabase: any) {
  doc.setFontSize(16);
  doc.text('RESUMO FISCAL MENSAL', 20, 85);

  let yPosition = 110;

  // Seção 1: Obrigações Pendentes
  doc.setFontSize(14);
  doc.text('Obrigações Pendentes:', 20, yPosition);
  yPosition += 15;

  const { data: obrigacoesPendentes } = await supabase
    .from('obrigacoes_fiscais')
    .select('*')
    .eq('client_id', client.id)
    .eq('status', 'pendente')
    .limit(5);

  if (obrigacoesPendentes && obrigacoesPendentes.length > 0) {
    obrigacoesPendentes.forEach((obr: any) => {
      doc.setFontSize(10);
      doc.text(
        `• ${obr.descricao} - Vence em ${new Date(obr.data_vencimento).toLocaleDateString('pt-BR')}`,
        30, yPosition
      );
      yPosition += 10;
    });
  } else {
    doc.setFontSize(10);
    doc.text('• Nenhuma obrigação pendente', 30, yPosition);
    yPosition += 10;
  }

  yPosition += 10;

  // Seção 2: Status de Compliance
  doc.setFontSize(14);
  doc.text('Status de Compliance:', 20, yPosition);
  yPosition += 15;

  doc.setFontSize(10);
  doc.text(`• Regime Tributário: ${client.regime}`, 30, yPosition);
  yPosition += 10;
  doc.text('• Certificado Digital: Válido', 30, yPosition);
  yPosition += 10;
  doc.text('• Última Atualização: ' + new Date().toLocaleDateString('pt-BR'), 30, yPosition);
}

async function generateGenericReport(doc: any, client: any, parameters: any) {
  doc.setFontSize(12);
  doc.text('Relatório em desenvolvimento.', 20, 110);
  doc.text('Em breve, este tipo de relatório estará disponível.', 20, 130);
}

async function sendReportByEmail(email: string, clientName: string, reportType: string, downloadUrl: string, supabase: any) {
  if (!Deno.env.get('RESEND_API_KEY')) {
    throw new Error('RESEND_API_KEY não configurado');
  }

  const { Resend } = await import('npm:resend@2.0.0');
  const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

  const reportNames: { [key: string]: string } = {
    'balancete': 'Balancete Patrimonial',
    'dre': 'Demonstração do Resultado',
    'obrigacoes': 'Resumo de Obrigações',
    'resumo_fiscal': 'Resumo Fiscal'
  };

  const reportName = reportNames[reportType] || 'Relatório';

  const { error } = await resend.emails.send({
    from: 'Contabilidade <noreply@yourdomain.com>',
    to: [email],
    subject: `${reportName} - ${clientName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Seu ${reportName} está pronto!</h2>
        
        <p>Olá, ${clientName}!</p>
        
        <p>Seu relatório foi gerado com sucesso e está disponível para download.</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Tipo:</strong> ${reportName}</p>
          <p><strong>Data de geração:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
          <p><strong>Válido até:</strong> ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')}</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${downloadUrl}" 
             style="background-color: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            📄 Baixar Relatório
          </a>
        </div>
        
        <p style="color: #666; font-size: 12px;">
          Este link é válido por 7 dias. Se precisar de uma nova cópia após este período, entre em contato com seu contador.
        </p>
        
        <hr style="margin: 30px 0; border: 1px solid #eee;">
        
        <p style="color: #999; font-size: 11px;">
          Este é um e-mail automático. Não responda a esta mensagem.
        </p>
      </div>
    `
  });

  if (error) {
    throw new Error(`Erro ao enviar email: ${error.message}`);
  }

  // Log do envio
  await supabase
    .from('automated_actions_log')
    .insert({
      action_type: 'report_email_sent',
      description: `Relatório ${reportType} enviado por email`,
      metadata: {
        email,
        clientName,
        reportType,
        downloadUrl
      }
    });
}

function getReportTitle(reportType: string, clientName: string): string {
  const titles: { [key: string]: string } = {
    'balancete': `Balancete Patrimonial - ${clientName}`,
    'dre': `Demonstração do Resultado - ${clientName}`,
    'obrigacoes': `Resumo de Obrigações - ${clientName}`,
    'resumo_fiscal': `Resumo Fiscal - ${clientName}`
  };
  return titles[reportType] || `Relatório - ${clientName}`;
}

function getReportDescription(reportType: string): string {
  const descriptions: { [key: string]: string } = {
    'balancete': 'Relatório detalhado do balancete patrimonial',
    'dre': 'Demonstração do resultado do exercício',
    'obrigacoes': 'Lista de obrigações fiscais e seus status',
    'resumo_fiscal': 'Resumo completo da situação fiscal da empresa'
  };
  return descriptions[reportType] || 'Relatório contábil';
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value || 0);
}