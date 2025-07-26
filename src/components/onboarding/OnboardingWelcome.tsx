import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Users, 
  Calendar, 
  FileText, 
  BarChart, 
  ArrowRight,
  CheckCircle,
  Play,
  BookOpen,
  Calculator
} from 'lucide-react';

interface OnboardingWelcomeProps {
  onStartTour?: () => void;
  onSkip: () => void;
}

const features = [
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

export const OnboardingWelcome: React.FC<OnboardingWelcomeProps> = ({
  onStartTour,
  onSkip
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const getIcon = (iconName: string) => {
    const icons = {
      Users: Users,
      Calculator: Calculator,
      Calendar: Calendar,
      BarChart: BarChart
    };
    const IconComponent = icons[iconName as keyof typeof icons] || Users;
    return <IconComponent className="h-8 w-8" />;
  };

  const nextStep = () => {
    if (currentStep < features.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onSkip();
    }
  };

  const currentFeature = features[currentStep];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl bg-gradient-to-br from-primary/5 via-background to-secondary/5 border-primary/20 shadow-2xl">
        <CardHeader className="text-center pb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-primary rounded-full shadow-lg">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Bem-vindo ao ContaFlix!
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A plataforma de gestão contábil mais avançada do mercado. 
            Vamos conhecer as principais funcionalidades.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Progress Bar */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2">
              {features.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index <= currentStep ? 'bg-primary shadow-glow' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Current Feature */}
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full border border-primary/20">
                {getIcon(currentFeature.icon)}
              </div>
            </div>
            
            <h3 className="text-2xl font-bold mb-3 text-foreground">
              {currentFeature.title}
            </h3>
            
            <p className="text-muted-foreground text-lg mb-6 max-w-xl mx-auto">
              {currentFeature.description}
            </p>

            <div className="grid md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              {currentFeature.benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-3 bg-background/50 rounded-lg border border-muted"
                >
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm font-medium">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-6 border-t border-muted">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{currentStep + 1} de {features.length}</span>
            </div>

            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={onSkip}
                className="text-muted-foreground hover:text-foreground"
              >
                Pular Tour
              </Button>
              
              {onStartTour && (
                <Button
                  variant="outline"
                  onClick={onStartTour}
                  className="flex items-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  Tour Guiado
                </Button>
              )}
              
              <Button
                onClick={nextStep}
                className="flex items-center gap-2 bg-gradient-primary text-white hover:opacity-90 transition-opacity"
              >
                {currentStep < features.length - 1 ? (
                  <>
                    Próximo
                    <ArrowRight className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    Começar
                    <CheckCircle className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};