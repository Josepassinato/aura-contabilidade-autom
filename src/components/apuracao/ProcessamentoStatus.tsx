
import React from "react";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface ProcessamentoStatusProps {
  progress: number;
  clientesProcessados: number;
  totalClientes: number;
}

export function ProcessamentoStatus({ 
  progress, 
  clientesProcessados, 
  totalClientes 
}: ProcessamentoStatusProps) {
  return (
    <Card className="p-4 border border-primary/20 bg-primary/5">
      <div className="flex items-center justify-center mb-4">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
      
      <div className="text-center mb-4">
        <h3 className="font-semibold text-lg">Processamento em andamento</h3>
        <p className="text-muted-foreground">
          Processando dados contábeis e fiscais de seus clientes
        </p>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Progresso</span>
          <span className="text-sm text-muted-foreground">
            {clientesProcessados} de {totalClientes} empresas
          </span>
        </div>
        <Progress value={progress} className="h-2" />
        <p className="text-xs text-center text-muted-foreground mt-2">
          O processamento pode levar alguns minutos dependendo do número de empresas e documentos.
        </p>
      </div>
    </Card>
  );
}
