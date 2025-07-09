
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  ArrowRight, 
  Building2, 
  Users, 
  Calendar, 
  FileText, 
  Mic, 
  Server, 
  Wallet, 
  Check,
  CheckCircle
} from "lucide-react";
import { IntegracaoFiscalForm } from "@/components/onboarding/IntegracaoFiscalForm";
import { IntegracaoBancariaForm } from "@/components/onboarding/IntegracaoBancariaForm";
import { PrimeiroClienteForm } from "@/components/onboarding/PrimeiroClienteForm";
import { EquipeForm } from "@/components/onboarding/EquipeForm";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useOnboardingPersistence } from "@/hooks/useOnboardingPersistence";
import { Progress } from "@/components/ui/progress";
import { Clock, Save } from "lucide-react";

// Passos essenciais do onboarding (reduzido de 7 para 4)
const onboardingSteps = [
  {
    id: "office-client",
    title: "Configuração Inicial",
    description: "Informações básicas do escritório e primeiro cliente",
    icon: <Building2 className="h-8 w-8 text-primary" />,
    estimatedTime: "5-8 min",
    required: true
  },
  {
    id: "fiscal-integration",
    title: "Integrações Essenciais",
    description: "Configure o acesso básico aos portais governamentais (Gov.br)",
    icon: <Server className="h-8 w-8 text-primary" />,
    estimatedTime: "3-5 min",
    required: true
  },
  {
    id: "finalizacao",
    title: "Finalização",
    description: "Configure automações e calendário fiscal",
    icon: <CheckCircle className="h-8 w-8 text-primary" />,
    estimatedTime: "2-3 min",
    required: true
  },
  {
    id: "configuracoes-avancadas",
    title: "Configurações Avançadas",
    description: "Integrações bancárias, equipe e gestão documental (opcional)",
    icon: <FileText className="h-8 w-8 text-primary" />,
    estimatedTime: "5-10 min",
    required: false
  }
];

const officeFormSchema = z.object({
  officeName: z.string().min(3, "O nome do escritório é obrigatório"),
  cnpj: z.string().min(14, "CNPJ inválido"),
  address: z.string().min(5, "O endereço é obrigatório"),
  phone: z.string().min(10, "Telefone inválido"),
  email: z.string().email("E-mail inválido"),
  website: z.string().optional(),
  description: z.string().optional(),
});

type OfficeFormValues = z.infer<typeof officeFormSchema>;

const Onboarding = () => {
  const { data, updateData, clearData, hasProgress } = useOnboardingPersistence();
  const [currentStep, setCurrentStep] = useState(data.currentStep);
  const [officeData, setOfficeData] = useState<OfficeFormValues | null>(data.officeData);
  const [primeiroClienteData, setPrimeiroClienteData] = useState(data.primeiroClienteData);
  const [fiscalData, setFiscalData] = useState(data.fiscalData);
  const [bancariaData, setBancariaData] = useState(data.bancariaData);
  const [equipeData, setEquipeData] = useState(data.equipeData);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [showProgressRecovery, setShowProgressRecovery] = useState(false);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();
  
  const form = useForm<OfficeFormValues>({
    resolver: zodResolver(officeFormSchema),
    defaultValues: {
      officeName: "",
      cnpj: "",
      address: "",
      phone: "",
      email: "",
      website: "",
      description: "",
    },
  });

  useEffect(() => {
    // Calcular o progresso com base no passo atual
    const newProgress = Math.round(((currentStep + 1) / onboardingSteps.length) * 100);
    setProgress(newProgress);
    
    // Atualizar dados de persistência
    updateData({ currentStep });
  }, [currentStep, updateData]);

  // Verificar se há progresso salvo ao carregar
  useEffect(() => {
    if (hasProgress() && currentStep === 0 && !data.officeData) {
      setShowProgressRecovery(true);
    }
  }, [hasProgress, currentStep, data.officeData]);

  // Auto-salvar dados quando mudarem
  useEffect(() => {
    updateData({
      officeData,
      primeiroClienteData,
      fiscalData,
      bancariaData,
      equipeData
    });
  }, [officeData, primeiroClienteData, fiscalData, bancariaData, equipeData, updateData]);

  const handleOfficeClientSubmit = (officeData: OfficeFormValues, clienteData: any) => {
    setOfficeData(officeData);
    setPrimeiroClienteData(clienteData);
    toast({
      title: "Configuração inicial salva",
      description: "Dados do escritório e primeiro cliente salvos automaticamente.",
    });
    setCurrentStep(currentStep + 1);
  };

  const handlePrimeiroClienteSubmit = (data: any) => {
    setPrimeiroClienteData(data);
    toast({
      title: "Cliente adicionado",
      description: "O primeiro cliente foi cadastrado com sucesso.",
    });
    setCurrentStep(currentStep + 1);
  };

  const handleFiscalFormSubmit = (data: any) => {
    setFiscalData(data);
    toast({
      title: "Integrações configuradas",
      description: "As integrações fiscais foram configuradas com sucesso.",
    });
    setCurrentStep(currentStep + 1);
  };

  const handleBancariaFormSubmit = (data: any) => {
    setBancariaData(data);
    toast({
      title: "Integração bancária configurada",
      description: "A integração bancária foi configurada com sucesso.",
    });
    setCurrentStep(currentStep + 1);
  };

  const handleEquipeFormSubmit = (data: any) => {
    setEquipeData(data);
    toast({
      title: "Equipe configurada",
      description: "A equipe foi configurada com sucesso.",
    });
    setCurrentStep(currentStep + 1);
  };

  const nextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      setShowCompletionDialog(true);
    }
  };

  const completeOnboarding = () => {
    setShowCompletionDialog(false);
    clearData(); // Limpar dados salvos
    navigate("/dashboard");
    toast({
      title: "Onboarding concluído",
      description: "Seu escritório está pronto para usar o sistema!",
    });
  };

  const saveAndContinueLater = () => {
    toast({
      title: "Progresso salvo",
      description: "Você pode continuar a configuração a qualquer momento.",
    });
    navigate("/dashboard");
  };

  const recoverProgress = () => {
    setCurrentStep(data.currentStep);
    setOfficeData(data.officeData);
    setPrimeiroClienteData(data.primeiroClienteData);
    setFiscalData(data.fiscalData);
    setBancariaData(data.bancariaData);
    setEquipeData(data.equipeData);
    setShowProgressRecovery(false);
    
    toast({
      title: "Progresso recuperado",
      description: "Continuando de onde você parou.",
    });
  };

  const startFresh = () => {
    clearData();
    setCurrentStep(0);
    setOfficeData(null);
    setPrimeiroClienteData(null);
    setFiscalData(null);
    setBancariaData(null);
    setEquipeData(null);
    setShowProgressRecovery(false);
    
    toast({
      title: "Configuração reiniciada",
      description: "Começando uma nova configuração.",
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => handleOfficeClientSubmit(data, null))} className="space-y-6">
              <FormField
                control={form.control}
                name="officeName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Escritório</FormLabel>
                    <FormControl>
                      <Input placeholder="Contabilidade Exemplo Ltda" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="cnpj"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CNPJ</FormLabel>
                      <FormControl>
                        <Input placeholder="00.000.000/0000-00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input placeholder="(00) 00000-0000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Av. Exemplo, 123 - Bairro, Cidade/UF" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail Principal</FormLabel>
                      <FormControl>
                        <Input placeholder="contato@exemplo.com.br" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input placeholder="www.exemplo.com.br" {...field} />
                      </FormControl>
                      <FormDescription>Opcional</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sobre o Escritório</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descreva brevemente seu escritório e especialidades..."
                        className="resize-none h-20"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>Opcional</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button type="submit">Continuar</Button>
              </div>
            </form>
          </Form>
        );
      case 1:
        return <PrimeiroClienteForm onSubmit={handlePrimeiroClienteSubmit} />;
      case 2:
        return <IntegracaoFiscalForm onSubmit={handleFiscalFormSubmit} />;
      case 3:
        return <IntegracaoBancariaForm onSubmit={handleBancariaFormSubmit} />;
      case 4:
        return <EquipeForm onSubmit={handleEquipeFormSubmit} />;
      case 5:
        // Renderiza configuração de calendário fiscal
        return (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md p-4">
              <h3 className="font-medium">Calendário fiscal será configurado automaticamente</h3>
              <p className="mt-2 text-sm">
                Com base no regime tributário dos seus clientes, configuraremos automaticamente as obrigações 
                fiscais e prazos importantes. Você poderá personalizar isso mais tarde.
              </p>
            </div>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="border rounded-md p-4 bg-muted/10">
                <h4 className="font-medium">Simples Nacional</h4>
                <ul className="mt-2 text-sm space-y-1 text-muted-foreground">
                  <li>- DAS: dia 20 de cada mês</li>
                  <li>- DEFIS: março</li>
                </ul>
              </div>
              
              <div className="border rounded-md p-4 bg-muted/10">
                <h4 className="font-medium">Lucro Presumido</h4>
                <ul className="mt-2 text-sm space-y-1 text-muted-foreground">
                  <li>- PIS/COFINS: dia 25</li>
                  <li>- IRPJ/CSLL: fim de trimestre</li>
                </ul>
              </div>
              
              <div className="border rounded-md p-4 bg-muted/10">
                <h4 className="font-medium">Obrigações Gerais</h4>
                <ul className="mt-2 text-sm space-y-1 text-muted-foreground">
                  <li>- INSS: dia 20</li>
                  <li>- FGTS: dia 7</li>
                </ul>
              </div>
            </div>
            
            <div className="flex justify-end pt-6">
              <Button onClick={nextStep}>Continuar</Button>
            </div>
          </div>
        );
      case 6:
        // Renderiza configuração de gestão documental
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-md p-4">
              <h3 className="font-medium">Gestão documental será configurada com valores padrão</h3>
              <p className="mt-2 text-sm">
                Configuramos automaticamente políticas de acesso e compartilhamento de documentos.
                Você poderá personalizar essas configurações a qualquer momento.
              </p>
            </div>
            
            <div className="border rounded-md divide-y">
              <div className="p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Armazenamento de documentos fiscais</h4>
                  <p className="text-sm text-muted-foreground">Documentos fiscais serão armazenados por 5 anos</p>
                </div>
                <Check className="text-green-500 h-5 w-5" />
              </div>
              
              <div className="p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Compartilhamento com clientes</h4>
                  <p className="text-sm text-muted-foreground">Clientes terão acesso aos próprios documentos</p>
                </div>
                <Check className="text-green-500 h-5 w-5" />
              </div>
              
              <div className="p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Backup automático</h4>
                  <p className="text-sm text-muted-foreground">Backups diários dos documentos</p>
                </div>
                <Check className="text-green-500 h-5 w-5" />
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button onClick={nextStep}>Finalizar Configuração</Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">Configuração Inicial</CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{onboardingSteps[currentStep]?.estimatedTime}</span>
              </div>
              <div className="text-sm font-medium">{progress}% concluído</div>
            </div>
          </div>
          <Progress value={progress} className="mt-2" />
          <div className="flex items-center justify-between mt-2">
            <CardDescription>
              Complete os passos essenciais para configurar seu escritório no Contaflow
            </CardDescription>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={saveAndContinueLater}
              className="text-muted-foreground hover:text-foreground"
            >
              <Save className="h-4 w-4 mr-2" />
              Salvar e continuar depois
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-6">
            {onboardingSteps[currentStep].icon}
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold">{onboardingSteps[currentStep].title}</h2>
                {onboardingSteps[currentStep].required && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                    Obrigatório
                  </span>
                )}
              </div>
              <p className="text-muted-foreground">{onboardingSteps[currentStep].description}</p>
            </div>
          </div>

          {renderStepContent()}
        </CardContent>
        
        <CardFooter className="border-t pt-4 flex justify-between">
          <Button
            variant="outline"
            onClick={() => currentStep > 0 && setCurrentStep(currentStep - 1)}
            disabled={currentStep === 0}
          >
            Voltar
          </Button>
          
          {/* Exibir número do passo atual / total */}
          <span className="text-sm text-muted-foreground">
            Passo {currentStep + 1} de {onboardingSteps.length}
          </span>
        </CardFooter>
      </Card>
      
      {/* Modal de conclusão */}
      <Dialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              Configuração concluída!
            </DialogTitle>
            <DialogDescription>
              Seu escritório está configurado e pronto para começar a usar o Contaflix.
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-4 bg-muted/20 rounded-md">
            <h4 className="font-medium">O que você pode fazer agora:</h4>
            <ul className="mt-2 space-y-2">
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-1 shrink-0" />
                <span>Acessar o dashboard e explorar as funcionalidades</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-1 shrink-0" />
                <span>Adicionar mais clientes ao sistema</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-1 shrink-0" />
                <span>Configurar mais detalhes nas preferências</span>
              </li>
            </ul>
          </div>
          
          <div className="flex justify-center">
            <Button onClick={completeOnboarding} className="w-full">
              Ir para o Dashboard
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de recuperação de progresso */}
      <Dialog open={showProgressRecovery} onOpenChange={setShowProgressRecovery}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Save className="h-6 w-6 text-blue-500" />
              Progresso encontrado
            </DialogTitle>
            <DialogDescription>
              Encontramos uma configuração em andamento. Deseja continuar de onde parou?
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h4 className="font-medium text-blue-900">Progresso salvo:</h4>
            <ul className="mt-2 space-y-1 text-sm text-blue-800">
              {data.officeData && (
                <li>✓ Informações do escritório</li>
              )}
              {data.primeiroClienteData && (
                <li>✓ Primeiro cliente</li>
              )}
              {data.fiscalData && (
                <li>✓ Integrações fiscais</li>
              )}
              {data.bancariaData && (
                <li>✓ Integração bancária</li>
              )}
              {data.equipeData && (
                <li>✓ Equipe</li>
              )}
            </ul>
            <p className="mt-2 text-xs text-blue-600">
              Passo {data.currentStep + 1} de {onboardingSteps.length}
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={recoverProgress} className="flex-1">
              Continuar
            </Button>
            <Button onClick={startFresh} variant="outline" className="flex-1">
              Começar do zero
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Onboarding;
