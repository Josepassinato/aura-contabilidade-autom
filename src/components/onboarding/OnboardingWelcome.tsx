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
  BookOpen
} from 'lucide-react';
import { demoFeatures, initializeDemoData } from '@/data/demoData';

interface OnboardingWelcomeProps {
  onStartTour: () => void;
  onLoadDemo: () => void;
  onSkip: () => void;
}

export const OnboardingWelcome: React.FC<OnboardingWelcomeProps> = ({
  onStartTour,
  onLoadDemo,
  onSkip
}) => {
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);

  const handleLoadDemo = async () => {
    setIsLoadingDemo(true);
    initializeDemoData();
    
    // Simular carregamento
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    onLoadDemo();
    setIsLoadingDemo(false);
  };

  const iconMap = {
    Users,
    Calculator: BarChart,
    Calendar,
    BarChart
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-scale-in shadow-glow">
        <CardHeader className="text-center pb-6 bg-gradient-to-br from-primary/5 to-primary-glow/5">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gradient-primary rounded-full shadow-glow animate-float">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Bem-vindo ao ContaFlix! 🎉
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Sua plataforma completa para gestão contábil e fiscal inteligente
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Recursos Principais */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              O que você pode fazer com o ContaFlix
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {demoFeatures.map((feature, index) => {
                const IconComponent = iconMap[feature.icon as keyof typeof iconMap] || BarChart;
                return (
                  <Card key={index} className="border-muted interactive-card animate-slide-up" style={{animationDelay: `${index * 100}ms`}}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-primary rounded-lg shadow-sm">
                          <IconComponent className="h-5 w-5 text-white" />
                        </div>
                        <CardTitle className="text-base">{feature.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="mb-3">
                        {feature.description}
                      </CardDescription>
                      <div className="flex flex-wrap gap-1">
                        {feature.benefits.map((benefit, benefitIndex) => (
                          <Badge key={benefitIndex} variant="secondary" className="text-xs hover:bg-primary/10 transition-smooth">
                            {benefit}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Opções de Início */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Play className="h-5 w-5 text-primary" />
              Como você gostaria de começar?
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {/* Tour Guiado */}
              <Card className="border-primary/20 hover:border-primary/40 hover:shadow-glow transition-smooth cursor-pointer interactive-card">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-primary rounded-lg shadow-sm">
                      <BookOpen className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Tour Guiado</CardTitle>
                      <Badge className="text-xs bg-success text-success-foreground">Recomendado</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    Aprenda os recursos principais com um tour interativo passo-a-passo pela interface.
                  </CardDescription>
                  <Button onClick={onStartTour} className="w-full bg-gradient-primary hover:shadow-glow transition-smooth">
                    <Play className="h-4 w-4 mr-2" />
                    Iniciar Tour
                  </Button>
                </CardContent>
              </Card>

              {/* Dados de Demonstração */}
              <Card className="border-muted hover:border-muted/80 hover:shadow-md transition-smooth interactive-card">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-sm">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Explorar com Dados Demo</CardTitle>
                      <Badge variant="secondary" className="text-xs">Prático</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    Explore a plataforma com dados de exemplo: 3 clientes, documentos e eventos fiscais.
                  </CardDescription>
                  <Button 
                    variant="outline" 
                    onClick={handleLoadDemo}
                    disabled={isLoadingDemo}
                    className="w-full hover:bg-blue-50 hover:border-blue-300 transition-smooth"
                  >
                    {isLoadingDemo ? (
                      <>
                        <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-r-transparent" />
                        Carregando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Carregar Dados Demo
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={onSkip}
              className="flex-1"
            >
              Pular Introdução
            </Button>
            <Button 
              onClick={onStartTour}
              className="flex-1 bg-gradient-primary hover:shadow-glow transition-smooth"
            >
              Começar Tour Completo
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          {/* Dica */}
          <div className="bg-gradient-to-r from-primary/5 to-primary-glow/5 p-4 rounded-lg border-l-4 border-primary shadow-sm">
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-gradient-primary rounded-full shadow-sm">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-primary">💡 Dica Profissional</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Você pode acessar este tour novamente a qualquer momento através do menu "Ajuda" na barra lateral.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};