import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/contexts/auth/useAuth';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component?: string;
  completed: boolean;
  skippable: boolean;
}

interface OnboardingContextType {
  isOnboardingActive: boolean;
  currentStep: number;
  steps: OnboardingStep[];
  totalSteps: number;
  progress: number;
  nextStep: () => void;
  previousStep: () => void;
  skipStep: () => void;
  completeStep: (stepId: string) => void;
  startOnboarding: () => void;
  finishOnboarding: () => void;
  skipOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const defaultSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Bem-vindo!',
    description: 'Vamos configurar sua conta em alguns passos simples.',
    completed: false,
    skippable: false
  },
  {
    id: 'profile',
    title: 'Complete seu Perfil',
    description: 'Adicione suas informações básicas para personalizar sua experiência.',
    completed: false,
    skippable: true
  },
  {
    id: 'first-client',
    title: 'Adicionar Primeiro Cliente',
    description: 'Configure seu primeiro cliente para começar a usar o sistema.',
    completed: false,
    skippable: true
  },
  {
    id: 'integrations',
    title: 'Configurar Integrações',
    description: 'Conecte suas ferramentas favoritas para automatizar processos.',
    completed: false,
    skippable: true
  },
  {
    id: 'completion',
    title: 'Tudo Pronto!',
    description: 'Sua conta está configurada. Explore todas as funcionalidades disponíveis.',
    completed: false,
    skippable: false
  }
];

interface OnboardingProviderProps {
  children: ReactNode;
}

export function OnboardingProvider({ children }: OnboardingProviderProps) {
  const { userProfile } = useAuth();
  const [isOnboardingActive, setIsOnboardingActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<OnboardingStep[]>(defaultSteps);

  // Verificar se o usuário precisa fazer onboarding
  useEffect(() => {
    if (userProfile) {
      // Verificar se o onboarding já foi completado (usando localStorage como fallback)
      const onboardingCompleted = localStorage.getItem(`onboarding_completed_${userProfile.id}`);
      if (!onboardingCompleted) {
        // Verificar se já existe progresso salvo
        const savedProgress = localStorage.getItem(`onboarding_progress_${userProfile.id}`);
        if (savedProgress) {
          const { stepIndex, completedSteps } = JSON.parse(savedProgress);
          setCurrentStep(stepIndex);
          setSteps(prev => prev.map(step => ({
            ...step,
            completed: completedSteps.includes(step.id)
          })));
        }
        setIsOnboardingActive(true);
      }
    }
  }, [userProfile]);

  // Salvar progresso no localStorage
  const saveProgress = (stepIndex: number, completedSteps: string[]) => {
    if (userProfile) {
      localStorage.setItem(`onboarding_progress_${userProfile.id}`, JSON.stringify({
        stepIndex,
        completedSteps
      }));
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      saveProgress(newStep, steps.filter(s => s.completed).map(s => s.id));
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
      saveProgress(newStep, steps.filter(s => s.completed).map(s => s.id));
    }
  };

  const skipStep = () => {
    if (steps[currentStep]?.skippable) {
      nextStep();
    }
  };

  const completeStep = (stepId: string) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, completed: true } : step
    ));
    
    // Se é o step atual, avança automaticamente
    if (steps[currentStep]?.id === stepId) {
      setTimeout(nextStep, 500);
    }
  };

  const startOnboarding = () => {
    setIsOnboardingActive(true);
    setCurrentStep(0);
    setSteps(defaultSteps);
  };

  const finishOnboarding = () => {
    setIsOnboardingActive(false);
    if (userProfile) {
      localStorage.removeItem(`onboarding_progress_${userProfile.id}`);
      localStorage.setItem(`onboarding_completed_${userProfile.id}`, 'true');
    }
  };

  const skipOnboarding = () => {
    setIsOnboardingActive(false);
    if (userProfile) {
      localStorage.removeItem(`onboarding_progress_${userProfile.id}`);
      localStorage.setItem(`onboarding_completed_${userProfile.id}`, 'true');
    }
  };

  const totalSteps = steps.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <OnboardingContext.Provider value={{
      isOnboardingActive,
      currentStep,
      steps,
      totalSteps,
      progress,
      nextStep,
      previousStep,
      skipStep,
      completeStep,
      startOnboarding,
      finishOnboarding,
      skipOnboarding
    }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}