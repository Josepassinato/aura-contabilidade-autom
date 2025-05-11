
import React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "@/hooks/use-toast";
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
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "O nome do assistente deve ter pelo menos 2 caracteres.",
  }),
  voiceType: z.enum(["masculino", "feminino", "neutro"], {
    required_error: "Por favor selecione um tipo de voz.",
  }),
  voiceStyle: z.enum(["formal", "casual", "amigável"], {
    required_error: "Por favor selecione um estilo de voz.",
  }),
  welcomeMessage: z.string().min(10, {
    message: "A mensagem de boas-vindas deve ter pelo menos 10 caracteres.",
  }),
  permitirRelatorios: z.boolean().default(true),
  permitirAnalises: z.boolean().default(true),
  permitirOperacoes: z.boolean().default(false),
  emailDestinoRelatorios: z.string().email({
    message: "Por favor informe um e-mail válido.",
  }).optional().or(z.literal('')),
  comandosPersonalizados: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function VoiceAssistantConfig() {
  // Valores padrão para o formulário
  const defaultValues: FormValues = {
    name: "Assistente ContaFlix",
    voiceType: "feminino",
    voiceStyle: "formal",
    welcomeMessage: "Olá! Sou o assistente virtual da ContaFlix. Como posso ajudar você hoje?",
    permitirRelatorios: true,
    permitirAnalises: true,
    permitirOperacoes: false,
    emailDestinoRelatorios: "",
    comandosPersonalizados: "",
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  function onSubmit(values: FormValues) {
    console.log(values);
    
    // Salva as configurações (em produção isso iria para a API)
    localStorage.setItem("voice-assistant-config", JSON.stringify(values));
    
    toast({
      title: "Configurações salvas",
      description: "As configurações do assistente de voz foram atualizadas.",
    });
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Configuração do Assistente de Voz</CardTitle>
        <CardDescription>
          Personalize seu assistente de voz com inteligência artificial
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Assistente</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do assistente" {...field} />
                    </FormControl>
                    <FormDescription>
                      O nome que será usado para identificar o assistente.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="voiceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Voz</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um tipo de voz" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="masculino">Masculina</SelectItem>
                        <SelectItem value="feminino">Feminina</SelectItem>
                        <SelectItem value="neutro">Neutra</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      O gênero da voz do assistente.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="voiceStyle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estilo de Voz</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um estilo de voz" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="formal">Formal</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="amigável">Amigável</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Como o assistente irá se comunicar com os usuários.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="welcomeMessage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mensagem de Boas-Vindas</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Mensagem que será exibida quando o assistente for iniciado"
                      {...field}
                      className="resize-none"
                      rows={3}
                    />
                  </FormControl>
                  <FormDescription>
                    Essa mensagem será exibida quando o assistente for iniciado.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Permissões do Assistente</h3>
              
              <FormField
                control={form.control}
                name="permitirRelatorios"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between space-x-2 rounded-lg border p-3">
                    <div>
                      <FormLabel className="text-base">Permitir geração de relatórios</FormLabel>
                      <FormDescription>
                        O assistente poderá gerar e enviar relatórios por e-mail
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch 
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="permitirAnalises"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between space-x-2 rounded-lg border p-3">
                    <div>
                      <FormLabel className="text-base">Permitir análises de dados</FormLabel>
                      <FormDescription>
                        O assistente poderá analisar dados e fornecer insights
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch 
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="permitirOperacoes"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between space-x-2 rounded-lg border p-3">
                    <div>
                      <FormLabel className="text-base">Permitir operações bancárias</FormLabel>
                      <FormDescription>
                        O assistente poderá realizar pagamentos e transferências
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch 
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="emailDestinoRelatorios"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail para Envio de Relatórios</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="email@exemplo.com" 
                      {...field} 
                      type="email"
                    />
                  </FormControl>
                  <FormDescription>
                    E-mail padrão para envio de relatórios gerados pelo assistente (opcional).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="comandosPersonalizados"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comandos Personalizados</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Digite comandos personalizados, um por linha"
                      {...field}
                      className="resize-none"
                      rows={4}
                    />
                  </FormControl>
                  <FormDescription>
                    Adicione comandos personalizados que o assistente irá reconhecer (opcional).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">Salvar Configurações</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export default VoiceAssistantConfig;
