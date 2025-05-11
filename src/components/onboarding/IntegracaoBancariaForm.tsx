
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

const bancariaFormSchema = z.object({
  bancoNome: z.string().min(1, 'Nome do banco é obrigatório'),
  bancoAgencia: z.string().min(1, 'Agência é obrigatória'),
  bancoConta: z.string().min(1, 'Conta é obrigatória'),
  tipoConta: z.enum(['corrente', 'poupanca']),
  chavePixTipo: z.enum(['cpf', 'cnpj', 'email', 'telefone', 'aleatoria']),
  chavePixValor: z.string().min(1, 'Chave PIX é obrigatória'),
  autorizaDebito: z.boolean().default(false),
  autorizaPagamentos: z.boolean().default(false),
  autorizaExtratos: z.boolean().default(false),
  tokenAcesso: z.string().optional(),
});

type BancariaFormValues = z.infer<typeof bancariaFormSchema>;

interface IntegracaoBancariaFormProps {
  onSubmit: (data: BancariaFormValues) => void;
}

export function IntegracaoBancariaForm({ onSubmit }: IntegracaoBancariaFormProps) {
  const form = useForm<BancariaFormValues>({
    resolver: zodResolver(bancariaFormSchema),
    defaultValues: {
      bancoNome: '',
      bancoAgencia: '',
      bancoConta: '',
      tipoConta: 'corrente',
      chavePixTipo: 'cpf',
      chavePixValor: '',
      autorizaDebito: false,
      autorizaPagamentos: false,
      autorizaExtratos: false,
      tokenAcesso: '',
    },
  });

  const autorizaExtratos = form.watch('autorizaExtratos');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <h3 className="text-lg font-medium mb-4">Integração Bancária</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="bancoNome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Banco</FormLabel>
                <FormControl>
                  <Input placeholder="Nome do banco" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tipoConta"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Conta</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de conta" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="corrente">Conta Corrente</SelectItem>
                    <SelectItem value="poupanca">Conta Poupança</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="bancoAgencia"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Agência</FormLabel>
                <FormControl>
                  <Input placeholder="Número da agência" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bancoConta"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Conta</FormLabel>
                <FormControl>
                  <Input placeholder="Número da conta" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <h3 className="text-lg font-medium pt-4 mb-4">Integração PIX</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="chavePixTipo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Chave PIX</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de chave" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="cpf">CPF</SelectItem>
                    <SelectItem value="cnpj">CNPJ</SelectItem>
                    <SelectItem value="email">E-mail</SelectItem>
                    <SelectItem value="telefone">Telefone</SelectItem>
                    <SelectItem value="aleatoria">Chave Aleatória</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="chavePixValor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Chave PIX</FormLabel>
                <FormControl>
                  <Input placeholder="Informe sua chave PIX" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <h3 className="text-lg font-medium pt-4 mb-4">Autorizações Open Banking</h3>

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="autorizaExtratos"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel>Autorizo acesso aos extratos bancários</FormLabel>
                  <FormDescription>
                    Permite importação automática de extratos para conciliação bancária
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="autorizaPagamentos"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel>Autorizo pagamentos automáticos</FormLabel>
                  <FormDescription>
                    Permite agendamento e pagamento automático de guias fiscais
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="autorizaDebito"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel>Autorizo débito automático da mensalidade</FormLabel>
                  <FormDescription>
                    Permite débito automático da mensalidade do Contaflix
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {autorizaExtratos && (
          <FormField
            control={form.control}
            name="tokenAcesso"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Token de Acesso Open Banking</FormLabel>
                <FormControl>
                  <Input placeholder="Token fornecido pelo banco" {...field} />
                </FormControl>
                <FormDescription>
                  Token fornecido pelo seu banco para integração via API Open Banking
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="pt-6 text-right">
          <Button type="submit">Continuar</Button>
        </div>
      </form>
    </Form>
  );
}
