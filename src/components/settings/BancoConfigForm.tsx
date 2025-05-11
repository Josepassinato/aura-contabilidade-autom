
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { salvarConfiguracaoBancaria, ConexaoBancaria } from "@/services/bancario/automacaoBancaria";

const bancosBrasileiros = [
  "Banco do Brasil",
  "Caixa Econômica Federal",
  "Bradesco",
  "Itaú",
  "Santander",
  "Nubank",
  "Inter",
  "BTG Pactual",
  "Sicredi",
  "Sicoob"
];

const formSchema = z.object({
  banco: z.string().min(1, { message: "Selecione um banco" }),
  chaveAPI: z.string().min(1, { message: "A chave API é obrigatória" }),
  certificado: z.string().optional(),
  contaCorrente: z.string().optional(),
  agencia: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function BancoConfigForm() {
  // Get stored values from localStorage if they exist
  const storedValues = typeof window !== "undefined" 
    ? {
        banco: localStorage.getItem("banco-selecionado") || "",
        chaveAPI: localStorage.getItem(`banco-${localStorage.getItem("banco-selecionado") || ""}-chave`) || "",
        certificado: localStorage.getItem(`banco-${localStorage.getItem("banco-selecionado") || ""}-certificado`) || "",
        contaCorrente: localStorage.getItem(`banco-${localStorage.getItem("banco-selecionado") || ""}-conta`) || "",
        agencia: localStorage.getItem(`banco-${localStorage.getItem("banco-selecionado") || ""}-agencia`) || "",
      }
    : {
        banco: "",
        chaveAPI: "",
        certificado: "",
        contaCorrente: "",
        agencia: ""
      };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: storedValues,
  });

  const handleBancoChange = (value: string) => {
    form.setValue("banco", value);
    localStorage.setItem("banco-selecionado", value);
    
    // Atualiza os demais campos com base no banco selecionado
    form.setValue("chaveAPI", localStorage.getItem(`banco-${value}-chave`) || "");
    form.setValue("certificado", localStorage.getItem(`banco-${value}-certificado`) || "");
    form.setValue("contaCorrente", localStorage.getItem(`banco-${value}-conta`) || "");
    form.setValue("agencia", localStorage.getItem(`banco-${value}-agencia`) || "");
  };

  function onSubmit(data: FormValues) {
    try {
      // Salvar banco selecionado
      localStorage.setItem("banco-selecionado", data.banco);
      
      // Salvar configuração bancária
      const config: ConexaoBancaria = {
        banco: data.banco,
        chaveAPI: data.chaveAPI,
        certificado: data.certificado,
        contaCorrente: data.contaCorrente,
        agencia: data.agencia
      };
      
      salvarConfiguracaoBancaria(config);
      
    } catch (error) {
      toast({
        title: "Erro ao salvar configurações",
        description: "Ocorreu um erro ao salvar as configurações bancárias.",
        variant: "destructive",
      });
      console.error("Erro ao salvar configurações:", error);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Integração Bancária</h2>
        <p className="text-sm text-muted-foreground">
          Configure as credenciais para acesso às APIs bancárias para automação de pagamentos.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-4 border rounded-md p-4">
            <FormField
              control={form.control}
              name="banco"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Banco</FormLabel>
                  <Select 
                    onValueChange={(value) => handleBancoChange(value)} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um banco" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {bancosBrasileiros.map((banco) => (
                        <SelectItem key={banco} value={banco}>
                          {banco}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Selecione o banco que deseja configurar.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="chaveAPI"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chave API do Open Banking</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormDescription>
                    Chave para acesso à API do Open Banking do banco.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="certificado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Certificado Digital (Base64)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Cole aqui o conteúdo do certificado digital em formato Base64" 
                      className="h-20"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Certificado digital para autenticação em serviços bancários.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="agencia"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agência</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contaCorrente"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conta Corrente</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Button type="submit">Salvar Configurações</Button>
        </form>
      </Form>
    </div>
  );
}
