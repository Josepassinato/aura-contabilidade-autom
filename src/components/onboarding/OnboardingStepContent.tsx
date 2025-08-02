import React, { useState } from 'react';
import { Sparkles, User, Users, Plug, PartyPopper, AlertCircle, CheckCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useOnboarding } from './OnboardingProvider';
import { useClientValidation } from '@/hooks/useClientValidation';
import { ClientForm } from '@/components/clients/ClientForm';

interface OnboardingStepContentProps {
  stepId: string;
}

export function OnboardingStepContent({ stepId }: OnboardingStepContentProps) {
  const { completeStep, nextStep, skipStep } = useOnboarding();
  const { hasClients, clientCount, isLoading, checkClients, validateCanProceed, confirmSkipStep } = useClientValidation();
  const [showClientForm, setShowClientForm] = useState(false);

  const renderStepContent = () => {
    switch (stepId) {
      case 'welcome':
        return (
          <div className="text-center space-y-6">
            <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              <Sparkles className="h-10 w-10 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Bem-vindo ao Sistema!</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Estamos empolgados em tê-lo conosco. Vamos configurar sua conta 
                em alguns passos simples para que você tenha a melhor experiência.
              </p>
            </div>
            <Button onClick={() => completeStep('welcome')} size="lg">
              Vamos Começar!
            </Button>
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Complete seu Perfil</h3>
                <p className="text-muted-foreground">
                  Adicione suas informações para personalizar sua experiência
                </p>
              </div>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Informações Básicas</CardTitle>
                <CardDescription>
                  Complete estas informações para melhorar sua experiência
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <span className="text-muted-foreground">• Nome completo</span>
                    <span className="text-muted-foreground">• Foto de perfil</span>
                    <span className="text-muted-foreground">• Empresa/Escritório</span>
                  </div>
                  <div className="space-y-2">
                    <span className="text-muted-foreground">• Telefone</span>
                    <span className="text-muted-foreground">• Área de atuação</span>
                    <span className="text-muted-foreground">• Preferências</span>
                  </div>
                </div>
                <Button onClick={() => completeStep('profile')} className="w-full">
                  Completar Perfil
                </Button>
              </CardContent>
            </Card>
          </div>
        );

      case 'first-client':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Adicionar Primeiro Cliente</h3>
                <p className="text-muted-foreground">
                  Configure seu primeiro cliente para começar a usar o sistema
                </p>
              </div>
            </div>

            {/* Status dos clientes */}
            {isLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Verificando clientes...</p>
              </div>
            ) : hasClients ? (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Perfeito! Você já tem {clientCount} cliente{clientCount !== 1 ? 's' : ''} cadastrado{clientCount !== 1 ? 's' : ''}. 
                  Pode continuar para o próximo passo.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Você ainda não tem clientes cadastrados. Adicione pelo menos um cliente para continuar.
                </AlertDescription>
              </Alert>
            )}

            {/* Opções de ação */}
            {!showClientForm ? (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">O que você gostaria de fazer?</CardTitle>
                    <CardDescription>
                      Escolha uma das opções abaixo para continuar
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      onClick={() => setShowClientForm(true)} 
                      className="w-full flex items-center gap-2"
                      variant={hasClients ? "outline" : "default"}
                    >
                      <Plus className="h-4 w-4" />
                      {hasClients ? "Adicionar Outro Cliente" : "Adicionar Primeiro Cliente"}
                    </Button>
                    
                    {hasClients && (
                      <Button 
                        onClick={() => completeStep('first-client')} 
                        className="w-full"
                      >
                        Continuar com os Clientes Existentes
                      </Button>
                    )}
                    
                    <Button 
                      onClick={async () => {
                        if (!hasClients) {
                          confirmSkipStep();
                          // Aguarda um momento para a mensagem aparecer
                          setTimeout(() => {
                            completeStep('first-client');
                          }, 2000);
                        } else {
                          completeStep('first-client');
                        }
                      }}
                      variant="ghost" 
                      className="w-full"
                    >
                      {hasClients ? "Prosseguir" : "Pular Este Passo (Adicionar Depois)"}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Adicionar Cliente</CardTitle>
                  <CardDescription>
                    Preencha as informações básicas do cliente
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ClientForm 
                    onSuccess={() => {
                      setShowClientForm(false);
                      checkClients(); // Revalidar a lista de clientes
                    }}
                  />
                  <div className="mt-4">
                    <Button 
                      onClick={() => setShowClientForm(false)} 
                      variant="ghost" 
                      className="w-full"
                    >
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 'integrations':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Plug className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Configurar Integrações</h3>
                <p className="text-muted-foreground">
                  Conecte suas ferramentas para automatizar processos
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Integrações Fiscais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <div>• Receita Federal</div>
                  <div>• Sefaz Estadual</div>
                  <div>• Simples Nacional</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Integrações Bancárias</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <div>• Open Banking</div>
                  <div>• Extratos automáticos</div>
                  <div>• Conciliação bancária</div>
                </CardContent>
              </Card>
            </div>
            
            <Button onClick={() => completeStep('integrations')} className="w-full">
              Configurar Integrações
            </Button>
          </div>
        );

      case 'completion':
        return (
          <div className="text-center space-y-6">
            <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              <PartyPopper className="h-10 w-10 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Parabéns! 🎉</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Sua conta está configurada e pronta para uso. Explore todas as 
                funcionalidades disponíveis e comece a otimizar seus processos.
              </p>
            </div>
            
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <h4 className="font-medium">Próximos Passos Sugeridos:</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>• Explore o dashboard principal</div>
                <div>• Configure suas notificações</div>
                <div>• Faça upload do primeiro documento</div>
                <div>• Acesse a central de ajuda se precisar</div>
              </div>
            </div>
            
            <Button onClick={() => completeStep('completion')} size="lg">
              Começar a Usar
            </Button>
          </div>
        );

      default:
        return (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Conteúdo não encontrado</p>
          </div>
        );
    }
  };

  return <div className="min-h-[300px]">{renderStepContent()}</div>;
}