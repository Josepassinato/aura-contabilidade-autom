import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, ArrowRight, ArrowLeft, Lightbulb, Users, Calendar, FileText, BarChart } from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string;
  icon: React.ComponentType<any>;
  position: 'top' | 'bottom' | 'left' | 'right';
  content?: React.ReactNode;
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Bem-vindo ao ContaFlix! 🎉',
    description: 'Vamos fazer um tour rápido para você conhecer as principais funcionalidades da plataforma.',
    target: 'dashboard-header',
    icon: Lightbulb,
    position: 'bottom'
  },
  {
    id: 'client-cards',
    title: 'Resumo dos Clientes',
    description: 'Aqui você vê um resumo geral: total de clientes, obrigações fiscais pendentes, documentos para revisar e economias fiscais geradas.',
    target: 'client-summary-cards',
    icon: Users,
    position: 'top'
  },
  {
    id: 'fiscal-calendar',
    title: 'Calendário Fiscal',
    description: 'Acompanhe todas as obrigações fiscais e prazos importantes dos seus clientes em um só lugar.',
    target: 'fiscal-calendar',
    icon: Calendar,
    position: 'right'
  },
  {
    id: 'recent-documents',
    title: 'Documentos Recentes',
    description: 'Visualize os últimos documentos enviados pelos clientes e o status de processamento.',
    target: 'recent-documents',
    icon: FileText,
    position: 'left'
  },
  {
    id: 'sidebar-navigation',
    title: 'Navegação Principal',
    description: 'Use a barra lateral para acessar todas as funcionalidades: gestão de clientes, relatórios, configurações e mais.',
    target: 'dashboard-sidebar',
    icon: BarChart,
    position: 'right'
  }
];

interface OnboardingTourProps {
  isOpen: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({
  isOpen,
  onComplete,
  onSkip
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);

  const currentTourStep = tourSteps[currentStep];

  useEffect(() => {
    if (isOpen && currentTourStep) {
      const element = document.querySelector(`[data-tour="${currentTourStep.target}"]`) as HTMLElement;
      setTargetElement(element);
      
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.style.position = 'relative';
        element.style.zIndex = '1001';
        element.style.outline = '3px solid hsl(var(--primary))';
        element.style.outlineOffset = '4px';
        element.style.borderRadius = '8px';
      }
    }

    return () => {
      if (targetElement) {
        targetElement.style.outline = '';
        targetElement.style.outlineOffset = '';
        targetElement.style.zIndex = '';
      }
    };
  }, [currentStep, isOpen, currentTourStep, targetElement]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    if (targetElement) {
      targetElement.style.outline = '';
      targetElement.style.outlineOffset = '';
      targetElement.style.zIndex = '';
    }
    onComplete();
  };

  const handleSkip = () => {
    if (targetElement) {
      targetElement.style.outline = '';
      targetElement.style.outlineOffset = '';
      targetElement.style.zIndex = '';
    }
    onSkip();
  };

  if (!isOpen || !currentTourStep) return null;

  const getTooltipPosition = () => {
    if (!targetElement) return { top: '50%', left: '50%' };
    
    const rect = targetElement.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
    switch (currentTourStep.position) {
      case 'top':
        return {
          top: rect.top + scrollTop - 20,
          left: rect.left + scrollLeft + rect.width / 2,
          transform: 'translate(-50%, -100%)'
        };
      case 'bottom':
        return {
          top: rect.bottom + scrollTop + 20,
          left: rect.left + scrollLeft + rect.width / 2,
          transform: 'translate(-50%, 0)'
        };
      case 'left':
        return {
          top: rect.top + scrollTop + rect.height / 2,
          left: rect.left + scrollLeft - 20,
          transform: 'translate(-100%, -50%)'
        };
      case 'right':
        return {
          top: rect.top + scrollTop + rect.height / 2,
          left: rect.right + scrollLeft + 20,
          transform: 'translate(0, -50%)'
        };
      default:
        return {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        };
    }
  };

  const tooltipStyle = getTooltipPosition();

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-[1000]" />
      
      {/* Tour Card */}
      <div
        className="fixed z-[1002] w-80 animate-fade-in"
        style={tooltipStyle}
      >
        <Card className="shadow-2xl border-2 border-primary/20">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <currentTourStep.icon className="h-5 w-5 text-primary" />
                <Badge variant="secondary">
                  {currentStep + 1} de {tourSteps.length}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSkip}
                className="h-6 w-6"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <CardTitle className="text-lg">{currentTourStep.title}</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <CardDescription className="text-sm leading-relaxed">
              {currentTourStep.description}
            </CardDescription>
            
            {currentTourStep.content && (
              <div className="p-3 bg-muted rounded-lg">
                {currentTourStep.content}
              </div>
            )}
            
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="flex items-center gap-1"
              >
                <ArrowLeft className="h-3 w-3" />
                Anterior
              </Button>
              
              <div className="flex gap-1">
                {tourSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1.5 w-1.5 rounded-full transition-colors ${
                      index === currentStep ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
              
              <Button
                size="sm"
                onClick={handleNext}
                className="flex items-center gap-1"
              >
                {currentStep === tourSteps.length - 1 ? 'Finalizar' : 'Próximo'}
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};