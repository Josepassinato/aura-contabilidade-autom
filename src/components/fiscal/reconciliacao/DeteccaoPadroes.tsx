
import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowUpRight, 
  BarChart3, 
  Brain, 
  Clock, 
  Plus, 
  RefreshCcw, 
  Search,
  Settings, 
  Sparkles, 
  Zap 
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";

import { 
  PadraoTransacao, 
  MapeamentoTransacao, 
  ConfiguracaoDeteccaoPadroes,
  configurarDeteccaoPadroes,
  analisarPadroes,
  obterEstatisticasPadroes,
  resetarPadroesDetectados
} from "@/services/fiscal/reconciliacao/detecaoPadroes";
import { ResultadoReconciliacao, ReconciliacaoItem } from "@/services/fiscal/reconciliacao/reconciliacaoBancaria";
import { TransacaoBancaria } from "@/services/bancario/openBankingService";
import { Lancamento } from "@/services/fiscal/classificacao/classificacaoML";

interface DeteccaoPadroesProps {
  resultadoReconciliacao?: ResultadoReconciliacao | null;
  processandoReconciliacao?: boolean;
  onPatternDetected?: (dadosAdicionais: any) => void;
  onMappeablePatternsFound?: (mapeamentos: MapeamentoTransacao[]) => void;
}

export function DeteccaoPadroes({
  resultadoReconciliacao,
  processandoReconciliacao = false,
  onPatternDetected,
  onMappeablePatternsFound
}: DeteccaoPadroesProps) {
  // Estado de configuração e análise
  const [configuracao, setConfiguracao] = useState<ConfiguracaoDeteccaoPadroes>({
    minOcorrenciasDeteccao: 3,
    periodoAnalise: 90,
    limiarSimilaridade: 0.7,
    ativarDeteccaoAutomatica: true,
    usarAnaliseAvancadaTexto: true,
    minConfiancaAplicacao: 0.8
  });

  // Estados para UI
  const [mostrarConfig, setMostrarConfig] = useState(false);
  const [analisando, setAnalisando] = useState(false);
  const [padroes, setPadroes] = useState<PadraoTransacao[]>([]);
  const [mapeamentos, setMapeamentos] = useState<MapeamentoTransacao[]>([]);
  const [potencialMelhoria, setPotencialMelhoria] = useState(0);
  const [padroesExpandidos, setPadroesExpandidos] = useState<Record<string, boolean>>({});
  const [estatisticasCarregadas, setEstatisticasCarregadas] = useState(false);

  // Carregar estatísticas ao montar o componente
  useEffect(() => {
    carregarEstatisticas();
  }, []);

  // Analisar automaticamente quando o resultado da reconciliação mudar
  useEffect(() => {
    if (resultadoReconciliacao && configuracao.ativarDeteccaoAutomatica && !processandoReconciliacao) {
      executarAnalise(resultadoReconciliacao);
    }
  }, [resultadoReconciliacao, processandoReconciliacao]);

  // Função para carregar estatísticas existentes
  const carregarEstatisticas = () => {
    try {
      const estatisticas = obterEstatisticasPadroes();
      setPotencialMelhoria(estatisticas.potencialAutomacao);
      setConfiguracao(estatisticas.configuracaoAtual);
      setEstatisticasCarregadas(true);
    } catch (error) {
      console.error("Erro ao carregar estatísticas de padrões:", error);
    }
  };

  // Função para executar a análise de padrões
  const executarAnalise = (resultado: ResultadoReconciliacao) => {
    if (analisando || processandoReconciliacao) return;

    setAnalisando(true);
    try {
      const transacoes = [
        ...resultado.transacoesConciliadas.map(item => item.transacao),
        ...resultado.transacoesNaoConciliadas
      ];

      const lancamentos = [
        ...resultado.transacoesConciliadas.map(item => item.lancamento),
        ...resultado.lancamentosNaoConciliados
      ];

      const resultadoAnalise = analisarPadroes(
        transacoes,
        lancamentos,
        resultado.transacoesConciliadas
      );

      setPadroes(resultadoAnalise.padroesDetectados);
      setMapeamentos(resultadoAnalise.mapeamentosGerados);
      setPotencialMelhoria(resultadoAnalise.potencialMelhoria);

      if (onPatternDetected) {
        onPatternDetected({
          padroes: resultadoAnalise.padroesDetectados,
          mapeamentos: resultadoAnalise.mapeamentosGerados
        });
      }

      // Notificar mapeamentos que podem ser aplicados
      if (onMappeablePatternsFound && resultadoAnalise.mapeamentosGerados.length > 0) {
        onMappeablePatternsFound(resultadoAnalise.mapeamentosGerados);
      }

      if (resultadoAnalise.padroesDetectados.length > 0) {
        toast({
          title: "Análise de padrões concluída",
          description: `${resultadoAnalise.padroesDetectados.length} padrões identificados`
        });
      }
    } catch (error) {
      console.error("Erro na análise de padrões:", error);
      toast({
        title: "Erro na análise de padrões",
        description: "Ocorreu um erro ao analisar os padrões",
        variant: "destructive"
      });
    } finally {
      setAnalisando(false);
    }
  };

  // Função para alternar a expansão de um padrão
  const togglePadrao = (id: string) => {
    setPadroesExpandidos(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Função para aplicar configurações
  const aplicarConfiguracoes = () => {
    configurarDeteccaoPadroes(configuracao);
    setMostrarConfig(false);
    
    toast({
      title: "Configurações aplicadas",
      description: "As configurações de detecção de padrões foram atualizadas"
    });
  };

  // Função para resetar padrões
  const handleResetarPadroes = () => {
    if (confirm("Tem certeza que deseja resetar todos os padrões? Esta ação não pode ser desfeita.")) {
      resetarPadroesDetectados();
      setPadroes([]);
      setMapeamentos([]);
      setPotencialMelhoria(0);
      carregarEstatisticas();
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Brain className="h-5 w-5 mr-2 text-purple-500" />
              Detecção de Padrões
            </CardTitle>
            <CardDescription>
              Identificação automática de padrões em transações e lançamentos
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMostrarConfig(!mostrarConfig)}
              className={mostrarConfig ? "bg-muted" : ""}
            >
              <Settings className="h-4 w-4 mr-1" />
              Configurações
            </Button>

            {resultadoReconciliacao && (
              <Button
                size="sm"
                onClick={() => executarAnalise(resultadoReconciliacao)}
                disabled={analisando || processandoReconciliacao}
              >
                <Search className="h-4 w-4 mr-1" />
                {analisando ? "Analisando..." : "Analisar"}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {mostrarConfig ? (
          <div className="space-y-4">
            <h3 className="font-medium text-sm">Configurações de Detecção de Padrões</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="deteccaoAutomatica">Detecção automática</Label>
                <Switch
                  id="deteccaoAutomatica"
                  checked={configuracao.ativarDeteccaoAutomatica}
                  onCheckedChange={(checked) => setConfiguracao({
                    ...configuracao,
                    ativarDeteccaoAutomatica: checked
                  })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="analiseAvancada">Análise avançada de texto</Label>
                <Switch
                  id="analiseAvancada"
                  checked={configuracao.usarAnaliseAvancadaTexto}
                  onCheckedChange={(checked) => setConfiguracao({
                    ...configuracao,
                    usarAnaliseAvancadaTexto: checked
                  })}
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <div>
                  <Label htmlFor="minOcorrencias">Mínimo de ocorrências para detecção</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Slider
                      id="minOcorrencias"
                      min={2}
                      max={10}
                      step={1}
                      value={[configuracao.minOcorrenciasDeteccao]}
                      onValueChange={(value) => setConfiguracao({
                        ...configuracao,
                        minOcorrenciasDeteccao: value[0]
                      })}
                      className="flex-1"
                    />
                    <span className="w-8 text-center">{configuracao.minOcorrenciasDeteccao}</span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="periodoAnalise">Período de análise (dias)</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Slider
                      id="periodoAnalise"
                      min={30}
                      max={365}
                      step={30}
                      value={[configuracao.periodoAnalise]}
                      onValueChange={(value) => setConfiguracao({
                        ...configuracao,
                        periodoAnalise: value[0]
                      })}
                      className="flex-1"
                    />
                    <span className="w-16 text-center">{configuracao.periodoAnalise} dias</span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="limiarSimilaridade">Limiar de similaridade</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Slider
                      id="limiarSimilaridade"
                      min={0.5}
                      max={0.95}
                      step={0.05}
                      value={[configuracao.limiarSimilaridade]}
                      onValueChange={(value) => setConfiguracao({
                        ...configuracao,
                        limiarSimilaridade: value[0]
                      })}
                      className="flex-1"
                    />
                    <span className="w-16 text-center">{(configuracao.limiarSimilaridade * 100).toFixed(0)}%</span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confiancaAplicacao">Confiança mínima para aplicação</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Slider
                      id="confiancaAplicacao"
                      min={0.6}
                      max={0.95}
                      step={0.05}
                      value={[configuracao.minConfiancaAplicacao]}
                      onValueChange={(value) => setConfiguracao({
                        ...configuracao,
                        minConfiancaAplicacao: value[0]
                      })}
                      className="flex-1"
                    />
                    <span className="w-16 text-center">{(configuracao.minConfiancaAplicacao * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center mt-4 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetarPadroes}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <RefreshCcw className="h-4 w-4 mr-1" />
                  Resetar Padrões
                </Button>

                <Button
                  size="sm"
                  onClick={aplicarConfiguracoes}
                >
                  Aplicar Configurações
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Status de detecção de padrões */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-md p-4">
                <div className="text-sm text-muted-foreground mb-1">Padrões detectados</div>
                <div className="font-medium text-xl">{padroes.length}</div>
              </div>

              <div className="border rounded-md p-4">
                <div className="text-sm text-muted-foreground mb-1">Mapeamentos gerados</div>
                <div className="font-medium text-xl">{mapeamentos.length}</div>
              </div>

              <div className="border rounded-md p-4">
                <div className="text-sm text-muted-foreground mb-1">Potencial de automação</div>
                <div className="flex items-center space-x-2">
                  <Progress value={potencialMelhoria * 100} className="h-2 flex-1" />
                  <span className="text-sm font-medium">
                    {(potencialMelhoria * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Lista de padrões detectados */}
            {padroes.length > 0 ? (
              <div>
                <h3 className="text-sm font-medium mb-2">Padrões detectados</h3>
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-2">
                    {padroes.map((padrao) => (
                      <Collapsible
                        key={padrao.id}
                        open={padroesExpandidos[padrao.id]}
                        onOpenChange={() => togglePadrao(padrao.id)}
                        className="border rounded-md overflow-hidden"
                      >
                        <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50 text-left">
                          <div>
                            <div className="flex items-center">
                              <span className="font-medium">{padrao.descricao}</span>
                              <Badge 
                                variant="outline" 
                                className="ml-2 capitalize"
                              >
                                {padrao.tipo}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {padrao.ocorrencias} ocorrências • Confiança: {(padrao.confianca * 100).toFixed(0)}%
                            </div>
                          </div>
                          <ArrowUpRight className={`h-4 w-4 transition-transform ${padroesExpandidos[padrao.id] ? 'rotate-180' : ''}`} />
                        </CollapsibleTrigger>
                        
                        <CollapsibleContent>
                          <div className="px-3 pb-3 pt-0 bg-muted/20 space-y-2">
                            {padrao.regexDescricao && (
                              <div className="text-xs">
                                <span className="font-medium">Padrão detectado:</span>{' '}
                                <code className="bg-muted p-1 rounded">{padrao.regexDescricao}</code>
                              </div>
                            )}
                            
                            {padrao.exemplos.length > 0 && padrao.exemplos[0].transacao && (
                              <div className="text-xs">
                                <span className="font-medium">Exemplo:</span>{' '}
                                <span className="text-muted-foreground">
                                  {padrao.exemplos[0].transacao.descricao}
                                </span>
                              </div>
                            )}
                            
                            <div className="text-xs flex items-center">
                              <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                Última detecção: {new Date(padrao.ultimaDeteccao).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                {!estatisticasCarregadas ? (
                  <div>Carregando estatísticas...</div>
                ) : resultadoReconciliacao ? (
                  <>
                    <Search className="h-8 w-8 mb-2 opacity-50" />
                    <p>Nenhum padrão detectado ainda</p>
                    <p className="text-sm mt-1">Execute a análise para detectar padrões</p>
                  </>
                ) : (
                  <>
                    <Zap className="h-8 w-8 mb-2 opacity-50" />
                    <p>Realize uma reconciliação para começar</p>
                    <p className="text-sm mt-1">Os padrões serão analisados após a reconciliação</p>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
