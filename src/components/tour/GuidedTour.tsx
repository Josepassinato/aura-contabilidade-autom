
import React, { useState, useEffect } from "react";
import { X, ArrowRight, ArrowLeft } from "lucide-react";
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

  // Posicionar o tooltip próximo ao elemento selecionado
  useEffect(() => {
    if (!isActive || steps.length === 0) return;

    const target = document.querySelector(steps[currentStep].element);
    if (!target) return;

    const rect = target.getBoundingClientRect();
    const position = steps[currentStep].position;

    let top = 0;
    let left = 0;

    switch (position) {
      case "top":
        top = rect.top - 10 - 150; // altura estimada do tooltip
        left = rect.left + rect.width / 2 - 150; // metade da largura do tooltip
        break;
      case "bottom":
        top = rect.bottom + 10;
        left = rect.left + rect.width / 2 - 150;
        break;
      case "left":
        top = rect.top + rect.height / 2 - 75;
        left = rect.left - 10 - 300; // largura estimada do tooltip
        break;
      case "right":
        top = rect.top + rect.height / 2 - 75;
        left = rect.right + 10;
        break;
    }

    // Garantir que o tooltip não fique fora da tela
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    if (left < 10) left = 10;
    if (left + 300 > windowWidth) left = windowWidth - 310;
    if (top < 10) top = 10;
    if (top + 150 > windowHeight) top = windowHeight - 160;

    setTooltipPosition({ top, left });

    // Adiciona destaque ao elemento alvo
    target.classList.add("tour-highlight");

    return () => {
      // Remove destaque ao mudar de passo
      target.classList.remove("tour-highlight");
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

  return (
    <>
      {/* Overlay escuro */}
      <div className="fixed inset-0 bg-black/50 z-50 pointer-events-none" />

      {/* Tooltip do tour */}
      <Card
        className="fixed z-[60] w-[300px] shadow-lg"
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
          <p className="text-sm">{steps[currentStep].description}</p>
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
            {currentStep === steps.length - 1 ? "Concluir" : "Próximo"}{" "}
            {currentStep !== steps.length - 1 && <ArrowRight className="h-4 w-4 ml-2" />}
          </Button>
        </CardFooter>
      </Card>
    </>
  );
};

export default GuidedTour;
