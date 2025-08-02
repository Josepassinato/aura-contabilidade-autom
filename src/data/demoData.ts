// Sistema de dados demo para demonstração da aplicação
export const demoClients = [
  {
    id: 'demo-client-1',
    name: 'Tech Solutions LTDA',
    cnpj: '12.345.678/0001-90',
    email: 'contato@techsolutions.com.br',
    phone: '(11) 99999-1234',
    status: 'active',
    regime: 'lucro_presumido',
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'demo-client-2', 
    name: 'Comercial ABC ME',
    cnpj: '98.765.432/0001-10',
    email: 'financeiro@comercialabc.com.br',
    phone: '(11) 88888-5678',
    status: 'active',
    regime: 'simples_nacional',
    created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'demo-client-3',
    name: 'Inovação Digital S/A',
    cnpj: '11.222.333/0001-44',
    email: 'admin@inovacaodigital.com.br', 
    phone: '(11) 77777-9012',
    status: 'active',
    regime: 'lucro_real',
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export const demoDocuments = [
  {
    id: 'demo-doc-1',
    client_id: 'demo-client-1',
    title: 'Nota Fiscal de Serviços - Janeiro',
    file_name: 'nfs_janeiro_2024.pdf',
    file_path: '/demo/nfs_janeiro.pdf',
    status: 'approved',
    category: 'fiscal',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'demo-doc-2',
    client_id: 'demo-client-1', 
    title: 'Extrato Bancário - Dezembro',
    file_name: 'extrato_dezembro_2023.pdf',
    file_path: '/demo/extrato_dezembro.pdf',
    status: 'pending',
    category: 'bancario',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'demo-doc-3',
    client_id: 'demo-client-2',
    title: 'Comprovante de Pagamento DARF',
    file_name: 'darf_pagamento_janeiro.pdf', 
    file_path: '/demo/darf_janeiro.pdf',
    status: 'approved',
    category: 'fiscal',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'demo-doc-4',
    client_id: 'demo-client-3',
    title: 'Balancete Analítico - Janeiro',
    file_name: 'balancete_janeiro_2024.xlsx',
    file_path: '/demo/balancete_janeiro.xlsx',
    status: 'processing',
    category: 'contabil',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export const demoFiscalEvents = [
  {
    id: 'demo-event-1',
    client_id: 'demo-client-1',
    nome: 'DARF - PIS/COFINS',
    tipo: 'federal',
    prazo: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    empresa: 'Tech Solutions LTDA',
    status: 'pendente',
    prioridade: 'alta'
  },
  {
    id: 'demo-event-2',
    client_id: 'demo-client-2',
    nome: 'DAS - Simples Nacional',
    tipo: 'federal', 
    prazo: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    empresa: 'Comercial ABC ME',
    status: 'pendente',
    prioridade: 'media'
  },
  {
    id: 'demo-event-3',
    client_id: 'demo-client-3',
    nome: 'ICMS - Estado de SP',
    tipo: 'estadual',
    prazo: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    empresa: 'Inovação Digital S/A',
    status: 'pendente',
    prioridade: 'media'
  }
];

export const demoTransactions = [
  {
    id: 'demo-trans-1',
    client_id: 'demo-client-1',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Prestação de Serviços - Cliente XYZ',
    amount: 15000.00,
    type: 'receita',
    category: 'servicos',
    status: 'processado'
  },
  {
    id: 'demo-trans-2', 
    client_id: 'demo-client-1',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Pagamento Fornecedor ABC',
    amount: -3500.00,
    type: 'despesa',
    category: 'fornecedores',
    status: 'processado'
  },
  {
    id: 'demo-trans-3',
    client_id: 'demo-client-2',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Venda de Produtos',
    amount: 8750.00,
    type: 'receita',
    category: 'vendas',
    status: 'processado'
  }
];

export const demoReports = [
  {
    id: 'demo-report-1',
    client_id: 'demo-client-1',
    title: 'Relatório Mensal - Janeiro 2024',
    report_type: 'monthly',
    file_format: 'pdf',
    generation_status: 'completed',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'demo-report-2',
    client_id: 'demo-client-2', 
    title: 'DRE Simplificada - Janeiro 2024',
    report_type: 'dre',
    file_format: 'pdf',
    generation_status: 'completed',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export const demoStats = {
  totalClients: demoClients.length,
  totalDocumentsPending: demoDocuments.filter(doc => doc.status === 'pending').length,
  totalUpcomingDeadlines: demoFiscalEvents.filter(event => event.status === 'pendente').length,
  fiscalSavings: 15750.00,
  processingEfficiency: 92,
  clientSatisfaction: 4.8
};

export const demoFeatures = [
  {
    id: 'feature-1',
    name: 'Gestão de Documentos',
    title: 'Gestão Inteligente de Documentos',
    description: 'Upload e organização automática de documentos fiscais',
    icon: 'FileText',
    enabled: true,
    benefits: [
      'Classificação automática por tipo',
      'OCR para extração de dados',
      'Organização por cliente e período',
      'Backup automático na nuvem'
    ]
  },
  {
    id: 'feature-2',
    name: 'Agenda Fiscal',
    title: 'Controle de Prazos Fiscais',
    description: 'Controle automático de prazos e obrigações',
    icon: 'Calendar',
    enabled: true,
    benefits: [
      'Alertas automáticos de vencimento',
      'Integração com calendário',
      'Histórico de cumprimento',
      'Relatórios de compliance'
    ]
  },
  {
    id: 'feature-3',
    name: 'Relatórios Financeiros',
    title: 'Relatórios Automáticos',
    description: 'Geração automática de DRE, balancetes e demonstrativos',
    icon: 'TrendingUp',
    enabled: true,
    benefits: [
      'DRE automática',
      'Balancetes mensais',
      'Análise de tendências',
      'Export em múltiplos formatos'
    ]
  }
];

// Estado do modo demo
let isDemoModeActive = false;
let demoDataStore = {
  clients: [],
  documents: [],
  events: [],
  transactions: [],
  reports: [],
  stats: { ...demoStats }
};

export const initializeDemoData = () => {
  console.log('🎬 Inicializando dados demo...');
  
  isDemoModeActive = true;
  demoDataStore = {
    clients: [...demoClients],
    documents: [...demoDocuments], 
    events: [...demoFiscalEvents],
    transactions: [...demoTransactions],
    reports: [...demoReports],
    stats: { ...demoStats }
  };
  
  // Salvar no localStorage para persistência
  localStorage.setItem('contaflix_demo_mode', 'true');
  localStorage.setItem('contaflix_demo_data', JSON.stringify(demoDataStore));
  
  console.log('✅ Dados demo carregados:', demoDataStore);
};

export const getDemoData = () => {
  // Tentar carregar do localStorage primeiro
  const savedDemo = localStorage.getItem('contaflix_demo_data');
  const isDemoMode = localStorage.getItem('contaflix_demo_mode') === 'true';
  
  if (isDemoMode && savedDemo) {
    try {
      const parsed = JSON.parse(savedDemo);
      return parsed;
    } catch (error) {
      console.warn('Erro ao carregar dados demo salvos:', error);
    }
  }
  
  // Retornar dados vazios se não há demo ativo
  return {
    clients: [],
    documents: [],
    events: [],
    transactions: [],
    reports: [],
    stats: {
      totalClients: 0,
      totalDocumentsPending: 0,
      totalUpcomingDeadlines: 0,
      fiscalSavings: 0,
      processingEfficiency: 0,
      clientSatisfaction: 0
    }
  };
};

export const clearDemoData = () => {
  console.log('🧹 Limpando dados demo...');
  
  isDemoModeActive = false;
  demoDataStore = {
    clients: [],
    documents: [],
    events: [],
    transactions: [],
    reports: [],
    stats: {
      totalClients: 0,
      totalDocumentsPending: 0, 
      totalUpcomingDeadlines: 0,
      fiscalSavings: 0,
      processingEfficiency: 0,
      clientSatisfaction: 0
    }
  };
  
  // Limpar localStorage
  localStorage.removeItem('contaflix_demo_mode');
  localStorage.removeItem('contaflix_demo_data');
  
  console.log('✅ Dados demo removidos');
};

export const isDemoMode = () => {
  return localStorage.getItem('contaflix_demo_mode') === 'true';
};

export const addDemoClient = (client: any) => {
  if (!isDemoMode()) return;
  
  const currentData = getDemoData();
  currentData.clients.push(client);
  currentData.stats.totalClients = currentData.clients.length;
  
  localStorage.setItem('contaflix_demo_data', JSON.stringify(currentData));
};

export const addDemoDocument = (document: any) => {
  if (!isDemoMode()) return;
  
  const currentData = getDemoData();
  currentData.documents.push(document);
  currentData.stats.totalDocumentsPending = currentData.documents.filter(doc => doc.status === 'pending').length;
  
  localStorage.setItem('contaflix_demo_data', JSON.stringify(currentData));
};