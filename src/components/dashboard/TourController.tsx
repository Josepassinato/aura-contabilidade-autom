
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import GuidedTour from '../tour/GuidedTour';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export const TourController = () => {
  const [isTourActive, setIsTourActive] = useState(false);
  const [hasSeenTour, setHasSeenTour] = useLocalStorage('contaflix-has-seen-tour', false);
  const [showTourButton, setShowTourButton] = useState(true);

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
  };

  const handleCloseTour = () => {
    setIsTourActive(false);
    setHasSeenTour(true);
  };

  const handleStartTour = () => {
    setIsTourActive(true);
  };

  const tourSteps = [
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
      id: 'settings',
      title: 'Configurações',
      description: 'Acesse as configurações para personalizar o sistema e configurar integrações com serviços externos.',
      element: '.settings-link',
      position: 'bottom' as const,
    },
  ];

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
        steps={tourSteps}
        isActive={isTourActive}
        onComplete={handleCompleteTour}
        onClose={handleCloseTour}
      />
    </>
  );
};

export default TourController;
