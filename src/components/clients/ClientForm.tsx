
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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(3, { message: "O nome deve ter pelo menos 3 caracteres" }),
  cnpj: z.string().min(14, { message: "CNPJ deve ter 14 dígitos" }),
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
      
      // Preparar dados para inserção
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
      
      // Inserir cliente no Supabase
      const { data: insertedData, error } = await supabase
        .from('accounting_clients')
        .insert([clientData])
        .select();
      
      if (error) {
        console.error("Erro na inserção:", error);
        throw error;
      }
      
      console.log("Cliente inserido com sucesso:", insertedData);
      
      // Verificar se realmente foi inserido
      if (insertedData && insertedData.length > 0) {
        const clientId = insertedData[0].id;
        console.log(`✅ Cliente cadastrado com ID: ${clientId}`);
        
        // Verificar se o cliente pode ser encontrado
        const { data: verificationData, error: verificationError } = await supabase
          .from('accounting_clients')
          .select('*')
          .eq('id', clientId)
          .single();
          
        if (verificationError) {
          console.warn("Aviso: Erro na verificação:", verificationError);
        } else {
          console.log("✅ Verificação: Cliente encontrado no banco:", verificationData);
        }
        
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
      } else {
        throw new Error("Nenhum dado foi retornado após a inserção");
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
                  <Input placeholder="00.000.000/0000-00" {...field} />
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
            disabled={isSubmitting}
          >
            {isSubmitting ? "Cadastrando..." : "Cadastrar Cliente"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
