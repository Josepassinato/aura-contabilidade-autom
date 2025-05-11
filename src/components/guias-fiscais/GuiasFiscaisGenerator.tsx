
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { TaxGuide, TaxGuideType, TaxGuideStatus } from "@/types/taxGuides";
import { toast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  clientId: z.string().min(1, { message: "Selecione um cliente" }),
  clientName: z.string().min(1, { message: "Nome do cliente é obrigatório" }),
  type: z.string().min(1, { message: "Tipo de guia é obrigatório" }),
  reference: z.string().min(1, { message: "Referência é obrigatória" }),
  dueDate: z.string().min(1, { message: "Data de vencimento é obrigatória" }),
  amount: z.coerce.number().positive({ message: "Valor deve ser maior que zero" }),
  barCode: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface GuiasFiscaisGeneratorProps {
  onGenerateGuia: (guia: TaxGuide) => void;
}

export function GuiasFiscaisGenerator({ onGenerateGuia }: GuiasFiscaisGeneratorProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientId: "",
      clientName: "",
      type: "",
      reference: "",
      dueDate: new Date().toISOString().split('T')[0],
      amount: 0,
      barCode: "",
    },
  });

  function onSubmit(data: FormValues) {
    const newGuia: TaxGuide = {
      ...data,
      id: "", // This will be set by the parent component
      type: data.type as TaxGuideType,
      status: "pendente" as TaxGuideStatus,
      generatedAt: new Date().toISOString().split('T')[0],
    };

    onGenerateGuia(newGuia);
    
    toast({
      title: "Guia gerada com sucesso",
      description: `Guia de ${data.type} para ${data.reference} gerada.`,
    });
    
    form.reset();
  }

  const generateRandomBarCode = () => {
    const part1 = Math.floor(Math.random() * 99000000) + 1000000;
    const part2 = Math.floor(Math.random() * 99000000) + 1000000;
    const part3 = Math.floor(Math.random() * 99000000) + 1000000;
    const part4 = Math.floor(Math.random() * 99000000) + 1000000;
    
    return `${part1}-${part2} ${part3}-${part4}`;
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="clientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ID do Cliente</FormLabel>
                <FormControl>
                  <Input placeholder="ID do cliente" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="clientName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Cliente</FormLabel>
                <FormControl>
                  <Input placeholder="Nome da empresa/cliente" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Guia</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="DARF">DARF</SelectItem>
                    <SelectItem value="GPS">GPS</SelectItem>
                    <SelectItem value="DAS">DAS</SelectItem>
                    <SelectItem value="ISS">ISS</SelectItem>
                    <SelectItem value="ICMS">ICMS</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="reference"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Referência</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: IRPJ, INSS, etc" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Vencimento</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor (R$)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="barCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Código de Barras</FormLabel>
              <FormControl>
                <div className="flex gap-2">
                  <Textarea 
                    placeholder="Código de barras da guia" 
                    className="flex-1"
                    {...field} 
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => form.setValue("barCode", generateRandomBarCode())}
                  >
                    Gerar
                  </Button>
                </div>
              </FormControl>
              <FormDescription>
                Insira manualmente ou clique em "Gerar" para criar um código de barras de exemplo.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full md:w-auto">Gerar Guia Fiscal</Button>
      </form>
    </Form>
  );
}
