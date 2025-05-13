
import React from 'react';
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { KeyRound } from "lucide-react";

interface EstadualFormHeaderProps {
  uf: string;
  clientName?: string;
}

export function EstadualFormHeader({ uf, clientName }: EstadualFormHeaderProps) {
  return (
    <CardHeader>
      <div className="flex items-center gap-2">
        <KeyRound className="h-5 w-5 text-primary" />
        <CardTitle>Integração com SEFAZ-{uf}</CardTitle>
      </div>
      <CardDescription>
        Configure o acesso à Secretaria da Fazenda {uf}{clientName ? ` para ${clientName}` : ""}
      </CardDescription>
    </CardHeader>
  );
}
