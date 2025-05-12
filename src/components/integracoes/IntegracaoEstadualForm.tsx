
import React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { KeyRound, Lock, ShieldCheck } from "lucide-react";
import { UF, salvarCredenciaisEstadual } from '@/services/governamental/estadualIntegration';

const formSchema = z.object({
  certificadoDigital: z.string().min(1, {
    message: "Selecione um certificado digital",
  }).optional(),
  senha: z.string().min(6, {
    message: "A senha deve ter pelo menos 6 caracteres",
  }).optional(),
  codigoAcesso: z.string().optional(),
  usuario: z.string().min(1, {
    message: "O usuário é obrigatório",
  }).optional(),
});

interface IntegracaoEstadualFormProps {
  clientId: string;
  clientName?: string;
  uf: UF;
  onSave: (data: z.infer<typeof formSchema>) => void;
}

export function IntegracaoEstadualForm({ clientId, clientName, uf, onSave }: IntegracaoEstadualFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      certificadoDigital: "",
      senha: "",
      codigoAcesso: "",
      usuario: "",
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      form.setValue("certificadoDigital", e.target.files[0].name);
    }
  };

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      // Salvar credenciais no localStorage
      salvarCredenciaisEstadual({
        uf,
        certificate: data.certificadoDigital,
        password: data.senha,
        apiKey: data.codigoAcesso,
        username: data.usuario
      });
      
      // Simulação de envio do certificado digital
      await new Promise(resolve => setTimeout(resolve, 1500));
      onSave(data);
      toast({
        title: "Integração configurada",
        description: `Configuração de acesso à SEFAZ-${uf} realizada com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro na configuração",
        description: "Não foi possível configurar a integração.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-primary" />
          <CardTitle>Integração com SEFAZ-{uf}</CardTitle>
        </div>
        <CardDescription>
          Configure o acesso à Secretaria da Fazenda {uf}{clientName ? ` para ${clientName}` : ""}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="usuario"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Usuário SEFAZ-{uf}</FormLabel>
                  <FormControl>
                    <Input placeholder={`Digite o usuário do portal SEFAZ-${uf}`} {...field} />
                  </FormControl>
                  <FormDescription>
                    Usuário cadastrado no portal da SEFAZ-{uf}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="senha"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input type="password" placeholder={`Digite a senha do portal SEFAZ-${uf}`} {...field} />
                      <Lock className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    </div>
                  </FormControl>
                  <FormDescription>
                    A senha ficará armazenada de forma segura
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="certificadoDigital"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Certificado Digital (opcional)</FormLabel>
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      placeholder="Nenhum arquivo selecionado"
                      readOnly
                      value={field.value}
                      className="flex-1"
                    />
                    <div className="relative">
                      <Button type="button" variant="outline">
                        <ShieldCheck className="h-4 w-4 mr-2" />
                        Selecionar
                      </Button>
                      <Input
                        type="file"
                        accept=".pfx,.p12"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={handleFileChange}
                      />
                    </div>
                  </div>
                  <FormDescription>
                    Selecione o arquivo de certificado digital (.pfx ou .p12)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="codigoAcesso"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código de Acesso (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o código de acesso (opcional)" {...field} />
                  </FormControl>
                  <FormDescription>
                    Código de acesso alternativo para integrações via API
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={form.handleSubmit(handleSubmit)} 
          disabled={isSubmitting}
          className="ml-auto"
        >
          {isSubmitting ? "Configurando..." : "Salvar Configuração"}
        </Button>
      </CardFooter>
    </Card>
  );
}
