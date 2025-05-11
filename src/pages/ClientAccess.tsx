
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

// Schema para validação do formulário de acesso
const accessFormSchema = z.object({
  cnpj: z.string().min(14, { message: "CNPJ deve ter pelo menos 14 caracteres" }),
  accessToken: z.string().min(6, { message: "Token de acesso deve ter pelo menos 6 caracteres" }),
});

type AccessFormValues = z.infer<typeof accessFormSchema>;

const ClientAccess = () => {
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

  const formatCNPJ = (value: string) => {
    // Remove caracteres não numéricos
    const numbers = value.replace(/\D/g, "");
    
    // Formato CNPJ: XX.XXX.XXX/YYYY-ZZ
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 5) {
      return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
    } else if (numbers.length <= 8) {
      return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
    } else if (numbers.length <= 12) {
      return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`;
    } else {
      return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`;
    }
  };

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
      const { data: clientData, error: clientError } = await supabase
        .from('accounting_clients')
        .select('*')
        .eq('cnpj', normalizedCNPJ)
        .single();
      
      if (clientError || !clientData) {
        throw new Error("Cliente não encontrado");
      }
      
      // Verificar o token de acesso
      const { data: accessData, error: accessError } = await supabase
        .from('client_access_tokens')
        .select('*')
        .eq('client_id', clientData.id)
        .eq('token', data.accessToken)
        .eq('is_active', true)
        .single();
      
      if (accessError || !accessData) {
        throw new Error("Token de acesso inválido ou expirado");
      }
      
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
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">ContaFácil</h1>
          <p className="text-muted-foreground mt-2">Portal de acesso ao cliente</p>
        </div>
        
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
      </div>
    </div>
  );
};

export default ClientAccess;
