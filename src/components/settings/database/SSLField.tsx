
import React from "react";
import { FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useFormContext } from "react-hook-form";
import { DatabaseFormValues } from "./types";

export function SSLField() {
  const form = useFormContext<DatabaseFormValues>();
  
  return (
    <FormField
      control={form.control}
      name="ssl"
      render={({ field }) => (
        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
          <FormControl>
            <input
              type="checkbox"
              checked={field.value}
              onChange={field.onChange}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            <FormLabel>Usar SSL</FormLabel>
            <FormDescription>
              Habilite para usar conexão segura com o banco de dados.
            </FormDescription>
          </div>
        </FormItem>
      )}
    />
  );
}
