import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { formatCNPJ } from "@/components/client-access/formatCNPJ";
import { validateCNPJ } from "@/utils/validators";
import { consultarCNPJ } from "@/services/governamental/apiIntegration";
import { Building2, Users } from "lucide-react";

const formSchema = z.object({
  // Dados do escritório
  office: z.object({
    officeName: z.string().min(3, "O nome do escritório é obrigatório"),
    cnpj: z.string().min(14, "CNPJ inválido"),
    address: z.string().min(5, "O endereço é obrigatório"),
    phone: z.string().min(10, "Telefone inválido"),
    email: z.string().email("E-mail inválido"),
    website: z.string().optional(),
    description: z.string().optional(),
  }),
  // Dados do primeiro cliente
  client: z.object({
    name: z.string().min(3, "O nome da empresa é obrigatório"),
    cnpj: z.string()
      .min(14, "CNPJ deve ter 14 dígitos")
      .refine(val => validateCNPJ(val), { message: "CNPJ inválido" }),
    email: z.string().email("Email inválido"),
    phone: z.string().optional(),
    regime: z.enum(["lucro_presumido", "simples_nacional", "lucro_real"], { 
      required_error: "Selecione o regime tributário" 
    }),
  })
});

type FormValues = z.infer<typeof formSchema>;

interface OfficeClientFormProps {
  onSubmit: (officeData: any, clientData: any) => void;
}

export function OfficeClientForm({ onSubmit }: OfficeClientFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCNPJ, setIsLoadingCNPJ] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      office: {
        officeName: "",
        cnpj: "",
        address: "",
        phone: "",
        email: "",
        website: "",
        description: "",
      },
      client: {
        name: "",
        cnpj: "",
        email: "",
        phone: "",
        regime: "lucro_presumido",
      }
    },
  });

  const handleSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      
      toast({
        title: "Configuração inicial salva",
        description: "Dados do escritório e primeiro cliente foram salvos."
      });
      
      onSubmit(data.office, data.client);
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar os dados. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCNPJChange = (field: "office" | "client") => (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedCNPJ = formatCNPJ(e.target.value);
    form.setValue(`${field}.cnpj`, formattedCNPJ);
  };

  const handleCNPJBlur = (field: "office" | "client") => async () => {
    const cnpj = form.getValues(`${field}.cnpj`);
    if (cnpj && validateCNPJ(cnpj)) {
      setIsLoadingCNPJ(true);
      try {
        const resultado = await consultarCNPJ(cnpj.replace(/\D/g, ''));
        if (resultado.sucesso && resultado.dados) {
          // Auto-preencher dados encontrados
          if (resultado.dados.nome) {
            if (field === 'office') {
              form.setValue('office.officeName', resultado.dados.nome);
            } else {
              form.setValue('client.name', resultado.dados.nome);
            }
          }
          if (resultado.dados.email) {
            form.setValue(`${field}.email`, resultado.dados.email);
          }
          if (resultado.dados.telefone) {
            form.setValue(`${field}.phone`, resultado.dados.telefone);
          }
          if (field === 'office' && resultado.dados.endereco) {
            form.setValue('office.address', resultado.dados.endereco);
          }
          
          toast({
            title: "Dados encontrados",
            description: `Informações ${field === 'office' ? 'do escritório' : 'da empresa'} foram preenchidas automaticamente.`
          });
        }
      } catch (error) {
        console.log("Erro ao consultar CNPJ:", error);
      } finally {
        setIsLoadingCNPJ(false);
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        {/* Seção do Escritório */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Building2 className="h-6 w-6 text-primary" />
            <div>
              <h3 className="text-lg font-semibold">Informações do Escritório</h3>
              <p className="text-sm text-muted-foreground">
                Dados básicos do seu escritório contábil
              </p>
            </div>
          </div>

          <FormField
            control={form.control}
            name="office.officeName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Escritório</FormLabel>
                <FormControl>
                  <Input placeholder="Contabilidade Exemplo Ltda" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="office.cnpj"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CNPJ do Escritório</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        placeholder="00.000.000/0000-00" 
                        {...field}
                        onChange={handleCNPJChange('office')}
                        onBlur={handleCNPJBlur('office')}
                        disabled={isLoadingCNPJ}
                      />
                      {isLoadingCNPJ && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="office.phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input placeholder="(00) 00000-0000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="office.address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Endereço Completo</FormLabel>
                <FormControl>
                  <Input placeholder="Av. Exemplo, 123 - Bairro, Cidade/UF" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="office.email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail Principal</FormLabel>
                  <FormControl>
                    <Input placeholder="contato@exemplo.com.br" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="office.website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input placeholder="www.exemplo.com.br" {...field} />
                  </FormControl>
                  <FormDescription>Opcional</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        {/* Seção do Primeiro Cliente */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-primary" />
            <div>
              <h3 className="text-lg font-semibold">Primeiro Cliente</h3>
              <p className="text-sm text-muted-foreground">
                Adicione seu primeiro cliente para começar a usar o sistema
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="client.name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Empresa</FormLabel>
                  <FormControl>
                    <Input placeholder="Empresa ABC Ltda" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="client.cnpj"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CNPJ da Empresa</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        placeholder="00.000.000/0000-00" 
                        {...field}
                        onChange={handleCNPJChange('client')}
                        onBlur={handleCNPJBlur('client')}
                        disabled={isLoadingCNPJ}
                      />
                      {isLoadingCNPJ && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>
                    Os dados serão preenchidos automaticamente
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="client.email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="contato@empresa.com.br" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="client.phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="(00) 00000-0000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="client.regime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Regime Tributário</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o regime tributário" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="lucro_presumido">Lucro Presumido</SelectItem>
                    <SelectItem value="simples_nacional">Simples Nacional</SelectItem>
                    <SelectItem value="lucro_real">Lucro Real</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  O regime tributário determinará os cálculos automáticos aplicados.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Limpar
          </Button>
          <Button type="submit" disabled={isSubmitting || isLoadingCNPJ}>
            {isSubmitting ? "Salvando..." : isLoadingCNPJ ? "Carregando..." : "Continuar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}