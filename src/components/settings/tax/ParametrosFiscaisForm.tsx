
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase/client';
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Schema de validação para os parâmetros do IRPJ
const IRPJSchema = z.object({
  aliquotaGeral: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0 && parseFloat(val) <= 100, {
    message: "A alíquota deve ser um número entre 0 e 100",
  }),
  limiteAdicional: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
    message: "O limite deve ser um valor positivo",
  }),
  aliquotaAdicional: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0 && parseFloat(val) <= 100, {
    message: "A alíquota adicional deve ser um número entre 0 e 100",
  }),
  lucroPresumidoPercentual: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0 && parseFloat(val) <= 100, {
    message: "O percentual deve ser um número entre 0 e 100",
  }),
  codigoReceita: z.string().min(1, "O código da receita é obrigatório"),
});

// Schema de validação para os parâmetros do CSLL
const CSLLSchema = z.object({
  aliquota: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0 && parseFloat(val) <= 100, {
    message: "A alíquota deve ser um número entre 0 e 100",
  }),
  lucroPresumidoPercentual: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0 && parseFloat(val) <= 100, {
    message: "O percentual deve ser um número entre 0 e 100",
  }),
  codigoReceita: z.string().min(1, "O código da receita é obrigatório"),
});

// Schema de validação para os parâmetros do PIS/COFINS
const PISCOFINSSchema = z.object({
  aliquotaPISLucroPresumido: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0 && parseFloat(val) <= 100, {
    message: "A alíquota deve ser um número entre 0 e 100",
  }),
  aliquotaPISLucroReal: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0 && parseFloat(val) <= 100, {
    message: "A alíquota deve ser um número entre 0 e 100",
  }),
  aliquotaCOFINSLucroPresumido: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0 && parseFloat(val) <= 100, {
    message: "A alíquota deve ser um número entre 0 e 100",
  }),
  aliquotaCOFINSLucroReal: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0 && parseFloat(val) <= 100, {
    message: "A alíquota deve ser um número entre 0 e 100",
  }),
  codigoReceitaPISPresu: z.string().min(1, "O código da receita é obrigatório"),
  codigoReceitaPISReal: z.string().min(1, "O código da receita é obrigatório"),
  codigoReceitaCOFINSPresu: z.string().min(1, "O código da receita é obrigatório"),
  codigoReceitaCOFINSReal: z.string().min(1, "O código da receita é obrigatório"),
});

// Schema de validação para os parâmetros do INSS/FGTS
const INSSFGTSSchema = z.object({
  aliquotaINSSPatronal: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0 && parseFloat(val) <= 100, {
    message: "A alíquota deve ser um número entre 0 e 100",
  }),
  aliquotaFGTS: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0 && parseFloat(val) <= 100, {
    message: "A alíquota deve ser um número entre 0 e 100",
  }),
  tetoINSS: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
    message: "O teto deve ser um valor positivo",
  }),
  faixasINSS: z.string().optional(),
  codigoReceitaINSS: z.string().min(1, "O código da receita é obrigatório"),
});

// Schema de validação para os parâmetros do Simples Nacional
const SimplesNacionalSchema = z.object({
  anexo: z.enum(["I", "II", "III", "IV", "V"]),
  faixasFaturamento: z.string(),
  aliquotasEfetivas: z.string(),
  percentualISSSimples: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0 && parseFloat(val) <= 100, {
    message: "O percentual deve ser um número entre 0 e 100",
  }),
});

export function ParametrosFiscaisForm() {
  const [activeTab, setActiveTab] = useState("irpj");
  const [saving, setSaving] = useState(false);
  const [consultoriaId, setConsultoriaId] = useState<string | null>(null);
  const [versaoAtual, setVersaoAtual] = useState("1.0");
  const [dataAtualizacao, setDataAtualizacao] = useState(new Date().toISOString().split('T')[0]);
  const [consultorias, setConsultorias] = useState<{id: string, nome: string}[]>([]);
  
  // Carregar consultorias
  useEffect(() => {
    const fetchConsultorias = async () => {
      try {
        const { data, error } = await supabase
          .from('consultorias_fiscais')
          .select('id, nome')
          .eq('ativo', true);
          
        if (error) throw error;
        
        if (data) {
          setConsultorias(data);
        }
      } catch (error) {
        console.error('Erro ao carregar consultorias:', error);
      }
    };
    
    fetchConsultorias();
  }, []);

  // Formulários para cada tipo de imposto
  const irpjForm = useForm<z.infer<typeof IRPJSchema>>({
    resolver: zodResolver(IRPJSchema),
    defaultValues: {
      aliquotaGeral: "15",
      limiteAdicional: "20000",
      aliquotaAdicional: "10",
      lucroPresumidoPercentual: "32",
      codigoReceita: "2203",
    },
  });

  const csllForm = useForm<z.infer<typeof CSLLSchema>>({
    resolver: zodResolver(CSLLSchema),
    defaultValues: {
      aliquota: "9",
      lucroPresumidoPercentual: "32",
      codigoReceita: "2372",
    },
  });

  const pisCofinsForm = useForm<z.infer<typeof PISCOFINSSchema>>({
    resolver: zodResolver(PISCOFINSSchema),
    defaultValues: {
      aliquotaPISLucroPresumido: "0.65",
      aliquotaPISLucroReal: "1.65",
      aliquotaCOFINSLucroPresumido: "3",
      aliquotaCOFINSLucroReal: "7.6",
      codigoReceitaPISPresu: "8109",
      codigoReceitaPISReal: "6912",
      codigoReceitaCOFINSPresu: "2172",
      codigoReceitaCOFINSReal: "5856",
    },
  });

  const inssFgtsForm = useForm<z.infer<typeof INSSFGTSSchema>>({
    resolver: zodResolver(INSSFGTSSchema),
    defaultValues: {
      aliquotaINSSPatronal: "20",
      aliquotaFGTS: "8",
      tetoINSS: "828.39",
      faixasINSS: JSON.stringify([
        { ate: 1412.00, aliquota: 7.5 },
        { de: 1412.01, ate: 2666.68, aliquota: 9 },
        { de: 2666.69, ate: 4000.00, aliquota: 12 },
        { de: 4000.01, ate: 7786.02, aliquota: 14 }
      ]),
      codigoReceitaINSS: "2100",
    },
  });

  const simplesForm = useForm<z.infer<typeof SimplesNacionalSchema>>({
    resolver: zodResolver(SimplesNacionalSchema),
    defaultValues: {
      anexo: "III",
      faixasFaturamento: JSON.stringify([
        { ate: 180000, aliquota: 6, deducao: 0 },
        { de: 180000.01, ate: 360000, aliquota: 11.2, deducao: 9360 },
        { de: 360000.01, ate: 720000, aliquota: 13.5, deducao: 17640 },
        { de: 720000.01, ate: 1800000, aliquota: 16, deducao: 35640 },
        { de: 1800000.01, ate: 3600000, aliquota: 21, deducao: 125640 },
        { de: 3600000.01, ate: 4800000, aliquota: 33, deducao: 648000 }
      ]),
      aliquotasEfetivas: JSON.stringify({
        IRPJ: 0.04,
        CSLL: 0.035,
        COFINS: 0.1282,
        PIS: 0.0278,
        CPP: 0.4340,
        ISS: 0.325
      }),
      percentualISSSimples: "5",
    },
  });

  // Função para salvar os parâmetros
  const handleSaveParametros = async (tabName: string) => {
    setSaving(true);

    try {
      let formData;
      let isValid = false;

      // Verificar qual formulário está ativo e validar
      switch (tabName) {
        case 'irpj':
          isValid = await irpjForm.trigger();
          formData = irpjForm.getValues();
          break;
        case 'csll':
          isValid = await csllForm.trigger();
          formData = csllForm.getValues();
          break;
        case 'piscofins':
          isValid = await pisCofinsForm.trigger();
          formData = pisCofinsForm.getValues();
          break;
        case 'inssfgts':
          isValid = await inssFgtsForm.trigger();
          formData = inssFgtsForm.getValues();
          break;
        case 'simples':
          isValid = await simplesForm.trigger();
          formData = simplesForm.getValues();
          break;
        default:
          isValid = false;
      }

      if (!isValid) {
        toast({
          title: "Validação Falhou",
          description: "Verifique os campos do formulário e tente novamente.",
          variant: "destructive",
        });
        return;
      }

      // Criar uma nova versão dos parâmetros fiscais
      const novaVersao = (parseFloat(versaoAtual) + 0.1).toFixed(1);

      // Salvar os parâmetros no banco de dados
      const { data, error } = await supabase
        .from('parametros_fiscais')
        .insert({
          tipo: tabName,
          parametros: formData,
          versao: novaVersao,
          data_atualizacao: new Date().toISOString(),
          consultoria_id: consultoriaId,
          ativo: true
        });

      if (error) {
        throw error;
      }

      // Atualizar versão atual
      setVersaoAtual(novaVersao);
      setDataAtualizacao(new Date().toISOString().split('T')[0]);

      toast({
        title: "Parâmetros Atualizados",
        description: `Os parâmetros de ${tabName.toUpperCase()} foram atualizados com sucesso para a versão ${novaVersao}.`,
      });
    } catch (error: any) {
      console.error('Erro ao salvar parâmetros:', error);
      toast({
        title: "Erro",
        description: `Não foi possível salvar os parâmetros: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Painel Administrativo de Parâmetros Fiscais</CardTitle>
          <CardDescription>
            Gerencie os parâmetros de cálculo para impostos e obrigações fiscais.
            <div className="mt-2 flex items-center gap-4">
              <span className="text-sm font-medium">Versão atual: {versaoAtual}</span>
              <span className="text-sm">Última atualização: {dataAtualizacao}</span>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-5 mb-6">
              <TabsTrigger value="irpj">IRPJ</TabsTrigger>
              <TabsTrigger value="csll">CSLL</TabsTrigger>
              <TabsTrigger value="piscofins">PIS/COFINS</TabsTrigger>
              <TabsTrigger value="inssfgts">INSS/FGTS</TabsTrigger>
              <TabsTrigger value="simples">Simples Nacional</TabsTrigger>
            </TabsList>
            
            {/* Formulário IRPJ */}
            <TabsContent value="irpj">
              <Form {...irpjForm}>
                <form className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={irpjForm.control}
                      name="aliquotaGeral"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Alíquota Geral (%)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="15" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={irpjForm.control}
                      name="limiteAdicional"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Limite para Adicional (R$)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="20000" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={irpjForm.control}
                      name="aliquotaAdicional"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Alíquota Adicional (%)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="10" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={irpjForm.control}
                      name="lucroPresumidoPercentual"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Percentual Lucro Presumido (%)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="32" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={irpjForm.control}
                    name="codigoReceita"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Código da Receita</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="2203" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </TabsContent>
            
            {/* Formulário CSLL */}
            <TabsContent value="csll">
              <Form {...csllForm}>
                <form className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={csllForm.control}
                      name="aliquota"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Alíquota (%)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="9" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={csllForm.control}
                      name="lucroPresumidoPercentual"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Percentual Lucro Presumido (%)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="32" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={csllForm.control}
                    name="codigoReceita"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Código da Receita</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="2372" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </TabsContent>
            
            {/* Formulário PIS/COFINS */}
            <TabsContent value="piscofins">
              <Form {...pisCofinsForm}>
                <form className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={pisCofinsForm.control}
                      name="aliquotaPISLucroPresumido"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Alíquota PIS Lucro Presumido (%)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="0.65" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={pisCofinsForm.control}
                      name="aliquotaPISLucroReal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Alíquota PIS Lucro Real (%)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="1.65" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={pisCofinsForm.control}
                      name="aliquotaCOFINSLucroPresumido"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Alíquota COFINS Lucro Presumido (%)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="3" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={pisCofinsForm.control}
                      name="aliquotaCOFINSLucroReal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Alíquota COFINS Lucro Real (%)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="7.6" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={pisCofinsForm.control}
                      name="codigoReceitaPISPresu"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Código Receita PIS Presumido</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="8109" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={pisCofinsForm.control}
                      name="codigoReceitaPISReal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Código Receita PIS Real</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="6912" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={pisCofinsForm.control}
                      name="codigoReceitaCOFINSPresu"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Código Receita COFINS Presumido</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="2172" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={pisCofinsForm.control}
                      name="codigoReceitaCOFINSReal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Código Receita COFINS Real</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="5856" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </form>
              </Form>
            </TabsContent>
            
            {/* Formulário INSS/FGTS */}
            <TabsContent value="inssfgts">
              <Form {...inssFgtsForm}>
                <form className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={inssFgtsForm.control}
                      name="aliquotaINSSPatronal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Alíquota INSS Patronal (%)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="20" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={inssFgtsForm.control}
                      name="aliquotaFGTS"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Alíquota FGTS (%)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="8" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={inssFgtsForm.control}
                      name="tetoINSS"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Teto INSS (R$)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="828.39" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={inssFgtsForm.control}
                      name="codigoReceitaINSS"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Código da Receita INSS</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="2100" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={inssFgtsForm.control}
                    name="faixasINSS"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Faixas INSS (formato JSON)</FormLabel>
                        <FormControl>
                          <textarea 
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </TabsContent>
            
            {/* Formulário Simples Nacional */}
            <TabsContent value="simples">
              <Form {...simplesForm}>
                <form className="space-y-4">
                  <FormField
                    control={simplesForm.control}
                    name="anexo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Anexo</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o anexo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="I">Anexo I</SelectItem>
                            <SelectItem value="II">Anexo II</SelectItem>
                            <SelectItem value="III">Anexo III</SelectItem>
                            <SelectItem value="IV">Anexo IV</SelectItem>
                            <SelectItem value="V">Anexo V</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={simplesForm.control}
                    name="faixasFaturamento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Faixas de Faturamento (formato JSON)</FormLabel>
                        <FormControl>
                          <textarea 
                            className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={simplesForm.control}
                    name="aliquotasEfetivas"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alíquotas Efetivas por Imposto (formato JSON)</FormLabel>
                        <FormControl>
                          <textarea 
                            className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={simplesForm.control}
                    name="percentualISSSimples"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Percentual ISS no Simples (%)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="5" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="flex items-center gap-2">
            <Select onValueChange={setConsultoriaId}>
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Selecione uma consultoria (opcional)" />
              </SelectTrigger>
              <SelectContent>
                {consultorias.length > 0 ? (
                  consultorias.map(consultoria => (
                    <SelectItem key={consultoria.id} value={consultoria.id}>{consultoria.nome}</SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>Nenhuma consultoria cadastrada</SelectItem>
                )}
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">Associar atualização a uma consultoria</span>
          </div>
          <Button onClick={() => handleSaveParametros(activeTab)} disabled={saving}>
            {saving ? "Salvando..." : "Salvar Parâmetros"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
