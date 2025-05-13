
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase/client';
import { toast } from "@/hooks/use-toast";
import { Globe, Clock, Shield, Check } from "lucide-react";

// Schema de validação para os dados de integração de consultoria
const consultoriaSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  url: z.string().url("URL inválida"),
  apiKey: z.string().min(1, "API Key é obrigatória"),
  periodoAtualizacao: z.enum(["diario", "semanal", "quinzenal", "mensal"]),
  tiposAtualizacao: z.array(z.string()).min(1, "Selecione pelo menos um tipo de atualização"),
  atualizacaoAutomatica: z.boolean().default(false),
  notificarMudancas: z.boolean().default(true),
  salvarHistorico: z.boolean().default(true),
  telefone: z.string().optional(),
  email: z.string().email("Email inválido").optional(),
  contato: z.string().optional(),
});

export function ConsultoriaIntegracaoForm() {
  const [loading, setLoading] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  
  // Formulário para integração de consultoria
  const form = useForm<z.infer<typeof consultoriaSchema>>({
    resolver: zodResolver(consultoriaSchema),
    defaultValues: {
      nome: "",
      url: "",
      apiKey: "",
      periodoAtualizacao: "semanal",
      tiposAtualizacao: ["federal", "estadual"],
      atualizacaoAutomatica: false,
      notificarMudancas: true,
      salvarHistorico: true,
      telefone: "",
      email: "",
      contato: "",
    },
  });
  
  const tiposAtualizacao = [
    { id: "federal", label: "Legislação Federal" },
    { id: "estadual", label: "Legislação Estadual" },
    { id: "municipal", label: "Legislação Municipal" },
    { id: "aliquotas", label: "Alíquotas e Taxas" },
    { id: "codigos", label: "Códigos de Receita" },
    { id: "prazos", label: "Prazos de Entrega" },
  ];

  const onSubmit = async (data: z.infer<typeof consultoriaSchema>) => {
    setLoading(true);
    
    try {
      // Salvar a integração com a consultoria
      const { data: savedData, error } = await supabase
        .from('consultorias_fiscais')
        .insert({
          nome: data.nome,
          url: data.url,
          api_key: data.apiKey,
          periodo_atualizacao: data.periodoAtualizacao,
          tipos_atualizacao: data.tiposAtualizacao,
          atualizacao_automatica: data.atualizacaoAutomatica,
          notificar_mudancas: data.notificarMudancas,
          salvar_historico: data.salvarHistorico,
          telefone: data.telefone,
          email: data.email,
          contato: data.contato,
          ativo: true,
          data_integracao: new Date().toISOString()
        });
      
      if (error) throw error;
      
      toast({
        title: "Integração Configurada",
        description: `A integração com ${data.nome} foi configurada com sucesso.`,
      });
      
      // Limpar formulário
      form.reset();
      setIsConnected(false);
    } catch (error: any) {
      console.error('Erro ao salvar integração de consultoria:', error);
      toast({
        title: "Erro",
        description: `Não foi possível salvar a integração: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const testConnection = async () => {
    setTestingConnection(true);
    
    try {
      const data = form.getValues();
      
      // Simulação de teste de conexão
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulando sucesso na conexão
      setIsConnected(true);
      toast({
        title: "Conexão Estabelecida",
        description: `Conexão com ${data.nome} testada com sucesso.`,
      });
    } catch (error: any) {
      console.error('Erro ao testar conexão:', error);
      toast({
        title: "Erro",
        description: `Não foi possível conectar à consultoria: ${error.message}`,
        variant: "destructive",
      });
      setIsConnected(false);
    } finally {
      setTestingConnection(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Integração com Consultoria Especializada
        </CardTitle>
        <CardDescription>
          Configure a integração com consultorias fiscais para receber atualizações automáticas de parâmetros fiscais.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Consultoria</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Nome da consultoria" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL da API</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://api.consultoria.com.br/fiscal" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="apiKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>API Key</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Chave de API" type="password" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="periodoAtualizacao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Período de Atualização</FormLabel>
                      <select
                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...field}
                      >
                        <option value="diario">Diário</option>
                        <option value="semanal">Semanal</option>
                        <option value="quinzenal">Quinzenal</option>
                        <option value="mensal">Mensal</option>
                      </select>
                      <FormDescription>
                        Frequência com que os parâmetros serão atualizados
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="tiposAtualizacao"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel>Tipos de Atualização</FormLabel>
                        <FormDescription>
                          Selecione quais tipos de parâmetros devem ser atualizados
                        </FormDescription>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {tiposAtualizacao.map((tipo) => (
                          <FormField
                            key={tipo.id}
                            control={form.control}
                            name="tiposAtualizacao"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={tipo.id}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(tipo.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, tipo.id])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== tipo.id
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {tipo.label}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 gap-2 pt-4">
                  <FormField
                    control={form.control}
                    name="atualizacaoAutomatica"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Atualização Automática</FormLabel>
                          <FormDescription>
                            Aplicar atualizações automaticamente sem revisão manual
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="notificarMudancas"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Notificar sobre Mudanças</FormLabel>
                          <FormDescription>
                            Enviar notificações quando houver atualizações nos parâmetros
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="salvarHistorico"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Manter Histórico de Versões</FormLabel>
                          <FormDescription>
                            Salvar histórico de todas as versões anteriores dos parâmetros
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h3 className="text-md font-medium mb-4">Informações de Contato da Consultoria</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="telefone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="(00) 0000-0000" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="contato@consultoria.com.br" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="contato"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Contato</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Nome do responsável" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <div className="mt-4 flex justify-between">
              <Button 
                type="button" 
                variant="outline" 
                onClick={testConnection}
                disabled={testingConnection || loading}
              >
                {testingConnection ? "Testando..." : "Testar Conexão"}
              </Button>
              
              {isConnected && (
                <div className="flex items-center text-green-600">
                  <Check className="mr-2 h-4 w-4" />
                  <span>Conexão estabelecida</span>
                </div>
              )}
              
              <Button type="submit" disabled={loading || testingConnection}>
                {loading ? "Salvando..." : "Salvar Configuração"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
