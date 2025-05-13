
import React from 'react';
import { Building2 } from "lucide-react";

export const EmptyClientState = () => {
  return (
    <div className="p-8 text-center border rounded-lg">
      <Building2 className="mx-auto h-12 w-12 text-muted-foreground/50" />
      <h3 className="mt-4 text-lg font-medium">Selecione um cliente</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Escolha um cliente para configurar suas integrações
      </p>
    </div>
  );
};
