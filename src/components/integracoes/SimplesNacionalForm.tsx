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
import { salvarCredenciaisSimplesNacional } from '@/services/governamental/simplesNacionalIntegration';
import { saveIntegracaoSimplesNacional } from '@/services/supabase/integracoesService';

const formSchema = z.object({
  codigoAcesso: z.string().min(8, {
    message: "O código de acesso deve ter pelo menos 8 caracteres",
  }),
  certificadoDigital: z.string().optional(),
  senhaCertificado: z.string().min(6, {
    message: "A senha deve ter pelo menos 6 caracteres",
  }).optional(),
});

interface SimplesNacionalFormProps {
  clientId: string;
  clientName?: string;
  cnpj: string;
  onSave: (data: z.infer<typeof formSchema>) => void;
}

export function SimplesNacionalForm({ clientId, clientName, cnpj, onSave }: SimplesNacionalFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      codigoAcesso: "",
      certificadoDigital: "",
      senhaCertificado: "",
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
      // Salvar credenciais no localStorage (manter para compatibilidade)
      salvarCredenciaisSimplesNacional({
        cnpj,
        codigo_acesso: data.codigoAcesso,
        certificado_digital: data.certificadoDigital,
        senha_certificado: data.senhaCertificado
      });
      
      // Salvar na base de dados do Supabase
      const saved = await saveIntegracaoSimplesNacional(clientId, cnpj, data);
      
      if (!saved) {
        throw new Error("Não foi possível salvar a configuração no banco de dados");
      }
      
      onSave(data);
      toast({
        title: "Integração configurada",
        description: `Configuração de acesso ao Portal do Simples Nacional realizada com sucesso.`,
      });
    } catch (error) {
      console.error("Erro ao salvar:", error);
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
          <CardTitle>Integração com Portal do Simples Nacional</CardTitle>
        </div>
        <CardDescription>
          Configure o acesso ao Portal do Simples Nacional {clientName ? ` para ${clientName}` : ""} com CNPJ {cnpj || "[CNPJ não informado]"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="codigoAcesso"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código de Acesso</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o código de acesso do portal" {...field} />
                  </FormControl>
                  <FormDescription>
                    Código de acesso do portal do Simples Nacional
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
              name="senhaCertificado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha do Certificado</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input type="password" placeholder="Digite a senha do certificado digital" {...field} />
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
