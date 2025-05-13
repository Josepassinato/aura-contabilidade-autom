
import React from "react";
import { Form } from "@/components/ui/form";
import { useDatabaseForm } from "./useDatabaseForm";
import { DatabaseTypeField } from "./DatabaseTypeField";
import { ConnectionFields } from "./ConnectionFields";
import { DatabaseNameField } from "./DatabaseNameField";
import { CredentialsFields } from "./CredentialsFields";
import { SSLField } from "./SSLField";
import { FormActions } from "./FormActions";

export function DatabaseConfigForm() {
  const { form, onSubmit } = useDatabaseForm();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Configuração de Banco de Dados</h2>
        <p className="text-sm text-muted-foreground">
          Configure os parâmetros de conexão com o banco de dados utilizado pelo sistema contábil.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <DatabaseTypeField />
          <ConnectionFields />
          <DatabaseNameField />
          <CredentialsFields />
          <SSLField />
          <FormActions />
        </form>
      </Form>
    </div>
  );
}
