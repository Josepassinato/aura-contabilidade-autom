import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import GuidedTour from '../tour/GuidedTour';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useLocation } from 'react-router-dom';

export const TourController = () => {
  const [isTourActive, setIsTourActive] = useState(false);
  const [hasSeenTour, setHasSeenTour] = useLocalStorage('contaflix-has-seen-tour', false);
  const [showTourButton, setShowTourButton] = useState(true);
  const location = useLocation();

  // Define tours específicos para diferentes páginas
  const [currentTourSteps, setCurrentTourSteps] = useState<any[]>([]);

  // Tour steps padrão (dashboard)
  const dashboardTourSteps = [
    {
      id: 'dashboard',
      title: 'Painel Principal',
      description: 'Esse é o seu painel principal onde você pode visualizar métricas importantes e acessar as principais funcionalidades.',
      element: '.dashboard-main',
      position: 'bottom' as const,
    },
    {
      id: 'sidebar',
      title: 'Menu de Navegação',
      description: 'Use o menu lateral para navegar entre as diferentes seções do sistema.',
      element: '.sidebar-nav',
      position: 'right' as const,
    },
    {
      id: 'clients',
      title: 'Gestão de Clientes',
      description: 'Aqui você pode gerenciar todos os seus clientes, adicionar novos e visualizar informações detalhadas.',
      element: '.client-section',
      position: 'bottom' as const,
    },
    {
      id: 'voice-assistant',
      title: 'Assistente de Voz',
      description: 'Use nosso assistente de voz IA para obter informações, gerar relatórios ou executar tarefas rapidamente.',
      element: '.voice-assistant-button',
      position: 'left' as const,
    },
    {
      id: 'fiscal-integrations',
      title: 'Integrações Fiscais',
      description: 'Acesse suas integrações com a Receita Federal, SEFAZ e outros órgãos governamentais.',
      element: '.fiscal-integrations',
      position: 'bottom' as const,
    },
    {
      id: 'banking-integrations',
      title: 'Integrações Bancárias',
      description: 'Gerencie suas integrações bancárias para automatizar a importação de extratos e pagamentos.',
      element: '.banking-integrations',
      position: 'bottom' as const,
    },
    {
      id: 'settings',
      title: 'Configurações',
      description: 'Acesse as configurações para personalizar o sistema e configurar integrações com serviços externos.',
      element: '.settings-link',
      position: 'bottom' as const,
    },
  ];

  // Tour steps para a página de clientes
  const clientsTourSteps = [
    {
      id: 'client-list',
      title: 'Lista de Clientes',
      description: 'Aqui você pode visualizar todos os seus clientes cadastrados.',
      element: '.client-list',
      position: 'bottom' as const,
    },
    {
      id: 'add-client',
      title: 'Adicionar Cliente',
      description: 'Clique aqui para adicionar um novo cliente ao sistema.',
      element: '.add-client-button',
      position: 'bottom' as const,
    },
    {
      id: 'client-filters',
      title: 'Filtros de Clientes',
      description: 'Use esses filtros para encontrar rapidamente os clientes que você procura.',
      element: '.client-filters',
      position: 'bottom' as const,
    },
    {
      id: 'client-actions',
      title: 'Ações de Cliente',
      description: 'Aqui você pode editar, visualizar detalhes ou excluir um cliente.',
      element: '.client-actions',
      position: 'left' as const,
    },
  ];

  // Tour steps para a página de obrigações fiscais
  const fiscalTourSteps = [
    {
      id: 'fiscal-calendar',
      title: 'Calendário Fiscal',
      description: 'Visualize todas as obrigações fiscais organizadas por data.',
      element: '.fiscal-calendar',
      position: 'bottom' as const,
    },
    {
      id: 'fiscal-filters',
      title: 'Filtros de Obrigações',
      description: 'Use esses filtros para visualizar obrigações por período, tipo ou status.',
      element: '.fiscal-filters',
      position: 'right' as const,
    },
    {
      id: 'obligation-actions',
      title: 'Ações de Obrigações',
      description: 'Aqui você pode marcar como concluída, adiar ou delegar uma obrigação fiscal.',
      element: '.obligation-actions',
      position: 'left' as const,
    },
  ];

  // Novo tour para automação bancária
  const bankingTourSteps = [
    {
      id: 'banking-header',
      title: 'Automação Bancária',
      description: 'Gerencie todas as operações bancárias da sua empresa e seus clientes em um só lugar.',
      element: '.banco-header',
      position: 'bottom' as const,
    },
    {
      id: 'banking-tabs',
      title: 'Funcionalidades Bancárias',
      description: 'Acesse diferentes funcionalidades bancárias: pagamentos PIX, tributos, folha de pagamento e extratos.',
      element: '.banco-tabs',
      position: 'top' as const,
    },
    {
      id: 'payment-scheduling',
      title: 'Agendamento de Pagamentos',
      description: 'Agende pagamentos únicos ou em lote para seus clientes, com integração bancária automatizada.',
      element: '.payment-scheduling',
      position: 'bottom' as const,
    },
    {
      id: 'batch-import',
      title: 'Importação em Lote',
      description: 'Importe pagamentos em lote de arquivos CSV ou JSON para processar múltiplos pagamentos de uma vez.',
      element: '.batch-import',
      position: 'top' as const,
    },
  ];

  // Novo tour para folha de pagamento
  const payrollTourSteps = [
    {
      id: 'payroll-header',
      title: 'Folha de Pagamento',
      description: 'Gerencie a folha de pagamento dos seus clientes com facilidade.',
      element: '.payroll-header',
      position: 'bottom' as const,
    },
    {
      id: 'employee-list',
      title: 'Lista de Funcionários',
      description: 'Visualize e gerencie todos os funcionários cadastrados.',
      element: '.employees-list',
      position: 'bottom' as const,
    },
    {
      id: 'payroll-filter',
      title: 'Filtros de Folha',
      description: 'Use esses filtros para encontrar rapidamente informações específicas da folha de pagamento.',
      element: '.payroll-filter',
      position: 'right' as const,
    },
    {
      id: 'payroll-generation',
      title: 'Geração de Folha',
      description: 'Gere a folha de pagamento mensal com apenas alguns cliques.',
      element: '.payroll-generation',
      position: 'bottom' as const,
    },
    {
      id: 'payroll-reports',
      title: 'Relatórios de Folha',
      description: 'Acesse relatórios detalhados sobre a folha de pagamento.',
      element: '.payroll-reports',
      position: 'left' as const,
    },
  ];

  // Novo tour para guias fiscais
  const taxGuidesTourSteps = [
    {
      id: 'tax-guides-header',
      title: 'Guias Fiscais',
      description: 'Gerencie todas as guias fiscais dos seus clientes em um só lugar.',
      element: '.tax-guides-header',
      position: 'bottom' as const,
    },
    {
      id: 'tax-guides-list',
      title: 'Lista de Guias',
      description: 'Visualize todas as guias fiscais organizadas por vencimento.',
      element: '.tax-guides-list',
      position: 'bottom' as const,
    },
    {
      id: 'tax-guides-generation',
      title: 'Geração de Guias',
      description: 'Gere novas guias fiscais com cálculos automáticos baseados em regimes tributários.',
      element: '.tax-guides-generation',
      position: 'right' as const,
    },
    {
      id: 'tax-guide-payment',
      title: 'Pagamento de Guias',
      description: 'Agende o pagamento de guias fiscais diretamente pelo sistema.',
      element: '.tax-guide-payment',
      position: 'left' as const,
    },
  ];

  // Novo tour para relatórios financeiros
  const financialReportsTourSteps = [
    {
      id: 'reports-header',
      title: 'Relatórios Financeiros',
      description: 'Acesse relatórios financeiros detalhados para seus clientes.',
      element: '.reports-header',
      position: 'bottom' as const,
    },
    {
      id: 'balance-sheet',
      title: 'Balanço Patrimonial',
      description: 'Visualize o balanço patrimonial completo com análises automatizadas.',
      element: '.balance-sheet',
      position: 'right' as const,
    },
    {
      id: 'income-statement',
      title: 'DRE',
      description: 'Acesse a Demonstração do Resultado do Exercício com gráficos interativos.',
      element: '.income-statement',
      position: 'bottom' as const,
    },
    {
      id: 'cash-flow',
      title: 'Fluxo de Caixa',
      description: 'Analise o fluxo de caixa com projeções e comparativos.',
      element: '.cash-flow',
      position: 'left' as const,
    },
    {
      id: 'financial-indexes',
      title: 'Índices Financeiros',
      description: 'Visualize indicadores financeiros importantes para tomada de decisão.',
      element: '.financial-indexes',
      position: 'right' as const,
    },
  ];

  // Novo tour para análises preditivas
  const predictiveAnalyticsTourSteps = [
    {
      id: 'analytics-header',
      title: 'Análises Preditivas',
      description: 'Utilize inteligência artificial para prever tendências financeiras.',
      element: '.analytics-header',
      position: 'bottom' as const,
    },
    {
      id: 'anomaly-detector',
      title: 'Detector de Anomalias',
      description: 'Identifique automaticamente transações suspeitas ou inconsistências contábeis.',
      element: '.anomaly-detector',
      position: 'right' as const,
    },
    {
      id: 'predictive-analysis',
      title: 'Análises Preditivas',
      description: 'Visualize previsões de receitas, despesas e fluxo de caixa para os próximos meses.',
      element: '.predictive-analysis',
      position: 'bottom' as const,
    },
  ];

  // Novo tour para integrações governamentais
  const govIntegrationsTourSteps = [
    {
      id: 'gov-integrations-header',
      title: 'Integrações Governamentais',
      description: 'Gerencie suas integrações com sistemas governamentais.',
      element: '.gov-integrations-header',
      position: 'bottom' as const,
    },
    {
      id: 'ecac-integration',
      title: 'Integração e-CAC',
      description: 'Configure e monitore a integração com o portal e-CAC da Receita Federal.',
      element: '.ecac-integration',
      position: 'right' as const,
    },
    {
      id: 'sefaz-integration',
      title: 'Integração SEFAZ',
      description: 'Gerencie a integração com portais das Secretarias de Fazenda estaduais.',
      element: '.sefaz-integration',
      position: 'bottom' as const,
    },
    {
      id: 'certificates',
      title: 'Certificados Digitais',
      description: 'Gerencie seus certificados digitais utilizados nas integrações.',
      element: '.certificates-section',
      position: 'left' as const,
    },
  ];
  
  // Novo tour para apuração automática
  const autoCalculationTourSteps = [
    {
      id: 'auto-calculation-header',
      title: 'Apuração Automática',
      description: 'Configure e execute apurações automáticas de impostos.',
      element: '.apuracao-header',
      position: 'bottom' as const,
    },
    {
      id: 'calculation-config',
      title: 'Configuração de Apuração',
      description: 'Configure regras e parâmetros para a apuração automática de impostos.',
      element: '.apuracao-config',
      position: 'right' as const,
    },
    {
      id: 'processing-status',
      title: 'Status de Processamento',
      description: 'Acompanhe o status do processamento das apurações automáticas.',
      element: '.processing-status',
      position: 'bottom' as const,
    },
    {
      id: 'calculation-results',
      title: 'Resultados da Apuração',
      description: 'Visualize os resultados detalhados das apurações automáticas.',
      element: '.apuracao-results',
      position: 'left' as const,
    },
  ];

  // Seleciona o tour adequado com base na rota atual
  useEffect(() => {
    if (location.pathname.includes('/clientes')) {
      setCurrentTourSteps(clientsTourSteps);
    } else if (location.pathname.includes('/obrigacoes')) {
      setCurrentTourSteps(fiscalTourSteps);
    } else if (location.pathname.includes('/automacao-bancaria')) {
      setCurrentTourSteps(bankingTourSteps);
    } else if (location.pathname.includes('/folha-pagamento')) {
      setCurrentTourSteps(payrollTourSteps);
    } else if (location.pathname.includes('/guias-fiscais')) {
      setCurrentTourSteps(taxGuidesTourSteps);
    } else if (location.pathname.includes('/relatorios-financeiros')) {
      setCurrentTourSteps(financialReportsTourSteps);
    } else if (location.pathname.includes('/analises-preditivas')) {
      setCurrentTourSteps(predictiveAnalyticsTourSteps);
    } else if (location.pathname.includes('/integracoes-gov')) {
      setCurrentTourSteps(govIntegrationsTourSteps);
    } else if (location.pathname.includes('/apuracao-automatica')) {
      setCurrentTourSteps(autoCalculationTourSteps);
    } else {
      setCurrentTourSteps(dashboardTourSteps);
    }
  }, [location.pathname]);

  useEffect(() => {
    // Verificar se é a primeira visita para mostrar o tour automaticamente
    if (!hasSeenTour) {
      // Pequeno delay para garantir que os elementos estejam carregados
      const timer = setTimeout(() => {
        setIsTourActive(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [hasSeenTour]);

  const handleCompleteTour = () => {
    setIsTourActive(false);
    setHasSeenTour(true);
    
    // Mostrar mensagem de conclusão
    const completionMessage = document.createElement('div');
    completionMessage.className = 'fixed bottom-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-2 rounded-md shadow-lg z-50 transition-opacity animate-fade-in';
    completionMessage.textContent = 'Tour concluído! Você pode iniciá-lo novamente a qualquer momento.';
    document.body.appendChild(completionMessage);
    
    setTimeout(() => {
      completionMessage.classList.add('opacity-0');
      setTimeout(() => document.body.removeChild(completionMessage), 300);
    }, 3000);
  };

  const handleCloseTour = () => {
    setIsTourActive(false);
    setHasSeenTour(true);
  };

  const handleStartTour = () => {
    setIsTourActive(true);
  };

  return (
    <>
      {showTourButton && (
        <div className="fixed bottom-4 left-4 z-40">
          <Button
            onClick={handleStartTour}
            variant="secondary"
            className="rounded-full"
          >
            <HelpCircle className="h-5 w-5 mr-2" />
            Tour Guiado
          </Button>
        </div>
      )}

      <GuidedTour
        steps={currentTourSteps}
        isActive={isTourActive}
        onComplete={handleCompleteTour}
        onClose={handleCloseTour}
      />
    </>
  );
};

export default TourController;
