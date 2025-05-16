
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Schema para validação do formulário
const formSchema = z.object({
  apiEndpoint: z.string().url({ message: "URL da API inválida" }),
  authToken: z.string().min(10, { message: "Token de autenticação deve ter pelo menos 10 caracteres" }),
  intervaloDias: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Intervalo deve ser um número maior que zero",
  }),
  fornecedor: z.string().min(1, { message: "Selecione um fornecedor" }),
  atualizacaoAutomatica: z.boolean().default(false),
  notificacoes: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

export function LegislacaoApiConfigForm() {
  const [isSaving, setIsSaving] = useState(false);
  
  // Recuperar valores salvos (em um caso real, viria do banco de dados)
  const savedValues = {
    apiEndpoint: "https://api.consultorialegislacao.com.br/v1",
    authToken: "api_key_12345abcde",
    intervaloDias: "7",
    fornecedor: "fiscal_smart",
    atualizacaoAutomatica: true,
    notificacoes: true,
  };
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: savedValues
  });

  const onSubmit = async (data: FormValues) => {
    setIsSaving(true);
    try {
      // Em um caso real, aqui seria feita a chamada para salvar no banco de dados
      console.log("Dados a serem salvos:", data);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulação
      
      toast({
        title: "Configuração salva",
        description: "A integração com a API de legislação contábil foi configurada com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao salvar configuração:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações da API.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const testConnection = async () => {
    const values = form.getValues();
    
    if (!values.apiEndpoint || !values.authToken) {
      toast({
        title: "Campos incompletos",
        description: "Preencha a URL da API e o token de autenticação antes de testar.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    try {
      // Em um caso real, aqui seria feita a chamada para testar a conexão
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulação
      
      toast({
        title: "Conexão bem-sucedida",
        description: "A API de legislação contábil está respondendo corretamente.",
      });
    } catch (error) {
      toast({
        title: "Falha na conexão",
        description: "Não foi possível conectar à API. Verifique as credenciais.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="fornecedor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fornecedor de API</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um fornecedor" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="fiscal_smart">FiscalSmart</SelectItem>
                    <SelectItem value="contabil_update">ContábilUpdate</SelectItem>
                    <SelectItem value="legisla_facil">LegislaFácil</SelectItem>
                    <SelectItem value="normas_brasil">NormasBrasil</SelectItem>
                    <SelectItem value="custom">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Selecione o fornecedor da API de atualização de legislação
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="apiEndpoint"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL da API</FormLabel>
                <FormControl>
                  <Input placeholder="https://api.exemplo.com/v1" {...field} />
                </FormControl>
                <FormDescription>
                  Endereço da API que fornece as atualizações de legislação contábil
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="authToken"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Token de Autenticação</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Insira o token de API" {...field} />
                </FormControl>
                <FormDescription>
                  Token para autenticação na API do fornecedor
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="intervaloDias"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Intervalo de Verificação (dias)</FormLabel>
                <FormControl>
                  <Input type="number" min="1" {...field} />
                </FormControl>
                <FormDescription>
                  Frequência com que o sistema verificará atualizações
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="atualizacaoAutomatica"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Atualização Automática</FormLabel>
                    <FormDescription>
                      Atualizar cálculos automaticamente quando houver mudanças na legislação
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="notificacoes"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Receber Notificações</FormLabel>
                    <FormDescription>
                      Notificar sobre alterações na legislação contábil
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>
          
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Última verificação: 16/05/2025 às 08:23</span>
              </div>
              <div className="flex items-center gap-2 text-sm mt-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span>Última atualização: 12/05/2025 (4 alterações)</span>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Salvando..." : "Salvar Configurações"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={testConnection}
              disabled={isSaving}
            >
              Testar Conexão
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
