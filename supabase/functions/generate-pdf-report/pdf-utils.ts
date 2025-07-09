export function getReportTitle(reportType: string, clientName: string): string {
  const titles: { [key: string]: string } = {
    'balancete': `Balancete Patrimonial - ${clientName}`,
    'dre': `Demonstração do Resultado - ${clientName}`,
    'obrigacoes': `Resumo de Obrigações - ${clientName}`,
    'resumo_fiscal': `Resumo Fiscal - ${clientName}`,
    'fluxo_caixa': `Fluxo de Caixa - ${clientName}`,
    'analise_financeira': `Análise Financeira - ${clientName}`,
    'comparativo_mensal': `Comparativo Mensal - ${clientName}`,
    'indicadores_performance': `Indicadores de Performance - ${clientName}`
  };
  return titles[reportType] || `Relatório - ${clientName}`;
}

export function getReportDescription(reportType: string): string {
  const descriptions: { [key: string]: string } = {
    'balancete': 'Relatório detalhado do balancete patrimonial',
    'dre': 'Demonstração do resultado do exercício',
    'obrigacoes': 'Lista de obrigações fiscais e seus status',
    'resumo_fiscal': 'Resumo completo da situação fiscal da empresa',
    'fluxo_caixa': 'Relatório de fluxo de caixa da empresa',
    'analise_financeira': 'Análise financeira avançada com indicadores',
    'comparativo_mensal': 'Comparativo de performance mensal',
    'indicadores_performance': 'Indicadores de performance e KPIs'
  };
  return descriptions[reportType] || 'Relatório contábil';
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value || 0);
}