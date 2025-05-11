
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "@/components/ui/use-toast";
import { Calendar, Landmark, AlertCircle } from "lucide-react";

const formSchema = z.object({
  banco: z.string().min(1, "Selecione um banco"),
  tipoPagamento: z.string().min(1, "Selecione o tipo de pagamento"),
  valor: z.string().min(1, "Informe o valor"),
  data: z.string().min(1, "Selecione a data"),
  codigoBarras: z.string().optional(),
  descricao: z.string().optional(),
});

interface AgendamentoPagamentoProps {
  guiaId?: string;
  valorPadrao?: string;
  dataVencimento?: string;
  codigoBarras?: string;
  descricao?: string;
  onSchedule: (data: any) => void;
}

export function AgendamentoPagamento({
  guiaId,
  valorPadrao,
  dataVencimento,
  codigoBarras,
  descricao,
  onSchedule
}: AgendamentoPagamentoProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [contasDisponiveis, setContasDisponiveis] = React.useState<boolean>(false);
  
  // Formatar data no formato YYYY-MM-DD para o input do tipo date
  const formatarDataVencimento = () => {
    if (!dataVencimento) return "";
    
    const parts = dataVencimento.split('/');
    if (parts.length === 3) {
      const [dia, mes, ano] = parts;
      return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
    }
    
    return dataVencimento;
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      banco: "",
      tipoPagamento: "",
      valor: valorPadrao || "",
      data: formatarDataVencimento(),
      codigoBarras: codigoBarras || "",
      descricao: descricao || "",
    },
  });
  
  React.useEffect(() => {
    // Simulação da verificação de contas disponíveis após 1 segundo
    const timer = setTimeout(() => {
      setContasDisponiveis(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      // Simulação de agendamento
      await new Promise(resolve => setTimeout(resolve, 1500));
      onSchedule({...data, guiaId});
      toast({
        title: "Pagamento agendado",
        description: "O pagamento foi agendado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro no agendamento",
        description: "Não foi possível agendar o pagamento.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!contasDisponiveis) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Agendamento de Pagamento</CardTitle>
          <CardDescription>
            Verificando contas bancárias conectadas...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-6">
          <div className="flex flex-col items-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="mt-2 text-sm text-muted-foreground">
              Conectando ao Open Banking...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <CardTitle>Agendamento de Pagamento</CardTitle>
        </div>
        <CardDescription>
          Agende o pagamento da guia via Open Banking
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-6">
          <Landmark className="h-4 w-4" />
          <AlertTitle>Open Banking</AlertTitle>
          <AlertDescription>
            Agende pagamentos diretamente pelo seu banco, com total segurança e sem precisar fazer login no portal bancário.
          </AlertDescription>
        </Alert>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="banco"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Banco</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o banco" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="itau">Itaú</SelectItem>
                      <SelectItem value="bradesco">Bradesco</SelectItem>
                      <SelectItem value="bb">Banco do Brasil</SelectItem>
                      <SelectItem value="santander">Santander</SelectItem>
                      <SelectItem value="caixa">Caixa Econômica Federal</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Selecione o banco para realizar o pagamento
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tipoPagamento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Pagamento</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de pagamento" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pix">PIX</SelectItem>
                      <SelectItem value="boleto">Boleto</SelectItem>
                      <SelectItem value="ted">TED</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Escolha a forma de pagamento
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="valor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor (R$)</FormLabel>
                    <FormControl>
                      <Input placeholder="0,00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="data"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Pagamento</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="codigoBarras"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código de Barras</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o código de barras" {...field} />
                  </FormControl>
                  <FormDescription>
                    Para pagamentos via boleto
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input placeholder="Descrição do pagamento" {...field} />
                  </FormControl>
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
          {isSubmitting ? "Agendando..." : "Agendar Pagamento"}
        </Button>
      </CardFooter>
    </Card>
  );
}
