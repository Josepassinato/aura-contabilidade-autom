
import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Brain, Lightbulb, TrendingUp, BarChart, RefreshCcw } from "lucide-react";
import { toast } from "@/hooks/use-toast";

import {
  obterEstadoAprendizagem,
  treinarModeloComDecisoes,
  gerarInsightsAprendizagem,
  gerarConfiguracaoRecomendada,
  resetarAprendizagem,
  InsightAprendizagem
} from "@/services/fiscal/reconciliacao/aprendizadoMaquina";
import { ConfiguracaoResolucao } from "@/services/fiscal/reconciliacao/resolucaoAutonoma";

interface ResolucaoAutonomaAprendizagemProps {
  configuracaoAtual: ConfiguracaoResolucao;
  onConfigChange?: (novaConfig: ConfiguracaoResolucao) => void;
}

export function ResolucaoAutonomaAprendizagem({
  configuracaoAtual,
  onConfigChange
}: ResolucaoAutonomaAprendizagemProps) {
  const [estadoAprendizagem, setEstadoAprendizagem] = useState({
    treinado: false,
    decisoes: 0,
    versao: 0,
    ultimoTreinamento: null as string | null,
    precisao: 0
  });
  const [insights, setInsights] = useState<InsightAprendizagem[]>([]);
  const [configuracaoRecomendada, setConfiguracaoRecomendada] = useState<ConfiguracaoResolucao | null>(null);
  const [treinando, setTreinando] = useState(false);
  const [visualizarRecomendacoes, setVisualizarRecomendacoes] = useState(false);

  // Carregar estado inicial
  useEffect(() => {
    atualizarEstadoAprendizagem();
  }, []);

  // Atualizar estado de aprendizagem
  const atualizarEstadoAprendizagem = () => {
    const estado = obterEstadoAprendizagem();
    setEstadoAprendizagem(estado);

    // Se o modelo estiver treinado, obter insights
    if (estado.treinado) {
      const insightsGerados = gerarInsightsAprendizagem();
      setInsights(insightsGerados);

      // Gerar configuração recomendada
      const configRecomendada = gerarConfiguracaoRecomendada(configuracaoAtual);
      setConfiguracaoRecomendada(configRecomendada);
    }
  };

  // Função para treinar o modelo
  const treinarModelo = async () => {
    setTreinando(true);
    
    try {
      const sucesso = await treinarModeloComDecisoes();
      
      if (sucesso) {
        toast({
          title: "Modelo treinado com sucesso",
          description: "O modelo de aprendizagem foi atualizado com base nas decisões humanas"
        });
        
        atualizarEstadoAprendizagem();
      } else {
        toast({
          title: "Treinamento não concluído",
          description: "Não há decisões suficientes para treinar o modelo",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Erro ao treinar modelo:", error);
      toast({
        title: "Erro no treinamento",
        description: "Ocorreu um erro ao tentar treinar o modelo de aprendizagem",
        variant: "destructive"
      });
    } finally {
      setTreinando(false);
    }
  };

  // Função para aplicar recomendações
  const aplicarRecomendacoes = () => {
    if (configuracaoRecomendada && onConfigChange) {
      onConfigChange(configuracaoRecomendada);
      
      toast({
        title: "Recomendações aplicadas",
        description: "As configurações foram atualizadas com base no aprendizado de máquina"
      });
    }
  };

  // Função para resetar o modelo
  const handleResetarModelo = () => {
    if (confirm("Tem certeza que deseja resetar todo o aprendizado do modelo? Esta ação não pode ser desfeita.")) {
      resetarAprendizagem();
      atualizarEstadoAprendizagem();
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Brain className="h-5 w-5 mr-2 text-purple-500" />
              Aprendizado de Máquina
            </CardTitle>
            <CardDescription>
              Sistema que aprende com decisões humanas para melhorar a precisão das reconciliações
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status do modelo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-md p-4">
            <div className="text-sm text-muted-foreground mb-1">Status do modelo</div>
            <div className="flex items-center justify-between">
              <div className="font-medium">
                {estadoAprendizagem.treinado ? "Treinado" : "Não treinado"}
              </div>
              <Badge 
                variant={estadoAprendizagem.treinado ? "default" : "outline"}
                className={estadoAprendizagem.treinado ? "bg-green-600" : ""}
              >
                v{estadoAprendizagem.versao}
              </Badge>
            </div>
          </div>

          <div className="border rounded-md p-4">
            <div className="text-sm text-muted-foreground mb-1">Decisões capturadas</div>
            <div className="font-medium">{estadoAprendizagem.decisoes}</div>
          </div>

          <div className="border rounded-md p-4">
            <div className="text-sm text-muted-foreground mb-1">Precisão estimada</div>
            <div className="flex items-center space-x-2">
              <Progress value={estadoAprendizagem.precisao * 100} className="h-2" />
              <span className="text-sm font-medium">
                {(estadoAprendizagem.precisao * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Mensagem se não houver dados suficientes */}
        {estadoAprendizagem.decisoes < 10 && (
          <Alert variant="default" className="bg-amber-50 border-amber-200">
            <Lightbulb className="h-4 w-4 text-amber-600" />
            <AlertTitle>Dados insuficientes para treinamento</AlertTitle>
            <AlertDescription>
              O sistema precisa de pelo menos 10 decisões humanas para iniciar o treinamento.
              Continue trabalhando com reconciliações manuais para que o sistema possa aprender.
            </AlertDescription>
          </Alert>
        )}

        {/* Ações do modelo */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={treinarModelo}
            disabled={treinando || estadoAprendizagem.decisoes < 10}
          >
            <TrendingUp className="h-4 w-4 mr-1" />
            {treinando ? "Treinando..." : "Treinar Modelo"}
          </Button>

          <Button
            variant={visualizarRecomendacoes ? "secondary" : "outline"}
            size="sm"
            onClick={() => setVisualizarRecomendacoes(!visualizarRecomendacoes)}
            disabled={!estadoAprendizagem.treinado}
          >
            <BarChart className="h-4 w-4 mr-1" />
            {visualizarRecomendacoes ? "Ocultar Recomendações" : "Ver Recomendações"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleResetarModelo}
            className="ml-auto text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <RefreshCcw className="h-4 w-4 mr-1" />
            Resetar Modelo
          </Button>
        </div>

        {/* Insights do modelo */}
        {estadoAprendizagem.treinado && insights.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Insights do aprendizado</h3>
            <div className="space-y-2">
              {insights.map((insight, idx) => (
                <div 
                  key={idx} 
                  className={`p-3 border rounded-md 
                    ${insight.confianca > 0.8 ? "bg-green-50 border-green-200" : 
                      insight.confianca > 0.6 ? "bg-blue-50 border-blue-200" : "bg-gray-50"}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{insight.tipo.split('_').join(' ')}</div>
                    <Badge variant="outline">
                      Confiança: {(insight.confianca * 100).toFixed(0)}%
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{insight.descricao}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recomendações de configuração */}
        {visualizarRecomendacoes && configuracaoRecomendada && (
          <div className="mt-4 border p-4 rounded-md bg-blue-50 border-blue-200">
            <h3 className="text-sm font-medium mb-3 flex items-center">
              <Lightbulb className="h-4 w-4 mr-1 text-blue-600" />
              Configurações recomendadas pelo modelo
            </h3>

            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-white rounded border">
                  <span className="block text-muted-foreground">Tolerância de divergência</span>
                  <span className="font-medium">
                    {(configuracaoRecomendada.toleranciaDivergencia * 100).toFixed(1)}%
                  </span>
                  {configuracaoRecomendada.toleranciaDivergencia !== configuracaoAtual.toleranciaDivergencia && (
                    <Badge variant="outline" className="ml-2 text-xs bg-amber-50">
                      {((configuracaoRecomendada.toleranciaDivergencia - configuracaoAtual.toleranciaDivergencia) * 100).toFixed(1)}% dif.
                    </Badge>
                  )}
                </div>

                <div className="p-2 bg-white rounded border">
                  <span className="block text-muted-foreground">Confiança mínima</span>
                  <span className="font-medium">
                    {(configuracaoRecomendada.minimumConfidenceToResolve * 100).toFixed(0)}%
                  </span>
                  {configuracaoRecomendada.minimumConfidenceToResolve !== configuracaoAtual.minimumConfidenceToResolve && (
                    <Badge variant="outline" className="ml-2 text-xs bg-amber-50">
                      {((configuracaoRecomendada.minimumConfidenceToResolve - configuracaoAtual.minimumConfidenceToResolve) * 100).toFixed(0)}% dif.
                    </Badge>
                  )}
                </div>

                <div className="p-2 bg-white rounded border">
                  <span className="block text-muted-foreground">Dias retroativos</span>
                  <span className="font-medium">
                    {configuracaoRecomendada.maxDiasRetroativos} dias
                  </span>
                  {configuracaoRecomendada.maxDiasRetroativos !== configuracaoAtual.maxDiasRetroativos && (
                    <Badge variant="outline" className="ml-2 text-xs bg-amber-50">
                      {configuracaoRecomendada.maxDiasRetroativos - configuracaoAtual.maxDiasRetroativos} dif.
                    </Badge>
                  )}
                </div>

                <div className="p-2 bg-white rounded border">
                  <span className="block text-muted-foreground">Resolver duplicados</span>
                  <span className="font-medium">
                    {configuracaoRecomendada.resolverLancamentosDuplicados ? "Sim" : "Não"}
                  </span>
                  {configuracaoRecomendada.resolverLancamentosDuplicados !== configuracaoAtual.resolverLancamentosDuplicados && (
                    <Badge variant="outline" className="ml-2 text-xs bg-amber-50">Alterado</Badge>
                  )}
                </div>
              </div>

              <Button 
                className="w-full mt-2"
                onClick={aplicarRecomendacoes}
                disabled={JSON.stringify(configuracaoRecomendada) === JSON.stringify(configuracaoAtual)}
              >
                Aplicar recomendações do modelo
              </Button>
            </div>
          </div>
        )}

        {estadoAprendizagem.treinado && estadoAprendizagem.ultimoTreinamento && (
          <div className="mt-2 text-xs text-muted-foreground text-right">
            Último treinamento: {new Date(estadoAprendizagem.ultimoTreinamento).toLocaleString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
