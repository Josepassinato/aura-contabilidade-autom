
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CustomerSummary, sendBulkEmail } from "@/services/supabase/customerManagementService";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface BulkEmailFormProps {
  selectedCustomerIds: string[];
  customers: CustomerSummary[];
  onSuccess: () => void;
  onCancel: () => void;
}

const formSchema = z.object({
  subject: z.string().min(3, "O assunto deve ter pelo menos 3 caracteres"),
  message: z.string().min(10, "A mensagem deve ter pelo menos 10 caracteres"),
});

type FormValues = z.infer<typeof formSchema>;

export function BulkEmailForm({
  selectedCustomerIds,
  customers,
  onSuccess,
  onCancel,
}: BulkEmailFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: "",
      message: "",
    },
  });
  
  const selectedCustomers = customers.filter(c => 
    selectedCustomerIds.includes(c.id)
  );
  
  const onSubmit = async (values: FormValues) => {
    const success = await sendBulkEmail(
      selectedCustomerIds, 
      values.subject, 
      values.message
    );
    
    if (success) {
      onSuccess();
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="mb-4">
          <h3 className="text-sm font-medium">Enviando para {selectedCustomerIds.length} cliente(s):</h3>
          <div className="text-sm text-muted-foreground mt-1 max-h-20 overflow-y-auto">
            {selectedCustomers.map(customer => (
              <div key={customer.id}>{customer.name}</div>
            ))}
          </div>
        </div>
        
        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assunto</FormLabel>
              <FormControl>
                <Input placeholder="Informe o assunto do email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mensagem</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Digite sua mensagem aqui..."
                  rows={6}
                  {...field} 
                />
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
            Enviar Email
          </Button>
        </div>
      </form>
    </Form>
  );
}
