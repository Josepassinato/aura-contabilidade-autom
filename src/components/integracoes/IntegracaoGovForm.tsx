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
import { toast } from "@/components/ui/use-toast";
import { KeyRound, Lock, ShieldCheck, FileText, Upload } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProcuracoesEletronicas } from "./ecac/ProcuracoesEletronicas";
import { EcacXmlUploader } from "./ecac/EcacXmlUploader";

const formSchema = z.object({
  certificadoDigital: z.string().min(1, {
    message: "Selecione um certificado digital",
  }),
  senha: z.string().min(6, {
    message: "A senha deve ter pelo menos 6 caracteres",
  }),
  codigoAcesso: z.string().optional(),
  renovarAutomaticamente: z.boolean().default(true),
});

interface IntegracaoGovFormProps {
  clientId: string;
  clientName?: string;
  onSave: (data: z.infer<typeof formSchema>) => void;
}

export function IntegracaoGovForm({ clientId, clientName, onSave }: IntegracaoGovFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [activeTab, setActiveTab] = React.useState("acesso");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      certificadoDigital: "",
      senha: "",
      codigoAcesso: "",
      renovarAutomaticamente: true,
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
      // Simulação de envio do certificado digital
      await new Promise(resolve => setTimeout(resolve, 1500));
      onSave(data);
      toast({
        title: "Integração configurada",
        description: "Configuração de acesso ao e-CAC realizada com sucesso.",
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
          <CardTitle>Integração com e-CAC</CardTitle>
        </div>
        <CardDescription>
          Configure o acesso ao e-CAC da Receita Federal{clientName ? ` para ${clientName}` : ""}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="acesso">Configuração de Acesso</TabsTrigger>
            <TabsTrigger value="procuracoes">
              <FileText className="h-4 w-4 mr-2" />
              Procurações Eletrônicas
            </TabsTrigger>
            <TabsTrigger value="upload">
              <Upload className="h-4 w-4 mr-2" />
              Upload Manual
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="acesso">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="certificadoDigital"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Certificado Digital</FormLabel>
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
                  name="senha"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha do Certificado</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input type="password" placeholder="Digite a senha do certificado" {...field} />
                          <Lock className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        </div>
                      </FormControl>
                      <FormDescription>
                        A senha do certificado ficará armazenada de forma segura
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
                        Código de acesso alternativo ao certificado digital
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="renovarAutomaticamente"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center gap-2 space-y-0">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </FormControl>
                      <FormLabel className="m-0">Renovar sessão automaticamente</FormLabel>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || !form.formState.isValid}
                  >
                    {isSubmitting ? "Configurando..." : "Salvar Configuração"}
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="procuracoes">
            <ProcuracoesEletronicas 
              clientId={clientId} 
              clientName={clientName} 
            />
          </TabsContent>

          <TabsContent value="upload">
            <EcacXmlUploader 
              clientId={clientId} 
              clientName={clientName} 
            />
          </TabsContent>
        </Tabs>
      </CardContent>
      
      {activeTab === "acesso" && (
        <CardFooter>
          <Button 
            onClick={form.handleSubmit(handleSubmit)} 
            disabled={isSubmitting || !form.formState.isValid}
            className="ml-auto"
          >
            {isSubmitting ? "Configurando..." : "Salvar Configuração"}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
