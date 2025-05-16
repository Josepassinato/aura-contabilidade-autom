
import React from "react";
import { CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings2 } from "lucide-react";

interface AuditoriaHeaderProps {
  ativa: boolean;
}

export function AuditoriaHeader({ ativa }: AuditoriaHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <Settings2 className="h-5 w-5 text-primary" />
        <div>
          <CardTitle>Configuração de Auditoria Contínua</CardTitle>
          <CardDescription>
            Configure o sistema de auditoria contínua com IA para seus lançamentos
          </CardDescription>
        </div>
      </div>
      
      <Badge 
        variant={ativa ? "default" : "outline"}
        className={ativa ? "bg-green-500 hover:bg-green-600" : ""}
      >
        {ativa ? "Ativo" : "Inativo"}
      </Badge>
    </div>
  );
}
