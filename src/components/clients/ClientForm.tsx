
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
import { useToast } from "@/hooks/use-toast";
import { consultarCNPJ } from "@/services/governamental/apiIntegration";
import { formatCNPJ } from "@/components/client-access/formatCNPJ";
import { validateCNPJ } from "@/utils/validators";
import { addClient } from "@/services/supabase/clientsService";

const formSchema = z.object({
  name: z.string().min(3, { message: "O nome deve ter pelo menos 3 caracteres" }),
  cnpj: z.string()
    .min(14, { message: "CNPJ deve ter 14 dígitos" })
    .refine(val => validateCNPJ(val), { message: "CNPJ inválido" }),
  email: z.string().email({ message: "Email inválido" }),
  phone: z.string().optional(),
  address: z.string().optional(),
  regime: z.enum(["lucro_presumido", "simples_nacional", "lucro_real"], { 
    required_error: "Selecione o regime tributário" 
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface ClientFormProps {
  onSuccess?: () => void;
}

export function ClientForm({ onSuccess }: ClientFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCNPJ, setIsLoadingCNPJ] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      cnpj: "",
      email: "",
      phone: "",
      address: "",
      regime: "lucro_presumido",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      console.log("=== INICIANDO CADASTRO DE CLIENTE ===");
      console.log("Dados do cliente:", data);
      
      // Preparar dados para inserção (sem accounting_firm_id nem accountant_id - o serviço vai adicionar)
      const clientData = {
        name: data.name,
        cnpj: data.cnpj,
        email: data.email,
        phone: data.phone || null,
        address: data.address || null,
        regime: data.regime,
        status: "active" as const,
        accounting_firm_id: null // Cliente não tem escritório associado por padrão
      };
      
      console.log("Dados preparados para inserção:", clientData);
      
      // Usar o serviço que já funciona com RLS
      const clientId = await addClient(clientData);
      
      if (!clientId) {
        throw new Error("Erro ao cadastrar cliente - dados não foram salvos");
      }
      
      console.log(`✅ Cliente cadastrado com ID: ${clientId}`);
      
      // Exibir mensagem de sucesso
      toast({
        title: "Cliente cadastrado com sucesso",
        description: `${data.name} foi cadastrado e está disponível no sistema.`,
      });
      
      // Limpar formulário
      form.reset();
      
      // Chamar callback de sucesso
      if (onSuccess) {
        console.log("Chamando callback de sucesso...");
        onSuccess();
      }
    } catch (error: any) {
      console.error("❌ ERRO NO CADASTRO:", error);
      toast({
        title: "Erro ao cadastrar cliente",
        description: error.message || "Ocorreu um erro ao salvar os dados do cliente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
      console.log("=== FIM DO CADASTRO ===");
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
          if (resultado.dados.endereco) {
            form.setValue("address", resultado.dados.endereco);
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <FormMessage />
            </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Endereço (opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Rua, número, bairro, cidade, estado" {...field} />
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
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => form.reset()}
            disabled={isSubmitting}
          >
            Limpar
          </Button>
          <Button 
            type="submit"
            disabled={isSubmitting || isLoadingCNPJ}
          >
            {isSubmitting ? "Cadastrando..." : isLoadingCNPJ ? "Carregando..." : "Cadastrar Cliente"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
