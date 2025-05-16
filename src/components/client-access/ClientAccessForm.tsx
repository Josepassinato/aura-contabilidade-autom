
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Building } from "lucide-react";
import { useSupabaseClient } from "@/lib/supabase";
import { formatCNPJ } from "./formatCNPJ";

// Schema para validação do formulário de acesso
const accessFormSchema = z.object({
  cnpj: z.string().min(14, { message: "CNPJ deve ter pelo menos 14 caracteres" }),
  accessToken: z.string().min(6, { message: "Token de acesso deve ter pelo menos 6 caracteres" }),
});

type AccessFormValues = z.infer<typeof accessFormSchema>;

export const ClientAccessForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const supabase = useSupabaseClient();
  
  const form = useForm<AccessFormValues>({
    resolver: zodResolver(accessFormSchema),
    defaultValues: {
      cnpj: "",
      accessToken: "",
    },
  });

  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedCNPJ = formatCNPJ(e.target.value);
    form.setValue("cnpj", formattedCNPJ);
  };

  const onSubmit = async (data: AccessFormValues) => {
    setIsAuthenticating(true);
    
    try {
      if (!supabase) {
        throw new Error("Erro ao conectar com o servidor");
      }
      
      // Normaliza o CNPJ para remover formatação
      const normalizedCNPJ = data.cnpj.replace(/\D/g, "");
      
      // Buscar o cliente pelo CNPJ
      const clientResult = await supabase
        .from('accounting_clients')
        .select('*')
        .eq('cnpj', normalizedCNPJ);
      
      if (clientResult.error || !clientResult.data || clientResult.data.length === 0) {
        throw new Error("Cliente não encontrado");
      }

      const clientData = clientResult.data[0];
      
      // Verificar o token de acesso
      const accessResult = await supabase
        .from('client_access_tokens')
        .select('*')
        .eq('client_id', clientData.id)
        .eq('token', data.accessToken)
        .eq('is_active', true);
      
      if (accessResult.error || !accessResult.data || accessResult.data.length === 0) {
        throw new Error("Token de acesso inválido ou expirado");
      }

      const accessData = accessResult.data[0];
      
      // Salvar informações do cliente na sessão
      sessionStorage.setItem('client_id', clientData.id);
      sessionStorage.setItem('client_name', clientData.name);
      sessionStorage.setItem('client_cnpj', clientData.cnpj);
      
      toast({
        title: "Acesso autorizado",
        description: `Bem-vindo, ${clientData.name}!`,
      });
      
      // Redirecionar para o portal do cliente
      navigate('/client-portal');
    } catch (error: any) {
      toast({
        title: "Erro de autenticação",
        description: error.message || "Não foi possível autenticar. Verifique suas credenciais.",
        variant: "destructive",
      });
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Building className="h-5 w-5 text-primary" />
          <CardTitle>Acesso do Cliente</CardTitle>
        </div>
        <CardDescription>
          Insira seu CNPJ e o token de acesso fornecido pela sua contabilidade.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="cnpj"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CNPJ da Empresa</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="XX.XXX.XXX/XXXX-XX" 
                      {...field}
                      onChange={handleCNPJChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="accessToken"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Token de Acesso</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="Insira o token fornecido pela contabilidade"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Este token foi fornecido pela sua contabilidade.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isAuthenticating}
            >
              {isAuthenticating ? "Verificando..." : "Acessar Portal"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <div className="text-sm text-muted-foreground text-center">
          Caso não possua um token de acesso, entre em contato com seu contador.
        </div>
      </CardFooter>
    </Card>
  );
};
