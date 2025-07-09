import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner, LoadingOverlay, CardLoading } from '@/components/ui/loading-spinner';
import { useLoadingState, useAsyncOperation } from '@/hooks/useLoadingState';
import { useOnboarding } from '@/components/onboarding/OnboardingProvider';
import { Play, RotateCcw, Settings } from 'lucide-react';

export default function OnboardingDemo() {
  const { isLoading } = useLoadingState();
  const { executeWithLoading } = useAsyncOperation();
  const { startOnboarding, isOnboardingActive } = useOnboarding();

  const simulateAsyncOperation = async (duration: number) => {
    return new Promise(resolve => setTimeout(resolve, duration));
  };

  const handleTestLoading = () => {
    executeWithLoading('demo-operation', () => simulateAsyncOperation(3000));
  };

  return (
    <div className="min-h-screen bg-muted/30 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Demonstração de UX</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Esta página demonstra as melhorias de UX implementadas: onboarding completo, 
            loading states consistentes e error boundaries globais.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Onboarding */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Onboarding
              </CardTitle>
              <CardDescription>
                Sistema completo de onboarding para novos usuários
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>• Progresso visual</div>
                <div>• Steps navegáveis</div>
                <div>• Persistência de estado</div>
                <div>• Conteúdo contextual</div>
              </div>
              <Button 
                onClick={startOnboarding} 
                disabled={isOnboardingActive}
                className="w-full"
              >
                {isOnboardingActive ? 'Onboarding Ativo' : 'Iniciar Onboarding'}
              </Button>
            </CardContent>
          </Card>

          {/* Loading States */}
          <LoadingOverlay isLoading={isLoading('demo-operation')}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RotateCcw className="h-5 w-5" />
                  Loading States
                </CardTitle>
                <CardDescription>
                  Estados de carregamento consistentes e globais
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div>• Indicador global</div>
                  <div>• Overlays locais</div>
                  <div>• Spinners customizáveis</div>
                  <div>• Skeleton loading</div>
                </div>
                <Button onClick={handleTestLoading} className="w-full">
                  Testar Loading
                </Button>
              </CardContent>
            </Card>
          </LoadingOverlay>

          {/* Error Boundaries */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Error Boundaries
              </CardTitle>
              <CardDescription>
                Tratamento global de erros com fallbacks elegantes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>• Captura global de erros</div>
                <div>• Fallbacks customizáveis</div>
                <div>• Logging automático</div>
                <div>• Recovery gracioso</div>
              </div>
              <Button 
                onClick={() => {
                  throw new Error('Erro de demonstração');
                }}
                variant="destructive"
                className="w-full"
              >
                Simular Erro
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Loading Demonstrations */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Demonstrações de Loading</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Spinner Variants</h3>
              <div className="flex gap-4 items-center">
                <LoadingSpinner size="sm" />
                <LoadingSpinner size="md" />
                <LoadingSpinner size="lg" />
                <LoadingSpinner size="xl" />
              </div>
              <LoadingSpinner size="md" text="Carregando dados..." />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Skeleton Loading</h3>
              <CardLoading />
            </div>
          </div>
        </div>

        {/* Benefits */}
        <Card>
          <CardHeader>
            <CardTitle>Benefícios das Melhorias de UX</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="font-medium">Onboarding</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Reduz abandono de usuários</li>
                <li>• Acelera adoção de features</li>
                <li>• Melhora satisfação inicial</li>
                <li>• Guia uso correto do sistema</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Loading States</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Feedback visual imediato</li>
                <li>• Reduz ansiedade do usuário</li>
                <li>• Melhora percepção de performance</li>
                <li>• Experiência mais profissional</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Error Boundaries</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Previne crashes completos</li>
                <li>• Mantém usuário na aplicação</li>
                <li>• Facilita debugging</li>
                <li>• Melhora confiabilidade</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}