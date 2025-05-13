
import React from 'react';
import { FormControl, FormDescription, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { EstadualFormValues } from "./estadualFormSchema";

interface CodigoAcessoFieldProps {
  form: UseFormReturn<EstadualFormValues>;
}

export function CodigoAcessoField({ form }: CodigoAcessoFieldProps) {
  return (
    <FormItem>
      <FormLabel>Código de Acesso (opcional)</FormLabel>
      <FormControl>
        <Input 
          placeholder="Digite o código de acesso (opcional)" 
          {...form.register("codigoAcesso")} 
        />
      </FormControl>
      <FormDescription>
        Código de acesso alternativo para integrações via API
      </FormDescription>
      <FormMessage />
    </FormItem>
  );
}
