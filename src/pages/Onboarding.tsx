
import React, { useState } from "react";
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
import { ArrowRight, Building2, Users, Calendar, FileText, Mic, Server, Wallet } from "lucide-react";
import { IntegracaoFiscalForm } from "@/components/onboarding/IntegracaoFiscalForm";
import { IntegracaoBancariaForm } from "@/components/onboarding/IntegracaoBancariaForm";
import { toast } from "@/hooks/use-toast";

const onboardingSteps = [
  {
    id: "office-info",
    title: "Informações do Escritório",
    description: "Vamos começar com informações básicas sobre o seu escritório contábil",
    icon: <Building2 className="h-8 w-8 text-primary" />,
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
  },
  {
    id: "ai-assistant",
    title: "Assistente de Voz IA",
    description: "Configure as preferências para seu assistente de voz inteligente",
    icon: <Mic className="h-8 w-8 text-primary" />,
  },
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
  const [fiscalData, setFiscalData] = useState(null);
  const [bancariaData, setBancariaData] = useState(null);
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

  const handleOfficeFormSubmit = (data: OfficeFormValues) => {
    setOfficeData(data);
    toast({
      title: "Informações salvas",
      description: "As informações do escritório foram salvas com sucesso.",
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

  const nextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      navigate("/");
    }
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
        return <IntegracaoFiscalForm onSubmit={handleFiscalFormSubmit} />;
      case 2:
        return <IntegracaoBancariaForm onSubmit={handleBancariaFormSubmit} />;
      case 3:
        // Renderiza o formulário de equipe e colaboradores
        return (
          <div className="space-y-4">
            <p>Aqui você poderá adicionar os membros da sua equipe. Esta funcionalidade será habilitada em breve.</p>
            <div className="flex justify-end">
              <Button onClick={nextStep}>Continuar</Button>
            </div>
          </div>
        );
      case 4:
        // Renderiza configuração de calendário fiscal
        return (
          <div className="space-y-4">
            <p>Configure o calendário fiscal e defina alertas para obrigações importantes. Esta funcionalidade será habilitada em breve.</p>
            <div className="flex justify-end">
              <Button onClick={nextStep}>Continuar</Button>
            </div>
          </div>
        );
      case 5:
        // Renderiza configuração de gestão documental
        return (
          <div className="space-y-4">
            <p>Configure como os documentos serão armazenados e compartilhados no sistema. Esta funcionalidade será habilitada em breve.</p>
            <div className="flex justify-end">
              <Button onClick={nextStep}>Continuar</Button>
            </div>
          </div>
        );
      case 6:
        // Renderiza configuração do assistente de voz
        return (
          <div className="space-y-4">
            <p>Configure o assistente de voz IA que irá ajudar você e seus clientes. Esta funcionalidade será habilitada em breve.</p>
            <div className="flex justify-end">
              <Button onClick={() => navigate("/")}>Concluir</Button>
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
          <CardTitle className="text-2xl">Configuração Inicial</CardTitle>
          <CardDescription>
            Complete os passos abaixo para configurar seu escritório no Contaflix
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2 mb-8">
            {onboardingSteps.map((step, index) => (
              <div 
                key={step.id}
                className={`flex items-center ${
                  index < currentStep 
                    ? "text-primary" 
                    : index === currentStep 
                    ? "text-primary font-semibold" 
                    : "text-muted-foreground"
                }`}
              >
                <span className="text-sm">{step.title}</span>
                {index < onboardingSteps.length - 1 && (
                  <ArrowRight className="h-4 w-4 mx-2" />
                )}
              </div>
            ))}
          </div>

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
        </CardFooter>
      </Card>
    </div>
  );
};

export default Onboarding;
