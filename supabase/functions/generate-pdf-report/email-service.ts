export async function sendReportByEmail(email: string, clientName: string, reportType: string, downloadUrl: string, supabase: any) {
  if (!Deno.env.get('RESEND_API_KEY')) {
    throw new Error('RESEND_API_KEY não configurado');
  }

  const { Resend } = await import('npm:resend@2.0.0');
  const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

  const reportNames: { [key: string]: string } = {
    'balancete': 'Balancete Patrimonial',
    'dre': 'Demonstração do Resultado',
    'obrigacoes': 'Resumo de Obrigações',
    'resumo_fiscal': 'Resumo Fiscal',
    'fluxo_caixa': 'Fluxo de Caixa',
    'analise_financeira': 'Análise Financeira',
    'comparativo_mensal': 'Comparativo Mensal',
    'indicadores_performance': 'Indicadores de Performance'
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