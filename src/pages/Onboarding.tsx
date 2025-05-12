
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

const onboardingSteps = [
  {
    id: "office-info",
    title: "Informações do Escritório",
    description: "Vamos começar com informações básicas sobre o seu escritório contábil",
    icon: <Building2 className="h-8 w-8 text-primary" />,
  },
  {
    id: "primeiro-cliente",
    title: "Primeiro Cliente",
    description: "Adicione seu primeiro cliente para começar a usar o sistema",
    icon: <Users className="h-8 w-8 text-primary" />,
  },
  {
    id: "fiscal-integration",
    title: "Integrações Fiscais",
    description: "Configure as credenciais para acessar portais governamentais",
    icon: <Server className="h-8 w-8 text-primary" />,
  },
  {
    id: "banking-integration",
    title: "Integração Bancária",
    description: "Configure a integração com seu banco para automatizar processos",
    icon: <Wallet className="h-8 w-8 text-primary" />,
  },
  {
    id: "team-info",
    title: "Equipe e Colaboradores",
    description: "Conte-nos sobre os membros da sua equipe que utilizarão o sistema",
    icon: <Users className="h-8 w-8 text-primary" />,
  },
  {
    id: "fiscal-calendar",
    title: "Calendário Fiscal",
    description: "Configure o calendário fiscal e alertas para obrigações importantes",
    icon: <Calendar className="h-8 w-8 text-primary" />,
  },
  {
    id: "document-management",
    title: "Gestão Documental",
    description: "Defina políticas para armazenamento e compartilhamento de documentos",
    icon: <FileText className="h-8 w-8 text-primary" />,
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
  const [currentStep, setCurrentStep] = useState(0);
  const [officeData, setOfficeData] = useState<OfficeFormValues | null>(null);
  const [primeiroClienteData, setPrimeiroClienteData] = useState(null);
  const [fiscalData, setFiscalData] = useState(null);
  const [bancariaData, setBancariaData] = useState(null);
  const [equipeData, setEquipeData] = useState(null);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
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
  }, [currentStep]);

  const handleOfficeFormSubmit = (data: OfficeFormValues) => {
    setOfficeData(data);
    toast({
      title: "Informações salvas",
      description: "As informações do escritório foram salvas com sucesso.",
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
    navigate("/");
    toast({
      title: "Onboarding concluído",
      description: "Seu escritório está pronto para usar o sistema!",
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleOfficeFormSubmit)} className="space-y-6">
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
            <div className="text-sm font-medium">{progress}% concluído</div>
          </div>
          <div className="w-full bg-muted h-2 mt-2 rounded-full overflow-hidden">
            <div 
              className="bg-primary h-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }} 
            />
          </div>
          <CardDescription className="mt-2">
            Complete os passos abaixo para configurar seu escritório no Contaflix
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-6">
            {onboardingSteps[currentStep].icon}
            <div>
              <h2 className="text-xl font-semibold">{onboardingSteps[currentStep].title}</h2>
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
    </div>
  );
};

export default Onboarding;
