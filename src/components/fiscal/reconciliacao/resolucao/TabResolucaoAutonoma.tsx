
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { ConfiguracaoResolucao } from "./ConfiguracaoResolucao";
import { ConteudoResolucao } from "./ConteudoResolucao";
import { 
  ConfiguracaoResolucao as ConfigResolucao,
  ResultadoResolucaoAutonoma 
} from "@/services/fiscal/reconciliacao/resolucaoAutonoma";
import { ResultadoReconciliacao } from "@/services/fiscal/reconciliacao/reconciliacaoBancaria";

interface TabResolucaoAutonomaProps {
  mostrarConfig: boolean;
  setMostrarConfig: (mostrar: boolean) => void;
  configuracao: ConfigResolucao;
  setConfiguracao: React.Dispatch<React.SetStateAction<ConfigResolucao>>;
  configPadraoResolucao: ConfigResolucao;
  resultadoReconciliacao: ResultadoReconciliacao | null;
  totalPendentes: number;
  processando: boolean;
  isLoading: boolean;
  resultado: ResultadoResolucaoAutonoma | null;
  onResolverAutomaticamente: () => void;
}

export function TabResolucaoAutonoma({
  mostrarConfig,
  setMostrarConfig,
  configuracao,
  setConfiguracao,
  configPadraoResolucao,
  resultadoReconciliacao,
  totalPendentes,
  processando,
  isLoading,
  resultado,
  onResolverAutomaticamente
}: TabResolucaoAutonomaProps) {
  return (
    <div className="space-y-4">
      {mostrarConfig ? (
        <ConfiguracaoResolucao
          configuracao={configuracao}
          setConfiguracao={setConfiguracao}
          configPadraoResolucao={configPadraoResolucao}
          onClose={() => setMostrarConfig(false)}
        />
      ) : (
        <ConteudoResolucao
          resultadoReconciliacao={resultadoReconciliacao}
          totalPendentes={totalPendentes}
          resultado={resultado}
          processando={processando}
          isLoading={isLoading}
          onResolverAutomaticamente={onResolverAutomaticamente}
        />
      )}
    </div>
  );
}
