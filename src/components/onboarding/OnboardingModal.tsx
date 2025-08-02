import React from 'react';
import { CheckCircle, ArrowRight, ArrowLeft, X, SkipForward } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useOnboarding } from './OnboardingProvider';
import { OnboardingStepContent } from './OnboardingStepContent';

export function OnboardingModal() {
  const {
    isOnboardingActive,
    currentStep,
    steps,
    progress,
    nextStep,
    previousStep,
    skipStep,
    finishOnboarding,
    skipOnboarding
  } = useOnboarding();

  if (!isOnboardingActive) return null;

  const currentStepData = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      finishOnboarding();
    } else {
      nextStep();
    }
  };

  return (
    <Dialog open={isOnboardingActive} onOpenChange={skipOnboarding}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="absolute right-4 top-4 z-50">
          <Button
            variant="ghost"
            size="sm"
            onClick={skipOnboarding}
            className="text-muted-foreground hover:text-foreground"
            title="Fechar assistente de configuração"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <DialogHeader className="space-y-4 pr-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DialogTitle className="text-xl">{currentStepData?.title}</DialogTitle>
              <Badge variant="outline">
                {currentStep + 1} de {steps.length}
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={skipOnboarding}
              className="text-xs"
            >
              Pular Tutorial
            </Button>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progresso da Configuração</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          <p className="text-muted-foreground">{currentStepData?.description}</p>
        </DialogHeader>

        <div className="py-6">
          <OnboardingStepContent stepId={currentStepData?.id} />
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex gap-2">
            {!isFirstStep && (
              <Button variant="outline" onClick={previousStep}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Anterior
              </Button>
            )}
            
            {currentStepData?.skippable && !isLastStep && (
              <Button variant="ghost" onClick={skipStep}>
                <SkipForward className="mr-2 h-4 w-4" />
                Pular
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            {isLastStep ? (
              <Button onClick={handleNext} className="min-w-32">
                <CheckCircle className="mr-2 h-4 w-4" />
                Finalizar
              </Button>
            ) : (
              <Button onClick={handleNext} className="min-w-32">
                Próximo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex justify-center gap-2 pt-2">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`h-2 w-8 rounded-full transition-colors ${
                index <= currentStep
                  ? 'bg-primary'
                  : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}