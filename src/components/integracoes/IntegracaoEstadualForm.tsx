
import React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
} from "@/components/ui/form";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { UF, salvarCredenciaisEstadual } from '@/services/governamental/estadualIntegration';
import { saveIntegracaoEstadual } from '@/services/supabase/integracoesService';
import { EstadualFormHeader } from './forms/EstadualFormHeader';
import { CredenciaisFields } from './forms/CredenciaisFields';
import { CertificadoUploader } from './forms/CertificadoUploader';
import { CodigoAcessoField } from './forms/CodigoAcessoField';
import { estadualFormSchema, EstadualFormValues } from './forms/estadualFormSchema';

interface IntegracaoEstadualFormProps {
  clientId: string;
  clientName?: string;
  uf: UF;
  onSave: (data: EstadualFormValues) => void;
}

export function IntegracaoEstadualForm({ clientId, clientName, uf, onSave }: IntegracaoEstadualFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);

  const form = useForm<EstadualFormValues>({
    resolver: zodResolver(estadualFormSchema),
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

  const handleSubmit = async (data: EstadualFormValues) => {
    setIsSubmitting(true);
    try {
      // Salvar credenciais no localStorage (manter para compatibilidade)
      salvarCredenciaisEstadual({
        uf,
        certificate: data.certificadoDigital,
        password: data.senha,
        apiKey: data.codigoAcesso,
        username: data.usuario
      });
      
      // Salvar na base de dados do Supabase
      const saved = await saveIntegracaoEstadual(clientId, uf, data);
      
      if (!saved) {
        throw new Error("Não foi possível salvar a configuração no banco de dados");
      }
      
      onSave(data);
      toast({
        title: "Integração configurada",
        description: `Configuração de acesso à SEFAZ-${uf} realizada com sucesso.`,
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
      <EstadualFormHeader uf={uf} clientName={clientName} />
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="usuario"
              render={() => <CredenciaisFields form={form} uf={uf} />}
            />

            <FormField
              control={form.control}
              name="certificadoDigital"
              render={() => <CertificadoUploader form={form} onFileChange={handleFileChange} />}
            />

            <FormField
              control={form.control}
              name="codigoAcesso"
              render={() => <CodigoAcessoField form={form} />}
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
