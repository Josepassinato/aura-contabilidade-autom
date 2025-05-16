
import React, { useState } from "react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { ResultadoReconciliacao } from "@/services/fiscal/reconciliacao/reconciliacaoBancaria";
import { 
  resolverDiscrepanciasAutomaticamente, 
  ConfiguracaoResolucao, 
  configPadraoResolucao,
  ResultadoResolucaoAutonoma
} from "@/services/fiscal/reconciliacao/resolucaoAutonoma";
import { ResolucaoAutonomaAprendizagem } from "./ResolucaoAutonomaAprendizagem";
import { registrarDecisaoHumana } from "@/services/fiscal/reconciliacao/aprendizadoMaquina";
import { TabResolucaoAutonoma } from "./resolucao/TabResolucaoAutonoma";

interface ResolucaoAutonomaProps {
  resultadoReconciliacao: ResultadoReconciliacao | null;
  onResultadoResolvido?: (resultado: ResultadoReconciliacao) => void;
  isLoading?: boolean;
}

export function ResolucaoAutonoma({ 
  resultadoReconciliacao,
  onResultadoResolvido,
  isLoading = false
}: ResolucaoAutonomaProps) {
  const [configuracao, setConfiguracao] = useState<ConfiguracaoResolucao>({...configPadraoResolucao});
  const [mostrarConfig, setMostrarConfig] = useState(false);
  const [processando, setProcessando] = useState(false);
  const [resultado, setResultado] = useState<ResultadoResolucaoAutonoma | null>(null);
  const [activeTab, setActiveTab] = useState("resolucao");
  
  const totalPendentes = resultadoReconciliacao ? (
    resultadoReconciliacao.transacoesNaoConciliadas.length + 
    resultadoReconciliacao.lancamentosNaoConciliados.length
  ) : 0;
  
  const handleResolverAutomaticamente = async () => {
    if (!resultadoReconciliacao) {
      toast({
        title: "Erro",
        description: "É necessário realizar a reconciliação antes de resolver discrepâncias.",
        variant: "destructive"
      });
      return;
    }
    
    setProcessando(true);
    
    try {
      const resultadoResolucao = await resolverDiscrepanciasAutomaticamente(
        resultadoReconciliacao,
        configuracao
      );
      
      setResultado(resultadoResolucao);
      
      if (onResultadoResolvido) {
        onResultadoResolvido(resultadoResolucao.reconciliacaoAtualizada);
      }
      
      // Registrar a ação automática para o sistema de aprendizagem
      registrarDecisaoHumana({
        tipoDecisao: 'conciliar',
        decididoPor: 'sistema_automatico'
      });
      
      // Calcular o total de resoluções para exibir na notificação
      const totalResolucoes = resultadoResolucao.duplicacoesResolvidas + 
        resultadoResolucao.divergenciasCorrigidas +
        resultadoResolucao.lancamentosCriados.length +
        resultadoResolucao.transacoesIgnoradas.length +
        resultadoResolucao.padroesAplicados;
      
      toast({
        title: "Resolução automática concluída",
        description: `${totalResolucoes} discrepâncias resolvidas com sucesso.`
      });
    } catch (error) {
      console.error("Erro na resolução automática:", error);
      toast({
        title: "Erro na resolução automática",
        description: "Ocorreu um erro ao tentar resolver as discrepâncias automaticamente.",
        variant: "destructive"
      });
    } finally {
      setProcessando(false);
    }
  };
  
  // Função para atualizar a configuração a partir das recomendações do ML
  const handleConfigChange = (novaConfig: ConfiguracaoResolucao) => {
    setConfiguracao(novaConfig);
  };
  
  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-amber-500" />
              Resolução Autônoma
            </CardTitle>
            <CardDescription>
              Resolução inteligente de discrepâncias com IA e regras avançadas
            </CardDescription>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
            <TabsList>
              <TabsTrigger value="resolucao">Resolução</TabsTrigger>
              <TabsTrigger value="aprendizado">Aprendizado</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {activeTab === "resolucao" && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setMostrarConfig(!mostrarConfig)}
              className="ml-2"
            >
              <Settings className="h-4 w-4 mr-1" />
              Configurações
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <TabsContent value="resolucao" className="mt-0">
          <TabResolucaoAutonoma
            mostrarConfig={mostrarConfig}
            setMostrarConfig={setMostrarConfig}
            configuracao={configuracao}
            setConfiguracao={setConfiguracao}
            configPadraoResolucao={configPadraoResolucao}
            resultadoReconciliacao={resultadoReconciliacao}
            totalPendentes={totalPendentes}
            processando={processando}
            isLoading={isLoading}
            resultado={resultado}
            onResolverAutomaticamente={handleResolverAutomaticamente}
          />
        </TabsContent>
        
        <TabsContent value="aprendizado" className="mt-0">
          <ResolucaoAutonomaAprendizagem 
            configuracaoAtual={configuracao}
            onConfigChange={handleConfigChange}
          />
        </TabsContent>
      </CardContent>
    </Card>
  );
}
