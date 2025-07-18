
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { formatCNPJ } from "@/components/client-access/formatCNPJ";
import { validateCNPJ } from "@/utils/validators";
import { consultarCNPJ } from "@/services/governamental/apiIntegration";

const formSchema = z.object({
  name: z.string().min(3, { message: "O nome deve ter pelo menos 3 caracteres" }),
  cnpj: z.string()
    .min(14, { message: "CNPJ deve ter 14 dígitos" })
    .refine(val => validateCNPJ(val), { message: "CNPJ inválido" }),
  email: z.string().email({ message: "Email inválido" }),
  phone: z.string().optional(),
  regime: z.enum(["lucro_presumido", "simples_nacional", "lucro_real"], { 
    required_error: "Selecione o regime tributário" 
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface PrimeiroClienteFormProps {
  onSubmit: (data: FormValues) => void;
}

export function PrimeiroClienteForm({ onSubmit }: PrimeiroClienteFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      cnpj: "",
      email: "",
      phone: "",
      regime: "lucro_presumido",
    },
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCNPJ, setIsLoadingCNPJ] = useState(false);

  const handleSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      console.log("Dados do primeiro cliente:", data);
      
      // Exemplo de uso de Promise.all para paralelizar requisições
      // (substituir com chamadas reais ao backend quando implementado)
      const [clienteRegistrado, configuracoesIniciais] = await Promise.all([
        // Aqui seriam as chamadas reais para a API
        simulateClientRegistration(data),
        simulateInitialSetup(data.regime)
      ]);
      
      console.log("Resultados em paralelo:", { clienteRegistrado, configuracoesIniciais });
      
      onSubmit(data);
      
      toast({
        title: "Cliente adicionado",
        description: "Seu primeiro cliente foi cadastrado com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao adicionar cliente:", error);
      toast({
        title: "Erro ao adicionar cliente",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao cadastrar o cliente. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedCNPJ = formatCNPJ(e.target.value);
    form.setValue("cnpj", formattedCNPJ);
  };

  const handleCNPJBlur = async () => {
    const cnpj = form.getValues("cnpj");
    if (cnpj && validateCNPJ(cnpj)) {
      setIsLoadingCNPJ(true);
      try {
        const resultado = await consultarCNPJ(cnpj.replace(/\D/g, ''));
        if (resultado.sucesso && resultado.dados) {
          // Auto-preencher dados encontrados
          if (resultado.dados.nome) {
            form.setValue("name", resultado.dados.nome);
          }
          if (resultado.dados.email) {
            form.setValue("email", resultado.dados.email);
          }
          if (resultado.dados.telefone) {
            form.setValue("phone", resultado.dados.telefone);
          }
          
          toast({
            title: "Dados encontrados",
            description: "Informações da empresa foram preenchidas automaticamente."
          });
        }
      } catch (error) {
        console.log("Erro ao consultar CNPJ:", error);
        // Não mostrar erro ao usuário, apenas não preencher automaticamente
      } finally {
        setIsLoadingCNPJ(false);
      }
    }
  };
  
  // Simulações de chamadas à API para demonstrar o Promise.all
  // Estas funções seriam substituídas por chamadas reais à API
  const simulateClientRegistration = async (clientData: FormValues): Promise<{ success: boolean, clientId: string }> => {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simular latência de rede
    return { success: true, clientId: `client-${Date.now()}` };
  };
  
  const simulateInitialSetup = async (regime: string): Promise<{ success: boolean, config: string }> => {
    await new Promise(resolve => setTimeout(resolve, 200)); // Simular latência de rede
    return { success: true, config: `config-${regime}-${Date.now()}` };
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da empresa</FormLabel>
              <FormControl>
                <Input placeholder="Empresa ABC Ltda" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="cnpj"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CNPJ</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      placeholder="00.000.000/0000-00" 
                      {...field}
                      onChange={handleCNPJChange}
                      onBlur={handleCNPJBlur}
                      disabled={isLoadingCNPJ}
                    />
                    {isLoadingCNPJ && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormDescription>
                  Digite um CNPJ válido - os dados serão preenchidos automaticamente
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone (opcional)</FormLabel>
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="contato@empresa.com.br" type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="regime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Regime Tributário</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o regime tributário" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="lucro_presumido">Lucro Presumido</SelectItem>
                  <SelectItem value="simples_nacional">Simples Nacional</SelectItem>
                  <SelectItem value="lucro_real">Lucro Real</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                O regime tributário determinará os cálculos automáticos aplicados para a empresa.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Limpar
          </Button>
          <Button type="submit" disabled={isSubmitting || isLoadingCNPJ}>
            {isSubmitting ? "Adicionando..." : isLoadingCNPJ ? "Carregando..." : "Adicionar Cliente"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
