
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CertificadoWizard } from './CertificadoWizard';

const fiscalFormSchema = z.object({
  ecacUsername: z.string().min(1, 'Usuário do e-CAC é obrigatório'),
  ecacPassword: z.string().min(1, 'Senha do e-CAC é obrigatória'),
  certificadoDigital: z.boolean().default(false),
  certificadoArquivo: z.string().optional(),
  certificadoSenha: z.string().optional(),
  sefazUsuario: z.string().optional(),
  sefazSenha: z.string().optional(),
  prefeituraUsuario: z.string().optional(),
  prefeituraSenha: z.string().optional(),
});

type FiscalFormValues = z.infer<typeof fiscalFormSchema>;

interface IntegracaoFiscalFormProps {
  onSubmit: (data: FiscalFormValues) => void;
}

export function IntegracaoFiscalForm({ onSubmit }: IntegracaoFiscalFormProps) {
  const [useWizard, setUseWizard] = useState(false);
  
  const form = useForm<FiscalFormValues>({
    resolver: zodResolver(fiscalFormSchema),
    defaultValues: {
      ecacUsername: '',
      ecacPassword: '',
      certificadoDigital: false,
      certificadoArquivo: '',
      certificadoSenha: '',
      sefazUsuario: '',
      sefazSenha: '',
      prefeituraUsuario: '',
      prefeituraSenha: '',
    },
  });

  const usaCertificado = form.watch('certificadoDigital');

  const handleWizardComplete = (certificadoData: any) => {
    // Atualizar o formulário com os dados do wizard
    form.setValue('certificadoDigital', true);
    if (certificadoData.tipo === 'A1' && certificadoData.arquivo) {
      form.setValue('certificadoArquivo', certificadoData.arquivo);
    }
    if (certificadoData.senha) {
      form.setValue('certificadoSenha', certificadoData.senha);
    }
    setUseWizard(false);
  };

  if (useWizard) {
    return <CertificadoWizard onComplete={handleWizardComplete} />;
  }

  return (
    <Tabs defaultValue="basico" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="basico">Configuração Básica</TabsTrigger>
        <TabsTrigger value="wizard">Wizard de Certificados</TabsTrigger>
      </TabsList>
      
      <TabsContent value="basico" className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Integração com Receita Federal (e-CAC)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="ecacUsername"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Usuário e-CAC</FormLabel>
                      <FormControl>
                        <Input placeholder="CPF ou CNPJ" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ecacPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha e-CAC</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Senha do e-CAC" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="certificadoDigital"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox 
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Utilizar Certificado Digital</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Recomendado para acessar funcionalidades avançadas da Receita Federal
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              {usaCertificado && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-md">
                  <FormField
                    control={form.control}
                    name="certificadoArquivo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Arquivo do Certificado</FormLabel>
                        <FormControl>
                          <Input type="file" onChange={(e) => field.onChange(e.target.value)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="certificadoSenha"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha do Certificado</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Senha do certificado digital" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Integração com Secretaria da Fazenda Estadual</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="sefazUsuario"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Usuário SEFAZ</FormLabel>
                      <FormControl>
                        <Input placeholder="Usuário da SEFAZ" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sefazSenha"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha SEFAZ</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Senha da SEFAZ" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Integração com Prefeitura</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="prefeituraUsuario"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Usuário Prefeitura</FormLabel>
                      <FormControl>
                        <Input placeholder="Usuário da Prefeitura" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="prefeituraSenha"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha Prefeitura</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Senha da Prefeitura" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="pt-6 text-right">
              <Button type="submit">Continuar</Button>
            </div>
          </form>
        </Form>
      </TabsContent>

      <TabsContent value="wizard" className="space-y-6">
        <div className="text-center space-y-4">
          <h3 className="text-lg font-semibold">Wizard de Configuração de Certificados</h3>
          <p className="text-muted-foreground">
            Use nosso wizard inteligente para configurar automaticamente seus certificados digitais
            com detecção automática A3, teste de conectividade e guia completo.
          </p>
          <Button onClick={() => setUseWizard(true)} size="lg">
            Iniciar Wizard de Certificados
          </Button>
        </div>
      </TabsContent>
    </Tabs>
  );
}
