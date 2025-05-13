
import React from 'react';
import { FormControl, FormDescription, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { EstadualFormValues } from "./estadualFormSchema";

interface CertificadoUploaderProps {
  form: UseFormReturn<EstadualFormValues>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function CertificadoUploader({ form, onFileChange }: CertificadoUploaderProps) {
  return (
    <FormItem>
      <FormLabel>Certificado Digital (opcional)</FormLabel>
      <div className="flex items-center gap-2">
        <Input
          type="text"
          placeholder="Nenhum arquivo selecionado"
          readOnly
          value={form.getValues("certificadoDigital") || ""}
          className="flex-1"
        />
        <div className="relative">
          <Button type="button" variant="outline">
            <ShieldCheck className="h-4 w-4 mr-2" />
            Selecionar
          </Button>
          <Input
            type="file"
            accept=".pfx,.p12"
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={onFileChange}
          />
        </div>
      </div>
      <FormDescription>
        Selecione o arquivo de certificado digital (.pfx ou .p12)
      </FormDescription>
      <FormMessage />
    </FormItem>
  );
}
