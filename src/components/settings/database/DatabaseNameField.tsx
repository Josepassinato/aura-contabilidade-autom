
import React from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useFormContext } from "react-hook-form";
import { DatabaseFormValues } from "./types";

export function DatabaseNameField() {
  const form = useFormContext<DatabaseFormValues>();
  
  return (
    <FormField
      control={form.control}
      name="database"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Nome do Banco de Dados</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
