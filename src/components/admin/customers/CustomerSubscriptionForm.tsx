
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CustomerSummary, updateCustomerSubscription } from "@/services/supabase/customerManagementService";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
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

interface CustomerSubscriptionFormProps {
  customer: CustomerSummary;
  onSuccess: () => void;
  onCancel: () => void;
}

const formSchema = z.object({
  status: z.string(),
  plan_type: z.string(),
  monthly_fee: z.coerce.number().min(0, "O valor não pode ser negativo"),
  end_date: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function CustomerSubscriptionForm({
  customer,
  onSuccess,
  onCancel,
}: CustomerSubscriptionFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: customer.subscriptionStatus === 'none' ? 'active' : customer.subscriptionStatus,
      plan_type: customer.subscriptionPlan === 'none' ? 'basic' : customer.subscriptionPlan,
      monthly_fee: customer.monthlyFee,
      end_date: customer.subscriptionEndDate || '',
    },
  });
  
  const onSubmit = async (values: FormValues) => {
    const success = await updateCustomerSubscription(customer.id, {
      status: values.status,
      plan_type: values.plan_type,
      monthly_fee: values.monthly_fee,
      end_date: values.end_date || null,
    });
    
    if (success) {
      onSuccess();
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="mb-4">
          <h3 className="text-sm font-medium">Cliente: {customer.name}</h3>
          <p className="text-sm text-muted-foreground">{customer.email}</p>
        </div>
        
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status da Assinatura</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="active">Ativa</SelectItem>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="overdue">Atrasada</SelectItem>
                  <SelectItem value="canceled">Cancelada</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="plan_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Plano</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o plano" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="basic">Básico</SelectItem>
                  <SelectItem value="standard">Padrão</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="enterprise">Empresarial</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="monthly_fee"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mensalidade (R$)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="end_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data de Término (opcional)</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            Salvar Alterações
          </Button>
        </div>
      </form>
    </Form>
  );
}
