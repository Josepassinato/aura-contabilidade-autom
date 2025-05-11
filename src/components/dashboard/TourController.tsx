
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

  // Seleciona o tour adequado com base na rota atual
  useEffect(() => {
    if (location.pathname.includes('/clientes')) {
      setCurrentTourSteps(clientsTourSteps);
    } else if (location.pathname.includes('/obrigacoes')) {
      setCurrentTourSteps(fiscalTourSteps);
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
