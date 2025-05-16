
import React from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertCircle, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Check, Wand2 } from "lucide-react";
import { ResultadoResolucao } from "./ResultadoResolucao";
import { ResultadoReconciliacao } from "@/services/fiscal/reconciliacao/reconciliacaoBancaria";
import { ResultadoResolucaoAutonoma } from "@/services/fiscal/reconciliacao/resolucaoAutonoma";

interface ConteudoResolucaoProps {
  resultadoReconciliacao: ResultadoReconciliacao | null;
  totalPendentes: number;
  resultado: ResultadoResolucaoAutonoma | null;
  processando: boolean;
  isLoading: boolean;
  onResolverAutomaticamente: () => void;
}

export function ConteudoResolucao({
  resultadoReconciliacao,
  totalPendentes,
  resultado,
  processando,
  isLoading,
  onResolverAutomaticamente
}: ConteudoResolucaoProps) {
  if (!resultadoReconciliacao) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Reconciliação necessária</AlertTitle>
        <AlertDescription>
          Realize a reconciliação bancária primeiro para habilitar a resolução autônoma.
        </AlertDescription>
      </Alert>
    );
  }
  
  if (totalPendentes === 0) {
    return (
      <Alert variant="default" className="bg-green-50 border-green-200">
        <Check className="h-4 w-4 text-green-600" />
        <AlertTitle>Tudo conciliado</AlertTitle>
        <AlertDescription>
          Todas as transações foram reconciliadas com sucesso.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">Itens pendentes de reconciliação</h3>
          <p className="text-sm text-muted-foreground">
            {resultadoReconciliacao.transacoesNaoConciliadas.length} transações e{' '}
            {resultadoReconciliacao.lancamentosNaoConciliados.length} lançamentos não reconciliados
          </p>
        </div>
        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">
          {totalPendentes} pendentes
        </Badge>
      </div>

      <Button
        className="w-full"
        onClick={onResolverAutomaticamente}
        disabled={isLoading || processando || totalPendentes === 0}
      >
        <Wand2 className="mr-2 h-4 w-4" />
        {processando ? "Processando..." : "Resolver Automaticamente"}
      </Button>
      
      <ResultadoResolucao resultado={resultado} />
    </>
  );
}
