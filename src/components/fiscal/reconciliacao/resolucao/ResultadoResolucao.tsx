
import React from "react";
import { Badge } from "@/components/ui/badge";
import { ResultadoResolucaoAutonoma } from "@/services/fiscal/reconciliacao/resolucaoAutonoma";

interface ResultadoResolucaoProps {
  resultado: ResultadoResolucaoAutonoma | null;
}

export function ResultadoResolucao({ resultado }: ResultadoResolucaoProps) {
  if (!resultado) return null;

  return (
    <div className="mt-4 space-y-2 bg-muted/50 p-3 rounded-md">
      <h4 className="font-medium text-sm">Resultados da resolução</h4>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white p-2 rounded border">
          <div className="text-xs text-muted-foreground">Duplicações resolvidas</div>
          <div className="text-lg font-medium">{resultado.duplicacoesResolvidas}</div>
        </div>
        <div className="bg-white p-2 rounded border">
          <div className="text-xs text-muted-foreground">Divergências corrigidas</div>
          <div className="text-lg font-medium">{resultado.divergenciasCorrigidas}</div>
        </div>
        <div className="bg-white p-2 rounded border">
          <div className="text-xs text-muted-foreground">Lançamentos criados</div>
          <div className="text-lg font-medium">{resultado.lancamentosCriados.length}</div>
        </div>
        <div className="bg-white p-2 rounded border">
          <div className="text-xs text-muted-foreground">Transações ignoradas</div>
          <div className="text-lg font-medium">{resultado.transacoesIgnoradas.length}</div>
        </div>
      </div>
    </div>
  );
}
