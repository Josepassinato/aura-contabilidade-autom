
import React, { useState, useEffect } from "react";
import { X, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface TourStep {
  id: string;
  title: string;
  description: string;
  element: string; // CSS selector para o elemento a ser destacado
  position: "top" | "bottom" | "left" | "right";
}

interface GuidedTourProps {
  steps: TourStep[];
  isActive: boolean;
  onComplete: () => void;
  onClose: () => void;
}

const GuidedTour: React.FC<GuidedTourProps> = ({
  steps,
  isActive,
  onComplete,
  onClose,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [elementFound, setElementFound] = useState(true);
  const [animateTooltip, setAnimateTooltip] = useState(false);

  // Adicionar rolagem suave até o elemento destacado
  useEffect(() => {
    if (!isActive || steps.length === 0) return;

    const target = document.querySelector(steps[currentStep].element);
    
    if (target) {
      // Garantir que o elemento é visível
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Adicionar animação quando o tooltip mudar
      setAnimateTooltip(true);
      setTimeout(() => setAnimateTooltip(false), 300);
    } else {
      console.warn(`Elemento não encontrado: ${steps[currentStep].element}`);
      setElementFound(false);
    }
  }, [currentStep, isActive, steps]);

  // Posicionar o tooltip próximo ao elemento selecionado
  useEffect(() => {
    if (!isActive || steps.length === 0) return;

    const target = document.querySelector(steps[currentStep].element);
    if (!target) {
      setElementFound(false);
      return;
    }
    
    setElementFound(true);
    const rect = target.getBoundingClientRect();
    const position = steps[currentStep].position;

    let top = 0;
    let left = 0;

    switch (position) {
      case "top":
        top = rect.top - 10 - 180; // altura estimada do tooltip
        left = rect.left + rect.width / 2 - 150; // metade da largura do tooltip
        break;
      case "bottom":
        top = rect.bottom + 10;
        left = rect.left + rect.width / 2 - 150;
        break;
      case "left":
        top = rect.top + rect.height / 2 - 90;
        left = rect.left - 10 - 300; // largura estimada do tooltip
        break;
      case "right":
        top = rect.top + rect.height / 2 - 90;
        left = rect.right + 10;
        break;
    }

    // Garantir que o tooltip não fique fora da tela
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    if (left < 10) left = 10;
    if (left + 300 > windowWidth) left = windowWidth - 310;
    if (top < 10) top = 10;
    if (top + 180 > windowHeight) top = windowHeight - 190;

    setTooltipPosition({ top, left });

    // Adiciona destaque ao elemento alvo com um efeito de pulsação
    target.classList.add("tour-highlight", "tour-pulse");

    return () => {
      // Remove destaque ao mudar de passo
      target.classList.remove("tour-highlight", "tour-pulse");
    };
  }, [currentStep, isActive, steps]);

  if (!isActive || steps.length === 0) return null;

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  return (
    <>
      {/* Overlay escuro com transparência para poder clicar nos elementos */}
      <div className="fixed inset-0 bg-black/50 z-50 pointer-events-none" />

      {/* Tooltip do tour */}
      <Card
        className={`fixed z-[60] w-[300px] shadow-lg ${
          animateTooltip ? "animate-fade-in" : ""
        }`}
        style={{
          top: `${tooltipPosition.top}px`,
          left: `${tooltipPosition.left}px`,
        }}
      >
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">
              {steps[currentStep].title}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            Passo {currentStep + 1} de {steps.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!elementFound ? (
            <p className="text-sm text-yellow-500">
              Elemento não encontrado. Este passo pode não estar disponível no momento.
            </p>
          ) : (
            <p className="text-sm">{steps[currentStep].description}</p>
          )}
          
          {/* Indicadores de passo */}
          <div className="flex justify-center mt-4 gap-1">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => skipToStep(index)}
                className={`h-2 w-2 rounded-full transition-all ${
                  index === currentStep
                    ? "bg-primary w-4"
                    : index < currentStep
                    ? "bg-primary/60"
                    : "bg-muted"
                }`}
                aria-label={`Ir para o passo ${index + 1}`}
              />
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            size="sm"
            disabled={currentStep === 0}
            onClick={prevStep}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Anterior
          </Button>
          <Button size="sm" onClick={nextStep}>
            {currentStep === steps.length - 1 ? (
              <>
                <Check className="h-4 w-4 mr-2" /> Concluir
              </>
            ) : (
              <>
                Próximo <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Adicionar estilos CSS para o highlight */}
      <style>
        {`
        .tour-highlight {
          position: relative;
          z-index: 51;
          box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.5);
          border-radius: 4px;
        }
        .tour-pulse {
          animation: tour-pulse 2s infinite;
        }
        @keyframes tour-pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(124, 58, 237, 0.7);
          }
          70% {
            box-shadow: 0 0 0 6px rgba(124, 58, 237, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(124, 58, 237, 0);
          }
        }
        `}
      </style>
    </>
  );
};

export default GuidedTour;
