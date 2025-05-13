
import React from 'react';
import { FormControl, FormDescription, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Lock } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { EstadualFormValues } from "./estadualFormSchema";

interface CredenciaisFieldsProps {
  form: UseFormReturn<EstadualFormValues>;
  uf: string;
}

export function CredenciaisFields({ form, uf }: CredenciaisFieldsProps) {
  return (
    <>
      <FormItem>
        <FormLabel>Usuário SEFAZ-{uf}</FormLabel>
        <FormControl>
          <Input 
            placeholder={`Digite o usuário do portal SEFAZ-${uf}`} 
            {...form.register("usuario")} 
          />
        </FormControl>
        <FormDescription>
          Usuário cadastrado no portal da SEFAZ-{uf}
        </FormDescription>
        <FormMessage />
      </FormItem>

      <FormItem>
        <FormLabel>Senha</FormLabel>
        <FormControl>
          <div className="relative">
            <Input 
              type="password" 
              placeholder={`Digite a senha do portal SEFAZ-${uf}`} 
              {...form.register("senha")} 
            />
            <Lock className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
          </div>
        </FormControl>
        <FormDescription>
          A senha ficará armazenada de forma segura
        </FormDescription>
        <FormMessage />
      </FormItem>
    </>
  );
}
