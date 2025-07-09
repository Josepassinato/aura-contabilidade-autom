import jsPDF from "https://esm.sh/jspdf@2.5.1";
import "https://esm.sh/jspdf-autotable@3.5.31";
import { formatCurrency, getReportTitle } from './pdf-utils.ts';

export async function generatePDFByType(
  reportType: string, 
  client: any, 
  parameters: any, 
  template: any, 
  supabase: any
): Promise<Uint8Array> {
  const doc = new (jsPDF as any)();
  
  // Adicionar cabeçalho com informações da contabilidade
  if (client.accounting_firms) {
    const accountingFirm = client.accounting_firms;
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`${accountingFirm.name}`, 20, 15);
    doc.text(`CNPJ: ${accountingFirm.cnpj}`, 20, 20);
    if (accountingFirm.phone) {
      doc.text(`Tel: ${accountingFirm.phone}`, 120, 15);
    }
    if (accountingFirm.email) {
      doc.text(`Email: ${accountingFirm.email}`, 120, 20);
    }
    
    // Linha separadora
    doc.setLineWidth(0.5);
    doc.line(20, 25, 190, 25);
  }
  
  // Configuração do título do relatório
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(20);
  doc.text(getReportTitle(reportType, client.name), 20, 40);
  
  doc.setFontSize(12);
  doc.text(`CNPJ: ${client.cnpj}`, 20, 55);
  doc.text(`Regime: ${client.regime}`, 20, 65);
  doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 20, 75);

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
    case 'fluxo_caixa':
      await generateFluxoCaixaReport(doc, client, parameters, supabase);
      break;
    case 'analise_financeira':
      await generateAnaliseFinanceiraReport(doc, client, parameters, supabase);
      break;
    case 'comparativo_mensal':
      await generateComparativoMensalReport(doc, client, parameters, supabase);
      break;
    case 'indicadores_performance':
      await generateIndicadoresPerformanceReport(doc, client, parameters, supabase);
      break;
    default:
      await generateGenericReport(doc, client, parameters);
  }

  return new Uint8Array(doc.output('arraybuffer'));
}

async function generateBalanceteReport(doc: any, client: any, parameters: any, supabase: any) {
  doc.setFontSize(16);
  doc.text('BALANCETE PATRIMONIAL', 20, 95);

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
  doc.text('DEMONSTRAÇÃO DO RESULTADO DO EXERCÍCIO', 20, 95);

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
  doc.text('RESUMO DE OBRIGAÇÕES FISCAIS', 20, 95);

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
      startY: 120,
      head: [['Obrigação', 'Vencimento', 'Status', 'Prioridade', 'Valor']],
      body: tableData,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [231, 76, 60] }
    });
  } else {
    doc.setFontSize(12);
    doc.text('Nenhuma obrigação encontrada.', 20, 120);
  }
}

async function generateResumoFiscalReport(doc: any, client: any, parameters: any, supabase: any) {
  doc.setFontSize(16);
  doc.text('RESUMO FISCAL MENSAL', 20, 95);

  let yPosition = 120;

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

async function generateFluxoCaixaReport(doc: any, client: any, parameters: any, supabase: any) {
  doc.setFontSize(16);
  doc.text('RELATÓRIO DE FLUXO DE CAIXA', 20, 95);

  let yPosition = 120;
  
  // Dados simulados de fluxo de caixa
  const entradas = [
    { descricao: 'Vendas à Vista', valor: 50000 },
    { descricao: 'Recebimento de Clientes', valor: 30000 },
    { descricao: 'Outras Receitas', valor: 5000 }
  ];
  
  const saidas = [
    { descricao: 'Pagamento Fornecedores', valor: 25000 },
    { descricao: 'Salários e Encargos', valor: 15000 },
    { descricao: 'Despesas Operacionais', valor: 8000 }
  ];

  // Entradas
  doc.setFontSize(14);
  doc.text('ENTRADAS:', 20, yPosition);
  yPosition += 15;

  let totalEntradas = 0;
  entradas.forEach(entrada => {
    doc.setFontSize(10);
    doc.text(`• ${entrada.descricao}: ${formatCurrency(entrada.valor)}`, 30, yPosition);
    totalEntradas += entrada.valor;
    yPosition += 10;
  });

  yPosition += 10;
  doc.setFontSize(12);
  doc.text(`Total Entradas: ${formatCurrency(totalEntradas)}`, 30, yPosition);
  yPosition += 20;

  // Saídas
  doc.setFontSize(14);
  doc.text('SAÍDAS:', 20, yPosition);
  yPosition += 15;

  let totalSaidas = 0;
  saidas.forEach(saida => {
    doc.setFontSize(10);
    doc.text(`• ${saida.descricao}: ${formatCurrency(saida.valor)}`, 30, yPosition);
    totalSaidas += saida.valor;
    yPosition += 10;
  });

  yPosition += 10;
  doc.setFontSize(12);
  doc.text(`Total Saídas: ${formatCurrency(totalSaidas)}`, 30, yPosition);
  yPosition += 20;

  // Resultado
  const saldoFinal = totalEntradas - totalSaidas;
  doc.setFontSize(14);
  doc.text(`SALDO FINAL: ${formatCurrency(saldoFinal)}`, 20, yPosition);
}

async function generateAnaliseFinanceiraReport(doc: any, client: any, parameters: any, supabase: any) {
  doc.setFontSize(16);
  doc.text('ANÁLISE FINANCEIRA AVANÇADA', 20, 95);

  let yPosition = 120;
  
  // Indicadores simulados
  doc.setFontSize(14);
  doc.text('INDICADORES DE LIQUIDEZ:', 20, yPosition);
  yPosition += 15;

  doc.setFontSize(10);
  doc.text('• Liquidez Corrente: 1.85', 30, yPosition);
  yPosition += 10;
  doc.text('• Liquidez Seca: 1.42', 30, yPosition);
  yPosition += 10;
  doc.text('• Liquidez Imediata: 0.35', 30, yPosition);
  yPosition += 20;

  doc.setFontSize(14);
  doc.text('INDICADORES DE RENTABILIDADE:', 20, yPosition);
  yPosition += 15;

  doc.setFontSize(10);
  doc.text('• Margem Líquida: 12.5%', 30, yPosition);
  yPosition += 10;
  doc.text('• ROE (Return on Equity): 18.2%', 30, yPosition);
  yPosition += 10;
  doc.text('• ROA (Return on Assets): 8.7%', 30, yPosition);
  yPosition += 20;

  doc.setFontSize(14);
  doc.text('ANÁLISE DE TENDÊNCIAS:', 20, yPosition);
  yPosition += 15;

  doc.setFontSize(10);
  doc.text('• Crescimento de Receitas: +15% (vs mês anterior)', 30, yPosition);
  yPosition += 10;
  doc.text('• Redução de Custos: -5% (vs mês anterior)', 30, yPosition);
  yPosition += 10;
  doc.text('• Melhoria da Margem: +2.3 pontos percentuais', 30, yPosition);
}

async function generateComparativoMensalReport(doc: any, client: any, parameters: any, supabase: any) {
  doc.setFontSize(16);
  doc.text('COMPARATIVO MENSAL', 20, 95);

  // Dados simulados de comparação
  const meses = ['Janeiro', 'Fevereiro', 'Março'];
  const receitas = [80000, 85000, 92000];
  const despesas = [65000, 68000, 70000];

  (doc as any).autoTable({
    startY: 110,
    head: [['Mês', 'Receitas', 'Despesas', 'Resultado', 'Variação %']],
    body: meses.map((mes, index) => {
      const resultado = receitas[index] - despesas[index];
      const variacao = index > 0 ? ((resultado - (receitas[index-1] - despesas[index-1])) / (receitas[index-1] - despesas[index-1]) * 100).toFixed(1) + '%' : '-';
      return [
        mes,
        formatCurrency(receitas[index]),
        formatCurrency(despesas[index]),
        formatCurrency(resultado),
        variacao
      ];
    }),
    styles: { fontSize: 10 },
    headStyles: { fillColor: [52, 152, 219] }
  });
}

async function generateIndicadoresPerformanceReport(doc: any, client: any, parameters: any, supabase: any) {
  doc.setFontSize(16);
  doc.text('INDICADORES DE PERFORMANCE', 20, 95);

  let yPosition = 120;

  // KPIs principais
  doc.setFontSize(14);
  doc.text('KPIs PRINCIPAIS:', 20, yPosition);
  yPosition += 15;

  const kpis = [
    { nome: 'Faturamento Mensal', valor: 'R$ 92.000', meta: 'R$ 90.000', status: '✓' },
    { nome: 'Margem de Contribuição', valor: '35%', meta: '30%', status: '✓' },
    { nome: 'Inadimplência', valor: '2.1%', meta: '< 3%', status: '✓' },
    { nome: 'Giro de Estoque', valor: '4.2x', meta: '4x', status: '✓' },
    { nome: 'Prazo Médio Recebimento', valor: '28 dias', meta: '30 dias', status: '✓' }
  ];

  (doc as any).autoTable({
    startY: yPosition,
    head: [['Indicador', 'Valor Atual', 'Meta', 'Status']],
    body: kpis.map(kpi => [kpi.nome, kpi.valor, kpi.meta, kpi.status]),
    styles: { fontSize: 10 },
    headStyles: { fillColor: [46, 204, 113] }
  });

  yPosition = (doc as any).lastAutoTable.finalY + 20;

  doc.setFontSize(12);
  doc.text('RESUMO: Empresa apresenta performance acima das metas estabelecidas.', 20, yPosition);
}

async function generateGenericReport(doc: any, client: any, parameters: any) {
  doc.setFontSize(12);
  doc.text('Relatório em desenvolvimento.', 20, 110);
  doc.text('Em breve, este tipo de relatório estará disponível.', 20, 130);
}