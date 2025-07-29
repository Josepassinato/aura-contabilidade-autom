// Dados de demonstração para o onboarding
export const demoClients = [
  {
    id: 'demo-1',
    name: 'Padaria São José Ltda',
    email: 'contato@padariasaojose.com.br',
    cnpj: '12.345.678/0001-90',
    status: 'Ativo',
    regime: 'Simples Nacional',
    documentsPending: 3,
    upcomingDeadlines: 2
  },
  {
    id: 'demo-2',
    name: 'Consultoria Tech Solutions',
    email: 'admin@techsolutions.com.br',
    cnpj: '98.765.432/0001-10',
    status: 'Ativo',
    regime: 'Lucro Presumido',
    documentsPending: 1,
    upcomingDeadlines: 1
  },
  {
    id: 'demo-3',
    name: 'Restaurante Bella Vista',
    email: 'gerencia@bellavista.com.br',
    cnpj: '11.222.333/0001-44',
    status: 'Ativo',
    regime: 'Simples Nacional',
    documentsPending: 0,
    upcomingDeadlines: 3
  }
];

export const demoDocuments = [
  {
    id: 'doc-1',
    title: 'Notas Fiscais - Dezembro 2024',
    name: 'nf_dezembro_2024.pdf',
    type: 'Nota Fiscal',
    status: 'Processado',
    client: 'Padaria São José Ltda',
    date: '2024-12-15',
    size: '2.3 MB'
  },
  {
    id: 'doc-2',
    title: 'Extrato Bancário - Novembro',
    name: 'extrato_nov_2024.pdf',
    type: 'Extrato Bancário',
    status: 'Pendente',
    client: 'Consultoria Tech Solutions',
    date: '2024-12-10',
    size: '1.8 MB'
  },
  {
    id: 'doc-3',
    title: 'Folha de Pagamento - Dezembro',
    name: 'folha_dezembro.xlsx',
    type: 'Folha de Pagamento',
    status: 'Processado',
    client: 'Restaurante Bella Vista',
    date: '2024-12-08',
    size: '890 KB'
  },
  {
    id: 'doc-4',
    title: 'Relatório de Vendas - Q4',
    name: 'vendas_q4_2024.pdf',
    type: 'Relatório',
    status: 'Revisão',
    client: 'Padaria São José Ltda',
    date: '2024-12-05',
    size: '1.2 MB'
  }
];

export const demoFiscalEvents = [
  {
    id: 'event-1',
    title: 'DASN-SIMEI - Padaria São José',
    date: '2025-01-31',
    type: 'Declaração',
    priority: 'Alta',
    client: 'Padaria São José Ltda',
    status: 'Pendente'
  },
  {
    id: 'event-2',
    title: 'DEFIS - Tech Solutions',
    date: '2025-01-31',
    type: 'Declaração',
    priority: 'Alta',
    client: 'Consultoria Tech Solutions',
    status: 'Pendente'
  },
  {
    id: 'event-3',
    title: 'DAS Janeiro - Bella Vista',
    date: '2025-01-20',
    type: 'Pagamento',
    priority: 'Média',
    client: 'Restaurante Bella Vista',
    status: 'Agendado'
  },
  {
    id: 'event-4',
    title: 'SPED Fiscal - Tech Solutions',
    date: '2025-01-15',
    type: 'Escrituração',
    priority: 'Alta',
    client: 'Consultoria Tech Solutions',
    status: 'Em Processo'
  },
  {
    id: 'event-5',
    title: 'Relatório Mensal - Padaria',
    date: '2025-01-10',
    type: 'Relatório',
    priority: 'Baixa',
    client: 'Padaria São José Ltda',
    status: 'Concluído'
  }
];

export const demoStats = {
  totalClients: demoClients.length,
  totalDocumentsPending: demoDocuments.filter(doc => doc.status === 'Pendente').length,
  totalUpcomingDeadlines: demoFiscalEvents.filter(event => 
    event.status === 'Pendente' && new Date(event.date) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  ).length,
  fiscalSavings: 25000, // R$ 25.000 em economias fiscais
  processingEfficiency: 92, // 92% de eficiência no processamento
  clientSatisfaction: 4.8 // 4.8/5 de satisfação
};

export const demoFeatures = [
  {
    title: 'Gestão de Clientes',
    description: 'Centralize todas as informações dos seus clientes em um só lugar.',
    icon: 'Users',
    benefits: ['Perfis completos', 'Histórico detalhado', 'Comunicação integrada']
  },
  {
    title: 'Automação Fiscal',
    description: 'Automatize cálculos e geração de documentos fiscais.',
    icon: 'Calculator',
    benefits: ['Cálculos automáticos', 'Conformidade garantida', 'Redução de erros']
  },
  {
    title: 'Calendário Inteligente',
    description: 'Nunca mais perca um prazo fiscal importante.',
    icon: 'Calendar',
    benefits: ['Alertas automáticos', 'Sincronização', 'Priorização inteligente']
  },
  {
    title: 'Relatórios Avançados',
    description: 'Insights poderosos para tomada de decisão.',
    icon: 'BarChart',
    benefits: ['Dashboards interativos', 'Análises preditivas', 'Exportação flexível']
  }
];

// Helper para simular dados no localStorage
export const initializeDemoData = () => {
  if (typeof window === 'undefined') return;
  
  const isDemoMode = localStorage.getItem('contaflix_demo_mode');
  if (!isDemoMode) {
    localStorage.setItem('contaflix_demo_mode', 'true');
    localStorage.setItem('contaflix_demo_clients', JSON.stringify(demoClients));
    localStorage.setItem('contaflix_demo_documents', JSON.stringify(demoDocuments));
    localStorage.setItem('contaflix_demo_events', JSON.stringify(demoFiscalEvents));
    localStorage.setItem('contaflix_demo_stats', JSON.stringify(demoStats));
  }
};

export const getDemoData = () => {
  if (typeof window === 'undefined') return { clients: [], documents: [], events: [], stats: demoStats };
  
  return {
    clients: JSON.parse(localStorage.getItem('contaflix_demo_clients') || '[]'),
    documents: JSON.parse(localStorage.getItem('contaflix_demo_documents') || '[]'),
    events: JSON.parse(localStorage.getItem('contaflix_demo_events') || '[]'),
    stats: JSON.parse(localStorage.getItem('contaflix_demo_stats') || JSON.stringify(demoStats))
  };
};

export const clearDemoData = () => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('contaflix_demo_mode');
  localStorage.removeItem('contaflix_demo_clients');
  localStorage.removeItem('contaflix_demo_documents');
  localStorage.removeItem('contaflix_demo_events');
  localStorage.removeItem('contaflix_demo_stats');
};