
import React from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFormContext } from "react-hook-form";
import { DatabaseFormValues } from "./types";

export function DatabaseTypeField() {
  const form = useFormContext<DatabaseFormValues>();
  
  return (
    <FormField
      control={form.control}
      name="dbType"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Tipo de Banco de Dados</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um tipo de banco de dados" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="postgres">PostgreSQL</SelectItem>
              <SelectItem value="mysql">MySQL</SelectItem>
              <SelectItem value="mssql">SQL Server</SelectItem>
              <SelectItem value="oracle">Oracle</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
